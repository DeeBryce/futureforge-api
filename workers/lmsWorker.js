const { Worker } = require('bullmq');
const { redisConnection } = require('../config/queue');

console.log('👷 LMS Background Sync Worker started and listening for jobs...');

const lmsWorker = new Worker('lmsStudentSync', async (job) => {
  if (job.name === 'syncNewStudent') {
    const { studentId, fullName, email, cohortId } = job.data;
    
    console.log(`⏳ [Job ${job.id}] Processing LMS sync for: ${email}`);

    try {
      // Simulation of a slow external API call to the LMS (Canvas/Moodle/Custom)
      // Replace this with an actual axios/fetch call to your third-party service later
      await new Promise((resolve) => setTimeout(resolve, 3000)); 

      console.log(`✅ [Job ${job.id}] Successfully synced student ${studentId} to LMS.`);
    } catch (error) {
      console.error(`❌ [Job ${job.id}] Failed to sync student ${email}:`, error.message);
      throw error; // Throwing the error tells BullMQ the job failed, triggering auto-retry
    }
  }
}, {
  connection: redisConnection
});

module.exports = lmsWorker;