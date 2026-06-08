const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { body } = require('express-validator');
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
router.post(
  '/',
  authMiddleware,
  [
    body('cohortNumber').isInt().withMessage('Cohort number must be a number'),
    body('startDate').notEmpty().isDate().withMessage('Please provide a valid start date'),
    body('endDate').optional().isDate().withMessage('Please provide a valid end date'),
  ],
  createCohort
);

router.patch(
  '/:id/status',
  authMiddleware,
  [
    body('status')
      .isIn(['open', 'ongoing', 'completed'])
      .withMessage('Status must be open, ongoing, or completed'),
  ],
  updateCohortStatus
);

router.delete('/:id', authMiddleware, deleteCohort);

module.exports = router;