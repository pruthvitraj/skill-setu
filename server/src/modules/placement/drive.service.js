const PlacementDrive = require('../../models/PlacementDrive');
const Recruiter = require('../../models/Recruiter');
const Tpo = require('../../models/Tpo');
const { DRIVE_STATUS } = require('../../utils/constants');
const { AppError } = require('../../utils/AppError');
const { notify } = require('../notifications/notification.service');

async function requestDrive(userId, payload) {
  const recruiter = await Recruiter.findOne({ user: userId });
  const drive = await PlacementDrive.create({
    ...payload,
    recruiter: recruiter._id,
    company: recruiter.company,
    status: DRIVE_STATUS.REQUESTED,
  });
  const tpo = await Tpo.findOne({ university: payload.university });
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
  const drive = await PlacementDrive.findOne({ _id: driveId, university: tpo.university });
  if (!drive) throw new AppError('Drive not found', 404, 'NOT_FOUND');
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
  return PlacementDrive.find({ university: tpo.university })
    .populate('company', 'name')
    .populate('job', 'title')
    .sort({ createdAt: -1 });
}

async function listForRecruiter(userId) {
  const recruiter = await Recruiter.findOne({ user: userId });
  return PlacementDrive.find({ recruiter: recruiter._id }).populate('university', 'name').sort({ createdAt: -1 });
}

module.exports = { requestDrive, review, listForTpo, listForRecruiter };
