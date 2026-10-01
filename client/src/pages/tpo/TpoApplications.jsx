import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  FileCheck2,
  RefreshCw,
  Search,
  UserRound,
  XCircle,
} from 'lucide-react';
import { tpoApi } from '../../services/tpoApi';

const STATUS = {
  applied: 'Applied',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  interview_scheduled: 'Interview Scheduled',
  hired: 'Hired',
};

const STATUS_STYLES = {
  applied: 'bg-blue-50 text-blue-700 border-blue-200',
  shortlisted: 'bg-amber-50 text-amber-700 border-amber-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  interview_scheduled: 'bg-violet-50 text-violet-700 border-violet-200',
  hired: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function itemsFrom(response) {
  return response?.data?.items || response?.items || [];
}

function getStudentName(application) {
  const user = application.student?.user;

  if (!user) return 'Student';

  return [user.firstName, user.lastName]
    .filter(Boolean)
    .join(' ') || 'Student';
}

function getCompanyName(application) {
  return (
    application.job?.company?.name ||
    application.company?.name ||
    'Company'
  );
}

function getJobTitle(application) {
  return (
    application.job?.title ||
    'Job'
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        STATUS_STYLES[status] ||
        'border-slate-200 bg-slate-100 text-slate-600'
      }`}
    >
      {STATUS[status] || status || 'Unknown'}
    </span>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
      </div>
    </div>
  );
}

export default function TpoApplications() {
  const [applications, setApplications] = useState([]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = async (refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      setError('');

      const response = await tpoApi.applications();

      setApplications(itemsFrom(response));
    } catch (err) {
      setError(
        err?.message || 'Unable to load applications.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const stats = useMemo(() => ({
    total: applications.length,
    applied: applications.filter(
      (item) => item.status === 'applied'
    ).length,
    shortlisted: applications.filter(
      (item) => item.status === 'shortlisted'
    ).length,
    interviews: applications.filter(
      (item) => item.status === 'interview_scheduled'
    ).length,
    hired: applications.filter(
      (item) => item.status === 'hired'
    ).length,
  }), [applications]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return applications;

    return applications.filter((application) => {
      const student = getStudentName(application);
      const company = getCompanyName(application);
      const job = getJobTitle(application);

      return [student, company, job]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [applications, search]);

  const updateStatus = async (nextStatus) => {
    if (!selected) return;

    try {
      setUpdating(true);

      await tpoApi.updateApplicationStatus(selected._id, {
        status: nextStatus,
      });

      setSelected(null);
      await load(true);
    } catch (err) {
      setError(
        err?.message || 'Unable to update application status.'
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Applications
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor student applications across university placement activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => load(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing ? 'animate-spin' : ''
            }`}
          />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat icon={FileCheck2} label="Total" value={stats.total} />
        <Stat icon={Clock3} label="Applied" value={stats.applied} />
        <Stat icon={CheckCircle2} label="Shortlisted" value={stats.shortlisted} />
        <Stat icon={UserRound} label="Interviews" value={stats.interviews} />
        <Stat icon={CheckCircle2} label="Hired" value={stats.hired} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search student, company or job..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none"
          >
            <option value="all">All statuses</option>

            {Object.entries(STATUS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading applications...
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => load()}
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileCheck2 className="mx-auto h-10 w-10 text-slate-300" />

            <h3 className="mt-4 font-semibold text-slate-900">
              No applications found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Applications will appear here as students apply to jobs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Student
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Company
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Job
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Match
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((application) => (
                  <tr
                    key={application._id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {getStudentName(application)}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      {getCompanyName(application)}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      {getJobTitle(application)}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      {application.matchScore != null
                        ? `${application.matchScore}%`
                        : '—'}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={application.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(application)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Application Review
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {getStudentName(selected)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Company</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {getCompanyName(selected)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Position</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {getJobTitle(selected)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500">Current status</p>
                <div className="mt-2">
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              {selected.coverNote && (
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    Cover note
                  </p>
                  <p className="mt-1 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                    {selected.coverNote}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => updateStatus('shortlisted')}
                  className="rounded-xl bg-amber-500 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Shortlist
                </button>

                <button
                  type="button"
                  disabled={updating}
                  onClick={() => updateStatus('rejected')}
                  className="rounded-xl bg-red-600 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


