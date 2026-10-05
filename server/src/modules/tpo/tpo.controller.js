const { success } = require('../../utils/response');
const { parsePagination } = require('../../utils/pagination');
const service = require('./tpo.service');

async function dashboard(req, res) {
  return success(res, 'OK', await service.dashboard(req.user.id));
}

async function students(req, res) {
  const { page, limit } = parsePagination(req.query);
  const data = await service.students(req.user.id, { ...req.query, page, limit });
  return success(res, 'OK', data);
}

async function studentFilters(req, res) {
  return success(res, 'OK', await service.studentFilters(req.user.id));
}

async function studentDetails(req, res) {
  return success(res, 'OK', await service.studentDetails(req.user.id, req.params.id));
}

async function internships(req, res) {
  return success(res, 'OK', { items: await service.internships(req.user.id) });
}

async function announcements(req, res) {
  return success(res, 'OK', { items: await service.announcements(req.user.id) });
}

async function createAnnouncement(req, res) {
  const item = await service.createAnnouncement(req.user.id, req.validated.body);
  return success(res, 'Announcement published', { item }, 201);
}

async function companies(req, res) {
  return success(res, 'OK', { items: await service.companies(req.user.id) });
}

async function placementDrives(req, res) {
  return success(res, 'OK', { items: await service.placementDrives(req.user.id) });
}

async function requestPlacementDrive(req, res) {
  return success(res, 'Drive request sent', { drive: await service.requestPlacementDrive(req.user.id, req.validated.body) }, 201);
}

async function reviewPlacementDrive(req, res) {
  return success(res, 'Drive updated', { drive: await service.reviewPlacementDrive(req.user.id, req.params.id, req.validated.body) });
}

async function applications(req, res) {
  return success(res, 'OK', { items: await service.applications(req.user.id, req.query) });
}

async function updateApplicationStatus(req, res) {
  return success(res, 'Status updated', { application: await service.updateApplicationStatus(req.user.id, req.params.id, req.validated.body) });
}

async function interviews(req, res) {
  return success(res, 'OK', { items: await service.interviews(req.user.id) });
}

async function placementAnalytics(req, res) {
  return success(res, 'OK', await service.placementAnalytics(req.user.id));
}

async function skills(req, res) {
  return success(res, 'OK', await service.skills(req.user.id));
}

async function studentReportCard(req, res) {
  const data = await service.studentDetails(req.user.id, req.params.id || req.params.studentId);
  const scores = await require('../../models/SkillScore').find({ student: data.student._id, evidenceBased: true });
  const [assessments, interviews] = await Promise.all([
    require('../../models/AssessmentAttempt').find({ student: data.student._id }).populate('assessment','title').sort({ createdAt: -1 }),
    require('../../models/Interview').find({ candidate: data.student._id }).populate('job', 'title'),
  ]);
  const applicationCounts = data.applications.reduce((counts, item) => ({ ...counts, [item.status]: (counts[item.status] || 0) + 1 }), {});
  return success(res, 'OK', { ...data, skills: scores, assessments, interviews, applicationCounts, evidenceAverage: scores.length ? data.student.skillScore : null, generatedAt: new Date() });
}

async function reports(req, res) {
  return success(res, 'OK', await service.reports(req.user.id, req.params.type));
}

module.exports = {
  dashboard,
  studentFilters,
  students,
  studentDetails,
  studentReportCard,
  internships,
  announcements,
  createAnnouncement,
  companies,
  placementDrives,
  requestPlacementDrive,
  reviewPlacementDrive,
  applications,
  updateApplicationStatus,
  interviews,
  placementAnalytics,
  skills,
  reports,
};
