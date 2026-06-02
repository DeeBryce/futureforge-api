const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/applicant');

// These URLs will actually be prefixed with /api/applicants in app.js
router.post('/register', applicantController.registerApplicant);
router.post('/webhook/payment', applicantController.handlePaymentWebhook);

module.exports = router;