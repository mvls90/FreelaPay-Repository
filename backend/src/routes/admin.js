const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');
const disputeCtrl = require('../controllers/disputeController');

router.use(authenticate);
router.use(requireRole('admin', 'mediator', 'support'));

router.get('/dashboard', requireRole('admin'), ctrl.getDashboard);
router.get('/users', ctrl.getUsers);
router.patch('/users/:id/status', requireRole('admin'), ctrl.updateUserStatus);
router.get('/transactions', ctrl.getTransactions);
router.get('/fraud-alerts', ctrl.getFraudAlerts);
router.get('/withdrawal-requests', ctrl.getWithdrawalRequests);
router.patch('/withdrawal-requests/:id', requireRole('admin'), ctrl.processWithdrawal);
router.get('/audit-logs', requireRole('admin'), ctrl.getAuditLogs);
router.get('/disputes', requireRole('admin', 'mediator'), disputeCtrl.getAllDisputes);
router.patch('/disputes/:id/assign', requireRole('admin'), disputeCtrl.assignMediator);

module.exports = router;
