const Cohort = require('../models/Cohort');
const getCohortStatus = require('../utils/cohortStatus');
const Graduate = require('../models/Graduate');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { validationResult } = require('express-validator');

// GET all cohorts
const getAllCohorts = catchAsync(async (req, res) => {
  const cohorts = await Cohort.find().sort({ cohortNumber: -1 });
  res.status(200).json(cohorts);
});

// GET single cohort by ID
const getCohortById = catchAsync(async (req, res) => {
  const cohort = await Cohort.findById(req.params.id);
  if (!cohort) {
    throw new AppError('Cohort not found', 404);
  }
  const graduates = await Graduate.find({ cohort: req.params.id });
  res.status(200).json({ ...cohort.toObject(), graduates });
});

// POST create new cohort (admin only)
const createCohort = catchAsync(async (req, res) => {
    const errors = validationResult(req);
if (!errors.isEmpty()) {
  throw new AppError(errors.array()[0].msg, 400);
}
  const { cohortNumber, startDate } = req.body;

  if (!cohortNumber || !startDate) {
    throw new AppError('Please provide cohortNumber and startDate', 400);
  }

  const existingCohort = await Cohort.findOne({ cohortNumber });
  if (existingCohort) {
    throw new AppError('Cohort number already exists', 400);
  }

  const cohort = await Cohort.create({ cohortNumber, startDate });
  res.status(201).json(cohort);
});

// PATCH update cohort status (admin only)
const updateCohortStatus = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { status } = req.body;

  if (!status) {
    throw new AppError('Please provide a status', 400);
  }

  const cohort = await Cohort.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!cohort) {
    throw new AppError('Cohort not found', 404);
  }

  res.status(200).json(cohort);
});

// DELETE cohort (admin only)
const deleteCohort = catchAsync(async (req, res) => {
  const graduatesCount = await Graduate.countDocuments({ cohort: req.params.id });
  if (graduatesCount > 0) {
    throw new AppError('Cannot delete: There are graduates assigned to this cohort.', 400);
  }

  const cohort = await Cohort.findByIdAndDelete(req.params.id);
  if (!cohort) {
    throw new AppError('Cohort not found', 404);
  }
  res.status(200).json({ message: 'Cohort deleted successfully' });
});

// GET banner status
const getBannerStatus = catchAsync(async (req, res) => {
  const message = await getCohortStatus();
  res.status(200).json({ message });
});

module.exports = {
  getAllCohorts,
  getCohortById,
  createCohort,
  getBannerStatus,
  updateCohortStatus,
  deleteCohort,
};