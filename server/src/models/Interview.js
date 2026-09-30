const mongoose = require('mongoose');
const { INTERVIEW_STATUS, INTERVIEW_ROUNDS } = require('../utils/constants');

const interviewSchema = new mongoose.Schema(
  {
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter' },
    round: { type: String, enum: Object.values(INTERVIEW_ROUNDS), default: INTERVIEW_ROUNDS.TECHNICAL },
    scheduledAt: Date,
    mode: { type: String, enum: ['online', 'offline'], default: 'online' },
    meetingLink: String,
    location: String,
    interviewers: [String],
    status: { type: String, enum: Object.values(INTERVIEW_STATUS), default: INTERVIEW_STATUS.SCHEDULED, index: true },
    feedback: String,
    result: { type: String, enum: ['pending', 'pass', 'fail', 'hold'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
