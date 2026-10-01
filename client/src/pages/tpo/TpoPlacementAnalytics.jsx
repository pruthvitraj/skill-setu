import { useEffect, useState } from 'react';
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  FileCheck2,
  RefreshCw,
  Users,
} from 'lucide-react';
import { tpoApi } from '../../services/tpoApi';

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value ?? 0}
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
      </div>
    </div>
  );
}

function DepartmentComparison({ items }) {
  const departments = Array.isArray(items) ? items : [];

  const maxTotal = Math.max(
    ...departments.map((item) => Number(item.total) || 0),
    1
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-bold text-slate-900">
            Department Comparison
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Placement performance by department.
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3">
          <Building2 className="h-5 w-5 text-slate-700" />
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {departments.map((item) => {
          const total = Number(item.total) || 0;
          const placed = Number(item.placed) || 0;
          const rate = Number(item.rate) || 0;

          const width = Math.max(
            4,
            Math.min(100, (total / maxTotal) * 100)
          );

          return (
            <div key={item.department}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {item.department}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {placed} placed of {total} students
                  </p>
                </div>

                <span className="text-sm font-bold text-slate-900">
                  {rate}%
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}

        {!departments.length && (
          <p className="text-sm text-slate-500">
            No department data available.
          </p>
        )}
      </div>
    </div>
  );
}

function MonthlyTrend({ items }) {
  const months = Array.isArray(items) ? items : [];

  const maxApplications = Math.max(
    ...months.map((item) => Number(item.applications) || 0),
    1
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-bold text-slate-900">
            Monthly Trend
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Application and placement activity.
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3">
          <BarChart3 className="h-5 w-5 text-slate-700" />
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {months.map((item) => {
          const applications = Number(item.applications) || 0;
          const shortlisted = Number(item.shortlisted) || 0;
          const placed = Number(item.placed) || 0;

          const width = Math.max(
            4,
            Math.min(
              100,
              (applications / maxApplications) * 100
            )
          );

          return (
            <div key={item.month}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-800">
                  {item.month}
                </span>

                <span className="text-xs font-medium text-slate-500">
                  {applications} applications
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all"
                  style={{ width: `${width}%` }}
                />
              </div>

              <div className="mt-2 flex gap-4 text-xs text-slate-400">
                <span>
                  Shortlisted: {shortlisted}
                </span>

                <span>
                  Placed: {placed}
                </span>
              </div>
            </div>
          );
        })}

        {!months.length && (
          <p className="text-sm text-slate-500">
            No monthly trend data available.
          </p>
        )}
      </div>
    </div>
  );
}

function ApplicationStatus({ breakdown }) {
  const entries = Object.entries(breakdown || {});

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-900">
            Application Status
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current application pipeline.
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3">
          <FileCheck2 className="h-5 w-5 text-slate-700" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {entries.map(([status, count]) => (
          <div
            key={status}
            className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
          >
            <span className="text-sm font-medium capitalize text-slate-700">
              {status.replaceAll('_', ' ')}
            </span>

            <span className="font-bold text-slate-900">
              {count}
            </span>
          </div>
        ))}

        {!entries.length && (
          <p className="text-sm text-slate-500">
            No application data available yet.
          </p>
        )}
      </div>
    </div>
  );
}

function RecentDrives({ drives }) {
  const items = Array.isArray(drives) ? drives : [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-900">
            Recent Placement Drives
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest hiring activity.
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3">
          <BriefcaseBusiness className="h-5 w-5 text-slate-700" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((drive) => (
          <div
            key={String(drive.id || drive._id)}
            className="rounded-xl border border-slate-100 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {drive.title || 'Placement Drive'}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {typeof drive.company === 'object'
                    ? drive.company?.name
                    : drive.company || 'Company'}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
                {drive.status || 'pending'}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
              {drive.date && (
                <span>
                  Date: {drive.date}
                </span>
              )}

              {drive.applications !== undefined && (
                <span>
                  Applications: {drive.applications}
                </span>
              )}

              {drive.selected !== undefined && (
                <span>
                  Selected: {drive.selected}
                </span>
              )}
            </div>
          </div>
        ))}

        {!items.length && (
          <p className="text-sm text-slate-500">
            No placement drives available yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default function TpoPlacementAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const response = await tpoApi.placementAnalytics();

      setData(response?.data || response || {});
    } catch (err) {
      setError(
        err?.message ||
          'Unable to load placement analytics.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totals = data?.totals || {};

  const students =
    totals.students ??
    data?.totalStudents ??
    0;

  const placed =
    totals.placed ??
    data?.placed ??
    0;

  const companies =
    totals.companies ??
    data?.totalCompanies ??
    0;

  const drives =
    totals.drives ??
    data?.totalDrives ??
    0;

  const applications =
    totals.applications ??
    data?.applications ??
    0;

  const shortlisted =
    totals.shortlisted ??
    data?.shortlisted ??
    0;

  const selected =
    totals.selected ??
    data?.selected ??
    0;

  const interviews =
    totals.interviews ??
    data?.interviews ??
    0;

  const placementRate =
    data?.placementRate ??
    0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Placement Analytics
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            University-level placement performance and hiring activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => load(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing ? 'animate-spin' : ''
            }`}
          />

          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Loading placement analytics...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
          {error}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              icon={Users}
              label="Students"
              value={students}
            />

            <Stat
              icon={CheckCircle2}
              label="Placed"
              value={placed}
            />

            <Stat
              icon={Building2}
              label="Companies"
              value={companies}
            />

            <Stat
              icon={BriefcaseBusiness}
              label="Placement Drives"
              value={drives}
            />

            <Stat
              icon={FileCheck2}
              label="Applications"
              value={applications}
            />

            <Stat
              icon={CheckCircle2}
              label="Shortlisted"
              value={shortlisted}
            />

            <Stat
              icon={Users}
              label="Interviews"
              value={interviews}
            />

            <Stat
              icon={BarChart3}
              label="Placement Rate"
              value={`${placementRate}%`}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <DepartmentComparison
              items={data?.departmentComparison}
            />

            <MonthlyTrend
              items={data?.monthlyTrend}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ApplicationStatus
              breakdown={data?.statusBreakdown}
            />

            <RecentDrives
              drives={data?.drives}
            />
          </div>
        </>
      )}
    </div>
  );
}