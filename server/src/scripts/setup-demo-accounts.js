const mongoose = require('mongoose');
const { hashPassword, comparePassword } = require('../utils/password');

// Deliberately fixed: boundary-test accounts and normal users must never be selected.
const DEMO_ACCOUNTS = Object.freeze([
  { email: 'audit.student@skillsetu.test', role: 'student' },
  { email: 'audit.recruiter@skillsetu.test', role: 'recruiter' },
  { email: 'audit.tpo@skillsetu.test', role: 'tpo' },
]);

function parseOptions(args) {
  const options = { mode: 'check' };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--database' && args[index + 1] && !options.database) {
      options.database = args[++index];
    } else if (['--check', '--apply', '--verify'].includes(arg) && !options.explicitMode) {
      options.mode = arg.slice(2);
      options.explicitMode = true;
    } else {
      throw new Error('Usage: node src/scripts/setup-demo-accounts.js --database NAME [--check|--apply|--verify]');
    }
  }
  if (!options.database || !/^[a-zA-Z0-9_-]+$/.test(options.database)) {
    throw new Error('An explicit --database NAME is required (letters, numbers, underscores or hyphens).');
  }
  return options;
}

async function setupDemoAccounts(db, { mode = 'check', password } = {}) {
  if (!['check', 'apply', 'verify'].includes(mode)) throw new Error('Unsupported mode.');
  if (mode !== 'check' && (typeof password !== 'string' || password.length < 8)) {
    throw new Error('Set DEMO_PASSWORD to a password of at least 8 characters.');
  }
  const users = db.collection('users');
  const sessions = db.collection('sessions');
  const accounts = await users.find(
    { email: { $in: DEMO_ACCOUNTS.map(account => account.email) } },
    { projection: { _id: 1, email: 1, role: 1, isActive: 1, passwordHash: 1, authVersion: 1 } },
  ).toArray();
  for (const expected of DEMO_ACCOUNTS) {
    const matches = accounts.filter(account => account.email === expected.email);
    if (matches.length !== 1 || matches[0].role !== expected.role || matches[0].isActive === false) {
      throw new Error(`Expected exactly one active ${expected.role} account: ${expected.email}. No setup performed.`);
    }
  }
  const userIds = accounts.map(account => account._id.toString());
  const sessionFilter = { userId: { $in: userIds } };
  const summary = { database: db.databaseName, mode, accounts: DEMO_ACCOUNTS };
  if (mode === 'check') {
    return { ...summary, sessionsToRevoke: await sessions.countDocuments(sessionFilter) };
  }
  if (mode === 'verify') {
    for (const account of accounts) {
      if (!await comparePassword(password, account.passwordHash)) {
        throw new Error(`Password verification failed for ${account.email}.`);
      }
    }
    const remainingSessions = await sessions.countDocuments(sessionFilter);
    if (remainingSessions !== 0) throw new Error(`Verification failed: ${remainingSessions} demo sessions remain.`);
    return { ...summary, passwordMatches: true, remainingSessions };
  }
  const passwordHash = await hashPassword(password);
  const result = await users.updateMany(
    { $or: accounts.map(account => ({ _id: account._id, email: account.email, role: account.role, isActive: { $ne: false } })) },
    {
      $set: { passwordHash },
      $inc: { authVersion: 1 },
      $unset: { passwordResetToken: '', passwordResetExpires: '' },
    },
    { upsert: false },
  );
  // authVersion also rejects old JWTs if session deletion fails; rerun to finish cleanup.
  const revoked = await sessions.deleteMany(sessionFilter);
  if (result.matchedCount !== DEMO_ACCOUNTS.length) {
    throw new Error('Accounts changed during setup; update was incomplete. Inspect and rerun.');
  }
  await setupDemoAccounts(db, { mode: 'verify', password });
  return { ...summary, updatedAccounts: result.modifiedCount, revokedSessions: revoked.deletedCount, verified: true };
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const password = process.env.DEMO_PASSWORD;
  if (options.mode !== 'check' && (!password || password.length < 8)) {
    throw new Error('Set DEMO_PASSWORD to a password of at least 8 characters.');
  }
  // Never load .env, start the app, migrate, seed, or initialize collection indexes.
  const connection = mongoose.createConnection(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017', {
    dbName: options.database,
    serverSelectionTimeoutMS: 5000,
    autoCreate: false,
    autoIndex: false,
  });
  try {
    await connection.asPromise();
    console.log(JSON.stringify(await setupDemoAccounts(connection.db, { mode: options.mode, password }), null, 2));
  } finally {
    await connection.close();
  }
}

if (require.main === module) {
  main().catch(() => {
    // Connection errors may contain URI credentials. Do not echo arbitrary errors or secrets.
    console.error('Demo setup failed. Check the database, designated accounts, DEMO_PASSWORD and MongoDB connection. Run --check for the read-only account inventory.');
    process.exitCode = 1;
  });
}
module.exports = { DEMO_ACCOUNTS, parseOptions, setupDemoAccounts };
