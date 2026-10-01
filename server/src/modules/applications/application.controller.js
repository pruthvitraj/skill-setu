const { success } = require('../../utils/response');
const { parsePagination } = require('../../utils/pagination');
const service = require('./application.service');

async function apply(req, res) {
  const application = await service.apply(
    req.user.id,
    req.body.jobId,
    req.body.coverNote
  );

  return success(
    res,
    'Application submitted successfully',
    { application },
    201
  );
}

async function mine(req, res) {
  const items = await service.myApplications(req.user.id);

  return success(res, 'OK', { items });
}

async function list(req, res) {
  const { page, limit } = parsePagination(req.query);

  const data = await service.listForActor(req.user, {
    status: req.query.status,
    q: req.query.q,
    page,
    limit,
  });

  return success(res, 'OK', data);
}

async function status(req, res) {
  const application = await service.updateStatus(
    req.user,
    req.params.id,
    req.body.status,
    req.body.note
  );

  return success(
    res,
    'Status updated',
    { application }
  );
}

async function getOne(req, res) {
  const data = await service.getOne(
    req.params.id,
    req.user
  );

  return success(res, 'OK', data);
}

module.exports = {
  apply,
  mine,
  list,
  status,
  getOne,
};