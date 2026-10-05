import { useEffect, useState } from 'react';
import { notificationApi } from '../../services/notificationApi';
export default function NotificationsPage() {
  const [items, setItems] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function load() { const r = await notificationApi.list(); setItems(r.data.items || []); }
  useEffect(() => { load().catch(e => setError(e.message)); }, []);
  async function read(id) { setBusy(true); setError(''); try { id ? await notificationApi.read(id) : await notificationApi.readAll(); await load(); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  return <main className="mx-auto max-w-4xl p-6"><div className="flex justify-between gap-4"><h1 className="text-3xl font-semibold">Notifications</h1><button disabled={busy || !items?.some(n => !n.read)} onClick={() => read()} className="rounded border px-3 py-2 text-sm disabled:opacity-50">Mark all read</button></div>{error && <p role="alert" className="mt-4 text-red-700">{error}</p>}{!items && !error && <p className="mt-6">Loading notifications…</p>}<div className="mt-6 divide-y border-t">{items?.map(n => <article key={n._id} className="py-5"><div className="flex justify-between gap-4"><h2 className={n.read ? 'text-slate-600' : 'font-semibold'}>{n.title || n.type}</h2>{!n.read && <button disabled={busy} onClick={() => read(n._id)} className="text-sm text-blue-700 underline">Mark read</button>}</div><p className="mt-2 text-sm text-slate-600">{n.body}</p><p className="mt-2 text-xs text-slate-500">{new Date(n.createdAt).toLocaleString()}</p></article>)}{items?.length === 0 && <p className="py-6 text-sm text-slate-500">No notifications yet.</p>}</div></main>;
}
