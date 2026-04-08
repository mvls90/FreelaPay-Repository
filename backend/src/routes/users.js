const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/userController');

router.get('/me', authenticate, ctrl.getMe);
router.put('/me', authenticate, ctrl.updateMe);
router.post('/me/change-password', authenticate, ctrl.changePassword);
router.get('/:id', ctrl.getPublicProfile);

module.exports = router;
