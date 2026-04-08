const express = require('express');
const router = express.Router();
const { mercadoPagoWebhook, stripeWebhook } = require('../controllers/paymentController');

router.post('/mercadopago', express.json(), mercadoPagoWebhook);
router.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;
