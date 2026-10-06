import { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import { applicationApi } from '../../services/applicationApi';
import { jobApi } from '../../services/jobApi';
import { resumeApi } from '../../services/resumeApi';

function Empty({ children }) {
  return <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">{children}</p>;
}

function dateLabel(value) {
  if (!value) return 'No deadline';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'No deadline' : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function StudentMarketplace() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ q: '', skill: '', location: '' });
  const [selected, setSelected] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load(page = 1, params = filters) {
    setLoading(true); setError('');
    try { const [jobsResponse, applicationsResponse, resumesResponse] = await Promise.all([jobApi.list({ ...params, page, limit: 8 }), applicationApi.mine(), resumeApi.list()]); const uploadedResumes = resumesResponse.data.resumes || []; setJobs(jobsResponse.data.items || []); setPagination(jobsResponse.data.pagination || { page, pages: 1, total: 0 }); setApplications(applicationsResponse.data.items || []); setResumes(uploadedResumes); setResumeId((current) => current || uploadedResumes[0]?._id || ''); } catch (requestError) { setError(requestError.message || 'Unable to load the marketplace.'); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function openJob(job) {
    setDetailLoading(true); setError(''); setNotice('');
    try { const response = await jobApi.get(job._id); setSelected(response.data.job); setCoverNote(''); } catch (requestError) { setError(requestError.message || 'This job is no longer available.'); } finally { setDetailLoading(false); }
  }

  async function apply() {
    if (!selected) return;
    setBusy(true); setError(''); setNotice('');
    if (!resumeId) { setError('Upload and select a resume before applying.'); setBusy(false); return; }
    try { const response = await applicationApi.apply({ jobId: selected._id, resumeId, coverNote }); setApplications([{ ...response.data.application, job: selected }, ...applications]); setNotice('Application submitted successfully.'); } catch (requestError) { setError(requestError.message || 'Unable to submit application.'); } finally { setBusy(false); }
  }

  const appliedJobIds = new Set(applications.map((application) => application.job?._id || application.job));

  return <div className="student-marketplace-page"><div className="student-marketplace-container">
    <header className="student-marketplace-header"><div><p className="student-eyebrow">Student workspace · Opportunities</p><h1>Find your next opportunity</h1><p>Explore published roles, check the fit, and apply with the resume you choose.</p></div><a className="btn btn-ghost" href="/student/applications">View applications</a></header>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}{notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}
    <section className="card"><form className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end" onSubmit={(event) => { event.preventDefault(); load(1); }}><label className="block"><span className="label">Search</span><input className="input" value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} placeholder="Job title or keyword" /></label><label className="block"><span className="label">Skill</span><input className="input" value={filters.skill} onChange={(event) => setFilters({ ...filters, skill: event.target.value })} placeholder="React, SQL..." /></label><label className="block"><span className="label">Location</span><input className="input" value={filters.location} onChange={(event) => setFilters({ ...filters, location: event.target.value })} placeholder="Pune or Remote" /></label><Button type="submit" disabled={loading}>Search jobs</Button></form></section>
    <section className="card"><label className="block max-w-xl"><span className="label">Resume for applications</span><select className="input" value={resumeId} onChange={(event) => setResumeId(event.target.value)}><option value="">Select an uploaded resume</option>{resumes.map((resume) => <option key={resume._id} value={resume._id}>{resume.fileName || 'Resume'}{resume.ats?.overall != null ? ` · ATS ${resume.ats.overall}` : ''}</option>)}</select></label>{!resumes.length && <p className="mt-2 text-sm text-amber-700">Upload a resume before applying to a job.</p>}</section>
    {loading ? <p className="p-6 text-sm text-slate-500">Loading opportunities...</p> : <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      <section className="card"><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">Open opportunities</h2><p className="mt-1 text-sm text-slate-500">{pagination.total || 0} published jobs</p></div></div><div className="mt-4 space-y-3">{jobs.length ? jobs.map((job) => <button className={`block w-full rounded-xl border p-4 text-left ${selected?._id === job._id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`} type="button" key={job._id} onClick={() => openJob(job)}><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900">{job.title}</h3><p className="mt-1 text-sm text-slate-500">{job.company?.name || 'Company'}{job.location ? ` · ${job.location}` : ''}</p></div>{appliedJobIds.has(job._id) && <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Applied</span>}</div><div className="mt-3 flex flex-wrap gap-2">{(job.requiredSkills || []).slice(0, 4).map((skill) => <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600" key={skill}>{skill}</span>)}</div></button>) : <Empty>No published jobs match your filters.</Empty>}</div><div className="mt-5 flex items-center justify-center gap-3"><Button type="button" variant="ghost" disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)}>Previous</Button><span className="text-sm text-slate-500">Page {pagination.page || 1} of {pagination.pages || 1}</span><Button type="button" variant="ghost" disabled={pagination.page >= pagination.pages} onClick={() => load(pagination.page + 1)}>Next</Button></div></section>
      <section className="card">{detailLoading ? <p className="text-sm text-slate-500">Loading job details...</p> : selected ? <><div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-bold text-slate-900">{selected.title}</h2><p className="mt-1 text-sm text-slate-500">{selected.company?.name || 'Company'}{selected.location ? ` · ${selected.location}` : ''}</p></div><span className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold capitalize text-indigo-700">{selected.jobType || 'Full time'}</span></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Deadline</p><p className="mt-1 text-sm font-semibold">{dateLabel(selected.deadline)}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Experience</p><p className="mt-1 text-sm font-semibold">{selected.experience || 'Not specified'}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Positions</p><p className="mt-1 text-sm font-semibold">{selected.positions || 1}</p></div></div><div className="mt-6 space-y-5 text-sm text-slate-600"><div><h3 className="font-semibold text-slate-900">About the role</h3><p className="mt-2 whitespace-pre-line">{selected.description || 'No description provided.'}</p></div><div><h3 className="font-semibold text-slate-900">Required skills</h3><p className="mt-2">{selected.requiredSkills?.join(', ') || 'No skills listed.'}</p></div>{selected.selectionProcess && <div><h3 className="font-semibold text-slate-900">Selection process</h3><p className="mt-2">{selected.selectionProcess}</p></div>}</div>{appliedJobIds.has(selected._id) ? <p className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">You have already applied for this opportunity.</p> : <div className="mt-6 border-t border-slate-100 pt-5"><label className="block"><span className="label">Cover note (optional)</span><textarea className="input min-h-24" value={coverNote} onChange={(event) => setCoverNote(event.target.value)} placeholder="Tell the recruiter why this role fits your goals." /></label><Button className="mt-4" type="button" disabled={busy} onClick={apply}>{busy ? 'Submitting...' : 'Apply now'}</Button></div>}</> : <Empty>Select an opportunity to view details and apply.</Empty>}</section>
    </div>}
    <section className="card"><h2 className="text-lg font-bold text-slate-900">My applications</h2>{applications.length ? <div className="mt-4 space-y-3">{applications.map((application) => <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4" key={application._id}><div><p className="font-semibold text-slate-900">{application.job?.title || 'Application'}</p><p className="mt-1 text-sm text-slate-500">Match score: {application.matchScore ?? 0}%</p></div><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-700">{String(application.status || 'applied').replaceAll('_', ' ')}</span></div>)}</div> : <div className="mt-4"><Empty>You have not applied to any opportunities yet.</Empty></div>}</section>
  </div></div>;
}