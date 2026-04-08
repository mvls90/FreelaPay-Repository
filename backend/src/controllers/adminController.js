const { query } = require('../config/database');

// GET /api/admin/dashboard - Métricas gerais
const getDashboard = async (req, res) => {
  const [
    usersStats, projectsStats, paymentsStats, disputesStats, recentActivity
  ] = await Promise.all([
    query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE type='freelancer') AS freelancers,
        COUNT(*) FILTER (WHERE type='client') AS clients,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') AS new_today,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS new_this_week,
        COUNT(*) FILTER (WHERE status='suspended') AS suspended,
        COUNT(*) FILTER (WHERE status='banned') AS banned
      FROM users WHERE type NOT IN ('admin','mediator','support')
    `),
    query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status='in_progress') AS in_progress,
        COUNT(*) FILTER (WHERE status='completed') AS completed,
        COUNT(*) FILTER (WHERE status='disputed') AS disputed,
        COUNT(*) FILTER (WHERE status='cancelled') AS cancelled,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') AS new_today,
        AVG(total_amount) AS avg_value
      FROM projects
    `),
    query(`
      SELECT
        COALESCE(SUM(amount), 0) AS total_volume,
        COALESCE(SUM(platform_fee), 0) AS total_fees,
        COALESCE(SUM(amount) FILTER (WHERE status='held'), 0) AS held_amount,
        COALESCE(SUM(amount) FILTER (WHERE created_at > NOW() - INTERVAL '30 days'), 0) AS monthly_volume,
        COUNT(*) FILTER (WHERE status='pending') AS pending_payments
      FROM payments
    `),
    query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status='open') AS open,
        COUNT(*) FILTER (WHERE status='under_review') AS under_review,
        COUNT(*) FILTER (WHERE status='resolved') AS resolved,
        COUNT(*) FILTER (WHERE sla_deadline < NOW() AND status NOT IN ('resolved','closed')) AS overdue_sla
      FROM disputes
    `),
    query(`
      SELECT 'project' AS type, p.id, p.title, p.status, p.created_at,
             f.full_name AS actor_name
      FROM projects p
      JOIN users f ON p.freelancer_id = f.id
      ORDER BY p.created_at DESC LIMIT 5
    `),
  ]);

  // Receita dos últimos 30 dias por dia
  const revenueChart = await query(`
    SELECT
      DATE_TRUNC('day', created_at) AS day,
      COALESCE(SUM(platform_fee), 0) AS revenue,
      COUNT(*) AS transactions
    FROM payments
    WHERE created_at > NOW() - INTERVAL '30 days' AND status IN ('held','released')
    GROUP BY 1
    ORDER BY 1
  `);

  // Projetos por status nos últimos 30 dias
  const projectsChart = await query(`
    SELECT
      DATE_TRUNC('week', created_at) AS week,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status='completed') AS completed
    FROM projects
    WHERE created_at > NOW() - INTERVAL '90 days'
    GROUP BY 1
    ORDER BY 1
  `);

  res.json({
    users: usersStats.rows[0],
    projects: projectsStats.rows[0],
    payments: paymentsStats.rows[0],
    disputes: disputesStats.rows[0],
    recent_activity: recentActivity.rows,
    charts: {
      revenue: revenueChart.rows,
      projects: projectsChart.rows,
    },
  });
};

// GET /api/admin/users - Listar todos usuários
const getUsers = async (req, res) => {
  const { type, status, search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  let whereClause = 'WHERE 1=1';

  if (type) { params.push(type); whereClause += ` AND u.type = $${params.length}`; }
  if (status) { params.push(status); whereClause += ` AND u.status = $${params.length}`; }
  if (search) {
    params.push(`%${search}%`);
    whereClause += ` AND (u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
  }

  const result = await query(
    `SELECT u.id, u.type, u.status, u.full_name, u.email, u.verification,
     u.trust_score, u.completed_projects, u.is_premium, u.created_at, u.last_login_at,
     b.available, b.held, b.total_earned
     FROM users u
     LEFT JOIN user_balances b ON u.id = b.user_id
     ${whereClause}
     ORDER BY u.created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  const total = await query(
    `SELECT COUNT(*) FROM users u ${whereClause}`,
    params
  );

  res.json({
    users: result.rows,
    pagination: {
      total: parseInt(total.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total.rows[0].count / limit),
    },
  });
};

// PATCH /api/admin/users/:id/status - Suspender/banir usuário
const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!['active', 'suspended', 'banned'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }

  await query('UPDATE users SET status = $1 WHERE id = $2', [status, id]);

  await query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_data)
     VALUES ($1, 'user_status_changed', 'user', $2, $3)`,
    [req.user.id, id, JSON.stringify({ status, reason })]
  );

  res.json({ message: `Usuário ${status} com sucesso.` });
};

// GET /api/admin/transactions - Todas as transações
const getTransactions = async (req, res) => {
  const { status, method, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const result = await query(
    `SELECT pay.*, p.title AS project_title,
     payer.full_name AS payer_name, payee.full_name AS payee_name
     FROM payments pay
     JOIN projects p ON pay.project_id = p.id
     JOIN users payer ON pay.payer_id = payer.id
     JOIN users payee ON pay.payee_id = payee.id
     ${status ? `WHERE pay.status = '${status}'` : ''}
     ORDER BY pay.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  res.json({ transactions: result.rows });
};

// GET /api/admin/fraud-alerts - Alertas de fraude
const getFraudAlerts = async (req, res) => {
  const result = await query(
    `SELECT fa.*, u.full_name, u.email, u.type AS user_type
     FROM fraud_alerts fa
     JOIN users u ON fa.user_id = u.id
     WHERE fa.status = 'open'
     ORDER BY CASE fa.severity WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, fa.created_at DESC`
  );

  res.json({ alerts: result.rows });
};

// GET /api/admin/withdrawal-requests - Pedidos de saque pendentes
const getWithdrawalRequests = async (req, res) => {
  const result = await query(
    `SELECT wr.*, u.full_name, u.email, ub.available AS current_balance
     FROM withdrawal_requests wr
     JOIN users u ON wr.user_id = u.id
     LEFT JOIN user_balances ub ON wr.user_id = ub.user_id
     WHERE wr.status = 'pending'
     ORDER BY wr.created_at ASC`
  );

  res.json({ requests: result.rows });
};

// PATCH /api/admin/withdrawal-requests/:id - Processar saque
const processWithdrawal = async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body; // approved or rejected

  await query(
    `UPDATE withdrawal_requests SET status=$1, processed_by=$2, processed_at=NOW(), notes=$3 WHERE id=$4`,
    [status, req.user.id, notes, id]
  );

  if (status === 'rejected') {
    const wr = await query('SELECT * FROM withdrawal_requests WHERE id=$1', [id]);
    if (wr.rows.length > 0) {
      await query(
        'UPDATE user_balances SET available = available + $1 WHERE user_id = $2',
        [wr.rows[0].amount, wr.rows[0].user_id]
      );
    }
  }

  res.json({ message: `Saque ${status === 'approved' ? 'aprovado' : 'recusado'} com sucesso.` });
};

// GET /api/admin/audit-logs - Logs de auditoria
const getAuditLogs = async (req, res) => {
  const { user_id, action, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  const result = await query(
    `SELECT al.*, u.full_name, u.email
     FROM audit_logs al
     LEFT JOIN users u ON al.user_id = u.id
     ${user_id ? `WHERE al.user_id = '${user_id}'` : ''}
     ORDER BY al.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  res.json({ logs: result.rows });
};

module.exports = {
  getDashboard, getUsers, updateUserStatus, getTransactions,
  getFraudAlerts, getWithdrawalRequests, processWithdrawal, getAuditLogs
};
