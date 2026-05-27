const mongoose = require('mongoose');

const GraduateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
  currentRole: {
    type: String,
    required: true,
  },
  testimonial: {
    type: String,
    required: true,
  },
    cohort: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cohort',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Graduate', GraduateSchema);