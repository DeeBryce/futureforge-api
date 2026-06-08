const mongoose = require('mongoose');

const cohortSchema = new mongoose.Schema({
  name: { type: String, default: 'FutureForge Alpha (Mock)' },
  cohortNumber: { type: Number, default: 1 },
  status: { type: String, default: 'open' }
});

// Export it as a real Mongoose model so your controller can use .findOne()
module.exports = mongoose.models.Cohort || mongoose.model('Cohort', cohortSchema);