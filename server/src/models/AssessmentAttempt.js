const mongoose = require('mongoose');

const assessmentAttemptSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    skill: { type: String, required: true, index: true },
    mode: { type: String, enum: ['practice', 'verified', 'legacy'], default: 'legacy' },
    status: { type: String, enum: ['started', 'submitted', 'expired'], default: 'submitted' },
    startedAt: Date,
    expiresAt: Date,
    submittedAt: Date,
    rulesVersion: String,
    questionSnapshot: { type: mongoose.Schema.Types.Mixed, select: false },
    answers: [{ questionIndex: Number, selectedIndex: Number }],
    score: Number,
    topicScores: [{ topic: String, score: Number }],
    difficulty: String,
  },
  { timestamps: true }
);

assessmentAttemptSchema.index({ student: 1, assessment: 1, mode: 1 }, { unique: true, partialFilterExpression: { mode: 'verified' } });

module.exports = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);
