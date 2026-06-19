const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student');

router.post('/redeem', studentController.redeemAccessCode);

module.exports = router;