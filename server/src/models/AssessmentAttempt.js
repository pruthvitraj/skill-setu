const mongoose = require('mongoose');

const assessmentAttemptSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    skill: { type: String, required: true, index: true },
    answers: [{ questionIndex: Number, selectedIndex: Number }],
    score: Number,
    topicScores: [{ topic: String, score: Number }],
    difficulty: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);
