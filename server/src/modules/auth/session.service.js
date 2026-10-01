const { getRedis } = require('../../config/redis');
const env = require('../../config/env');

const MAX_SESSIONS_PER_USER = 10;
const SESSION_TTL = 7 * 24 * 60 * 60; // 7 days in seconds (matches JWT expiry)

function getSessionKey(userId) {
  return `user:sessions:${userId}`;
}

function getSessionDataKey(sessionId) {
  return `session:${sessionId}`;
}

async function createSession(userId, sessionId, metadata = {}) {
  const redis = getRedis();
  if (!redis) return { success: true }; // Allow if Redis unavailable

  try {
    const sessionKey = getSessionKey(userId);
    const sessionDataKey = getSessionDataKey(sessionId);

    // Get current sessions
    const sessions = await redis.zrange(sessionKey, 0, -1, 'WITHSCORES');
    const sessionMap = new Map();
    for (let i = 0; i < sessions.length; i += 2) {
      sessionMap.set(sessions[i], parseInt(sessions[i + 1], 10));
    }

    // Remove expired sessions
    const now = Date.now();
    for (const [sid, timestamp] of sessionMap.entries()) {
      if (now - timestamp > SESSION_TTL * 1000) {
        await redis.zrem(sessionKey, sid);
        await redis.del(getSessionDataKey(sid));
        sessionMap.delete(sid);
      }
    }

    // Check limit
    if (sessionMap.size >= MAX_SESSIONS_PER_USER) {
      const oldestSessionId = sessions[0];
      if (oldestSessionId) {
        await redis.zrem(sessionKey, oldestSessionId);
        await redis.del(getSessionDataKey(oldestSessionId));
      }
    }

    // Add new session
    await redis.zadd(sessionKey, now, sessionId);
    await redis.expire(sessionKey, SESSION_TTL);

    // Store session metadata
    const sessionData = {
      userId,
      sessionId,
      createdAt: now,
      lastActivity: now,
      userAgent: metadata.userAgent || '',
      ip: metadata.ip || '',
    };
    await redis.set(sessionDataKey, JSON.stringify(sessionData), 'EX', SESSION_TTL);

    return { success: true };
  } catch {
    return { success: true, redisUnavailable: true };
  }
}

async function validateSession(userId, sessionId) {
  const redis = getRedis();
  if (!redis) return { valid: true }; // Allow if Redis unavailable

  try {
    const sessionKey = getSessionKey(userId);
    const sessionDataKey = getSessionDataKey(sessionId);

  const exists = await redis.zscore(sessionKey, sessionId);
  if (!exists) return { valid: false, reason: 'Session not found or expired' };

  const data = await redis.get(sessionDataKey);
  if (!data) return { valid: false, reason: 'Session data missing' };

  const session = JSON.parse(data);
  if (session.userId !== userId) return { valid: false, reason: 'Session user mismatch' };

  // Update last activity
  session.lastActivity = Date.now();
  await redis.set(sessionDataKey, JSON.stringify(session), 'EX', SESSION_TTL);

    return { valid: true };
  } catch {
    return { valid: true, redisUnavailable: true };
  }
}

async function deleteSession(userId, sessionId) {
  const redis = getRedis();
  if (!redis) return { success: true };

  const sessionKey = getSessionKey(userId);
  const sessionDataKey = getSessionDataKey(sessionId);

  try {
    await redis.zrem(sessionKey, sessionId);
    await redis.del(sessionDataKey);
  } catch {
    return { success: true, redisUnavailable: true };
  }

  return { success: true };
}

async function deleteAllSessions(userId) {
  const redis = getRedis();
  if (!redis) return { success: true };

  const sessionKey = getSessionKey(userId);
  try {
    const sessions = await redis.zrange(sessionKey, 0, -1);

    for (const sid of sessions) {
      await redis.del(getSessionDataKey(sid));
    }
    await redis.del(sessionKey);
  } catch {
    return { success: true, redisUnavailable: true };
  }

  return { success: true };
}

async function getActiveSessions(userId) {
  const redis = getRedis();
  if (!redis) return [];

  try {
    const sessionKey = getSessionKey(userId);
    const sessions = await redis.zrange(sessionKey, 0, -1, 'WITHSCORES');

  const result = [];
  for (let i = 0; i < sessions.length; i += 2) {
    const sid = sessions[i];
    const timestamp = parseInt(sessions[i + 1], 10);
    const data = await redis.get(getSessionDataKey(sid));
    if (data) {
      result.push({ ...JSON.parse(data), sessionId: sid });
    }
  }

    return result;
  } catch {
    return [];
  }
}

module.exports = {
  createSession,
  validateSession,
  deleteSession,
  deleteAllSessions,
  getActiveSessions,
  MAX_SESSIONS_PER_USER,
};