import { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import { skillApi } from '../../services/skillApi';

function Empty({ children }) {
  return <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">{children}</p>;
}

export default function StudentAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    skillApi.assessments().then((response) => setAssessments(response.data.items || [])).catch((requestError) => setError(requestError.message || 'Unable to load assessments.')).finally(() => setLoading(false));
  }, []);

  async function start(assessment) {
    setBusy(true); setError(''); setResult(null);
    try {
      const response = await skillApi.assessment(assessment._id);
      setSelected(response.data.item); setAnswers({});
    } catch (requestError) { setError(requestError.message || 'Unable to load this assessment.'); } finally { setBusy(false); }
  }

  async function submit() {
    if (!selected || Object.keys(answers).length !== selected.questions.length) return setError('Answer every question before submitting.');
    setBusy(true); setError('');
    try {
      const payload = selected.questions.map((question, questionIndex) => ({ questionIndex, selectedIndex: answers[questionIndex] }));
      const response = await skillApi.submit(selected._id, payload);
      setResult(response.data); setSelected(null);
    } catch (requestError) { setError(requestError.message || 'Unable to submit assessment.'); } finally { setBusy(false); }
  }

  if (loading) return <main className="p-6 text-sm text-slate-500">Loading assessments...</main>;
  if (error && !assessments.length) return <main className="p-6"><div className="card"><h1 className="text-xl font-bold">Skill assessments</h1><p className="mt-2 text-sm text-red-600">{error}</p></div></main>;

  return <main className="min-h-screen bg-canvas"><div className="mx-auto max-w-5xl space-y-5 p-6">
    <header><p className="text-sm font-semibold text-indigo-600">Student workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Skill assessments</h1><p className="mt-2 text-sm text-slate-500">Test your knowledge and turn demonstrated ability into a verified skill score.</p></header>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {result && <section className="card border-emerald-200"><p className="text-sm font-semibold text-emerald-600">Assessment submitted</p><h2 className="mt-1 text-3xl font-bold text-slate-900">Score: {result.score}%</h2><p className="mt-2 text-sm text-slate-500">Your result has been saved to your skill tracker.</p><div className="mt-4 flex flex-wrap gap-2">{result.topicScores?.map((topic) => <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700" key={topic.topic}>{topic.topic}: {topic.score}%</span>)}</div></section>}
    {selected ? <section className="card"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900">{selected.title}</h2><p className="mt-1 text-sm text-slate-500">{selected.questions.length} questions · {selected.durationMinutes || 0} minutes</p></div><Button type="button" variant="ghost" disabled={busy} onClick={() => setSelected(null)}>Cancel</Button></div><div className="mt-6 space-y-5">{selected.questions.map((question, questionIndex) => <fieldset className="rounded-xl border border-slate-200 p-4" key={question._id || questionIndex}><legend className="px-2 font-semibold text-slate-900">{questionIndex + 1}. {question.prompt}</legend><div className="mt-3 space-y-2">{question.options.map((option, optionIndex) => <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${answers[questionIndex] === optionIndex ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'}`} key={`${questionIndex}-${optionIndex}`}><input type="radio" name={`question-${questionIndex}`} checked={answers[questionIndex] === optionIndex} onChange={() => setAnswers({ ...answers, [questionIndex]: optionIndex })} />{option}</label>)}</div></fieldset>)}</div><Button className="mt-6" type="button" disabled={busy} onClick={submit}>{busy ? 'Submitting...' : 'Submit assessment'}</Button></section> : <section className="card"><h2 className="text-lg font-bold text-slate-900">Available assessments</h2><div className="mt-4 space-y-3">{assessments.length ? assessments.map((assessment) => <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4" key={assessment._id}><div><h3 className="font-semibold text-slate-900">{assessment.title}</h3><p className="mt-1 text-sm text-slate-500">{assessment.description || 'Test your skill knowledge.'} · {assessment.durationMinutes || 0} minutes</p></div><Button type="button" disabled={busy} onClick={() => start(assessment)}>Start assessment</Button></div>) : <Empty>No assessments are available yet.</Empty>}</div></section>}
  </div></main>;
}