const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

async function connectDb() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  await Promise.all([require('../models/AssessmentAttempt').init(), require('../models/SkillEvidence').init(), require('../models/ChallengeSubmission').init()]);
  logger.info('MongoDB connected');
}

module.exports = { connectDb };
