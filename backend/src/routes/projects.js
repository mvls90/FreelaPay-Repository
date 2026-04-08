const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/projectController');

router.get('/', authenticate, ctrl.getMyProjects);
router.get('/:id', authenticate, ctrl.getProject);
router.post('/:id/updates', authenticate, ctrl.addUpdate);
router.post('/:id/milestones/:milestoneId/approve', authenticate, ctrl.approveMilestone);
router.post('/:id/milestones/:milestoneId/reject', authenticate, ctrl.requestRevision);
router.post('/:id/cancel', authenticate, ctrl.cancelProject);

module.exports = router;
