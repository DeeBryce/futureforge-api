const Cohort = require('../models/Cohort');

const getCohortStatus = async () => {
  const cohort = await Cohort.findOne({ status: { $in: ['open', 'ongoing'] } });

  if (!cohort) {
    return "No active cohort available.";
  }

  if (cohort.status === 'ongoing') {
    return `Cohort ${cohort.cohortNumber} is ongoing — Sign up for Cohort ${cohort.cohortNumber + 1} now!`;
  }

  if (cohort.status === 'open') {
    return `Cohort ${cohort.cohortNumber} is open — Sign up now!`;
  }
};

module.exports = getCohortStatus;