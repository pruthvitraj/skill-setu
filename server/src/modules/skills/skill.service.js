const Assessment = require('../../models/Assessment');
const AssessmentAttempt = require('../../models/AssessmentAttempt');
const SkillScore = require('../../models/SkillScore');
const Skill = require('../../models/Skill');
const studentService = require('../student/student.service');
const { AppError } = require('../../utils/AppError');

async function listAssessments() {
  return Assessment.find().select('-questions.correctIndex');
}

async function getAssessment(id) {
  const a = await Assessment.findById(id).select('-questions.correctIndex');
  if (!a) throw new AppError('Assessment not found', 404, 'NOT_FOUND');
  return a;
}

async function submitAttempt(userId, assessmentId, answers) {
  const student = await studentService.getByUserId(userId);
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) throw new AppError('Assessment not found', 404, 'NOT_FOUND');

  if (!assessment.questions.length) throw new AppError('Assessment has no questions', 400, 'EMPTY_ASSESSMENT');
  const indexes = new Set(answers.map(a => a.questionIndex));
  if (answers.length !== assessment.questions.length || indexes.size !== answers.length || answers.some(a => !assessment.questions[a.questionIndex] || a.selectedIndex >= assessment.questions[a.questionIndex].options.length)) {
    throw new AppError('Provide one valid answer for every question', 422, 'INVALID_ANSWERS');
  }
  let correct = 0;
  const topicMap = {};
  assessment.questions.forEach((q, i) => {
    const picked = answers.find((a) => a.questionIndex === i);
    const ok = picked && picked.selectedIndex === q.correctIndex;
    if (ok) correct += 1;
    const topic = q.topic || 'general';
    if (!topicMap[topic]) topicMap[topic] = { total: 0, correct: 0 };
    topicMap[topic].total += 1;
    if (ok) topicMap[topic].correct += 1;
  });
  const score = Math.round((correct / assessment.questions.length) * 100);
  const topicScores = Object.entries(topicMap).map(([topic, v]) => ({
    topic,
    score: Math.round((v.correct / v.total) * 100),
  }));

  const attempt = await AssessmentAttempt.create({
    student: student._id,
    assessment: assessment._id,
    skill: assessment.skill,
    answers,
    score,
    topicScores,
    difficulty: 'mixed',
  });

  const skillScore = await SkillScore.findOneAndUpdate(
    { student: student._id, skill: assessment.skill },
    {},
    { upsert: true, new: true }
  );
  skillScore.overall = score;
  skillScore.topics = topicScores.map((t) => ({ name: t.topic, score: t.score }));
  skillScore.history.push({ score, at: new Date() });
  await skillScore.save();

  const all = await SkillScore.find({ student: student._id });
  student.skillScore = Math.round(all.reduce((s, x) => s + x.overall, 0) / (all.length || 1));
  await student.save();

  return { attempt, score, topicScores };
}

async function tracker(userId) {
  const student = await studentService.getByUserId(userId);
  const scores = await SkillScore.find({ student: student._id });
  const history = await AssessmentAttempt.find({ student: student._id }).sort({ createdAt: -1 }).limit(20);
  return { scores, history, overall: student.skillScore };
}

async function catalog() {
  return Skill.find().sort({ name: 1 });
}

module.exports = { listAssessments, getAssessment, submitAttempt, tracker, catalog };
