const Challenge = require('../../models/Challenge');
const Submission = require('../../models/ChallengeSubmission');
const Evidence = require('../../models/SkillEvidence');
const Student = require('../../models/Student');
const Recruiter = require('../../models/Recruiter');
const { AppError } = require('../../utils/AppError');
const evidence = require('../evidence/evidence.service');
async function recruiter(userId) {
  const r = await Recruiter.findOne({ user: userId });
  if (!r) throw new AppError('Recruiter not found', 404, 'NOT_FOUND');
  return r;
}
async function owned(userId, id) {
  const r = await recruiter(userId);
  const c = await Challenge.findOne({ _id: id, recruiter: r._id });
  if (!c) throw new AppError('Challenge not found', 404, 'NOT_FOUND');
  return c;
}
async function list(user) {
  const filter = user.role === 'recruiter' ? { recruiter: (await recruiter(user.id))._id } : {};
  const items = await Challenge.find(filter).sort({ createdAt: -1 }).limit(100);
  let submissions = [];
  if (user.role === 'student') {
    const student = await Student.findOne({ user: user.id });
    if (!student) throw new AppError('Student not found', 404, 'NOT_FOUND');
    submissions = await Submission.find({ student: student._id }).sort({ createdAt: -1 }).limit(100);
  }
  return { items, submissions };
}
async function create(userId, body) {
  const r = await recruiter(userId);
  if (new Date(body.deadline) <= new Date()) throw new AppError('Choose a future deadline', 422, 'INVALID_DEADLINE');
  return Challenge.create({ ...body, recruiter: r._id, company: r.company });
}
async function submit(userId, id, body) {
  const c = await Challenge.findOne({ _id: id, status: 'open', deadline: { $gt: new Date() } });
  if (!c) throw new AppError('Challenge is closed or deadline passed', 409, 'CHALLENGE_CLOSED');
  const student = await Student.findOne({ user: userId });
  if (!student) throw new AppError('Student not found', 404, 'NOT_FOUND');
  return Submission.create({ ...body, challenge: c._id, student: student._id, submittedAt: new Date() });
}
async function submissions(user, id) {
  const c = user.role === 'recruiter' ? await owned(user.id, id) : await Challenge.findById(id);
  if (!c) throw new AppError('Challenge not found', 404, 'NOT_FOUND');
  let filter = { challenge: c._id };
  if (user.role === 'tpo') {
    const tpo = await require('../tpo/tpo.service').getTpo(user.id);
    const students = await Student.find({ university: tpo.university._id }).distinct('_id');
    filter.student = { $in: students };
  }
  return Submission.find(filter).populate({ path: 'student', select: 'user', populate: { path: 'user', select: 'firstName lastName' } }).sort({ submittedAt: -1 }).limit(100);
}
function reviewScore(rubric, scores) {
  if (scores.length !== rubric.length || scores.some(s => !Number.isFinite(s) || s < 0 || s > 100)) throw new AppError('Score each rubric criterion from 0 to 100', 422, 'INVALID_REVIEW');
  return Math.round(rubric.reduce((sum, r, i) => sum + r.weight * scores[i] / 100, 0));
}
async function review(userId, challengeId, submissionId, body) {
  const c = await owned(userId, challengeId);
  let submission = await Submission.findOne({ _id: submissionId, challenge: c._id });
  if (!submission) throw new AppError('Submission not found', 404, 'NOT_FOUND');
  if (submission.status !== 'reviewed') {
    const review = { evaluator: userId, evaluatedAt: new Date(), score: reviewScore(c.rubric, body.scores), feedback: body.feedback, rubric: c.rubric.map((r, i) => ({ criterion: r.criterion, weight: r.weight, score: body.scores[i] })) };
    submission = await Submission.findOneAndUpdate({ _id: submissionId, challenge: c._id, status: 'submitted' }, { $set: { status: 'reviewed', review } }, { new: true });
    if (!submission) throw new AppError('Already reviewed. Reload the submission.', 409, 'ALREADY_REVIEWED');
  }
  await Evidence.findOneAndUpdate({ source: 'challenge', sourceId: submission._id, skill: c.skill }, { $setOnInsert: {
    student: submission.student, title: c.title, score: submission.review.score, evaluator: `Company reviewer ${submission.review.evaluator}`,
    evaluatedAt: submission.review.evaluatedAt, rubric: submission.review.rubric, feedback: submission.review.feedback,
    method: 'Company rubric review', limitations: 'Company-evaluated submission; not an independent certification or identity check.',
  } }, { upsert: true });
  await evidence.refreshScores(submission.student);
  return submission;
}
async function close(userId, id) {
  const c = await owned(userId, id); c.status = 'closed'; await c.save(); return c;
}
module.exports = { list, create, submit, submissions, review, close, reviewScore };
