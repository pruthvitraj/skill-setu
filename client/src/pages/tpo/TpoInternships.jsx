import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  RefreshCw,
  BriefcaseBusiness,
  MapPin,
  CalendarDays,
  Users,
  ExternalLink,
} from 'lucide-react';
import { tpoApi } from '../../services/tpoApi';

function valueOf(item, keys, fallback = '—') {
  for (const key of keys) {
    const value = key.split('.').reduce((obj, part) => obj?.[part], item);
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return fallback;
}

function formatDate(value) {
  if (!value || value === '—') return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
}

function statusClass(status) {
  const s = String(status).toLowerCase();

  if (['active', 'open', 'ongoing', 'published'].includes(s)) {
    return 'bg-emerald-50 text-emerald-700';
  }

  if (['closed', 'expired', 'cancelled', 'rejected'].includes(s)) {
    return 'bg-red-50 text-red-700';
  }

  return 'bg-amber-50 text-amber-700';
}

export default function TpoInternships() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  async function loadInternships() {
    try {
      setLoading(true);
      setError('');

      const response = await tpoApi.internships();
      const data = response?.data ?? response;
      const rows = Array.isArray(data) ? data : data?.items;

      setItems(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(err?.message || 'Unable to load internships.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInternships();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items.filter((item) => {
      const itemStatus = String(
        valueOf(item, ['status', 'applicationStatus'], '')
      ).toLowerCase();

      const searchable = [
        valueOf(item, ['title', 'role', 'position', 'name'], ''),
        valueOf(item, ['company.name', 'companyName', 'company'], ''),
        valueOf(item, ['location', 'city'], ''),
        valueOf(item, ['type', 'mode'], ''),
      ]
        .join(' ')
        .toLowerCase();

      const matchesQuery = !q || searchable.includes(q);
      const matchesStatus =
        status === 'all' || itemStatus === status.toLowerCase();

      return matchesQuery && matchesStatus;
    });
  }, [items, query, status]);

  const statuses = useMemo(() => {
    return [
      ...new Set(
        items
          .map((item) =>
            String(valueOf(item, ['status', 'applicationStatus'], ''))
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)
      ),
    ];
  }, [items]);

  const stats = useMemo(() => {
    const active = items.filter((item) =>
      ['active', 'open', 'ongoing', 'published'].includes(
        String(valueOf(item, ['status'], '')).toLowerCase()
      )
    ).length;

    const remote = items.filter((item) =>
      String(valueOf(item, ['mode', 'workMode', 'location'], ''))
        .toLowerCase()
        .includes('remote')
    ).length;

    return {
      total: items.length,
      active,
      remote,
    };
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Internships</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor internship opportunities available to your university students.
          </p>
        </div>

        <button
          type="button"
          onClick={loadInternships}
          disabled={loading}
          className="btn-ghost inline-flex items-center justify-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Internships</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {stats.total}
              </p>
            </div>
            <div className="rounded-xl bg-slate-100 p-3">
              <BriefcaseBusiness size={21} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Opportunities</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {stats.active}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
              <CalendarDays size={21} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Remote Opportunities</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {stats.remote}
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <Users size={21} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search internship, company, location..."
              className="input w-full pl-10"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input lg:w-52"
          >
            <option value="all">All statuses</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="card border-red-200 bg-red-50">
          <p className="font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={loadInternships}
            className="mt-3 btn-primary"
          >
            Try again
          </button>
        </div>
      )}

      <div className="card overflow-hidden p-0">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Internship Opportunities
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filtered.length} opportunity{filtered.length === 1 ? '' : 'ies'}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 p-6">
            {[1, 2, 3].map((row) => (
              <div
                key={row}
                className="h-16 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="rounded-full bg-slate-100 p-4">
              <BriefcaseBusiness size={28} className="text-slate-400" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">
              No internships found
            </h3>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              There are currently no internship records matching your search or
              filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Opportunity</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Student status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((item, index) => {
                  const title = valueOf(
                    item,
                    ['title', 'role', 'position', 'name'],
                    'Internship'
                  );

                  const company = valueOf(
                    item,
                    ['company.name', 'companyName', 'company'],
                    '—'
                  );

                  const location = valueOf(
                    item,
                    ['location', 'city', 'workLocation'],
                    '—'
                  );

                  const type = valueOf(
                    item,
                    ['type', 'mode', 'workMode'],
                    '—'
                  );

                  const deadline = valueOf(
                    item,
                    ['deadline', 'applicationDeadline', 'endDate'],
                    '—'
                  );

                  const itemStatus = valueOf(
                    item,
                    ['status', 'applicationStatus'],
                    '—'
                  );
                  const applicants = item.applicants || [];

                  const link = valueOf(
                    item,
                    ['url', 'applicationUrl', 'applyUrl'],
                    ''
                  );

                  return (
                    <tr key={item._id || item.id || index} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{title}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {valueOf(item, ['duration'], '')}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {applicants.length
                          ? applicants.map((applicant) => `${applicant.student?.user?.firstName || 'Student'}: ${String(applicant.status || 'applied').replace(/_/g, ' ')}`).join(', ')
                          : 'No applications yet'}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {company}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin size={15} />
                          {location}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {type}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(deadline)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                            itemStatus
                          )}`}
                        >
                          {String(itemStatus)
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {link && link !== '—' ? (
                          <a
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900"
                          >
                            Open
                            <ExternalLink size={14} />
                          </a>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

