const { Queue } = require('bullmq');
const IORedis = require('ioredis');

// Configure Redis Connection
const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null // Required by BullMQ
});

// Create the LMS sync queue
const lmsSyncQueue = new Queue('lmsStudentSync', {
  connection: redisConnection
});

module.exports = { lmsSyncQueue, redisConnection };