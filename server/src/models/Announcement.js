const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    category: { type: String, default: 'notice' },
    audience: {
      type: String,
      enum: ['all', 'department', 'batch', 'selected'],
      default: 'all',
    },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    batch: String,
    studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
