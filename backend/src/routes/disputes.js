const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/disputeController');

router.post('/', authenticate, ctrl.openDispute);
router.get('/', authenticate, ctrl.getMyDisputes);
router.get('/:id', authenticate, ctrl.getDispute);
router.post('/:id/messages', authenticate, ctrl.sendDisputeMessage);
router.post('/:id/resolve', authenticate, requireRole('admin', 'mediator'), ctrl.resolveDispute);

module.exports = router;
