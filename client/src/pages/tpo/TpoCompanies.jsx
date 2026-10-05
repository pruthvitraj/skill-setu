import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  RefreshCw,
  Building2,
  MapPin,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import { tpoApi } from '../../services/tpoApi';

function getValue(item, keys, fallback = '—') {
  for (const key of keys) {
    const value = key.split('.').reduce((obj, part) => obj?.[part], item);
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return fallback;
}

export default function TpoCompanies() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadCompanies() {
    try {
      setLoading(true);
      setError('');

      const response = await tpoApi.companies();
      const data = response?.data ?? response;
      const rows = Array.isArray(data) ? data : data?.items;

      setItems(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(err?.message || 'Unable to load companies.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return items;

    return items.filter((item) =>
      [
        getValue(item, ['name', 'companyName'], ''),
        getValue(item, ['industry', 'sector'], ''),
        getValue(item, ['location', 'city', 'headquarters'], ''),
        getValue(item, ['website'], ''),
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [items, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Companies</h1>
          <p className="mt-1 text-sm text-slate-500">
            Public company directory. Placement requests establish campus relationships.
          </p>
        </div>

        <button
          type="button"
          onClick={loadCompanies}
          disabled={loading}
          className="btn-ghost inline-flex items-center justify-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-slate-500">Total Companies</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {items.length}
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-slate-500">Companies with published openings</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {items.filter((item) =>
              getValue(item, ['activeJobs'], false)
            ).length}
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-slate-500">Visible Results</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {filtered.length}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company, industry, location..."
            className="input w-full pl-10"
          />
        </div>
      </div>

      {error && (
        <div className="card border-red-200 bg-red-50">
          <p className="font-medium text-red-700">{error}</p>
          <button onClick={loadCompanies} className="btn-primary mt-3">
            Try again
          </button>
        </div>
      )}

      <div className="card overflow-hidden p-0">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Company Directory</h2>
          <p className="mt-1 text-sm text-slate-500">
            {filtered.length} compan{filtered.length === 1 ? 'y' : 'ies'}
          </p>
        </div>

        {loading ? (
          <div className="space-y-4 p-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="rounded-full bg-slate-100 p-4">
              <Building2 size={28} className="text-slate-400" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">
              No companies found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              No company records match the current search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Industry</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Hiring</th>
                  <th className="px-6 py-4">Website</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((item, index) => {
                  const name = getValue(
                    item,
                    ['name', 'companyName'],
                    'Company'
                  );

                  const industry = getValue(
                    item,
                    ['industry', 'sector'],
                    '—'
                  );

                  const location = getValue(
                    item,
                    ['location', 'city', 'headquarters'],
                    '—'
                  );

                  const website = getValue(item, ['website', 'url'], '');

                  const hiring = getValue(
                    item,
                    ['active', 'isActive'],
                    null
                  );

                  return (
                    <tr
                      key={item._id || item.id || index}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-slate-100 p-2.5">
                            <Building2 size={19} />
                          </div>
                          <span className="font-medium text-slate-900">
                            {name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {industry}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin size={15} />
                          {location}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {hiring === null ? (
                          <span className="text-sm text-slate-400">—</span>
                        ) : (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              hiring
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {hiring} published opening{hiring===1?'':'s'}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {website ? (
                          <a
                            href={website}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900"
                          >
                            Visit
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
