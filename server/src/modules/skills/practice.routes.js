const express = require('express');
const { z } = require('zod');
const { asyncHandler } = require('../../middleware/asyncHandler');
const { requireRoles } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { ROLES } = require('../../utils/constants');
const { success } = require('../../utils/response');
const service = require('./practice.service');

const router = express.Router();
router.use(requireRoles(ROLES.STUDENT));

router.get('/', asyncHandler(async (req, res) =>
  success(res, 'OK', { items: await service.list(req.user.id) })
));

router.post('/', validate(z.object({
  body: z.object({}).strict(),
})), asyncHandler(async (req, res) =>
  success(res, 'Practice assignment generated',
    { item: await service.generate(req.user.id) }, 201)
));

const responseSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-fA-F0-9]{24}$/) }),
  body: z.object({ response: z.string().max(20000) }).strict(),
});

router.patch('/:id', validate(responseSchema), asyncHandler(async (req, res) =>
  success(res, 'Draft saved', {
    item: await service.save(req.user.id, req.params.id, req.validated.body.response, false),
  })
));

router.post('/:id/submit', validate(responseSchema), asyncHandler(async (req, res) =>
  success(res, 'Practice work submitted', {
    item: await service.save(req.user.id, req.params.id, req.validated.body.response, true),
  })
));

module.exports = router;
