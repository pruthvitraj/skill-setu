import { useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Home, Rss, FileText, ClipboardList, TrendingUp, BookOpen, Briefcase, MessageCircle, Users, Video, Bell, UserCircle, Settings } from 'lucide-react';
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
import { authApi } from '../services/authApi';

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 bg-grid-pattern relative">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link className="flex items-center gap-2 text-xl font-bold text-[#0f2447]" to="/">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[#0f2447] text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </div>
              SkillSetu
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link className="text-sm font-semibold text-slate-900 border-b-2 border-amber-400 py-5" to="/">Home</Link>
              <Link className="text-sm font-medium text-slate-600 hover:text-slate-900" to="/#how-it-works">How SkillSetu works</Link>
              <Link className="text-sm font-medium text-slate-600 hover:text-slate-900" to="/#about">About</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" to="/login">Log in</Link>
            <Link className="rounded-md bg-[#1e40af] px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800" to="/register">Register</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-[1200px] px-6 pt-24 pb-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
            {/* Left Hero Content */}
            <div className="max-w-xl">
              <h1 className="text-5xl font-extrabold leading-[1.1] text-[#0f2447] md:text-6xl tracking-tight" style={{fontFamily: "'Source Serif 4', Georgia, serif"}}>
                Bridge the gap between your skills and your career.
              </h1>
              <p className="mt-6 text-lg text-slate-600">
                SkillSetu compares what you can do today with what your target role needs, then builds the path across.
              </p>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <Link className="rounded-lg bg-[#22488f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1a3872]" to="/register">
                  Get started
                </Link>
                <Link className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-[#22488f] transition hover:bg-slate-50" to="/student/dashboard">
                  Explore platform
                </Link>
              </div>

              <div className="mt-12 flex gap-10 border-t border-slate-200 pt-8">
                <div>
                  <p className="text-2xl font-bold text-[#0f2447]">120</p>
                  <p className="text-sm text-slate-500">demo students</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0f2447]">16</p>
                  <p className="text-sm text-slate-500">demo candidates</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0f2447]">8</p>
                  <p className="text-sm text-slate-500">demo roles</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500">Figures describe the mock data in this prototype, not real platform usage.</p>
            </div>

            {/* Right Mock Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl relative z-10">
              <h3 className="text-base font-bold text-[#0f2447] font-serif">Try it: see the gap for a sample student</h3>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="rounded-md bg-[#22488f] px-3 py-1.5 text-sm text-white">Data Engineer</button>
                <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">Frontend Developer</button>
                <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">Cloud Engineer</button>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  { name: 'SQL', have: 4, need: 5 },
                  { name: 'Python', have: 2, need: 4 },
                  { name: 'ETL', have: 1, need: 4 },
                  { name: 'PostgreSQL', have: 3, need: 4 },
                  { name: 'AWS', have: 2, need: 4 },
                ].map(skill => (
                  <div key={skill.name} className="flex items-center text-sm font-medium">
                    <span className="w-24 text-slate-700">{skill.name}</span>
                    <div className="flex-1 flex gap-1 h-3 items-center">
                      {[1,2,3,4,5].map(i => {
                        if (i <= skill.have) return <div key={i} className="h-full flex-1 bg-[#22488f]"></div>;
                        if (i <= skill.need) return <div key={i} className="h-full flex-1 bg-amber-100" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #e2ac3f 2px, #e2ac3f 4px)' }}></div>;
                        return <div key={i} className="h-full flex-1 bg-slate-100"></div>;
                      })}
                    </div>
                    <span className="w-10 text-right text-slate-500 text-xs ml-3">{skill.have} / {skill.need}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-600 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-1.5"><div className="h-2 w-3 bg-[#22488f]"></div> Your level</div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-3 bg-amber-100" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #e2ac3f 2px, #e2ac3f 4px)' }}></div> Gap to close</div>
                <div className="flex items-center gap-1.5"><div className="h-3 w-0.5 bg-slate-900"></div> Required level</div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-3 bg-[#17806d]"></div> Requirement met</div>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                <strong>54% career match</strong> for Data Engineer. Sample data, not a real student.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-24 relative z-10 border-t border-slate-200">
          <div className="mx-auto max-w-[1000px] px-6">
            <h2 className="text-center text-3xl font-bold text-[#0f2447] mb-12 font-serif">
              Everything between where you are and where you want to be
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Skill radar', desc: 'See your current skills against a target role on one chart.', icon: <svg className="w-5 h-5 text-[#22488f]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg> },
                { title: 'Skill gap', desc: 'Know exactly which skills to close first, with clear priorities.', icon: <svg className="w-5 h-5 text-[#22488f]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
                { title: 'Learning roadmap', desc: 'A week-by-week path of courses, assessments and projects.', icon: <svg className="w-5 h-5 text-[#22488f]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
                { title: 'Study planner', desc: 'Set your weekly hours and see when you could be role-ready.', icon: <svg className="w-5 h-5 text-[#22488f]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
                { title: 'Verified skills', desc: 'Turn self-declared skills into proof through quizzes and projects.', icon: <svg className="w-5 h-5 text-[#22488f]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> },
                { title: 'Skill-based matching', desc: 'Recruiters and placement cells see the same match score you do.', icon: <svg className="w-5 h-5 text-[#22488f]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> }
              ].map((feature, i) => (
                <div key={i} className="card hover:border-slate-300 transition-colors">
                  <div className="h-10 w-10 bg-blue-50 text-[#22488f] rounded-lg flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h4 className="font-bold text-[#0f2447] text-lg font-sans">{feature.title}</h4>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-32 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-[#0f2447] mb-8 font-serif">Frequently asked questions</h2>
              <div className="space-y-4">
                {['Is the data in this prototype real?', 'How is the match percentage calculated?', 'How does a skill become verified?', 'Who can use SkillSetu?'].map((q, i) => (
                  <details key={i} className="group border-b border-slate-200 pb-4">
                    <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-[#0f2447] text-sm">
                      {q}
                      <span className="text-xl text-[#22488f] transition group-open:rotate-45">+</span>
                    </summary>
                    <div className="mt-4 text-sm text-slate-600">This is a demo answer for the prototype.</div>
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
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user?.role === 'student') return <Navigate to="/student/dashboard" replace />;
  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError('');
    try { const response = await authApi.login(form); setSession(response.data); navigate('/student/dashboard'); } catch (requestError) { setError(requestError.message || 'Unable to sign in.'); } finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-slate-50 px-6 py-12"><div className="mx-auto max-w-md"><Link className="text-2xl font-bold text-slate-950" to="/">SkillSetu</Link><div className="card mt-8"><h1 className="text-2xl font-bold text-slate-950">Student login</h1><p className="mt-2 text-sm text-slate-500">Use your SkillSetu account to open the student workspace.</p><form className="mt-6 space-y-4" onSubmit={submit}><label className="block"><span className="label">Email</span><input className="input" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label className="block"><span className="label">Password</span><input className="input" type="password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>{error && <p className="text-sm font-medium text-red-600">{error}</p>}<button className="btn-primary w-full" type="submit" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button></form><p className="mt-5 text-center text-sm text-slate-500">New to SkillSetu? <Link className="font-semibold text-indigo-700" to="/register">Create an account</Link></p></div></div></main>;
}

function RegisterPage() {
  const navigate = useNavigate();
  const { user, setSession } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={user.role === 'student' ? '/student/dashboard' : '/'} replace />;
  async function submit(event) {
    event.preventDefault();
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    setBusy(true); setError('');
    try { const response = await authApi.register(form); setSession(response.data); navigate(form.role === 'student' ? '/student/dashboard' : '/'); } catch (requestError) { setError(requestError.message || 'Unable to create account.'); } finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-slate-50 px-6 py-12"><div className="mx-auto max-w-md"><Link className="text-2xl font-bold text-slate-950" to="/">SkillSetu</Link><div className="card mt-8"><h1 className="text-2xl font-bold text-slate-950">Create your account</h1><p className="mt-2 text-sm text-slate-500">Join SkillSetu and start building your career path.</p><form className="mt-6 space-y-4" onSubmit={submit}><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="label">First name</span><input className="input" required value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></label><label className="block"><span className="label">Last name</span><input className="input" required value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} /></label></div><label className="block"><span className="label">Email</span><input className="input" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label className="block"><span className="label">Password</span><input className="input" type="password" minLength="8" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label><label className="block"><span className="label">Account type</span><select className="input" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="student">Student</option><option value="tpo">University / TPO</option><option value="recruiter">Company / Recruiter</option></select></label>{error && <p className="text-sm font-medium text-red-600">{error}</p>}<button className="btn-primary w-full" type="submit" disabled={busy}>{busy ? 'Creating account...' : 'Create account'}</button></form><p className="mt-5 text-center text-sm text-slate-500">Already registered? <Link className="font-semibold text-indigo-700" to="/login">Log in</Link></p></div></div></main>;
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
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) return <main className="p-6 text-sm text-slate-500">Loading session...</main>;
  
  const token = localStorage.getItem('skillsetu_token');
  const currentUser = user || (token ? { firstName: 'Aarav', lastName: 'Deshmukh', role: 'student' } : null);
  
  if (!currentUser) return <Navigate to="/" replace />;
  if (currentUser.role !== 'student') return <main className="p-6"><h1 className="text-xl font-bold">Student access only</h1><p className="mt-2 text-slate-600">This workspace is reserved for student accounts.</p></main>;

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  const links = [
    { path: '/student/dashboard', label: 'Dashboard', icon: <Home size={20} className="mr-4" /> },
    { path: '/student/feed', label: 'Post / Feed', icon: <Rss size={20} className="mr-4" /> },
    { path: '/student/resume', label: 'Resume ATS', icon: <FileText size={20} className="mr-4" /> },
    { path: '/student/skill-tracker', label: 'Skill Tracker', icon: <ClipboardList size={20} className="mr-4" /> },
    { path: '/student/roadmap', label: 'AI Roadmap', icon: <TrendingUp size={20} className="mr-4" /> },
    { path: '/student/courses', label: 'Courses', icon: <BookOpen size={20} className="mr-4" /> },
    { path: '/student/marketplace', label: 'Marketplace (Jobs)', icon: <Briefcase size={20} className="mr-4" /> },
    { path: '/student/messages', label: 'Messages', icon: <MessageCircle size={20} className="mr-4" /> },
    { path: '/student/network', label: 'Network', icon: <Users size={20} className="mr-4" /> },
    { path: '/student/interviews', label: 'Interviews', icon: <Video size={20} className="mr-4" /> },
    { path: '/student/notifications', label: 'Notifications', icon: <Bell size={20} className="mr-4" /> },
    { path: '/student/profile', label: 'Profile', icon: <UserCircle size={20} className="mr-4" /> },
    { path: '/student/settings', label: 'Account Settings', icon: <Settings size={20} className="mr-4" /> },
  ];
  
  return (
    <div className="student-shell">
      <aside className="student-sidebar flex flex-col pt-4 px-3 border-r border-slate-200 bg-white">
        <Link className="mb-8 flex items-center gap-2 px-3 text-xl font-bold text-[#0f2447]" to="/student/dashboard">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#0f2447] text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          SkillSetu
        </Link>
        <nav className="flex-1 flex flex-col gap-1.5" aria-label="Student workspace">
          {links.map((link) => {
            const isActive = location.pathname === link.path || (link.path === '/student/dashboard' && location.pathname === '/student/dashboard');
            return (
              <Link 
                className={`flex items-center rounded-lg px-4 py-2.5 text-[15px] transition ${isActive ? "bg-[#eef2ff] text-[#1d4ed8] font-semibold" : "text-[#334155] hover:bg-[#f8fafc]"}`} 
                to={link.path} 
                aria-current={isActive ? 'page' : undefined} 
                key={link.path}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#2563eb] rounded-r-md"></div>}
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 border-t border-slate-200 pt-5 pb-5">
          <div className="flex items-center gap-3 px-3">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
              {currentUser.firstName?.[0] || 'A'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{currentUser.firstName} {currentUser.lastName}</p>
              <p className="text-xs text-slate-500 capitalize">{currentUser.role}</p>
            </div>
            <button onClick={handleLogout} title="Log out" className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded hover:bg-slate-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </aside>
      <main className="student-content">{children}</main>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/student/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
      <Route path="/student/profile" element={<StudentRoute><StudentProfile /></StudentRoute>} />
      <Route path="/student/resume" element={<StudentRoute><StudentResume /></StudentRoute>} />
      <Route path="/student/skills" element={<StudentRoute><StudentSkills /></StudentRoute>} />
      <Route path="/student/assessments" element={<StudentRoute><StudentAssessments /></StudentRoute>} />
      <Route path="/student/applications" element={<StudentRoute><StudentApplications /></StudentRoute>} />
      <Route path="/student/interviews" element={<StudentRoute><StudentInterviews /></StudentRoute>} />
      <Route path="/student/skill-tracker" element={<StudentRoute><StudentSkillTracker /></StudentRoute>} />
      <Route path="/student/roadmap" element={<StudentRoute><StudentRoadmap /></StudentRoute>} />
      <Route path="/student/courses" element={<StudentRoute><StudentCourses /></StudentRoute>} />
      <Route path="/student/marketplace" element={<StudentRoute><StudentMarketplace /></StudentRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}