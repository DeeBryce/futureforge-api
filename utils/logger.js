const winston = require('winston');
const config = require('../config');

const { combine, timestamp, colorize, printf, json } = winston.format;

const devFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  transports: [
    config.nodeEnv === 'production'
      ? new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: combine(timestamp(), json()),
        })
      : new winston.transports.Console({
          format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), devFormat),
        }),

    ...(config.nodeEnv === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/combined.log',
            format: combine(timestamp(), json()),
          }),
        ]
      : []),
  ],
});

module.exports = logger;