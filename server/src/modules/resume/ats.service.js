const openai = require('../../integrations/ai/openai');
const gemini = require('../../integrations/ai/gemini');
const prompt = require('../../integrations/ai/prompts/ats.prompt');

// Role-specific keyword sets
const ROLE_KEYWORDS = {
  'software engineer':   ['javascript', 'react', 'node', 'git', 'sql', 'api', 'rest', 'python', 'docker', 'testing'],
  'frontend developer':  ['html', 'css', 'javascript', 'react', 'typescript', 'responsive', 'ui', 'ux', 'figma'],
  'backend developer':   ['node', 'python', 'java', 'sql', 'rest', 'api', 'docker', 'microservices', 'mongodb'],
  'full stack':          ['react', 'node', 'mongodb', 'sql', 'git', 'api', 'docker', 'javascript', 'typescript'],
  'data engineer':       ['sql', 'python', 'etl', 'spark', 'aws', 'warehouse', 'pandas', 'airflow', 'kafka'],
  'data analyst':        ['sql', 'python', 'excel', 'tableau', 'powerbi', 'statistics', 'pandas', 'visualization'],
  'devops':              ['docker', 'kubernetes', 'ci/cd', 'aws', 'linux', 'terraform', 'jenkins', 'monitoring'],
  default:               ['communication', 'teamwork', 'problem solving', 'git', 'api', 'sql'],
};

function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function getRoleKeywords(targetRole = '') {
  const lower = targetRole.toLowerCase();
  const key = Object.keys(ROLE_KEYWORDS).find((k) => k !== 'default' && lower.includes(k));
  return key ? [...new Set([...ROLE_KEYWORDS[key], ...ROLE_KEYWORDS.default])] : ROLE_KEYWORDS.default;
}

/** Rich rule-based fallback — runs when AI is unavailable */
function scoreRules(parsed, targetRole = '') {
  const needed = getRoleKeywords(targetRole);
  const text = (parsed.rawText || '').toLowerCase();
  const skills = (parsed.skills || []).map((s) => s.toLowerCase());
  const allText = text + ' ' + skills.join(' ');

  const matchedKeywords = needed.filter((k) => allText.includes(k));
  const missingKeywords = needed.filter((k) => !allText.includes(k));
  const matchedSkills = (parsed.skills || []).filter((s) =>
    needed.some((k) => s.toLowerCase().includes(k) || k.includes(s.toLowerCase()))
  );
  const missingSkills = missingKeywords.slice(0, 6);

  const skillsMatch   = clamp((matchedKeywords.length / needed.length) * 100);
  const keywordMatch  = clamp(skillsMatch * 0.85 + (text.length > 800 ? 15 : text.length > 400 ? 8 : 0));
  const educationMatch= clamp(parsed.education?.length ? 80 + (parsed.education.length > 1 ? 10 : 0) : 40);
  const experienceMatch = clamp(Math.min((parsed.experience?.length || 0) * 30, 90));
  const projectRelevance= clamp(Math.min((parsed.projects?.length || 0) * 30, 85));
  const atsReadability  = clamp((parsed.email ? 30 : 0) + (parsed.phone ? 20 : 0) + (parsed.name ? 20 : 0) + (parsed.skills?.length ? 20 : 0) + (text.length > 500 ? 10 : 0));

  const overall = clamp(
    skillsMatch      * 0.25 +
    keywordMatch     * 0.20 +
    educationMatch   * 0.15 +
    experienceMatch  * 0.15 +
    projectRelevance * 0.15 +
    atsReadability   * 0.10
  );

  const strengths = [];
  const weaknesses = [];
  if (parsed.education?.length)   strengths.push('Education qualifications detected');
  if (parsed.experience?.length)  strengths.push(`${parsed.experience.length} experience entry/entries found`);
  if (parsed.projects?.length)    strengths.push(`${parsed.projects.length} project(s) listed — good for freshers`);
  if (matchedSkills.length > 3)   strengths.push(`${matchedSkills.length} relevant skills matched for ${targetRole || 'the role'}`);
  if (parsed.email && parsed.phone) strengths.push('Resume has contact information — good ATS readability');
  if (!parsed.experience?.length) weaknesses.push('No work experience detected — add internships or projects');
  if (missingKeywords.length > 3) weaknesses.push(`Missing key role terms: ${missingKeywords.slice(0, 3).join(', ')}`);
  if (text.length < 500)          weaknesses.push('Resume content appears thin — add more detail to each section');
  if (!parsed.certifications?.length) weaknesses.push('No certifications found — consider adding relevant ones');

  return {
    overall,
    scoreBreakdown: { keywordMatch, skillsMatch, experienceMatch, educationMatch, projectRelevance, atsReadability },
    matchedKeywords,
    missingKeywords,
    matchedSkills,
    missingSkills,
    strengths: strengths.length ? strengths : ['Resume structure is parseable by ATS'],
    weaknesses: weaknesses.length ? weaknesses : ['Continue improving keyword coverage'],
    recommendations: [
      'Quantify achievements (e.g., "improved performance by 30%", "served 500+ users")',
      `Add missing role keywords: ${missingKeywords.slice(0, 4).join(', ')}`,
      'Add more project descriptions with specific tools and outcomes',
      'Include certifications relevant to the target role',
      'Use bullet points over paragraphs for better ATS parsing',
    ],
    summary: `Rule-based ATS analysis for "${targetRole || 'General Role'}". Overall score: ${overall}/100. Matched ${matchedKeywords.length}/${needed.length} role keywords. ${missingKeywords.length > 0 ? `Add missing skills to improve: ${missingKeywords.slice(0, 3).join(', ')}.` : 'Good keyword coverage!'}`,
    disclaimer: 'AI scoring is temporarily unavailable — this score uses rule-based analysis. Upload again later for full AI-powered scoring.',
    scoredBy: 'rules',
  };
}

/** Map Gemini/OpenAI response to our internal schema */
function mapAiResponse(ai, base) {
  const sb = ai.scoreBreakdown || {};
  return {
    overall: clamp(ai.atsScore ?? base.overall),
    scoreBreakdown: {
      keywordMatch:   clamp(sb.keywordMatch   ?? base.scoreBreakdown.keywordMatch),
      skillsMatch:    clamp(sb.skillsMatch    ?? base.scoreBreakdown.skillsMatch),
      experienceMatch:clamp(sb.experienceMatch?? base.scoreBreakdown.experienceMatch),
      educationMatch: clamp(sb.educationMatch ?? base.scoreBreakdown.educationMatch),
      projectRelevance:clamp(sb.projectRelevance?? base.scoreBreakdown.projectRelevance),
      atsReadability: clamp(sb.atsReadability ?? base.scoreBreakdown.atsReadability),
    },
    matchedKeywords:  ai.matchedKeywords  || base.matchedKeywords  || [],
    missingKeywords:  ai.missingKeywords  || base.missingKeywords  || [],
    matchedSkills:    ai.matchedSkills    || base.matchedSkills    || [],
    missingSkills:    ai.missingSkills    || base.missingSkills    || [],
    strengths:        ai.strengths        || base.strengths        || [],
    weaknesses:       ai.weaknesses       || base.weaknesses       || [],
    recommendations:  ai.recommendations  || base.recommendations  || [],
    summary:          ai.summary          || base.summary          || '',
    disclaimer: 'AI-powered ATS analysis. Scores are heuristic and may differ from employer systems.',
    scoredBy: ai._scoredBy || 'ai',
  };
}

async function analyze(parsed, targetRole) {
  const base = scoreRules(parsed, targetRole);
  const userMsg = prompt.user(parsed, targetRole);

  // Try Gemini first (free), then OpenAI as fallback
  let ai = await gemini.completeJson(prompt.system, userMsg);
  if (ai) { ai._scoredBy = 'gemini'; }
  if (!ai) {
    ai = await openai.completeJson(prompt.system, userMsg);
    if (ai) { ai._scoredBy = 'openai'; }
  }

  if (!ai) return base;
  return mapAiResponse(ai, base);
}

module.exports = { analyze, scoreRules };
