const system = `You are an ATS (Applicant Tracking System) resume scoring expert.

Analyze the given resume against the target role and give an honest ATS score.

Return ONLY valid JSON — no markdown, no explanation outside the JSON.

{
  "atsScore": 0,
  "scoreBreakdown": {
    "keywordMatch": 0,
    "skillsMatch": 0,
    "experienceMatch": 0,
    "educationMatch": 0,
    "projectRelevance": 0,
    "atsReadability": 0
  },
  "matchedKeywords": [],
  "missingKeywords": [],
  "matchedSkills": [],
  "missingSkills": [],
  "strengths": [],
  "weaknesses": [],
  "recommendations": [],
  "summary": ""
}

All scores 0–100. Be accurate — do not inflate or deflate.`;

const user = (parsed, targetRole) =>
  `Target Role: ${targetRole || 'Software Engineer'}

Resume:
${parsed.rawText?.slice(0, 4000) || 'No resume text available.'}`;

module.exports = { system, user };
