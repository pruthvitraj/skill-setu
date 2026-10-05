const { z } = require('zod');
const { INTERVIEW_STATUS, INTERVIEW_ROUNDS } = require('../../utils/constants');

module.exports = {
  update: z.object({ body: z.object({
    scheduledAt: z.string().datetime().optional(),
    mode: z.enum(['online', 'offline']).optional(),
    meetingLink: z.string().url().or(z.literal('')).optional(),
    location: z.string().max(500).optional(),
    interviewers: z.array(z.string().max(200)).max(20).optional(),
    status: z.enum(Object.values(INTERVIEW_STATUS)).optional(),
    feedback: z.string().max(5000).optional(),
    result: z.enum(['pending', 'pass', 'fail', 'hold']).optional(),
  }).strict() }),
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
