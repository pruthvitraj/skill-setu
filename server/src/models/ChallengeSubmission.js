const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  url: String, rationale: String, submittedAt: Date,
  status: { type: String, enum: ['submitted', 'reviewed'], default: 'submitted' },
  review: { evaluator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, evaluatedAt: Date, score: Number, feedback: String, rubric: [{ criterion: String, weight: Number, score: Number }] },
}, { timestamps: true });
schema.index({ challenge: 1, student: 1 }, { unique: true });
module.exports = mongoose.model('ChallengeSubmission', schema);
