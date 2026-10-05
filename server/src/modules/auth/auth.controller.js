const env = require('../../config/env');
const { success } = require('../../utils/response');
const authService = require('./auth.service');
const sessionService = require('./session.service');

function setAuthCookie(res, token) {
  res.cookie(env.jwtCookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

async function register(req, res) {
  const result = await authService.register(req.validated.body);
  setAuthCookie(res, result.token);
  return success(res, 'Registered successfully', result, 201);
}

async function login(req, res) {
  const { email, password } = req.validated.body;
  const userAgent = req.get('user-agent') || '';
  const ip = req.ip || req.connection?.remoteAddress || '';
  const result = await authService.login({ email, password, userAgent, ip });
  setAuthCookie(res, result.token);
  return success(res, 'Logged in', result);
}

async function logout(req, res) {
  const sessionId = req.user?.sid;
  const userId = req.user?.sub;
  if (sessionId && userId) {
    await authService.deleteSession(userId, sessionId);
  }
  res.clearCookie(env.jwtCookieName);
  return success(res, 'Logged out');
}

async function forgot(req, res) {
  await authService.forgotPassword(req.validated.body.email);
  return success(res, 'If that email exists, a reset link was sent');
}

async function reset(req, res) {
  await authService.resetPassword(req.validated.body.token, req.validated.body.password);
  return success(res, 'Password updated');
}

async function verify(req, res) {
  await authService.verifyEmail(req.validated.body.token);
  return success(res, 'Email verified');
}

async function me(req, res) {
  const User = require('../../models/User');
  const user = await User.findById(req.user.id);
  return success(res, 'OK', { user: authService.publicUser(user) });
}

async function updateMe(req, res) {
  const User = require('../../models/User');
  const user = await User.findByIdAndUpdate(req.user.id, req.validated.body, { new: true, runValidators: true });
  return success(res, 'Profile saved', { user: authService.publicUser(user) });
}

async function getSessions(req, res) {
  const sessions = await sessionService.getActiveSessions(req.user.id);
  const currentSid = req.user.sid;
  const formatted = sessions.map(s => ({
    sessionId: s.sessionId,
    userAgent: s.userAgent,
    ip: s.ip,
    createdAt: new Date(s.createdAt).toISOString(),
    lastActivity: new Date(s.lastActivity).toISOString(),
    current: s.sessionId === currentSid,
  }));
  return success(res, 'OK', { sessions: formatted });
}

async function revokeSession(req, res) {
  const { sessionId } = req.params;
  if (sessionId === req.user.sid) {
    return success(res, 'Cannot revoke current session', { success: false }, 400);
  }
  await sessionService.deleteSession(req.user.id, sessionId);
  return success(res, 'Session revoked');
}

async function revokeAllSessions(req, res) {
  await sessionService.deleteAllSessions(req.user.id);
  res.clearCookie(env.jwtCookieName);
  return success(res, 'All sessions revoked');
}

module.exports = { register, login, logout, forgot, reset, verify, me, updateMe, getSessions, revokeSession, revokeAllSessions };
