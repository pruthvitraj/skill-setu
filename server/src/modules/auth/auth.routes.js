const express = require('express');
const { asyncHandler } = require('../../middleware/asyncHandler');
const { validate } = require('../../middleware/validation.middleware');
const { authLimiter } = require('../../middleware/rateLimit.middleware');
const { authMiddleware } = require('../../middleware/auth.middleware');
const controller = require('./auth.controller');
const v = require('./auth.validation');

const router = express.Router();

router.post('/register', authLimiter, validate(v.registerSchema), asyncHandler(controller.register));
router.post('/login', authLimiter, validate(v.loginSchema), asyncHandler(controller.login));
router.post('/logout', asyncHandler(controller.logout));
router.post('/forgot-password', authLimiter, validate(v.forgotSchema), asyncHandler(controller.forgot));
router.post('/reset-password', validate(v.resetSchema), asyncHandler(controller.reset));
router.post('/verify-email', validate(v.verifySchema), asyncHandler(controller.verify));
router.get('/me', authMiddleware, asyncHandler(controller.me));

module.exports = router;
