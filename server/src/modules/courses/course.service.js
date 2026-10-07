const Course = require('../../models/Course');
const studentService = require('../student/student.service');
const { parsePagination, paginated } = require('../../utils/pagination');

async function list({ skill, page, limit }) {
  const filter = skill ? { skill: new RegExp(require('../../utils/text').escapeRegex(skill), 'i') } : {};
  const [items, total] = await Promise.all([
    Course.find(filter).skip((page - 1) * limit).limit(limit),
    Course.countDocuments(filter),
  ]);
  return paginated(items, total, page, limit);
}

async function recommended(userId) {
  const student = await studentService.getByUserId(userId);
  return Course.find(require('../../utils/learningRole')
    .courseFilterForRole(student.targetRole))
    .sort({ title: 1, _id: 1 }).limit(12);
}

module.exports = { list, recommended, parsePagination };
