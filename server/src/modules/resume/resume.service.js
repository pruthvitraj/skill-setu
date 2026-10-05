const Resume = require('../../models/Resume');
const { saveBuffer, deleteFile } = require('../../integrations/storage/storage.service');
const mongoose = require('mongoose');
const { AppError } = require('../../utils/AppError');
const { parseBuffer } = require('./resume.parser');
const ats = require('./ats.service');
const studentService = require('../student/student.service');

async function uploadResume(userId, file) {
  const student = await studentService.getByUserId(userId);
  const parsed = await parseBuffer(file.buffer, file.mimetype);
  const analysis = await ats.analyze(parsed, student.targetRole || '');
  const stored = await saveBuffer({
    buffer: file.buffer,
    mimeType: file.mimetype,
    originalName: file.originalname,
    folder: 'resumes',
  });
  const resume = await Resume.create({
    student: student._id,
    fileKey: stored.key,
    fileName: file.originalname,
    parsed,
    ats: analysis,
  });
  student.atsScore = analysis.overall;
  await student.save();
  return resume;
}

async function latest(userId) {
  const student = await studentService.getByUserId(userId);
  return Resume.findOne({ student: student._id }).sort({ createdAt: -1 });
}

async function list(userId) {
  const student = await studentService.getByUserId(userId);
  return Resume.find({ student: student._id }).sort({ createdAt: -1 });
}

async function remove(userId, resumeId) {
  if (!mongoose.isValidObjectId(resumeId)) throw new AppError('Invalid resume id', 400, 'INVALID_ID');
  const student = await studentService.getByUserId(userId);
  const resume = await Resume.findOne({ _id: resumeId, student: student._id });
  if (!resume) throw new AppError('Resume not found', 404, 'NOT_FOUND');
  await deleteFile(resume.fileKey);
  await resume.deleteOne();
  const latestResume = await Resume.findOne({ student: student._id }).sort({ createdAt: -1 });
  student.atsScore = latestResume?.ats?.overall || 0;
  await student.save();
  return resume;
}

module.exports = { uploadResume, latest, list, remove };
