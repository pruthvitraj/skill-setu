import { useEffect, useState } from 'react';
import { CalendarDays, RefreshCw } from 'lucide-react';
import { companyApi } from '../../services/companyApi';

function unwrap(response) {
  return response?.data?.items || response?.data || [];
}

export default function CompanyDrives() {
  const [drives, setDrives] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ university: '', job: '', title: '', proposedDate: '', eligibility: '' });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    try {
      setLoading(true);
      const [driveResponse, universityResponse, jobResponse] = await Promise.all([
        companyApi.drives(),
        companyApi.universities.list(),
        companyApi.jobs.list({ page: 1, limit: 100, status: 'published' }),
      ]);
      setDrives(unwrap(driveResponse));
      setUniversities(unwrap(universityResponse));
      const jobsPayload = jobResponse?.data?.data || jobResponse?.data || {};
      setJobs(jobsPayload.items || []);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load placement drives.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function submit(event) {
    event.preventDefault();
    if (!form.university || !form.job) return setError('Select a university and published job.');
    try {
      setBusy(true); setError(''); setNotice('');
      await companyApi.universities.invite(form.university, {
        job: form.job,
        title: form.title || jobs.find((job) => job._id === form.job)?.title,
        proposedDate: form.proposedDate || undefined,
        eligibility: form.eligibility || undefined,
      });
      setNotice('Placement drive request sent to the TPO.');
      setForm({ university: '', job: '', title: '', proposedDate: '', eligibility: '' });
      await load();
    } catch (requestError) {
      setError(requestError.message || 'Unable to request placement drive.');
    } finally { setBusy(false); }
  }

  return <div className="min-h-screen bg-slate-50 p-6 md:p-8"><div className="mx-auto max-w-6xl space-y-6">
    <header className="flex items-center justify-between gap-4"><div><h1 className="text-3xl font-bold text-slate-900">Placement Drives</h1><p className="mt-2 text-sm text-slate-500">Request a campus drive from a university and track TPO decisions.</p></div><button className="btn-ghost inline-flex items-center gap-2" onClick={load} disabled={loading}><RefreshCw size={16} /> Refresh</button></header>
    {(error || notice) && <div className={`rounded-xl border p-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{error || notice}</div>}
    <form className="card grid gap-4 md:grid-cols-2" onSubmit={submit}><h2 className="md:col-span-2 text-lg font-bold text-slate-900">Request a campus drive</h2><label><span className="label">University</span><select className="input" value={form.university} onChange={(event) => setForm({ ...form, university: event.target.value })}><option value="">Select university</option>{universities.map((university) => <option key={university._id} value={university._id}>{university.name}</option>)}</select></label><label><span className="label">Published job</span><select className="input" value={form.job} onChange={(event) => setForm({ ...form, job: event.target.value })}><option value="">Select job</option>{jobs.map((job) => <option key={job._id} value={job._id}>{job.title}</option>)}</select></label><label><span className="label">Proposed date</span><input className="input" type="date" value={form.proposedDate} onChange={(event) => setForm({ ...form, proposedDate: event.target.value })} /></label><label><span className="label">Eligibility</span><input className="input" value={form.eligibility} onChange={(event) => setForm({ ...form, eligibility: event.target.value })} placeholder="2026 batch, 7.5+ CGPA" /></label><div className="md:col-span-2"><button className="btn-primary inline-flex items-center gap-2" disabled={busy}><CalendarDays size={16} /> {busy ? 'Sending request...' : 'Request drive'}</button></div></form>
    <section className="card"><h2 className="text-lg font-bold text-slate-900">My requests</h2>{loading ? <p className="mt-4 text-sm text-slate-500">Loading...</p> : !drives.length ? <p className="mt-4 text-sm text-slate-500">No placement drive requests yet.</p> : <div className="mt-4 space-y-3">{drives.map((drive) => <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4" key={drive._id}><div><p className="font-semibold text-slate-900">{drive.title || drive.job?.title || 'Placement drive'}</p><p className="mt-1 text-sm text-slate-500">{drive.university?.name || 'University'} · {drive.scheduledDate || drive.proposedDate ? new Date(drive.scheduledDate || drive.proposedDate).toLocaleDateString() : 'Date pending'}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">{String(drive.status || 'requested').replace(/_/g, ' ')}</span></div>)}</div>}</section>
  </div></div>;
}