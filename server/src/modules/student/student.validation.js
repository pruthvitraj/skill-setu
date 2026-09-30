const { z } = require('zod');

const optionalText = z.string().trim().max(500).optional();

const updateMe = z.object({
  body: z
    .object({
      bio: optionalText,
      headline: optionalText,
      location: optionalText,
      batch: z.string().trim().max(20).optional(),
      enrollmentNo: z.string().trim().max(50).optional(),
      targetRole: z.string().trim().max(120).nullable().optional(),
      privacy: z
        .object({ showProfile: z.boolean().optional(), showScores: z.boolean().optional() })
        .strict()
        .optional(),
    })
    .strict(),
});

const itemId = z.object({ params: z.object({ itemId: z.string().min(1) }) });

const education = z.object({
  body: z
    .object({
      institution: z.string().trim().min(1).max(200),
      degree: optionalText,
      field: optionalText,
      startYear: z.coerce.number().int().min(1950).max(2100).optional(),
      endYear: z.coerce.number().int().min(1950).max(2100).optional(),
      grade: optionalText,
    })
    .strict(),
});

const skills = z.object({
  body: z
    .object({
      name: z.string().trim().min(1).max(100),
      level: z.enum(['beginner', 'intermediate', 'advanced']),
    })
    .strict(),
});

const projects = z.object({
  body: z
    .object({
      title: z.string().trim().min(1).max(200),
      description: optionalText,
      skills: z.array(z.string().trim().min(1).max(100)).max(20).optional(),
      url: z.string().url().max(500).optional(),
      highlights: z.array(z.string().trim().min(1).max(300)).max(20).optional(),
    })
    .strict(),
});

const experience = z.object({
  body: z
    .object({
      company: z.string().trim().min(1).max(200),
      title: z.string().trim().min(1).max(200),
      startDate: z.coerce.date(),
      endDate: z.coerce.date().optional(),
      current: z.boolean().optional(),
      description: optionalText,
    })
    .strict(),
});

const certifications = z.object({
  body: z
    .object({
      name: z.string().trim().min(1).max(200),
      issuer: optionalText,
      issuedAt: z.coerce.date().optional(),
      url: z.string().url().max(500).optional(),
      fileKey: z.string().trim().max(500).optional(),
    })
    .strict(),
});

module.exports = {
  updateMe,
  itemId,
  education,
  skills,
  projects,
  experience,
  certifications,
};
