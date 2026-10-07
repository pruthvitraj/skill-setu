import AuthRoleSelect from '../components/common/AuthRoleSelect';
import '../styles/auth-login.css';
import WorkspaceShell from '../layouts/WorkspaceShell';
import CompanyInterviews from '../pages/company/CompanyInterviews';
import NotificationsPage from '../pages/common/NotificationsPage';
import StudentSettings from '../pages/student/StudentSettings';
import ChallengesPage from '../pages/common/ChallengesPage';
import AccountRecovery from '../pages/auth/AccountRecovery';
import { useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentCourses from '../pages/student/StudentCourses';
import StudentMarketplace from '../pages/student/StudentMarketplace';
import StudentAssessments from '../pages/student/StudentAssessments';
import StudentApplications from '../pages/student/StudentApplications';
import StudentInterviews from '../pages/student/StudentInterviews';
import StudentProfile from '../pages/student/StudentProfile';
import StudentResume from '../pages/student/StudentResume';
import StudentRoadmap from '../pages/student/StudentRoadmap';
import StudentSkills from '../pages/student/StudentSkills';
import StudentSkillTracker from '../pages/student/StudentSkillTracker';
import StudentFeed from '../pages/student/StudentFeed';
import { authApi } from '../services/authApi';
import TpoLayout from '../layouts/TpoLayout';
import TpoDashboardPageContent from '../pages/tpo/TpoDashboard';
import TpoStudentDetails from '../pages/tpo/TpoStudentDetails';
import TpoSettings from '../pages/tpo/TpoSettings';
import TpoReports from '../pages/tpo/TpoReports';
import TpoAnnouncements from '../pages/tpo/TpoAnnouncements';
import TpoPlacementAnalytics from '../pages/tpo/TpoPlacementAnalytics';
import TpoInterviews from '../pages/tpo/TpoInterviews';
import TpoStudents from '../pages/tpo/TpoStudents';
import TpoInternships from '../pages/tpo/TpoInternships';
import TpoCompanies from '../pages/tpo/TpoCompanies';
import TpoSkills from '../pages/tpo/TpoSkills';
import TpoPlacementDrives from '../pages/tpo/TpoPlacementDrives';
import TpoApplications from '../pages/tpo/TpoApplications';
import CompanyDashboardView from '../pages/company/CompanyDashboard';
import CompanyJobsView from '../pages/company/CompanyJobs';
import CompanyApplicationsView from '../pages/company/CompanyApplications';
import CompanyJobForm from '../pages/company/CompanyJobForm';
import CompanyAnalyticsView from '../pages/company/CompanyAnalytics';
import CompanyTeamView from '../pages/company/CompanyTeam';
import CompanySettingsView from '../pages/company/CompanySettings';
import CompanyDrives from '../pages/company/CompanyDrives';
import NetworkPage from '../pages/common/NetworkPage';
import MessagesPage from '../pages/common/MessagesPage';

function SkillSetuLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  );
}

function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--ui-bg)', fontFamily: 'var(--ui-font)', color: 'var(--ui-ink)' }} className="bg-grid-pattern">
      <header style={{ borderBottom: '1px solid var(--ui-border)', background: '#fff', position: 'sticky', top: 0, zIndex: 30, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', height: 64, alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 800, color: 'var(--ui-ink)', textDecoration: 'none', letterSpacing: '-0.01em' }} to="/">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 8, background: 'var(--ui-nav)', color: 'white' }}>
                <SkillSetuLogo size={18} />
              </div>
              SkillSetu
            </Link>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }} className="hidden md:flex">
              <Link style={{ fontSize: 13, fontWeight: 600, color: 'var(--ui-ink)', textDecoration: 'none', borderBottom: '2px solid var(--ui-accent)', paddingBottom: 20 }} to="/">Home</Link>
              <Link style={{ fontSize: 13, fontWeight: 500, color: 'var(--ui-muted)', textDecoration: 'none' }} to="/#how-it-works">How it works</Link>
              <Link style={{ fontSize: 13, fontWeight: 500, color: 'var(--ui-muted)', textDecoration: 'none' }} to="/#about">About</Link>
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link className="btn btn-ghost btn-sm" to="/login">Log in</Link>
            <Link className="btn btn-primary btn-sm" to="/register">Register</Link>
          </div>
        </div>
      </header>

      <main>
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 24px 80px' }}>
          <div style={{ display: 'grid', gap: 48, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'center' }}>
            {/* Left Hero Content */}
            <div style={{ maxWidth: 560 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--ui-soft)', color: 'var(--ui-primary)', borderRadius: 99, padding: '4px 12px', fontSize: 12, fontWeight: 700, marginBottom: 20, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="5"/></svg>
                Skill-based career platform
              </div>
              <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, color: 'var(--ui-ink)', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
                Bridge the gap between your skills and your career.
              </h1>
              <p style={{ fontSize: 17, color: 'var(--ui-muted)', lineHeight: 1.65, margin: 0 }}>
                SkillSetu compares what you can do today with what your target role needs, then builds the path across.
              </p>

              <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <Link className="btn btn-primary btn-lg" to="/register">
                  Get started
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <Link className="btn btn-ghost btn-lg" to="/student/dashboard">
                  Explore platform
                </Link>
              </div>

              <div style={{ marginTop: 40, display: 'flex', gap: 32, borderTop: '1px solid var(--ui-border)', paddingTop: 28 }}>
                {[['120', 'demo students'], ['16', 'demo candidates'], ['8', 'demo roles']].map(([n, l]) => (
                  <div key={l}>
                    <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--ui-ink)', margin: 0, letterSpacing: '-0.01em' }}>{n}</p>
                    <p style={{ fontSize: 13, color: 'var(--ui-muted)', margin: '2px 0 0' }}>{l}</p>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: 12, fontSize: 12, color: 'var(--ui-muted)' }}>Figures describe the mock data in this prototype, not real platform usage.</p>
            </div>

            {/* Right – Skill gap preview card */}
            <div className="card" style={{ borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.1)', padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ui-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Skill gap preview</p>
                <span className="badge badge-primary">Data Engineer</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--ui-muted)', margin: '0 0 20px' }}>Sample student · not real data</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { name: 'SQL', have: 4, need: 5 },
                  { name: 'Python', have: 2, need: 4 },
                  { name: 'ETL', have: 1, need: 4 },
                  { name: 'PostgreSQL', have: 3, need: 4 },
                  { name: 'AWS', have: 2, need: 4 },
                ].map(skill => (
                  <div key={skill.name} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, fontWeight: 500 }}>
                    <span style={{ width: 80, color: 'var(--ui-ink)', flexShrink: 0 }}>{skill.name}</span>
                    <div style={{ flex: 1, display: 'flex', gap: 3, height: 10, alignItems: 'center' }}>
                      {[1,2,3,4,5].map(i => {
                        if (i <= skill.have) return <div key={i} style={{ flex: 1, height: '100%', background: 'var(--ui-primary)', borderRadius: 2 }} />;
                        if (i <= skill.need) return <div key={i} style={{ flex: 1, height: '100%', background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 2 }} />;
                        return <div key={i} style={{ flex: 1, height: '100%', background: 'var(--ui-border)', borderRadius: 2 }} />;
                      })}
                    </div>
                    <span style={{ width: 36, textAlign: 'right', color: 'var(--ui-muted)', fontSize: 12 }}>{skill.have}/{skill.need}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 12, borderTop: '1px solid var(--ui-border)', paddingTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ui-muted)' }}>
                  <div style={{ width: 12, height: 8, background: 'var(--ui-primary)', borderRadius: 2 }} /> Your level
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ui-muted)' }}>
                  <div style={{ width: 12, height: 8, background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 2 }} /> Gap to close
                </div>
              </div>
              <p style={{ marginTop: 12, fontSize: 13, color: 'var(--ui-muted)' }}>
                <strong style={{ color: 'var(--ui-ink)' }}>54% career match</strong> — sample data only.
              </p>
            </div>
          </div>
        </section>

        <section style={{ background: '#fff', borderTop: '1px solid var(--ui-border)', padding: '80px 24px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ui-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Platform capabilities</p>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: 'var(--ui-ink)', margin: 0, letterSpacing: '-0.01em' }}>
                Everything between where you are and where you want to be
              </h2>
            </div>

            <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {[
                { title: 'Skill radar', desc: 'See your current skills against a target role on one chart.', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg> },
                { title: 'Skill gap analysis', desc: 'Know exactly which skills to close first, with clear priorities.', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
                { title: 'Learning roadmap', desc: 'A week-by-week path of courses, assessments and projects.', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
                { title: 'Study planner', desc: 'Set your weekly hours and see when you could be role-ready.', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
                { title: 'Evaluated evidence', desc: 'Turn self-declared skills into proof through quizzes and projects.', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> },
                { title: 'Skill-based matching', desc: 'Recruiters and placement cells see the same match score you do.', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
              ].map((feature, i) => (
                <div key={i} className="card card-hoverable" style={{ transition: 'box-shadow 0.2s, border-color 0.2s', cursor: 'default' }}>
                  <div style={{ width: 40, height: 40, background: 'var(--ui-soft)', color: 'var(--ui-primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    {feature.icon}
                  </div>
                  <h4 style={{ fontWeight: 700, color: 'var(--ui-ink)', fontSize: 15, margin: '0 0 8px' }}>{feature.title}</h4>
                  <p style={{ fontSize: 13, color: 'var(--ui-muted)', lineHeight: 1.6, margin: 0 }}>{feature.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 80, maxWidth: 680, margin: '80px auto 0' }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ui-ink)', marginBottom: 24 }}>Frequently asked questions</h2>
              <div>
                {['Is the data in this prototype real?', 'How is the match percentage calculated?', 'How is skill evidence recorded?', 'Who can use SkillSetu?'].map((q, i) => (
                  <details key={i} style={{ borderBottom: '1px solid var(--ui-border)', padding: '16px 0' }}>
                    <summary style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', listStyle: 'none', fontWeight: 700, fontSize: 14, color: 'var(--ui-ink)' }}>
                      {q}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
                    </summary>
                    <p style={{ marginTop: 12, fontSize: 14, color: 'var(--ui-muted)', lineHeight: 1.65 }}>This is a demo answer for the prototype.</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { user, setSession } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user?.role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (user?.role === 'tpo') return <Navigate to="/tpo/dashboard" replace />;
  if (user?.role === 'recruiter') return <Navigate to="/company/dashboard" replace />;

  async function submit(event) {
    event.preventDefault();
    if (!form.role) {
      setError('Please select your role before signing in.');
      return;
    }
    setBusy(true); setError('');
    try {
      const response = await authApi.login({ email: form.email, password: form.password });
      setSession(response.data);
      if (response.data.user.role === 'student') navigate('/student/dashboard');
      else if (response.data.user.role === 'tpo') navigate('/tpo/dashboard');
      else if (response.data.user.role === 'recruiter') navigate('/company/dashboard');
      else navigate('/');
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  }

  const roles = [
    { value: 'student', label: 'Student' },
    { value: 'tpo', label: 'TPO (Training & Placement Officer)' },
    { value: 'recruiter', label: 'Company' },
  ];

  return (
    <main className="sm-learning skillsetu-auth">
      <div className="auth-layout">
        <aside className="auth-brand-panel" aria-label="About SkillSetu">
          <Link className="auth-brand" to="/">SkillSetu</Link>
          <div className="auth-brand-copy"><p className="auth-overline">Learn. Apply. Coordinate.</p><h2>Your next step, in one workspace.</h2><p>Learning resources and applications for students. Placement coordination for TPO teams. Hiring workflows for companies.</p></div>
          <p className="auth-brand-note">Choose your workspace to continue.</p>
        </aside>
        <div className="auth-panel">
          <header><h1>Sign in to SkillSetu</h1><p className="auth-muted">Select your role and enter your credentials.</p></header>
          <form className="auth-form" onSubmit={submit} aria-busy={busy}>
            <AuthRoleSelect options={roles} value={form.role} onChange={role => setForm({ ...form, role })} />
            <label><span className="label">Email</span><input className="input" type="email" autoComplete="username" required value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></label>
            <label><span className="label">Password</span><input className="input" type="password" autoComplete="current-password" required value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} /></label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="btn-primary" type="submit" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
          </form>
          <div className="auth-links"><Link to="/forgot-password">Forgot password?</Link><p>New to SkillSetu? <Link to="/register">Create an account</Link></p></div>
        </div>
      </div>
    </main>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const { user, setSession } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'student', universityName: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) {
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'tpo') return <Navigate to="/tpo/dashboard" replace />;
    if (user.role === 'recruiter') return <Navigate to="/company/dashboard" replace />;
    return <Navigate to="/" replace />;
  }
  async function submit(event) {
    event.preventDefault();
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    setBusy(true); setError('');
    try {
      const response = await authApi.register(form);
      setSession(response.data);
      if (response.data.user.role === 'student') navigate('/student/dashboard');
      else if (response.data.user.role === 'tpo') navigate('/tpo/dashboard');
      else if (response.data.user.role === 'recruiter') navigate('/company/dashboard');
      else navigate('/');
    } catch (requestError) {
      setError(requestError.message || 'Unable to create account.');
    } finally {
      setBusy(false);
    }
  }
  return <main className="min-h-screen bg-slate-50 px-6 py-12"><div className="mx-auto max-w-md"><Link className="text-2xl font-bold text-slate-950" to="/">SkillSetu</Link><div className="card mt-8"><h1 className="text-2xl font-bold text-slate-950">Create your account</h1><p className="mt-2 text-sm text-slate-500">Join SkillSetu and start building your career path.</p><form className="mt-6 space-y-4" onSubmit={submit}><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="label">First name</span><input className="input" required value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></label><label className="block"><span className="label">Last name</span><input className="input" required value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} /></label></div><label className="block"><span className="label">Email</span><input className="input" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label className="block"><span className="label">Password</span><input className="input" type="password" minLength="8" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label><label className="block"><span className="label">Account type</span><select className="input" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="student">Student</option><option value="tpo">University / TPO</option><option value="recruiter">Company / Recruiter</option></select></label>{(form.role === 'student' || form.role === 'tpo') && <label className="block"><span className="label">University name</span><input className="input" required value={form.universityName} onChange={(event) => setForm({ ...form, universityName: event.target.value })} placeholder="Your university" /></label>}{error && <p className="text-sm font-medium text-red-600">{error}</p>}<button className="btn-primary w-full" type="submit" disabled={busy}>{busy ? 'Creating account...' : 'Create account'}</button></form><p className="mt-5 text-center text-sm text-slate-500">Already registered? <Link className="font-semibold text-indigo-700" to="/login">Log in</Link></p></div></div></main>;
}

function NotFoundPage() {
  return (
    <main>
      <h1>Page not found</h1>
      <Link to="/">Return home</Link>
    </main>
  );
}

function StudentRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <main className="p-6"><p role="status">Loading session...</p></main>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'student') return <main className="p-6"><h1 className="text-xl font-bold">Student access only</h1><p className="mt-2 text-slate-600">This workspace is reserved for student accounts.</p></main>;
  return <WorkspaceShell role="student">{children}</WorkspaceShell>;
}

function TpoRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <main className="p-6"><p role="status">Loading session…</p></main>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'tpo') return <Navigate to="/" replace />;
  return <TpoLayout>{children}</TpoLayout>;
}

function CompanyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <main className="p-6"><p role="status">Loading session...</p></main>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'recruiter') return <main className="p-6"><h1 className="text-xl font-bold">Company access only</h1><p className="mt-2 text-slate-600">This workspace is reserved for company/recruiter accounts.</p></main>;
  return <WorkspaceShell role="recruiter">{children}</WorkspaceShell>;
}

function TpoDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-[#0f2447] mb-4">TPO Dashboard</h1>
      <p className="text-slate-600 mb-8">Welcome to the Training & Placement Officer workspace. Manage placement drives, view student progress, and generate reports.</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900">Active Drives</h3>
          <p className="text-3xl font-bold text-[#22488f] mt-2">12</p>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900">Registered Students</h3>
          <p className="text-3xl font-bold text-[#22488f] mt-2">1,234</p>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900">Placed This Year</h3>
          <p className="text-3xl font-bold text-[#17806d] mt-2">567</p>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900">Partner Companies</h3>
          <p className="text-3xl font-bold text-[#22488f] mt-2">89</p>
        </div>
      </div>
    </div>
  );
}

function CompanyDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-[#0f2447] mb-4">Company Dashboard</h1>
      <p className="text-slate-600 mb-8">Welcome to the Company workspace. Post jobs, review applications, and hire top talent from our talent pool.</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900">Active Jobs</h3>
          <p className="text-3xl font-bold text-[#22488f] mt-2">8</p>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900">Total Applications</h3>
          <p className="text-3xl font-bold text-[#22488f] mt-2">342</p>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900">Shortlisted</h3>
          <p className="text-3xl font-bold text-[#17806d] mt-2">45</p>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900">Hired</h3>
          <p className="text-3xl font-bold text-[#22488f] mt-2">12</p>
        </div>
      </div>
    </div>
  );
}

function TpoDashboardPage() {
  return <TpoRoute><TpoDashboardPageContent /></TpoRoute>;
}

function TpoDrivesPage() {
  return <TpoRoute><TpoPlacementDrives /></TpoRoute>;
}

function TpoStudentsPage() {
  return <TpoRoute><TpoStudents /></TpoRoute>;
}

function TpoReportsPage() {
  return <TpoRoute><TpoReports /></TpoRoute>;
}

function TpoAnalyticsPage() {
  return <TpoRoute><TpoPlacementAnalytics /></TpoRoute>;
}

function TpoSettingsPage() {
  return <TpoRoute><TpoSettings /></TpoRoute>;
}

function CompanyDashboardPage() {
  return <CompanyRoute><CompanyDashboardView /></CompanyRoute>;
}

function CompanyJobsPage() {
  return <CompanyRoute><CompanyJobsView /></CompanyRoute>;
}

function CompanyApplicationsPage() {
  return <CompanyRoute><CompanyApplicationsView /></CompanyRoute>;
}

function CompanyJobFormPage() {
  return <CompanyRoute><CompanyJobForm /></CompanyRoute>;
}

function CompanyAnalyticsPage() {
  return (
    <CompanyRoute>
      <CompanyAnalyticsView />
    </CompanyRoute>
  );
}

function CompanyTeamPage() {
  return (
    <CompanyRoute>
      <CompanyTeamView />
    </CompanyRoute>
  );
}

function CompanySettingsPage() {
  return (
    <CompanyRoute>
      <CompanySettingsView />
    </CompanyRoute>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/verify-email" element={<AccountRecovery mode="verify" />} />
      <Route path="/forgot-password" element={<AccountRecovery mode="forgot" />} />
      <Route path="/reset-password" element={<AccountRecovery mode="reset" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/student/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
      <Route path="/student/feed" element={<StudentRoute><StudentFeed /></StudentRoute>} />
      <Route path="/student/settings" element={<StudentRoute><StudentSettings /></StudentRoute>} />
      <Route path="/student/notifications" element={<StudentRoute><NotificationsPage /></StudentRoute>} />
      <Route path="/student/profile" element={<StudentRoute><StudentProfile /></StudentRoute>} />
      <Route path="/student/resume" element={<StudentRoute><StudentResume /></StudentRoute>} />
      <Route path="/student/skills" element={<StudentRoute><StudentSkills /></StudentRoute>} />
      <Route path="/student/challenges" element={<StudentRoute><ChallengesPage /></StudentRoute>} />
      <Route path="/tpo/challenges" element={<TpoRoute><ChallengesPage /></TpoRoute>} />
      <Route path="/company/challenges" element={<CompanyRoute><ChallengesPage /></CompanyRoute>} />
      <Route path="/student/assessments" element={<StudentRoute><StudentAssessments /></StudentRoute>} />
      <Route path="/student/applications" element={<StudentRoute><StudentApplications /></StudentRoute>} />
      <Route path="/student/interviews" element={<StudentRoute><StudentInterviews /></StudentRoute>} />
      <Route path="/student/skill-tracker" element={<StudentRoute><StudentSkillTracker /></StudentRoute>} />
      <Route path="/student/roadmap" element={<StudentRoute><StudentRoadmap /></StudentRoute>} />
      <Route path="/student/courses" element={<StudentRoute><StudentCourses /></StudentRoute>} />
      <Route path="/student/marketplace" element={<StudentRoute><StudentMarketplace /></StudentRoute>} />
      <Route path="/student/network" element={<StudentRoute><NetworkPage role="student" /></StudentRoute>} />
      <Route path="/student/messages" element={<StudentRoute><MessagesPage /></StudentRoute>} />
      <Route path="/tpo/dashboard" element={<TpoDashboardPage />} />
      <Route path="/tpo/drives" element={<TpoDrivesPage />} />
      <Route path="/tpo/students" element={<TpoStudentsPage />} />
      <Route path="/tpo/students/:id" element={<TpoRoute><TpoStudentDetails /></TpoRoute>} />
      <Route path="/tpo/internships" element={<TpoRoute><TpoInternships /></TpoRoute>} />
      <Route path="/tpo/companies" element={<TpoRoute><TpoCompanies /></TpoRoute>} />
      <Route path="/tpo/skills" element={<TpoRoute><TpoSkills /></TpoRoute>} />
      <Route path="/tpo/placement-drives" element={<TpoRoute><TpoPlacementDrives /></TpoRoute>} />
      <Route path="/tpo/applications" element={<TpoRoute><TpoApplications /></TpoRoute>} />
      <Route path="/tpo/interviews" element={<TpoRoute><TpoInterviews /></TpoRoute>} />
      <Route path="/tpo/placement-analytics" element={<TpoRoute><TpoPlacementAnalytics /></TpoRoute>} />
      <Route path="/tpo/announcements" element={<TpoRoute><TpoAnnouncements /></TpoRoute>} />
      <Route path="/tpo/reports" element={<TpoReportsPage />} />
      <Route path="/tpo/analytics" element={<TpoAnalyticsPage />} />
      <Route path="/tpo/settings" element={<TpoSettingsPage />} />
      <Route path="/company/dashboard" element={<CompanyDashboardPage />} />
      <Route path="/company/jobs" element={<CompanyJobsPage />} />
      <Route path="/company/jobs/new" element={<CompanyJobFormPage />} />
      <Route path="/company/jobs/:id" element={<CompanyJobFormPage />} />
      <Route path="/company/jobs/:id/edit" element={<CompanyJobFormPage />} />
      <Route path="/company/drives" element={<CompanyRoute><CompanyDrives /></CompanyRoute>} />
      <Route path="/company/applications" element={<CompanyApplicationsPage />} />
      <Route path="/company/interviews" element={<CompanyRoute><CompanyInterviews /></CompanyRoute>} />
      <Route path="/company/analytics" element={<CompanyAnalyticsPage />} />
      <Route path="/company/team" element={<CompanyTeamPage />} />
      <Route path="/company/notifications" element={<CompanyRoute><NotificationsPage /></CompanyRoute>} />
      <Route path="/tpo/notifications" element={<TpoRoute><NotificationsPage /></TpoRoute>} />
      <Route path="/tpo/messages" element={<TpoRoute><MessagesPage /></TpoRoute>} />
      <Route path="/company/settings" element={<CompanySettingsPage />} />
      <Route path="/company/network" element={<CompanyRoute><NetworkPage role="company" /></CompanyRoute>} />
      <Route path="/company/messages" element={<CompanyRoute><MessagesPage /></CompanyRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

