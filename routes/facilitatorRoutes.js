const express = require('express');
const router = express.Router();
const { getAllFacilitators } = require('../controllers/facilitatorController');

// This resolves to GET /api/facilitators
router.get('/', getAllFacilitators);

module.exports = router;