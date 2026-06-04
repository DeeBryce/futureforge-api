const express = require('express');
const router = express.Router();

// Import the controller we just built
const authController = require('../controllers/auth');

// POST: /api/auth/redeem
// Public route - Converts an access code into a real Student account
router.post('/redeem', authController.redeemAccessCode);

module.exports = router;