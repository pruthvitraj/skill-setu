const express = require('express');
const { asyncHandler } = require('../../middleware/asyncHandler');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { ROLES } = require('../../utils/constants');
const controller = require('./placement.controller');
const v = require('./placement.validation');

const router = express.Router();
router.use(authMiddleware);
router.get('/', requireRoles(ROLES.TPO, ROLES.RECRUITER), asyncHandler(controller.list));
router.post('/', requireRoles(ROLES.RECRUITER), validate(v.request), asyncHandler(controller.request));
router.patch('/:id', requireRoles(ROLES.TPO), validate(v.review), asyncHandler(controller.review));

module.exports = router;
