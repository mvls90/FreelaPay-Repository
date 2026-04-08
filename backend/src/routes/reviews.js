const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/reviewController');

router.post('/', authenticate, ctrl.createReview);
router.get('/user/:userId', ctrl.getUserReviews);

module.exports = router;
