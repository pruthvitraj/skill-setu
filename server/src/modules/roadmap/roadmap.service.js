const Roadmap = require('../../models/Roadmap');
const studentService = require('../student/student.service');
const ai = require('./roadmap.ai');
const { AppError } = require('../../utils/AppError');

async function generate(userId, targetRole) {
  const student = await studentService.getByUserId(userId);
  if (typeof targetRole !== 'string' || !targetRole.trim() || targetRole.length>200) throw new AppError('Select a single target role', 400, 'TARGET_REQUIRED');
  targetRole = targetRole.trim();
  const generated = await ai.generate({ student, targetRole });
  const roadmap = await Roadmap.create({
    student: student._id,
    targetRole,
    active: true,
    ...generated,
  });
  await Roadmap.updateMany({ student: student._id, _id: { $ne: roadmap._id } }, { active: false });
  student.targetRole = targetRole; await student.save();
  return roadmap;
}

async function current(userId) {
  const student = await studentService.getByUserId(userId);
  return Roadmap.findOne({ student: student._id, active: true });
}

async function toggleItem(userId, itemId, completed) {
  if(typeof completed!=='boolean')throw new AppError('Completion must be true or false',422,'INVALID_COMPLETION');
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
