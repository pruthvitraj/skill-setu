import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Download,
  GraduationCap,
  Loader2,
  RefreshCw,
  Search,
  Users,
  XCircle,
} from 'lucide-react';
import { tpoApi } from '../../services/tpoApi';

const TYPES = [
  ['placement', 'Placement Report', BarChart3],
  ['department', 'Department Report', GraduationCap],
  ['company', 'Company Report', Building2],
  ['internship', 'Internship Report', CalendarDays],
  ['drive', 'Drive Report', ClipboardList],
  ['interview', 'Interview Report', Users],
  ['student', 'Student Report', GraduationCap],
];

function unwrap(response) {
  if (!response) return null;
  return response.data ?? response;
}

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

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

function statusClass(status) {
  const value = String(status || '').toLowerCase();

  if (
    ['selected', 'hired', 'placed', 'completed', 'accepted', 'active'].some(
      (item) => value.includes(item)
    )
  ) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  if (
    ['rejected', 'failed', 'cancelled', 'declined'].some((item) =>
      value.includes(item)
    )
  ) {
    return 'bg-red-50 text-red-700 border-red-200';
  }

  if (
    ['pending', 'scheduled', 'shortlisted', 'assessment', 'review'].some(
      (item) => value.includes(item)
    )
  ) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return 'bg-slate-50 text-slate-600 border-slate-200';
}

function StatCard({ label, value, icon: Icon, helper }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {value ?? 0}
          </p>
          {helper && (
            <p className="mt-1 text-xs text-slate-400">{helper}</p>
          )}
        </div>

        {Icon && (
          <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ value }) {
  if (!value) return <span className="text-slate-400">—</span>;

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(
        value
      )}`}
    >
      {titleCase(value)}
    </span>
  );
}

function ProgressBar({ value }) {
  const numeric = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-slate-900 transition-all"
        style={{ width: `${numeric}%` }}
      />
    </div>
  );
}

function Section({ title, subtitle, children, action }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
        {action}
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

function PrimitiveValue({ value, field }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-slate-400">—</span>;
  }

  if (
    field?.toLowerCase().includes('date') ||
    field?.toLowerCase().includes('at')
  ) {
    return <span>{formatDate(value)}</span>;
  }

  if (field?.toLowerCase().includes('status')) {
    return <StatusBadge value={value} />;
  }

  return <span>{String(value)}</span>;
}

function GenericReport({ data }) {
  if (!data || typeof data !== 'object') {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
        No report data available.
      </div>
    );
  }

  const summary = data.summary || {};
  const summaryEntries = Object.entries(summary).filter(
    ([, value]) => value !== null && value !== undefined
  );

  const sections = Object.entries(data).filter(
    ([key]) => key !== 'summary' && key !== 'generatedAt' && key !== 'type'
  );

  return (
    <div className="space-y-6">
      {summaryEntries.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryEntries.map(([key, value], index) => (
            <StatCard
              key={key}
              label={titleCase(key)}
              value={
                typeof value === 'number'
                  ? value.toLocaleString('en-IN')
                  : String(value)
              }
              icon={
                [Users, CheckCircle2, ClipboardList, BarChart3][index % 4]
              }
            />
          ))}
        </div>
      )}

      {sections.length > 0 && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {sections.map(([key, value]) => {
            if (Array.isArray(value)) {
              return (
                <Section
                  key={key}
                  title={titleCase(key)}
                  subtitle={`${value.length} record${
                    value.length === 1 ? '' : 's'
                  }`}
                >
                  {value.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-400">
                      No records available.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[520px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                            {Object.keys(value[0] || {})
                              .filter((field) => field !== '_id' && field !== 'id')
                              .slice(0, 8)
                              .map((field) => (
                                <th key={field} className="px-3 py-3 font-semibold">
                                  {titleCase(field)}
                                </th>
                              ))}
                          </tr>
                        </thead>

                        <tbody>
                          {value.map((row, rowIndex) => (
                            <tr
                              key={row.id || row._id || rowIndex}
                              className="border-b border-slate-50 last:border-0"
                            >
                              {Object.entries(row)
                                .filter(
                                  ([field]) =>
                                    field !== '_id' && field !== 'id'
                                )
                                .slice(0, 8)
                                .map(([field, cell]) => (
                                  <td
                                    key={field}
                                    className="px-3 py-3 align-top text-slate-700"
                                  >
                                    {typeof cell === 'object' ? (
                                      JSON.stringify(cell)
                                    ) : (
                                      <PrimitiveValue
                                        field={field}
                                        value={cell}
                                      />
                                    )}
                                  </td>
                                ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Section>
              );
            }

            if (value && typeof value === 'object') {
              return (
                <Section key={key} title={titleCase(key)}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {Object.entries(value).map(([field, cell]) => (
                      <div
                        key={field}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {titleCase(field)}
                        </p>
                        <div className="mt-2 font-semibold text-slate-800">
                          {typeof cell === 'object'
                            ? JSON.stringify(cell)
                            : <PrimitiveValue field={field} value={cell} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              );
            }

            return (
              <Section key={key} title={titleCase(key)}>
                <p className="text-lg font-semibold text-slate-800">
                  <PrimitiveValue field={key} value={value} />
                </p>
              </Section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StudentReport({ data }) {
  const student = data?.student || {};
  const user = student.user || {};

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    student.name ||
    'Student';

  const skills = Array.isArray(data?.skills) ? data.skills : [];
  const assessments = Array.isArray(data?.assessments)
    ? data.assessments
    : [];
  const applications = Array.isArray(data?.applications)
    ? data.applications
    : [];
  const interviews = Array.isArray(data?.interviews) ? data.interviews : [];
  const timeline = Array.isArray(data?.timeline) ? data.timeline : [];

  const counts = data?.applicationCounts || {};

  return (
    <div className="space-y-6">
      <Section
        title="Student Profile"
        subtitle="Academic identity and placement information"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-2xl font-bold text-white">
            {fullName
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div className="flex-1">
            <h3 className="text-2xl font-bold text-slate-950">{fullName}</h3>

            <p className="mt-1 text-sm text-slate-500">
              {user.email || student.email || 'Email not available'}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {student.department?.name && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {student.department.name}
                </span>
              )}

              {student.batch && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  Batch {student.batch}
                </span>
              )}

              {student.placementStatus && (
                <StatusBadge value={student.placementStatus} />
              )}
            </div>
          </div>
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Skills Tracked" value={skills.length} icon={BarChart3} />
        <StatCard
          label="Assessment Average"
          value={`${data?.averageAssessmentScore ?? 0}%`}
          icon={ClipboardList}
        />
        <StatCard
          label="Applications"
          value={counts.total ?? applications.length}
          icon={Users}
        />
        <StatCard
          label="Interviews"
          value={interviews.length}
          icon={CalendarDays}
        />
      </div>

      <Section
        title="Career Progress"
        subtitle="Current placement and assessment indicators"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Shortlisted</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">
              {counts.shortlisted ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Selected</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">
              {counts.selected ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Skill Growth</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">
              {data?.skillGrowth > 0 ? '+' : ''}
              {data?.skillGrowth ?? 0}
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Skill Performance"
        subtitle="Tracked skills and latest scores"
      >
        {skills.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
            No skill scores have been recorded for this student.
          </div>
        ) : (
          <div className="space-y-5">
            {skills.map((skill, index) => (
              <div key={skill.skill || index}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {skill.skill || 'Skill'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {titleCase(skill.level || 'beginner')}
                    </p>
                  </div>

                  <span className="font-bold text-slate-900">
                    {skill.score ?? 0}%
                  </span>
                </div>

                <ProgressBar value={skill.score} />
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Assessment History"
        subtitle="Recorded assessment attempts"
      >
        {assessments.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            No assessment attempts recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-3">Assessment</th>
                  <th className="px-3 py-3">Skill</th>
                  <th className="px-3 py-3">Score</th>
                  <th className="px-3 py-3">Difficulty</th>
                  <th className="px-3 py-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {assessments.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="px-3 py-4 font-medium text-slate-800">
                      {item.assessment || 'Assessment'}
                    </td>
                    <td className="px-3 py-4 text-slate-600">
                      {item.skill || '—'}
                    </td>
                    <td className="px-3 py-4 font-semibold text-slate-800">
                      {item.score ?? 0}%
                    </td>
                    <td className="px-3 py-4 text-slate-600">
                      {titleCase(item.difficulty || '—')}
                    </td>
                    <td className="px-3 py-4 text-slate-500">
                      {formatDate(item.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section
        title="Placement Applications"
        subtitle="Student placement activity"
      >
        {applications.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            No placement applications recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-3">Job</th>
                  <th className="px-3 py-3">Company</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Match</th>
                  <th className="px-3 py-3">Applied</th>
                </tr>
              </thead>

              <tbody>
                {applications.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="px-3 py-4 font-medium text-slate-800">
                      {item.job || 'Job'}
                    </td>
                    <td className="px-3 py-4 text-slate-600">
                      {item.company || 'Company'}
                    </td>
                    <td className="px-3 py-4">
                      <StatusBadge value={item.status} />
                    </td>
                    <td className="px-3 py-4 font-semibold text-slate-700">
                      {item.matchScore == null ? '—' : `${item.matchScore}%`}
                    </td>
                    <td className="px-3 py-4 text-slate-500">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Interviews" subtitle="Interview activity and outcomes">
        {interviews.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            No interviews recorded.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {interviews.map((item, index) => (
              <div
                key={item.id || index}
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {item.job || 'Job'}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.round ? `Round: ${item.round}` : 'Interview'}
                    </p>
                  </div>

                  <StatusBadge value={item.status} />
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                  <span>
                    Scheduled: {formatDate(item.scheduledAt)}
                  </span>
                  {item.result && (
                    <span>Result: {titleCase(item.result)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Education" subtitle="Academic information">
        {student.education ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Object.entries(student.education).map(([key, value]) => (
              <div
                key={key}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {titleCase(key)}
                </p>
                <p className="mt-2 font-semibold text-slate-800">
                  {typeof value === 'object'
                    ? JSON.stringify(value)
                    : String(value ?? '—')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            Education details are not available.
          </p>
        )}
      </Section>

      <Section title="Projects" subtitle="Projects recorded in the student profile">
        {Array.isArray(student.projects) && student.projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {student.projects.map((project, index) => (
              <div
                key={project._id || index}
                className="rounded-xl border border-slate-200 p-5"
              >
                <h3 className="font-semibold text-slate-900">
                  {project.title || 'Project'}
                </h3>

                {project.description && (
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {project.description}
                  </p>
                )}

                {Array.isArray(project.skills) && project.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No projects recorded.</p>
        )}
      </Section>

      <Section
        title="Certifications"
        subtitle="Certifications recorded in the student profile"
      >
        {Array.isArray(student.certifications) &&
        student.certifications.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {student.certifications.map((certificate, index) => (
              <div
                key={certificate._id || index}
                className="rounded-xl border border-slate-200 p-5"
              >
                <p className="font-semibold text-slate-900">
                  {certificate.name || 'Certification'}
                </p>

                {certificate.issuer && (
                  <p className="mt-1 text-sm text-slate-500">
                    {certificate.issuer}
                  </p>
                )}

                <p className="mt-3 text-xs text-slate-400">
                  {formatDate(certificate.issuedAt)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            No certifications recorded.
          </p>
        )}
      </Section>

      <Section title="Career Timeline" subtitle="Chronological student activity">
        {timeline.length === 0 ? (
          <p className="text-sm text-slate-400">
            No timeline events recorded.
          </p>
        ) : (
          <div className="relative space-y-5 pl-6">
            <div className="absolute bottom-0 left-2 top-0 w-px bg-slate-200" />

            {timeline
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.date || 0).getTime() -
                  new Date(a.date || 0).getTime()
              )
              .map((event, index) => (
                <div key={event.id || index} className="relative">
                  <div className="absolute -left-[22px] top-1 h-3 w-3 rounded-full border-2 border-white bg-slate-900 shadow" />

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-semibold text-slate-800">
                        {event.title || titleCase(event.type || 'Activity')}
                      </p>
                      <span className="text-xs text-slate-400">
                        {formatDate(event.date)}
                      </span>
                    </div>

                    {event.description && (
                      <p className="mt-1 text-sm text-slate-500">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </Section>
    </div>
  );
}

export default function TpoReports() {
  const [type, setType] = useState('placement');
  const [data, setData] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedType = useMemo(
    () => TYPES.find(([value]) => value === type),
    [type]
  );

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();

    if (!query) return students;

    return students.filter((student) => {
      const user = student.user || {};

      const name =
        [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        student.name ||
        '';

      return `${name} ${user.email || student.email || ''}`
        .toLowerCase()
        .includes(query);
    });
  }, [students, studentSearch]);

  async function loadStudents() {
    try {
      setStudentsLoading(true);

      const response = await tpoApi.students({
        page: 1,
        limit: 100,
      });

      const payload = unwrap(response);

      const items = Array.isArray(payload)
        ? payload
        : payload?.items || payload?.students || [];

      setStudents(items);

      if (!studentId && items.length > 0) {
        setStudentId(items[0]._id || items[0].id || '');
      }
    } catch (err) {
      setError(err?.message || 'Unable to load students.');
    } finally {
      setStudentsLoading(false);
    }
  }

  async function generateReport() {
    try {
      setError('');

      if (type === 'student' && !studentId) {
        setError('Select a student before generating the Student Report.');
        return;
      }

      setLoading(true);

      const response =
        type === 'student'
          ? await tpoApi.studentReportCard(studentId)
          : await tpoApi.reports(type);

      setData(unwrap(response));
    } catch (err) {
      setData(null);
      setError(
        err?.message ||
          err?.error ||
          'Unable to generate the requested report.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    setData(null);
    setError('');
  }, [type]);

  function printReport() {
    window.print();
  }

  const title = selectedType?.[1] || 'Report';

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            TPO Reporting
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Reports
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Generate university-level placement, internship, company,
            interview, drive, department and student reports from live TPO
            data.
          </p>
        </div>

        {data && (
          <button
            type="button"
            onClick={printReport}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Download size={17} />
            Print / Save
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Report Type
            </label>

            <div className="relative">
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400"
              >
                {TYPES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          {type === 'student' ? (
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Student
              </label>

              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={studentSearch}
                  onChange={(event) => setStudentSearch(event.target.value)}
                  placeholder="Search student..."
                  className="mb-2 w-full rounded-xl border border-slate-200 px-9 py-3 text-sm outline-none focus:border-slate-400"
                />

                <select
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  disabled={studentsLoading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-slate-400 disabled:opacity-60"
                >
                  <option value="">
                    {studentsLoading ? 'Loading students...' : 'Select student'}
                  </option>

                  {filteredStudents.map((student) => {
                    const user = student.user || {};
                    const name =
                      [user.firstName, user.lastName]
                        .filter(Boolean)
                        .join(' ') ||
                      student.name ||
                      'Student';

                    return (
                      <option
                        key={student._id || student.id}
                        value={student._id || student.id}
                      >
                        {name} — {user.email || student.email || 'No email'}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          ) : (
            <div className="hidden lg:block" />
          )}

          <button
            type="button"
            onClick={generateReport}
            disabled={loading || (type === 'student' && !studentId)}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <RefreshCw size={17} />
            )}
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        {type === 'student' && (
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <GraduationCap size={14} />
            Student reports are restricted to students belonging to your
            university.
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <XCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Report generation failed</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {!data && !loading && !error && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <BarChart3 size={25} />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-900">
            Ready to generate {title}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Select the report type and generate it using the live TPO reporting
            API.
          </p>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <Loader2
            size={30}
            className="mx-auto animate-spin text-slate-700"
          />
          <p className="mt-4 text-sm font-medium text-slate-600">
            Generating {title}...
          </p>
        </div>
      )}

      {data && !loading && (
        <div id="tpo-report-print-area">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">{title}</h2>
              <p className="text-sm text-slate-500">
                Generated from the TPO reporting API
              </p>
            </div>

            {data.generatedAt && (
              <p className="text-xs text-slate-400">
                Generated {formatDate(data.generatedAt)}
              </p>
            )}
          </div>

          {type === 'student' ? (
            <StudentReport data={data} />
          ) : (
            <GenericReport data={data} />
          )}
        </div>
      )}
    </div>
  );
}
