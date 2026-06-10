const express = require('express');
const helmet = require('helmet'); // Dev 2's security addition
const cors = require('cors'); // Prevents frontend connection errors
const morgan = require('morgan'); // Logs network requests to your terminal
const errorMiddleware = require('./middleware/errorMiddleware'); // Dev 2's error handler

// Import your routes
const applicantRoutes = require('./routes/applicant');
const studentRoutes = require('./routes/student');
const cohortRoutes = require('./routes/cohort');
const graduateRoutes = require('./routes/graduate');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();

// Global Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Route Prefixes
app.use('/api/applicants', applicantRoutes); // Your route!
app.use('/api/students', studentRoutes); // Student routes
app.use('/api/cohorts', cohortRoutes); // Dev 2's routes
app.use('/api/graduates', graduateRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler (Must always be the very last middleware)
app.use(errorMiddleware);

module.exports = app;
