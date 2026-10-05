const { success } = require('../../utils/response');
const service = require('./interview.service');
const { ROLES } = require('../../utils/constants');

async function create(req, res) {
  const interview = await service.schedule(req.user.id, req.validated.body);
  return success(res, 'Interview scheduled', { interview }, 201);
}

async function list(req, res) {
  const items =
    req.user.role === ROLES.TPO
      ? await require('../tpo/tpo.service').interviews(req.user.id)
      : req.user.role === ROLES.STUDENT
      ? await service.listForStudent(req.user.id)
      : await service.listForRecruiter(req.user.id);
  return success(res, 'OK', { items });
}

async function update(req, res) {
  const interview = await service.update(req.user.id, req.params.id, req.validated.body);
  return success(res, 'Updated', { interview });
}

module.exports = { create, list, update };
