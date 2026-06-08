const mongoose = require('mongoose');

const accessCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true, // Prevents case-sensitivity bugs (e.g., forcing "ff-x79kl" to "FF-X79KL")
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Applicant',
    required: true,
    unique: true, // Guarantees one applicant can only ever be assigned one code
  },
  cohort: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cohort',
    required: true, // Tracks which specific cohort this code unlocks
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  usedAt: {
    type: Date, // Helpful for admins to see exactly when someone activated their account
  }
}, { timestamps: true });

module.exports = mongoose.model('AccessCode', accessCodeSchema);