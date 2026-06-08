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

module.exports = { loginAdmin };const jwt = require('jsonwebtoken');
const AccessCode = require('../models/AccessCode');
const Student = require('../models/Student');
const Applicant = require('../models/Applicant');

exports.redeemAccessCode = async (req, res) => {
    try {
        const { accessCode, password } = req.body;

        // 1. Force the code to uppercase to prevent case-sensitive typos
        const formattedCode = accessCode.toUpperCase().trim();

        // 2. Find the code in the database and make sure it hasn't been used
        const validCode = await AccessCode.findOne({ 
            code: formattedCode, 
            isUsed: false 
        }).populate('applicant'); // Pull in the applicant data to get their name/email

        if (!validCode) {
            return res.status(400).json({ 
                error: 'Invalid or expired access code.' 
            });
        }

        // 3. Create the official Student account
        const newStudent = new Student({
            fullName: validCode.applicant.fullName,
            email: validCode.applicant.email,
            password: password, // The Student schema automatically hashes this!
            cohort: validCode.cohort
        });
        await newStudent.save();

        // 4. Burn the Access Code so it can never be used again
        validCode.isUsed = true;
        validCode.usedAt = new Date();
        await validCode.save();

        // 5. Generate the JWT (The "Key" to the LMS)
        const token = jwt.sign(
            { studentId: newStudent._id, role: newStudent.role },
            process.env.JWT_SECRET, // Make sure this is in your .env file!
            { expiresIn: '30d' } // Keeps them logged in for 30 days
        );

        // 6. Send them across the bridge!
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