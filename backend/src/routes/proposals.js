const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const ctrl = require('../controllers/proposalController');

router.post('/', authenticate, ctrl.createProposal);
router.get('/', authenticate, ctrl.getMyProposals);
router.get('/link/:link', optionalAuth, ctrl.getProposalByLink);
router.put('/:id', authenticate, ctrl.updateProposal);
router.post('/:id/accept', authenticate, ctrl.acceptProposal);
router.post('/:id/reject', authenticate, ctrl.rejectProposal);

module.exports = router;
