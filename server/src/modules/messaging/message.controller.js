const { success } = require('../../utils/response');
const service = require('./message.service');

async function list(req, res) {
  return success(res, 'OK', { items: await service.list(req.user.id) });
}

async function send(req, res) {
  const message = await service.send(req.user.id, req.body);
  return success(res, 'Sent', { message }, 201);
}

async function thread(req, res) {
  return success(res, 'OK', { items: await service.messages(req.user.id, req.params.id) });
}

module.exports = { list, send, thread };
