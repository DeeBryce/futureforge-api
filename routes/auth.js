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

router.post('/login', loginLimiter, [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
], loginAdmin);

module.exports = router;const express = require('express');
const router = express.Router();

// 1. Import the logic from the controller file we just checked
const authController = require('../controllers/auth');

// 2. Connect the URL route to the controller logic
router.post('/redeem', authController.redeemAccessCode);

// 3. Export the Router so app.js can use it without crashing!
module.exports = router;