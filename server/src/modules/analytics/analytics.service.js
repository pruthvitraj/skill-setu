const Student = require('../../models/Student');
const Application = require('../../models/Application');
const tpoService = require('../tpo/tpo.service');
const recruiterService = require('../recruiter/recruiter.service');
const studentService = require('../student/student.service');
const SkillScore = require('../../models/SkillScore');
const { ROLES } = require('../../utils/constants');

async function forUser(reqUser) {
  if (reqUser.role === ROLES.STUDENT) {
    const student = await studentService.getByUserId(reqUser.id);
    const scores = await SkillScore.find({ student: student._id, evidenceBased: true });
    const apps = await Application.aggregate([{ $match: { student: student._id } }, { $group: { _id: '$status', n: { $sum: 1 } } }]);
    return { skillProgress: scores, applicationStatus: apps, atsScore: student.atsScore };
  }
  if (reqUser.role === ROLES.TPO) {
    return tpoService.dashboard(reqUser.id);
  }
  return recruiterService.dashboard(reqUser.id);
}

module.exports = { forUser };
