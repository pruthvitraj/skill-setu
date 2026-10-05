import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { workspaceNavigation, isWorkspaceItemActive } from './workspaceNavigation';

const roleNames = { student: 'Student', recruiter: 'Company', tpo: 'TPO' };
const homePaths = { student: '/student/dashboard', recruiter: '/company/dashboard', tpo: '/tpo/dashboard' };
export default function WorkspaceShell({ role, children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuButton = useRef(null);
  const sidebar = useRef(null);
  const main = useRef(null);
  const restoreMenuFocus = useRef(false);
  const routeKey = `${location.pathname}${location.search}`;
  const previousRoute = useRef(routeKey);

  useEffect(() => {
    if (previousRoute.current !== routeKey) {
      previousRoute.current = routeKey;
      setOpen(false);
      // Move focus out of a dismissed mobile menu to the new page.
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
    // Router may replace the shell on a role page change. Focus the resulting landmark.
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
  return <div className="workspace-shell" data-role={role}>
    <a className="workspace-skip" href="#workspace-main" onClick={event => { event.preventDefault(); main.current?.focus(); main.current?.scrollIntoView({ block: 'start' }); }}>Skip to main content</a>
    <header className="workspace-mobile-bar" inert={open ? '' : undefined}>
      <Link to={homePaths[role]} className="workspace-brand">SkillSetu <span>{roleName}</span></Link>
      <button ref={menuButton} type="button" className="workspace-menu-button" aria-expanded={open} aria-controls="workspace-navigation" onClick={() => setOpen(true)}><Menu size={18} aria-hidden="true" /> Menu</button>
    </header>
    {open && <div className="workspace-backdrop" onClick={closeMenu} aria-hidden="true" />}
    <aside ref={sidebar} id="workspace-navigation" className={`workspace-sidebar${open ? ' is-open' : ''}`} role={open ? 'dialog' : undefined} aria-modal={open ? 'true' : undefined} aria-label={open ? `${roleName} menu` : `${roleName} workspace`} onKeyDown={menuKeys}>
      <div className="workspace-brand-row"><Link className="workspace-brand" to={homePaths[role]} onClick={navigateFromMenu}>SkillSetu <span>{roleName} workspace</span></Link><button data-menu-close type="button" className="workspace-menu-close" onClick={closeMenu} aria-label="Close menu"><X size={20} aria-hidden="true" /></button></div>
      <nav aria-label={`${roleName} workspace`}>
        {workspaceNavigation[role].map(([group, links]) => <section className="workspace-nav-group" key={group} aria-label={group}><h2>{group}</h2>{links.map(item => <Link key={item.path} to={item.path} onClick={navigateFromMenu} aria-current={isWorkspaceItemActive(item, location.pathname) ? 'page' : undefined}>{item.label}</Link>)}</section>)}
      </nav>
      <div className="workspace-account"><p>{user?.firstName} {user?.lastName}</p><button type="button" onClick={handleLogout}>Log out</button></div>
    </aside>
    {/* The workflow subtree stays mounted while the mobile menu opens/closes. */}
    <main id="workspace-main" className="workspace-main" ref={main} tabIndex={-1} inert={open ? '' : undefined}>{children}</main>
  </div>;
}
