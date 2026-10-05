const Notification = require('../../models/Notification');

async function list(userId, unreadOnly) {
  const filter = { user: userId };
  if (unreadOnly) filter.read = false;
  return Notification.find(filter).sort({ createdAt: -1 }).limit(50);
}

async function markRead(userId, id) {
  const item = await Notification.findOneAndUpdate({ _id: id, user: userId }, { read: true }, { new: true });
  if (!item) throw new (require('../../utils/AppError').AppError)('Notification not found', 404, 'NOT_FOUND');
  return item;
}

async function markAll(userId) {
  await Notification.updateMany({ user: userId, read: false }, { read: true });
}

module.exports = { list, markRead, markAll };
