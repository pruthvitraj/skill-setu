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

  const interview = await Interview.create({ ...payload, recruiter: recruiter._id });
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
      body: `Round: ${payload.round}`,
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
  return Interview.find({ recruiter: recruiter._id })
    .populate({ path: 'candidate', populate: { path: 'user', select: 'firstName lastName' } })
    .populate('job', 'title')
    .sort({ scheduledAt: -1 });
}

async function update(id, patch) {
  const interview = await Interview.findByIdAndUpdate(id, patch, { new: true });
  if (!interview) throw new AppError('Interview not found', 404, 'NOT_FOUND');
  if (patch.result && patch.result !== 'pending') {
    interview.status = INTERVIEW_STATUS.COMPLETED;
    await interview.save();
  }
  return interview;
}

module.exports = { schedule, listForStudent, listForRecruiter, update };
