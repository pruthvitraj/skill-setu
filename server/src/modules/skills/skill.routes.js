const express = require('express');
const { asyncHandler } = require('../../middleware/asyncHandler');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { ROLES } = require('../../utils/constants');
const controller = require('./skill.controller');
const validation = require('./skill.validation');

const router = express.Router();
router.use(authMiddleware);
router.get('/', asyncHandler(controller.catalog));
router.get('/assessments', asyncHandler(controller.list));
router.get('/assessments/:id', requireRoles(ROLES.STUDENT), asyncHandler(controller.getOne));
router.post('/assessments/:id/attempts', requireRoles(ROLES.STUDENT), validate(validation.submitAttempt), asyncHandler(controller.submit));
router.get('/tracker/me', requireRoles(ROLES.STUDENT), asyncHandler(controller.tracker));

module.exports = router;
