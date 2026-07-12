const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sanitize = require('mongo-sanitize');
const { validationResult } = require('express-validator');
const config = require('../config');
const { Resend } = require('resend');

const Admin = require('../models/admin');
const OTP = require('../models/OTP');
const AccessCode = require('../models/AccessCode');
const Student = require('../models/Student');
const Applicant = require('../models/Applicant');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const resend = new Resend(process.env.RESEND_API_KEY);

// ==========================================
// DEV 2: ADMIN LOGIN
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
//Find Admin
  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw new AppError('Invalid credentials', 401);
  }
//Verify password
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }
// Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

// Delete any existing OTPs for this admin
  await OTP.deleteMany({ admin: admin._id });

// Save the new OTP(expires in 5 minutes)
  const otp = new OTP({
    admin: admin._id,
    otp: otpCode,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
  });

  await otp.save();

//send OTP via email
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: admin.email,
    subject: 'Your Login OTP',
    html: `
      <h2>Admin Login Verification</h2>
      <p>Your OTP code is:</p>
      <h1 style="letter-spacing: 8px;">${otpCode}</h1>
      <p>This code expires in <strong>5 minutes</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
    `
  });

  res.status(200).json({
    message: 'OTP sent to your email. Please verify to continue.',
    adminId: admin._id
  });
});

// ==========================================
// DEV 2: VERIFY ADMIN OTP
// ==========================================
const verifyAdminOTP = catchAsync(async (req, res) => {
  const { adminId, otp } = req.body;

  if (!adminId || !otp) {
    throw new AppError('AdminId and OTP are required', 400);
  }

//Find the OTP record
const otpRecord = await OTP.findOne({
   admin: adminId,
   otp 
  });

  
if (!otpRecord) {
  throw new AppError('Invalid or expired OTP', 400);
}

//Check if OTP has expired
if (otpRecord.expiresAt < Date.now()) {
  await OTP.deleteOne({ _id: otpRecord._id });
  throw new AppError('OTP has expired', 400);
}
//Make sure the admin still exists
const admin = await Admin.findById(adminId);

if (!admin) {
  throw new AppError('Admin not found', 404);
}

//delete OTP so it cannot be reused
await OTP.deleteOne({ _id: otpRecord._id });

const token = jwt.sign(
  { 
    id: admin._id,
    role: 'admin' 
  },
  config.jwtSecret,
  { 
    expiresIn: config.jwtExpiresIn
   }
);

res.status(200).json({
  success: true,
  message: 'Login successful.',
  token
});
});

// ==========================================
// DEV 1: REDEEM ACCESS CODE (LMS BRIDGE)
// ==========================================
const redeemAccessCode = async (req, res) => {
  try {
    const { accessCode, password } = req.body;

    // 1. Force the code to uppercase to prevent case-sensitive typos
    const formattedCode = accessCode.toUpperCase().trim();

    // 2. Find the code in the database and make sure it hasn't been used
    const validCode = await AccessCode.findOne({ 
      code: formattedCode, 
      isUsed: false 
    }).populate('applicant'); 

    if (!validCode) {
      return res.status(400).json({ 
        error: 'Invalid or expired access code.' 
      });
    }

    // 3. Create the official Student account
    const newStudent = new Student({
      fullName: validCode.applicant.fullName,
      email: validCode.applicant.email,
      password: password, 
      cohort: validCode.cohort
    });
    await newStudent.save();

    // 4. Burn the Access Code so it can never be used again
    validCode.isUsed = true;
    validCode.usedAt = new Date();
    await validCode.save();

    // 5. Generate the JWT
    const token = jwt.sign(
      { studentId: newStudent._id, role: newStudent.role },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    // ==========================================
    // DEV 3 FEATURE: Dispatch background sync job
    // ==========================================
    await lmsSyncQueue.add('syncNewStudent', {
        studentId: newStudent._id,
        fullName: newStudent.fullName,
        email: newStudent.email,
        cohortId: validCode.cohort
    }, {
        attempts: 3, // Auto-retry 3 times if external LMS API fails
        backoff: {
            type: 'exponential',
            delay: 5000 // Wait 5s before first retry, then 10s, 20s...
        }
    });

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

// Unified Exports
module.exports = { 
    loginAdmin,
    verifyAdminOTP,
    redeemAccessCode 
};