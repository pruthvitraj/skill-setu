import { SectionHeading } from './PageHeader';
import Feedback from './Feedback';
import { useEffect, useState } from 'react';
import api from '../../services/api';
export default function CompetencyEvidence({ studentId }) {
  const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { let active = true; setData(null); setError(''); api.get(studentId ? `/evidence/students/${studentId}` : '/evidence/me').then(r => { if (active) setData(r.data); }).catch(e => { if (active) setError(e.message || 'Unable to load evidence.'); }); return () => { active = false; }; }, [studentId]);
  return <section className="ui-section" aria-labelledby="competency-evidence-heading">
    <SectionHeading title={<span id="competency-evidence-heading">Competency evidence</span>} description="Practice results and self-reported skills are separate from evaluated evidence." />
    {error && <Feedback kind="error">{error}</Feedback>}
    {!data && !error && <Feedback kind="loading">Loading evidence…</Feedback>}
    {data && <>{data.items.length ? data.items.map(e => <details key={e._id} className="ui-evidence-details">
      <summary>{e.skill} · {e.score}%<span>{e.source === 'assessment' ? 'Controlled assessment' : 'Company rubric review'} · {new Date(e.evaluatedAt).toLocaleString()}</span></summary>
      <dl><div><dt>Source</dt><dd>{e.title} ({e.sourceId})</dd></div><div><dt>Evaluator</dt><dd>{e.evaluator}</dd></div><div><dt>Method</dt><dd>{e.method}</dd></div><div><dt>Evaluated at</dt><dd>{new Date(e.evaluatedAt).toLocaleString()}</dd></div></dl>
      {e.rubric?.map((row, i) => <p key={i}>{row.criterion}: {row.score}% (weight {row.weight}%)</p>)}
      {e.feedback && <p>{e.feedback}</p>}<p className="ui-muted">{e.limitations}</p>
    </details>) : <Feedback kind="empty" title="No evaluated evidence yet">Complete a controlled assessment or submit a company challenge for review.</Feedback>}
    <p className="ui-helper">{data.policy}</p></>}
  </section>;
}
