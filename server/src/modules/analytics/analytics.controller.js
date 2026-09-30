const { success } = require('../../utils/response');
const service = require('./analytics.service');

async function me(req, res) {
  return success(res, 'OK', await service.forUser(req.user));
}

module.exports = { me };
