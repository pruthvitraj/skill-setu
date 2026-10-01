
import { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BarChart3,
  Brain,
  CheckCircle2,
  GraduationCap,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { tpoApi } from '../../services/tpoApi';

function StatCard({ icon: Icon, label, value, helper, accent = 'blue' }) {
  const accents = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    purple: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
  };

  return (
    <div className="card transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#0f2447]">
            {value}
          </p>
          {helper && (
            <p className="mt-1 text-xs text-slate-500">{helper}</p>
          )}
        </div>

        <div className={`rounded-xl p-3 ${accents[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
      <div className="text-center">
        <Brain className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-3 text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}

function ScoreBadge({ score }) {
  const value = Number(score || 0);

  let className = 'bg-red-50 text-red-700 border-red-200';

  if (value >= 80) {
    className = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (value >= 65) {
    className = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-bold ${className}`}
    >
      {value}%
    </span>
  );
}

export default function TpoSkills() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');

    try {
      const response = await tpoApi.skills();
      setData(response.data);
    } catch (requestError) {
      setError(
        requestError?.message || 'Unable to load skill analytics.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const distribution = useMemo(() => {
    return [...(data?.distribution || [])]
      .map((item) => ({
        ...item,
        avg: Number(item.avg ?? item.average ?? item.score ?? 0),
        count: Number(item.count ?? item.students ?? item.total ?? 0),
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [data]);

  const averageScore = useMemo(() => {
    if (!distribution.length) return 0;

    const total = distribution.reduce(
      (sum, item) => sum + Number(item.avg || 0),
      0
    );

    return Math.round(total / distribution.length);
  }, [distribution]);

  const strongestSkill = distribution[0];

  const skillGaps = data?.skillGaps || [];

  const pieColors = [
    '#22488f',
    '#17806d',
    '#7c3aed',
    '#d97706',
    '#0891b2',
    '#475569',
    '#be123c',
    '#15803d',
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-4 w-96 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="card h-32 animate-pulse bg-slate-100"
            />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="card h-96 animate-pulse bg-slate-100" />
          <div className="card h-96 animate-pulse bg-slate-100" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-200">
        <p className="font-semibold text-red-700">
          Unable to load skill analytics
        </p>

        <p className="mt-1 text-sm text-red-600">{error}</p>

        <button className="btn-primary mt-4" onClick={load}>
          Retry
        </button>
      </div>
    );
  }

  const hasData = distribution.length > 0;

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">
      <section>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700">
              TPO Workspace
            </p>

            <h1 className="mt-1 text-4xl font-bold tracking-tight text-[#0f2447]">
              Skill Analytics
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Monitor university-wide skill strength, assessment coverage,
              capability gaps and training priorities.
            </p>
          </div>

          <button
            className="btn-ghost inline-flex items-center gap-2"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw size={15} />
            Refresh analytics
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Students Analyzed"
          value={data?.studentCount ?? 0}
          helper="University-wide student population"
          accent="blue"
        />

        <StatCard
          icon={CheckCircle2}
          label="Assessment Participation"
          value={`${data?.participation ?? 0}%`}
          helper="Students with skill assessment data"
          accent="green"
        />

        <StatCard
          icon={BarChart3}
          label="Average Skill Score"
          value={`${averageScore}%`}
          helper="Across tracked skills"
          accent="purple"
        />

        <StatCard
          icon={Target}
          label="Skill Gaps"
          value={skillGaps.length}
          helper="Areas requiring training attention"
          accent="amber"
        />
      </section>

      {!hasData ? (
        <div className="card">
          <EmptyState message="No skill assessment data is available yet." />
        </div>
      ) : (
        <>
          <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
            <div className="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#0f2447]">
                    University Skill Distribution
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Average competency score across tracked skills.
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                  <BarChart3 size={19} />
                </div>
              </div>

              <div className="mt-6 h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={distribution}
                    margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="skill"
                      tick={{ fontSize: 11 }}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={70}
                    />

                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11 }}
                    />

                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Average Score']}
                    />

                    <Bar
                      dataKey="avg"
                      name="Average score"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div>
                <h2 className="text-xl font-bold text-[#0f2447]">
                  Skill Coverage
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Number of students represented by each skill.
                </p>
              </div>

              <div className="mt-4 h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution}
                      dataKey="count"
                      nameKey="skill"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={60}
                      paddingAngle={2}
                    >
                      {distribution.map((entry, index) => (
                        <Cell
                          key={`${entry.skill}-${index}`}
                          fill={pieColors[index % pieColors.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value, name) => [
                        value,
                        `${name} students`,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {distribution.slice(0, 6).map((item, index) => (
                  <div
                    key={item.skill}
                    className="flex items-center gap-2 text-xs text-slate-600"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          pieColors[index % pieColors.length],
                      }}
                    />

                    <span className="truncate">{item.skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#0f2447]">
                    Strongest Skills
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Skills with the highest average competency.
                  </p>
                </div>

                <TrendingUp className="text-emerald-600" size={21} />
              </div>

              <div className="mt-5 space-y-3">
                {(data?.top || []).slice(0, 5).map((item, index) => (
                  <div
                    key={`${item.skill}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-700">
                        {index + 1}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.skill}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {item.count ?? item.students ?? 0} students assessed
                        </p>
                      </div>
                    </div>

                    <ScoreBadge score={item.avg} />
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#0f2447]">
                    Skill Gap Analysis
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Priority areas for university-level training.
                  </p>
                </div>

                <TrendingDown className="text-amber-600" size={21} />
              </div>

              <div className="mt-5 space-y-4">
                {skillGaps.length ? (
                  skillGaps.slice(0, 5).map((item, index) => (
                    <div key={`${item.skill}-${index}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.skill}
                          </p>

                          <p className="text-xs text-slate-500">
                            Training gap
                          </p>
                        </div>

                        <span className="font-bold text-amber-700">
                          {item.gap}%
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{
                            width: `${Math.min(100, Math.max(0, item.gap))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState message="No skill gaps identified." />
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#0f2447]">
                    Department Comparison
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Placement readiness by department.
                  </p>
                </div>

                <GraduationCap className="text-blue-600" size={21} />
              </div>

              <div className="mt-6 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data?.departmentComparison || []}
                    margin={{ top: 10, right: 10, left: -15, bottom: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="department"
                      tick={{ fontSize: 11 }}
                    />

                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11 }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="rate"
                      name="Placement readiness %"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#0f2447]">
                    Batch Comparison
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Average skill performance across graduating batches.
                  </p>
                </div>

                <Award className="text-violet-600" size={21} />
              </div>

              <div className="mt-6 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data?.batchComparison || []}
                    margin={{ top: 10, right: 10, left: -15, bottom: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="batch"
                      tick={{ fontSize: 11 }}
                    />

                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11 }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="averageScore"
                      name="Average skill score"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#0f2447]">
                  Skill Intelligence
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Snapshot of the university's current technical capability.
                </p>
              </div>

              {strongestSkill && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Strongest tracked skill
                  </p>

                  <p className="mt-1 font-bold text-emerald-900">
                    {strongestSkill.skill} · {strongestSkill.avg}%
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Coverage
                </p>
                <p className="mt-2 text-2xl font-bold text-[#0f2447]">
                  {data?.participation ?? 0}%
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Assessment participation
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Skill breadth
                </p>
                <p className="mt-2 text-2xl font-bold text-[#0f2447]">
                  {distribution.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Tracked competencies
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Training priorities
                </p>
                <p className="mt-2 text-2xl font-bold text-[#0f2447]">
                  {skillGaps.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Identified skill gaps
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

