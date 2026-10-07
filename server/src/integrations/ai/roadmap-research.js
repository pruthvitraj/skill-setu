const crypto = require('node:crypto');
const { readBounded } = require('./json-adapter');
const { skillsForRole } = require('../../utils/learningRole');
// Curated official documentation only. Students/models cannot choose fetch URLs.
const catalog = [
  { id: 'mdn-web', title: 'MDN: Learn web development', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development', skills: ['HTML','CSS','JavaScript','Accessibility'] },
  { id: 'react', title: 'React: Learn', url: 'https://react.dev/learn', skills: ['React'] },
  { id: 'python', title: 'Python tutorial', url: 'https://docs.python.org/3/tutorial/', skills: ['Python'] },
  { id: 'postgresql', title: 'PostgreSQL tutorial', url: 'https://www.postgresql.org/docs/current/tutorial.html', skills: ['SQL','Data Modeling'] },
  { id: 'airflow', title: 'Apache Airflow tutorials', url: 'https://airflow.apache.org/docs/apache-airflow/stable/tutorial/index.html', skills: ['Airflow','ETL'] },
  { id: 'node', title: 'Node.js introduction', url: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs', skills: ['Node.js','REST API'] },
  { id: 'docker', title: 'Docker: Get started', url: 'https://docs.docker.com/get-started/', skills: ['Docker','CI/CD'] },
  { id: 'kubernetes', title: 'Kubernetes tutorials', url: 'https://kubernetes.io/docs/tutorials/', skills: ['Kubernetes','Cloud','Networking'] },
  { id: 'git', title: 'Git documentation', url: 'https://git-scm.com/doc', skills: ['Git','Linux','Bash'] },
  { id: 'scikit-learn', title: 'Scikit-learn: Getting started', url: 'https://scikit-learn.org/stable/getting_started.html', skills: ['Machine Learning','Statistics'] },
];
function extractText(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || html;
  return main.replace(/<(script|style|nav|header|footer)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ').replace(/&(?:nbsp|amp|lt|gt|quot|#\d+);/g, ' ')
    .replace(/\s+/g, ' ').trim().slice(0, 5000);
}
function createRetrieval({ fetchImpl = (...args) => fetch(...args), now = Date.now, timeoutMs = 8000 } = {}) {
  const cache = new Map();
  async function retrieve(targetRole) {
    const wanted = new Set(skillsForRole(targetRole));
    const selected = catalog.map(source => ({ source, score: source.skills.filter(skill => wanted.has(skill)).length }))
      .filter(item => item.score > 0).sort((a,b) => b.score - a.score).slice(0,3).map(item => item.source);
    const attemptedAt = new Date(now()).toISOString();
    const results = await Promise.all(selected.map(async source => {
      const cached = cache.get(source.id);
      if (cached && cached.expires > now()) return cached.value;
      let value = null;
      try {
        const response = await fetchImpl(source.url, { redirect: 'error', signal: AbortSignal.timeout(timeoutMs), headers: { Accept: 'text/html' } });
        if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) { await response.body?.cancel(); throw new Error('Unavailable source'); }
        const html = await readBounded(response, 1048576);
        const excerpt = extractText(html);
        if (excerpt.length < 120) throw new Error('Insufficient reference text');
        value = { id: source.id, title: source.title, url: source.url, retrievedAt: new Date(now()).toISOString(),
          excerpt, contentHash: crypto.createHash('sha256').update(excerpt).digest('hex') };
      } catch { /* Failed fetches are never represented as retrieved sources. */ }
      cache.set(source.id, { value, expires: now() + (value ? 600000 : 60000) });
      return value;
    }));
    const sources = results.filter(Boolean);
    return { status: sources.length ? 'retrieved' : selected.length ? 'failed' : 'unavailable', attemptedAt, sources };
  }
  return { retrieve };
}
const retrieval = createRetrieval();
module.exports = { retrieve: retrieval.retrieve, createRetrieval, extractText };
