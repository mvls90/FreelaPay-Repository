const jwt = require('jsonwebtoken');
const { query } = require('./database');

module.exports = (io) => {
  const userSockets = new Map();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Token não fornecido'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const result = await query('SELECT id, type, full_name FROM users WHERE id = $1', [decoded.userId]);
      if (result.rows.length === 0) return next(new Error('Usuário não encontrado'));
      socket.user = result.rows[0];
      next();
    } catch (err) {
      next(new Error('Autenticação inválida'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    userSockets.set(userId, socket.id);

    socket.on('join_project', async (projectId) => {
      const r = await query('SELECT id FROM projects WHERE id=$1 AND (freelancer_id=$2 OR client_id=$2)', [projectId, userId]);
      if (r.rows.length > 0) socket.join(`project_${projectId}`);
    });

    socket.on('join_dispute', (disputeId) => socket.join(`dispute_${disputeId}`));

    socket.on('send_message', async ({ projectId, content, attachments }) => {
      const pr = await query('SELECT * FROM projects WHERE id=$1 AND (freelancer_id=$2 OR client_id=$2)', [projectId, userId]);
      if (!pr.rows.length) return;
      const project = pr.rows[0];
      const receiverId = userId === project.freelancer_id ? project.client_id : project.freelancer_id;
      const msgResult = await query(
        'INSERT INTO messages (project_id, sender_id, receiver_id, content, attachments) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [projectId, userId, receiverId, content, JSON.stringify(attachments || [])]
      );
      const msg = { ...msgResult.rows[0], sender_name: socket.user.full_name };
      io.to(`project_${projectId}`).emit('new_message', msg);
      const rSock = userSockets.get(receiverId);
      if (rSock) io.to(rSock).emit('message_notification', { projectId, message: content.substring(0, 100), from: socket.user.full_name });
      await query('UPDATE projects SET last_activity_at=NOW() WHERE id=$1', [projectId]);
    });

    socket.on('typing', ({ projectId }) => {
      socket.to(`project_${projectId}`).emit('user_typing', { userId, name: socket.user.full_name });
    });

    socket.on('disconnect', () => userSockets.delete(userId));
  });

  io.sendToUser = (userId, event, data) => {
    const sid = userSockets.get(userId);
    if (sid) io.to(sid).emit(event, data);
  };
};
