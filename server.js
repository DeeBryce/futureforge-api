require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app'); // Imports the Express setup from app.js

const PORT = process.env.PORT || 3000;

// Senior Dev trick: Support both env variables so neither developer's local setup breaks!
const dbURI = process.env.MONGO_URI || process.env.MONGODB_URI;

// Connect to Database, THEN start the server
mongoose.connect(dbURI)
    .then(() => {
        console.log('✅ Connected to MongoDB Database');
        app.listen(PORT, () => {
            console.log(`🚀 Server is listening on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1); // Stop the app if the database fails
    });
