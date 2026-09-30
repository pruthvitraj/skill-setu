const { success } = require('../../utils/response');
const ops = require('./notification.ops');

async function list(req, res) {
  return success(res, 'OK', { items: await ops.list(req.user.id, req.query.unread === 'true') });
}

async function read(req, res) {
  return success(res, 'OK', { item: await ops.markRead(req.user.id, req.params.id) });
}

async function readAll(req, res) {
  await ops.markAll(req.user.id);
  return success(res, 'All notifications marked as read');
}

module.exports = { list, read, readAll };
