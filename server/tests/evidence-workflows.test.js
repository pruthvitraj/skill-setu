const { test } = require('node:test');
const assert = require('node:assert/strict');
const controlled = require('../src/modules/skills/controlled.service');
const challenges = require('../src/modules/challenges/challenge.service');
const chain = value => ({ select() { return this; }, sort() { return this; }, populate() { return this; }, limit() { return this; }, then(resolve, reject) { return Promise.resolve(value).then(resolve, reject); } });
test('controlled grading rejects duplicated, missing, negative and invalid options', () => {
  const questions = [{ options: ['a', 'b'], correctIndex: 1 }, { options: ['a', 'b'], correctIndex: 0 }];
  for (const answers of [[{ questionIndex: 0, selectedIndex: 1 }], [{ questionIndex: 0, selectedIndex: 1 }, { questionIndex: 0, selectedIndex: 0 }], [{ questionIndex: 0, selectedIndex: -1 }, { questionIndex: 1, selectedIndex: 0 }], [{ questionIndex: 0, selectedIndex: 1 }, { questionIndex: 1, selectedIndex: 2 }]]) assert.throws(() => controlled.grade(questions, answers), { errorCode: 'INVALID_ANSWERS' });
  assert.equal(controlled.grade(questions, [{ questionIndex: 1, selectedIndex: 0 }, { questionIndex: 0, selectedIndex: 1 }]), 100);
});
test('controlled start requires explicit current rules', async () => {
  await assert.rejects(controlled.start('user', 'assessment', 'old-rules'), { errorCode: 'RULES_REQUIRED' });
});
test('controlled attempt serves its snapshot without the answer key', async t => {
  t.mock.method(require('../src/modules/student/student.service'), 'getByUserId', async () => ({ _id: 'student' }));
  t.mock.method(require('../src/models/Assessment'), 'findById', async () => ({ _id: 'assessment', title: 'SQL', skill: 'SQL', durationMinutes: 20, questions: [{ prompt: 'NEW', options: ['a','b'], correctIndex: 1 }] }));
  t.mock.method(require('../src/models/AssessmentAttempt'), 'findOneAndUpdate', (filter, update) => {
    assert.equal(filter.mode, 'verified'); assert.equal(update.$setOnInsert.rulesVersion, controlled.RULES);
    return chain({ _id: 'attempt', status: 'started', expiresAt: new Date(Date.now() + 60000), questionSnapshot: [{ prompt: 'ORIGINAL', options: ['a','b'], correctIndex: 0 }] });
  });
  const result = await controlled.start('user', 'assessment', controlled.RULES);
  assert.equal(result.questions[0].prompt, 'ORIGINAL'); assert.equal(result.questions[0].correctIndex, undefined); assert.equal(result.attempt.questionSnapshot, undefined);
});
test('expired controlled attempts cannot submit', async t => {
  t.mock.method(require('../src/modules/student/student.service'), 'getByUserId', async () => ({ _id: 'student' }));
  t.mock.method(require('../src/models/AssessmentAttempt'), 'findOne', filter => { assert.equal(filter.student, 'student'); return chain({ status: 'started', expiresAt: new Date(Date.now() - 1) }); });
  await assert.rejects(controlled.submit('user', 'attempt', []), { errorCode: 'ATTEMPT_EXPIRED' });
});
test('practice does not write competency scores or evidence', async t => {
  t.mock.method(require('../src/modules/student/student.service'), 'getByUserId', async () => ({ _id: 'student' }));
  t.mock.method(require('../src/models/Assessment'), 'findById', async () => ({ _id: 'assessment', skill: 'SQL', questions: [{ options: ['a','b'], correctIndex: 0 }] }));
  t.mock.method(require('../src/models/AssessmentAttempt'), 'create', async body => { assert.equal(body.mode, 'practice'); return body; });
  t.mock.method(require('../src/models/SkillScore'), 'findOneAndUpdate', () => { throw new Error('Practice must not update scores'); });
  t.mock.method(require('../src/models/SkillEvidence'), 'findOneAndUpdate', () => { throw new Error('Practice must not create evidence'); });
  assert.equal((await require('../src/modules/skills/skill.service').submitAttempt('user', 'assessment', [{ questionIndex: 0, selectedIndex: 0 }])).score, 100);
});
test('rubric review calculates weighted scores and validates every criterion', () => {
  assert.equal(challenges.reviewScore([{ weight: 25 }, { weight: 75 }], [100, 60]), 70);
  assert.throws(() => challenges.reviewScore([{ weight: 100 }], []), { errorCode: 'INVALID_REVIEW' });
  assert.throws(() => challenges.reviewScore([{ weight: 100 }], [101]), { errorCode: 'INVALID_REVIEW' });
});
test('challenge validation rejects ownership injection, excessive effort and incorrect weights', () => {
  const schema = require('../src/modules/challenges/challenge.routes').createBody;
  const body = { title: 'Checkout', brief: 'An anonymized checkout flow learning exercise.', skill: 'UX', expectedHours: 2, deadline: new Date(Date.now() + 86400000).toISOString(), rubric: [{ criterion: 'Quality', weight: 100 }] };
  assert.equal(schema.safeParse(body).success, true);
  for (const patch of [{ recruiter: 'other' }, { expectedHours: 9 }, { rubric: [{ criterion: 'Quality', weight: 40 }] }, { rubric: [{ criterion: 'Quality', weight: 50 }, { criterion: 'quality', weight: 50 }] }]) assert.equal(schema.safeParse({ ...body, ...patch }).success, false);
});
test('another recruiter cannot review a challenge', async t => {
  t.mock.method(require('../src/models/Recruiter'), 'findOne', async () => ({ _id: 'owner' }));
  t.mock.method(require('../src/models/Challenge'), 'findOne', async filter => { assert.deepEqual(filter, { _id: 'challenge', recruiter: 'owner' }); return null; });
  await assert.rejects(challenges.review('user', 'challenge', 'submission', { scores: [100], feedback: 'Looks good.' }), { status: 404 });
});
test('TPO challenge submissions are scoped to institution students', async t => {
  t.mock.method(require('../src/models/Challenge'), 'findById', async () => ({ _id: 'challenge' }));
  t.mock.method(require('../src/modules/tpo/tpo.service'), 'getTpo', async () => ({ university: { _id: 'college' } }));
  t.mock.method(require('../src/models/Student'), 'find', filter => { assert.deepEqual(filter, { university: 'college' }); return { distinct: async () => ['my-student'] }; });
  t.mock.method(require('../src/models/ChallengeSubmission'), 'find', filter => { assert.deepEqual(filter, { challenge: 'challenge', student: { $in: ['my-student'] } }); return chain([]); });
  assert.deepEqual(await challenges.submissions({ id: 'tpo', role: 'tpo' }, 'challenge'), []);
});
test('private recruiter evidence is inaccessible', async t => {
  t.mock.method(require('../src/models/Student'), 'findOne', async filter => { assert.equal(filter['privacy.showScores'].$ne, false); assert.equal(filter['privacy.showProfile'].$ne, false); return null; });
  await assert.rejects(require('../src/modules/evidence/evidence.service').accessibleProfile({ id: 'recruiter', role: 'recruiter' }, 'private'), { status: 404 });
});
test('TPO cannot retrieve evidence from another institution', async t => {
  t.mock.method(require('../src/modules/tpo/tpo.service'), 'getTpo', async () => ({ university: { _id: 'college' } }));
  t.mock.method(require('../src/models/Student'), 'findOne', async filter => { assert.deepEqual(filter, { _id: 'other-student', university: 'college' }); return null; });
  await assert.rejects(require('../src/modules/evidence/evidence.service').accessibleProfile({ id: 'tpo', role: 'tpo' }, 'other-student'), { status: 404 });
});
test('assessment resubmission recovers evidence without changing the original grade', async t => {
  const attempt = { _id: 'attempt', student: 'student', skill: 'SQL', status: 'submitted', score: 75, submittedAt: new Date() };
  t.mock.method(require('../src/modules/student/student.service'), 'getByUserId', async () => ({ _id: 'student' }));
  t.mock.method(require('../src/models/AssessmentAttempt'), 'findOne', () => chain(attempt));
  t.mock.method(require('../src/models/SkillEvidence'), 'findOneAndUpdate', async (filter, update) => {
    assert.deepEqual(filter, { source: 'assessment', sourceId: 'attempt', skill: 'SQL' });
    assert.equal(update.$setOnInsert.score, 75); assert.equal(update.$set, undefined);
  });
  t.mock.method(require('../src/modules/evidence/evidence.service'), 'refreshScores', async id => assert.equal(id, 'student'));
  assert.equal((await controlled.submit('user', 'attempt', [{ questionIndex: 0, selectedIndex: 999 }])).score, 75);
});
test('challenge review retry keeps the first evaluator and score', async t => {
  t.mock.method(require('../src/models/Recruiter'), 'findOne', async () => ({ _id: 'owner' }));
  t.mock.method(require('../src/models/Challenge'), 'findOne', async () => ({ _id: 'challenge', title: 'Flow', skill: 'UX', rubric: [{ criterion: 'Quality', weight: 100 }] }));
  t.mock.method(require('../src/models/ChallengeSubmission'), 'findOne', async () => ({ _id: 'submission', student: 'student', status: 'reviewed', review: { evaluator: 'original-reviewer', score: 70, evaluatedAt: new Date(), feedback: 'Original feedback', rubric: [] } }));
  t.mock.method(require('../src/models/ChallengeSubmission'), 'findOneAndUpdate', () => { throw new Error('Final review must remain immutable'); });
  t.mock.method(require('../src/models/SkillEvidence'), 'findOneAndUpdate', async (filter, update) => { assert.equal(update.$setOnInsert.score, 70); assert.match(update.$setOnInsert.evaluator, /original-reviewer/); });
  t.mock.method(require('../src/modules/evidence/evidence.service'), 'refreshScores', async () => {});
  assert.equal((await challenges.review('user', 'challenge', 'submission', { scores: [100], feedback: 'Changed feedback' })).review.score, 70);
});
test('challenge deadlines are enforced before a student submission is stored', async t => {
  t.mock.method(require('../src/models/Challenge'), 'findOne', async filter => { assert.equal(filter.status, 'open'); assert.ok(filter.deadline.$gt instanceof Date); return null; });
  t.mock.method(require('../src/models/ChallengeSubmission'), 'create', () => { throw new Error('Must not write'); });
  await assert.rejects(challenges.submit('student', 'challenge', {}), { errorCode: 'CHALLENGE_CLOSED' });
});
