const Application = require('../../models/Application');
const ApplicationHistory = require('../../models/ApplicationHistory');
const Job = require('../../models/Job');
const Recruiter = require('../../models/Recruiter');
const studentService = require('../student/student.service');
const matching = require('../jobs/jobMatching.service');
const { notify } = require('../notifications/notification.service');
const { AppError } = require('../../utils/AppError');
const { APPLICATION_STATUS, JOB_STATUS, ROLES } = require('../../utils/constants');
const { audit } = require('../../utils/audit');
const { paginated } = require('../../utils/pagination');

async function apply(userId, jobId, coverNote) {
  const student = await studentService.getByUserId(userId);

  const job = await Job.findById(jobId);

  if (!job || job.status !== JOB_STATUS.PUBLISHED) {
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
 * TPO can update applications globally.
 */
async function updateStatus(actor, applicationId, toStatus, note) {
  const application = await Application.findById(applicationId)
    .populate('student')
    .populate('job');

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

  const from = application.status;

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

  if (toStatus === APPLICATION_STATUS.HIRED) {
    application.student.placementStatus = 'placed';
    await application.student.save();
  }

  return application;
}

/**
 * Recruiter:
 *   - only applications belonging to their jobs
 *
 * TPO:
 *   - all applications
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

  if (status) {
    filter.status = status;
  }

  const applications = await Application.find(filter)
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

  // TPO access remains unrestricted here, matching
  // the existing TPO application-management route.

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