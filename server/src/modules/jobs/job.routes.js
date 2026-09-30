const express = require('express');
const { asyncHandler } = require('../../middleware/asyncHandler');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { ROLES } = require('../../utils/constants');
const controller = require('./job.controller');
const v = require('./job.validation');

const router = express.Router();
router.use(authMiddleware);
router.get('/', asyncHandler(controller.list));
router.get('/mine', requireRoles(ROLES.RECRUITER), asyncHandler(controller.mine));
router.get('/:id', asyncHandler(controller.getOne));
router.get('/:id/matches', requireRoles(ROLES.RECRUITER), asyncHandler(controller.matches));
router.post('/', requireRoles(ROLES.RECRUITER), validate(v.createJob), asyncHandler(controller.create));
router.patch('/:id', requireRoles(ROLES.RECRUITER), asyncHandler(controller.update));

module.exports = router;
