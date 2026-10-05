import { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { skillApi } from '../../services/skillApi';
const RULES = 'timed-single-submit-v1';
export default function StudentAssessments() {
  const [items, setItems] = useState([]); const [selected, setSelected] = useState(null); const [answers, setAnswers] = useState({});
  const [rules, setRules] = useState(null); const [accepted, setAccepted] = useState(false); const [result, setResult] = useState(null);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [loading, setLoading] = useState(true); const [now, setNow] = useState(Date.now());
  useEffect(() => { skillApi.assessments().then(r => setItems(r.data.items || [])).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  useEffect(() => { if (!selected?.attempt) return; const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, [selected]);
  const remaining = selected?.attempt ? Math.max(0, Math.ceil((new Date(selected.attempt.expiresAt).getTime() - (now + selected.clockOffset)) / 1000)) : null;
  async function start(item, mode) {
    setBusy(true); setError(''); setResult(null);
    try {
      if (mode === 'practice') { const r = await skillApi.assessment(item._id); setSelected({ ...r.data.item, mode }); }
      else { const r = await api.post(`/skills/assessments/${item._id}/start`, { rulesVersion: RULES }); setSelected({ ...item, ...r.data, mode, clockOffset: new Date(r.data.serverTime).getTime() - Date.now() }); setNow(Date.now()); }
      setAnswers({}); setRules(null); setAccepted(false);
    } catch (e) { setError(e.message || 'Unable to start.'); } finally { setBusy(false); }
  }
  async function submit() {
    if (Object.keys(answers).length !== selected.questions.length) { setError('Answer every question before submitting.'); return; }
    setBusy(true); setError('');
    try {
      const payload = selected.questions.map((q, questionIndex) => ({ questionIndex, selectedIndex: answers[questionIndex] }));
      const r = selected.mode === 'practice' ? await skillApi.submit(selected._id, payload) : await api.post(`/skills/attempts/${selected.attempt._id}/submit`, { answers: payload });
      setResult({ ...r.data, mode: selected.mode }); setSelected(null);
    } catch (e) { setError(e.message || 'Unable to submit.'); } finally { setBusy(false); }
  }
  return <main className="mx-auto max-w-5xl p-6"><h1 className="text-3xl font-semibold">Practice & assessments</h1><p className="mt-2 text-sm text-slate-600">Practice freely. Use a controlled assessment to record evaluated evidence.</p>{loading && <p className="mt-6">Loading assessments…</p>}{error && <p role="alert" className="mt-4 text-red-700">{error}</p>}{result && <section className="mt-6 border-y border-slate-200 py-5"><h2 className="text-xl font-semibold">{result.mode === 'practice' ? 'Practice result' : 'Controlled assessment result'}: {result.score}%</h2><p className="mt-2 text-sm">{result.mode === 'practice' ? 'Saved in practice history. This result does not update competency evidence.' : 'Saved to your competency evidence. This is a timed evaluation, not a proctored certification.'}</p></section>}
    {rules && <section className="mt-6 border border-slate-300 p-5"><h2 className="text-xl font-semibold">Assessment rules · {rules.title}</h2><ul className="mt-4 list-disc space-y-2 pl-5 text-sm"><li>{rules.durationMinutes || 20} minutes from starting, enforced by the server.</li><li>One controlled attempt for this assessment. Leaving the page does not pause the timer; resume using the same start button.</li><li>Answer every question. Submission is final.</li><li>Work independently. Identity and external assistance are not monitored.</li><li>The question set is shared with practice; evidence records these limits.</li></ul><label className="mt-4 flex gap-2 text-sm"><input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} />I understand and accept these rules.</label><div className="mt-4 flex gap-3"><Button disabled={!accepted || busy} onClick={() => start(rules, 'verified')}>Start / resume controlled attempt</Button><Button variant="ghost" disabled={busy} onClick={() => setRules(null)}>Back</Button></div></section>}
    {selected ? <section className="mt-6"><div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4"><h2 className="text-xl font-semibold">{selected.title} · {selected.mode === 'practice' ? 'Practice' : 'Controlled attempt'}</h2>{remaining !== null && <p role="timer" className={remaining ? 'font-mono' : 'text-red-700'}>{remaining ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')} remaining` : 'Deadline passed'}</p>}<Button variant="ghost" disabled={busy} onClick={() => setSelected(null)}>Leave attempt</Button></div>{selected.questions.map((q, index) => <fieldset key={index} disabled={busy || remaining === 0} className="mt-6 border-b border-slate-200 pb-6"><legend className="font-medium">{index + 1}. {q.prompt}</legend><div className="mt-3 space-y-3">{q.options.map((option, i) => <label key={i} className="flex items-start gap-3 text-sm"><input type="radio" name={`question-${index}`} checked={answers[index] === i} onChange={() => setAnswers(a => ({ ...a, [index]: i }))} />{option}</label>)}</div></fieldset>)}<Button className="mt-6" disabled={busy || remaining === 0} onClick={submit}>{busy ? 'Submitting…' : 'Submit answers'}</Button></section> : !rules && <div className="mt-6 divide-y border-t border-slate-200">{items.map(item => <section key={item._id} className="flex flex-wrap items-center justify-between gap-4 py-5"><div><h2 className="font-semibold">{item.title}</h2><p className="mt-1 text-sm text-slate-500">{item.skill} · {item.durationMinutes || 20} minutes</p></div><div className="flex gap-3"><Button variant="ghost" disabled={busy} onClick={() => start(item, 'practice')}>Practice</Button><Button disabled={busy} onClick={() => { setRules(item); setAccepted(false); setError(''); }}>Assessment rules</Button></div></section>)}{!loading && !items.length && <p className="py-6 text-sm text-slate-500">No assessments available yet.</p>}</div>}
  </main>;
}
