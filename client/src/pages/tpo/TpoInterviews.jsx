import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  UserRound,
  Video,
  XCircle,
} from 'lucide-react';
import { tpoApi } from '../../services/tpoApi';

function unwrap(response) {
  if (!response) return null;
  return response.data ?? response;
}

function getStudentName(student) {
  if (!student) return 'Student';

  if (typeof student === 'string') return student;

  const user = student.user || {};

  return (
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    student.name ||
    student.fullName ||
    'Student'
  );
}

function getStudentEmail(student) {
  if (!student || typeof student === 'string') return '';

  return student.user?.email || student.email || '';
}

function getCompanyName(company) {
  if (!company) return 'Company';

  if (typeof company === 'string') return company;

  return company.name || company.companyName || 'Company';
}

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function titleCase(value) {
  return String(value || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function StatusBadge({ status }) {
  const value = String(status || '').toLowerCase();

  let classes =
    'border-slate-200 bg-slate-50 text-slate-600';

  if (value === 'scheduled') {
    classes =
      'border-amber-200 bg-amber-50 text-amber-700';
  } else if (value === 'completed') {
    classes =
      'border-emerald-200 bg-emerald-50 text-emerald-700';
  } else if (
    value === 'cancelled' ||
    value === 'canceled' ||
    value === 'failed'
  ) {
    classes =
      'border-red-200 bg-red-50 text-red-700';
  } else if (value === 'selected') {
    classes =
      'border-blue-200 bg-blue-50 text-blue-700';
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${classes}`}
    >
      {titleCase(status || 'Unknown')}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, helper }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          {helper && (
            <p className="mt-1 text-xs text-slate-400">
              {helper}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function InterviewCard({ interview }) {
  const studentName = getStudentName(interview.student);
  const studentEmail = getStudentEmail(interview.student);
  const companyName = getCompanyName(interview.company);

  const isOnline =
    String(interview.mode || '').toLowerCase() === 'online';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <UserRound size={20} />
            </div>

            <div className="min-w-0">
              <h3 className="truncate font-semibold text-slate-900">
                {studentName}
              </h3>

              {studentEmail && (
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {studentEmail}
                </p>
              )}
            </div>
          </div>

          <StatusBadge status={interview.status} />
        </div>

        {/* Company */}
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Company
          </p>

          <p className="mt-1 font-semibold text-slate-800">
            {companyName}
          </p>
        </div>

        {/* Interview information */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
            <CalendarDays
              size={17}
              className="shrink-0 text-slate-400"
            />

            <div>
              <p className="text-xs text-slate-400">Date</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-700">
                {formatDate(interview.date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
            <Clock3
              size={17}
              className="shrink-0 text-slate-400"
            />

            <div>
              <p className="text-xs text-slate-400">Time</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-700">
                {interview.time || '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
            {isOnline ? (
              <Video
                size={17}
                className="shrink-0 text-slate-400"
              />
            ) : (
              <MapPin
                size={17}
                className="shrink-0 text-slate-400"
              />
            )}

            <div>
              <p className="text-xs text-slate-400">Mode</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-700">
                {interview.mode || '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
            <Clock3
              size={17}
              className="shrink-0 text-slate-400"
            />

            <div>
              <p className="text-xs text-slate-400">Round</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-700">
                {interview.round || '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TpoInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [roundFilter, setRoundFilter] = useState('all');

  async function loadInterviews(refresh = false) {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const response = await tpoApi.interviews();
      const payload = unwrap(response);

      const items = Array.isArray(payload)
        ? payload
        : payload?.items || payload?.interviews || [];

      setInterviews(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(
        err?.message || 'Unable to load interviews.'
      );
      setInterviews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadInterviews();
  }, []);

  const statistics = useMemo(() => {
    const total = interviews.length;

    const scheduled = interviews.filter(
      (item) =>
        String(item.status || '').toLowerCase() ===
        'scheduled'
    ).length;

    const completed = interviews.filter(
      (item) =>
        String(item.status || '').toLowerCase() ===
        'completed'
    ).length;

    const cancelled = interviews.filter((item) =>
      ['cancelled', 'canceled'].includes(
        String(item.status || '').toLowerCase()
      )
    ).length;

    const online = interviews.filter(
      (item) =>
        String(item.mode || '').toLowerCase() ===
        'online'
    ).length;

    const onCampus = interviews.filter(
      (item) =>
        String(item.mode || '').toLowerCase() ===
        'on campus'
    ).length;

    return {
      total,
      scheduled,
      completed,
      cancelled,
      online,
      onCampus,
    };
  }, [interviews]);

  const rounds = useMemo(() => {
    const values = interviews
      .map((item) => item.round)
      .filter(Boolean);

    return [...new Set(values)];
  }, [interviews]);

  const filteredInterviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return interviews.filter((item) => {
      const studentName =
        getStudentName(item.student).toLowerCase();

      const studentEmail =
        getStudentEmail(item.student).toLowerCase();

      const companyName =
        getCompanyName(item.company).toLowerCase();

      const round =
        String(item.round || '').toLowerCase();

      const status =
        String(item.status || '').toLowerCase();

      const mode =
        String(item.mode || '').toLowerCase();

      const matchesSearch =
        !query ||
        studentName.includes(query) ||
        studentEmail.includes(query) ||
        companyName.includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        status === statusFilter;

      const matchesMode =
        modeFilter === 'all' ||
        mode === modeFilter;

      const matchesRound =
        roundFilter === 'all' ||
        round === roundFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesMode &&
        matchesRound
      );
    });
  }, [
    interviews,
    search,
    statusFilter,
    modeFilter,
    roundFilter,
  ]);

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Interviews
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage student interviews, schedules, rounds and
            interview outcomes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadInterviews(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={
              refreshing ? 'animate-spin' : ''
            }
          />

          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <XCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-semibold">
              Unable to load interviews
            </p>

            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label="Total Interviews"
          value={statistics.total}
          helper="All recorded interviews"
        />

        <StatCard
          icon={Clock3}
          label="Scheduled"
          value={statistics.scheduled}
          helper="Upcoming interviews"
        />

        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={statistics.completed}
          helper="Completed interviews"
        />

        <StatCard
          icon={Video}
          label="Online"
          value={statistics.online}
          helper={`${statistics.onCampus} on campus`}
        />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Filter size={17} className="text-slate-500" />

          <h2 className="font-semibold text-slate-900">
            Interview Filters
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search student or company..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Mode */}
          <select
            value={modeFilter}
            onChange={(event) =>
              setModeFilter(event.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
          >
            <option value="all">All Modes</option>
            <option value="online">Online</option>
            <option value="on campus">On Campus</option>
          </select>

          {/* Round */}
          <select
            value={roundFilter}
            onChange={(event) =>
              setRoundFilter(event.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
          >
            <option value="all">All Rounds</option>

            {rounds.map((round) => (
              <option key={round} value={round}>
                {round}
              </option>
            ))}
          </select>
        </div>

        {/* Result count */}
        <div className="mt-4 text-xs text-slate-400">
          Showing{' '}
          <span className="font-semibold text-slate-600">
            {filteredInterviews.length}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-slate-600">
            {interviews.length}
          </span>{' '}
          interviews
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <RefreshCw
            size={28}
            className="mx-auto animate-spin text-slate-500"
          />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading interviews...
          </p>
        </div>
      ) : filteredInterviews.length === 0 ? (
        /* Empty */
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <CalendarDays size={25} />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-900">
            No interviews found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            No interviews match the current search and
            filter criteria.
          </p>

          {(search ||
            statusFilter !== 'all' ||
            modeFilter !== 'all' ||
            roundFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setModeFilter('all');
                setRoundFilter('all');
              }}
              className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        /* Interview list */
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredInterviews.map((interview) => (
            <InterviewCard
              key={interview._id || interview.id}
              interview={interview}
            />
          ))}
        </div>
      )}
    </div>
  );
}