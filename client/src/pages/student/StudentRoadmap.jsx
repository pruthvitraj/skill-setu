import { useEffect, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Feedback from '../../components/common/Feedback';
import LearningWorkspace, { LearningEmpty } from '../../components/learning/LearningWorkspace';
import { roadmapApi } from '../../services/roadmapApi';

export default function StudentRoadmap() {
  const [roadmap, setRoadmap] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  async function load() {
    setLoading(true); setError('');
    try {
      const response = await roadmapApi.me();
      setRoadmap(response.data.roadmap);
      if (response.data.roadmap?.targetRole) setTargetRole(response.data.roadmap.targetRole);
    } catch (requestError) { setError(requestError.message || 'Unable to load roadmap.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  async function generate(event) {
    event.preventDefault();
    if (!targetRole.trim()) return setError('Enter a target role first.');
    setBusy('generate'); setError(''); setNotice('');
    try {
      const response = await roadmapApi.generate(targetRole.trim());
      setRoadmap(response.data.roadmap);
      setNotice(response.data.roadmap?.generationIssue ? 'Template roadmap saved. ' + response.data.roadmap.generationIssue.message : 'Roadmap saved. Completion tracks your learning activity, not evaluated competency.');
    } catch (requestError) { setError(requestError.message || 'Unable to generate roadmap.'); }
    finally { setBusy(''); }
  }
  async function toggle(item, completed) {
    setBusy(item._id); setError(''); setNotice('');
    try {
      const response = await roadmapApi.toggle(item._id, completed);
      setRoadmap(response.data.roadmap);
      setNotice(completed ? 'Learning item marked complete.' : 'Learning item marked incomplete.');
    } catch (requestError) { setError(requestError.message || 'Unable to update roadmap item.'); }
    finally { setBusy(''); }
  }
  const items = roadmap?.items || [];
  const completed = items.filter(item => item.completed).length;
  const progress = items.length ? Math.round(completed / items.length * 100) : 0;
  const next = items.find(item => !item.completed);
  const phases = items.reduce((groups, item) => { (groups[item.phase || 1] ||= []).push(item); return groups; }, {});
  return <LearningWorkspace title="Learning roadmap" description="Follow a suggested sequence for your target role. Track what you have studied and choose your next learning task.">
    {error && <Feedback kind="error" title="Roadmap could not be updated" action={!roadmap && <Button variant="ghost" disabled={loading} onClick={load}>Try again</Button>}>{error}</Feedback>}
    {notice && <Feedback kind="success">{notice}</Feedback>}
    {loading ? <Feedback>Loading your roadmap…</Feedback> : <>
      {roadmap && <section className="sm-panel" aria-label="Learning progress"><div className="sm-summary"><div><p className="sm-overline">{roadmap.source === 'template' ? 'Role template' : roadmap.source === 'ai' ? (roadmap.guidanceKind === 'researched' ? 'Researched AI guidance' : 'Ungrounded AI guidance') : 'Source not recorded'}</p><h2 className="mt-2">{roadmap.targetRole}</h2><p className="sm-muted mt-2">{roadmap.summary || 'Suggested learning sequence for this role.'}</p>{roadmap.source === 'ai' && roadmap.guidanceKind !== 'researched' && <p className="sm-meta mt-2">Internet research was not available for this guidance.</p>}{roadmap.guidanceKind === 'researched' && roadmap.research?.sources?.length > 0 && <div className="mt-4"><p className="sm-meta">Retrieved official references. AI synthesis remains learning guidance, not verified competency.</p><ul className="sm-rule-list">{roadmap.research.sources.map(source => <li key={source.id}><a className="underline" href={source.url} target="_blank" rel="noreferrer">{source.title}<span className="sr-only"> (opens in a new tab)</span></a><span className="sm-meta"> / retrieved {new Date(source.retrievedAt).toLocaleDateString()}</span></li>)}</ul></div>}</div><div><p className="sm-stat">{progress}%</p><p className="sm-meta mt-2">{completed} / {items.length} items complete</p></div></div><progress className="sm-progress mt-6" value={completed} max={items.length || 1} aria-label="Roadmap learning completion" /><p className="sm-muted mt-3">Self-reported completion does not create competency evidence.</p>{next ? <div className="sm-next"><p className="sm-overline">Next learning task</p><h3 className="mt-2">{next.title}</h3><p className="sm-muted mt-2">{next.description}</p><Button className="mt-4" disabled={Boolean(busy)} onClick={() => toggle(next, true)}><Check size={16} aria-hidden="true" />{busy === next._id ? 'Saving…' : 'Mark complete'}</Button></div> : <p className="sm-meta mt-6">{items.length ? 'All learning items marked complete.' : 'This roadmap has no learning items.'}</p>}</section>}
      <section className={roadmap ? 'sm-section' : 'sm-panel'} aria-labelledby="roadmap-target"><h2 id="roadmap-target">{roadmap ? 'Update your learning goal' : 'Choose your learning goal'}</h2><form className="sm-form mt-6" onSubmit={generate}><Input label="Target role" value={targetRole} maxLength={200} required disabled={Boolean(busy)} onChange={event => setTargetRole(event.target.value)} placeholder="Data Engineer" /><Button type="submit" disabled={Boolean(busy)}>{busy === 'generate' ? 'Generating…' : roadmap ? 'Regenerate roadmap' : 'Generate roadmap'}<ArrowRight size={16} aria-hidden="true" /></Button></form><p className="sm-muted mt-4">Role templates or AI guidance suggest topics; they do not establish validated skill gaps. Regenerating replaces your active roadmap with a new learning sequence.</p></section>
      {!roadmap && !error && <LearningEmpty>Enter a target role to create your first roadmap.</LearningEmpty>}
      {roadmap?.gapAnalysis?.length > 0 && <section className="sm-section"><h2>Suggested learning topics</h2><ul className="sm-rule-list">{roadmap.gapAnalysis.map((gap, index) => <li key={index}>{String(gap).replace(/^Gap:\s*/i, '')}</li>)}</ul></section>}
      {Object.entries(phases).map(([phase, phaseItems]) => <section key={phase} className="sm-section" aria-labelledby={`phase-${phase}`}><div className="sm-section-heading"><h2 id={`phase-${phase}`}>Phase {phase}</h2><span className="sm-meta">{phaseItems.filter(item => item.completed).length} / {phaseItems.length} complete</span></div><ul>{phaseItems.map(item => <li key={item._id} className="sm-item" data-complete={item.completed}><label><input type="checkbox" checked={Boolean(item.completed)} disabled={Boolean(busy)} onChange={event => toggle(item, event.target.checked)} /><span><strong>{item.title}</strong><p className="sm-muted">{item.description}</p><span className="sm-meta">{item.type}{busy === item._id ? ' / Saving…' : ''}</span></span></label></li>)}</ul></section>)}
    </>}
  </LearningWorkspace>;
}
