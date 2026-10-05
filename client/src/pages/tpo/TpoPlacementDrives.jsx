import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import { tpoApi } from '../../services/tpoApi';

const STATUS_META = {
  requested: {
    label: 'Requested',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  approved: {
    label: 'Approved',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  rescheduled: {
    label: 'Rescheduled',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  active: {
    label: 'Active',
    className: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  completed: {
    label: 'Completed',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
};

function formatDate(value) {
  if (!value) return 'Not scheduled';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Not scheduled';

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function dateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

function getItems(response) {
  return response?.data?.items || response?.items || [];
}

function StatusBadge({ status }) {
  const meta =
    STATUS_META[status] || {
      label: status || 'Unknown',
      className: 'bg-slate-100 text-slate-600 border-slate-200',
    };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
      </div>
    </div>
  );
}

export default function TpoPlacementDrives() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewDate, setReviewDate] = useState('');
  const [companies, setCompanies] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [requestForm, setRequestForm] = useState({ company: '', job: '', proposedDate: '', eligibility: '' });
  const [requestBusy, setRequestBusy] = useState(false);
  const [requestNotice, setRequestNotice] = useState('');

  const loadDrives = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      setError('');

      const response = await tpoApi.placementDrives();
      setDrives(getItems(response));
    } catch (err) {
      setError(err?.message || 'Unable to load placement drives.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDrives();
    Promise.all([tpoApi.companies(), tpoApi.internships()]).then(([companyResponse, jobResponse]) => {
      setCompanies(getItems(companyResponse));
      setOpportunities(getItems(jobResponse));
    }).catch((err) => setError(err?.message || 'Unable to load companies and jobs.'));
  }, []);

  const requestDrive = async (event) => {
    event.preventDefault();
    if (!requestForm.company || !requestForm.job) {
      setError('Select a company and published job before requesting a drive.');
      return;
    }
    try {
      setRequestBusy(true); setError(''); setRequestNotice('');
      await tpoApi.requestPlacementDrive(requestForm);
      setRequestNotice('Drive request sent to the company.');
      setRequestForm({ company: '', job: '', proposedDate: '', eligibility: '' });
      await loadDrives(true);
    } catch (err) {
      setError(err?.message || 'Unable to request placement drive.');
    } finally { setRequestBusy(false); }
  };

  const stats = useMemo(() => {
    const requested = drives.filter(
      (drive) => drive.status === 'requested'
    ).length;

    const upcoming = drives.filter((drive) => {
      if (!drive.scheduledDate) return false;

      return (
        new Date(drive.scheduledDate) >= new Date() &&
        ['approved', 'rescheduled', 'active'].includes(drive.status)
      );
    }).length;

    const active = drives.filter(
      (drive) => drive.status === 'active'
    ).length;

    const completed = drives.filter(
      (drive) => drive.status === 'completed'
    ).length;

    return {
      total: drives.length,
      requested,
      upcoming,
      active,
      completed,
    };
  }, [drives]);

  const filteredDrives = useMemo(() => {
    const query = search.trim().toLowerCase();

    return drives.filter((drive) => {
      const companyName =
        drive.company?.name ||
        drive.companyName ||
        '';

      const jobTitle =
        drive.job?.title ||
        drive.title ||
        '';

      const matchesSearch =
        !query ||
        companyName.toLowerCase().includes(query) ||
        jobTitle.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        drive.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [drives, search, statusFilter]);

  const reviewDrive = async (status) => {
    if (!selectedDrive) return;

    try {
      setReviewing(true);
      setReviewError('');

      await tpoApi.reviewPlacementDrive(selectedDrive._id, {
        status,
        ...(['approved', 'rescheduled'].includes(status) && reviewDate
          ? { scheduledDate: new Date(`${reviewDate}T09:00:00`).toISOString() }
          : {}),
      });

      setSelectedDrive(null);
      await loadDrives(true);
    } catch (err) {
      setReviewError(
        err?.message || 'Unable to update the placement drive.'
      );
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Placement Drives
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review company placement requests and manage campus drives.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadDrives(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      {(error || requestNotice) && <div className={`rounded-xl border p-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{error || requestNotice}</div>}

      <form className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={requestDrive}>
        <h2 className="font-semibold text-slate-900">Request a drive from a company</h2>
        <p className="mt-1 text-sm text-slate-500">Choose a published company job and send the request to its recruiter.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <select aria-label="Company" className="input" value={requestForm.company} onChange={(event) => setRequestForm({ ...requestForm, company: event.target.value, job: '' })}>
            <option value="">Select company</option>
            {companies.map((company) => <option key={company._id} value={company._id}>{company.name}</option>)}
          </select>
          <select aria-label="Published job" className="input" value={requestForm.job} onChange={(event) => setRequestForm({ ...requestForm, job: event.target.value })}>
            <option value="">Select published job</option>
            {opportunities.filter((job) => !requestForm.company || String(job.company?._id) === String(requestForm.company)).map((job) => <option key={job._id} value={job._id}>{job.title}</option>)}
          </select>
          <input aria-label="Proposed date" className="input" type="date" value={requestForm.proposedDate} onChange={(event) => setRequestForm({ ...requestForm, proposedDate: event.target.value })} />
          <input className="input" placeholder="Eligibility" value={requestForm.eligibility} onChange={(event) => setRequestForm({ ...requestForm, eligibility: event.target.value })} />
        </div>
        <button className="btn-primary mt-4" disabled={requestBusy}>{requestBusy ? 'Sending...' : 'Request placement drive'}</button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={CalendarDays}
          label="Total Drives"
          value={stats.total}
        />

        <StatCard
          icon={Clock3}
          label="Pending Requests"
          value={stats.requested}
        />

        <StatCard
          icon={CalendarDays}
          label="Upcoming"
          value={stats.upcoming}
        />

        <StatCard
          icon={CheckCircle2}
          label="Active"
          value={stats.active}
        />

        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats.completed}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search company or drive..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none"
          >
            <option value="all">All statuses</option>
            {Object.entries(STATUS_META).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading placement drives...
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => loadDrives()}
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        ) : filteredDrives.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No placement drives found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Company drive requests will appear here when available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Company
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Drive
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Proposed
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Scheduled
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
                {filteredDrives.map((drive) => {
                  const companyName =
                    drive.company?.name ||
                    drive.companyName ||
                    'Company';

                  const title =
                    drive.job?.title ||
                    drive.title ||
                    'Placement Drive';

                  return (
                    <tr
                      key={drive._id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {companyName}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">
                          {title}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(drive.proposedDate)}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(drive.scheduledDate)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={drive.status} />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => { setSelectedDrive(drive); setReviewDate(dateInputValue(drive.scheduledDate || drive.proposedDate)); setReviewError(''); }}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Review Placement Drive
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedDrive.company?.name || 'Company'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDrive(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Drive
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {selectedDrive.job?.title ||
                    selectedDrive.title ||
                    'Placement Drive'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500">Proposed date</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatDate(selectedDrive.proposedDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Scheduled date</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatDate(selectedDrive.scheduledDate)}
                  </p>
                </div>
              </div>

              <label className="block">
                <span className="text-xs font-semibold text-slate-500">TPO scheduled date</span>
                <input
                  type="date"
                  value={reviewDate}
                  onChange={(event) => setReviewDate(event.target.value)}
                  disabled={['completed','rejected','cancelled'].includes(selectedDrive.status)}
                  className="input mt-2 w-full"
                />
              </label>

              {selectedDrive.eligibility && (
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    Eligibility
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {selectedDrive.eligibility}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Current status
                </p>

                <div className="mt-2">
                  <StatusBadge status={selectedDrive.status} />
                </div>
              </div>

              {reviewError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {reviewError}
                </div>
              )}

              {selectedDrive.status === 'requested' && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button
                    type="button"
                    disabled={reviewing}
                    onClick={() => reviewDrive('approved')}
                    className="rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    disabled={reviewing}
                    onClick={() => reviewDrive('rescheduled')}
                    className="rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    Reschedule
                  </button>

                  <button
                    type="button"
                    disabled={reviewing}
                    onClick={() => reviewDrive('rejected')}
                    className="rounded-xl bg-red-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              )}

              {['approved','rescheduled','active'].includes(selectedDrive.status) && <div className="flex flex-wrap gap-3">{['rescheduled','active','completed','cancelled'].filter(status=>status!==selectedDrive.status).map(status=><button type="button" key={status} disabled={reviewing} className="btn-ghost border" onClick={()=>reviewDrive(status)}>{status==='rescheduled'?'Reschedule':status==='active'?'Start drive':status==='completed'?'Complete drive':'Cancel drive'}</button>)}</div>}
              {['completed','rejected','cancelled'].includes(selectedDrive.status) && (
                <p className="rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-500">
                  This drive has ended.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



