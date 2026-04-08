const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/paymentController');

router.post('/project/:projectId/initiate', authenticate, ctrl.initiatePayment);
router.post('/:id/release', authenticate, requireRole('admin', 'mediator'), ctrl.releasePayment);
router.get('/balance', authenticate, ctrl.getBalance);
router.post('/withdraw', authenticate, ctrl.requestWithdrawal);

module.exports = router;
