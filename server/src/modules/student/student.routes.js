const express = require('express');
const { asyncHandler } = require('../../middleware/asyncHandler');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { ROLES } = require('../../utils/constants');
const controller = require('./student.controller');
const validation = require('./student.validation');

const router = express.Router();
router.use(authMiddleware);

router.get('/me', requireRoles(ROLES.STUDENT), asyncHandler(controller.me));
router.patch('/me', requireRoles(ROLES.STUDENT), validate(validation.updateMe), asyncHandler(controller.updateMe));
router.get('/me/dashboard', requireRoles(ROLES.STUDENT), asyncHandler(controller.dashboard));

const nestedValidation = {
  education: validation.education,
  skills: validation.skills,
  projects: validation.projects,
  experience: validation.experience,
  certifications: validation.certifications,
};

Object.keys(nestedValidation).forEach((field) => {
  const c = controller.subController(field);
  router.post(`/me/${field}`, requireRoles(ROLES.STUDENT), validate(nestedValidation[field]), asyncHandler(c.add));
  router.put(`/me/${field}/:itemId`, requireRoles(ROLES.STUDENT), validate(nestedValidation[field].merge(validation.itemId)), asyncHandler(c.update));
  router.delete(`/me/${field}/:itemId`, requireRoles(ROLES.STUDENT), validate(validation.itemId), asyncHandler(c.remove));
});

router.get('/network', asyncHandler(controller.network));

module.exports = router;
