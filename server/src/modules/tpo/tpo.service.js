const Tpo = require('../../models/Tpo');
const Student = require('../../models/Student');
const Company = require('../../models/Company');
const PlacementDrive = require('../../models/PlacementDrive');
const Interview = require('../../models/Interview');
const Application = require('../../models/Application');
const Announcement = require('../../models/Announcement');
const { AppError } = require('../../utils/AppError');
const { paginated } = require('../../utils/pagination');
const skillAnalytics = require('../skills/skillAnalytics.service');

async function getTpo(userId) {
  const tpo = await Tpo.findOne({ user: userId }).populate('university');
  if (!tpo) throw new AppError('TPO profile not found', 404, 'NOT_FOUND');
  return tpo;
}

async function dashboard(userId) {
  const tpo = await getTpo(userId);
  const uni = tpo.university._id;
  const total = await Student.countDocuments({ university: uni });
  const placed = await Student.countDocuments({ university: uni, placementStatus: 'placed' });
  const available = await Student.countDocuments({ university: uni, placementStatus: 'available' });
  const companies = await Company.countDocuments();
  const drives = await PlacementDrive.countDocuments({ university: uni });
  const interviews = await Interview.countDocuments();
  return {
    totalStudents: total,
    placed,
    available,
    interviews,
    upcomingDrives: drives,
    companies,
    placementRate: total ? Math.round((placed / total) * 100) : 0,
  };
}

async function students(userId, { q, department, batch, status, page, limit }) {
  const tpo = await getTpo(userId);
  const filter = { university: tpo.university._id };
  if (department) filter.department = department;
  if (batch) filter.batch = batch;
  if (status) filter.placementStatus = status;
  const [items, total] = await Promise.all([
    Student.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('department', 'name')
      .skip((page - 1) * limit)
      .limit(limit),
    Student.countDocuments(filter),
  ]);
  return paginated(items, total, page, limit);
}

async function studentDetails(userId, studentId) {
  const tpo = await getTpo(userId);
  const student = await Student.findOne({ _id: studentId, university: tpo.university._id })
    .populate('user', 'firstName lastName email phone')
    .populate('department', 'name');
  if (!student) throw new AppError('Student not found', 404, 'NOT_FOUND');
  const applications = await Application.find({ student: student._id }).populate('job', 'title');
  return { student, applications };
}

async function internships(userId) {
  const tpo = await getTpo(userId);
  const students = await Student.find({ university: tpo.university._id }).select('_id');
  return Application.find({ student: { $in: students.map((s) => s._id) } })
    .populate({ path: 'job', match: { jobType: 'internship' }, populate: { path: 'company', select: 'name' } })
    .populate({ path: 'student', populate: { path: 'user', select: 'firstName lastName' } });
}

async function announcements(userId) {
  const tpo = await getTpo(userId);
  return Announcement.find({ university: tpo.university._id }).sort({ createdAt: -1 });
}

async function createAnnouncement(userId, payload) {
  const tpo = await getTpo(userId);
  return Announcement.create({ ...payload, university: tpo.university._id, author: userId });
}

async function companies() {
  return Company.find().sort({ name: 1 });
}

async function skills(userId) {
  const tpo = await getTpo(userId);
  return skillAnalytics.universitySkillAnalytics(tpo.university._id);
}

async function reports(userId, type) {
  const dash = await dashboard(userId);
  return { type, generatedAt: new Date(), summary: dash };
}

module.exports = {
  getTpo,
  dashboard,
  students,
  studentDetails,
  internships,
  announcements,
  createAnnouncement,
  companies,
  skills,
  reports,
};
