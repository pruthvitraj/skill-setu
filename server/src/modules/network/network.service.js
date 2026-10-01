const Student = require('../../models/Student');
const Recruiter = require('../../models/Recruiter');
const Connection = require('../../models/Connection');
const Application = require('../../models/Application');
const { APPLICATION_STATUS } = require('../../utils/constants');
const { AppError } = require('../../utils/AppError');

async function syncConnections(filter) {
  const applications = await Application.find({
    ...filter,
    status: { $in: [APPLICATION_STATUS.SELECTED, APPLICATION_STATUS.HIRED] },
  }).populate('job', 'company recruiter');

  if (!applications.length) return;

  await Connection.bulkWrite(applications
    .filter((application) => application.job?.recruiter && application.job?.company)
    .map((application) => ({
      updateOne: {
        filter: { student: application.student, recruiter: application.job.recruiter },
        update: {
          $set: { company: application.job.company, application: application._id },
          $setOnInsert: { connectedAt: application.updatedAt || application.createdAt || new Date() },
        },
        upsert: true,
      },
    })));
}

async function listForStudent(userId) {
  const student = await Student.findOne({ user: userId }).select('_id');
  if (!student) throw new AppError('Student profile not found', 404, 'NOT_FOUND');
  await syncConnections({ student: student._id });
  return Connection.find({ student: student._id })
    .populate({ path: 'recruiter', populate: { path: 'user', select: 'firstName lastName email' } })
    .populate('company', 'name industry location website')
    .populate({ path: 'application', populate: { path: 'job', select: 'title' } })
    .sort({ connectedAt: -1 });
}

async function listForRecruiter(userId) {
  const recruiter = await Recruiter.findOne({ user: userId }).select('_id');
  if (!recruiter) throw new AppError('Recruiter profile not found', 404, 'NOT_FOUND');
  const jobs = await require('../../models/Job').find({ recruiter: recruiter._id }).select('_id');
  await syncConnections({ job: { $in: jobs.map((job) => job._id) } });
  return Connection.find({ recruiter: recruiter._id })
    .populate({ path: 'student', populate: { path: 'user', select: 'firstName lastName email' } })
    .populate('company', 'name industry location website')
    .populate({ path: 'application', populate: { path: 'job', select: 'title' } })
    .sort({ connectedAt: -1 });
}

module.exports = { listForStudent, listForRecruiter };
