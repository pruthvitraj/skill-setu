import { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { skillApi } from '../../services/skillApi';
import { studentApi } from '../../services/studentApi';

const levels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

function Empty({ children }) {
  return <p className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">{children}</p>;
}

export default function StudentSkills() {
  const [state, setState] = useState({ loading: true, error: '', student: null, catalog: [], assessments: [], tracker: null });
  const [draft, setDraft] = useState({ name: '', level: 'beginner' });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  async function load() {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const [profile, catalog, assessments, tracker] = await Promise.all([studentApi.me(), skillApi.catalog(), skillApi.assessments(), skillApi.tracker()]);
      setState({ loading: false, error: '', student: profile.data.student, catalog: catalog.data.items || [], assessments: assessments.data.items || [], tracker: tracker.data });
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: error.message || 'Unable to load skills.' }));
    }
  }

  useEffect(() => { load(); }, []);

  async function addSkill(event) {
    event.preventDefault();
    if (!draft.name.trim()) return setNotice('Enter a skill name.');
    setBusy(true); setNotice('');
    try {
      const response = await studentApi.add('skills', { name: draft.name.trim(), level: draft.level });
      setState((current) => ({ ...current, student: response.data.student }));
      setDraft({ name: '', level: 'beginner' });
      setNotice('Skill added.');
    } catch (error) { setNotice(error.message || 'Unable to add skill.'); } finally { setBusy(false); }
  }

  async function removeSkill(id) {
    setBusy(true); setNotice('');
    try {
      const response = await studentApi.removeItem('skills', id);
      setState((current) => ({ ...current, student: response.data.student }));
      setNotice('Skill removed.');
    } catch (error) { setNotice(error.message || 'Unable to remove skill.'); } finally { setBusy(false); }
  }

  if (state.loading) return <div className="p-6 text-sm text-slate-500">Loading your skills...</div>;
  if (state.error) return <div className="p-6"><div className="card"><h1 className="text-xl font-bold">Skill management</h1><p className="mt-2 text-sm text-red-600">{state.error}</p><Button className="mt-4" type="button" onClick={load}>Try again</Button></div></div>;

  const profileSkills = state.student?.skills || [];
  const scores = state.tracker?.scores || [];
  const history = state.tracker?.history || [];
  const existingNames = new Set(profileSkills.map((skill) => skill.name.toLowerCase()));
  const availableSkills = state.catalog.filter((skill) => !existingNames.has(skill.name.toLowerCase()));

  return <div className="min-h-screen bg-canvas"><div className="mx-auto max-w-6xl space-y-5 p-6">
    <header><p className="text-sm font-semibold text-indigo-600">Student workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Skill management</h1><p className="mt-2 text-sm text-slate-500">Maintain your profile skills and monitor evaluated competency evidence.</p></header>
    {notice && <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-700">{notice}</div>}

    <div className="grid gap-4 sm:grid-cols-3"><div className="card"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Profile skills</p><p className="mt-2 text-3xl font-bold text-indigo-600">{profileSkills.length}</p></div><div className="card"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assessed skills</p><p className="mt-2 text-3xl font-bold text-emerald-600">{scores.length}</p></div><div className="card"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Overall skill score</p><p className="mt-2 text-3xl font-bold text-amber-600">{state.tracker?.overall ?? 0}</p></div></div>

    <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
      <section className="card"><h2 className="text-lg font-bold text-slate-900">My skills</h2>{profileSkills.length ? <div className="mt-4 space-y-3">{profileSkills.map((skill) => <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4" key={skill._id}><div><p className="font-semibold text-slate-900">{skill.name}</p><p className="mt-1 text-sm capitalize text-slate-500">{skill.level}</p></div><Button type="button" variant="ghost" disabled={busy} onClick={() => removeSkill(skill._id)}>Remove</Button></div>)}</div> : <div className="mt-4"><Empty>No profile skills yet. Add your first skill below.</Empty></div>}<form className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-end" onSubmit={addSkill}><div className="flex-1"><Input label="Skill name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="SQL" /></div><div className="sm:w-48"><Select label="Level" value={draft.level} onChange={(event) => setDraft({ ...draft, level: event.target.value })} options={levels} /></div><Button type="submit" disabled={busy}>Add skill</Button></form></section>
      <section className="card"><h2 className="text-lg font-bold text-slate-900">Skill catalog</h2><p className="mt-1 text-sm text-slate-500">Available skills you can add to your profile.</p><div className="mt-4 flex max-h-96 flex-wrap content-start gap-2 overflow-auto">{availableSkills.length ? availableSkills.map((skill) => <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:border-indigo-400 hover:text-indigo-700" type="button" key={skill._id} onClick={() => setDraft({ ...draft, name: skill.name })}>{skill.name}</button>) : <Empty>No additional catalog skills available. Add a skill by name.</Empty>}</div></section>
    </div>

    <div className="grid gap-5 lg:grid-cols-2"><section className="card"><h2 className="text-lg font-bold text-slate-900">Evaluated skill scores</h2>{scores.length ? <div className="mt-4 space-y-3">{scores.map((score) => <div className="rounded-xl border border-slate-200 p-4" key={score._id || score.skill}><div className="flex items-center justify-between"><p className="font-semibold capitalize text-slate-900">{score.skill?.name || score.skillName || score.skill || 'Skill'}</p><p className="font-bold text-emerald-600">{score.overall ?? 0}</p></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, score.overall || 0)}%` }} /></div></div>)}</div> : <div className="mt-4"><Empty>No assessed skill scores yet.</Empty></div>}</section><section className="card"><h2 className="text-lg font-bold text-slate-900">Available assessments</h2>{state.assessments.length ? <div className="mt-4 space-y-3">{state.assessments.map((assessment) => <div className="rounded-xl border border-slate-200 p-4" key={assessment._id}><p className="font-semibold text-slate-900">{assessment.title}</p><p className="mt-1 text-sm text-slate-500">{assessment.description || 'Skill assessment'} · {assessment.durationMinutes || 0} minutes</p></div>)}</div> : <div className="mt-4"><Empty>No assessments are available yet.</Empty></div>}</section></div>
    <p className="text-xs text-slate-500">{history.length ? `${history.length} tracker entries recorded.` : 'Assessment history will appear here after your first attempt.'}</p>
  </div></div>;
}