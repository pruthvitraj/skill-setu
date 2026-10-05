const router = require('express').Router();
const { authMiddleware } = require('../../middleware/auth.middleware');
const { asyncHandler } = require('../../middleware/asyncHandler');
const { success } = require('../../utils/response');
const service = require('./evidence.service');
router.use(authMiddleware);
router.get('/me', asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ success: false, message: 'Student access required' });
  return success(res, 'OK', await service.accessibleProfile(req.user));
}));
router.get('/students/:id', asyncHandler(async (req, res) => success(res, 'OK', await service.accessibleProfile(req.user, req.params.id))));
module.exports = router;
