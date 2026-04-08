const { query, transaction } = require('../config/database');
const notificationService = require('../services/notificationService');
const logger = require('../config/logger');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

// POST /api/payments/project/:projectId/initiate
const initiatePayment = async (req, res) => {
  const { projectId } = req.params;

  const projectResult = await query(
    `SELECT p.*, pr.total_amount, pr.platform_fee_amount, pr.freelancer_receives, pr.title as proposal_title
     FROM projects p
     JOIN proposals pr ON p.proposal_id = pr.id
     WHERE p.id = $1 AND p.client_id = $2 AND p.status = 'waiting_payment'`,
    [projectId, req.user.id]
  );

  if (projectResult.rows.length === 0) {
    return res.status(404).json({ error: 'Projeto não encontrado ou pagamento já realizado' });
  }

  const project = projectResult.rows[0];
  const amount  = parseFloat(project.total_amount);
  const fee     = parseFloat(project.platform_fee_amount);
  const net     = parseFloat(project.freelancer_receives);

  const paymentRecord = await query(
    `INSERT INTO payments (project_id, payer_id, payee_id, status, amount, platform_fee, net_amount)
     VALUES ($1,$2,$3,'pending',$4,$5,$6) RETURNING *`,
    [projectId, req.user.id, project.freelancer_id, amount, fee, net]
  );

  const payment = paymentRecord.rows[0];

  try {
    const preference = new Preference(mpClient);

    const preferenceData = await preference.create({
      body: {
        items: [{
          id: projectId,
          title: project.title || 'Projeto FreelaPay',
          quantity: 1,
          unit_price: amount,
          currency_id: 'BRL',
        }],
        payer: {
          email: req.user.email,
          name: req.user.full_name,
        },
        payment_methods: {
          installments: 12,
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/cliente/projetos/${projectId}?payment=success`,
          failure: `${process.env.FRONTEND_URL}/cliente/projetos/${projectId}?payment=failure`,
          pending: `${process.env.FRONTEND_URL}/cliente/projetos/${projectId}?payment=pending`,
        },
        auto_return: 'approved',
        external_reference: payment.id,
        notification_url: `${process.env.APP_URL}/api/webhooks/mercadopago`,
        statement_descriptor: 'FreelaPay',
      },
    });

    await query(
      `UPDATE payments SET gateway_provider='mercadopago', gateway_payment_id=$1 WHERE id=$2`,
      [preferenceData.id, payment.id]
    );

    res.json({
      payment_id: payment.id,
      checkout_url: preferenceData.init_point,
      sandbox_url: preferenceData.sandbox_init_point,
      preference_id: preferenceData.id,
      amount,
    });

  } catch (error) {
    logger.error('Erro ao criar preferência MP:', error);
    await query("UPDATE payments SET status='cancelled' WHERE id=$1", [payment.id]);
    res.status(500).json({ error: 'Erro ao processar pagamento. Tente novamente.' });
  }
};

// POST /api/webhooks/mercadopago
const mercadoPagoWebhook = async (req, res) => {
  const { type, data } = req.body;

  if (type === 'payment') {
    try {
      const mpPayment = new Payment(mpClient);
      const mpData    = await mpPayment.get({ id: data.id });

      const paymentResult = await query(
        'SELECT * FROM payments WHERE gateway_payment_id = $1',
        [mpData.external_reference]
      );

      if (paymentResult.rows.length === 0) return res.status(200).json({ received: true });

      const payment = paymentResult.rows[0];

      if (mpData.status === 'approved') {
        await processPaymentApproved(payment);
      } else if (['rejected', 'cancelled'].includes(mpData.status)) {
        await query("UPDATE payments SET status='cancelled' WHERE id=$1", [payment.id]);
      }
    } catch (error) {
      logger.error('Erro no webhook MP:', error);
    }
  }

  res.status(200).json({ received: true });
};

const processPaymentApproved = async (payment) => {
  await transaction(async (client) => {
    await client.query("UPDATE payments SET status='held', held_at=NOW() WHERE id=$1", [payment.id]);
    await client.query(
      "UPDATE projects SET status='in_progress', started_at=NOW(), amount_held=$1 WHERE id=$2",
      [payment.amount, payment.project_id]
    );
    await client.query(
      `INSERT INTO user_balances (user_id, held) VALUES ($1,$2)
       ON CONFLICT (user_id) DO UPDATE SET held = user_balances.held + $2`,
      [payment.payee_id, payment.net_amount]
    );
  });

  await notificationService.create(payment.payee_id, 'payment_received', {
    title: '💰 Pagamento recebido!',
    body: `R$ ${payment.net_amount} está em custódia aguardando aprovação.`,
    data: { project_id: payment.project_id },
  });

  await notificationService.create(payment.payer_id, 'payment_received', {
    title: '✅ Pagamento confirmado!',
    body: 'Pagamento confirmado. O freelancer já pode iniciar o trabalho.',
    data: { project_id: payment.project_id },
  });
};

const releasePayment = async (req, res) => {
  const { id } = req.params;
  if (!['admin', 'mediator'].includes(req.user.type)) return res.status(403).json({ error: 'Acesso negado' });

  const paymentResult = await query("SELECT * FROM payments WHERE id=$1 AND status='held'", [id]);
  if (!paymentResult.rows.length) return res.status(404).json({ error: 'Pagamento não encontrado' });

  const payment = paymentResult.rows[0];
  await transaction(async (client) => {
    await client.query("UPDATE payments SET status='released', released_at=NOW() WHERE id=$1", [id]);
    await client.query(
      `UPDATE user_balances SET held=held-$1, available=available+$1, total_earned=total_earned+$1 WHERE user_id=$2`,
      [payment.net_amount, payment.payee_id]
    );
    await client.query('UPDATE projects SET amount_released=amount_released+$1 WHERE id=$2', [payment.net_amount, payment.project_id]);
  });

  await notificationService.create(payment.payee_id, 'payment_released', {
    title: '🎉 Pagamento liberado!',
    body: `R$ ${payment.net_amount} foi liberado para sua conta.`,
    data: { payment_id: id },
  });

  res.json({ message: 'Pagamento liberado.' });
};

const getBalance = async (req, res) => {
  const result = await query('SELECT * FROM user_balances WHERE user_id=$1', [req.user.id]);
  res.json({ balance: result.rows[0] || { available: 0, held: 0, total_earned: 0, total_withdrawn: 0 } });
};

const requestWithdrawal = async (req, res) => {
  const { amount, method, bank_info } = req.body;
  const bal = await query('SELECT available FROM user_balances WHERE user_id=$1', [req.user.id]);
  if (!bal.rows.length || parseFloat(bal.rows[0].available) < amount)
    return res.status(400).json({ error: 'Saldo insuficiente' });
  const min = parseFloat(process.env.MIN_WITHDRAWAL) || 50;
  if (amount < min) return res.status(400).json({ error: `Mínimo R$ ${min}` });

  await transaction(async (client) => {
    await client.query('INSERT INTO withdrawal_requests (user_id,amount,method,bank_info) VALUES ($1,$2,$3,$4)',
      [req.user.id, amount, method, JSON.stringify(bank_info)]);
    await client.query('UPDATE user_balances SET available=available-$1 WHERE user_id=$2', [amount, req.user.id]);
  });

  res.status(201).json({ message: `Saque de R$ ${amount} solicitado!` });
};

const stripeWebhook = async (req, res) => res.status(200).json({ received: true });

module.exports = { initiatePayment, mercadoPagoWebhook, stripeWebhook, releasePayment, getBalance, requestWithdrawal };
