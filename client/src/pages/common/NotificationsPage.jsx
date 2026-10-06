import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { notificationApi } from '../../services/notificationApi';
export default function NotificationsPage() {
  const [items, setItems] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function load() { const r = await notificationApi.list(); setItems(r.data.items || []); }
  useEffect(() => { load().catch(e => setError(e.message)); }, []);
  async function read(id) { setBusy(true); setError(''); try { id ? await notificationApi.read(id) : await notificationApi.readAll(); await load(); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  return <div className="ui-page"><PageHeader title="Notifications" description="Keep up with learning, applications, interviews, and placement updates." actions={<button disabled={busy || !items?.some(n => !n.read)} onClick={() => read()} className="btn btn-ghost btn-sm">Mark all read</button>} />{error && <p role="alert" className="ui-feedback ui-feedback-error">{error}</p>}{!items && !error && <p className="student-notifications-state">Loading notifications…</p>}<div className="student-notifications-list">{items?.map(n => <article key={n._id} className={`student-notification${n.read ? '' : ' is-unread'}`}><div><h2>{n.title || n.type}</h2><p>{n.body}</p><time dateTime={n.createdAt}>{new Date(n.createdAt).toLocaleString()}</time></div>{!n.read && <button disabled={busy} onClick={() => read(n._id)} className="student-notification-read">Mark read</button>}</article>)}{items?.length === 0 && <p className="student-notifications-state">No notifications yet. New learning and opportunity updates will appear here.</p>}</div></div>;
}
