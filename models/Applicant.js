const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
    // --- PERSONAL INFORMATION ---
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [3, 'Name must be at least 3 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'] 
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    whatsappNumber: {
        type: String,
        required: [true, 'WhatsApp number is required'],
        trim: true,
        match: [/^\+?[0-9]{10,15}$/, 'Please provide a valid WhatsApp number']
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say']
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
    },
    highestEducation: {
        type: String,
        required: [true, 'Highest level of education is required'],
        enum: ['SSCE', 'OND', 'HND', 'BSc', 'MSc', 'PhD', 'Other']
    },

    // --- PROGRAMME INFORMATION ---
    areaOfInterest: {
        type: String,
        required: [true, 'Area of interest is required'],
        enum: ['Frontend', 'Backend', 'Product Design', 'Product Management', 'Quality Assurance', 'Other'] 
    },
    levelOfExperience: {
        type: String,
        required: [true, 'Level of experience is required'],
        enum: ['Beginner', 'Intermediate', 'Advanced']
    },
    reasonForJoining: {
        type: String,
        required: [true, 'Please tell us why you want to join'],
        trim: true,
        minlength: [20, 'Reason must be at least 20 characters'],
        maxlength: [1000, 'Reason cannot exceed 1000 characters']
    },
    linkedInProfile: {
        type: String,
        trim: true,
        match: [/^https:\/\/(www\.)?linkedin\.com\/.*$/, 'Please provide a valid LinkedIn URL'],
        default: null
    },

    // --- AGREEMENTS & CONSENT ---
    agreedToFee: {
        type: Boolean,
        required: [true, 'You must agree to the non-refundable fee'],
        validate: {
            validator: function(v) { return v === true; },
            message: 'You must agree to the non-refundable fee to proceed'
        }
    },
    agreedToTerms: {
        type: Boolean,
        required: [true, 'You must agree to the Terms and Conditions'],
        validate: {
            validator: function(v) { return v === true; },
            message: 'You must agree to the Terms and Conditions'
        }
    },
    consentedToPrivacy: {
        type: Boolean,
        required: [true, 'You must consent to Privacy and Data collection'],
        validate: {
            validator: function(v) { return v === true; },
            message: 'You must consent to Privacy and Data collection'
        }
    },

    // --- INTERNAL SYSTEM STATE ---
    hasPaid: {
        type: Boolean,
        default: false 
    },
    paymentReference: {
        type: String,
        default: null 
    },
    accessCodeUsed: {
        type: String,
        default: null 
    },
    cohortId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cohort',
        required: true 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Applicant', applicantSchema);