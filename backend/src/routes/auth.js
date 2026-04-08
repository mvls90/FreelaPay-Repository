const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const ctrl = require('../controllers/authController');

router.post('/register', [
  body('full_name').trim().isLength({ min: 3 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('type').isIn(['freelancer', 'client']),
  validate,
], ctrl.register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
], ctrl.login);

router.post('/refresh', ctrl.refreshToken);
router.post('/verify-email', ctrl.verifyEmail);
router.post('/forgot-password', [body('email').isEmail(), validate], ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);
router.post('/setup-2fa', authenticate, ctrl.setup2FA);
router.post('/confirm-2fa', authenticate, ctrl.confirm2FA);

module.exports = router;
