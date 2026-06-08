require('dotenv').config();
const mongoose = require('mongoose');

// Import your models
const Applicant = require('./models/Applicant');
const AccessCode = require('./models/AccessCode');
const Student = require('./models/Student');

const resetDatabase = async () => {
    try {
        console.log('🔄 Connecting to Database...');
        await mongoose.connect(process.env.MONGO_URI);

        console.log('🗑️  Clearing testing collections...');
        
        // Delete all documents in these specific collections
        await Applicant.deleteMany({});
        await AccessCode.deleteMany({});
        await Student.deleteMany({});

        console.log('✅ Database successfully reset!');
        console.log('⚠️  Note: Cohorts were intentionally kept alive for webhook testing.');
        
        process.exit();
    } catch (error) {
        console.error('❌ Error resetting database:', error);
        process.exit(1);
    }
};

resetDatabase();