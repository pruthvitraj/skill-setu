const { z } = require('zod');

const submitAttempt = z.object({
  body: z.object({
    answers: z.array(z.object({
      questionIndex: z.number().int().min(0),
      selectedIndex: z.number().int().min(0),
    }).strict()).max(100),
  }).strict(),
});

module.exports = { submitAttempt };