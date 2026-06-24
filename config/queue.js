const { Queue } = require('bullmq');
const IORedis = require('ioredis');

// Configure Redis Connection
const redisConnection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null // Required by BullMQ
});

// Create the LMS sync queue
const lmsSyncQueue = new Queue('lmsStudentSync', {
  connection: redisConnection
});

module.exports = { lmsSyncQueue, redisConnection };