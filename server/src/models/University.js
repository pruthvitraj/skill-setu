const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, unique: true, sparse: true },
    city: String,
    website: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('University', universitySchema);
