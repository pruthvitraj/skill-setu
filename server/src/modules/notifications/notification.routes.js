const express = require('express');
const { asyncHandler } = require('../../middleware/asyncHandler');
const { authMiddleware } = require('../../middleware/auth.middleware');
const controller = require('./notification.controller');

const router = express.Router();
router.use(authMiddleware);
router.get('/', asyncHandler(controller.list));
router.post('/read-all', asyncHandler(controller.readAll));
router.patch('/:id/read', asyncHandler(controller.read));

module.exports = router;
