const { z } = require('zod');
const { APPLICATION_STATUS } = require('../../utils/constants');

module.exports = {
  apply: z.object({ body: z.object({ jobId: z.string(), resumeId: z.string(), coverNote: z.string().optional() }) }),
  status: z.object({ body: z.object({ status: z.enum(Object.values(APPLICATION_STATUS)), note: z.string().optional() }) }),
};
