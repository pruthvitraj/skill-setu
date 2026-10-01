const { success } = require('../../utils/response');
const service = require('./network.service');

async function list(req, res) {
  const items = req.user.role === 'recruiter'
    ? await service.listForRecruiter(req.user.id)
    : await service.listForStudent(req.user.id);
  return success(res, 'OK', { items });
}

module.exports = { list };
