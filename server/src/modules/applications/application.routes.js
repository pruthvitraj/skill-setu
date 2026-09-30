const express = require('express');
const { asyncHandler } = require('../../middleware/asyncHandler');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { ROLES } = require('../../utils/constants');
const controller = require('./application.controller');
const v = require('./application.validation');

const router = express.Router();
router.use(authMiddleware);
router.post('/', requireRoles(ROLES.STUDENT), validate(v.apply), asyncHandler(controller.apply));
router.get('/me', requireRoles(ROLES.STUDENT), asyncHandler(controller.mine));
router.get('/', requireRoles(ROLES.RECRUITER, ROLES.TPO), asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getOne));
router.patch('/:id/status', requireRoles(ROLES.RECRUITER, ROLES.TPO), validate(v.status), asyncHandler(controller.status));

module.exports = router;
