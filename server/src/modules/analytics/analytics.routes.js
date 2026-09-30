const express = require('express');
const { asyncHandler } = require('../../middleware/asyncHandler');
const { authMiddleware } = require('../../middleware/auth.middleware');
const controller = require('./analytics.controller');

const router = express.Router();
router.get('/me', authMiddleware, asyncHandler(controller.me));

module.exports = router;
