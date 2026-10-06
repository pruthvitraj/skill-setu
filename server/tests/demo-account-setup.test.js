const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { DEMO_ACCOUNTS, parseOptions, setupDemoAccounts } = require('../src/scripts/setup-demo-accounts');
const { hashPassword, comparePassword } = require('../src/utils/password');

function matches(row, filter) {
  if (filter.$or) return filter.$or.some(item => matches(row, item));
  return Object.entries(filter).every(([key, expected]) => {
    if (expected && typeof expected === 'object') {
      if ('$in' in expected) return expected.$in.includes(row[key]);
      if ('$ne' in expected) return row[key] !== expected.$ne;
    }
    return row[key] === expected;
  });
}
function fixture() {
  const rows = {
    users: [...DEMO_ACCOUNTS.map((account, index) => ({ ...account, _id: String(index), isActive: true, authVersion: index, passwordHash: 'old', passwordResetToken: 'reset', passwordResetExpires: 'expiry' })),
      { _id: 'other', email: 'audit.otherstudent@skillsetu.test', role: 'student', passwordHash: 'untouched', authVersion: 4 },
      { _id: 'normal', email: 'normal@example.test', role: 'student', passwordHash: 'untouched' }],
    sessions: [{ userId: '0', sessionId: 's0' }, { userId: '1', sessionId: 's1' }, { userId: '2', sessionId: 's2' }, { userId: 'other', sessionId: 'keep' }],
  };
  const writes = [];
  const db = {
    databaseName: 'chosen_database',
    collection: name => ({
      find: filter => ({ toArray: async () => structuredClone(rows[name].filter(row => matches(row, filter))) }),
      countDocuments: async filter => rows[name].filter(row => matches(row, filter)).length,
      updateMany: async (filter, update, options) => {
        writes.push({ name, filter, update, options });
        const selected = rows[name].filter(row => matches(row, filter));
        for (const row of selected) {
          Object.assign(row, update.$set);
          for (const [key, value] of Object.entries(update.$inc)) row[key] = (row[key] || 0) + value;
          for (const key of Object.keys(update.$unset)) delete row[key];
        }
        return { matchedCount: selected.length, modifiedCount: selected.length };
      },
      deleteMany: async filter => {
        writes.push({ name, filter });
        const before = rows[name].length;
        rows[name] = rows[name].filter(row => !matches(row, filter));
        return { deletedCount: before - rows[name].length };
      },
    }),
  };
  return { db, rows, writes };
}
const newPassword = () => crypto.randomBytes(24).toString('hex');

test('requires explicit database and rejects conflicting modes or password CLI arguments', () => {
  assert.throws(() => parseOptions([]), /explicit/);
  assert.throws(() => parseOptions(['--database', 'bad/name']), /explicit/);
  assert.throws(() => parseOptions(['--database', 'chosen', '--apply', '--verify']), /Usage/);
  assert.throws(() => parseOptions(['--database', 'chosen', '--password', 'secret']), /Usage/);
  assert.equal(parseOptions(['--database', 'chosen']).mode, 'check');
});

test('check is read-only and lists only the exact three designated roles', async () => {
  const { db, rows, writes } = fixture();
  const before = structuredClone(rows);
  const result = await setupDemoAccounts(db);
  assert.equal(result.database, 'chosen_database');
  assert.equal(result.sessionsToRevoke, 3);
  assert.deepEqual(result.accounts, DEMO_ACCOUNTS);
  assert.deepEqual(rows, before);
  assert.deepEqual(writes, []);
});

test('missing, duplicate, inactive and wrong-role accounts fail before any write', async () => {
  for (const defect of ['missing', 'duplicate', 'inactive', 'role']) {
    const { db, rows, writes } = fixture();
    if (defect === 'missing') rows.users.shift();
    if (defect === 'duplicate') rows.users.push({ ...rows.users[0], _id: 'duplicate' });
    if (defect === 'inactive') rows.users[0].isActive = false;
    if (defect === 'role') rows.users[0].role = 'recruiter';
    await assert.rejects(setupDemoAccounts(db, { mode: 'apply', password: newPassword() }), /Expected exactly one/);
    assert.deepEqual(writes, []);
  }
});

test('apply hashes with existing bcrypt, invalidates tokens and preserves unrelated accounts/sessions', async () => {
  const { db, rows, writes } = fixture();
  const unrelated = structuredClone(rows.users.slice(3));
  const password = newPassword();
  const result = await setupDemoAccounts(db, { mode: 'apply', password });
  assert.equal(result.updatedAccounts, 3);
  assert.equal(result.revokedSessions, 3);
  assert.equal(result.verified, true);
  assert.deepEqual(rows.users.slice(3), unrelated);
  assert.deepEqual(rows.sessions, [{ userId: 'other', sessionId: 'keep' }]);
  for (const [index, account] of rows.users.slice(0, 3).entries()) {
    assert.equal(await comparePassword(password, account.passwordHash), true);
    assert.match(account.passwordHash, /^\$2[aby]\$12\$/);
    assert.equal(account.authVersion, index + 1);
    assert.equal(account.passwordResetToken, undefined);
    assert.equal(account.passwordResetExpires, undefined);
    assert.equal(account.email, DEMO_ACCOUNTS[index].email);
    assert.equal(account.role, DEMO_ACCOUNTS[index].role);
  }
  assert.equal(writes[0].options.upsert, false);
  assert.equal(JSON.stringify(result).includes(password), false);
  assert.equal(JSON.stringify(result).includes(rows.users[0].passwordHash), false);
});

test('missing/short password and wrong verification password never write', async () => {
  const { db, rows, writes } = fixture();
  await assert.rejects(setupDemoAccounts(db, { mode: 'apply' }), /DEMO_PASSWORD/);
  await assert.rejects(setupDemoAccounts(db, { mode: 'apply', password: 'short' }), /DEMO_PASSWORD/);
  const password = newPassword();
  const hash = await hashPassword(password);
  for (const row of rows.users.slice(0, 3)) row.passwordHash = hash;
  await assert.rejects(setupDemoAccounts(db, { mode: 'verify', password: newPassword() }), /Password verification failed/);
  await assert.rejects(setupDemoAccounts(db, { mode: 'verify', password }), /sessions remain/);
  assert.deepEqual(writes, []);
});

test('session cleanup failure propagates after token invalidation without success', async () => {
  const { db, rows } = fixture();
  const collection = db.collection;
  db.collection = name => {
    const result = collection(name);
    if (name === 'sessions') result.deleteMany = async () => { throw new Error('cleanup unavailable'); };
    return result;
  };
  await assert.rejects(setupDemoAccounts(db, { mode: 'apply', password: newPassword() }), /cleanup unavailable/);
  assert.deepEqual(rows.users.slice(0, 3).map(row => row.authVersion), [1, 2, 3]);
  assert.equal(rows.sessions.length, 4);
});
