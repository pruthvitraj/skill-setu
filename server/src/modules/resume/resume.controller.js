const { success } = require('../../utils/response');
const service = require('./resume.service');
const { AppError } = require('../../utils/AppError');

async function upload(req, res) {
  if (!req.file) throw new AppError('Resume file is required', 400, 'FILE_REQUIRED');
  const resume = await service.uploadResume(req.user.id, req.file);
  return success(res, 'Resume uploaded and analyzed', { resume }, 201);
}

async function latest(req, res) {
  const resume = await service.latest(req.user.id);
  return success(res, 'OK', { resume });
}

async function list(req, res) {
  const resumes = await service.list(req.user.id);
  return success(res, 'OK', { resumes });
}

async function remove(req, res) {
  const resume = await service.remove(req.user.id, req.params.id);
  return success(res, 'Resume deleted', { resume });
}

module.exports = { upload, latest, list, remove };
