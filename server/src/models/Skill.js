const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    category: String,
    aliases: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', skillSchema);
