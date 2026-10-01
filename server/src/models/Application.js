const mongoose = require('mongoose');
const { APPLICATION_STATUS } = require('../utils/constants');

const applicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    status: { type: String, enum: Object.values(APPLICATION_STATUS), default: APPLICATION_STATUS.APPLIED, index: true },
    coverNote: String,
    matchScore: Number,
  },
  { timestamps: true }
);

applicationSchema.index({ student: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
