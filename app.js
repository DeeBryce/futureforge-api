const express = require('express');
const helmet = require('helmet');
const cors = require('cors'); 
const morgan = require('morgan');
const errorMiddleware = require('./middleware/errorMiddleware');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Import your routes
const applicantRoutes = require('./routes/applicant');

const app = express();

// Global Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Route Prefixes
app.use('/api/applicants', applicantRoutes); // Your route!
app.use('/api/cohorts', require('./routes/cohort')); // Dev 2's routes
app.use('/api/graduates', require('./routes/graduate'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

// Global Error Handler (Must always be the very last middleware)
app.use(errorMiddleware);

module.exports = app;
