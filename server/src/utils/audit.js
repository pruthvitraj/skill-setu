const logger = require('./logger');

function audit(action, actorId, meta = {}) {
  logger.info(`AUDIT ${action} actor=${actorId} ${JSON.stringify(meta)}`);
}

module.exports = { audit };
