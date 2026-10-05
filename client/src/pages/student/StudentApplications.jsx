import { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import { applicationApi } from '../../services/applicationApi';

function Empty({ children }) {
  return <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">{children}</p>;
}

function statusLabel(status) {
  return String(status || 'applied').replaceAll('_', ' ');
}

function dateLabel(value) {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try { const response = await applicationApi.mine(); setApplications(response.data.items || []); } catch (requestError) { setError(requestError.message || 'Unable to load applications.'); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function openApplication(application) {
    setSelected(application); setDetailLoading(true); setError('');
    try { const response = await applicationApi.get(application._id); setSelected(response.data.application); setHistory(response.data.history || []); } catch (requestError) { setError(requestError.message || 'Unable to load application details.'); } finally { setDetailLoading(false); }
  }

  if (loading) return <div className="p-6 text-sm text-slate-500">Loading your applications...</div>;
  if (error && !applications.length) return <div className="p-6"><div className="card"><h1 className="text-xl font-bold">My applications</h1><p className="mt-2 text-sm text-red-600">{error}</p><Button className="mt-4" type="button" onClick={load}>Try again</Button></div></div>;

  return <div className="min-h-screen bg-canvas"><div className="mx-auto max-w-6xl space-y-5 p-6">
    <header><p className="text-sm font-semibold text-indigo-600">Student workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">My applications</h1><p className="mt-2 text-sm text-slate-500">Track every opportunity and see how your application status changes.</p></header>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {!applications.length ? <section className="card"><Empty>You have not applied to any opportunities yet.</Empty><a className="btn-primary mt-4 inline-flex" href="/student/marketplace">Browse marketplace</a></section> : <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      <section className="card"><h2 className="text-lg font-bold text-slate-900">Submitted applications</h2><div className="mt-4 space-y-3">{applications.map((application) => <button className={`block w-full rounded-xl border p-4 text-left ${selected?._id === application._id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`} type="button" key={application._id} onClick={() => openApplication(application)}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{application.job?.title || 'Application'}</p><p className="mt-1 text-sm text-slate-500">{application.job?.company?.name || 'Company'}</p></div><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-700">{statusLabel(application.status)}</span></div><div className="mt-3 flex justify-between text-xs text-slate-500"><span>Match: {application.matchScore ?? 0}%</span><span>{dateLabel(application.createdAt)}</span></div></button>)}</div></section>
      <section className="card">{detailLoading ? <p className="text-sm text-slate-500">Loading application details...</p> : selected ? <><div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-bold text-slate-900">{selected.job?.title || 'Application'}</h2><p className="mt-1 text-sm text-slate-500">{selected.job?.company?.name || 'Company'}</p></div><span className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold capitalize text-indigo-700">{statusLabel(selected.status)}</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Match score</p><p className="mt-1 text-2xl font-bold text-indigo-600">{selected.matchScore ?? 0}%</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Applied</p><p className="mt-1 text-sm font-semibold text-slate-900">{dateLabel(selected.createdAt)}</p></div></div>{selected.coverNote && <div className="mt-5"><h3 className="font-semibold text-slate-900">Cover note</h3><p className="mt-2 whitespace-pre-line text-sm text-slate-600">{selected.coverNote}</p></div>}<div className="mt-6 border-t border-slate-100 pt-5"><h3 className="font-semibold text-slate-900">Status timeline</h3>{history.length ? <ol className="mt-4 space-y-4">{history.map((entry) => <li className="relative border-l-2 border-indigo-200 pl-4" key={entry._id}><span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-indigo-600" /><p className="text-sm font-semibold capitalize text-slate-900">{statusLabel(entry.toStatus)}</p><p className="mt-1 text-xs text-slate-500">{dateLabel(entry.createdAt)}{entry.note ? ` · ${entry.note}` : ''}</p></li>)}</ol> : <Empty>No status history available.</Empty>}</div></> : <Empty>Select an application to view its timeline.</Empty>}</section>
    </div>}
  </div></div>;
}