const env = require('../../config/env');
const { success } = require('../../utils/response');
const authService = require('./auth.service');

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
  const result = await authService.login(req.validated.body);
  setAuthCookie(res, result.token);
  return success(res, 'Logged in', result);
}

async function logout(req, res) {
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

module.exports = { register, login, logout, forgot, reset, verify, me };
