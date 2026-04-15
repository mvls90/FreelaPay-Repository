const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getContract, signContract } = require('../controllers/contractController');

router.get('/:projectId', authenticate, getContract);
router.post('/:id/sign', authenticate, signContract);

module.exports = router;
