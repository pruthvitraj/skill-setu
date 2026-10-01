import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Eye, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tpoApi } from '../../services/tpoApi';

const placementStatuses = [
  { value: '', label: 'All placement statuses' },
  { value: 'available', label: 'Available' },
  { value: 'in_process', label: 'In process' },
  { value: 'placed', label: 'Placed' },
  { value: 'not_interested', label: 'Not interested' },
];

const interviewStatuses = [
  { value: '', label: 'All interview statuses' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rescheduled', label: 'Rescheduled' },
];

function StatusBadge({ status }) {
  const styles = {
    available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    in_process: 'bg-blue-50 text-blue-700 border-blue-200',
    placed: 'bg-violet-50 text-violet-700 border-violet-200',
    not_interested: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[status] || 'bg-slate-100 text-slate-600 border-slate-200'
      }`}
    >
      {(status || 'unknown').replaceAll('_', ' ')}
    </span>
  );
}

function Score({ value }) {
  const score = Number(value || 0);

  return (
    <div className="min-w-[110px]">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700">{score}%</span>
      </div>

      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#22488f]"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}

export default function TpoStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  const [filters, setFilters] = useState({
    q: '',
    department: '',
    batch: '',
    skill: '',
    status: '',
    interviewStatus: '',
  });

  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    batches: [],
    skills: [],
  });

  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadStudents(page = 1) {
    setLoading(true);
    setError('');

    try {
      const response = await tpoApi.students({
        ...filters,
        page,
        limit: pagination.limit,
      });

      setStudents(response.data?.items || []);
      setPagination(
        response.data?.pagination || {
          page,
          pages: 1,
          total: 0,
          limit: pagination.limit,
        }
      );
    } catch (err) {
      setError(err?.message || 'Unable to load students.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadFilterOptions() {
    setFilterLoading(true);

    try {
      const response = await tpoApi.studentFilters();

      setFilterOptions({
        departments: response.data?.departments || [],
        batches: response.data?.batches || [],
        skills: response.data?.skills || [],
      });
    } catch {
      setFilterOptions({
        departments: [],
        batches: [],
        skills: [],
      });
    } finally {
      setFilterLoading(false);
    }
  }

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadStudents(1);
  }, [
    filters.q,
    filters.department,
    filters.batch,
    filters.skill,
    filters.status,
    filters.interviewStatus,
  ]);

  function updateFilter(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function clearFilters() {
    setFilters({
      q: '',
      department: '',
      batch: '',
      skill: '',
      status: '',
      interviewStatus: '',
    });
  }

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700">
              TPO Workspace
            </p>

            <h1 className="mt-1 text-4xl font-bold text-[#0f2447]">
              Students
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Search and monitor students belonging to your university,
              including placement status, skills and interview activity.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <Users size={18} className="text-blue-700" />

            <div>
              <p className="text-xs text-slate-500">Students found</p>
              <p className="text-lg font-bold text-[#0f2447]">
                {pagination.total || 0}
              </p>
            </div>
          </div>
        </header>

        <section className="card">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className="input pl-10"
                  value={filters.q}
                  onChange={(event) => updateFilter('q', event.target.value)}
                  placeholder="Search name, email or enrollment number..."
                />
              </div>

              <select
                className="input lg:w-56"
                value={filters.department}
                onChange={(event) =>
                  updateFilter('department', event.target.value)
                }
                disabled={filterLoading}
              >
                <option value="">All departments</option>

                {filterOptions.departments.map((department) => (
                  <option key={department._id} value={department._id}>
                    {department.name}
                  </option>
                ))}
              </select>

              <select
                className="input lg:w-40"
                value={filters.batch}
                onChange={(event) => updateFilter('batch', event.target.value)}
                disabled={filterLoading}
              >
                <option value="">All batches</option>

                {filterOptions.batches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                className="input w-auto min-w-[190px]"
                value={filters.skill}
                onChange={(event) => updateFilter('skill', event.target.value)}
                disabled={filterLoading}
              >
                <option value="">All skills</option>

                {filterOptions.skills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>

              <select
                className="input w-auto min-w-[200px]"
                value={filters.status}
                onChange={(event) =>
                  updateFilter('status', event.target.value)
                }
              >
                {placementStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              <select
                className="input w-auto min-w-[200px]"
                value={filters.interviewStatus}
                onChange={(event) =>
                  updateFilter('interviewStatus', event.target.value)
                }
              >
                {interviewStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn-ghost border border-slate-200"
                >
                  <X size={16} />
                  Clear filters
                </button>
              )}

              <div className="ml-auto hidden items-center gap-2 text-xs text-slate-500 lg:flex">
                <SlidersHorizontal size={15} />
                University-scoped filters
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="card overflow-hidden p-0">
          {loading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="h-14 rounded-lg bg-slate-100"
                  />
                ))}
              </div>
            </div>
          ) : students.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <Users size={24} className="text-slate-400" />
              </div>

              <h2 className="mt-4 text-xl font-bold text-[#0f2447]">
                No students found
              </h2>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                No students match the current search and filter criteria.
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn-primary mt-5"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">
                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Student
                      </th>

                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Department
                      </th>

                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Batch
                      </th>

                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Skills
                      </th>

                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Skill score
                      </th>

                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Placement
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((student) => {
                      const user = student.user || {};
                      const name =
                        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                        'Unnamed student';

                      return (
                        <tr
                          key={student._id}
                          className="border-b border-slate-100 transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-sm font-bold text-[#22488f]">
                                {name
                                  .split(' ')
                                  .map((part) => part[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-semibold text-[#0f2447]">
                                  {name}
                                </p>

                                <p className="truncate text-xs text-slate-500">
                                  {user.email || 'No email'}
                                </p>

                                {student.enrollmentNo && (
                                  <p className="mt-0.5 text-xs text-slate-400">
                                    {student.enrollmentNo}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {student.department?.name || 'Not assigned'}
                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-slate-700">
                            {student.batch || '—'}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex max-w-[220px] flex-wrap gap-1.5">
                              {(student.skills || []).slice(0, 3).map((skill) => (
                                <span
                                  key={skill.name}
                                  className="rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700"
                                >
                                  {skill.name}
                                </span>
                              ))}

                              {(student.skills || []).length > 3 && (
                                <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">
                                  +{student.skills.length - 3}
                                </span>
                              )}

                              {!student.skills?.length && (
                                <span className="text-xs text-slate-400">
                                  No skills added
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <Score value={student.skillScore} />
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge status={student.placementStatus} />
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/tpo/students/${student._id}`)
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Eye size={15} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing{' '}
                  <span className="font-semibold text-slate-700">
                    {students.length}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-slate-700">
                    {pagination.total}
                  </span>{' '}
                  students
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1 || loading}
                    onClick={() => loadStudents(pagination.page - 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <span className="px-2 text-sm text-slate-500">
                    Page {pagination.page} of {pagination.pages}
                  </span>

                  <button
                    type="button"
                    disabled={
                      pagination.page >= pagination.pages || loading
                    }
                    onClick={() => loadStudents(pagination.page + 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
