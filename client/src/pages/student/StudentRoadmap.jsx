import { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { roadmapApi } from '../../services/roadmapApi';

function Empty({ children }) {
  return <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">{children}</p>;
}

export default function StudentRoadmap() {
  const [roadmap, setRoadmap] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    roadmapApi.me().then((response) => { setRoadmap(response.data.roadmap); if (response.data.roadmap?.targetRole) setTargetRole(response.data.roadmap.targetRole); }).catch((requestError) => setError(requestError.message || 'Unable to load roadmap.')).finally(() => setLoading(false));
  }, []);

  async function generate(event) {
    event.preventDefault();
    if (!targetRole.trim()) return setError('Enter a target role first.');
    setBusy(true); setError(''); setNotice('Generating your roadmap...');
    try { const response = await roadmapApi.generate(targetRole.trim()); setRoadmap(response.data.roadmap); setNotice('Roadmap generated from your current profile and target role.'); } catch (requestError) { setNotice(''); setError(requestError.message || 'Unable to generate roadmap.'); } finally { setBusy(false); }
  }

  async function toggle(item, completed) {
    setBusy(true); setError('');
    try { const response = await roadmapApi.toggle(item._id, completed); setRoadmap(response.data.roadmap); } catch (requestError) { setError(requestError.message || 'Unable to update roadmap item.'); } finally { setBusy(false); }
  }

  if (loading) return <main className="p-6 text-sm text-slate-500">Loading your roadmap...</main>;

  const items = roadmap?.items || [];
  const completed = items.filter((item) => item.completed).length;
  const progress = items.length ? Math.round((completed / items.length) * 100) : 0;
  const phases = items.reduce((groups, item) => { const phase = item.phase || 1; (groups[phase] ||= []).push(item); return groups; }, {});

  return <main className="min-h-screen bg-canvas"><div className="mx-auto max-w-5xl space-y-5 p-6">
    <header><p className="text-sm font-semibold text-indigo-600">Student workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">AI learning roadmap</h1><p className="mt-2 text-sm text-slate-500">A practical sequence generated from your target role and current skill profile.</p></header>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {notice && <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-700">{notice}</div>}
    <section className="card"><form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={generate}><div className="flex-1"><Input label="Target role" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="Data Engineer" /></div><Button type="submit" disabled={busy}>{busy ? 'Generating...' : roadmap ? 'Regenerate roadmap' : 'Generate roadmap'}</Button></form><p className="mt-3 text-xs text-slate-500">Generation happens through the backend roadmap service. AI provider keys are never sent to the browser.</p></section>
    {!roadmap ? <Empty>Choose a target role to generate your first roadmap.</Empty> : <><section className="card"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-lg font-bold text-slate-900">{roadmap.targetRole}</h2><p className="mt-1 text-sm text-slate-500">{roadmap.summary || 'Your generated path toward the target role.'}</p></div><span className="text-2xl font-bold text-indigo-600">{progress}%</span></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-sm text-slate-500">{completed} of {items.length} roadmap items complete.</p>{roadmap.gapAnalysis?.length ? <div className="mt-5 border-t border-slate-100 pt-5"><h3 className="font-semibold text-slate-900">Priority skill gaps</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{roadmap.gapAnalysis.map((gap, index) => <li key={`${gap}-${index}`}>{gap}</li>)}</ul></div> : null}</section><div className="space-y-5">{Object.entries(phases).map(([phase, phaseItems]) => <section className="card" key={phase}><h2 className="text-lg font-bold text-slate-900">Phase {phase}</h2><div className="mt-4 space-y-3">{phaseItems.map((item) => <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${item.completed ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'}`} key={item._id}><input className="mt-1 h-4 w-4" type="checkbox" checked={item.completed} disabled={busy} onChange={(event) => toggle(item, event.target.checked)} /><span className="flex-1"><span className={`block font-semibold ${item.completed ? 'text-emerald-800 line-through' : 'text-slate-900'}`}>{item.title}</span><span className="mt-1 block text-sm text-slate-600">{item.description}</span><span className="mt-2 inline-block rounded-lg bg-slate-100 px-2 py-1 text-xs capitalize text-slate-600">{item.type}</span></span></label>)}</div></section>)}</div></>}
  </div></main>;
}