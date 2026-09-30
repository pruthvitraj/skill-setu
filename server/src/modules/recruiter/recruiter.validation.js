const { z } = require('zod');

module.exports = {
  invite: z.object({
    body: z.object({
      title: z.string().optional(),
      proposedDate: z.string().optional(),
      eligibility: z.string().optional(),
      job: z.string().optional(),
    }),
  }),
};
