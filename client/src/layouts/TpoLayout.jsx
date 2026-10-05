import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BarChart3, Bell, BriefcaseBusiness, Building2, CalendarDays, FileBarChart2, GraduationCap, LayoutDashboard, LogOut, Megaphone, Settings, Users, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { path: '/tpo/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tpo/students', label: 'Students', icon: Users },
  { path: '/tpo/challenges', label: 'Company Challenges', icon: ClipboardCheck },
  { path: '/tpo/skills', label: 'Skill Analytics', icon: BarChart3 },
  { path: '/tpo/internships', label: 'Internships', icon: GraduationCap },
  { path: '/tpo/companies', label: 'Companies', icon: Building2 },
  { path: '/tpo/placement-drives', label: 'Placement Drives', icon: CalendarDays },
  { path: '/tpo/applications', label: 'Applications', icon: ClipboardCheck },
  { path: '/tpo/interviews', label: 'Interviews', icon: BriefcaseBusiness },
  { path: '/tpo/placement-analytics', label: 'Placement Analytics', icon: BarChart3 },
  { path: '/tpo/announcements', label: 'Announcements', icon: Megaphone },
  { path: '/tpo/messages', label: 'Messages', icon: Users },
  { path: '/tpo/notifications', label: 'Notifications', icon: Bell },
  { path: '/tpo/reports', label: 'Reports', icon: FileBarChart2 },
];

export default function TpoLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <div className="student-shell" data-role="tpo">
      <aside className="student-sidebar flex flex-col pt-4 px-3 border-r border-slate-200 bg-white">
        <Link className="mb-8 flex items-center gap-2 px-3 text-xl font-bold text-[#0f2447]" to="/tpo/dashboard">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#0f2447] text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          SkillSetu
        </Link>

        <div className="px-3 pb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">TPO Workspace</p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-700">Training & Placement</p>
        </div>

        <nav className="flex-1 flex flex-col gap-1.5" aria-label="TPO workspace">
          {links.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `flex items-center rounded-lg px-3 py-2.5 text-sm transition ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Icon size={19} className="mr-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 pt-3 mt-3">
          <NavLink to="/tpo/settings" className={({ isActive }) => `flex items-center rounded-lg px-3 py-2.5 text-sm transition ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
            <Settings size={19} className="mr-4" />
            Account Settings
          </NavLink>
          <button onClick={handleLogout} className="mt-1 flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
            <LogOut size={19} className="mr-4" />
            Log out
          </button>
        </div>

        <div className="mt-3 rounded-lg bg-slate-50 px-3 py-3">
          <p className="truncate text-sm font-semibold text-slate-800">{user?.firstName || 'TPO'} {user?.lastName || ''}</p>
          <p className="mt-0.5 text-xs text-slate-500">TPO account</p>
        </div>
      </aside>

      <main className="student-content min-w-0">
        {children}
      </main>
    </div>
  );
}
