const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/applicant');
const authMiddleware = require('../middlewares/authMiddleware');

// Public route: Students registering
router.post('/register', applicantController.registerApplicant);

// Public route: Paystack sending data behind the scenes
router.post('/webhook/payment', applicantController.handlePaymentWebhook);

// Protected route: Admins viewing the data
router.get('/', authMiddleware, applicantController.getApplicants);

module.exports = router;