import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  X,
  UserCircle,
  Briefcase,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock3,
  Award,
  FileText,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { companyApi } from '../../services/companyApi';

const STATUS = {
  applied: 'applied',
  shortlisted: 'shortlisted',
  assessment: 'assessment',
  interview_scheduled: 'interview_scheduled',
  selected: 'selected',
  rejected: 'rejected',
  hired: 'hired',
};

const STATUS_META = {
  applied: {
    label: 'Applied',
    className: 'bg-slate-100 text-slate-700',
  },
  shortlisted: {
    label: 'Shortlisted',
    className: 'bg-blue-50 text-blue-700',
  },
  assessment: {
    label: 'Assessment',
    className: 'bg-violet-50 text-violet-700',
  },
  interview_scheduled: {
    label: 'Interview Scheduled',
    className: 'bg-amber-50 text-amber-700',
  },
  selected: {
    label: 'Selected',
    className: 'bg-emerald-50 text-emerald-700',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-700',
  },
  hired: {
    label: 'Hired',
    className: 'bg-green-50 text-green-700',
  },
};

function itemsFrom(response) {
  return response?.data?.items || response?.items || [];
}

function paginationFrom(response) {
  return response?.data?.pagination ||
    response?.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      pages: 1,
    };
}

function getUser(application) {
  return application?.student?.user || {};
}

function getStudentName(application) {
  const user = getUser(application);

  const name = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return name || 'Unnamed candidate';
}

function getStudentEmail(application) {
  return getUser(application).email || 'No email available';
}

function getJobTitle(application) {
  return application?.job?.title || 'Untitled job';
}

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatStatus(status) {
  return (
    STATUS_META[status]?.label ||
    String(status || 'Unknown')
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || {
    className: 'bg-slate-100 text-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function StatCard({ label, value, icon, className = '' }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className={`mt-2 text-2xl font-bold text-[#0f2447] ${className}`}>
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#22488f]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function MatchScore({ score }) {
  if (score === undefined || score === null) {
    return <span className="text-slate-400">—</span>;
  }

  const numericScore = Math.round(Number(score));

  return (
    <span
      className={`font-bold ${
        numericScore >= 80
          ? 'text-emerald-600'
          : numericScore >= 60
            ? 'text-amber-600'
            : 'text-slate-600'
      }`}
    >
      {numericScore}%
    </span>
  );
}

export default function CompanyApplications() {
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [updatingId, setUpdatingId] = useState(null);
  const [actionError, setActionError] = useState('');

  async function loadApplications(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const response = await companyApi.applications.list({
        page,
        limit: 10,
        q: search.trim() || undefined,
        status: status || undefined,
      });

      setApplications(itemsFrom(response));
      setPagination(paginationFrom(response));
    } catch (requestError) {
      console.error('Failed to load applications:', requestError);
      setError(
        requestError?.message ||
          'Unable to load applications right now.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadApplications();
    }, 250);

    return () => clearTimeout(timer);
  }, [page, search, status]);

  function handleSearchChange(event) {
    setPage(1);
    setSearch(event.target.value);
  }

  function handleStatusChange(event) {
    setPage(1);
    setStatus(event.target.value);
  }

  async function updateStatus(application, nextStatus) {
    if (!application?._id || !nextStatus) return;

    const currentStatus = application.status;

    if (currentStatus === nextStatus) return;

    try {
      setUpdatingId(application._id);
      setActionError('');

      const response = await companyApi.applications.updateStatus(
        application._id,
        nextStatus
      );

      const updated =
        response?.data?.application ||
        response?.application;

      setApplications((current) =>
        current.map((item) =>
          item._id === application._id
            ? {
                ...item,
                ...(updated || {}),
                status: updated?.status || nextStatus,
              }
            : item
        )
      );

      setSelected((current) =>
        current?._id === application._id
          ? {
              ...current,
              ...(updated || {}),
              status: updated?.status || nextStatus,
            }
          : current
      );
    } catch (requestError) {
      console.error('Failed to update application:', requestError);

      setActionError(
        requestError?.message ||
          'Unable to update this application.'
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const counts = useMemo(() => {
    return applications.reduce(
      (accumulator, application) => {
        accumulator.total += 1;

        if (application.status === STATUS.shortlisted) {
          accumulator.shortlisted += 1;
        }

        if (
          application.status === STATUS.interview_scheduled
        ) {
          accumulator.interviews += 1;
        }

        if (application.status === STATUS.hired) {
          accumulator.hired += 1;
        }

        return accumulator;
      },
      {
        total: 0,
        shortlisted: 0,
        interviews: 0,
        hired: 0,
      }
    );
  }, [applications]);

  const totalPages = Math.max(
    1,
    pagination.pages ||
      Math.ceil(
        (pagination.total || 0) /
          (pagination.limit || 10)
      )
  );

  return (
    <div className="min-h-full bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0f2447]">
              Applications
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Review candidates, manage application stages, and move
              talent through your hiring pipeline.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadApplications(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? 'animate-spin' : ''}
            />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Applications"
            value={
              pagination.total ??
              counts.total
            }
            icon={<FileText size={20} />}
          />

          <StatCard
            label="Shortlisted"
            value={counts.shortlisted}
            icon={<CheckCircle2 size={20} />}
          />

          <StatCard
            label="Interviews"
            value={counts.interviews}
            icon={<Calendar size={20} />}
          />

          <StatCard
            label="Hired"
            value={counts.hired}
            icon={<Award size={20} />}
            className="text-emerald-600"
          />
        </div>

        {/* Filters */}
        <div className="card mt-6 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search candidate, email, or job..."
                className="input w-full pl-10"
              />
            </div>

            <div className="relative">
              <Filter
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={status}
                onChange={handleStatusChange}
                className="input min-w-[210px] pl-9"
              >
                <option value="">All statuses</option>
                <option value={STATUS.applied}>Applied</option>
                <option value={STATUS.shortlisted}>
                  Shortlisted
                </option>
                <option value={STATUS.assessment}>
                  Assessment
                </option>
                <option value={STATUS.interview_scheduled}>
                  Interview Scheduled
                </option>
                <option value={STATUS.selected}>
                  Selected
                </option>
                <option value={STATUS.rejected}>
                  Rejected
                </option>
                <option value={STATUS.hired}>Hired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() => loadApplications()}
                className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-50"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="card mt-6 flex min-h-[360px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2
                size={28}
                className="animate-spin text-[#22488f]"
              />
              <p className="text-sm">
                Loading applications...
              </p>
            </div>
          </div>
        ) : applications.length === 0 ? (
          <div className="card mt-6 flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FileText size={25} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-[#0f2447]">
              No applications found
            </h2>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              {search || status
                ? 'Try changing your search or status filter.'
                : 'Applications from candidates will appear here when they apply to your jobs.'}
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="card mt-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Candidate
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Position
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Match
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Applied
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {applications.map((application) => (
                      <tr
                        key={application._id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-[#22488f]">
                              {getStudentName(application)
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">
                                {getStudentName(application)}
                              </p>

                              <p className="truncate text-xs text-slate-500">
                                {getStudentEmail(application)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Briefcase
                              size={15}
                              className="shrink-0 text-slate-400"
                            />

                            <span className="font-medium text-slate-700">
                              {getJobTitle(application)}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <MatchScore
                            score={application.matchScore}
                          />
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {formatDate(application.createdAt)}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={application.status}
                          />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setSelected(application)
                            }
                            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Eye size={15} />
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing{' '}
                  <span className="font-semibold text-slate-700">
                    {applications.length}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-slate-700">
                    {pagination.total || applications.length}
                  </span>{' '}
                  applications
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(1, current - 1)
                      )
                    }
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={17} />
                  </button>

                  <span className="px-2 text-sm font-medium text-slate-600">
                    {page} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((current) =>
                        Math.min(totalPages, current + 1)
                      )
                    }
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Application detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelected(null);
              setActionError('');
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Application review
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#0f2447]">
                  {getStudentName(selected)}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {getJobTitle(selected)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setActionError('');
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              {/* Candidate information */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-[#22488f]">
                    {getStudentName(selected)
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900">
                      {getStudentName(selected)}
                    </h3>

                    <div className="mt-2 space-y-1.5 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <Mail size={14} />
                        {getStudentEmail(selected)}
                      </p>

                      <p className="flex items-center gap-2">
                        <Briefcase size={14} />
                        {getJobTitle(selected)}
                      </p>

                      <p className="flex items-center gap-2">
                        <Calendar size={14} />
                        Applied {formatDate(selected.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs font-medium text-slate-500">
                      Match score
                    </p>
                    <p className="mt-1 text-2xl font-bold text-[#22488f]">
                      {selected.matchScore ?? '—'}
                      {selected.matchScore !== undefined &&
                      selected.matchScore !== null
                        ? '%'
                        : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Current status */}
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">
                  Current status
                </p>

                <StatusBadge status={selected.status} />
              </div>

              {/* Cover note */}
              {selected.coverNote && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <FileText
                      size={16}
                      className="text-slate-500"
                    />
                    <h3 className="text-sm font-bold text-slate-700">
                      Cover note
                    </h3>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                    {selected.coverNote}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div>
                <h3 className="text-sm font-bold text-slate-700">
                  Update application
                </h3>

                {actionError && (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {actionError}
                  </div>
                )}

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={
                      updatingId === selected._id
                    }
                    onClick={() =>
                      updateStatus(
                        selected,
                        STATUS.shortlisted
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#22488f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3872] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2 size={16} />
                    Shortlist
                  </button>

                  <button
                    type="button"
                    disabled={
                      updatingId === selected._id
                    }
                    onClick={() =>
                      updateStatus(
                        selected,
                        STATUS.assessment
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FileText size={16} />
                    Assessment
                  </button>

                  <button
                    type="button"
                    disabled={
                      updatingId === selected._id
                    }
                    onClick={() =>
                      updateStatus(
                        selected,
                        STATUS.interview_scheduled
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Calendar size={16} />
                    Schedule Interview
                  </button>

                  <button
                    type="button"
                    disabled={
                      updatingId === selected._id
                    }
                    onClick={() =>
                      updateStatus(
                        selected,
                        STATUS.selected
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Award size={16} />
                    Select
                  </button>

                  <button
                    type="button"
                    disabled={
                      updatingId === selected._id
                    }
                    onClick={() =>
                      updateStatus(
                        selected,
                        STATUS.hired
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2 size={16} />
                    Hire
                  </button>

                  <button
                    type="button"
                    disabled={
                      updatingId === selected._id
                    }
                    onClick={() =>
                      updateStatus(
                        selected,
                        STATUS.rejected
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>

                {updatingId === selected._id && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-500">
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                    Updating application...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}