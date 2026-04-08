const { query } = require('../config/database');

const getNotifications = async (req, res) => {
  const result = await query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
    [req.user.id]
  );
  const unread = result.rows.filter(n => !n.is_read).length;
  res.json({ notifications: result.rows, unread_count: unread });
};

const markRead = async (req, res) => {
  await query(
    'UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  );
  res.json({ ok: true });
};

const markAllRead = async (req, res) => {
  await query(
    'UPDATE notifications SET is_read = true, read_at = NOW() WHERE user_id = $1 AND is_read = false',
    [req.user.id]
  );
  res.json({ ok: true });
};

module.exports = { getNotifications, markRead, markAllRead };
