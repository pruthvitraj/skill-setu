const INTERVIEW_STATUS = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

const INTERVIEW_ROUNDS = {
  APTITUDE: 'aptitude',
  TECHNICAL: 'technical',
  HR: 'hr',
  FINAL: 'final',
};

const INTERVIEW_RESULT = {
  PENDING: 'pending',
  PASS: 'pass',
  FAIL: 'fail',
  HOLD: 'hold',
};

module.exports = { INTERVIEW_STATUS, INTERVIEW_ROUNDS, INTERVIEW_RESULT };
