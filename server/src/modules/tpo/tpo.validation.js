const { z } = require('zod');

module.exports = {
  announcement: z.object({
    body: z.object({
      title: z.string().min(2),
      body: z.string().min(2),
      category: z.string().optional(),
      audience: z.enum(['all', 'department', 'batch', 'selected']).optional(),
      batch: z.string().optional(),
      department: z.string().regex(/^[a-f0-9]{24}$/i).optional(),
      studentIds: z.array(z.string().regex(/^[a-f0-9]{24}$/i)).max(500).optional(),
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
