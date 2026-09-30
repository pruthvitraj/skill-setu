const mongoose = require('mongoose');

const skillScoreSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    skill: { type: String, required: true, index: true },
    overall: { type: Number, default: 0 },
    topics: [{ name: String, score: Number }],
    history: [{ score: Number, at: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);

skillScoreSchema.index({ student: 1, skill: 1 }, { unique: true });

module.exports = mongoose.model('SkillScore', skillScoreSchema);
