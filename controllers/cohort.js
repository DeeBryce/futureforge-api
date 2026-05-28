const Cohort = require('../models/Cohort');
const getCohortStatus = require('../utils/cohortStatus');
const Graduate = require('../models/Graduate');

// GET all cohorts
const getAllCohorts = async (req, res) => {
  try {
    const cohorts = await Cohort.find().sort({ cohortNumber: -1 });
    res.status(200).json(cohorts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET single cohort by ID
const getCohortById = async (req, res) => {
  try {
    const cohort = await Cohort.findById(req.params.id);
    if (!cohort) {
      return res.status(404).json({ message: 'Cohort not found' });
    }

    const graduates = await Graduate.find({ cohort: req.params.id });

    res.status(200).json({ ...cohort.toObject(), graduates });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST create new cohort (admin only)
const createCohort = async (req, res) => {
  try {
    const { cohortNumber, startDate } = req.body;

    if (!cohortNumber || !startDate) {
      return res.status(400).json({ message: 'Please provide cohortNumber and startDate' });
    }

    const existingCohort = await Cohort.findOne({ cohortNumber });
    if (existingCohort) {
      return res.status(400).json({ message: 'Cohort number already exists' });
    }

    const cohort = await Cohort.create({ cohortNumber, startDate });
    res.status(201).json(cohort);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH update cohort status (admin only)
const updateCohortStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Please provide a status' });
    }

    const cohort = await Cohort.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!cohort) {
      return res.status(404).json({ message: 'Cohort not found' });
    }

    res.status(200).json(cohort);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE cohort (admin only)
const deleteCohort = async (req, res) => {
  try {
    const cohort = await Cohort.findByIdAndDelete(req.params.id);
    if (!cohort) {
      return res.status(404).json({ message: 'Cohort not found' });
    }
    res.status(200).json({ message: 'Cohort deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getBannerStatus = async (req, res) => {
  try {
    const message = await getCohortStatus();
    res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllCohorts,
  getCohortById,
  createCohort,
  getBannerStatus,
  updateCohortStatus,
  deleteCohort,
};