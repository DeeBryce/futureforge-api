// seedFacilitators.js
require('dotenv').config(); // Loads your .env file
const mongoose = require('mongoose');
const Facilitator = require('./models/facilitator'); // Adjust path if needed

// 1. The Live Data Array (Matching your Schema) - updated by dev 2
const facilitatorsData = [
  {
    name: "Blessing Peters",
    track: "Frontend Development",
    imageUrl: "https://res.cloudinary.com/xo4vcrec/image/upload/f_auto,q_auto/Blessing_Peters_m3ihsc",
    bio: "Blessing is a senior frontend engineer with 6 years of experience building scalable React applications. She specializes in UI/UX architecture and performance optimization."
  },
  {
    name: "Ubong Inyang",
    track: "Backend Development",
    imageUrl: "https://res.cloudinary.com/xo4vcrec/image/upload/f_auto,q_auto/Ubong_Inyang_vqjzlm",
    bio: "Ubong is a backend architect who has designed robust APIs for fintech platforms. He focuses on Node.js, database optimization, and scalable microservices."
  },
  {
    name: "Osuohia Emmanuel",
    track: "Frontend Development",
    imageUrl: "https://res.cloudinary.com/xo4vcrec/image/upload/f_auto,q_auto/Osuohia_Emmanuel_c_ao3lxb",
    bio: "Emmanuel is an experienced frontend developer passionate about building beautiful and responsive web applications."
  },
  {
    name: "Azuka Chukwuma",
    track: "Quality Assurance",
    imageUrl: "https://res.cloudinary.com/xo4vcrec/image/upload/f_auto,q_auto/Azuka_Chukwuma_eqwtge",
    bio: "Azuka is a detail-oriented software tester with a passion for ensuring quality and reliability in every product. Skilled in manual and automated testing, bug tracking, and writing comprehensive test cases to deliver flawless user experiences."
  },
  {
    name: "Joshua Osunbor",
    track: "Product Management",
    imageUrl: "https://res.cloudinary.com/xo4vcrec/image/upload/f_auto,q_auto/Joshua_Osunbor_daflne",
    bio: "Joshua bridges the gap between engineering and business. She has led product teams at top tech firms and excels at roadmap planning and agile methodologies."
  },
  {
    name: "Mitchel Edah-Ekubo",
    track: "Backend Development",
    imageUrl: "https://res.cloudinary.com/xo4vcrec/image/upload/f_auto,q_auto/Mitchel_Edah-Ekubo_kj3vhq",
    bio: "Mitchel is a skilled backend developer with expertise in building robust APIs and scalable server-side applications. He has a strong foundation in Node.js, database design, and cloud infrastructure."
  },
  {
    name: "Nnennaya Okereke",
    track: "Product Management",
    imageUrl: "https://res.cloudinary.com/xo4vcrec/image/upload/f_auto,q_auto/Nnennaya_Okereke_gpwfod",
    bio: "Nnennaya is a strategic product manager with a strong ability to bridge the gap between business goals and technical execution. Experienced in roadmap planning, stakeholder communication, agile methodologies, and delivering products that users love."
  },
  {
    name: "Tobi Oyetunji",
    track: "Product Management",
    imageUrl: "https://res.cloudinary.com/xo4vcrec/image/upload/f_auto,q_auto/Tobi_Oyetunji_s_headshot_-_Tobi_Oyetunji_buity9",
    bio: "Tobi is a strategic product manager with a strong ability to bridge the gap between business goals and technical execution. Experienced in roadmap planning, stakeholder communication, agile methodologies, and delivering products that users love."
  },
  {
    name: "Somto Oli",
    track: "Quality Assurance",
    imageUrl: "https://res.cloudinary.com/xo4vcrec/image/upload/f_auto,q_auto/Somto_Oli_aagtkq",
    bio: "Somto is a detail-oriented software tester with a passion for ensuring quality and reliability in every product. Skilled in manual and automated testing, bug tracking, and writing comprehensive test cases to deliver flawless user experiences."
  },
];

// 2. The Injection Engine
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Wipe the existing facilitators so we start fresh
    await Facilitator.deleteMany();
    console.log('🧹 Cleared existing facilitators');

    // Inject the new data
    await Facilitator.insertMany(facilitatorsData);
    console.log('🚀 Successfully seeded facilitators data!');

    // Close the connection gracefully
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Execute the function
seedDatabase();