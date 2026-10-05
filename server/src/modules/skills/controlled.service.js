const Assessment = require('../../models/Assessment');
const Attempt = require('../../models/AssessmentAttempt');
const Evidence = require('../../models/SkillEvidence');
const students = require('../student/student.service');
const evidence = require('../evidence/evidence.service');
const { AppError } = require('../../utils/AppError');
const RULES = 'timed-single-submit-v1';

function grade(questions, answers) {
  if (!questions.length || answers.length !== questions.length || new Set(answers.map(a => a.questionIndex)).size !== questions.length || answers.some(a => !Number.isInteger(a.questionIndex) || !Number.isInteger(a.selectedIndex) || a.selectedIndex < 0 || !questions[a.questionIndex] || a.selectedIndex >= questions[a.questionIndex].options.length)) {
    throw new AppError('Provide one valid answer for every question', 422, 'INVALID_ANSWERS');
  }
  return Math.round(100 * answers.filter(a => questions[a.questionIndex].correctIndex === a.selectedIndex).length / questions.length);
}
function publicAttempt(attempt) {
  const item = attempt.toObject ? attempt.toObject() : { ...attempt };
  delete item.questionSnapshot;
  return item;
}
async function start(userId, assessmentId, rulesVersion) {
  if (rulesVersion !== RULES) throw new AppError('Accept the current assessment rules', 422, 'RULES_REQUIRED');
  const student = await students.getByUserId(userId);
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment || !assessment.questions.length) throw new AppError('Assessment unavailable', 404, 'NOT_FOUND');
  // One lifetime controlled attempt per assessment; practice remains repeatable.
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + Math.max(1, assessment.durationMinutes || 20) * 60000);
  const snapshot = JSON.parse(JSON.stringify(assessment.questions));
  const attempt = await Attempt.findOneAndUpdate({ student: student._id, assessment: assessment._id, mode: 'verified' }, { $setOnInsert: {
    skill: assessment.skill, mode: 'verified', status: 'started', startedAt, expiresAt, rulesVersion: RULES, questionSnapshot: snapshot,
  } }, { upsert: true, new: true, setDefaultsOnInsert: true }).select('+questionSnapshot');
  if (attempt.status !== 'started' || new Date(attempt.expiresAt) <= startedAt) throw new AppError('This controlled attempt has ended. You can continue in practice mode.', 409, 'ATTEMPT_ENDED');
  return { attempt: publicAttempt(attempt), title: assessment.title, serverTime: startedAt, questions: attempt.questionSnapshot.map(({ correctIndex, ...q }) => q) };
}
async function record(attempt) {
  await Evidence.findOneAndUpdate({ source: 'assessment', sourceId: attempt._id, skill: attempt.skill }, { $setOnInsert: {
    student: attempt.student, title: `${attempt.skill} controlled assessment`, score: attempt.score,
    evaluator: 'Assessment answer-key evaluator', evaluatedAt: attempt.submittedAt,
    method: RULES, limitations: 'Server-timed and single-submit. Identity, external assistance and browser activity are not monitored.',
  } }, { upsert: true });
  await evidence.refreshScores(attempt.student);
}
async function submit(userId, id, answers) {
  const student = await students.getByUserId(userId);
  let attempt = await Attempt.findOne({ _id: id, student: student._id, mode: 'verified' }).select('+questionSnapshot');
  if (!attempt) throw new AppError('Attempt not found', 404, 'NOT_FOUND');
  // Repeated requests can safely recover evidence after a partial database failure.
  if (attempt.status === 'submitted') { await record(attempt); return { attempt: publicAttempt(attempt), score: attempt.score }; }
  const now = new Date();
  if (attempt.status !== 'started' || new Date(attempt.expiresAt) <= now) throw new AppError('Assessment deadline passed', 409, 'ATTEMPT_EXPIRED');
  const score = grade(attempt.questionSnapshot, answers);
  attempt = await Attempt.findOneAndUpdate({ _id: id, student: student._id, status: 'started', expiresAt: { $gt: now } }, { $set: { status: 'submitted', submittedAt: now, answers, score } }, { new: true });
  if (!attempt) throw new AppError('Attempt already ended; retry to retrieve its result', 409, 'ATTEMPT_ENDED');
  await record(attempt);
  return { attempt: publicAttempt(attempt), score };
}
module.exports = { start, submit, grade, RULES };
