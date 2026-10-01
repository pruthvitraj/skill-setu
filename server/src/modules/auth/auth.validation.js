const { z } = require('zod');
const authService = require('./auth.service');

const forgotSchema = z.object({ body: z.object({ email: z.string().email() }) });
const resetSchema = z.object({
  body: z.object({ token: z.string().min(10), password: z.string().min(8) }),
});
const verifySchema = z.object({ body: z.object({ token: z.string().min(10) }) });
const revokeSessionSchema = z.object({ params: z.object({ sessionId: z.string().min(1) }) });

module.exports = {
  registerSchema: authService.registerSchema,
  loginSchema: authService.loginSchema,
  forgotSchema,
  resetSchema,
  verifySchema,
  revokeSessionSchema,
};
