const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { loginAdmin } = require('../controllers/auth');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, please try again later' }
});

const router = express.Router();


// Import the controller we just built
const authController = require('../controllers/auth');


router.post('/login', loginLimiter, [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
], loginAdmin);

router.post('/redeem', authController.redeemAccessCode);

module.exports = router;