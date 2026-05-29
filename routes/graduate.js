const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const {
  getAllGraduates,
  getGraduateById,
  createGraduate,
  updateGraduate,
  deleteGraduate
} = require('../controllers/graduate');

// Public routes
router.get('/', getAllGraduates);
router.get('/:id', getGraduateById);

// Admin only routes
router.post(
  '/',
  authMiddleware,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('currentRole').notEmpty().withMessage('Current role is required'),
    body('testimonial').notEmpty().withMessage('Testimonial is required'),
    body('cohort').isMongoId().withMessage('Please provide a valid cohort ID'),
  ],
  createGraduate
);
router.patch('/:id', authMiddleware, updateGraduate);
router.delete('/:id', authMiddleware, deleteGraduate);

module.exports = router;