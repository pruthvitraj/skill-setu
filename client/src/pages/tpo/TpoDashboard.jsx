import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BriefcaseBusiness, Building2, CalendarDays, CheckCircle2, GraduationCap, Users, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { tpoApi } from '../../services/tpoApi';

const cards = [
  { key: 'totalStudents', label: 'Total Students', icon: Users, href: '/tpo/students' },
  { key: 'placed', label: 'Placed', icon: CheckCircle2, href: '/tpo/placement-analytics' },
  { key: 'available', label: 'Available', icon: GraduationCap, href: '/tpo/students' },
  { key: 'interviews', label: 'Interviews', icon: Video, href: '/tpo/interviews' },
  { key: 'upcomingDrives', label: 'Placement Drives', icon: CalendarDays, href: '/tpo/placement-drives' },
  { key: 'companies', label: 'Companies', icon: Building2, href: '/tpo/companies' },
];

function getData(response) {
  return response?.data?.data || response?.data || {};
}

function StatCard({ card, value }) {
  const Icon = card.icon;
  return (
    <Link to={card.href} className="card group transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-[#22488f]">
          <Icon size={20} />
        </div>
        <ArrowRight size={17} className="text-slate-300 transition group-hover:text-[#22488f]" />
      </div>
      <p className="mt-5 text-3xl font-bold tracking-tight text-[#0f2447]">{value ?? '—'}</p>
      <p className="mt-1 text-sm text-slate-500">{card.label}</p>
    </Link>
  );
}

export default function TpoDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [skills, setSkills] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([tpoApi.dashboard(), tpoApi.skills()])
      .then(([dashboardResponse, skillsResponse]) => {
        if (!active) return;
        setDashboard(getData(dashboardResponse));
        setSkills(getData(skillsResponse));
      })
      .catch((err) => {
        if (active) setError(err?.message || 'Unable to load the TPO dashboard.');
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const skillData = useMemo(() => {
    const source = skills?.distribution || skills?.top || skills?.skills || [];
    if (!Array.isArray(source)) return [];
    return source.slice(0, 8).map((item) => ({
      skill: item.skill || item.name || item._id || 'Skill',
      students: Number(item.count ?? item.students ?? item.total ?? 0),
    }));
  }, [skills]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map((card) => <div key={card.key} className="card h-36 animate-pulse bg-slate-50" />)}</div>
        <div className="card h-80 animate-pulse bg-slate-50" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#17806d]">TPO Workspace</p>
          <h1 className="mt-1 text-3xl font-bold text-[#0f2447]">Placement overview</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Monitor students, skills, companies and placement activity from one university-level workspace.</p>
        </div>
        <Link to="/tpo/placement-drives" className="btn btn-primary shrink-0">Manage placement drives <ArrowRight size={16} /></Link>
      </header>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#0f2447]">Today&apos;s coordination</h2>
            <p className="mt-1 text-sm text-slate-500">Choose the placement task that needs attention first.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/tpo/placement-drives" className="btn btn-primary btn-sm">Review drives <ArrowRight size={15} /></Link>
            <Link to="/tpo/students" className="btn btn-ghost btn-sm">Review students</Link>
            <Link to="/tpo/announcements" className="btn btn-ghost btn-sm">Publish announcement</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => <StatCard key={card.key} card={card} value={dashboard?.[card.key]} />)}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="card min-h-[360px]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#0f2447]">University skill landscape</h2>
              <p className="mt-1 text-sm text-slate-500">Current skill participation across students.</p>
            </div>
            <Link to="/tpo/skills" className="text-sm font-semibold text-[#22488f] hover:underline">View analytics</Link>
          </div>
          <div className="mt-6 h-[270px]">
            {skillData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="skill" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="students" name="Students" fill="#22488f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">No skill analytics available yet.</div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><BriefcaseBusiness size={21} /></div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Placement rate</p>
                <p className="mt-1 text-3xl font-bold text-[#0f2447]">{dashboard?.placementRate ?? 0}%</p>
                <p className="mt-1 text-xs text-slate-500">Based on students currently marked as placed.</p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
