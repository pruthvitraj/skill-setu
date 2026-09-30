const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true, index: true },
    name: { type: String, required: true },
    code: String,
  },
  { timestamps: true }
);

departmentSchema.index({ university: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Department', departmentSchema);
