const Job = require('../../models/Job');
const Recruiter = require('../../models/Recruiter');
const Student = require('../../models/Student');
const { JOB_STATUS } = require('../../utils/constants');
const { AppError } = require('../../utils/AppError');
const { paginated } = require('../../utils/pagination');
const matching = require('./jobMatching.service');

async function listPublished({ q, skill, location, page, limit }) {
  const filter = { status: JOB_STATUS.PUBLISHED };

  if (q) {
    filter.$or = [
      { title: new RegExp(q, 'i') },
      { description: new RegExp(q, 'i') },
    ];
  }

  if (skill) {
    filter.requiredSkills = new RegExp(skill, 'i');
  }

  if (location) {
    filter.location = new RegExp(location, 'i');
  }

  const [items, total] = await Promise.all([
    Job.find(filter)
      .populate('company', 'name location website industry')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }),

    Job.countDocuments(filter),
  ]);

  return paginated(items, total, page, limit);
}

async function getPublic(id) {
  const job = await Job.findOne({
    _id: id,
    status: JOB_STATUS.PUBLISHED,
  }).populate('company');

  if (!job) {
    throw new AppError('Job not found', 404, 'NOT_FOUND');
  }

  return job;
}

async function create(userId, payload) {
  const recruiter = await Recruiter.findOne({ user: userId });

  if (!recruiter) {
    throw new AppError('Recruiter profile missing', 404, 'NOT_FOUND');
  }

  return Job.create({
    ...payload,
    recruiter: recruiter._id,
    company: recruiter.company,
  });
}

async function update(userId, jobId, payload) {
  const recruiter = await Recruiter.findOne({ user: userId });

  if (!recruiter) {
    throw new AppError('Recruiter profile missing', 404, 'NOT_FOUND');
  }

  const job = await Job.findOne({
    _id: jobId,
    recruiter: recruiter._id,
  });

  if (!job) {
    throw new AppError('Job not found', 404, 'NOT_FOUND');
  }

  // Prevent a client from changing ownership.
  delete payload.recruiter;
  delete payload.company;

  Object.assign(job, payload);

  await job.save();

  return Job.findById(job._id)
    .populate('company', 'name location website industry');
}

async function mine(userId, { page, limit, status, q }) {
  const recruiter = await Recruiter.findOne({ user: userId });

  if (!recruiter) {
    throw new AppError('Recruiter profile missing', 404, 'NOT_FOUND');
  }

  const filter = {
    recruiter: recruiter._id,
  };

  if (status) {
    filter.status = status;
  }

  if (q) {
    filter.$or = [
      { title: new RegExp(q, 'i') },
      { description: new RegExp(q, 'i') },
    ];
  }

  const [items, total] = await Promise.all([
    Job.find(filter)
      .populate('company', 'name location website industry')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }),

    Job.countDocuments(filter),
  ]);

  return paginated(items, total, page, limit);
}

async function remove(userId, jobId) {
  const recruiter = await Recruiter.findOne({ user: userId });

  if (!recruiter) {
    throw new AppError('Recruiter profile missing', 404, 'NOT_FOUND');
  }

  const job = await Job.findOne({
    _id: jobId,
    recruiter: recruiter._id,
  });

  if (!job) {
    throw new AppError('Job not found', 404, 'NOT_FOUND');
  }

  await Job.deleteOne({ _id: job._id });

  return {
    deleted: true,
    jobId: job._id,
  };
}

async function matches(userId, jobId) {
  const recruiter = await Recruiter.findOne({ user: userId });

  if (!recruiter) {
    throw new AppError('Recruiter profile missing', 404, 'NOT_FOUND');
  }

  const job = await Job.findOne({
    _id: jobId,
    recruiter: recruiter._id,
  });

  if (!job) {
    throw new AppError('Job not found', 404, 'NOT_FOUND');
  }

  const students = await Student.find({
    placementStatus: { $ne: 'not_interested' },
  })
    .populate('user', 'firstName lastName email')
    .limit(50);

  return students
    .map((student) => ({
      student,
      match: matching.matchStudentToJob(student, job),
    }))
    .sort((a, b) => b.match.score - a.match.score);
}

module.exports = {
  listPublished,
  getPublic,
  create,
  update,
  mine,
  remove,
  matches,
};