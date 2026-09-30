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

async function like(req, res) {
  const item = await service.like(req.params.id, req.user.id);
  return success(res, 'Post liked', { item });
}

async function unlike(req, res) {
  const item = await service.unlike(req.params.id, req.user.id);
  return success(res, 'Post unliked', { item });
}

async function remove(req, res) {
  await service.remove(req.params.id, req.user.id);
  return success(res, 'Post deleted');
}

module.exports = { list, create, like, unlike, remove };
