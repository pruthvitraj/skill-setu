const { success } = require('../../utils/response');
const { parsePagination } = require('../../utils/pagination');
const service = require('./job.service');

async function list(req, res) {
  const { page, limit } = parsePagination(req.query);

  const data = await service.listPublished({
    q: req.query.q,
    skill: req.query.skill,
    location: req.query.location,
    page,
    limit,
  });

  return success(res, 'OK', data);
}

async function getOne(req, res) {
  const job = await service.getPublic(req.params.id);

  return success(res, 'OK', { job });
}

async function create(req, res) {
  const job = await service.create(req.user.id, req.body);

  return success(res, 'Job created', { job }, 201);
}

async function update(req, res) {
  const job = await service.update(
    req.user.id,
    req.params.id,
    req.body
  );

  return success(res, 'Job updated', { job });
}

async function remove(req, res) {
  const result = await service.remove(
    req.user.id,
    req.params.id
  );

  return success(res, 'Job deleted', result);
}

async function mine(req, res) {
  const { page, limit } = parsePagination(req.query);

  const data = await service.mine(req.user.id, {
    page,
    limit,
    status: req.query.status,
    q: req.query.q,
  });

  return success(res, 'OK', data);
}

async function matches(req, res) {
  const items = await service.matches(
    req.user.id,
    req.params.id
  );

  return success(res, 'OK', { items });
}

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
  mine,
  matches,
};