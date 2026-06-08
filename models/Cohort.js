const mongoose = require('mongoose');

const CohortSchema = new mongoose.Schema({
  cohortNumber: {
    type: Number,
    required: true,
    unique: true
  },
  startDate: {
    type: Date,
    required: true,
  },
    status: {
    type: String,
    enum: ['open', 'ongoing', 'completed'],
    default: 'open',
  },
}, { timestamps: true });


module.exports = mongoose.model('Cohort', CohortSchema);