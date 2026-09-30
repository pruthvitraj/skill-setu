const logger = require('../../utils/logger');

async function sendWhatsAppAlert({ to, body }) {
  logger.info(`[whatsapp:stub] to=${to} ${body}`);
  return { queued: false };
}

module.exports = { sendWhatsAppAlert };
