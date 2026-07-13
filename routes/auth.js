const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const authController = require('../controllers/auth');

const router = express.Router();

// ==========================================
// SECURITY RATE LIMITERS
// ==========================================

// Protect admin login from brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    message: 'Too many login attempts. Please try again in 15 minutes.'
  }
});

// Protect OTP verification from brute-force attacks
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    message: 'Too many OTP verification attempts. Please try again in 15 minutes.'
  }
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

// DEV 2: Admin Login
// POST /api/auth/login
// ==========================================
router.post(
  '/login',
  loginLimiter,
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email'),

    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  authController.loginAdmin
);
// DEV 2: Verify Admin OTP Route
// URL: /api/auth/verify-admin-otp
router.post(
  '/verify-otp',
  otpLimiter,
  [
    body('admin').notEmpty().withMessage('Admin ID is required'),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits')
      .isNumeric()
      .withMessage('OTP must contain only numbers'),
  ],
  authController.verifyAdminOTP
);

// DEV 1: LMS Access Code Redemption Route
// URL: /api/auth/redeem
router.post('/redeem', redeemLimiter, authController.redeemAccessCode);

module.exports = router;