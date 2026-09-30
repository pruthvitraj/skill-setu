const { success } = require('../../utils/response');
const { parsePagination } = require('../../utils/pagination');
const service = require('./student.service');

async function me(req, res) {
  const student = await service.getByUserId(req.user.id);
  return success(res, 'OK', { student });
}

async function updateMe(req, res) {
  const student = await service.updateMe(req.user.id, req.validated.body);
  return success(res, 'Profile updated', { student });
}

async function dashboard(req, res) {
  const data = await service.dashboard(req.user.id);
  return success(res, 'OK', data);
}

function subController(field) {
  return {
    add: async (req, res) => {
      const student = await service.addSub(req.user.id, field, req.validated.body);
      return success(res, 'Added', { student }, 201);
    },
    update: async (req, res) => {
      const student = await service.updateSub(req.user.id, field, req.validated.params.itemId, req.validated.body);
      return success(res, 'Updated', { student });
    },
    remove: async (req, res) => {
      const student = await service.removeSub(req.user.id, field, req.validated.params.itemId);
      return success(res, 'Removed', { student });
    },
  };
}

async function network(req, res) {
  const { page, limit } = parsePagination(req.query);
  const data = await service.network({ page, limit, q: req.query.q });
  return success(res, 'OK', data);
}

module.exports = { me, updateMe, dashboard, subController, network };
