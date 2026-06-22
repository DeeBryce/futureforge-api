const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sanitize = require('mongo-sanitize');
const { validationResult } = require('express-validator');

const Admin = require('../models/admin');
const AccessCode = require('../models/AccessCode');
const Student = require('../models/Student');
const Applicant = require('../models/Applicant');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// ==========================================
// DEV 2: Admin Login
// ==========================================
const loginAdmin = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const email = sanitize(req.body.email).toLowerCase().trim();
  const password = req.body.password;

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

// ==========================================
// DEV 1: Redeem Access Code (LMS Bridge)
// ==========================================
const redeemAccessCode = async (req, res) => {
  try {
    const { accessCode, password } = req.body;

    const formattedCode = accessCode.toUpperCase().trim();

    const validCode = await AccessCode.findOne({ 
      code: formattedCode, 
      isUsed: false 
    }).populate('applicant'); 

    if (!validCode) {
      return res.status(400).json({ 
        error: 'Invalid or expired access code.' 
      });
    }

    const newStudent = new Student({
      fullName: validCode.applicant.fullName,
      email: validCode.applicant.email,
      password: password, 
      cohort: validCode.cohort
    });
    await newStudent.save();

    validCode.isUsed = true;
    validCode.usedAt = new Date();
    await validCode.save();

    const token = jwt.sign(
      { studentId: newStudent._id, role: newStudent.role },
      process.env.JWT_SECRET, 
      { expiresIn: '30d' } 
    );

    return res.status(201).json({
      message: 'Account activated successfully! Welcome to the LMS.',
      token: token,
      student: {
        id: newStudent._id,
        name: newStudent.fullName,
        email: newStudent.email
      }
    });

  } catch (error) {
    console.error('Redeem Code Error:', error);
    res.status(500).json({ error: 'Server error during activation.' });
  }
};

// Unified export object ensures both functions are visible to the router
module.exports = { 
  loginAdmin, 
  redeemAccessCode 
};