// routes/auth.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const ctrl = require('../controllers/authController');

router.post('/register', [
  body('full_name').trim().isLength({ min: 3 }).withMessage('Nome deve ter ao menos 3 caracteres'),
  body('email').isEmail().normalizeEmail().withMessage('E-mail inválido'),
  body('password').isLength({ min: 8 }).withMessage('Senha deve ter ao menos 8 caracteres'),
  body('type').isIn(['freelancer', 'client']).withMessage('Tipo inválido'),
  validate,
], ctrl.register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
], ctrl.login);

router.post('/refresh', ctrl.refreshToken);
router.post('/verify-email', ctrl.verifyEmail);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);
router.post('/setup-2fa', authenticate, ctrl.setup2FA);
router.post('/confirm-2fa', authenticate, ctrl.confirm2FA);

module.exports = router;

// ============================================================
// Exportar todas as rotas em um único arquivo
// ============================================================

// routes/proposals.js
const proposalRouter = express.Router();
const proposalCtrl = require('../controllers/proposalController');
const { authenticate: auth } = require('../middleware/auth');
const { optionalAuth } = require('../middleware/auth');

proposalRouter.post('/', auth, proposalCtrl.createProposal);
proposalRouter.get('/', auth, proposalCtrl.getMyProposals);
proposalRouter.get('/link/:link', optionalAuth, proposalCtrl.getProposalByLink);
proposalRouter.put('/:id', auth, proposalCtrl.updateProposal);
proposalRouter.post('/:id/accept', auth, proposalCtrl.acceptProposal);
proposalRouter.post('/:id/reject', auth, proposalCtrl.rejectProposal);

// routes/projects.js
const projectRouter = express.Router();
const projectCtrl = require('../controllers/projectController');

projectRouter.get('/', auth, projectCtrl.getMyProjects);
projectRouter.get('/:id', auth, projectCtrl.getProject);
projectRouter.post('/:id/updates', auth, projectCtrl.addUpdate);
projectRouter.post('/:id/milestones/:milestoneId/approve', auth, projectCtrl.approveMilestone);
projectRouter.post('/:id/milestones/:milestoneId/reject', auth, projectCtrl.requestRevision);
projectRouter.post('/:id/cancel', auth, projectCtrl.cancelProject);

// routes/payments.js
const paymentRouter = express.Router();
const paymentCtrl = require('../controllers/paymentController');

paymentRouter.post('/project/:projectId/initiate', auth, paymentCtrl.initiatePayment);
paymentRouter.post('/:id/release', auth, paymentCtrl.releasePayment);
paymentRouter.get('/balance', auth, paymentCtrl.getBalance);
paymentRouter.post('/withdraw', auth, paymentCtrl.requestWithdrawal);

// routes/disputes.js
const disputeRouter = express.Router();
const disputeCtrl = require('../controllers/disputeController');
const { requireRole } = require('../middleware/auth');

disputeRouter.post('/', auth, disputeCtrl.openDispute);
disputeRouter.get('/', auth, disputeCtrl.getMyDisputes);
disputeRouter.get('/:id', auth, disputeCtrl.getDispute);
disputeRouter.post('/:id/messages', auth, disputeCtrl.sendDisputeMessage);
disputeRouter.post('/:id/resolve', auth, requireRole('admin', 'mediator'), disputeCtrl.resolveDispute);

// routes/admin.js
const adminRouter = express.Router();
const adminCtrl = require('../controllers/adminController');

adminRouter.use(auth);
adminRouter.use(requireRole('admin', 'mediator', 'support'));

adminRouter.get('/dashboard', requireRole('admin'), adminCtrl.getDashboard);
adminRouter.get('/users', adminCtrl.getUsers);
adminRouter.patch('/users/:id/status', requireRole('admin'), adminCtrl.updateUserStatus);
adminRouter.get('/transactions', adminCtrl.getTransactions);
adminRouter.get('/fraud-alerts', adminCtrl.getFraudAlerts);
adminRouter.get('/withdrawal-requests', adminCtrl.getWithdrawalRequests);
adminRouter.patch('/withdrawal-requests/:id', requireRole('admin'), adminCtrl.processWithdrawal);
adminRouter.get('/audit-logs', requireRole('admin'), adminCtrl.getAuditLogs);
adminRouter.get('/disputes', requireRole('admin', 'mediator'), disputeCtrl.getAllDisputes);
adminRouter.patch('/disputes/:id/assign', requireRole('admin'), disputeCtrl.assignMediator);

// routes/messages.js
const messageRouter = express.Router();
const messageCtrl = require('../controllers/messageController');

messageRouter.get('/project/:projectId', auth, messageCtrl.getProjectMessages);
messageRouter.post('/project/:projectId', auth, messageCtrl.sendMessage);
messageRouter.patch('/project/:projectId/read', auth, messageCtrl.markAsRead);

// routes/notifications.js
const notificationRouter = express.Router();
const notifCtrl = require('../controllers/notificationController');

notificationRouter.get('/', auth, notifCtrl.getNotifications);
notificationRouter.patch('/:id/read', auth, notifCtrl.markRead);
notificationRouter.patch('/read-all', auth, notifCtrl.markAllRead);

// routes/reviews.js
const reviewRouter = express.Router();
const reviewCtrl = require('../controllers/reviewController');

reviewRouter.post('/', auth, reviewCtrl.createReview);
reviewRouter.get('/user/:userId', reviewCtrl.getUserReviews);

// routes/webhooks.js
const webhookRouter = express.Router();
const { mercadoPagoWebhook, stripeWebhook } = require('../controllers/paymentController');

webhookRouter.post('/mercadopago', mercadoPagoWebhook);
webhookRouter.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

// Exportações para uso no server.js
module.exports = router; // auth router (default)
module.exports.proposals = proposalRouter;
module.exports.projects = projectRouter;
module.exports.payments = paymentRouter;
module.exports.disputes = disputeRouter;
module.exports.admin = adminRouter;
module.exports.messages = messageRouter;
module.exports.notifications = notificationRouter;
module.exports.reviews = reviewRouter;
module.exports.webhooks = webhookRouter;
