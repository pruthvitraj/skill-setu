const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter', required: true, index: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    connectedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

connectionSchema.index({ student: 1, recruiter: 1 }, { unique: true });

module.exports = mongoose.model('Connection', connectionSchema);