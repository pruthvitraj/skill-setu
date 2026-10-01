import { useEffect, useMemo, useState } from 'react';
import {
  TrendingUp,
  Users,
  Briefcase,
  FileText,
  UserCheck,
  CalendarDays,
} from 'lucide-react';
import { companyApi } from '../../services/companyApi';

export default function CompanyAnalytics() {
  const [period, setPeriod] = useState('6 months');
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');

  const monthlyApplications = dashboard?.monthlyApplications || [];
  const jobPerformance = dashboard?.jobPerformance || [];
  const skillDemand = dashboard?.skillDemand || [];
  const funnel = dashboard?.funnel || [];

  const totals = useMemo(() => ({
    applications: dashboard?.applications || 0,
    shortlisted: dashboard?.shortlisted || 0,
    interviews: dashboard?.interviews || 0,
    hired: dashboard?.hired || 0,
  }), [dashboard]);

  const maxApplications = Math.max(1, ...monthlyApplications.map((item) => item.applications));

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
            ['Total Applications', totals.applications, FileText],
            ['Shortlisted', totals.shortlisted, UserCheck],
            ['Interviews', totals.interviews, CalendarDays],
            ['Hired', totals.hired, Users],
          ].map(([label, value, Icon]) => (
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
                      style={{ width: `${funnel[0]?.value ? Math.max(5, (item.value / funnel[0].value) * 100) : 0}%` }}
                    />
                  </div>
                  {index < funnel.length - 1 && (
                    <p className="mt-1 text-right text-[11px] text-slate-400">
                      {item.value ? Math.round((funnel[index + 1].value / item.value) * 100) : 0}% conversion
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

        {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      </div>
    </div>
  );
}
