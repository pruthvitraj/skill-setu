const express = require('express');
const { asyncHandler } = require('../../middleware/asyncHandler');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const controller = require('./post.controller');
const v = require('./post.validation');

const router = express.Router();
router.use(authMiddleware);
router.get('/', asyncHandler(controller.list));
router.post('/', validate(v.create), asyncHandler(controller.create));
router.post('/:id/like', asyncHandler(controller.like));
router.delete('/:id/like', asyncHandler(controller.unlike));
router.delete('/:id', asyncHandler(controller.remove));

module.exports = router;
