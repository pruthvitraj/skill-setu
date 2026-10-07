
const groups = [
  {
    roles: ['frontend', 'front end', 'react', 'ui', 'ux', 'web developer', 'javascript'],
    skills: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Accessibility', 'Next.js'],
  },
  {
    roles: ['backend', 'back end', 'node', 'express', 'java developer', 'python developer', 'golang'],
    skills: ['REST API', 'SQL', 'Authentication', 'Security', 'MongoDB', 'Redis', 'Testing'],
  },
  {
    roles: ['data engineer', 'data analyst', 'etl', 'pipeline', 'warehouse', 'spark'],
    skills: ['SQL', 'Python', 'Data Modeling', 'ETL', 'Airflow', 'Spark', 'Kafka', 'Data Warehousing'],
  },
  {
    roles: ['ai', 'machine learning', 'ml', 'data science', 'data scientist', 'llm', 'deep learning'],
    skills: ['Python', 'Statistics', 'Linear Algebra', 'Pandas', 'NumPy', 'Machine Learning', 'PyTorch', 'TensorFlow'],
  },
  {
    roles: ['cloud', 'devops', 'aws', 'docker', 'kubernetes', 'sre', 'sysadmin', 'build engineer'],
    skills: ['Linux', 'Bash', 'Git', 'Docker', 'CI/CD', 'AWS', 'Azure', 'GCP', 'Terraform', 'Kubernetes', 'Networking'],
  },
];

const normalize = value => String(value || '').toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ').trim();

function skillsForRole(role) {
  const normalized = ' ' + normalize(role) + ' ';
  const ranked = groups.map(group => ({
    group,
    score: Math.max(0, ...group.roles
      .filter(keyword => normalized.includes(' ' + normalize(keyword) + ' '))
      .map(keyword => keyword.length)),
  })).filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!ranked.length) return [];
  const skills = [...ranked[0].group.skills];
  if (ranked[0].group === groups[1]) {
    if (normalized.includes(' python ')) skills.push('Python');
    else if (normalized.includes(' java ')) skills.push('Java');
    else if (normalized.includes(' golang ')) skills.push('Go');
    else skills.push('Node.js', 'Express');
  }
  return skills;
}

function courseFilterForRole(role) {
  const skills = skillsForRole(role);
  if (!skills.length) return { _id: { $in: [] } };
  return { skill: { $in: skills.map(skill => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp('^\\s*' + escaped + '\\s*$', 'i');
  }) } };
}

module.exports = { skillsForRole, courseFilterForRole };
