const Roadmap = require('../../models/Roadmap');
const studentService = require('../student/student.service');
const ai = require('./roadmap.ai');
const { AppError } = require('../../utils/AppError');

async function generate(userId, targetRole) {
  const student = await studentService.getByUserId(userId);
  if (!targetRole) throw new AppError('Select a single target role', 400, 'TARGET_REQUIRED');
  await Roadmap.updateMany({ student: student._id }, { active: false });
  student.targetRole = targetRole;
  await student.save();
  const generated = await ai.generate({ student, targetRole });
  return Roadmap.create({
    student: student._id,
    targetRole,
    active: true,
    ...generated,
  });
}

async function current(userId) {
  const student = await studentService.getByUserId(userId);
  return Roadmap.findOne({ student: student._id, active: true });
}

async function toggleItem(userId, itemId, completed) {
  const student = await studentService.getByUserId(userId);
  const roadmap = await Roadmap.findOne({ student: student._id, active: true });
  if (!roadmap) throw new AppError('No active roadmap', 404, 'NOT_FOUND');
  const item = roadmap.items.id(itemId);
  if (!item) throw new AppError('Item not found', 404, 'NOT_FOUND');
  item.completed = completed;
  await roadmap.save();
  return roadmap;
}

module.exports = { generate, current, toggleItem };
