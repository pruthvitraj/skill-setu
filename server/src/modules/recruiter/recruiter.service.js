const Recruiter = require('../../models/Recruiter');
const Job = require('../../models/Job');
const Application = require('../../models/Application');
const Interview = require('../../models/Interview');
const Student = require('../../models/Student');
const University = require('../../models/University');
const { AppError } = require('../../utils/AppError');
const { APPLICATION_STATUS, JOB_STATUS } = require('../../utils/constants');
const matching = require('../jobs/jobMatching.service');
const driveService = require('../placement/drive.service');

async function getRecruiter(userId) {
  const recruiter = await Recruiter.findOne({ user: userId }).populate('company').populate('user', 'firstName lastName email');
  if (!recruiter) throw new AppError('Recruiter profile not found', 404, 'NOT_FOUND');
  return recruiter;
}

async function dashboard(userId) {
  const recruiter = await getRecruiter(userId);
  const jobs = await Job.find({ recruiter: recruiter._id });
  const jobIds = jobs.map((j) => j._id);
  const applications = await Application.find({ job: { $in: jobIds } });
  const count = (status) => applications.filter((a) => a.status === status).length;
  const activeJobs = jobs.filter((j) => j.status === JOB_STATUS.PUBLISHED).length;
  const interviews = await Interview.countDocuments({ recruiter: recruiter._id });
  const students = await Student.find().limit(8).populate('user', 'firstName lastName');
  const topJob = jobs[0];
  const topMatches = topJob
    ? students.map((s) => ({ student: s, match: matching.matchStudentToJob(s, topJob) })).sort((a, b) => b.match.score - a.match.score)
    : [];
    return {
    totalJobs: jobs.length,
    activeJobs,
    applications: applications.length,
    shortlisted: count(APPLICATION_STATUS.SHORTLISTED),
    assessments: count(APPLICATION_STATUS.ASSESSMENT),
    interviews,
    selected: count(APPLICATION_STATUS.SELECTED),
    hired: count(APPLICATION_STATUS.HIRED),
    topMatches,
    funnel: [
      { name: 'Applied', value: applications.length },
      { name: 'Shortlisted', value: count(APPLICATION_STATUS.SHORTLISTED) },
      { name: 'Interview', value: count(APPLICATION_STATUS.INTERVIEW_SCHEDULED) },
      { name: 'Hired', value: count(APPLICATION_STATUS.HIRED) },
    ],
  };
}

async function candidates({ page = 1, limit = 10 }) {
  const [items, total] = await Promise.all([
    Student.find()
      .populate('user', 'firstName lastName email')
      .populate('university', 'name')
      .skip((page - 1) * limit)
      .limit(limit),
    Student.countDocuments(),
  ]);
  return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } };
}

async function candidateDetails(id) {
  const student = await Student.findById(id).populate('user', 'firstName lastName email').populate('university', 'name');
  if (!student) throw new AppError('Not found', 404, 'NOT_FOUND');
  const applications = await Application.find({ student: id }).populate('job', 'title');
  return { student, applications };
}

async function universities() {
  return University.find().sort({ name: 1 });
}

async function inviteUniversity(userId, universityId, payload) {
  return driveService.requestDrive(userId, { ...payload, university: universityId });
}

async function updateMe(userId, patch) {
  const recruiter = await getRecruiter(userId);
  if (patch.designation) recruiter.designation = patch.designation;
  if (patch.company && recruiter.company) {
    Object.assign(recruiter.company, patch.company);
    await recruiter.company.save();
  }
  await recruiter.save();
  return recruiter;
}

module.exports = {
  getRecruiter,
  dashboard,
  candidates,
  candidateDetails,
  universities,
  inviteUniversity,
  updateMe,
};
