const Graduate = require('../models/Graduate');

// GET all graduates
const getAllGraduates = async (req, res) => {
  try {
    const graduates = await Graduate.find().sort({ name: 1 });
    res.status(200).json(graduates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET single graduate by ID
const getGraduateById = async (req, res) => {
  try {
    const graduate = await Graduate.findById(req.params.id);
    if (!graduate) {
      return res.status(404).json({ message: 'Graduate not found' });
    }
    res.status(200).json(graduate);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST create new graduate (admin only)
const createGraduate = async (req, res) => {
  try {
    const { name, photo, currentRole, testimonial, cohort } = req.body;

    if (!name || !currentRole || !testimonial || !cohort) {
      return res.status(400).json({ message: 'Please provide name, currentRole, testimonial and cohort' });
    }

    const graduate = await Graduate.create({
      name,
      photo,
      currentRole,
      testimonial,
      cohort,
    });

    res.status(201).json(graduate);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH update graduate (admin only)
const updateGraduate = async (req, res) => {
  try {
    const { name, photo, currentRole, testimonial } = req.body;

    const graduate = await Graduate.findByIdAndUpdate(
      req.params.id,
      { name, photo, currentRole, testimonial },
      { new: true, runValidators: true }
    );

    if (!graduate) {
      return res.status(404).json({ message: 'Graduate not found' });
    }

    res.status(200).json(graduate);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE graduate (admin only)
const deleteGraduate = async (req, res) => {
  try {
    const graduate = await Graduate.findByIdAndDelete(req.params.id);
    if (!graduate) {
      return res.status(404).json({ message: 'Graduate not found' });
    }
    res.status(200).json({ message: 'Graduate deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllGraduates,
  getGraduateById,
  createGraduate,
  updateGraduate,
  deleteGraduate,
};