const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // To securely hash their password

const studentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  cohort: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cohort',
    required: true, // Links them to Dev 2's curriculum 
  },
  role: {
    type: String,
    default: 'student', // Good for future-proofing if Dev 2 adds mentors
  }
}, { timestamps: true });

// Mongoose Middleware: Automatically hash the password before saving
studentSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  // Mongoose automatically moves on when this async function finishes!
});

module.exports = mongoose.model('Student', studentSchema);