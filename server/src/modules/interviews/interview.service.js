const Interview = require('../../models/Interview');
const Application = require('../../models/Application');
const Recruiter = require('../../models/Recruiter');
const studentService = require('../student/student.service');
const { notify } = require('../notifications/notification.service');
const { AppError } = require('../../utils/AppError');
const { APPLICATION_STATUS, INTERVIEW_STATUS, ROLES } = require('../../utils/constants');

async function schedule(userId, payload) {
  const recruiter = await Recruiter.findOne({ user: userId });
  if (!recruiter) throw new AppError('Recruiter profile not found', 404, 'NOT_FOUND');

  const job = await require('../../models/Job').findOne({ _id: payload.job, recruiter: recruiter._id });
  const candidate = await require('../../models/Student').findById(payload.candidate);
  if (!job || !candidate) throw new AppError('Candidate or job not available', 404, 'NOT_FOUND');

  if (!payload.application) throw new AppError('Select an application before scheduling an interview', 422, 'APPLICATION_REQUIRED');
  if (!payload.scheduledAt || new Date(payload.scheduledAt) <= new Date()) throw new AppError('Choose a future interview time', 422, 'INVALID_DATE');
  if (await Interview.exists({ recruiter: recruiter._id, application: payload.application, status: 'scheduled' })) throw new AppError('An interview is already scheduled for this application', 409, 'INTERVIEW_EXISTS');
  let application;
  if (payload.application) {
    application = await Application.findById(payload.application).populate('job');
    if (
      !application ||
      !application.job ||
      String(application.job.recruiter) !== String(recruiter._id) ||
      String(application.student) !== String(payload.candidate) ||
      String(application.job._id) !== String(payload.job)
    ) {
      throw new AppError('Application is not available for this interview', 404, 'NOT_FOUND');
    }
  }

  if (application && ['rejected', 'selected', 'hired'].includes(application.status)) throw new AppError('This application is no longer available for an interview', 409, 'INVALID_TRANSITION');
  let interview;
  try { interview = await Interview.create({ ...payload, recruiter: recruiter._id }); }
  catch(err) { if(err.code===11000)throw new AppError('An interview is already scheduled for this application',409,'INTERVIEW_EXISTS');throw err; }
  if (application && application.status !== APPLICATION_STATUS.INTERVIEW_SCHEDULED) {
    const applicationService = require('../applications/application.service');
    await applicationService.updateStatus(
      { id: userId, role: ROLES.RECRUITER },
      application._id,
      APPLICATION_STATUS.INTERVIEW_SCHEDULED,
      'Interview scheduled'
    );
  }
  const student = await require('../../models/Student').findById(payload.candidate);
  if (student) {
    await notify(student.user, {
      type: 'interview',
      title: 'Interview scheduled',
      body: `Round: ${interview.round}`,
      data: { interviewId: interview._id },
    });
  }
  return interview;
}

async function listForStudent(userId) {
  const student = await studentService.getByUserId(userId);
  return Interview.find({ candidate: student._id }).populate('job', 'title').sort({ scheduledAt: 1 });
}

async function listForRecruiter(userId) {
  const recruiter = await Recruiter.findOne({ user: userId });
  if (!recruiter) throw new AppError('Recruiter profile not found', 404, 'NOT_FOUND');
  return Interview.find({ recruiter: recruiter._id })
    .populate({ path: 'candidate', populate: { path: 'user', select: 'firstName lastName' } })
    .populate('job', 'title')
    .sort({ scheduledAt: -1 });
}

async function update(userId, id, patch) {
  const recruiter = await Recruiter.findOne({ user: userId });
  if (!recruiter) throw new AppError('Recruiter profile not found', 404, 'NOT_FOUND');
  if(patch.scheduledAt && new Date(patch.scheduledAt)<=new Date())throw new AppError('Choose a future interview time',422,'INVALID_DATE');
  if(patch.result && patch.result!=='pending' && patch.status && patch.status!=='completed')throw new AppError('An interview result requires completed status',422,'INVALID_TRANSITION');
  const interview = await Interview.findOneAndUpdate({ _id: id, recruiter: recruiter._id }, patch, { new: true, runValidators: true });
  if (!interview) throw new AppError('Interview not found', 404, 'NOT_FOUND');
  if (patch.result && patch.result !== 'pending') {
    interview.status = INTERVIEW_STATUS.COMPLETED;
    await interview.save();
  }
  return interview;
}

module.exports = { schedule, listForStudent, listForRecruiter, update };
