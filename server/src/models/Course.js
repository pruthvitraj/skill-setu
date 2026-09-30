const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    provider: String,
    skill: { type: String, index: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    duration: String,
    url: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
