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
              <h3 className="text-base font-bold text-[#0f2447] font-serif">Illustration: skill gaps for a sample student</h3>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-md bg-[#22488f] px-3 py-1.5 text-sm text-white">Data Engineer example</span>
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
                { title: 'Evaluated evidence', desc: 'Turn self-declared skills into proof through quizzes and projects.', icon: <svg className="w-5 h-5 text-[#22488f]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> },
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
                {['Is the data in this prototype real?', 'How is the match percentage calculated?', 'How is skill evidence recorded?', 'Who can use SkillSetu?'].map((q, i) => (
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
    { value: 'student', label: 'Student', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>, desc: 'Access courses, assessments, and job applications' },
    { value: 'tpo', label: 'TPO (Training & Placement Officer)', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>, desc: 'Manage placements, drives, and student reports' },
    { value: 'recruiter', label: 'Company', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>, desc: 'Post jobs, review applications, and hire talent' },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-md">
        <Link className="text-2xl font-bold text-slate-950" to="/">SkillSetu</Link>
        <div className="card mt-8">
          <h1 className="text-2xl font-bold text-slate-950">Sign in to SkillSetu</h1>
          <p className="mt-2 text-sm text-slate-500">Select your role and enter credentials to continue.</p>
          
          <div className="mt-6">
            <label className="label block mb-3">Select your role</label>
            <div className="grid gap-3" role="radiogroup" aria-label="Select role">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  role="radio"
                  aria-checked={form.role === role.value}
                  onClick={() => setForm({ ...form, role: role.value })}
                  className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                    form.role === role.value
                      ? 'border-[#22488f] bg-[#eef2ff]'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      form.role === role.value ? 'bg-[#22488f] text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {role.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${form.role === role.value ? 'text-[#1d4ed8]' : 'text-slate-900'}`}>
                        {role.label}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{role.desc}</p>
                    </div>
                    {form.role === role.value && (
                      <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-[#22488f] flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <label className="block">
              <span className="label">Email</span>
              <input className="input" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </label>
            <label className="block">
              <span className="label">Password</span>
              <input className="input" type="password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            </label>
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            <button className="btn-primary w-full" type="submit" disabled={busy}>
              {busy ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <Link className="mt-4 block text-sm text-blue-700 underline" to="/forgot-password">Forgot password?</Link>
          <p className="mt-5 text-center text-sm text-slate-500">New to SkillSetu? <Link className="font-semibold text-indigo-700" to="/register">Create an account</Link></p>
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

