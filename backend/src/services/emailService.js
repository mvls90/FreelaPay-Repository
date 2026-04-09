const { Resend } = require('resend');
const logger = require('../config/logger');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM || 'FreelaPay <onboarding@resend.dev>';

const sendWelcomeEmail = async (email, name, verificationToken) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verificar-email?token=${verificationToken}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Bem-vindo ao FreelaPay! 🎉',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px">
        <img src="${process.env.FRONTEND_URL}/logo.png" alt="FreelaPay" style="height:60px;margin-bottom:24px" />
        <h2 style="color:#1f2937">Olá, ${name}! 👋</h2>
        <p style="color:#4b5563">Sua conta foi criada com sucesso no FreelaPay.</p>
        <p style="color:#4b5563">Clique no botão abaixo para verificar seu e-mail:</p>
        <a href="${verifyUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Verificar e-mail
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">
          Se você não criou esta conta, ignore este e-mail.
        </p>
      </div>
    `,
  });

  logger.info(`E-mail de boas-vindas enviado para ${email}`);
};

const sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/redefinir-senha?token=${resetToken}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Redefinir senha — FreelaPay',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px">
        <img src="${process.env.FRONTEND_URL}/logo.png" alt="FreelaPay" style="height:60px;margin-bottom:24px" />
        <h2 style="color:#1f2937">Olá, ${name}!</h2>
        <p style="color:#4b5563">Recebemos uma solicitação para redefinir sua senha.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Redefinir senha
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">
          Este link expira em 2 horas. Se você não solicitou, ignore este e-mail.
        </p>
      </div>
    `,
  });

  logger.info(`E-mail de redefinição enviado para ${email}`);
};

const sendPaymentConfirmation = async (email, name, projectTitle, amount) => {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: '✅ Pagamento confirmado — FreelaPay',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px">
        <img src="${process.env.FRONTEND_URL}/logo.png" alt="FreelaPay" style="height:60px;margin-bottom:24px" />
        <h2 style="color:#1f2937">Pagamento confirmado! 🎉</h2>
        <p style="color:#4b5563">Olá ${name}, o pagamento do projeto <strong>${projectTitle}</strong> foi confirmado.</p>
        <p style="color:#4b5563">Valor em custódia: <strong>R$ ${amount}</strong></p>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">FreelaPay — Pagamentos seguros para freelancers</p>
      </div>
    `,
  });
};

module.exports = { sendWelcomeEmail, sendPasswordResetEmail, sendPaymentConfirmation };
