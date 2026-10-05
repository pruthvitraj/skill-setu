const { test } = require('node:test');
const assert = require('node:assert/strict');
const { matchStudentToJob } = require('../src/modules/jobs/jobMatching.service');
const { visibleStudent } = require('../src/utils/profilePrivacy');
const { fallbackRoadmap } = require('../src/modules/roadmap/roadmap.ai');
const { parseBuffer } = require('../src/modules/resume/resume.parser');
const { asyncHandler } = require('../src/middleware/asyncHandler');

test('JavaScript does not satisfy Java', () => {
  assert.equal(matchStudentToJob({ skills: [{ name: 'JavaScript' }] }, { requiredSkills: ['Java'] }).skillMatch, 0);
});
test('matching normalizes case and whitespace', () => {
  assert.equal(matchStudentToJob({ skills: [{ name: ' SQL ' }] }, { requiredSkills: ['sql '] }).skillMatch, 100);
});
test('private scores are removed without mutating original profile', () => {
  const profile = { skillScore: 80, atsScore: 70, privacy: { showScores: false } };
  const visible = visibleStudent(profile);
  assert.equal(visible.skillScore, undefined); assert.equal(visible.atsScore, undefined); assert.equal(profile.skillScore, 80);
});
test('Frontend Engineer receives frontend roadmap', () => {
  assert.match(fallbackRoadmap({ skills: [] }, 'Frontend Engineer').items[0].title, /JavaScript/);
});
test('Cloud Engineer receives cloud roadmap', () => {
  assert.match(fallbackRoadmap({ skills: [] }, 'Cloud Engineer').items[0].title, /Linux/);
});
test('unsupported binary resumes fail rather than receive invented analysis', async () => {
  await assert.rejects(parseBuffer(Buffer.from('fake'), 'application/msword'), { errorCode: 'UNSUPPORTED_RESUME' });
});
test('corrupt PDFs fail explicitly', async () => {
  await assert.rejects(parseBuffer(Buffer.from('not a PDF'), 'application/pdf'), { errorCode: 'UNREADABLE_RESUME' });
});
test('async handler forwards synchronous handler errors', async () => {
  const error = new Error('missing handler'); let captured;
  await asyncHandler(() => { throw error; })({}, {}, e => { captured = e; });
  assert.equal(captured, error);
});
test('interview update refuses a record owned by another recruiter', async t => {
  const Recruiter = require('../src/models/Recruiter'); const Interview = require('../src/models/Interview');
  t.mock.method(Recruiter, 'findOne', async () => ({ _id: 'owner' }));
  t.mock.method(Interview, 'findOneAndUpdate', async filter => { assert.deepEqual(filter, { _id: 'other-interview', recruiter: 'owner' }); return null; });
  await assert.rejects(require('../src/modules/interviews/interview.service').update('user', 'other-interview', { result: 'pass' }), { status: 404 });
});
test('interview update rejects ownership fields at validation boundary', () => {
  assert.equal(require('../src/modules/interviews/interview.validation').update.safeParse({ body: { recruiter: 'other', result: 'pass' } }).success, false);
});
test('job update rejects ownership fields at validation boundary', () => {
  assert.equal(require('../src/modules/jobs/job.validation').updateJob.safeParse({ body: { company: 'other' } }).success, false);
});
test('session validation does not fail open when persistent store fails', async t => {
  const Session = require('../src/models/Session');
  t.mock.method(Session, 'findOneAndUpdate', async () => { throw new Error('store unavailable'); });
  await assert.rejects(require('../src/modules/auth/session.service').validateSession('user', 'sid'), /store unavailable/);
});
test('session revocation is scoped to its user', async t => {
  const Session = require('../src/models/Session');
  t.mock.method(Session, 'deleteOne', async filter => { assert.deepEqual(filter, { userId: 'user', sessionId: 'sid' }); });
  await require('../src/modules/auth/session.service').deleteSession('user', 'sid');
});
test('logout route rejects unauthenticated requests', async () => {
  const http = require('http'); const app = require('../src/app'); const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try { const res = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/logout`, { method: 'POST' }); assert.equal(res.status, 401); }
  finally { await new Promise(resolve => server.close(resolve)); }
});
test('resume download rejects unauthenticated requests', async () => {
  const http = require('http'); const server = http.createServer(require('../src/app'));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try { const res = await fetch(`http://127.0.0.1:${server.address().port}/uploads/resumes/test.pdf`); assert.equal(res.status, 401); }
  finally { await new Promise(resolve => server.close(resolve)); }
});
test('TPO cannot retrieve another institution application', async t => {
  const Application = require('../src/models/Application'); const History = require('../src/models/ApplicationHistory');
  const tpo = require('../src/modules/tpo/tpo.service');
  const chain = { populate() { return this; }, then(resolve) { return Promise.resolve({ student: { _id: 'student', university: 'other-college' }, job: {} }).then(resolve); } };
  t.mock.method(Application, 'findById', () => chain);
  t.mock.method(History, 'find', () => ({ sort: async () => [] }));
  t.mock.method(tpo, 'getTpo', async () => ({ university: { _id: 'my-college' } }));
  await assert.rejects(require('../src/modules/applications/application.service').getOne('application', { id: 'tpo-user', role: 'tpo' }), { status: 404 });
});
test('TPO cannot update another institution application', async t => {
  const Application = require('../src/models/Application'); const tpo = require('../src/modules/tpo/tpo.service');
  const chain = { populate() { return this; }, then(resolve) { return Promise.resolve({ student: { university: 'other-college' }, job: {}, status: 'applied' }).then(resolve); } };
  t.mock.method(Application, 'findById', () => chain);
  t.mock.method(tpo, 'getTpo', async () => ({ university: { _id: 'my-college' } }));
  await assert.rejects(require('../src/modules/applications/application.service').updateStatus({ id: 'tpo-user', role: 'tpo' }, 'application', 'hired'), { status: 404 });
});
test('invalid assessment answers are rejected before saving a result', async t => {
  const studentService = require('../src/modules/student/student.service'); const Assessment = require('../src/models/Assessment');
  t.mock.method(studentService, 'getByUserId', async () => ({ _id: 'student' }));
  t.mock.method(Assessment, 'findById', async () => ({ questions: [{ options: ['a', 'b'], correctIndex: 0 }] }));
  await assert.rejects(require('../src/modules/skills/skill.service').submitAttempt('user', 'assessment', [{ questionIndex: 0, selectedIndex: 7 }]), { errorCode: 'INVALID_ANSWERS' });
});
