const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  source: { type: String, enum: ['assessment', 'challenge'], required: true },
  sourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  skill: { type: String, required: true },
  title: String,
  score: { type: Number, min: 0, max: 100 },
  evaluator: String,
  evaluatedAt: { type: Date, required: true },
  method: String,
  limitations: String,
  rubric: [{ criterion: String, weight: Number, score: Number }],
  feedback: String,
}, { timestamps: true });
schema.index({ source: 1, sourceId: 1, skill: 1 }, { unique: true });
module.exports = mongoose.model('SkillEvidence', schema);
