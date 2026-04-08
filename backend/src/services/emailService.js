const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const base = (content) => `
  <div style="font-family:Inter,sans-serif;max-width:580px;margin:0 auto;padding:24px;background:#fff;">
    <div style="margin-bottom:24px;">
      <span style="background:#4f46e5;color:#fff;padding:6px 14px;border-radius:8px;font-weight:700;font-size:15px;">Free.API</span>
    </div>
    ${content}
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
    <p style="font-size:12px;color:#9ca3af;">Free.API — Plataforma segura para freelancers · <a href="${process.env.FRONTEND_URL}" style="color:#6366f1;">freeapi.com.br</a></p>
  </div>`;

const btn = (text, url) => `<a href="${url}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin:16px 0;">${text}</a>`;

const emailService = {
  sendWelcomeEmail: async (email, name, verificationToken) => {
    const url = `${process.env.FRONTEND_URL}/verificar-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: `"Free.API" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Bem-vindo! Confirme seu e-mail — Free.API',
      html: base(`
        <h2 style="color:#111827;font-size:22px;">Olá, ${name}! 👋</h2>
        <p style="color:#4b5563;">Sua conta foi criada. Confirme seu e-mail para ativar.</p>
        ${btn('Verificar E-mail', url)}
        <p style="color:#9ca3af;font-size:13px;">Link válido por 24 horas.</p>`),
    });
  },

  sendPasswordResetEmail: async (email, name, resetToken) => {
    const url = `${process.env.FRONTEND_URL}/redefinir-senha?token=${resetToken}`;
    await transporter.sendMail({
      from: `"Free.API" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Redefinição de senha — Free.API',
      html: base(`
        <h2 style="color:#111827;">Redefinir senha</h2>
        <p style="color:#4b5563;">Olá, ${name}. Clique abaixo para redefinir sua senha.</p>
        ${btn('Redefinir Senha', url)}
        <p style="color:#9ca3af;font-size:13px;">Expira em 2 horas. Se não foi você, ignore.</p>`),
    });
  },

  sendProposalAcceptedEmail: async (freelancerId, proposalTitle) => {
    const { query } = require('../config/database');
    const r = await query('SELECT email, full_name FROM users WHERE id=$1', [freelancerId]);
    if (!r.rows.length) return;
    const { email, full_name } = r.rows[0];
    await transporter.sendMail({
      from: `"Free.API" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: '🎉 Sua proposta foi aceita! — Free.API',
      html: base(`
        <h2 style="color:#111827;">Proposta aceita! 🎉</h2>
        <p style="color:#4b5563;">Olá, ${full_name}! Sua proposta <strong>"${proposalTitle}"</strong> foi aceita. Aguardando o pagamento do cliente.</p>
        ${btn('Ver Projetos', `${process.env.FRONTEND_URL}/freelancer/projetos`)}`),
    });
  },

  sendPaymentConfirmedEmail: async (clientId, projectTitle) => {
    const { query } = require('../config/database');
    const r = await query('SELECT email, full_name FROM users WHERE id=$1', [clientId]);
    if (!r.rows.length) return;
    const { email, full_name } = r.rows[0];
    await transporter.sendMail({
      from: `"Free.API" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: '✅ Pagamento confirmado — Free.API',
      html: base(`
        <h2 style="color:#111827;">Pagamento confirmado ✅</h2>
        <p style="color:#4b5563;">Olá, ${full_name}! Seu pagamento para <strong>"${projectTitle}"</strong> foi confirmado e está em custódia segura.</p>
        ${btn('Acompanhar Projeto', `${process.env.FRONTEND_URL}/cliente/projetos`)}`),
    });
  },
};

module.exports = emailService;
