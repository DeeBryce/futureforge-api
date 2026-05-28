const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
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
router.post('/', authMiddleware, createGraduate);
router.patch('/:id', authMiddleware, updateGraduate);
router.delete('/:id', authMiddleware, deleteGraduate);

module.exports = router;