const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: String,
  description: String,
  phase: Number,
  type: { type: String, enum: ['course', 'assessment', 'practice', 'project', 'interview'], default: 'practice' },
  resourceId: mongoose.Schema.Types.ObjectId,
  completed: { type: Boolean, default: false },
});

const roadmapSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    targetRole: { type: String, required: true },
    active: { type: Boolean, default: true, index: true },
    summary: String,
    gapAnalysis: [String],
    items: [itemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Roadmap', roadmapSchema);
