const Student = require('../../models/Student');
const Application = require('../../models/Application');
const Interview = require('../../models/Interview');
const Course = require('../../models/Course');
const Job = require('../../models/Job');
const Notification = require('../../models/Notification');
const Roadmap = require('../../models/Roadmap');
const { AppError } = require('../../utils/AppError');
const { JOB_STATUS } = require('../../utils/constants');

async function getByUserId(userId) {
  // Older partial registrations can have a user without a role profile.
  // Repair only the authenticated student; never infer institutional membership.
  if (!await Student.exists({ user: userId })) {
    const user = await require('../../models/User').findOne({ _id: userId, role: 'student', isActive: true });
    if (!user) throw new AppError('Student profile not found', 404, 'NOT_FOUND');
    await Student.updateOne({ user: userId }, { $setOnInsert: { user: userId } }, { upsert: true, setDefaultsOnInsert: true });
  }
  const student = await Student.findOne({ user: userId })
    .populate('university', 'name')
    .populate('department', 'name')
    .populate('user', 'firstName lastName email phone avatarUrl');
  if (!student) throw new AppError('Student profile not found', 404, 'NOT_FOUND');
  return student;
}

function completion(student) {
  const checks = [
    student.headline,
    student.bio,
    student.education?.length,
    student.skills?.length,
    student.projects?.length,
    student.experience?.length,
    student.targetRole,
    student.atsScore > 0,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

async function updateMe(userId, patch) {
  const student = await getByUserId(userId);
  const allowed = ['bio', 'headline', 'location', 'batch', 'enrollmentNo', 'privacy', 'targetRole'];
  allowed.forEach((k) => {
    if (patch[k] !== undefined) student[k] = patch[k];
  });
  student.profileCompletion = completion(student);
  await student.save();
  return student;
}

async function addSub(userId, field, item) {
  const student = await getByUserId(userId);
  student[field].push(item);
  student.profileCompletion = completion(student);
  await student.save();
  return student;
}

async function updateSub(userId, field, itemId, patch) {
  const student = await getByUserId(userId);
  const sub = student[field].id(itemId);
  if (!sub) throw new AppError('Item not found', 404, 'NOT_FOUND');
  Object.assign(sub, patch);
  student.profileCompletion = completion(student);
  await student.save();
  return student;
}

async function removeSub(userId, field, itemId) {
  const student = await getByUserId(userId);
  const sub = student[field].id(itemId);
  if (!sub) throw new AppError('Item not found', 404, 'NOT_FOUND');
  sub.deleteOne();
  student.profileCompletion = completion(student);
  await student.save();
  return student;
}

async function dashboard(userId) {
  const student = await getByUserId(userId);
  const [applications, interviews, jobs, courses, notifications, roadmap] = await Promise.all([
    Application.find({ student: student._id }).populate('resume', 'fileName ats createdAt').populate('job', 'title location').limit(8).sort({ createdAt: -1 }),
    Interview.find({ candidate: student._id, status: 'scheduled', scheduledAt: { $gte: new Date() } })
      .populate('job', 'title')
      .sort({ scheduledAt: 1 })
      .limit(5),
    Job.find({ status: JOB_STATUS.PUBLISHED }).populate('company', 'name').limit(5).sort({ createdAt: -1 }),
    Course.find(student.targetRole ? { skill: new RegExp(require('../../utils/text').escapeRegex(student.targetRole.split(' ')[0]), 'i') } : {}).limit(5),
    Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(6),
    Roadmap.findOne({ student: student._id, active: true }),
  ]);
  return {
    student,
    profileCompletion: student.profileCompletion || completion(student),
    atsScore: student.atsScore,
    skillScore: student.skillScore,
    applications,
    interviews,
    recommendedJobs: jobs,
    recommendedCourses: courses,
    notifications,
    roadmap,
  };
}

async function network({ page = 1, limit = 10, q }) {
  const filter = { 'privacy.showProfile': { $ne: false } };
  const skip = (page - 1) * limit;
  const students = await Student.find(filter)
    .populate('user', 'firstName lastName')
    .populate('university', 'name')
    .skip(skip)
    .limit(limit);
  const total = await Student.countDocuments(filter);
  return { items: students.map(require('../../utils/profilePrivacy').visibleStudent), pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } };
}

module.exports = {
  getByUserId,
  updateMe,
  addSub,
  updateSub,
  removeSub,
  dashboard,
  network,
  completion,
};
