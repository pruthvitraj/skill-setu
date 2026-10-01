import { useEffect, useState } from 'react';
import {
  Megaphone,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { tpoApi } from '../../services/tpoApi';

function itemsFrom(response) {
  return response?.data?.items || response?.items || [];
}

export default function TpoAnnouncements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [publishing, setPublishing] = useState(false);

  const load = async (refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      setError('');

      const response = await tpoApi.announcements();
      setItems(itemsFrom(response));
    } catch (err) {
      setError(
        err?.message || 'Unable to load announcements.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const publish = async (event) => {
    event.preventDefault();

    if (!title.trim() || !body.trim()) {
      return;
    }

    try {
      setPublishing(true);
      setError('');

      await tpoApi.createAnnouncement({
        title: title.trim(),
        body: body.trim(),
      });

      setTitle('');
      setBody('');
      setOpen(false);

      await load(true);
    } catch (err) {
      setError(
        err?.message || 'Unable to publish announcement.'
      );
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Announcements
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Publish placement and university announcements for students.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            New Announcement
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Loading announcements...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <Megaphone className="mx-auto h-10 w-10 text-slate-300" />

          <h3 className="mt-4 font-semibold text-slate-900">
            No announcements yet
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Publish the first announcement for your students.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="font-bold text-slate-900">
                {item.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.body || item.content}
              </p>

              {item.createdAt && (
                <p className="mt-4 text-xs text-slate-400">
                  {new Date(item.createdAt).toLocaleString('en-IN')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form
            onSubmit={publish}
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
          >
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-bold text-slate-900">
                New Announcement
              </h2>
            </div>

            <div className="space-y-4 p-5">
              <input
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Announcement title"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />

              <textarea
                value={body}
                onChange={(event) =>
                  setBody(event.target.value)
                }
                placeholder="Write your announcement..."
                rows={6}
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={publishing}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {publishing ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
