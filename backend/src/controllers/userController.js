const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

const getMe = async (req, res) => {
  const result = await query(
    `SELECT u.*, b.available, b.held, b.total_earned, b.total_withdrawn
     FROM users u LEFT JOIN user_balances b ON u.id = b.user_id WHERE u.id = $1`,
    [req.user.id]
  );
  const { password_hash, two_fa_secret, ...user } = result.rows[0];
  res.json({ user });
};

const updateMe = async (req, res) => {
  const { full_name, phone, bio, website_url, skills, location_city, location_state, pix_key } = req.body;
  const result = await query(
    `UPDATE users SET full_name=$1, phone=$2, bio=$3, website_url=$4, skills=$5,
     location_city=$6, location_state=$7, pix_key=$8, updated_at=NOW()
     WHERE id=$9 RETURNING id, full_name, phone, bio, website_url, skills, location_city, location_state, pix_key`,
    [full_name, phone, bio, website_url, skills, location_city, location_state, pix_key, req.user.id]
  );
  res.json({ user: result.rows[0] });
};

const changePassword = async (req, res) => {
  const { current_password, new_password } = req.body;
  const result = await query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
  const valid = await bcrypt.compare(current_password, result.rows[0].password_hash);
  if (!valid) return res.status(400).json({ error: 'Senha atual incorreta' });
  const hash = await bcrypt.hash(new_password, 12);
  await query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, req.user.id]);
  res.json({ message: 'Senha alterada com sucesso' });
};

const getPublicProfile = async (req, res) => {
  const result = await query(
    `SELECT id, full_name, avatar_url, bio, website_url, skills, location_city,
     location_state, trust_score, completed_projects, verification, is_premium, created_at
     FROM users WHERE id=$1 AND type='freelancer'`,
    [req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Perfil não encontrado' });
  res.json({ user: result.rows[0] });
};

module.exports = { getMe, updateMe, changePassword, getPublicProfile };
