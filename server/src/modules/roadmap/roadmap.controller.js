const { success } = require('../../utils/response');
const service = require('./roadmap.service');

async function generate(req, res) {
  const roadmap = await service.generate(req.user.id, req.body.targetRole);
  return success(res, 'Roadmap generated', { roadmap }, 201);
}

async function current(req, res) {
  const roadmap = await service.current(req.user.id);
  return success(res, 'OK', { roadmap });
}

async function toggle(req, res) {
  const roadmap = await service.toggleItem(req.user.id, req.params.itemId, Boolean(req.body.completed));
  return success(res, 'Updated', { roadmap });
}

module.exports = { generate, current, toggle };
