const Job = require('../../models/Job');
const Recruiter = require('../../models/Recruiter');
const Student = require('../../models/Student');
const { JOB_STATUS } = require('../../utils/constants');
const { AppError } = require('../../utils/AppError');
const { paginated } = require('../../utils/pagination');
const matching = require('./jobMatching.service');

async function listPublished({ q, skill, location, page, limit }) {
  const filter = { status: JOB_STATUS.PUBLISHED };
  if (q) filter.$text = { $search: q };
  if (skill) filter.requiredSkills = new RegExp(skill, 'i');
  if (location) filter.location = new RegExp(location, 'i');
  const [items, total] = await Promise.all([
    Job.find(filter).populate('company', 'name location').skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
    Job.countDocuments(filter),
  ]);
  return paginated(items, total, page, limit);
}

async function getPublic(id) {
  const job = await Job.findOne({ _id: id, status: JOB_STATUS.PUBLISHED }).populate('company');
  if (!job) throw new AppError('Job not found', 404, 'NOT_FOUND');
  return job;
}

async function create(userId, payload) {
  const recruiter = await Recruiter.findOne({ user: userId });
  if (!recruiter) throw new AppError('Recruiter profile missing', 404, 'NOT_FOUND');
  return Job.create({ ...payload, recruiter: recruiter._id, company: recruiter.company });
}

async function update(userId, jobId, payload) {
  const recruiter = await Recruiter.findOne({ user: userId });
  const job = await Job.findOne({ _id: jobId, recruiter: recruiter._id });
  if (!job) throw new AppError('Job not found', 404, 'NOT_FOUND');
  Object.assign(job, payload);
  await job.save();
  return job;
}

async function mine(userId, { page, limit }) {
  const recruiter = await Recruiter.findOne({ user: userId });
  const filter = { recruiter: recruiter._id };
  const [items, total] = await Promise.all([
    Job.find(filter).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
    Job.countDocuments(filter),
  ]);
  return paginated(items, total, page, limit);
}

async function matches(jobId) {
  const job = await Job.findById(jobId);
  if (!job) throw new AppError('Job not found', 404, 'NOT_FOUND');
  const students = await Student.find({ placementStatus: { $ne: 'not_interested' } })
    .populate('user', 'firstName lastName')
    .limit(50);
  return students
    .map((s) => ({ student: s, match: matching.matchStudentToJob(s, job) }))
    .sort((a, b) => b.match.score - a.match.score);
}

module.exports = { listPublished, getPublic, create, update, mine, matches };
