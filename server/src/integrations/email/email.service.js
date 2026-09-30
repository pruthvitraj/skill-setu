const nodemailer = require('nodemailer');
const env = require('../../config/env');
const logger = require('../../utils/logger');

function transporter() {
  if (!env.smtp.host) return null;
  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });
}

async function sendMail({ to, subject, html }) {
  const t = transporter();
  if (!t) {
    logger.info(`[email:dev] to=${to} subject=${subject}`);
    return { queued: false, dev: true };
  }
  await t.sendMail({ from: env.smtp.from, to, subject, html });
  return { queued: true };
}

module.exports = { sendMail };
