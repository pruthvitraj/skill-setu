const { verifyToken } = require('../utils/jwt');
const env = require('../config/env');
const User = require('../models/User');
const { AppError } = require('../utils/AppError');
const sessionService = require('../modules/auth/session.service');

async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;
    const bearer = header?.startsWith('Bearer ') ? header.slice(7) : null;
    const token = bearer || req.cookies?.[env.jwtCookieName];
    if (!token) throw new AppError('Authentication required', 401, 'UNAUTHORIZED');

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) throw new AppError('Invalid session', 401, 'UNAUTHORIZED');

    if (!payload.sid || (payload.av || 0) !== (user.authVersion || 0)) throw new AppError('Sign in again', 401, 'SESSION_EXPIRED');

    // Validate session if session ID present
    if (payload.sid) {
      const sessionCheck = await sessionService.validateSession(payload.sub, payload.sid);
      if (!sessionCheck.valid) {
        throw new AppError('Session expired or revoked', 401, 'SESSION_EXPIRED');
      }
    }

    req.user = { id: user._id.toString(), role: user.role, email: user.email, sid: payload.sid, sub: payload.sub };
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError('Invalid token', 401, 'UNAUTHORIZED'));
  }
}

module.exports = { authMiddleware };
