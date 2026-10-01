const express = require('express');
const { asyncHandler } = require('../../middleware/asyncHandler');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/role.middleware');
const { ROLES } = require('../../utils/constants');
const controller = require('./network.controller');

const router = express.Router();
router.use(authMiddleware);
router.get('/student', requireRoles(ROLES.STUDENT), asyncHandler(controller.list));
router.get('/company', requireRoles(ROLES.RECRUITER), asyncHandler(controller.list));

module.exports = router;
