const Application = require('../../models/Application');
const ApplicationHistory = require('../../models/ApplicationHistory');
const Resume = require('../../models/Resume');
const Job = require('../../models/Job');
const Recruiter = require('../../models/Recruiter');
const studentService = require('../student/student.service');
const matching = require('../jobs/jobMatching.service');
const { notify } = require('../notifications/notification.service');
const { AppError } = require('../../utils/AppError');
const { APPLICATION_STATUS, JOB_STATUS, ROLES } = require('../../utils/constants');
const { audit } = require('../../utils/audit');
const { paginated } = require('../../utils/pagination');

async function apply(userId, jobId, resumeId, coverNote) {
  const student = await studentService.getByUserId(userId);

  const resume = await Resume.findOne({ _id: resumeId, student: student._id });
  if (!resume) {
    throw new AppError('Select one of your uploaded resumes before applying', 400, 'RESUME_REQUIRED');
  }

  const job = await Job.findById(jobId);

  if (!job || job.status !== JOB_STATUS.PUBLISHED || (job.deadline && job.deadline <= new Date())) {
    throw new AppError('Job is not open', 400, 'JOB_CLOSED');
  }

  const exists = await Application.findOne({
    student: student._id,
    job: job._id,
  });

  if (exists) {
    throw new AppError(
      'You have already applied for this job',
      409,
      'ALREADY_APPLIED'
    );
  }

  const match = matching.matchStudentToJob(student, job);

  const application = await Application.create({
    student: student._id,
    job: job._id,
    resume: resume._id,
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

  return Application.find({ student: student._id })
    .populate({
      path: 'job',
      populate: {
        path: 'company',
        select: 'name',
      },
    })
    .sort({ createdAt: -1 });
}

/**
 * Update application status.
 *
 * Recruiters can only update applications belonging to their own jobs.
 * TPO can update applications only within their institution.
 */
async function updateStatus(actor, applicationId, toStatus, note) {
  const application = await Application.findById(applicationId)
    .populate('student')
    .populate('job')
    .populate('resume');

  if (!application) {
    throw new AppError('Application not found', 404, 'NOT_FOUND');
  }

  // Recruiter ownership check
  if (actor.role === ROLES.RECRUITER) {
    const recruiter = await Recruiter.findOne({
      user: actor.id,
    });

    if (
      !recruiter ||
      !application.job ||
      String(application.job.recruiter) !== String(recruiter._id)
    ) {
      throw new AppError('Application not found', 404, 'NOT_FOUND');
    }
  }

  // Only recruiter/TPO should reach this service through the route,
  // but keep the service itself defensive.
  if (
    actor.role !== ROLES.RECRUITER &&
    actor.role !== ROLES.TPO
  ) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  if (actor.role === ROLES.TPO) {
    const tpo = await require('../tpo/tpo.service').getTpo(actor.id);
    if (String(application.student.university) !== String(tpo.university._id)) throw new AppError('Application not found', 404, 'NOT_FOUND');
  }

  const from = application.status;
  const flow = require('../../../../shared/constants/applicationStatus').APPLICATION_FLOW;
  if (from !== toStatus && (from === APPLICATION_STATUS.HIRED || from === APPLICATION_STATUS.REJECTED || (toStatus !== APPLICATION_STATUS.REJECTED && flow.indexOf(toStatus) < flow.indexOf(from)))) {
    throw new AppError('This application cannot move to that status', 409, 'INVALID_TRANSITION');
  }
  if (from === toStatus) return application;

  application.status = toStatus;
  await application.save();

  await ApplicationHistory.create({
    application: application._id,
    fromStatus: from,
    toStatus,
    actor: actor.id,
    note,
  });

  audit('application.status', actor.id, {
    applicationId,
    from,
    toStatus,
  });

  const User = require('../../models/User');

  const studentUser = await User.findById(
    application.student.user
  );

  if (studentUser) {
    await notify(studentUser._id, {
      type: 'application',
      title: 'Application update',
      body: `Status changed to ${toStatus}`,
      data: {
        applicationId,
      },
    });
  }

  const active = await Application.exists({ student: application.student._id, status: { $nin: [APPLICATION_STATUS.REJECTED, APPLICATION_STATUS.HIRED] } });
  const hired = await Application.exists({ student: application.student._id, status: APPLICATION_STATUS.HIRED });
  if (application.student.placementStatus !== 'not_interested') {
    application.student.placementStatus = hired ? 'placed' : active ? 'in_process' : 'available';
    await application.student.save();
  }
  if (toStatus === APPLICATION_STATUS.REJECTED) await require('../../models/Connection').deleteMany({ application: application._id });

  if ([APPLICATION_STATUS.SELECTED, APPLICATION_STATUS.HIRED].includes(toStatus)) {
    const Recruiter = require('../../models/Recruiter');
    const Connection = require('../../models/Connection');
    const recruiter = await Recruiter.findById(application.job.recruiter);
    if (recruiter) {
      await Connection.updateOne(
        { student: application.student._id, recruiter: recruiter._id },
        {
          $set: { company: application.job.company, application: application._id },
          $setOnInsert: { connectedAt: new Date() },
        },
        { upsert: true }
      );
    }
  }

  return application;
}

/**
 * Recruiter:
 *   - only applications belonging to their jobs
 *
 * TPO:
 *   - only applications from their institution
 */
async function listForActor(actor, { status, q, page, limit }) {
  let filter = {};

  if (actor.role === ROLES.RECRUITER) {
    const recruiter = await Recruiter.findOne({
      user: actor.id,
    });

    if (!recruiter) {
      throw new AppError(
        'Recruiter profile missing',
        404,
        'NOT_FOUND'
      );
    }

    const jobs = await Job.find({
      recruiter: recruiter._id,
    }).select('_id');

    filter.job = {
      $in: jobs.map((job) => job._id),
    };
  }

  if (actor.role === ROLES.TPO) {
    const tpo = await require('../tpo/tpo.service').getTpo(actor.id);
    filter.student = { $in: await require('../../models/Student').find({ university: tpo.university._id }).distinct('_id') };
  }

  if (status) {
    filter.status = status;
  }

  const applications = await Application.find(filter)
    .populate('resume', 'fileName fileKey parsed ats createdAt')
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'firstName lastName email',
      },
    })
    .populate({
      path: 'job',
      populate: {
        path: 'company',
        select: 'name',
      },
    })
    .sort({ createdAt: -1 });

  let filtered = applications;

  if (q) {
    const search = String(q).trim().toLowerCase();

    if (search) {
      filtered = applications.filter((application) => {
        const student = application.student;
        const user = student?.user;
        const job = application.job;

        const fullName = [
          user?.firstName,
          user?.lastName,
        ]
          .filter(Boolean)
          .join(' ');

        const email = user?.email || '';
        const jobTitle = job?.title || '';
        const companyName = job?.company?.name || '';

        return [
          fullName,
          email,
          jobTitle,
          companyName,
        ].some((value) =>
          String(value).toLowerCase().includes(search)
        );
      });
    }
  }

  const total = filtered.length;

  const start = (page - 1) * limit;
  const end = start + limit;

  const items = filtered.slice(start, end);

  return paginated(items, total, page, limit);
}

async function getOne(id, actor) {
  const application = await Application.findById(id)
    .populate('resume', 'fileName fileKey parsed ats createdAt')
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'firstName lastName email',
      },
    })
    .populate({
      path: 'job',
      populate: {
        path: 'company',
        select: 'name',
      },
    });

  if (!application) {
    throw new AppError('Not found', 404, 'NOT_FOUND');
  }

  const history = await ApplicationHistory.find({
    application: id,
  }).sort({ createdAt: 1 });

  // Student can only see their own application.
  if (actor.role === ROLES.STUDENT) {
    const student = await studentService.getByUserId(actor.id);

    if (
      String(application.student._id) !==
      String(student._id)
    ) {
      throw new AppError('Not found', 404, 'NOT_FOUND');
    }
  }

  // Recruiter can only see applications for their own jobs.
  if (actor.role === ROLES.RECRUITER) {
    const recruiter = await Recruiter.findOne({
      user: actor.id,
    });

    if (
      !recruiter ||
      !application.job ||
      String(application.job.recruiter) !==
        String(recruiter._id)
    ) {
      throw new AppError('Not found', 404, 'NOT_FOUND');
    }
  }

  if (actor.role === ROLES.TPO) {
    const tpo = await require('../tpo/tpo.service').getTpo(actor.id);
    if (String(application.student.university) !== String(tpo.university._id)) throw new AppError('Not found', 404, 'NOT_FOUND');
  }

  return {
    application,
    history,
  };
}

module.exports = {
  apply,
  myApplications,
  updateStatus,
  listForActor,
  getOne,
};