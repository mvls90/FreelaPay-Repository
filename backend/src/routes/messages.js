const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/messageController');

router.get('/project/:projectId', authenticate, ctrl.getProjectMessages);
router.post('/project/:projectId', authenticate, ctrl.sendMessage);
router.patch('/project/:projectId/read', authenticate, ctrl.markAsRead);

module.exports = router;
