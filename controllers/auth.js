const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sanitize = require('mongo-sanitize');
const { validationResult } = require('express-validator');

const loginAdmin = catchAsync(async (req, res) => {
    const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }
const email = sanitize(req.body.email);
const password = sanitize(req.body.password);

  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = jwt.sign(
    { id: admin._id, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(200).json({
    message: 'Login successful',
    token,
  });
});

module.exports = { loginAdmin };