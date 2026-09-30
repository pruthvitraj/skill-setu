const { z } = require('zod');
const { INTERVIEW_ROUNDS } = require('../../utils/constants');

module.exports = {
  create: z.object({
    body: z.object({
      candidate: z.string(),
      job: z.string(),
      application: z.string().optional(),
      round: z.enum(Object.values(INTERVIEW_ROUNDS)).optional(),
      scheduledAt: z.string().optional(),
      mode: z.enum(['online', 'offline']).optional(),
      meetingLink: z.string().optional(),
      interviewers: z.array(z.string()).optional(),
    }),
  }),
};
