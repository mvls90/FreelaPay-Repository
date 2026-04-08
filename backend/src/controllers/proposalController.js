const { v4: uuidv4 } = require('uuid');
const { query, transaction } = require('../config/database');
const notificationService = require('../services/notificationService');
const emailService = require('../services/emailService');
const logger = require('../config/logger');

// POST /api/proposals - Criar proposta
const createProposal = async (req, res) => {
  const {
    category_id, title, description, scope_details, total_amount,
    payment_type, deadline_days, revisions_included, milestones,
  } = req.body;

  const platform_fee_pct = 5.0;
  const platform_fee_amount = (total_amount * platform_fee_pct) / 100;
  const freelancer_receives = total_amount - platform_fee_amount;

  const unique_link = uuidv4().replace(/-/g, '').substring(0, 16);
  const link_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias

  const result = await transaction(async (client) => {
    const proposalResult = await client.query(
      `INSERT INTO proposals (
        freelancer_id, category_id, title, description, scope_details,
        total_amount, platform_fee_pct, platform_fee_amount, freelancer_receives,
        payment_type, deadline_days, revisions_included, unique_link, link_expires_at, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'sent')
      RETURNING *`,
      [
        req.user.id, category_id, title, description, scope_details,
        total_amount, platform_fee_pct, platform_fee_amount, freelancer_receives,
        payment_type, deadline_days, revisions_included || 2, unique_link, link_expires_at,
      ]
    );

    const proposal = proposalResult.rows[0];

    if (milestones && milestones.length > 0) {
      for (let i = 0; i < milestones.length; i++) {
        const m = milestones[i];
        const amount = (proposal.total_amount * m.percentage) / 100;
        await client.query(
          `INSERT INTO milestones (proposal_id, title, description, order_index, percentage, amount)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [proposal.id, m.title, m.description, i + 1, m.percentage, amount]
        );
      }
    } else {
      // Milestone padrão: pagamento único
      await client.query(
        `INSERT INTO milestones (proposal_id, title, description, order_index, percentage, amount)
         VALUES ($1,'Entrega Final','Pagamento na conclusão do projeto',1,100,$2)`,
        [proposal.id, total_amount]
      );
    }

    return proposal;
  });

  const proposalUrl = `${process.env.FRONTEND_URL}/proposta/${result.unique_link}`;

  logger.info(`Proposta criada: ${result.id} por ${req.user.id}`);

  res.status(201).json({
    message: 'Proposta criada com sucesso!',
    proposal: result,
    proposal_url: proposalUrl,
    link: result.unique_link,
  });
};

// GET /api/proposals/link/:link - Visualizar proposta pelo link (público)
const getProposalByLink = async (req, res) => {
  const { link } = req.params;

  const result = await query(
    `SELECT p.*, 
     u.full_name AS freelancer_name, u.avatar_url AS freelancer_avatar,
     u.trust_score AS freelancer_trust, u.completed_projects AS freelancer_projects,
     u.verification AS freelancer_verification,
     c.name AS category_name,
     json_agg(m.* ORDER BY m.order_index) AS milestones
     FROM proposals p
     JOIN users u ON p.freelancer_id = u.id
     LEFT JOIN categories c ON p.category_id = c.id
     LEFT JOIN milestones m ON m.proposal_id = p.id
     WHERE p.unique_link = $1 AND p.status IN ('sent','viewed')
     GROUP BY p.id, u.full_name, u.avatar_url, u.trust_score, u.completed_projects, u.verification, c.name`,
    [link]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Proposta não encontrada ou expirada' });
  }

  const proposal = result.rows[0];

  if (new Date(proposal.link_expires_at) < new Date()) {
    return res.status(410).json({ error: 'Este link de proposta expirou' });
  }

  // Marcar como visualizada
  if (proposal.status === 'sent') {
    await query("UPDATE proposals SET status = 'viewed' WHERE id = $1", [proposal.id]);
    await notificationService.create(proposal.freelancer_id, 'proposal_accepted', {
      title: 'Proposta visualizada!',
      body: `Seu cliente visualizou a proposta: ${proposal.title}`,
      data: { proposal_id: proposal.id },
    });
  }

  res.json({ proposal });
};

// POST /api/proposals/:id/accept - Cliente aceita proposta
const acceptProposal = async (req, res) => {
  const { id } = req.params;

  const proposalResult = await query(
    'SELECT * FROM proposals WHERE id = $1',
    [id]
  );

  if (proposalResult.rows.length === 0) {
    return res.status(404).json({ error: 'Proposta não encontrada' });
  }

  const proposal = proposalResult.rows[0];

  if (!['sent', 'viewed'].includes(proposal.status)) {
    return res.status(400).json({ error: 'Esta proposta não pode mais ser aceita' });
  }

  const result = await transaction(async (client) => {
    await client.query(
      `UPDATE proposals SET status = 'accepted', client_id = $1, accepted_at = NOW() WHERE id = $2`,
      [req.user.id, id]
    );

    const projectResult = await client.query(
      `INSERT INTO projects (
        proposal_id, freelancer_id, client_id, status, title,
        total_amount, deadline_at, revisions_allowed
      ) VALUES ($1,$2,$3,'waiting_payment',$4,$5,
        NOW() + INTERVAL '1 day' * $6, $7)
      RETURNING *`,
      [
        proposal.id, proposal.freelancer_id, req.user.id,
        proposal.title, proposal.total_amount, proposal.deadline_days,
        proposal.revisions_included,
      ]
    );

    return projectResult.rows[0];
  });

  await notificationService.create(proposal.freelancer_id, 'proposal_accepted', {
    title: 'Proposta aceita!',
    body: `Sua proposta "${proposal.title}" foi aceita! Aguardando pagamento.`,
    data: { proposal_id: id, project_id: result.id },
  });

  await emailService.sendProposalAcceptedEmail(proposal.freelancer_id, proposal.title);

  res.json({
    message: 'Proposta aceita! Prossiga com o pagamento.',
    project: result,
    payment_required: proposal.total_amount,
  });
};

// POST /api/proposals/:id/reject - Cliente recusa proposta
const rejectProposal = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  await query(
    `UPDATE proposals SET status = 'rejected', rejected_at = NOW(), rejection_reason = $1 WHERE id = $2`,
    [reason, id]
  );

  res.json({ message: 'Proposta recusada.' });
};

// GET /api/proposals - Listar propostas do freelancer
const getMyProposals = async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE p.freelancer_id = $1';
  const params = [req.user.id];

  if (status) {
    whereClause += ` AND p.status = $${params.length + 1}`;
    params.push(status);
  }

  const result = await query(
    `SELECT p.*, u.full_name AS client_name, c.name AS category_name,
     (SELECT COUNT(*) FROM milestones WHERE proposal_id = p.id) AS milestone_count
     FROM proposals p
     LEFT JOIN users u ON p.client_id = u.id
     LEFT JOIN categories c ON p.category_id = c.id
     ${whereClause}
     ORDER BY p.created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  const total = await query(
    `SELECT COUNT(*) FROM proposals p ${whereClause}`,
    params
  );

  res.json({
    proposals: result.rows,
    pagination: {
      total: parseInt(total.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total.rows[0].count / limit),
    },
  });
};

// PUT /api/proposals/:id - Atualizar proposta (apenas draft)
const updateProposal = async (req, res) => {
  const { id } = req.params;
  const { title, description, total_amount, deadline_days, revisions_included } = req.body;

  const existing = await query(
    'SELECT * FROM proposals WHERE id = $1 AND freelancer_id = $2',
    [id, req.user.id]
  );

  if (existing.rows.length === 0) {
    return res.status(404).json({ error: 'Proposta não encontrada' });
  }

  if (existing.rows[0].status !== 'draft') {
    return res.status(400).json({ error: 'Somente propostas em rascunho podem ser editadas' });
  }

  const result = await query(
    `UPDATE proposals SET title=$1, description=$2, total_amount=$3, deadline_days=$4,
     revisions_included=$5, updated_at=NOW() WHERE id=$6 RETURNING *`,
    [title, description, total_amount, deadline_days, revisions_included, id]
  );

  res.json({ proposal: result.rows[0] });
};

module.exports = { createProposal, getProposalByLink, acceptProposal, rejectProposal, getMyProposals, updateProposal };
