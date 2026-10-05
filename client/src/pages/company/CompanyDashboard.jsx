import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BriefcaseBusiness,
  FileText,
  UserCheck,
  Users,
  CalendarDays,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { companyApi } from '../../services/companyApi';

function unwrap(response) {
  return response?.data?.data ?? response?.data ?? response ?? {};
}

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function timeAgo(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  return `${days}d ago`;
}

function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, helper }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {value ?? 0}
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
    </Card>
  );
}

function StatusBadge({ value }) {
  const status = String(value || '').toLowerCase();

  let classes =
    'border-slate-200 bg-slate-50 text-slate-600';

  if (
    ['published', 'active', 'hired', 'selected', 'completed'].some(
      (item) => status.includes(item)
    )
  ) {
    classes =
      'border-emerald-200 bg-emerald-50 text-emerald-700';
  } else if (
    ['pending', 'review', 'shortlisted', 'assessment'].some(
      (item) => status.includes(item)
    )
  ) {
    classes =
      'border-amber-200 bg-amber-50 text-amber-700';
  } else if (
    ['rejected', 'closed', 'cancelled'].some(
      (item) => status.includes(item)
    )
  ) {
    classes =
      'border-red-200 bg-red-50 text-red-700';
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${classes}`}
    >
      {String(value || 'Unknown')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())}
    </span>
  );
}

function HiringFunnel({ funnel = [], applications = 0 }) {
  const stages =
    funnel.length > 0
      ? funnel
      : [
          { name: 'Applied', value: applications },
          { name: 'Shortlisted', value: 0 },
          { name: 'Interview', value: 0 },
          { name: 'Hired', value: 0 },
        ];

  const max = Math.max(
    Number(applications) || 0,
    ...stages.map((stage) => Number(stage.value) || 0),
    1
  );

  return (
    <Card>
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-lg font-bold text-slate-950">
          Current application stages
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Applications by their current recorded stage
        </p>
      </div>

      <div className="space-y-5 p-6">
        {stages.map((stage) => {
          const value = Number(stage.value) || 0;
          const percentage = Math.round((value / max) * 100);

          return (
            <div
              key={stage.name}
              className="grid grid-cols-[90px_1fr_45px] items-center gap-3"
            >
              <span className="text-xs font-semibold text-slate-500">
                {stage.name}
              </span>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all"
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>

              <span className="text-right text-sm font-bold text-slate-800">
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default function CompanyDashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [activities, setActivities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    try {
      setLoading(true);
      setError('');

      const [dashboardResponse, jobsResponse, notificationsResponse] =
        await Promise.all([
          companyApi.dashboard(),
          companyApi.jobs.list({
            page: 1,
            limit: 5,
          }),
          companyApi.notifications.list({
            page: 1,
            limit: 10,
          }),
        ]);

      const dashboardData = unwrap(dashboardResponse);
      const jobsData = unwrap(jobsResponse);
      const notificationsData = unwrap(notificationsResponse);

      setDashboard(dashboardData);

      setJobs(
        Array.isArray(jobsData)
          ? jobsData
          : jobsData?.items || []
      );

      setActivities(
        Array.isArray(notificationsData)
          ? notificationsData
          : notificationsData?.items || []
      );
    } catch (err) {
      console.error('Company dashboard load failed:', err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to load company dashboard.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-96 animate-pulse rounded bg-slate-100" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5 p-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">
            Company Dashboard
          </h1>
        </div>

        <Card className="p-6">
          <p className="font-semibold text-red-700">
            Unable to load dashboard
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </Card>
      </div>
    );
  }

  const totalJobs =
    dashboard?.totalJobs ??
    dashboard?.jobs ??
    jobs.length ??
    0;

  const activeJobs =
    dashboard?.activeJobs ??
    jobs.filter((job) => job.status === 'published').length;

  const applications =
    dashboard?.applications ?? 0;

  const shortlisted =
    dashboard?.shortlisted ?? 0;

  const interviews =
    dashboard?.interviews ?? 0;

  const hired =
    dashboard?.hired ?? 0;

  const selected =
    dashboard?.selected ?? 0;

  const funnel = Array.isArray(dashboard?.funnel)
    ? dashboard.funnel
    : [];

  return (
    <div className="space-y-6 p-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Company Workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Company Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Welcome back
            {user?.firstName ? `, ${user.firstName}` : ''}.
            Manage jobs, candidates and hiring activity.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Job Openings"
          value={totalJobs}
          icon={BriefcaseBusiness}
          helper={`${activeJobs} currently active`}
        />

        <StatCard
          title="Total Applications"
          value={applications}
          icon={FileText}
          helper="Applications received"
        />

        <StatCard
          title="Shortlisted"
          value={shortlisted}
          icon={UserCheck}
          helper={`${interviews} interview records`}
        />

        <StatCard
          title="Hired"
          value={hired}
          icon={Users}
          helper={`${selected} selected`}
        />
      </div>

      {/* Funnel + Activity */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <HiringFunnel
          funnel={funnel}
          applications={applications}
        />

        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Recent Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest company notifications
              </p>
            </div>

            <Link
              to="/company/notifications"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {activities.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-400">
                No recent activity.
              </div>
            ) : (
              activities.slice(0, 6).map((activity, index) => (
                <div
                  key={activity._id || index}
                  className="flex gap-3 px-6 py-4"
                >
                  <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-slate-900" />

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">
                      {activity.message ||
                        activity.title ||
                        activity.type ||
                        'Activity'}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {timeAgo(
                        activity.createdAt ||
                          activity.updatedAt
                      )}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Jobs + quick actions */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Recent Job Postings
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your latest recruitment openings
              </p>
            </div>

            <Link
              to="/company/jobs"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <BriefcaseBusiness
                size={32}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm text-slate-500">
                No job postings yet.
              </p>

              <Link
                to="/company/jobs/new"
                className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Post your first job
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/company/jobs/${job._id}/edit`}
                      className="font-semibold text-slate-900 hover:text-blue-600"
                    >
                      {job.title || 'Untitled Job'}
                    </Link>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {job.location && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {job.location}
                        </span>
                      )}

                      {job.jobType && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {job.jobType}
                        </span>
                      )}

                      <StatusBadge value={job.status} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        {job.applications ?? 0}
                      </p>

                      <p className="text-xs text-slate-400">
                        Applications
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-slate-700">
                        {formatDate(job.deadline)}
                      </p>

                      <p className="text-xs text-slate-400">
                        Deadline
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="h-fit">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-950">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Common recruiter actions
            </p>
          </div>

          <div className="space-y-3 p-6">
            <Link
              to="/company/jobs/new"
              className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <BriefcaseBusiness size={18} />
              Post a new job
            </Link>

            <Link
              to="/company/applications"
              className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <FileText size={18} />
              Review applications
            </Link>

            <Link
              to="/company/analytics"
              className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <TrendingUp size={18} />
              View analytics
            </Link>

            <Link
              to="/company/interviews"
              className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <CalendarDays size={18} />
              Manage interviews
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}