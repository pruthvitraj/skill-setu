const Application = require('../../models/Application');
const ApplicationHistory = require('../../models/ApplicationHistory');
const Job = require('../../models/Job');
const Recruiter = require('../../models/Recruiter');
const studentService = require('../student/student.service');
const matching = require('../jobs/jobMatching.service');
const { notify } = require('../notifications/notification.service');
const { AppError } = require('../../utils/AppError');
const { APPLICATION_STATUS, JOB_STATUS } = require('../../utils/constants');
const { audit } = require('../../utils/audit');
const { paginated } = require('../../utils/pagination');

async function apply(userId, jobId, coverNote) {
  const student = await studentService.getByUserId(userId);
  const job = await Job.findById(jobId);
  if (!job || job.status !== JOB_STATUS.PUBLISHED) throw new AppError('Job is not open', 400, 'JOB_CLOSED');
  const exists = await Application.findOne({ student: student._id, job: job._id });
  if (exists) throw new AppError('You have already applied for this job', 409, 'ALREADY_APPLIED');
  const match = matching.matchStudentToJob(student, job);
  const application = await Application.create({
    student: student._id,
    job: job._id,
    coverNote,
    matchScore: match.score,
    status: APPLICATION_STATUS.APPLIED,
  });
  await ApplicationHistory.create({
    application: application._id,
    fromStatus: null,
    toStatus: APPLICATION_STATUS.APPLIED,
    actor: userId,
  });
  student.placementStatus = 'in_process';
  await student.save();
  return application;
}

async function myApplications(userId) {
  const student = await studentService.getByUserId(userId);
  return Application.find({ student: student._id }).populate({ path: 'job', populate: { path: 'company', select: 'name' } }).sort({ createdAt: -1 });
}

async function updateStatus(actor, applicationId, toStatus, note) {
  const application = await Application.findById(applicationId).populate('student');
  if (!application) throw new AppError('Application not found', 404, 'NOT_FOUND');
  const from = application.status;
  application.status = toStatus;
  await application.save();
  await ApplicationHistory.create({ application: application._id, fromStatus: from, toStatus, actor: actor.id, note });
  audit('application.status', actor.id, { applicationId, from, toStatus });
  const User = require('../../models/User');
  const studentUser = await User.findById(application.student.user);
  if (studentUser) {
    await notify(studentUser._id, {
      type: 'application',
      title: 'Application update',
      body: `Status changed to ${toStatus}`,
      data: { applicationId },
    });
  }
  if (toStatus === APPLICATION_STATUS.HIRED) {
    application.student.placementStatus = 'placed';
    await application.student.save();
  }
  return application;
}

async function listForRecruiter(userId, { status, page, limit }) {
  const recruiter = await Recruiter.findOne({ user: userId });
  const jobs = await Job.find({ recruiter: recruiter._id }).select('_id');
  const filter = { job: { $in: jobs.map((j) => j._id) } };
  if (status) filter.status = status;
  const [items, total] = await Promise.all([
    Application.find(filter)
      .populate({ path: 'student', populate: { path: 'user', select: 'firstName lastName email' } })
      .populate('job', 'title')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Application.countDocuments(filter),
  ]);
  return paginated(items, total, page, limit);
}

async function getOne(id, actor) {
  const application = await Application.findById(id)
    .populate({ path: 'student', populate: { path: 'user', select: 'firstName lastName email' } })
    .populate({ path: 'job', populate: { path: 'company', select: 'name' } });
  const history = await ApplicationHistory.find({ application: id }).sort({ createdAt: 1 });
  if (!application) throw new AppError('Not found', 404, 'NOT_FOUND');
  if (actor.role === 'student') {
    const student = await studentService.getByUserId(actor.id);
    if (String(application.student._id) !== String(student._id)) throw new AppError('Not found', 404, 'NOT_FOUND');
  }
  if (actor.role === 'recruiter') {
    const recruiter = await Recruiter.findOne({ user: actor.id });
    if (!recruiter || String(application.job.recruiter) !== String(recruiter._id)) throw new AppError('Not found', 404, 'NOT_FOUND');
  }
  return { application, history };
}

module.exports = { apply, myApplications, updateStatus, listForRecruiter, getOne };
