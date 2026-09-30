function skillOverlap(required = [], studentSkills = []) {
  const have = studentSkills.map((s) => (s.name || s).toLowerCase());
  if (!required.length) return 50;
  const hits = required.filter((r) => have.some((h) => h.includes(r.toLowerCase()) || r.toLowerCase().includes(h)));
  return Math.round((hits.length / required.length) * 100);
}

function matchStudentToJob(student, job) {
  const skill = skillOverlap(job.requiredSkills, student.skills || []);
  const assessmentBoost = Math.min(20, (student.skillScore || 0) * 0.2);
  const atsBoost = Math.min(15, (student.atsScore || 0) * 0.15);
  const score = Math.min(100, Math.round(skill * 0.7 + assessmentBoost + atsBoost));
  return {
    score,
    skillMatch: skill,
    reasons: [
      `Skill overlap ${skill}%`,
      `Assessment signal ${student.skillScore || 0}`,
      `ATS signal ${student.atsScore || 0}`,
    ],
    disclaimer: 'Matching is a relevance signal, not a guarantee of hiring success.',
  };
}

module.exports = { matchStudentToJob, skillOverlap };
