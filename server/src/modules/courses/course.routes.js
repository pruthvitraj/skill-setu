const express = require('express');
const { asyncHandler } = require('../../middleware/asyncHandler');
const { authMiddleware } = require('../../middleware/auth.middleware');
const controller = require('./course.controller');

const router = express.Router();
router.use(authMiddleware);
router.get('/', asyncHandler(controller.list));
router.get('/recommended', asyncHandler(controller.recommended));

module.exports = router;
