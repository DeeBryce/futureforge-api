require('dotenv').config();
const mongoose = require('mongoose');

// Define the schema directly in the script to guarantee it works
const mockCohortSchema = new mongoose.Schema({
  name: { type: String, default: 'FutureForge Alpha (Mock)' },
  cohortNumber: { type: Number, default: 1 },
  status: { type: String, default: 'open' }
});

// Create the model right here
const Cohort = mongoose.models.Cohort || mongoose.model('Cohort', mockCohortSchema);

const createMockCohort = async () => {
    try {
        console.log('🔄 Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('🗑️ Clearing old mock cohorts...');
        await Cohort.deleteMany({});
        
        console.log('🏗️ Building new active cohort...');
        const fakeCohort = await Cohort.create({
            name: 'FutureForge Alpha (Mock)',
            cohortNumber: 1,
            status: 'open'
        });

        console.log('✅ SUCCESS! Mock Cohort created with ID:', fakeCohort._id.toString());
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

createMockCohort();