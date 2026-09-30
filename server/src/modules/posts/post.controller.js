const { success } = require('../../utils/response');
const { parsePagination } = require('../../utils/pagination');
const service = require('./post.service');

async function list(req, res) {
  const { page, limit } = parsePagination(req.query);
  return success(res, 'OK', await service.list({ page, limit }));
}

async function create(req, res) {
  const item = await service.create(req.user.id, req.body.body, req.body.tags);
  return success(res, 'Posted', { item }, 201);
}

module.exports = { list, create };
