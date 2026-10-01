import { useMemo, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  FileText,
  UserCheck,
  CalendarDays,
  ArrowUpRight,
} from 'lucide-react';

const monthlyApplications = [
  { month: 'Apr', applications: 18, shortlisted: 7, hired: 1 },
  { month: 'May', applications: 24, shortlisted: 10, hired: 2 },
  { month: 'Jun', applications: 31, shortlisted: 13, hired: 2 },
  { month: 'Jul', applications: 38, shortlisted: 16, hired: 3 },
  { month: 'Aug', applications: 46, shortlisted: 20, hired: 4 },
  { month: 'Sep', applications: 52, shortlisted: 24, hired: 3 },
];

const jobPerformance = [
  {
    title: 'Backend Developer',
    applications: 18,
    shortlisted: 8,
    interviews: 4,
    hired: 0,
    status: 'Published',
  },
  {
    title: 'Junior Data Engineer',
    applications: 14,
    shortlisted: 7,
    interviews: 3,
    hired: 0,
    status: 'Published',
  },
];

const skillDemand = [
  { skill: 'JavaScript', demand: 18 },
  { skill: 'React', demand: 15 },
  { skill: 'Node.js', demand: 13 },
  { skill: 'Python', demand: 11 },
  { skill: 'SQL', demand: 10 },
];

const funnel = [
  { label: 'Applications', value: 32 },
  { label: 'Shortlisted', value: 15 },
  { label: 'Interviews', value: 7 },
  { label: 'Selected', value: 2 },
  { label: 'Hired', value: 0 },
];

export default function CompanyAnalytics() {
  const [period, setPeriod] = useState('6 months');

  const totals = useMemo(() => ({
    applications: monthlyApplications.reduce((sum, item) => sum + item.applications, 0),
    shortlisted: monthlyApplications.reduce((sum, item) => sum + item.shortlisted, 0),
    hired: monthlyApplications.reduce((sum, item) => sum + item.hired, 0),
  }), []);

  const maxApplications = Math.max(...monthlyApplications.map((item) => item.applications));

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              Company Workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[#0f2447]">Analytics</h1>
            <p className="mt-2 text-slate-600">
              Track hiring performance, candidate conversion and job activity.
            </p>
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none"
          >
            <option>6 months</option>
            <option>12 months</option>
            <option>Current year</option>
          </select>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['Total Applications', totals.applications, FileText, '+18%', 'vs previous period'],
            ['Shortlisted', totals.shortlisted, UserCheck, '+12%', 'vs previous period'],
            ['Interviews', 7, CalendarDays, '+9%', 'vs previous period'],
            ['Hired', totals.hired, Users, '+25%', 'vs previous period'],
          ].map(([label, value, Icon, change, sub]) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
                </div>
                <div className="rounded-xl bg-slate-100 p-3 text-[#0f2447]">
                  <Icon size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="font-semibold text-emerald-600">{change}</span>
                <span className="text-slate-400">{sub}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0f2447]">Application Trends</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Applications received over the selected period.
                </p>
              </div>
              <TrendingUp size={21} className="text-[#22488f]" />
            </div>

            <div className="mt-8 flex h-64 items-end gap-3 md:gap-6">
              {monthlyApplications.map((item) => (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">
                    {item.applications}
                  </span>
                  <div className="flex w-full items-end justify-center">
                    <div
                      className="w-full max-w-12 rounded-t-md bg-[#22488f] transition-all"
                      style={{
                        height: `${Math.max(18, (item.applications / maxApplications) * 180)}px`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#0f2447]">Hiring Funnel</h2>
            <p className="mt-1 text-sm text-slate-500">
              Candidate progression across your hiring process.
            </p>

            <div className="mt-7 space-y-5">
              {funnel.map((item, index) => (
                <div key={item.label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="font-bold text-slate-900">{item.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#22488f]"
                      style={{ width: `${Math.max(5, (item.value / funnel[0].value) * 100)}%` }}
                    />
                  </div>
                  {index < funnel.length - 1 && (
                    <p className="mt-1 text-right text-[11px] text-slate-400">
                      {Math.round((funnel[index + 1].value / item.value) * 100) || 0}% conversion
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Briefcase size={21} className="text-[#22488f]" />
              <div>
                <h2 className="text-lg font-bold text-[#0f2447]">Job Performance</h2>
                <p className="text-sm text-slate-500">Performance by active posting.</p>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-3">Job</th>
                    <th className="pb-3">Apps</th>
                    <th className="pb-3">Shortlisted</th>
                    <th className="pb-3">Interviews</th>
                  </tr>
                </thead>
                <tbody>
                  {jobPerformance.map((job) => (
                    <tr key={job.title} className="border-b border-slate-50 last:border-0">
                      <td className="py-4 font-semibold text-slate-800">{job.title}</td>
                      <td className="py-4 text-slate-600">{job.applications}</td>
                      <td className="py-4 text-slate-600">{job.shortlisted}</td>
                      <td className="py-4 text-slate-600">{job.interviews}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#0f2447]">Candidate Skill Demand</h2>
            <p className="mt-1 text-sm text-slate-500">
              Most requested skills across your current jobs.
            </p>

            <div className="mt-6 space-y-5">
              {skillDemand.map((item) => (
                <div key={item.skill}>
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm font-medium text-slate-700">{item.skill}</span>
                    <span className="text-xs font-semibold text-slate-500">
                      {item.demand} candidates
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-[#22488f]"
                      style={{ width: `${(item.demand / 18) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-blue-100 bg-[#eef2ff] p-5">
          <div className="flex items-start gap-3">
            <BarChart3 className="mt-0.5 text-[#22488f]" size={21} />
            <div>
              <p className="font-semibold text-[#0f2447]">Demo analytics data</p>
              <p className="mt-1 text-sm text-slate-600">
                These metrics are seeded demonstration values for the Company workspace.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
