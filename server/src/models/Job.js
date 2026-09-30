const mongoose = require('mongoose');
const { JOB_STATUS, JOB_TYPE } = require('../utils/constants');

const jobSchema = new mongoose.Schema(
  {
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter', required: true, index: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    title: { type: String, required: true },
    description: String,
    requiredSkills: [String],
    education: String,
    experience: String,
    salaryMin: Number,
    salaryMax: Number,
    location: String,
    jobType: { type: String, enum: Object.values(JOB_TYPE), default: JOB_TYPE.FULL_TIME },
    positions: { type: Number, default: 1 },
    deadline: Date,
    eligibility: String,
    selectionProcess: String,
    status: { type: String, enum: Object.values(JOB_STATUS), default: JOB_STATUS.DRAFT, index: true },
    placementDrive: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive' },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Job', jobSchema);
