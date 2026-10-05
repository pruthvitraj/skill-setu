const Resume = require('../models/Resume');
const Student = require('../models/Student');
const Recruiter = require('../models/Recruiter');
const Tpo = require('../models/Tpo');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { AppError } = require('../utils/AppError');
async function privateUpload(req, res, next) {
  const key = decodeURIComponent(req.path).replace(/^\//, '');
  const resume = await Resume.findOne({ fileKey: key });
  if (!resume) throw new AppError('File not found', 404, 'NOT_FOUND');
  let allowed = false;
  if (req.user.role === 'student') allowed = Boolean(await Student.exists({ _id: resume.student, user: req.user.id }));
  if (req.user.role === 'tpo') {
    const tpo = await Tpo.findOne({ user: req.user.id });
    allowed = Boolean(tpo && await Student.exists({ _id: resume.student, university: tpo.university }));
  }
  if (req.user.role === 'recruiter') {
    const recruiter = await Recruiter.findOne({ user: req.user.id });
    const jobs = recruiter ? await Job.find({ recruiter: recruiter._id }).distinct('_id') : [];
    allowed = Boolean(await Application.exists({ resume: resume._id, job: { $in: jobs } }));
  }
  if (!allowed) throw new AppError('File not found', 404, 'NOT_FOUND');
  res.set('Cache-Control', 'private, no-store');
  next();
}
module.exports = { privateUpload };
