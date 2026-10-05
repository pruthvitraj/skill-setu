const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, unique: true },
  userAgent: String,
  ip: String,
  lastActivity: Date,
  expiresAt: { type: Date, required: true, expires: 0 },
}, { timestamps: true });
module.exports = mongoose.model('Session', schema);
