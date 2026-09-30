const { z } = require('zod');
const { DRIVE_STATUS } = require('../../utils/constants');

module.exports = {
  request: z.object({
    body: z.object({
      university: z.string(),
      title: z.string().optional(),
      proposedDate: z.string().optional(),
      eligibility: z.string().optional(),
      job: z.string().optional(),
    }),
  }),
  review: z.object({
    body: z.object({
      status: z.enum(Object.values(DRIVE_STATUS)),
      scheduledDate: z.string().optional(),
      tpoNote: z.string().optional(),
    }),
  }),
};
