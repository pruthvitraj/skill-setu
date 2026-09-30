const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
  topic: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
});

const assessmentSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: String,
    durationMinutes: { type: Number, default: 20 },
    questions: [questionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
