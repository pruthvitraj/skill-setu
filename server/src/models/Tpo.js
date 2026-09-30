const mongoose = require('mongoose');

const tpoSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true, index: true },
    designation: { type: String, default: 'Training and Placement Officer' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tpo', tpoSchema);
