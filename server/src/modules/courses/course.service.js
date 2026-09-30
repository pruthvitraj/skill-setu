const Course = require('../../models/Course');
const studentService = require('../student/student.service');
const { parsePagination, paginated } = require('../../utils/pagination');

async function list({ skill, page, limit }) {
  const filter = skill ? { skill: new RegExp(skill, 'i') } : {};
  const [items, total] = await Promise.all([
    Course.find(filter).skip((page - 1) * limit).limit(limit),
    Course.countDocuments(filter),
  ]);
  return paginated(items, total, page, limit);
}

async function recommended(userId) {
  const student = await studentService.getByUserId(userId);
  const names = (student.skills || []).map((s) => s.name);
  const missingHint = student.targetRole || names[0] || 'SQL';
  return Course.find({
    $or: [{ skill: new RegExp(missingHint.split(' ')[0], 'i') }, { skill: { $nin: names } }],
  }).limit(12);
}

module.exports = { list, recommended, parsePagination };
