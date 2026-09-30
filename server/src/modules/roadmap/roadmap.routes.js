const express = require('express');
const { asyncHandler } = require('../../middleware/asyncHandler');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/role.middleware');
const { ROLES } = require('../../utils/constants');
const controller = require('./roadmap.controller');

const router = express.Router();
router.use(authMiddleware, requireRoles(ROLES.STUDENT));
router.get('/me', asyncHandler(controller.current));
router.post('/me', asyncHandler(controller.generate));
router.patch('/me/items/:itemId', asyncHandler(controller.toggle));

module.exports = router;
