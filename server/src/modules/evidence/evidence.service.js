const Evidence = require('../../models/SkillEvidence');
const Student = require('../../models/Student');
const SkillScore = require('../../models/SkillScore');
const { AppError } = require('../../utils/AppError');

async function profile(studentId) {
  const items = await Evidence.find({ student: studentId }).sort({ evaluatedAt: -1 });
  return { items, policy: 'Evidence describes the recorded evaluation, not identity verification or a hiring guarantee.' };
}
async function accessibleProfile(user, id) {
  let student;
  if (user.role === 'student') student = await Student.findOne({ user: user.id });
  else if (user.role === 'tpo') {
    const tpo = await require('../tpo/tpo.service').getTpo(user.id);
    student = await Student.findOne({ _id: id, university: tpo.university._id });
  } else if (user.role === 'recruiter') {
    student = await Student.findOne({ _id: id, 'privacy.showProfile': { $ne: false }, 'privacy.showScores': { $ne: false } });
  }
  if (!student) throw new AppError('Evidence profile not found', 404, 'NOT_FOUND');
  return profile(student._id);
}
async function refreshScores(studentId) {
  const records = await Evidence.find({ student: studentId }).sort({ evaluatedAt: -1 });
  const latest = new Map();
  for (const record of records) if (!latest.has(record.skill)) latest.set(record.skill, record);
  for (const [skill, record] of latest) {
    await SkillScore.findOneAndUpdate({ student: studentId, skill }, { $set: { overall: record.score, topics: [], evidenceBased: true } }, { upsert: true });
  }
  const values = [...latest.values()];
  await Student.updateOne({ _id: studentId }, { $set: { skillScore: values.length ? Math.round(values.reduce((sum, e) => sum + e.score, 0) / values.length) : 0 } });
}
module.exports = { profile, accessibleProfile, refreshScores };
