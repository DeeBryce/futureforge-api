require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app'); // Imports the Express setup from app.js
const logger = require('./utils/logger');// Logger added by Dev 2 - replaces console.log with Winston for production-grade logging
const config = require('./config'); // Centralized config file for environment variables

const PORT = config.port;

// Senior Dev trick: Support both env variables so neither developer's local setup breaks!
const dbURI = config.mongoUri;

// Connect to Database, THEN start the server
mongoose.connect(dbURI)
    .then(() => {
        logger.info('✅ Connected to MongoDB Database');
        app.listen(PORT, () => {
            logger.info(`🚀 Server is listening on port ${PORT}`);
        });
    })
    .catch((err) => {
        logger.error('❌ MongoDB connection error:', { error: err.message });
        process.exit(1); // Stop the app if the database fails
    });
