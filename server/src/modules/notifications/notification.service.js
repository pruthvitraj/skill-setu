const Notification = require('../../models/Notification');

async function notify(userId, { type, title, body, data }) {
  return Notification.create({ user: userId, type, title, body, data });
}

module.exports = { notify };
