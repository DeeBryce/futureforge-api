const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const authController = require('../controllers/auth');

const router = express.Router();

// ==========================================
// SECURITY RATE LIMITERS
// ==========================================

// Dev 2: Protect admin login from brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: { message: 'Too many login attempts, please try again later' }
});

// Dev 1/3 Security Hardening: Protect access codes from brute-force guessing
const redeemLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Strictly limit to 5 code redemption attempts per window
  message: { error: 'Too many redemption attempts. Please try again in 15 minutes.' }
});

// ==========================================
// ROUTES
// ==========================================

// DEV 2: Admin Login Route
// URL: /api/auth/login
router.post('/login', loginLimiter, [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
], authController.loginAdmin);

// DEV 1: LMS Access Code Redemption Route
// URL: /api/auth/redeem
router.post('/redeem', redeemLimiter, authController.redeemAccessCode);

module.exports = router;