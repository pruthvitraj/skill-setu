const { z } = require('zod');

module.exports = {
  announcement: z.object({
    body: z.object({
      title: z.string().min(2),
      body: z.string().min(2),
      category: z.string().optional(),
      audience: z.enum(['all', 'department', 'batch', 'selected']).optional(),
      batch: z.string().optional(),
    }),
  }),
  requestDrive: z.object({
    body: z.object({
      company: z.string(),
      job: z.string(),
      title: z.string().optional(),
      proposedDate: z.string().optional(),
      eligibility: z.string().optional(),
    }),
  }),
};
