const { success } = require('../../utils/response');
const { parsePagination } = require('../../utils/pagination');
const service = require('./course.service');

async function list(req, res) {
  const { page, limit } = parsePagination(req.query);
  const data = await service.list({ skill: req.query.skill, page, limit });
  return success(res, 'OK', data);
}

async function recommended(req, res) {
  const items = await service.recommended(req.user.id);
  return success(res, 'OK', { items });
}

module.exports = { list, recommended };
