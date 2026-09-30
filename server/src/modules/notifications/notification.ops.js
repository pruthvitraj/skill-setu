const Notification = require('../../models/Notification');

async function list(userId, unreadOnly) {
  const filter = { user: userId };
  if (unreadOnly) filter.read = false;
  return Notification.find(filter).sort({ createdAt: -1 }).limit(50);
}

async function markRead(userId, id) {
  return Notification.findOneAndUpdate({ _id: id, user: userId }, { read: true }, { new: true });
}

async function markAll(userId) {
  await Notification.updateMany({ user: userId, read: false }, { read: true });
}

module.exports = { list, markRead, markAll };
