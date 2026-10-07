import RolePractice from '../../components/learning/RolePractice';
import { useEffect, useRef, useState } from 'react';
import { ListChecks, Clock, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import Feedback from '../../components/common/Feedback';
import LearningWorkspace, { LearningEmpty } from '../../components/learning/LearningWorkspace';
import api from '../../services/api';
import { skillApi } from '../../services/skillApi';
const RULES = 'timed-single-submit-v1';
export default function StudentAssessments() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});
  const [rules, setRules] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const stageHeading = useRef(null);
  async function load() {
    setLoading(true); setError('');
    try { const response = await skillApi.assessments(); setItems(response.data.items || []); }
    catch (requestError) { setError(requestError.message || 'Unable to load practice assignments.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!selected?.attempt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [selected]);
  useEffect(() => { if (selected || rules || result) stageHeading.current?.focus(); }, [selected, rules, result]);
  const remaining = selected?.attempt ? Math.max(0, Math.ceil((new Date(selected.attempt.expiresAt).getTime() - (now + selected.clockOffset)) / 1000)) : null;
  async function start(item, mode) {
    setBusy(true); setError(''); setResult(null);
    try {
      if (mode === 'practice') {
        const response = await skillApi.assessment(item._id);
        setSelected({ ...response.data.item, mode });
      } else {
        const response = await api.post(`/skills/assessments/${item._id}/start`, { rulesVersion: RULES });
        setSelected({ ...item, ...response.data, mode, clockOffset: new Date(response.data.serverTime).getTime() - Date.now() });
        setNow(Date.now());
      }
      setAnswers({}); setRules(null); setAccepted(false);
    } catch (requestError) { setError(requestError.message || 'Unable to start.'); }
    finally { setBusy(false); }
  }
  async function submit() {
    if (Object.keys(answers).length !== selected.questions.length) { setError('Answer every question before submitting.'); return; }
    setBusy(true); setError('');
    try {
      const payload = selected.questions.map((question, questionIndex) => ({ questionIndex, selectedIndex: answers[questionIndex] }));
      const response = selected.mode === 'practice' ? await skillApi.submit(selected._id, payload) : await api.post(`/skills/attempts/${selected.attempt._id}/submit`, { answers: payload });
      setResult({ ...response.data, mode: selected.mode }); setSelected(null);
    } catch (requestError) { setError(requestError.message || 'Unable to submit.'); }
    finally { setBusy(false); }
  }
  return <LearningWorkspace title="Practice assignments" description="Repeat practice to learn. Choose a separate controlled assessment when you want an evaluated result recorded as competency evidence.">
    <RolePractice />
    {loading && <Feedback>Loading practice assignments…</Feedback>}
    {error && <Feedback kind="error" title="Action could not be completed" action={!selected && !rules && <Button variant="ghost" disabled={busy || loading} onClick={load}>Try again</Button>}>{error}</Feedback>}
    {result && <section className="sm-panel" aria-label="Submission result"><p className="sm-overline">Submission saved</p><h2 ref={stageHeading} tabIndex={-1} className="mt-2">{result.mode === 'practice' ? 'Practice result' : 'Controlled assessment result'}</h2><p className="sm-stat mt-6">{result.score}%</p><p className="sm-muted mt-4">{result.mode === 'practice' ? 'Saved in practice history. This result does not update competency evidence. You can practice again.' : 'Saved to your competency evidence. This is a timed evaluation, not a proctored certification. The final submission cannot be replaced.'}</p></section>}
    {rules && <section className="sm-panel"><p className="sm-overline sm-cyan">Controlled assessment / Rules</p><h2 ref={stageHeading} tabIndex={-1} className="mt-2">{rules.title}</h2><ul className="sm-rule-list"><li>{rules.durationMinutes || 20} minutes from starting, enforced by the server.</li><li>One controlled attempt for this assessment. Leaving the page does not pause the timer; resume using the same start button.</li><li>Answer every question. Submission is final.</li><li>Work independently. Identity and external assistance are not monitored.</li><li>The question set is shared with practice; evidence records these limits.</li></ul><label className="sm-check"><input type="checkbox" checked={accepted} disabled={busy} onChange={event => setAccepted(event.target.checked)} /><span>I understand and accept these rules.</span></label><div className="sm-actions"><Button disabled={!accepted || busy} onClick={() => start(rules, 'verified')}>{busy ? 'Starting…' : 'Start / resume controlled attempt'}</Button><Button variant="ghost" disabled={busy} onClick={() => setRules(null)}>Back to assignments</Button></div></section>}
    {selected ? <section className="sm-section"><div className="sm-section-heading"><div><p className="sm-overline">{selected.mode === 'practice' ? 'Repeatable practice / No competency evidence' : 'Controlled attempt / Final submission'}</p><h2 ref={stageHeading} tabIndex={-1} className="mt-2">{selected.title}</h2></div><div className="sm-actions">{remaining !== null && <p role="timer" className="sm-timer"><Clock size={16} className="inline mr-2" aria-hidden="true" />{remaining ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')} remaining` : 'Deadline passed'}</p>}<Button variant="ghost" disabled={busy} onClick={() => { setSelected(null); setError(''); }}>Leave attempt</Button></div></div><p className="sm-meta" role="status">{Object.keys(answers).length} / {selected.questions.length} questions answered</p>{remaining === 0 && <Feedback kind="error">The server deadline has passed. This attempt can no longer be submitted.</Feedback>}{selected.questions.map((question, index) => <fieldset key={index} disabled={busy || remaining === 0} className="sm-question"><legend>{index + 1}. {question.prompt}</legend>{question.options.map((option, optionIndex) => <label key={optionIndex} className="sm-answer"><input type="radio" name={`question-${index}`} checked={answers[index] === optionIndex} onChange={() => setAnswers(current => ({ ...current, [index]: optionIndex }))} /><span>{option}</span></label>)}</fieldset>)}<div className="sm-actions mt-8"><Button disabled={busy || remaining === 0} onClick={submit}>{busy ? 'Submitting…' : selected.mode === 'practice' ? 'Submit practice answers' : 'Submit final answers'}<ArrowRight size={16} aria-hidden="true" /></Button><p className="sm-meta">{selected.mode === 'practice' ? 'Practice can be repeated.' : 'Final submission is immutable.'}</p></div></section> : !rules && !loading && <section className="sm-section" aria-labelledby="assignment-list"><div className="sm-section-heading"><div><p className="sm-overline">Choose your next task</p><h2 id="assignment-list" className="mt-2">Available assignments</h2></div><ListChecks className="sm-icon" size={20} aria-hidden="true" /></div><div className="sm-assessment-list">{items.map(item => <article key={item._id} className="sm-assessment-row"><div><h3>{item.title}</h3><p className="sm-meta mt-2">{item.skill} / Controlled assessment: {item.durationMinutes || 20} min</p><p className="sm-muted mt-2">Practice is repeatable and untimed. Controlled assessments record evaluated evidence.</p></div><div className="sm-actions"><Button variant="ghost" disabled={busy} onClick={() => start(item, 'practice')}>Practice</Button><Button disabled={busy} onClick={() => { setRules(item); setAccepted(false); setError(''); setResult(null); }}>Assessment rules</Button></div></article>)}</div>{!items.length && !error && <LearningEmpty>No practice assignments are available yet.</LearningEmpty>}</section>}
  </LearningWorkspace>;
}
