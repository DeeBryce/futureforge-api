const bcrypt = require('bcrypt');
const Admin = require('../models/admin');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const getMe = catchAsync(async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select('-password');
  if (!admin) {
    throw new AppError('Admin not found', 404);
  }
  res.status(200).json(admin);
});

const getAdmins = catchAsync(async (req, res) => {
  const admins = await Admin.find().select('-password');
  res.status(200).json(admins);
});

const createAdmin = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  const sanitizedEmail = email.toLowerCase().trim();

  const existingAdmin = await Admin.findOne({ email: sanitizedEmail });
  if (existingAdmin) {
    throw new AppError('Admin with this email already exists', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await Admin.create({ email: sanitizedEmail, password: hashedPassword });

  res.status(201).json({
    _id: admin._id,
    email: admin.email,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Please provide current and new password', 400);
  }

  const admin = await Admin.findById(req.admin.id);
  if (!admin) {
    throw new AppError('Admin not found', 404);
  }

  const isMatch = await bcrypt.compare(currentPassword, admin.password);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  admin.password = await bcrypt.hash(newPassword, 10);
  await admin.save();

  res.status(200).json({ message: 'Password updated successfully' });
});

const deleteAdmin = catchAsync(async (req, res) => {
  const admin = await Admin.findByIdAndDelete(req.params.id);
  if (!admin) {
    throw new AppError('Admin not found', 404);
  }
  res.status(200).json({ message: 'Admin deleted successfully' });
});

module.exports = {
  getMe,
  getAdmins,
  createAdmin,
  changePassword,
  deleteAdmin,
};