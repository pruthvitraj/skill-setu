const { z } = require('zod');
const User = require('../../models/User');
const { success } = require('../../utils/response');
const { AppError } = require('../../utils/AppError');
const service = require('./tpo.service');
const { hashPassword, comparePassword } = require('../../utils/password');
const sessions = require('../auth/session.service');
const schemas = {
  profile: z.object({ body: z.object({ firstName: z.string().trim().min(1).max(100), lastName: z.string().trim().min(1).max(100), designation: z.string().trim().min(1).max(200) }).strict() }),
  notifications: z.object({ body: z.record(z.boolean()) }),
  preferences: z.object({ body: z.object({ theme: z.enum(['system', 'light', 'dark']), language: z.enum(['English', 'Hindi', 'Marathi']), dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']), pageSize: z.enum(['10', '25', '50', '100']) }).strict() }),
  password: z.object({ body: z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8).max(200) }).strict() }),
};
async function get(req, res) {
  const [user, tpo] = await Promise.all([User.findById(req.user.id), service.getTpo(req.user.id)]);
  return success(res, 'OK', { user: { firstName: user.firstName, lastName: user.lastName, email: user.email, designation: tpo.designation, preferences: user.preferences, notificationPreferences: user.notificationPreferences } });
}
async function profile(req, res) {
  const { firstName, lastName, designation } = req.validated.body;
  const tpo = await service.getTpo(req.user.id);
  await User.updateOne({ _id: req.user.id }, { firstName, lastName });
  tpo.designation = designation; await tpo.save();
  return success(res, 'Profile saved');
}
async function notifications(req, res) {
  await User.updateOne({ _id: req.user.id }, { notificationPreferences: req.validated.body });
  return success(res, 'Notification preferences saved');
}
async function preferences(req, res) {
  await User.updateOne({ _id: req.user.id }, { preferences: req.validated.body });
  return success(res, 'Preferences saved');
}
async function password(req, res) {
  const user = await User.findById(req.user.id).select('+passwordHash');
  if (!await comparePassword(req.validated.body.currentPassword, user.passwordHash)) throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
  user.passwordHash = await hashPassword(req.validated.body.newPassword);
  user.authVersion = (user.authVersion || 0) + 1; await user.save();
  await sessions.deleteAllSessions(req.user.id);
  const env = require('../../config/env'); res.clearCookie(env.jwtCookieName);
  return success(res, 'Password changed. Sign in again.');
}
module.exports = { schemas, get, profile, notifications, preferences, password };
