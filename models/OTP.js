const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    otp: {
        type: String,
        required: true,
        trim: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', OTPSchema);