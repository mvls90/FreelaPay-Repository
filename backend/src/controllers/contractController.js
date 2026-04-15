const { query } = require('../config/database');
const logger = require('../config/logger');

/* ─────────────────────────────────────────────────────────────
   Helper — monta o texto do contrato a partir da proposta
───────────────────────────────────────────────────────────── */
const buildContractContent = (proposal, project, freelancerName, clientName) => {
  const milestoneLines = (proposal.milestones || [])
    .filter(Boolean)
    .map((m, i) =>
      `  Etapa ${i + 1}: ${m.title} — ${m.percentage}% (R$ ${parseFloat(m.amount).toFixed(2)})`
    )
    .join('\n');

  return JSON.stringify({
    title: proposal.title,
    description: proposal.description,
    scope_details: proposal.scope_details,
    total_amount: proposal.total_amount,
    platform_fee_pct: proposal.platform_fee_pct,
    platform_fee_amount: proposal.platform_fee_amount,
    freelancer_receives: proposal.freelancer_receives,
    payment_type: proposal.payment_type,
    deadline_days: proposal.deadline_days,
    revisions_included: proposal.revisions_included,
    milestones: proposal.milestones || [],
    freelancer_name: freelancerName,
    client_name: clientName,
    project_id: project.id,
    proposal_id: proposal.id,
    generated_at: new Date().toISOString(),
    clauses: {
      cancellation: 'Em caso de cancelamento após o início do projeto, a parte solicitante poderá ser responsabilizada por até 30% do valor total acordado, a critério da mediação FreelaPay.',
      mediation: 'Qualquer disputa será submetida à mediação da plataforma FreelaPay, cuja decisão será vinculante para ambas as partes.',
      delivery: `O freelancer se compromete a entregar o serviço conforme o escopo definido neste contrato em até ${proposal.deadline_days} dias corridos após a liberação do pagamento em custódia.`,
      revisions: `Estão incluídas ${proposal.revisions_included} rodadas de revisão sem custo adicional. Revisões além deste limite serão cobradas separadamente mediante nova proposta.`,
      intellectual_property: 'Todos os direitos de propriedade intelectual sobre os entregáveis serão transferidos integralmente ao cliente após o pagamento total do contrato.',
      confidentiality: 'Ambas as partes concordam em manter sigilo sobre informações confidenciais compartilhadas durante a execução deste contrato por um período de 2 anos.',
      governing_law: 'Este contrato é regido pelas leis brasileiras. Fica eleito o foro da comarca de São Paulo/SP para dirimir eventuais litígios não resolvidos pela mediação.',
    },
    milestone_summary: milestoneLines,
  });
};

/* ─────────────────────────────────────────────────────────────
   Criar contrato (chamado internamente pelo proposalController)
───────────────────────────────────────────────────────────── */
const createContract = async (dbClient, proposal, project, freelancerName, clientName) => {
  const content = buildContractContent(proposal, project, freelancerName, clientName);

  const result = await dbClient.query(
    `INSERT INTO contracts (
      project_id, proposal_id, freelancer_id, client_id,
      status, content, ip_assignment, nda_required
    ) VALUES ($1, $2, $3, $4, 'pending_signature', $5, TRUE, FALSE)
    RETURNING *`,
    [project.id, proposal.id, proposal.freelancer_id, project.client_id, content]
  );

  logger.info(`Contrato criado: ${result.rows[0].id} para projeto ${project.id}`);
  return result.rows[0];
};

/* ─────────────────────────────────────────────────────────────
   GET /api/contracts/:projectId
───────────────────────────────────────────────────────────── */
const getContract = async (req, res) => {
  const { projectId } = req.params;

  const result = await query(
    `SELECT c.*,
       f.full_name AS freelancer_name, f.email AS freelancer_email,
       cl.full_name AS client_name, cl.email AS client_email,
       p.title AS project_title, p.total_amount, p.deadline_at, p.status AS project_status
     FROM contracts c
     JOIN users f  ON c.freelancer_id = f.id
     JOIN users cl ON c.client_id = cl.id
     JOIN projects p ON c.project_id = p.id
     WHERE c.project_id = $1`,
    [projectId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Contrato não encontrado para este projeto' });
  }

  const contract = result.rows[0];

  // Verificar permissão: apenas freelancer ou cliente do contrato
  if (req.user.id !== contract.freelancer_id && req.user.id !== contract.client_id) {
    return res.status(403).json({ error: 'Acesso negado a este contrato' });
  }

  // Parsear content
  try {
    contract.content_parsed = JSON.parse(contract.content);
  } catch {
    contract.content_parsed = null;
  }

  res.json({ contract });
};

/* ─────────────────────────────────────────────────────────────
   POST /api/contracts/:id/sign
───────────────────────────────────────────────────────────── */
const signContract = async (req, res) => {
  const { id } = req.params;

  const result = await query(
    'SELECT * FROM contracts WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Contrato não encontrado' });
  }

  const contract = result.rows[0];

  if (req.user.id !== contract.freelancer_id && req.user.id !== contract.client_id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  if (!['pending_signature', 'draft'].includes(contract.status)) {
    return res.status(400).json({ error: 'Este contrato não pode mais ser assinado' });
  }

  const isFreelancer = req.user.id === contract.freelancer_id;
  const sigField = isFreelancer ? 'freelancer_sig' : 'client_sig';

  if (contract[sigField]) {
    return res.status(400).json({ error: 'Você já assinou este contrato' });
  }

  const sig = {
    user_id: req.user.id,
    name: req.user.full_name,
    ip: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
    timestamp: new Date().toISOString(),
    user_agent: req.headers['user-agent'] || '',
  };

  // Verificar se a outra parte já assinou (para marcar como 'signed')
  const otherSigField = isFreelancer ? 'client_sig' : 'freelancer_sig';
  const otherAlreadySigned = !!contract[otherSigField];

  const newStatus = otherAlreadySigned ? 'signed' : 'pending_signature';
  const signedAt = otherAlreadySigned ? new Date() : null;

  const updated = await query(
    `UPDATE contracts
     SET ${sigField} = $1,
         status = $2,
         ${signedAt ? 'signed_at = $4,' : ''}
         updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    signedAt
      ? [JSON.stringify(sig), newStatus, id, signedAt]
      : [JSON.stringify(sig), newStatus, id]
  );

  logger.info(`Contrato ${id} assinado por ${req.user.id} (${isFreelancer ? 'freelancer' : 'cliente'})`);

  try {
    updated.rows[0].content_parsed = JSON.parse(updated.rows[0].content);
  } catch { /* ignore */ }

  res.json({
    message: otherAlreadySigned
      ? 'Contrato assinado por ambas as partes! Está oficialmente ativo.'
      : 'Assinatura registrada. Aguardando a outra parte assinar.',
    contract: updated.rows[0],
  });
};

module.exports = { createContract, getContract, signContract };
