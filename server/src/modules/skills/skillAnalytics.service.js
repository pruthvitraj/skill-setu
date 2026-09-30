const SkillScore = require('../../models/SkillScore');
const Student = require('../../models/Student');

async function universitySkillAnalytics(universityId) {
  const students = await Student.find({ university: universityId }).select('_id department batch');
  const ids = students.map((s) => s._id);
  const scores = await SkillScore.find({ student: { $in: ids } });

  const bySkill = {};
  scores.forEach((s) => {
    if (!bySkill[s.skill]) bySkill[s.skill] = [];
    bySkill[s.skill].push(s.overall);
  });

  const distribution = Object.entries(bySkill).map(([skill, arr]) => ({
    skill,
    avg: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length),
    count: arr.length,
  }));

  const weak = [...distribution].sort((a, b) => a.avg - b.avg).slice(0, 5);
  const top = [...distribution].sort((a, b) => b.avg - a.avg).slice(0, 5);

  return {
    participation: students.length ? Math.round((new Set(scores.map((s) => String(s.student))).size / students.length) * 100) : 0,
    distribution,
    weak,
    top,
    studentCount: students.length,
  };
}

module.exports = { universitySkillAnalytics };
