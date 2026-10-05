const { z } = require('zod');
const authService = require('./auth.service');

const forgotSchema = z.object({ body: z.object({ email: z.string().email() }) });
const resetSchema = z.object({
  body: z.object({ token: z.string().min(10), password: z.string().min(8) }),
});
const verifySchema = z.object({ body: z.object({ token: z.string().min(10) }) });
const revokeSessionSchema = z.object({ params: z.object({ sessionId: z.string().min(1) }) });

module.exports = {
  profileSchema: z.object({ body: z.object({ firstName: z.string().trim().min(1).max(100), lastName: z.string().trim().min(1).max(100), phone: z.string().trim().max(30).optional() }).strict() }),
  registerSchema: authService.registerSchema,
  loginSchema: authService.loginSchema,
  forgotSchema,
  resetSchema,
  verifySchema,
  revokeSessionSchema,
};
