const express = require('express');
const { asyncHandler } = require('../../middleware/asyncHandler');
const { authMiddleware } = require('../../middleware/auth.middleware');
const controller = require('./course.controller');
const { requireRoles } = require('../../middleware/role.middleware');
const { ROLES } = require('../../utils/constants');
const { success } = require('../../utils/response');
const youtube = require('./youtube.service');
const resources = require('./resource-search.service');

const router = express.Router();
router.use(authMiddleware);
router.get('/', asyncHandler(controller.list));
router.get('/resources', requireRoles(ROLES.STUDENT), asyncHandler(async (req, res) =>
  success(res, 'OK', await resources.search(req.query.q))
));
router.get('/youtube', requireRoles(ROLES.STUDENT), asyncHandler(async (req, res) =>
  success(res, 'OK', await youtube.search(req.query.q))
));
router.get('/recommended', asyncHandler(controller.recommended));

module.exports = router;
