// seedFacilitators.js
require('dotenv').config(); // Loads your .env file
const mongoose = require('mongoose');
const Facilitator = require('./models/facilitator'); // Adjust path if needed

// 1. The Dummy Data Array (Matching your Schema)
const facilitatorsData = [
  {
    name: "Annette Black",
    track: "Frontend Development",
    imageUrl: "/images/Invisible.png",
    bio: "Annette is a senior frontend engineer with 6 years of experience building scalable React applications. She specializes in UI/UX architecture and performance optimization."
  },
  {
    name: "Devon Lane",
    track: "Backend Development",
    imageUrl: "/images/Invisible.png",
    bio: "Devon is a backend architect who has designed robust APIs for fintech platforms. He focuses on Node.js, database optimization, and scalable microservices."
  },
  {
    name: "Courtney Henry",
    track: "Product Design",
    imageUrl: "/images/Invisible.png",
    bio: "Courtney is an award-winning product designer. She brings a deep understanding of human-centered design, user research, and advanced Figma prototyping."
  },
  {
    name: "Ralph Edwards",
    track: "Quality Assurance",
    imageUrl: "/images/Invisible.png",
    bio: "Ralph ensures systems run flawlessly. With a background in automated testing and CI/CD pipelines, he teaches Forgers how to write bulletproof code."
  },
  {
    name: "Theresa Webb",
    track: "Product Management",
    imageUrl: "/images/Invisible.png",
    bio: "Theresa bridges the gap between engineering and business. She has led product teams at top tech firms and excels at roadmap planning and agile methodologies."
  },
  {
    name: "Darrell Steward",
    track: "System Architecture",
    imageUrl: "/images/Invisible.png",
    bio: "Darrell is a cloud infrastructure veteran. He mentors students on system resilience, AWS deployments, and building high-availability applications."
  }
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