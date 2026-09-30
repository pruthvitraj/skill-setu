const Redis = require('ioredis');
const env = require('./env');
const logger = require('../utils/logger');

let client;

function getRedis() {
  if (client) return client;
  try {
    client = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
    });
    client.on('error', (err) => {
      logger.warn(`Redis: ${err.message}`);
    });
    return client;
  } catch (err) {
    logger.warn(`Redis unavailable: ${err.message}`);
    return null;
  }
}

async function cacheGet(key) {
  try {
    const redis = getRedis();
    if (!redis) return null;
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds = 60) {
  try {
    const redis = getRedis();
    if (!redis) return;
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    /* cache is optional */
  }
}

async function cacheDel(key) {
  try {
    const redis = getRedis();
    if (!redis) return;
    await redis.del(key);
  } catch {
    /* ignore */
  }
}

module.exports = { getRedis, cacheGet, cacheSet, cacheDel };
