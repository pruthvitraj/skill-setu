const app = require('./app');
const env = require('./config/env');
const { connectDb } = require('./config/db');
const logger = require('./utils/logger');

async function start() {
  await connectDb();
  app.listen(env.port, () => logger.info(`SkillSetu API running on port ${env.port}`));
}

start().catch((err) => {
  logger.error(err.message);
  process.exit(1);
});
