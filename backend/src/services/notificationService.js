const { query } = require('../config/database');

const notificationService = {
  create: async (userId, type, { title, body, data = {} }) => {
    const result = await query(
      'INSERT INTO notifications (user_id, type, title, body, data) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [userId, type, title, body, JSON.stringify(data)]
    );
    return result.rows[0];
  },

  createSystemAlert: async ({ title, body, data = {} }) => {
    const admins = await query("SELECT id FROM users WHERE type IN ('admin','support')");
    for (const a of admins.rows) {
      await notificationService.create(a.id, 'system_alert', { title, body, data });
    }
  },
};

module.exports = notificationService;
