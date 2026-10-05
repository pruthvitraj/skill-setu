const PlacementDrive = require('../../models/PlacementDrive');
const Recruiter = require('../../models/Recruiter');
const Tpo = require('../../models/Tpo');
const { DRIVE_STATUS } = require('../../utils/constants');
const { AppError } = require('../../utils/AppError');
const { notify } = require('../notifications/notification.service');

async function requestDrive(userId, payload) {
  const recruiter = await Recruiter.findOne({ user: userId });
  if (!recruiter) throw new AppError('Recruiter profile not found', 404, 'NOT_FOUND');
  if (!await require('../../models/University').exists({ _id: payload.university })) throw new AppError('Institution not found', 404, 'NOT_FOUND');
  if (payload.job && !await require('../../models/Job').exists({ _id: payload.job, recruiter: recruiter._id })) throw new AppError('Job not found', 404, 'NOT_FOUND');
  const tpo = await Tpo.findOne({ university: payload.university });
  if (!tpo) throw new AppError('This institution has no linked TPO to receive the request', 409, 'TPO_REQUIRED');
  if (payload.proposedDate && new Date(payload.proposedDate) <= new Date()) throw new AppError('Choose a future drive date', 422, 'INVALID_DATE');
  const existing = await PlacementDrive.findOne({ recruiter: recruiter._id, university: payload.university, job: payload.job, status: { $in: ['requested', 'approved', 'rescheduled', 'active'] } });
  if (existing) throw new AppError('An active request already exists for this job and institution', 409, 'DRIVE_EXISTS');
  const drive = await PlacementDrive.create({
    ...payload,
    recruiter: recruiter._id,
    company: recruiter.company,
    status: DRIVE_STATUS.REQUESTED,
  });

  if (tpo) {
    await notify(tpo.user, {
      type: 'drive_request',
      title: 'Placement drive request',
      body: payload.title || 'A company requested a campus drive',
      data: { driveId: drive._id },
    });
  }
  return drive;
}

async function review(tpoUserId, driveId, { status, scheduledDate, tpoNote }) {
  const tpo = await Tpo.findOne({ user: tpoUserId });
  if (!tpo) throw new AppError('TPO profile not found', 404, 'NOT_FOUND');
  const drive = await PlacementDrive.findOne({ _id: driveId, university: tpo.university });
  if (!drive) throw new AppError('Drive not found', 404, 'NOT_FOUND');
  if (['completed', 'rejected', 'cancelled'].includes(drive.status) && status !== drive.status) throw new AppError('This drive has ended', 409, 'DRIVE_ENDED');
  if (['approved', 'rescheduled', 'active'].includes(status) && !scheduledDate && !drive.scheduledDate) throw new AppError('Provide a scheduled date', 422, 'DATE_REQUIRED');
  if (scheduledDate && new Date(scheduledDate) <= new Date()) throw new AppError('Choose a future drive date', 422, 'INVALID_DATE');
  drive.status = status;
  if (scheduledDate) drive.scheduledDate = scheduledDate;
  if (tpoNote) drive.tpoNote = tpoNote;
  await drive.save();
  if (drive.recruiter) {
    const recruiter = await Recruiter.findById(drive.recruiter).select('user');
    if (recruiter?.user) {
      await notify(recruiter.user, {
        type: 'drive_update',
        title: 'Placement drive updated',
        body: `Your placement drive request is now ${status}.`,
        data: { driveId: drive._id, status },
      });
    }
  }
  return drive;
}

async function listForTpo(tpoUserId) {
  const tpo = await Tpo.findOne({ user: tpoUserId });
  if (!tpo) throw new AppError('TPO profile not found', 404, 'NOT_FOUND');
  return PlacementDrive.find({ university: tpo.university })
    .populate('company', 'name')
    .populate('job', 'title')
    .sort({ createdAt: -1 });
}

async function listForRecruiter(userId) {
  const recruiter = await Recruiter.findOne({ user: userId });
  if (!recruiter) throw new AppError('Recruiter profile not found', 404, 'NOT_FOUND');
  return PlacementDrive.find({ recruiter: recruiter._id }).populate('university', 'name').sort({ createdAt: -1 });
}

module.exports = { requestDrive, review, listForTpo, listForRecruiter };
