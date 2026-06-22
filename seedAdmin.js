require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin'); 

const seedAdmin = async () => {
  try {
    // 1. Connect to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Database');

    // 2. Prevent duplicate seeding
    const existingAdmin = await Admin.findOne({ email: 'admin@futureforge.com' });
    if (existingAdmin) {
        console.log('⚠️ Admin already exists! You can log in right now.');
        process.exit(0);
    }

    // 3. Hash the password and create the admin
    console.log('⏳ Hashing password...');
    const hashedPassword = await bcrypt.hash('SuperSecurePassword123', 12);
    
    await Admin.create({
      email: 'admin@futureforge.com',
      password: hashedPassword
    });

    console.log('✅ Initial Admin Seeded successfully!');
    console.log('📧 Email: admin@futureforge.com');
    console.log('🔑 Password: SuperSecurePassword123');
    
    // 4. Exit the script cleanly
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedAdmin();