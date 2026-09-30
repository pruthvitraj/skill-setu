const express = require('express');
const { asyncHandler } = require('../../middleware/asyncHandler');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { ROLES } = require('../../utils/constants');
const controller = require('./interview.controller');
const v = require('./interview.validation');

const router = express.Router();
router.use(authMiddleware);
router.get('/', asyncHandler(controller.list));
router.post('/', requireRoles(ROLES.RECRUITER), validate(v.create), asyncHandler(controller.create));
router.patch('/:id', requireRoles(ROLES.RECRUITER), asyncHandler(controller.update));

module.exports = router;
