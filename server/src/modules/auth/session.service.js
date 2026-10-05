const Session = require('../../models/Session');
const MAX_SESSIONS_PER_USER = 10;
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;
async function createSession(userId, sessionId, metadata = {}) {
  await Session.create({ userId, sessionId, ...metadata, lastActivity: new Date(), expiresAt: new Date(Date.now() + SESSION_TTL) });
  const excess = await Session.find({ userId }).sort({ createdAt: -1 }).skip(MAX_SESSIONS_PER_USER).select('_id');
  if (excess.length) await Session.deleteMany({ _id: { $in: excess.map(s => s._id) } });
  return { success: true };
}
async function validateSession(userId, sessionId) {
  const session = await Session.findOneAndUpdate({ userId, sessionId, expiresAt: { $gt: new Date() } }, { lastActivity: new Date() });
  return { valid: Boolean(session) };
}
async function deleteSession(userId, sessionId) {
  await Session.deleteOne({ userId, sessionId });
  return { success: true };
}
async function deleteAllSessions(userId) {
  await Session.deleteMany({ userId });
  return { success: true };
}
async function getActiveSessions(userId) {
  return Session.find({ userId, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 }).lean();
}
module.exports = { createSession, validateSession, deleteSession, deleteAllSessions, getActiveSessions, MAX_SESSIONS_PER_USER };
