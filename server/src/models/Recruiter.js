const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    designation: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recruiter', recruiterSchema);
