const { query, transaction } = require('../config/database');
const notificationService = require('../services/notificationService');
const logger = require('../config/logger');

// POST /api/disputes - Abrir disputa
const openDispute = async (req, res) => {
  const { project_id, subject, description } = req.body;

  const projectResult = await query(
    `SELECT * FROM projects WHERE id = $1 AND (freelancer_id = $2 OR client_id = $2)
     AND status NOT IN ('completed','cancelled')`,
    [project_id, req.user.id]
  );

  if (projectResult.rows.length === 0) {
    return res.status(404).json({ error: 'Projeto não encontrado ou não elegível para disputa' });
  }

  const project = projectResult.rows[0];

  // Verificar se já existe disputa aberta
  const existing = await query(
    "SELECT id FROM disputes WHERE project_id = $1 AND status NOT IN ('resolved','closed')",
    [project_id]
  );

  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'Já existe uma disputa aberta para este projeto' });
  }

  const sla_deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

  const result = await transaction(async (client) => {
    const dispute = await client.query(
      `INSERT INTO disputes (project_id, opened_by, subject, description, sla_deadline)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [project_id, req.user.id, subject, description, sla_deadline]
    );

    await client.query(
      "UPDATE projects SET status='disputed' WHERE id=$1",
      [project_id]
    );

    return dispute.rows[0];
  });

  // Notificar a outra parte
  const otherId = req.user.id === project.freelancer_id ? project.client_id : project.freelancer_id;

  await notificationService.create(otherId, 'dispute_opened', {
    title: '⚠️ Disputa aberta no projeto',
    body: `Uma disputa foi aberta: "${subject}". Responda em até 7 dias.`,
    data: { dispute_id: result.id, project_id },
  });

  // Notificar equipe de suporte
  await notificationService.createSystemAlert({
    title: 'Nova disputa',
    body: `Disputa aberta no projeto ${project_id}`,
    data: { dispute_id: result.id },
  });

  logger.info(`Disputa aberta: ${result.id} no projeto ${project_id}`);

  res.status(201).json({
    message: 'Disputa aberta. Nossa equipe entrará em contato em até 48 horas.',
    dispute: result,
  });
};

// GET /api/disputes - Listar disputas do usuário
const getMyDisputes = async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = `WHERE (p.freelancer_id = $1 OR p.client_id = $1)`;
  const params = [req.user.id];

  if (status) {
    whereClause += ` AND d.status = $${params.length + 1}`;
    params.push(status);
  }

  const result = await query(
    `SELECT d.*, p.title AS project_title,
     f.full_name AS freelancer_name, c.full_name AS client_name,
     m.full_name AS mediator_name,
     ob.full_name AS opened_by_name
     FROM disputes d
     JOIN projects p ON d.project_id = p.id
     JOIN users f ON p.freelancer_id = f.id
     JOIN users c ON p.client_id = c.id
     LEFT JOIN users m ON d.assigned_mediator = m.id
     JOIN users ob ON d.opened_by = ob.id
     ${whereClause}
     ORDER BY d.created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  res.json({ disputes: result.rows });
};

// GET /api/disputes/:id - Detalhe da disputa
const getDispute = async (req, res) => {
  const { id } = req.params;

  const disputeResult = await query(
    `SELECT d.*, p.title AS project_title, p.total_amount AS project_amount,
     p.freelancer_id, p.client_id,
     f.full_name AS freelancer_name, f.avatar_url AS freelancer_avatar,
     c.full_name AS client_name, c.avatar_url AS client_avatar,
     m.full_name AS mediator_name
     FROM disputes d
     JOIN projects p ON d.project_id = p.id
     JOIN users f ON p.freelancer_id = f.id
     JOIN users c ON p.client_id = c.id
     LEFT JOIN users m ON d.assigned_mediator = m.id
     WHERE d.id = $1 AND (p.freelancer_id = $2 OR p.client_id = $2 OR $3 = ANY(ARRAY['admin','mediator','support']))`,
    [id, req.user.id, req.user.type]
  );

  if (disputeResult.rows.length === 0) {
    return res.status(404).json({ error: 'Disputa não encontrada' });
  }

  const dispute = disputeResult.rows[0];

  const messages = await query(
    `SELECT dm.*, u.full_name AS author_name, u.avatar_url AS author_avatar, u.type AS author_type
     FROM dispute_messages dm
     JOIN users u ON dm.author_id = u.id
     WHERE dm.dispute_id = $1 AND (dm.is_internal = false OR $2 = ANY(ARRAY['admin','mediator','support']))
     ORDER BY dm.created_at ASC`,
    [id, req.user.type]
  );

  res.json({ dispute, messages: messages.rows });
};

// POST /api/disputes/:id/messages - Enviar mensagem na disputa
const sendDisputeMessage = async (req, res) => {
  const { id } = req.params;
  const { content, attachments, is_internal } = req.body;

  const result = await query(
    `INSERT INTO dispute_messages (dispute_id, author_id, content, attachments, is_internal)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [id, req.user.id, content, JSON.stringify(attachments || []), is_internal && ['admin', 'mediator'].includes(req.user.type)]
  );

  // Notificar partes envolvidas via socket
  if (req.io) {
    req.io.to(`dispute_${id}`).emit('dispute_message', result.rows[0]);
  }

  res.status(201).json({ message: result.rows[0] });
};

// POST /api/disputes/:id/resolve - Mediador resolve disputa
const resolveDispute = async (req, res) => {
  const { id } = req.params;
  const { resolution, proposed_amount, resolution_notes } = req.body;

  if (!['admin', 'mediator'].includes(req.user.type)) {
    return res.status(403).json({ error: 'Somente mediadores podem resolver disputas' });
  }

  const disputeResult = await query(
    "SELECT d.*, p.freelancer_id, p.client_id FROM disputes d JOIN projects p ON d.project_id = p.id WHERE d.id = $1",
    [id]
  );

  if (disputeResult.rows.length === 0) {
    return res.status(404).json({ error: 'Disputa não encontrada' });
  }

  const dispute = disputeResult.rows[0];

  await transaction(async (client) => {
    await client.query(
      `UPDATE disputes SET status='resolved', resolution=$1, proposed_amount=$2,
       resolution_notes=$3, resolved_at=NOW() WHERE id=$4`,
      [resolution, proposed_amount, resolution_notes, id]
    );

    const newProjectStatus = resolution === 'full_release' ? 'completed' :
                             resolution === 'full_refund' ? 'cancelled' : 'completed';

    await client.query(
      'UPDATE projects SET status=$1 WHERE id=$2',
      [newProjectStatus, dispute.project_id]
    );
  });

  // Notificar ambas as partes
  const message = `Disputa resolvida. Decisão: ${resolution}. ${resolution_notes || ''}`;

  await notificationService.create(dispute.freelancer_id, 'dispute_resolved', {
    title: '⚖️ Disputa resolvida',
    body: message,
    data: { dispute_id: id },
  });

  await notificationService.create(dispute.client_id, 'dispute_resolved', {
    title: '⚖️ Disputa resolvida',
    body: message,
    data: { dispute_id: id },
  });

  logger.info(`Disputa ${id} resolvida por ${req.user.id}: ${resolution}`);

  res.json({ message: 'Disputa resolvida com sucesso.' });
};

// ADMIN: GET /api/admin/disputes - Todas as disputas
const getAllDisputes = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (status) {
    whereClause += ` AND d.status = $${params.length + 1}`;
    params.push(status);
  }

  const result = await query(
    `SELECT d.*, p.title AS project_title, p.total_amount,
     f.full_name AS freelancer_name, c.full_name AS client_name,
     m.full_name AS mediator_name,
     EXTRACT(EPOCH FROM (d.sla_deadline - NOW()))/3600 AS hours_until_sla
     FROM disputes d
     JOIN projects p ON d.project_id = p.id
     JOIN users f ON p.freelancer_id = f.id
     JOIN users c ON p.client_id = c.id
     LEFT JOIN users m ON d.assigned_mediator = m.id
     ${whereClause}
     ORDER BY d.sla_deadline ASC NULLS LAST, d.created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  res.json({ disputes: result.rows });
};

// ADMIN: PATCH /api/admin/disputes/:id/assign - Atribuir mediador
const assignMediator = async (req, res) => {
  const { id } = req.params;
  const { mediator_id } = req.body;

  await query(
    "UPDATE disputes SET assigned_mediator=$1, status='under_review' WHERE id=$2",
    [mediator_id, id]
  );

  res.json({ message: 'Mediador atribuído com sucesso.' });
};

module.exports = { openDispute, getMyDisputes, getDispute, sendDisputeMessage, resolveDispute, getAllDisputes, assignMediator };
