const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getAllCohorts,
  getCohortById,
  createCohort,
  getBannerStatus,
  updateCohortStatus,
  deleteCohort,
} = require('../controllers/cohort');

// Public routes
router.get('/', getAllCohorts);
router.get('/banner', getBannerStatus);
router.get('/:id', getCohortById);

// Admin only routes
router.post('/', authMiddleware, createCohort);
router.patch('/:id/status', authMiddleware, updateCohortStatus);
router.delete('/:id', authMiddleware, deleteCohort);

module.exports = router;