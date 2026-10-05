const crypto = require('crypto');
const { z } = require('zod');
const { ROLES } = require('../../utils/constants');
const User = require('../../models/User');
const Student = require('../../models/Student');
const Tpo = require('../../models/Tpo');
const Recruiter = require('../../models/Recruiter');
const University = require('../../models/University');
const Company = require('../../models/Company');
const { hashPassword, comparePassword } = require('../../utils/password');
const { signToken } = require('../../utils/jwt');
const { AppError } = require('../../utils/AppError');
const { sendMail } = require('../../integrations/email/email.service');
const env = require('../../config/env');
const sessionService = require('./session.service');

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: z.enum([ROLES.STUDENT, ROLES.TPO, ROLES.RECRUITER]),
    universityName: z.string().optional(),
    companyName: z.string().optional(),
    phone: z.string().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

function tokenHash() {
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}

async function register(payload) {
  const existing = await User.findOne({ email: payload.email.toLowerCase() });
  if (existing) throw new AppError('Email already registered', 409, 'EMAIL_TAKEN');

  if (payload.role === ROLES.TPO && payload.universityName && await University.exists({ name: payload.universityName })) {
    throw new AppError('An existing institution requires an authorized invitation', 403, 'INVITATION_REQUIRED');
  }
  if (payload.role === ROLES.RECRUITER && payload.companyName && await Company.exists({ name: payload.companyName })) {
    throw new AppError('An existing company requires an authorized invitation', 403, 'INVITATION_REQUIRED');
  }
  const passwordHash = await hashPassword(payload.password);
  const verify = tokenHash();
  const user = await User.create({
    email: payload.email.toLowerCase(),
    passwordHash,
    role: payload.role,
    firstName: payload.firstName,
    lastName: payload.lastName,
    phone: payload.phone,
    emailVerifyToken: verify.hash,
    emailVerifyExpires: new Date(Date.now() + 1000 * 60 * 60 * 24),
  });

  if (payload.role === ROLES.STUDENT) {
    let university = null;
    if (payload.universityName) {
      university = await University.findOneAndUpdate(
        { name: payload.universityName },
        { name: payload.universityName },
        { upsert: true, new: true }
      );
    }
    await Student.create({ user: user._id, university: university?._id });
  }

  if (payload.role === ROLES.TPO) {
    const name = payload.universityName || `${payload.firstName}'s University`;
    const university = await University.findOneAndUpdate({ name }, { name }, { upsert: true, new: true });
    await Tpo.create({ user: user._id, university: university._id });
  }

  if (payload.role === ROLES.RECRUITER) {
    const name = payload.companyName || `${payload.firstName}'s Company`;
    const company = await Company.findOneAndUpdate({ name }, { name }, { upsert: true, new: true });
    await Recruiter.create({ user: user._id, company: company._id, designation: 'Recruiter' });
  }

  await sendMail({
    to: user.email,
    subject: 'Verify your SkillSetu email',
    html: `<p>Verify: ${env.clientUrl}/verify-email?token=${verify.raw}</p>`,
  });

  const sid = crypto.randomBytes(32).toString('hex');
  await sessionService.createSession(user._id.toString(), sid);
  return { user: publicUser(user), token: signToken({ sub: user._id.toString(), role: user.role, sid, av: user.authVersion || 0 }) };
}

async function login({ email, password, userAgent, ip }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  if (!user.isActive) throw new AppError('Account disabled', 403, 'DISABLED');

  const sessionId = crypto.randomBytes(32).toString('hex');
  const token = signToken({ sub: user._id.toString(), role: user.role, sid: sessionId, av: user.authVersion || 0 });

  await sessionService.createSession(user._id.toString(), sessionId, { userAgent, ip });

  return { user: publicUser(user), token };
}

async function forgotPassword(email) {
  if (!env.smtp.host) throw new AppError('Password recovery is unavailable until email delivery is configured. Contact your administrator.', 503, 'EMAIL_UNAVAILABLE');
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return;
  const reset = tokenHash();
  user.passwordResetToken = reset.hash;
  user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 30);
  await user.save();
  await sendMail({
    to: user.email,
    subject: 'Reset your SkillSetu password',
    html: `<p>Reset: ${env.clientUrl}/reset-password?token=${reset.raw}</p>`,
  });
}

async function resetPassword(rawToken, password) {
  const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hash,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken');
  if (!user) throw new AppError('Reset link is invalid or expired', 400, 'RESET_INVALID');
  user.passwordHash = await hashPassword(password);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.authVersion = (user.authVersion || 0) + 1;
  await user.save();
  await sessionService.deleteAllSessions(user._id.toString());
}

async function verifyEmail(rawToken) {
  const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const user = await User.findOne({
    emailVerifyToken: hash,
    emailVerifyExpires: { $gt: new Date() },
  }).select('+emailVerifyToken');
  if (!user) throw new AppError('Verify link is invalid or expired', 400, 'VERIFY_INVALID');
  user.isEmailVerified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpires = undefined;
  await user.save();
}

function publicUser(user) {
  return {
    id: user._id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    isEmailVerified: user.isEmailVerified,
  };
}

async function deleteSession(userId, sessionId) {
  return sessionService.deleteSession(userId, sessionId);
}

module.exports = {
  register,
  login,
  logout: deleteSession,
  forgotPassword,
  resetPassword,
  verifyEmail,
  publicUser,
  registerSchema,
  loginSchema,
};
