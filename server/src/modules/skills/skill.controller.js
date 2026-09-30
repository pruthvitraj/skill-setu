const { success } = require('../../utils/response');
const service = require('./skill.service');

async function list(req, res) {
  const items = await service.listAssessments();
  return success(res, 'OK', { items });
}

async function getOne(req, res) {
  const item = await service.getAssessment(req.params.id);
  return success(res, 'OK', { item });
}

async function submit(req, res) {
  const result = await service.submitAttempt(req.user.id, req.params.id, req.validated.body.answers);
  return success(res, 'Assessment submitted', result);
}

async function tracker(req, res) {
  const data = await service.tracker(req.user.id);
  return success(res, 'OK', data);
}

async function catalog(req, res) {
  const items = await service.catalog();
  return success(res, 'OK', { items });
}

module.exports = { list, getOne, submit, tracker, catalog };
