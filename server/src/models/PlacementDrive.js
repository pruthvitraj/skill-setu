const mongoose = require('mongoose');
const { DRIVE_STATUS } = require('../utils/constants');

const placementDriveSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter' },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true, index: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    title: String,
    proposedDate: Date,
    scheduledDate: Date,
    eligibility: String,
    status: { type: String, enum: Object.values(DRIVE_STATUS), default: DRIVE_STATUS.REQUESTED, index: true },
    tpoNote: String,
    eligibleStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);
