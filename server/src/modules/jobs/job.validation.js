const { z } = require('zod');
const { JOB_STATUS, JOB_TYPE } = require('../../utils/constants');

const createJob = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    requiredSkills: z.array(z.string()).optional(),
    education: z.string().optional(),
    experience: z.string().optional(),
    salaryMin: z.number().optional(),
    salaryMax: z.number().optional(),
    location: z.string().optional(),
    jobType: z.enum(Object.values(JOB_TYPE)).optional(),
    positions: z.number().optional(),
    deadline: z.string().optional(),
    eligibility: z.string().optional(),
    selectionProcess: z.string().optional(),
    status: z.enum(Object.values(JOB_STATUS)).optional(),
  }),
});

const updateJob = z.object({ body: createJob.shape.body.partial().strict() });
module.exports = { createJob, updateJob };
