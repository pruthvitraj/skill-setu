const { success } = require('../../utils/response');
const service = require('./drive.service');
const { ROLES } = require('../../utils/constants');

async function request(req, res) {
  const drive = await service.requestDrive(req.user.id, req.validated.body);
  return success(res, 'Drive request sent', { drive }, 201);
}

async function list(req, res) {
  const items =
    req.user.role === ROLES.TPO ? await service.listForTpo(req.user.id) : await service.listForRecruiter(req.user.id);
  return success(res, 'OK', { items });
}

async function review(req, res) {
  const drive = await service.review(req.user.id, req.params.id, req.validated.body);
  return success(res, 'Drive updated', { drive });
}

module.exports = { request, list, review };
