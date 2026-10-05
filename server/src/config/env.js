require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/skillsetu',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtCookieName: process.env.JWT_COOKIE_NAME || 'skillsetu_token',
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'SkillSetu <noreply@skillsetu.local>',
  },
  openaiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  geminiKey: process.env.GEMINI_API_KEY,
  storageProvider: process.env.STORAGE_PROVIDER || 'local',
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'ap-south-1',
    bucket: process.env.AWS_S3_BUCKET,
  },
  uploadMaxMb: Number(process.env.UPLOAD_MAX_MB || 5),
};

if (env.nodeEnv === 'production' && (!process.env.JWT_SECRET || env.jwtSecret === 'dev-only-change-me')) {
  throw new Error('JWT_SECRET must be configured in production');
}

module.exports = env;
