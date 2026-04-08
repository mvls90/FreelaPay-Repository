const { query, transaction } = require('../config/database');
const notificationService = require('../services/notificationService');
const logger = require('../config/logger');

// Inicialização do Mercado Pago
const { MercadoPagoConfig, Payment, Preference } = require('mercadopago');
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

// Stripe
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/payments/project/:projectId/initiate - Iniciar pagamento
const initiatePayment = async (req, res) => {
  const { projectId } = req.params;
  const { method, installments = 1 } = req.body;

  const projectResult = await query(
    `SELECT p.*, pr.total_amount, pr.platform_fee_amount, pr.freelancer_receives, pr.payment_type
     FROM projects p
     JOIN proposals pr ON p.proposal_id = pr.id
     WHERE p.id = $1 AND p.client_id = $2 AND p.status = 'waiting_payment'`,
    [projectId, req.user.id]
  );

  if (projectResult.rows.length === 0) {
    return res.status(404).json({ error: 'Projeto não encontrado ou pagamento já realizado' });
  }

  const project = projectResult.rows[0];
  const amount = parseFloat(project.total_amount);
  const platform_fee = parseFloat(project.platform_fee_amount);
  const net_amount = parseFloat(project.freelancer_receives);

  // Criar registro de pagamento pendente
  const paymentRecord = await query(
    `INSERT INTO payments (project_id, payer_id, payee_id, status, method, amount, platform_fee, net_amount, installments)
     VALUES ($1,$2,$3,'pending',$4,$5,$6,$7,$8) RETURNING *`,
    [projectId, req.user.id, project.freelancer_id, method, amount, platform_fee, net_amount, installments]
  );

  const payment = paymentRecord.rows[0];

  try {
    let gatewayResponse = {};

    if (method === 'pix') {
      // Criar cobrança PIX via Mercado Pago
      const mpPayment = new Payment(mpClient);
      const pixData = await mpPayment.create({
        body: {
          transaction_amount: amount,
          description: `Free.API - ${project.title}`,
          payment_method_id: 'pix',
          payer: {
            email: req.user.email,
            first_name: req.user.full_name.split(' ')[0],
          },
          external_reference: payment.id,
          notification_url: `${process.env.APP_URL}/api/webhooks/mercadopago`,
        },
      });

      const pixInfo = pixData.point_of_interaction?.transaction_data;

      await query(
        `UPDATE payments SET gateway_provider='mercadopago', gateway_payment_id=$1,
         pix_qr_code=$2, pix_expiry=NOW() + INTERVAL '30 minutes' WHERE id=$3`,
        [String(pixData.id), pixInfo?.qr_code, payment.id]
      );

      gatewayResponse = {
        payment_id: payment.id,
        gateway: 'mercadopago',
        method: 'pix',
        amount,
        qr_code: pixInfo?.qr_code,
        qr_code_base64: pixInfo?.qr_code_base64,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      };

    } else if (['credit_card', 'debit_card'].includes(method)) {
      // Criar Payment Intent via Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // centavos
        currency: 'brl',
        metadata: {
          payment_id: payment.id,
          project_id: projectId,
          client_id: req.user.id,
        },
        description: `Free.API - ${project.title}`,
      });

      await query(
        `UPDATE payments SET gateway_provider='stripe', gateway_payment_id=$1 WHERE id=$2`,
        [paymentIntent.id, payment.id]
      );

      gatewayResponse = {
        payment_id: payment.id,
        gateway: 'stripe',
        method,
        amount,
        client_secret: paymentIntent.client_secret,
        publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
      };
    }

    res.json(gatewayResponse);

  } catch (error) {
    logger.error('Erro ao criar pagamento:', error);
    await query("UPDATE payments SET status='cancelled' WHERE id=$1", [payment.id]);
    res.status(500).json({ error: 'Erro ao processar pagamento. Tente novamente.' });
  }
};

// POST /api/webhooks/mercadopago - Webhook MP
const mercadoPagoWebhook = async (req, res) => {
  const { type, data } = req.body;

  if (type === 'payment') {
    try {
      const mpPayment = new Payment(mpClient);
      const mpData = await mpPayment.get({ id: data.id });

      const paymentResult = await query(
        'SELECT * FROM payments WHERE gateway_payment_id = $1',
        [String(mpData.id)]
      );

      if (paymentResult.rows.length === 0) {
        return res.status(200).json({ received: true });
      }

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

// POST /api/webhooks/stripe - Webhook Stripe
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error('Webhook Stripe inválido:', err.message);
    return res.status(400).json({ error: err.message });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    const paymentResult = await query(
      'SELECT * FROM payments WHERE gateway_payment_id = $1',
      [paymentIntent.id]
    );

    if (paymentResult.rows.length > 0) {
      await processPaymentApproved(paymentResult.rows[0]);
    }
  }

  res.status(200).json({ received: true });
};

// Processar pagamento aprovado
const processPaymentApproved = async (payment) => {
  await transaction(async (client) => {
    await client.query(
      "UPDATE payments SET status='held', held_at=NOW() WHERE id=$1",
      [payment.id]
    );

    await client.query(
      "UPDATE projects SET status='in_progress', started_at=NOW(), amount_held=$1 WHERE id=$2",
      [payment.amount, payment.project_id]
    );

    // Atualizar saldo em custódia do freelancer
    await client.query(
      `INSERT INTO user_balances (user_id, held)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET held = user_balances.held + $2`,
      [payment.payee_id, payment.net_amount]
    );
  });

  // Notificar freelancer
  await notificationService.create(payment.payee_id, 'payment_received', {
    title: '💰 Pagamento recebido e protegido!',
    body: `R$ ${payment.net_amount} está em custódia e será liberado após aprovação do cliente.`,
    data: { project_id: payment.project_id, payment_id: payment.id },
  });

  // Notificar cliente
  await notificationService.create(payment.payer_id, 'payment_received', {
    title: '✅ Pagamento confirmado!',
    body: `Seu pagamento foi confirmado. O freelancer já pode iniciar o trabalho.`,
    data: { project_id: payment.project_id },
  });

  logger.info(`Pagamento aprovado: ${payment.id} - R$ ${payment.amount}`);
};

// POST /api/payments/:id/release - Liberar pagamento manualmente (admin)
const releasePayment = async (req, res) => {
  const { id } = req.params;

  if (!['admin', 'mediator'].includes(req.user.type)) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const paymentResult = await query(
    "SELECT * FROM payments WHERE id=$1 AND status='held'",
    [id]
  );

  if (paymentResult.rows.length === 0) {
    return res.status(404).json({ error: 'Pagamento não encontrado ou não está em custódia' });
  }

  const payment = paymentResult.rows[0];

  await transaction(async (client) => {
    await client.query(
      "UPDATE payments SET status='released', released_at=NOW() WHERE id=$1",
      [id]
    );

    // Mover de held para available no saldo
    await client.query(
      `UPDATE user_balances SET
       held = held - $1, available = available + $1, total_earned = total_earned + $1
       WHERE user_id = $2`,
      [payment.net_amount, payment.payee_id]
    );

    await client.query(
      'UPDATE projects SET amount_released = amount_released + $1 WHERE id = $2',
      [payment.net_amount, payment.project_id]
    );
  });

  await notificationService.create(payment.payee_id, 'payment_released', {
    title: '🎉 Pagamento liberado!',
    body: `R$ ${payment.net_amount} foi liberado para sua conta.`,
    data: { payment_id: id },
  });

  res.json({ message: 'Pagamento liberado com sucesso.' });
};

// GET /api/payments/balance - Saldo do usuário
const getBalance = async (req, res) => {
  const result = await query(
    'SELECT * FROM user_balances WHERE user_id = $1',
    [req.user.id]
  );

  const balance = result.rows[0] || { available: 0, held: 0, total_earned: 0, total_withdrawn: 0 };

  res.json({ balance });
};

// POST /api/payments/withdraw - Solicitar saque
const requestWithdrawal = async (req, res) => {
  const { amount, method, bank_info } = req.body;

  const balanceResult = await query(
    'SELECT available FROM user_balances WHERE user_id = $1',
    [req.user.id]
  );

  if (balanceResult.rows.length === 0 || parseFloat(balanceResult.rows[0].available) < amount) {
    return res.status(400).json({ error: 'Saldo insuficiente para saque' });
  }

  const minWithdrawal = parseFloat(process.env.MIN_WITHDRAWAL) || 50;
  if (amount < minWithdrawal) {
    return res.status(400).json({ error: `Valor mínimo para saque é R$ ${minWithdrawal}` });
  }

  await transaction(async (client) => {
    await client.query(
      `INSERT INTO withdrawal_requests (user_id, amount, method, bank_info) VALUES ($1,$2,$3,$4)`,
      [req.user.id, amount, method, JSON.stringify(bank_info)]
    );

    await client.query(
      'UPDATE user_balances SET available = available - $1 WHERE user_id = $2',
      [amount, req.user.id]
    );
  });

  res.status(201).json({ message: `Solicitação de saque de R$ ${amount} enviada! Processamento em até 1 dia útil.` });
};

module.exports = { initiatePayment, mercadoPagoWebhook, stripeWebhook, releasePayment, getBalance, requestWithdrawal };
