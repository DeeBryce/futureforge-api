const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/cohorts', require('./routes/cohort'));
app.use('/api/graduates', require('./routes/graduate'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

app.use(errorMiddleware);

module.exports = app;