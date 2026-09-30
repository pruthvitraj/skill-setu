const { z } = require('zod');

module.exports = {
  create: z.object({ body: z.object({ body: z.string().min(1), tags: z.array(z.string()).optional() }) }),
};
