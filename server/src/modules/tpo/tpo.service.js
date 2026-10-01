const Tpo = require('../../models/Tpo');
const Student = require('../../models/Student');
const Company = require('../../models/Company');
const Department = require('../../models/Department');
const User = require('../../models/User');
const PlacementDrive = require('../../models/PlacementDrive');
const Interview = require('../../models/Interview');
const Application = require('../../models/Application');
const Announcement = require('../../models/Announcement');
const { AppError } = require('../../utils/AppError');
const { paginated } = require('../../utils/pagination');
const skillAnalytics = require('../skills/skillAnalytics.service');
const driveService = require('../placement/drive.service');

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
  const companies = await PlacementDrive.distinct('company', { university: uni });
  const studentIds = await Student.find({ university: uni }).distinct('_id');
  const drives = await PlacementDrive.countDocuments({ university: uni, scheduledDate: { $gte: new Date() }, status: { $in: ['approved', 'rescheduled', 'active'] } });
  const interviews = await Interview.countDocuments({ candidate: { $in: studentIds } });
  return {
    totalStudents: total,
    placed,
    available,
    interviews,
    upcomingDrives: drives,
    companies: companies.length,
    placementRate: total ? Math.round((placed / total) * 100) : 0,
  };
}

async function studentFilters(userId) {
  const tpo = await getTpo(userId);
  const university = tpo.university._id;
  const [departments, batches, skills] = await Promise.all([
    Department.find({ university }).select('_id name code').sort({ name: 1 }),
    Student.distinct('batch', { university, batch: { $nin: [null, ''] } }),
    Student.aggregate([
      { $match: { university } },
      { $unwind: '$skills' },
      { $match: { 'skills.name': { $nin: [null, ''] } } },
      { $group: { _id: '$skills.name' } },
      { $sort: { _id: 1 } },
    ]),
  ]);
  return { departments, batches: batches.filter(Boolean).sort(), skills: skills.map((item) => item._id) };
}

async function students(userId, { q, department, batch, skill, status, interviewStatus, page, limit }) {
  const tpo = await getTpo(userId);
  const filter = { university: tpo.university._id };
  if (department) filter.department = department;
  if (batch) filter.batch = batch;
  if (skill) filter['skills.name'] = { $regex: skill, $options: 'i' };
  if (status) filter.placementStatus = status;
  if (q?.trim()) {
    const users = await User.find({ $or: [
      { firstName: { $regex: q.trim(), $options: 'i' } },
      { lastName: { $regex: q.trim(), $options: 'i' } },
      { email: { $regex: q.trim(), $options: 'i' } },
    ] }).select('_id');
    filter.$or = [{ enrollmentNo: { $regex: q.trim(), $options: 'i' } }, { user: { $in: users.map((item) => item._id) } }];
  }
  if (interviewStatus) {
    const candidates = await Interview.distinct('candidate', { status: interviewStatus });
    filter._id = { $in: candidates };
  }
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

async function companies(userId) {
  const tpo = await getTpo(userId);
  const drives = await PlacementDrive.find({ university: tpo.university._id }).distinct('company');
  return Company.find({ _id: { $in: drives } }).sort({ name: 1 });
}

async function placementDrives(userId) {
  return driveService.listForTpo(userId);
}

async function reviewPlacementDrive(userId, driveId, payload) {
  return driveService.review(userId, driveId, payload);
}

async function applications(userId, { status } = {}) {
  const tpo = await getTpo(userId);
  const students = await Student.find({ university: tpo.university._id }).select('_id');
  const filter = { student: { $in: students.map((student) => student._id) } };
  if (status && status !== 'all') filter.status = status;
  return Application.find(filter)
    .populate({ path: 'student', populate: { path: 'user', select: 'firstName lastName email' } })
    .populate({ path: 'job', populate: { path: 'company', select: 'name' } })
    .sort({ createdAt: -1 });
}

async function updateApplicationStatus(userId, applicationId, payload) {
  const tpo = await getTpo(userId);
  const students = await Student.find({ university: tpo.university._id }).select('_id');
  const application = await Application.findOne({ _id: applicationId, student: { $in: students.map((student) => student._id) } });
  if (!application) throw new AppError('Application not found', 404, 'NOT_FOUND');
  const applicationService = require('../applications/application.service');
  return applicationService.updateStatus({ id: userId, role: 'tpo' }, applicationId, payload.status, payload.note);
}

async function interviews(userId) {
  const tpo = await getTpo(userId);
  const students = await Student.find({ university: tpo.university._id }).select('_id');
  return Interview.find({ candidate: { $in: students.map((student) => student._id) } })
    .populate({ path: 'candidate', populate: { path: 'user', select: 'firstName lastName email' } })
    .populate({ path: 'job', select: 'title', populate: { path: 'company', select: 'name' } })
    .sort({ scheduledAt: 1 });
}

async function placementAnalytics(userId) {
  const tpo = await getTpo(userId);
  const university = tpo.university._id;
  const [summary, applicationsTotal, selected, interviewsTotal] = await Promise.all([
    dashboard(userId),
    Application.countDocuments({ student: { $in: await Student.find({ university }).distinct('_id') } }),
    Application.countDocuments({ student: { $in: await Student.find({ university }).distinct('_id') }, status: { $in: ['selected', 'hired'] } }),
    Interview.countDocuments({ candidate: { $in: await Student.find({ university }).distinct('_id') } }),
  ]);
  return { ...summary, applications: applicationsTotal, selected, interviews: interviewsTotal, applicationStatus: { applications: applicationsTotal, selected } };
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
  studentFilters,
  students,
  studentDetails,
  internships,
  announcements,
  createAnnouncement,
  companies,
  placementDrives,
  reviewPlacementDrive,
  applications,
  updateApplicationStatus,
  interviews,
  placementAnalytics,
  skills,
  reports,
};
