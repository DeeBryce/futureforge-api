const mongoose = require('mongoose');

const cohortSchema = new mongoose.Schema({
  name: { type: String, default: 'Mock Cohort' },
  cohortNumber: { type: Number, default: 1 },
  status: { type: String, default: 'open' } // This is what your webhook is searching for!
});

module.exports = mongoose.model('Cohort', cohortSchema);