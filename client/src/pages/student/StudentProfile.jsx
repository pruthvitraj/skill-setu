import { useState } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useFetch } from '../../hooks/useFetch';
import { studentApi } from '../../services/studentApi';

const blankEducation = { institution: '', degree: '', field: '', startYear: '', endYear: '', grade: '' };
const blankSkill = { name: '', level: 'beginner' };
const blankProject = { title: '', description: '', url: '' };

function Section({ title, children }) {
  return <section className="card"><h2 className="text-lg font-bold text-slate-900">{title}</h2>{children}</section>;
}

export default function StudentProfile() {
  const { data, loading, error, setData } = useFetch(studentApi.me, []);
  const student = data?.student;
  const [education, setEducation] = useState(blankEducation);
  const [skill, setSkill] = useState(blankSkill);
  const [project, setProject] = useState(blankProject);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');

  if (loading) return <main className="p-6 text-sm text-slate-500">Loading your profile...</main>;
  if (error || !student) return <main className="p-6"><div className="card"><h1 className="text-xl font-bold">Student profile</h1><p className="mt-2 text-sm text-red-600">{error?.message || 'Profile not found.'}</p></div></main>;

  const user = student.user || {};
  const updateState = (response) => { setData(response.data); setNotice('Changes saved.'); setFormError(''); };

  async function saveProfile(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (!values.headline.trim()) return setFormError('Headline is required.');
    setSaving(true);
    try { updateState(await studentApi.update({ ...values, privacy: student.privacy })); } catch (requestError) { setFormError(requestError.message || 'Unable to save profile.'); } finally { setSaving(false); }
  }

  async function addItem(field, payload, reset) {
    setSaving(true);
    try { updateState(await studentApi.add(field, payload)); reset(); } catch (requestError) { setFormError(requestError.message || `Unable to add ${field}.`); } finally { setSaving(false); }
  }

  async function removeItem(field, id) {
    setSaving(true);
    try { updateState(await studentApi.removeItem(field, id)); } catch (requestError) { setFormError(requestError.message || 'Unable to remove item.'); } finally { setSaving(false); }
  }

  return <main className="min-h-screen bg-canvas"><div className="mx-auto max-w-5xl space-y-5 p-6">
    <header><p className="text-sm font-semibold text-indigo-600">Student workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">My profile</h1><p className="mt-2 text-sm text-slate-500">Keep your profile current so SkillSetu can calculate better matches.</p></header>
    {(notice || formError) && <div className={`rounded-xl border p-3 text-sm ${formError ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{formError || notice}</div>}

    <Section title="Account"><div className="mt-4 grid gap-4 md:grid-cols-2"><Input label="First name" value={user.firstName || ''} disabled /><Input label="Last name" value={user.lastName || ''} disabled /><Input label="Email" value={user.email || ''} disabled /><Input label="Phone" value={user.phone || 'Not provided'} disabled /></div><p className="mt-3 text-xs text-slate-500">Identity fields are managed by authentication and are read-only here.</p></Section>

    <Section title="Career profile"><form onSubmit={saveProfile} className="mt-4 space-y-4"><div className="grid gap-4 md:grid-cols-2"><Input label="Headline" name="headline" defaultValue={student.headline || ''} placeholder="Aspiring data engineer" /><Input label="Target role" name="targetRole" defaultValue={student.targetRole || ''} placeholder="Data Engineer" /><Input label="Location" name="location" defaultValue={student.location || ''} placeholder="Pune, India" /><Input label="Batch" name="batch" defaultValue={student.batch || ''} placeholder="2026" /><Input label="Enrollment number" name="enrollmentNo" defaultValue={student.enrollmentNo || ''} /></div><label className="block"><span className="label">Bio</span><textarea className="input min-h-28" name="bio" defaultValue={student.bio || ''} placeholder="Tell recruiters what you are building toward." /></label><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</Button></form></Section>

    <Section title="Education">{student.education?.length ? <div className="mt-4 space-y-3">{student.education.map((item) => <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4" key={item._id}><div><h3 className="font-semibold text-slate-900">{item.degree || 'Education'}</h3><p className="text-sm text-slate-600">{item.institution}{item.field ? ` · ${item.field}` : ''}</p><p className="text-xs text-slate-500">{item.startYear || 'Start'} - {item.endYear || 'Present'}{item.grade ? ` · ${item.grade}` : ''}</p></div><Button type="button" variant="ghost" onClick={() => removeItem('education', item._id)} disabled={saving}>Remove</Button></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No education records yet.</p>}<form className="mt-5 grid gap-3 border-t border-slate-100 pt-5 md:grid-cols-3" onSubmit={(event) => { event.preventDefault(); if (!education.institution.trim()) return setFormError('Institution is required.'); addItem('education', { ...education, startYear: education.startYear || undefined, endYear: education.endYear || undefined }, () => setEducation(blankEducation)); }}><Input label="Institution" value={education.institution} onChange={(event) => setEducation({ ...education, institution: event.target.value })} /><Input label="Degree" value={education.degree} onChange={(event) => setEducation({ ...education, degree: event.target.value })} /><Input label="Field" value={education.field} onChange={(event) => setEducation({ ...education, field: event.target.value })} /><Input label="Start year" type="number" value={education.startYear} onChange={(event) => setEducation({ ...education, startYear: event.target.value })} /><Input label="End year" type="number" value={education.endYear} onChange={(event) => setEducation({ ...education, endYear: event.target.value })} /><Input label="Grade" value={education.grade} onChange={(event) => setEducation({ ...education, grade: event.target.value })} /><Button type="submit" disabled={saving}>Add education</Button></form></Section>

    <Section title="Skills">{student.skills?.length ? <div className="mt-4 flex flex-wrap gap-2">{student.skills.map((item) => <span className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700" key={item._id}>{item.name} · {item.level}<button type="button" className="font-bold text-indigo-500" onClick={() => removeItem('skills', item._id)} aria-label={`Remove ${item.name}`}>×</button></span>)}</div> : <p className="mt-3 text-sm text-slate-500">No skills added yet.</p>}<form className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-end" onSubmit={(event) => { event.preventDefault(); if (!skill.name.trim()) return setFormError('Skill name is required.'); addItem('skills', skill, () => setSkill(blankSkill)); }}><div className="flex-1"><Input label="Skill name" value={skill.name} onChange={(event) => setSkill({ ...skill, name: event.target.value })} placeholder="SQL" /></div><div className="sm:w-48"><Select label="Level" value={skill.level} onChange={(event) => setSkill({ ...skill, level: event.target.value })} options={[{ value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' }]} /></div><Button type="submit" disabled={saving}>Add skill</Button></form></Section>

    <Section title="Projects">{student.projects?.length ? <div className="mt-4 space-y-3">{student.projects.map((item) => <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4" key={item._id}><div><h3 className="font-semibold text-slate-900">{item.title}</h3><p className="mt-1 text-sm text-slate-600">{item.description || 'No description provided.'}</p>{item.url && <a className="mt-2 inline-block text-sm text-indigo-600" href={item.url} target="_blank" rel="noreferrer">Open project</a>}</div><Button type="button" variant="ghost" onClick={() => removeItem('projects', item._id)} disabled={saving}>Remove</Button></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No projects added yet.</p>}<form className="mt-5 space-y-3 border-t border-slate-100 pt-5" onSubmit={(event) => { event.preventDefault(); if (!project.title.trim()) return setFormError('Project title is required.'); addItem('projects', { ...project, url: project.url || undefined }, () => setProject(blankProject)); }}><Input label="Project title" value={project.title} onChange={(event) => setProject({ ...project, title: event.target.value })} placeholder="Placement readiness dashboard" /><label className="block"><span className="label">Description</span><textarea className="input" value={project.description} onChange={(event) => setProject({ ...project, description: event.target.value })} /></label><Input label="Project URL" type="url" value={project.url} onChange={(event) => setProject({ ...project, url: event.target.value })} placeholder="https://github.com/..." /><Button type="submit" disabled={saving}>Add project</Button></form></Section>
  </div></main>;
}