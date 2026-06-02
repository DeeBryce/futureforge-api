const express = require('express');
const cors = require('cors'); // Prevents frontend connection errors
const morgan = require('morgan'); // Logs network requests to your terminal

// Import your routes
const applicantRoutes = require('./routes/applicant');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Route Prefixes
app.use('/api/applicants', applicantRoutes);
// Dev 2 will add theirs later: app.use('/api/cohorts', cohortRoutes);

module.exports = app;