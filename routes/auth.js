const express = require('express');
const router = express.Router();

// 1. Import the logic from the controller file we just checked
const authController = require('../controllers/auth');

// 2. Connect the URL route to the controller logic
router.post('/redeem', authController.redeemAccessCode);

// 3. Export the Router so app.js can use it without crashing!
module.exports = router;