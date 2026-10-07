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
router.use('/practice-assignments', require('./practice.routes'));
router.get('/', asyncHandler(controller.catalog));
router.get('/assessments', asyncHandler(controller.list));
router.get('/assessments/:id', requireRoles(ROLES.STUDENT), asyncHandler(controller.getOne));
router.post('/assessments/:id/attempts', requireRoles(ROLES.STUDENT), validate(validation.submitAttempt), asyncHandler(controller.submit));
router.get('/tracker/me', requireRoles(ROLES.STUDENT), asyncHandler(controller.tracker));

const controlled = require('./controlled.service');
const { z } = require('zod');
const { success } = require('../../utils/response');
router.post('/assessments/:id/start', requireRoles(ROLES.STUDENT), validate(z.object({ body: z.object({ rulesVersion: z.literal(controlled.RULES) }).strict() })), asyncHandler(async (req, res) => success(res, 'Attempt started', await controlled.start(req.user.id, req.params.id, req.validated.body.rulesVersion))));
router.post('/attempts/:id/submit', requireRoles(ROLES.STUDENT), validate(validation.submitAttempt), asyncHandler(async (req, res) => success(res, 'Assessment submitted', await controlled.submit(req.user.id, req.params.id, req.validated.body.answers))));
module.exports = router;
