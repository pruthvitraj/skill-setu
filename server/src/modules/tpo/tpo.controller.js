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
  const item = await service.createAnnouncement(req.user.id, req.body);
  return success(res, 'Announcement published', { item }, 201);
}

async function companies(req, res) {
  return success(res, 'OK', { items: await service.companies() });
}

async function skills(req, res) {
  return success(res, 'OK', await service.skills(req.user.id));
}

async function reports(req, res) {
  return success(res, 'OK', await service.reports(req.user.id, req.params.type));
}

module.exports = {
  dashboard,
  students,
  studentDetails,
  internships,
  announcements,
  createAnnouncement,
  companies,
  skills,
  reports,
};
