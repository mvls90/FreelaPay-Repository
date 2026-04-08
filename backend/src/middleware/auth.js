const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ error: 'Token inválido' });
    }

    const result = await query(
      'SELECT id, type, status, full_name, email, verification, is_premium FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const user = result.rows[0];

    if (user.status === 'banned') {
      return res.status(403).json({ error: 'Conta banida. Entre em contato com o suporte.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Conta suspensa temporariamente.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({ error: 'Erro interno de autenticação' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!roles.includes(req.user.type)) {
      return res.status(403).json({
        error: 'Acesso negado. Permissão insuficiente.',
        required: roles,
        current: req.user.type,
      });
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query(
      'SELECT id, type, status, full_name, email FROM users WHERE id = $1',
      [decoded.userId]
    );
    req.user = result.rows[0] || null;
    next();
  } catch {
    req.user = null;
    next();
  }
};

module.exports = { authenticate, requireRole, optionalAuth };
