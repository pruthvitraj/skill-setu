const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  targetRole: { type: String, required: true },
  source: { type: String, enum: ['ai'], required: true },
  provider: String,
  model: String,
  title: { type: String, required: true },
  brief: { type: String, required: true },
  objectives: [String],
  deliverables: [String],
  rubric: [{ criterion: String, weight: Number }],
  response: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'submitted'], default: 'draft' },
  submittedAt: Date,
}, { timestamps: true });

schema.index({ student: 1, createdAt: -1 });
module.exports = mongoose.model('PracticeAssignment', schema);
