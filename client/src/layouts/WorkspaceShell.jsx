import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X,
  LayoutDashboard, TrendingUp, BookOpen, ClipboardCheck, Trophy,
  Lightbulb, ListChecks, UserCircle,
  Briefcase, FileText, CalendarCheck, Video,
  Rss, Users, MessageCircle,
  Bell, Settings,
  // TPO icons
  GraduationCap, BarChart3, Building2, CalendarDays, Megaphone,
  // Company icons
  PenSquare, UsersRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { workspaceNavigation, isWorkspaceItemActive } from './workspaceNavigation';

const roleNames   = { student: 'Student', recruiter: 'Company', tpo: 'TPO' };
const homePaths   = { student: '/student/dashboard', recruiter: '/company/dashboard', tpo: '/tpo/dashboard' };

/* Map paths → Lucide icon */
const pathIcons = {
  // Student
  '/student/dashboard':    LayoutDashboard,
  '/student/roadmap':      TrendingUp,
  '/student/courses':      BookOpen,
  '/student/assessments':  ClipboardCheck,
  '/student/challenges':   Trophy,
  '/student/skills':       Lightbulb,
  '/student/skill-tracker':ListChecks,
  '/student/profile':      UserCircle,
  '/student/marketplace':  Briefcase,
  '/student/applications': FileText,
  '/student/interviews':   Video,
  '/student/resume':       FileText,
  '/student/feed':         Rss,
  '/student/network':      Users,
  '/student/messages':     MessageCircle,
  '/student/notifications':Bell,
  '/student/settings':     Settings,
  // TPO
  '/tpo/dashboard':          LayoutDashboard,
  '/tpo/students':           GraduationCap,
  '/tpo/skills':             BarChart3,
  '/tpo/challenges':         Trophy,
  '/tpo/placement-drives':   CalendarDays,
  '/tpo/companies':          Building2,
  '/tpo/internships':        Briefcase,
  '/tpo/applications':       FileText,
  '/tpo/interviews':         Video,
  '/tpo/announcements':      Megaphone,
  '/tpo/messages':           MessageCircle,
  '/tpo/placement-analytics':BarChart3,
  '/tpo/reports':            FileText,
  '/tpo/notifications':      Bell,
  '/tpo/settings':           Settings,
  // Company / Recruiter
  '/company/dashboard':     LayoutDashboard,
  '/company/applications':  FileText,
  '/company/interviews':    Video,
  '/company/jobs':          Briefcase,
  '/company/challenges':    Trophy,
  '/company/drives':        CalendarDays,
  '/company/network':       Users,
  '/company/messages':      MessageCircle,
  '/company/team':          UsersRound,
  '/company/analytics':     BarChart3,
  '/company/notifications': Bell,
  '/company/settings':      Settings,
};

/* Role brand logos (simple SVG mark) */
function BrandMark({ role }) {
  if (role === 'tpo') return <Building2 size={18} aria-hidden="true" />;
  if (role === 'recruiter') return <Briefcase size={18} aria-hidden="true" />;
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  );
}

export default function WorkspaceShell({ role, children }) {
  const { user, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);
  const menuButton = useRef(null);
  const sidebar    = useRef(null);
  const main       = useRef(null);
  const restoreMenuFocus = useRef(false);
  const routeKey   = `${location.pathname}${location.search}`;
  const previousRoute = useRef(routeKey);

  useEffect(() => {
    if (previousRoute.current !== routeKey) {
      previousRoute.current = routeKey;
      setOpen(false);
      if (open) main.current?.focus();
    }
  }, [routeKey, open]);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 981px)');
    const dismiss = () => { if (media.matches) setOpen(false); };
    media.addEventListener('change', dismiss);
    return () => media.removeEventListener('change', dismiss);
  }, []);

  useEffect(() => {
    if (!open) {
      if (restoreMenuFocus.current) { menuButton.current?.focus(); restoreMenuFocus.current = false; }
      return;
    }
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebar.current?.querySelector('[data-menu-close]')?.focus();
    return () => { document.body.style.overflow = oldOverflow; };
  }, [open]);

  function navigateFromMenu(event) {
    if (!open || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    setOpen(false);
    window.requestAnimationFrame(() => document.getElementById('workspace-main')?.focus());
  }

  function closeMenu() { restoreMenuFocus.current = true; setOpen(false); }

  function menuKeys(event) {
    if (!open) return;
    if (event.key === 'Escape') { event.preventDefault(); closeMenu(); }
    if (event.key === 'Tab') {
      const controls = [...sidebar.current.querySelectorAll('a[href], button:not(:disabled)')];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  }

  async function handleLogout() { await logout(); navigate('/', { replace: true }); }

  const roleName = roleNames[role];
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?';

  return (
    <div className="workspace-shell" data-role={role}>
      {/* Skip link */}
      <a
        className="workspace-skip"
        href="#workspace-main"
        onClick={e => { e.preventDefault(); main.current?.focus(); main.current?.scrollIntoView({ block: 'start' }); }}
      >
        Skip to main content
      </a>

      {/* Mobile top bar */}
      <header className="workspace-mobile-bar" inert={open ? '' : undefined}>
        <Link to={homePaths[role]} className="workspace-brand">
          <BrandMark role={role} />
          SkillSetu <span>{roleName}</span>
        </Link>
        <button
          ref={menuButton}
          type="button"
          className="workspace-menu-button"
          aria-expanded={open}
          aria-controls="workspace-navigation"
          onClick={() => setOpen(true)}
        >
          <Menu size={18} aria-hidden="true" /> Menu
        </button>
      </header>

      {open && <div className="workspace-backdrop" onClick={closeMenu} aria-hidden="true" />}

      {/* Sidebar */}
      <aside
        ref={sidebar}
        id="workspace-navigation"
        className={`workspace-sidebar${open ? ' is-open' : ''}`}
        role={open ? 'dialog' : undefined}
        aria-modal={open ? 'true' : undefined}
        aria-label={open ? `${roleName} menu` : `${roleName} workspace`}
        onKeyDown={menuKeys}
      >
        {/* Brand + close */}
        <div className="workspace-brand-row">
          <Link className="workspace-brand" to={homePaths[role]} onClick={navigateFromMenu}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.12)', flexShrink: 0 }}>
              <BrandMark role={role} />
            </div>
            <div>
              SkillSetu
              <span>{roleName} workspace</span>
            </div>
          </Link>
          <button
            data-menu-close
            type="button"
            className="workspace-menu-close"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Navigation */}
        <nav aria-label={`${roleName} workspace`} style={{ flex: 1 }}>
          {workspaceNavigation[role].map(([group, links]) => (
            <section className="workspace-nav-group" key={group} aria-label={group}>
              <h2>{group}</h2>
              {links.map(item => {
                const active = isWorkspaceItemActive(item, location.pathname);
                const Icon = pathIcons[item.path];
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={navigateFromMenu}
                    aria-current={active ? 'page' : undefined}
                  >
                    {Icon && <Icon size={16} aria-hidden="true" style={{ flexShrink: 0 }} />}
                    {item.label}
                  </Link>
                );
              })}
            </section>
          ))}
        </nav>

        {/* Account */}
        <div className="workspace-account">
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
            {initials}
          </div>
          <p style={{ fontSize: 13 }}>
            {user?.firstName} {user?.lastName}
          </p>
          <button type="button" onClick={handleLogout}>Log out</button>
        </div>
      </aside>

      {/* Main content */}
      <main
        id="workspace-main"
        className="workspace-main"
        ref={main}
        tabIndex={-1}
        inert={open ? '' : undefined}
      >
        {children}
      </main>

      {role === 'student' && (
        <nav className="student-mobile-nav" aria-label="Student shortcuts">
          {[
            ['/student/dashboard', 'Home', LayoutDashboard],
            ['/student/roadmap', 'Learn', BookOpen],
            ['/student/assessments', 'Practice', ClipboardCheck],
            ['/student/marketplace', 'Jobs', Briefcase],
            ['/student/profile', 'Profile', UserCircle],
          ].map(([path, label, Icon]) => (
            <Link key={path} to={path} className={location.pathname === path ? 'is-active' : undefined} aria-current={location.pathname === path ? 'page' : undefined}>
              <Icon size={17} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
