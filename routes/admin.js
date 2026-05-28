const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getMe, getAdmins, changePassword, createAdmin, deleteAdmin} = require('../controllers/admin');

router.get('/', authMiddleware, getAdmins);
router.get('/me', authMiddleware, getMe);
router.patch('/password', authMiddleware, changePassword);
router.post('/', authMiddleware, createAdmin);
router.delete('/:id', authMiddleware, deleteAdmin);

module.exports = router;