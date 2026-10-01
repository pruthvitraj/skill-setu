import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { networkApi } from '../../services/networkApi';

export default function NetworkPage({ role }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    networkApi[role]().then((response) => setItems(response.data.items || []))
      .catch((requestError) => setError(requestError.message || 'Unable to load your network.'));
  }, [role]);

  return <main className="min-h-screen bg-canvas"><div className="mx-auto max-w-5xl space-y-5 p-6">
    <header><h1 className="text-3xl font-bold text-slate-900">My network</h1><p className="mt-2 text-sm text-slate-500">Connections created when a company selects a student.</p></header>
    {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {!items.length ? <p className="card text-sm text-slate-500">No placement connections yet.</p> : <div className="grid gap-4 md:grid-cols-2">{items.map((item) => { const person = role === 'student' ? item.recruiter?.user : item.student?.user; const messagesPath = role === 'student' ? '/student/messages' : '/company/messages'; return <article className="card" key={item._id}><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-900">{[person?.firstName, person?.lastName].filter(Boolean).join(' ') || 'Connection'}</h2><p className="mt-1 text-sm text-slate-500">{item.company?.name || 'Company'} · {item.application?.job?.title || 'Placement connection'}</p></div><Link className="rounded-lg bg-[#22488f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1a3872]" to={`${messagesPath}?userId=${person?._id || ''}`}>Message</Link></div><p className="mt-3 text-xs text-emerald-700">Selected connection</p></article>; })}</div>}
  </div></main>;
}