const express = require('express');
const { asyncHandler } = require('../../middleware/asyncHandler');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { ROLES } = require('../../utils/constants');
const controller = require('./recruiter.controller');
const v = require('./recruiter.validation');

const router = express.Router();
router.use(authMiddleware, requireRoles(ROLES.RECRUITER));
router.get('/team', asyncHandler(async (req, res) => require('../../utils/response').success(res, 'OK', { items: await require('./recruiter.service').team(req.user.id) })));
router.get('/me', asyncHandler(controller.me));
router.patch('/me', validate(v.update), asyncHandler(controller.update));
router.get('/dashboard', asyncHandler(controller.dashboard));
router.get('/candidates', asyncHandler(controller.candidates));
router.get('/candidates/:id', asyncHandler(controller.candidateDetails));
router.get('/universities', asyncHandler(controller.universities));
router.get('/placement-drives', asyncHandler(controller.drives));
router.post('/universities/:id/invite', validate(v.invite), asyncHandler(controller.invite));

module.exports = router;
