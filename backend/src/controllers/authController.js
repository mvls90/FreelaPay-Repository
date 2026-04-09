const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { query, transaction } = require('../config/database');
const emailService = require('../services/emailService');
const logger = require('../config/logger');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { accessToken, refreshToken };
};

// POST /api/auth/register
const register = async (req, res) => {
  const { full_name, email, password, type, phone } = req.body;

  const existingUser = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existingUser.rows.length > 0) {
    return res.status(409).json({ error: 'E-mail já cadastrado na plataforma' });
  }

  const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  const password_hash = await bcrypt.hash(password, rounds);

  const result = await transaction(async (client) => {
    const userResult = await client.query(
      `INSERT INTO users (type, full_name, email, password_hash, phone, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING id, type, full_name, email, status, verification`,
      [type, full_name, email.toLowerCase(), password_hash, phone]
    );

    const user = userResult.rows[0];

    await client.query(
      'INSERT INTO user_balances (user_id, available, held) VALUES ($1, 0, 0)',
      [user.id]
    );

    return user;
  });

  const verificationToken = jwt.sign({ userId: result.id, purpose: 'email_verify' }, process.env.JWT_SECRET, { expiresIn: '24h' });

try {
  await emailService.sendWelcomeEmail(result.email, result.full_name, verificationToken);
} catch (emailError) {
  logger.warn('E-mail de boas-vindas não enviado:', emailError.message);
}

await query(
  
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address)
     VALUES ($1, 'user_registered', 'user', $1, $2)`,
    [result.id, req.ip]
  );

  const { accessToken, refreshToken } = generateTokens(result.id);

  logger.info(`Novo usuário registrado: ${result.email} (${result.type})`);

  res.status(201).json({
    message: 'Conta criada com sucesso! Verifique seu e-mail.',
    user: result,
    accessToken,
    refreshToken,
  });
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password, totp_code } = req.body;

  const result = await query(
    `SELECT id, type, status, full_name, email, password_hash, two_fa_enabled, two_fa_secret, verification
     FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos' });
  }

  const user = result.rows[0];

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos' });
  }

  if (user.status === 'banned') {
    return res.status(403).json({ error: 'Conta banida. Entre em contato com o suporte.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Conta suspensa temporariamente.' });
  }

  if (user.two_fa_enabled) {
    if (!totp_code) {
      return res.status(200).json({ requires_2fa: true, message: 'Informe o código do autenticador' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.two_fa_secret,
      encoding: 'base32',
      token: totp_code,
      window: 1,
    });

    if (!verified) {
      return res.status(401).json({ error: 'Código 2FA inválido' });
    }
  }

  await query(
    'UPDATE users SET last_login_at = NOW() WHERE id = $1',
    [user.id]
  );

  await query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, user_agent)
     VALUES ($1, 'user_login', 'user', $1, $2, $3)`,
    [user.id, req.ip, req.headers['user-agent']]
  );

  const { accessToken, refreshToken } = generateTokens(user.id);

  const { password_hash, two_fa_secret, ...userPublic } = user;

  res.json({
    user: userPublic,
    accessToken,
    refreshToken,
  });
};

// POST /api/auth/refresh
const refreshToken = async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'Refresh token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const result = await query('SELECT id, status FROM users WHERE id = $1', [decoded.userId]);
    if (result.rows.length === 0 || result.rows[0].status === 'banned') {
      return res.status(401).json({ error: 'Usuário inválido' });
    }

    const tokens = generateTokens(decoded.userId);
    res.json(tokens);
  } catch {
    res.status(401).json({ error: 'Refresh token inválido ou expirado' });
  }
};

// POST /api/auth/verify-email
const verifyEmail = async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== 'email_verify') {
      return res.status(400).json({ error: 'Token inválido' });
    }

    await query(
      `UPDATE users SET email_verified = true, email_verified_at = NOW(), status = 'active'
       WHERE id = $1 AND email_verified = false`,
      [decoded.userId]
    );

    res.json({ message: 'E-mail verificado com sucesso!' });
  } catch {
    res.status(400).json({ error: 'Token de verificação inválido ou expirado' });
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const result = await query('SELECT id, full_name FROM users WHERE email = $1', [email.toLowerCase()]);

  // Sempre retorna sucesso para não revelar se o e-mail existe
  if (result.rows.length === 0) {
    return res.json({ message: 'Se o e-mail estiver cadastrado, você receberá as instruções.' });
  }

  const user = result.rows[0];
  const resetToken = jwt.sign(
    { userId: user.id, purpose: 'password_reset' },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  await emailService.sendPasswordResetEmail(email, user.full_name, resetToken);

  res.json({ message: 'Se o e-mail estiver cadastrado, você receberá as instruções.' });
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  const { token, new_password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({ error: 'Token inválido' });
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const password_hash = await bcrypt.hash(new_password, rounds);

    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, decoded.userId]);

    res.json({ message: 'Senha redefinida com sucesso!' });
  } catch {
    res.status(400).json({ error: 'Token inválido ou expirado' });
  }
};

// POST /api/auth/setup-2fa
const setup2FA = async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `Free.API (${req.user.email})`,
    length: 32,
  });

  await query('UPDATE users SET two_fa_secret = $1 WHERE id = $2', [secret.base32, req.user.id]);

  const qrCode = await QRCode.toDataURL(secret.otpauth_url);

  res.json({
    secret: secret.base32,
    qrCode,
    message: 'Escaneie o QR Code com seu autenticador e confirme com o código',
  });
};

// POST /api/auth/confirm-2fa
const confirm2FA = async (req, res) => {
  const { totp_code } = req.body;

  const result = await query('SELECT two_fa_secret FROM users WHERE id = $1', [req.user.id]);
  const { two_fa_secret } = result.rows[0];

  const verified = speakeasy.totp.verify({
    secret: two_fa_secret,
    encoding: 'base32',
    token: totp_code,
    window: 1,
  });

  if (!verified) {
    return res.status(400).json({ error: 'Código inválido. Tente novamente.' });
  }

  await query('UPDATE users SET two_fa_enabled = true WHERE id = $1', [req.user.id]);

  res.json({ message: 'Autenticação em dois fatores ativada com sucesso!' });
};

module.exports = { register, login, refreshToken, verifyEmail, forgotPassword, resetPassword, setup2FA, confirm2FA };
