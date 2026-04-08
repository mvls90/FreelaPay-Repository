const { query } = require('../config/database');

// GET /api/messages/project/:projectId
const getProjectMessages = async (req, res) => {
  const { projectId } = req.params;

  const access = await query(
    'SELECT id FROM projects WHERE id = $1 AND (freelancer_id = $2 OR client_id = $2)',
    [projectId, req.user.id]
  );
  if (access.rows.length === 0) return res.status(403).json({ error: 'Acesso negado' });

  const result = await query(
    `SELECT m.*, u.full_name AS sender_name, u.avatar_url AS sender_avatar, u.type AS sender_type
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.project_id = $1
     ORDER BY m.created_at ASC`,
    [projectId]
  );

  res.json({ messages: result.rows });
};

// POST /api/messages/project/:projectId
const sendMessage = async (req, res) => {
  const { projectId } = req.params;
  const { content, attachments } = req.body;

  const projectResult = await query(
    'SELECT * FROM projects WHERE id = $1 AND (freelancer_id = $2 OR client_id = $2)',
    [projectId, req.user.id]
  );
  if (projectResult.rows.length === 0) return res.status(403).json({ error: 'Acesso negado' });

  const project = projectResult.rows[0];
  const receiverId = req.user.id === project.freelancer_id ? project.client_id : project.freelancer_id;

  const result = await query(
    `INSERT INTO messages (project_id, sender_id, receiver_id, content, attachments)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [projectId, req.user.id, receiverId, content, JSON.stringify(attachments || [])]
  );

  await query('UPDATE projects SET last_activity_at = NOW() WHERE id = $1', [projectId]);

  const msg = { ...result.rows[0], sender_name: req.user.full_name };
  if (req.io) req.io.to(`project_${projectId}`).emit('new_message', msg);

  res.status(201).json({ message: msg });
};

// PATCH /api/messages/project/:projectId/read
const markAsRead = async (req, res) => {
  const { projectId } = req.params;
  await query(
    'UPDATE messages SET is_read = true, read_at = NOW() WHERE project_id = $1 AND receiver_id = $2 AND is_read = false',
    [projectId, req.user.id]
  );
  res.json({ ok: true });
};

module.exports = { getProjectMessages, sendMessage, markAsRead };
