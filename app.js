const express = require('express');
const helmet = require('helmet'); // Dev 2's security addition
const cors = require('cors'); // Prevents frontend connection errors
const morgan = require('morgan'); // Logs network requests to your terminal
const errorMiddleware = require('./middleware/errorMiddleware'); // Dev 2's error handler

// Import your routes
const applicantRoutes = require('./routes/applicant');

const app = express();

// Global Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Route Prefixes
app.use('/api/applicants', applicantRoutes); // Your route!
// app.use('/api/cohorts', require('./routes/cohort')); // Dev 2's routes
// app.use('/api/graduates', require('./routes/graduate'));
app.use('/api/auth', require('./routes/auth'));
// app.use('/api/admin', require('./routes/admin'));

// Global Error Handler (Must always be the very last middleware)
app.use(errorMiddleware);

module.exports = app;
