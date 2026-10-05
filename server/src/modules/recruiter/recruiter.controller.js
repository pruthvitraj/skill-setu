const { success } = require('../../utils/response');
const { parsePagination } = require('../../utils/pagination');
const service = require('./recruiter.service');

async function me(req, res) {
  return success(res, 'OK', { recruiter: await service.getRecruiter(req.user.id) });
}

async function update(req, res) {
  return success(res, 'Updated', { recruiter: await service.updateMe(req.user.id, req.validated.body) });
}

async function dashboard(req, res) {
  return success(res, 'OK', await service.dashboard(req.user.id));
}

async function candidates(req, res) {
  const { page, limit } = parsePagination(req.query);
  return success(res, 'OK', await service.candidates({ page, limit }));
}

async function candidateDetails(req, res) {
  return success(res, 'OK', await service.candidateDetails(req.user.id, req.params.id));
}

async function universities(req, res) {
  return success(res, 'OK', { items: await service.universities() });
}

async function invite(req, res) {
  const drive = await service.inviteUniversity(req.user.id, req.params.id, req.validated.body);
  return success(res, 'Placement drive request saved', { drive }, 201);
}

async function drives(req, res) {
  return success(res, 'OK', { items: await service.drives(req.user.id) });
}

module.exports = { me, update, dashboard, candidates, candidateDetails, universities, invite, drives };
