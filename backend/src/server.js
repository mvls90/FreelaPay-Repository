require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { pool } = require('./config/database');
const logger = require('./config/logger');
const socketHandler = require('./config/socket');

const authRoutes         = require('./routes/auth');
const userRoutes         = require('./routes/users');
const proposalRoutes     = require('./routes/proposals');
const projectRoutes      = require('./routes/projects');
const paymentRoutes      = require('./routes/payments');
const disputeRoutes      = require('./routes/disputes');
const messageRoutes      = require('./routes/messages');
const reviewRoutes       = require('./routes/reviews');
const adminRoutes        = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const webhookRoutes      = require('./routes/webhooks');

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL, methods: ['GET','POST'], credentials: true },
});

// ── Middlewares globais ──────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true, methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'] }));
app.use(compression());
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));

// Webhook Stripe precisa raw body — registrar ANTES do express.json()
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
});
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 10, message: { error: 'Muitas tentativas. Aguarde 15 minutos.' } });

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Injetar io em cada req
app.use((req, _res, next) => { req.io = io; next(); });

// ── Rotas ────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/proposals',     proposalRoutes);
app.use('/api/projects',      projectRoutes);
app.use('/api/payments',      paymentRoutes);
app.use('/api/disputes',      disputeRoutes);
app.use('/api/messages',      messageRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/webhooks',      webhookRoutes);

// Health check
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString(), db: 'connected' });
  } catch {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

// ── Error handler global ─────────────────────────────────────────
app.use((err, req, res, _next) => {
  logger.error(`${err.status||500} - ${err.message} - ${req.originalUrl}`);
  const status = err.status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Erro interno' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

app.use('*', (_req, res) => res.status(404).json({ error: 'Rota não encontrada' }));

// ── Socket.io ────────────────────────────────────────────────────
socketHandler(io);

// ── Start ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  logger.info(`🚀 Free.API rodando na porta ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

module.exports = { app, server, io };
