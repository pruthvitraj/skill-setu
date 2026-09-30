const express = require('express');
const { asyncHandler } = require('../../middleware/asyncHandler');
const { authMiddleware } = require('../../middleware/auth.middleware');
const controller = require('./message.controller');

const router = express.Router();
router.use(authMiddleware);
router.get('/', asyncHandler(controller.list));
router.post('/', asyncHandler(controller.send));
router.get('/:id', asyncHandler(controller.thread));

module.exports = router;
