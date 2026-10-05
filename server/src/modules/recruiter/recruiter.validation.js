const { z } = require('zod');

module.exports = {
  update: z.object({ body: z.object({ designation: z.string().trim().max(200).optional(), company: z.object({ name: z.string().trim().min(1).max(200).optional(), website: z.string().url().or(z.literal('')).optional(), location: z.string().trim().max(300).optional(), industry: z.string().trim().max(200).optional(), about: z.string().max(5000).optional() }).strict().optional() }).strict() }),
  invite: z.object({
    body: z.object({
      title: z.string().optional(),
      proposedDate: z.string().optional(),
      eligibility: z.string().optional(),
      job: z.string().optional(),
    }),
  }),
};
