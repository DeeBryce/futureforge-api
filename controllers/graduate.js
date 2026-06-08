const Graduate = require('../models/Graduate');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { validationResult } = require('express-validator');

const getAllGraduates = catchAsync(async (req, res) => {
  const graduates = await Graduate.find().sort({ name: 1 });
  res.status(200).json(graduates);
});

const getGraduateById = catchAsync(async (req, res) => {
  const graduate = await Graduate.findById(req.params.id);
  if (!graduate) {
    throw new AppError('Graduate not found', 404);
  }
  res.status(200).json(graduate);
});

const createGraduate = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }
  const { name, photo, currentRole, testimonial, cohort } = req.body;

  if (!name || !currentRole || !testimonial || !cohort) {
    throw new AppError('Please provide name, currentRole, testimonial and cohort', 400);
  }

  const graduate = await Graduate.create({
    name,
    photo,
    currentRole,
    testimonial,
    cohort,
  });

  res.status(201).json(graduate);
});

const updateGraduate = catchAsync(async (req, res) => {
  const { name, photo, currentRole, testimonial } = req.body;

  const graduate = await Graduate.findByIdAndUpdate(
    req.params.id,
    { name, photo, currentRole, testimonial },
    { new: true, runValidators: true }
  );

  if (!graduate) {
    throw new AppError('Graduate not found', 404);
  }

  res.status(200).json(graduate);
});

const deleteGraduate = catchAsync(async (req, res) => {
  const graduate = await Graduate.findByIdAndDelete(req.params.id);
  if (!graduate) {
    throw new AppError('Graduate not found', 404);
  }
  res.status(200).json({ message: 'Graduate deleted successfully' });
});

module.exports = {
  getAllGraduates,
  getGraduateById,
  createGraduate,
  updateGraduate,
  deleteGraduate,
};