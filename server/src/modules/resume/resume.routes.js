const express = require('express');
const { asyncHandler } = require('../../middleware/asyncHandler');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/role.middleware');
const { upload } = require('../../middleware/upload.middleware');
const { ROLES } = require('../../utils/constants');
const controller = require('./resume.controller');

const router = express.Router();
router.use(authMiddleware, requireRoles(ROLES.STUDENT));
router.post('/', upload.single('file'), asyncHandler(controller.upload));
router.get('/', asyncHandler(controller.list));
router.get('/latest', asyncHandler(controller.latest));
router.delete('/:id', asyncHandler(controller.remove));

module.exports = router;
