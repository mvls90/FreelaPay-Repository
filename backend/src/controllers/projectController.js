const { query, transaction } = require('../config/database');
const notificationService = require('../services/notificationService');
const emailService = require('../services/emailService');

// GET /api/projects - Listar projetos do usuário
const getMyProjects = async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const isFreelancer = req.user.type === 'freelancer';

  let whereClause = isFreelancer
    ? 'WHERE p.freelancer_id = $1'
    : 'WHERE p.client_id = $1';

  const params = [req.user.id];

  if (status) {
    whereClause += ` AND p.status = $${params.length + 1}`;
    params.push(status);
  }

  const result = await query(
    `SELECT p.*,
     f.full_name AS freelancer_name, f.avatar_url AS freelancer_avatar,
     c.full_name AS client_name, c.avatar_url AS client_avatar,
     (SELECT COUNT(*) FROM milestones m WHERE m.proposal_id = p.proposal_id) AS total_milestones,
     (SELECT COUNT(*) FROM milestones m WHERE m.proposal_id = p.proposal_id AND m.status = 'paid') AS paid_milestones,
     (SELECT COUNT(*) FROM messages msg WHERE msg.project_id = p.id AND msg.receiver_id = $1 AND msg.is_read = false) AS unread_messages
     FROM projects p
     JOIN users f ON p.freelancer_id = f.id
     JOIN users c ON p.client_id = c.id
     ${whereClause}
     ORDER BY p.last_activity_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  const total = await query(
    `SELECT COUNT(*) FROM projects p ${whereClause}`,
    params
  );

  res.json({
    projects: result.rows,
    pagination: {
      total: parseInt(total.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total.rows[0].count / limit),
    },
  });
};

// GET /api/projects/:id - Detalhe do projeto
const getProject = async (req, res) => {
  const { id } = req.params;

  const result = await query(
    `SELECT p.*,
     f.full_name AS freelancer_name, f.avatar_url AS freelancer_avatar, f.trust_score AS freelancer_trust,
     c.full_name AS client_name, c.avatar_url AS client_avatar,
     (SELECT json_agg(m_ordered) FROM (
       SELECT m.id, m.title, m.description, m.order_index, m.percentage,
              m.amount, m.status, m.due_date, m.submitted_at, m.approved_at
       FROM milestones m WHERE m.proposal_id = p.proposal_id
       ORDER BY m.order_index
     ) m_ordered) AS milestones,
     (SELECT json_agg(u_ordered) FROM (
       SELECT pu.id, pu.title, pu.description, pu.progress_pct,
              pu.attachments, pu.is_delivery, pu.created_at, ua.full_name AS author_name
       FROM project_updates pu
       JOIN users ua ON pu.author_id = ua.id
       WHERE pu.project_id = p.id
       ORDER BY pu.created_at DESC
     ) u_ordered) AS updates
     FROM projects p
     JOIN users f ON p.freelancer_id = f.id
     JOIN users c ON p.client_id = c.id
     WHERE p.id = $1 AND (p.freelancer_id = $2 OR p.client_id = $2)`,
    [id, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Projeto não encontrado' });
  }

  res.json({ project: result.rows[0] });
};

// POST /api/projects/:id/updates - Freelancer envia atualização
const addUpdate = async (req, res) => {
  const { id } = req.params;
  const { title, description, progress_pct, milestone_id, is_delivery, attachments } = req.body;

  const projectResult = await query(
    'SELECT * FROM projects WHERE id = $1 AND freelancer_id = $2',
    [id, req.user.id]
  );

  if (projectResult.rows.length === 0) {
    return res.status(404).json({ error: 'Projeto não encontrado' });
  }

  const project = projectResult.rows[0];

  const result = await transaction(async (client) => {
    const update = await client.query(
      `INSERT INTO project_updates (project_id, milestone_id, author_id, title, description, progress_pct, attachments, is_delivery)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [id, milestone_id, req.user.id, title, description, progress_pct, JSON.stringify(attachments || []), is_delivery || false]
    );

    if (progress_pct) {
      await client.query(
        'UPDATE projects SET progress_pct = $1, last_activity_at = NOW() WHERE id = $2',
        [progress_pct, id]
      );
    }

    if (is_delivery && milestone_id) {
      await client.query(
        `UPDATE milestones SET status = 'submitted', submitted_at = NOW(), submission_notes = $1 WHERE id = $2`,
        [description, milestone_id]
      );

      await client.query(
        "UPDATE projects SET status = 'in_review', last_activity_at = NOW() WHERE id = $1",
        [id]
      );
    }

    return update.rows[0];
  });

  await notificationService.create(project.client_id, 'milestone_approved', {
    title: is_delivery ? '📦 Entrega disponível para revisão!' : '🔄 Nova atualização no projeto',
    body: `${title}: ${description.substring(0, 100)}...`,
    data: { project_id: id },
  });

  res.status(201).json({ update: result });
};

// POST /api/projects/:id/milestones/:milestoneId/approve - Cliente aprova milestone
const approveMilestone = async (req, res) => {
  const { id, milestoneId } = req.params;

  const projectResult = await query(
    'SELECT * FROM projects WHERE id = $1 AND client_id = $2',
    [id, req.user.id]
  );

  if (projectResult.rows.length === 0) {
    return res.status(404).json({ error: 'Projeto não encontrado' });
  }

  const project = projectResult.rows[0];

  const milestoneResult = await query(
    "SELECT * FROM milestones WHERE id = $1 AND status = 'submitted'",
    [milestoneId]
  );

  if (milestoneResult.rows.length === 0) {
    return res.status(400).json({ error: 'Milestone não encontrada ou já aprovada' });
  }

  const milestone = milestoneResult.rows[0];

  await transaction(async (client) => {
    await client.query(
      "UPDATE milestones SET status = 'approved', approved_at = NOW() WHERE id = $1",
      [milestoneId]
    );

    // Verificar se é o último milestone
    const remaining = await client.query(
      "SELECT COUNT(*) FROM milestones WHERE proposal_id = $1 AND status NOT IN ('paid','approved')",
      [project.proposal_id]
    );

    const allDone = parseInt(remaining.rows[0].count) === 0;

    await client.query(
      "UPDATE projects SET status = $1, last_activity_at = NOW() WHERE id = $2",
      [allDone ? 'completed' : 'in_progress', id]
    );

    if (allDone) {
      await client.query(
        'UPDATE projects SET completed_at = NOW() WHERE id = $1',
        [id]
      );

      // Incrementar contador de projetos concluídos
      await client.query(
        'UPDATE users SET completed_projects = completed_projects + 1 WHERE id = $1',
        [project.freelancer_id]
      );
    }
  });

  // TODO: Acionar liberação de pagamento do milestone
  // await paymentService.releaseMilestonePayment(milestoneId);

  await notificationService.create(project.freelancer_id, 'milestone_approved', {
    title: '✅ Etapa aprovada!',
    body: `A etapa "${milestone.title}" foi aprovada. Pagamento sendo processado.`,
    data: { project_id: id, milestone_id: milestoneId },
  });

  res.json({ message: 'Etapa aprovada! Pagamento será liberado em breve.' });
};

// POST /api/projects/:id/milestones/:milestoneId/reject - Cliente pede revisão
const requestRevision = async (req, res) => {
  const { id, milestoneId } = req.params;
  const { reason } = req.body;

  const projectResult = await query(
    'SELECT * FROM projects WHERE id = $1 AND client_id = $2',
    [id, req.user.id]
  );

  if (projectResult.rows.length === 0) {
    return res.status(404).json({ error: 'Projeto não encontrado' });
  }

  const project = projectResult.rows[0];

  if (project.revisions_used >= project.revisions_allowed) {
    return res.status(400).json({
      error: `Limite de ${project.revisions_allowed} revisões atingido para este projeto`,
    });
  }

  await transaction(async (client) => {
    await client.query(
      `UPDATE milestones SET status = 'rejected', rejection_reason = $1 WHERE id = $2`,
      [reason, milestoneId]
    );

    await client.query(
      `UPDATE projects SET status = 'revision_requested', revisions_used = revisions_used + 1,
       last_activity_at = NOW() WHERE id = $1`,
      [id]
    );
  });

  await notificationService.create(project.freelancer_id, 'milestone_rejected', {
    title: '🔄 Revisão solicitada',
    body: `O cliente solicitou ajustes: ${reason}`,
    data: { project_id: id, milestone_id: milestoneId },
  });

  res.json({ message: 'Revisão solicitada ao freelancer.' });
};

// POST /api/projects/:id/cancel - Cancelar projeto
const cancelProject = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const result = await query(
    `SELECT * FROM projects WHERE id = $1 AND (freelancer_id = $2 OR client_id = $2)
     AND status NOT IN ('completed','cancelled')`,
    [id, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Projeto não encontrado ou já finalizado' });
  }

  await query(
    `UPDATE projects SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = $1 WHERE id = $2`,
    [reason, id]
  );

  const project = result.rows[0];
  const otherId = req.user.id === project.freelancer_id ? project.client_id : project.freelancer_id;

  await notificationService.create(otherId, 'system_alert', {
    title: '❌ Projeto cancelado',
    body: `O projeto "${project.title}" foi cancelado. Motivo: ${reason}`,
    data: { project_id: id },
  });

  res.json({ message: 'Projeto cancelado.' });
};

module.exports = { getMyProjects, getProject, addUpdate, approveMilestone, requestRevision, cancelProject };
