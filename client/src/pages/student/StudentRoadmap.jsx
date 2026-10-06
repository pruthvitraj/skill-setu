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

  if (loading) return <div className="p-6 text-sm text-slate-500">Loading your roadmap...</div>;

  const items = roadmap?.items || [];
  const completed = items.filter((item) => item.completed).length;
  const progress = items.length ? Math.round((completed / items.length) * 100) : 0;
  const phases = items.reduce((groups, item) => { const phase = item.phase || 1; (groups[phase] ||= []).push(item); return groups; }, {});

  return <div className="student-roadmap-page"><div className="student-roadmap-container">
    <header><p className="text-sm font-semibold text-indigo-600">Student workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Learning roadmap</h1><p className="mt-2 text-sm text-slate-500">A practical sequence generated from your target role and current skill profile.</p></header>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {notice && <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-700">{notice}</div>}
    <section className="card"><form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={generate}><div className="flex-1"><Input label="Target role" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="Data Engineer" /></div><Button type="submit" disabled={busy}>{busy ? 'Generating...' : roadmap ? 'Regenerate roadmap' : 'Generate roadmap'}</Button></form><p className="mt-3 text-xs text-slate-500">Roadmaps use role templates when an AI provider is unavailable. Suggested topics are guidance, not validated competency gaps.</p></section>
    {!roadmap ? <Empty>Choose a target role to generate your first roadmap.</Empty> : <><section className="student-roadmap-overview"><div><p className="student-eyebrow">Your career path</p><h2>{roadmap.targetRole}</h2><p>{roadmap.source === 'template' ? 'Role template guidance · ' : roadmap.source === 'ai' ? 'AI guidance · ' : 'Source not recorded · '}{roadmap.summary || 'Your generated path toward the target role.'}</p></div><strong>{progress}%</strong><div className="student-roadmap-progress"><span style={{ width: `${progress}%` }} /></div><p>{completed} of {items.length} roadmap items complete.</p>{roadmap.gapAnalysis?.length ? <div className="student-roadmap-topics"><h3>Suggested learning topics</h3><p>These are guidance topics, not validated competency gaps.</p><ul>{roadmap.gapAnalysis.map((gap, index) => <li key={`${gap}-${index}`}>{gap}</li>)}</ul></div> : null}</section><div className="student-roadmap-phases">{Object.entries(phases).map(([phase, phaseItems]) => <section className="student-roadmap-phase" key={phase}><div className="student-roadmap-phase-heading"><div><p className="student-eyebrow">Phase {phase}</p><h2>Build your next capability</h2></div><span>{phaseItems.filter((item) => item.completed).length}/{phaseItems.length}</span></div><div className="student-roadmap-items">{phaseItems.map((item) => <label className={`student-roadmap-item ${item.completed ? 'is-completed' : 'is-available'}`} key={item._id}><span className="student-roadmap-marker">{item.completed ? '✓' : '○'}</span><input type="checkbox" checked={item.completed} disabled={busy} onChange={(event) => toggle(item, event.target.checked)} /><span className="student-roadmap-item-copy"><span className="student-roadmap-status">{item.completed ? 'Completed' : 'Next step'}</span><strong>{item.title}</strong><span>{item.description || 'Continue this step in your career path.'}</span><small>{item.type || 'Learning step'}</small></span></label>)}</div></section>)}</div></>}
  </div></div>;
}