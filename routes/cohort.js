const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getAllCohorts,
  getCohortById,
  createCohort,
  updateCohortStatus,
  deleteCohort,
} = require('../controllers/cohort');

// Public routes
router.get('/', getAllCohorts);
router.get('/:id', getCohortById);

// Admin only routes
router.post('/', authMiddleware, createCohort);
router.patch('/:id/status', authMiddleware, updateCohortStatus);
router.delete('/:id', authMiddleware, deleteCohort);

module.exports = router;