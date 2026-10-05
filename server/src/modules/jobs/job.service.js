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
      { title: new RegExp(require('../../utils/text').escapeRegex(q), 'i') },
      { description: new RegExp(require('../../utils/text').escapeRegex(q), 'i') },
    ];
  }

  if (skill) {
    filter.requiredSkills = new RegExp(require('../../utils/text').escapeRegex(skill), 'i');
  }

  if (location) {
    filter.location = new RegExp(require('../../utils/text').escapeRegex(location), 'i');
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

async function getPublic(id, actor) {
  let filter = { _id: id, status: JOB_STATUS.PUBLISHED };
  if (actor?.role === 'recruiter') {
    const recruiter = await Recruiter.findOne({ user: actor.id });
    if (recruiter) filter = { _id: id, $or: [{ status: JOB_STATUS.PUBLISHED }, { recruiter: recruiter._id }] };
  }
  const job = await Job.findOne(filter).populate('company');

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
      { title: new RegExp(require('../../utils/text').escapeRegex(q), 'i') },
      { description: new RegExp(require('../../utils/text').escapeRegex(q), 'i') },
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

  const counts = await require('../../models/Application').aggregate([{ $match: { job: { $in: items.map(j => j._id) } } }, { $group: { _id: '$job', count: { $sum: 1 } } }]);
  const byJob = new Map(counts.map(c => [String(c._id), c.count]));
  return paginated(items.map(j => ({ ...j.toObject(), applications: byJob.get(String(j._id)) || 0 })), total, page, limit);
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

  const linked = await Promise.all([
    require('../../models/Application').exists({ job: job._id }),
    require('../../models/Interview').exists({ job: job._id }),
    require('../../models/PlacementDrive').exists({ job: job._id }),
  ]);
  if (linked.some(Boolean)) throw new AppError('This job has linked records. Close it instead of deleting it.', 409, 'JOB_HAS_RECORDS');
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
    'privacy.showProfile': { $ne: false },
  })
    .populate('user', 'firstName lastName email')
    ;

  return students
    .map((student) => ({
      student: require('../../utils/profilePrivacy').visibleStudent(student),
      match: student.privacy?.showScores === false ? { score: 0, reasons: ['Scores are private'] } : matching.matchStudentToJob(student, job),
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