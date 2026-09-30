const { test } = require('node:test');
const assert = require('node:assert/strict');
const { scoreRules } = require('../src/modules/resume/ats.service');
const { matchStudentToJob } = require('../src/modules/jobs/jobMatching.service');

test('ATS rules stay in 0-100 and include a disclaimer', () => {
  const result = scoreRules(
    { skills: ['sql', 'python'], education: ['B.Tech'], experience: ['Intern'], projects: ['ETL'], email: 'a@b.c', phone: '999', rawText: 'x'.repeat(500) },
    'Data Engineer'
  );
  assert.ok(result.overall >= 0 && result.overall <= 100);
  assert.ok(result.disclaimer.includes('not a guarantee'));
});

test('job matching is a score not a hire decision', () => {
  const match = matchStudentToJob(
    { skills: [{ name: 'SQL' }, { name: 'Python' }], skillScore: 80, atsScore: 70 },
    { requiredSkills: ['SQL', 'Python', 'AWS'] }
  );
  assert.ok(match.score <= 100);
  assert.ok(match.disclaimer);
});
