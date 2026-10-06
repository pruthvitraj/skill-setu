import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, LockKeyhole, Play, Target, Timer, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentApi } from '../../services/studentApi';
import { skillApi } from '../../services/skillApi';
import { resumeApi } from '../../services/resumeApi';
import { postApi } from '../../services/postApi';
import { notificationApi } from '../../services/notificationApi';

/* ─── helpers ─────────────────────────────────────────────────── */
function timeAgo(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function Avatar({ name = '?', size = 36 }) {
  const pal = ['#22488f','#7c3aed','#0f766e','#b45309','#be123c','#1d4ed8'];
  const c = pal[(name.charCodeAt(0) || 0) % pal.length];
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:c,
      display:'flex', alignItems:'center', justifyContent:'center',
      color:'#fff', fontWeight:700, fontSize:size*0.36, flexShrink:0 }}>
      {name.slice(0,2).toUpperCase()}
    </div>
  );
}
function Chip({ label, color='#1d4ed8', bg='#eff6ff', border='#bfdbfe' }) {
  return (
    <span style={{ padding:'3px 10px', borderRadius:20, background:bg,
      color, border:`1px solid ${border}`, fontSize:12, fontWeight:600 }}>
      {label}
    </span>
  );
}
function Skel({ h=80, mb=12 }) {
  return <div style={{ height:h, borderRadius:12, background:'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
    backgroundSize:'200%', animation:'shimmer 1.4s infinite', marginBottom:mb }} />;
}
function Card({ children, style={} }) {
  return <div style={{ background:'#fff', border:'1px solid #e2e8f0',
    borderRadius:14, padding:'18px 20px', ...style }}>{children}</div>;
}
function SHead({ title, to, link = 'View all →', icon }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon && <span style={{ color: 'var(--ui-primary)', display: 'flex' }}>{icon}</span>}
        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ui-ink)', margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
      </div>
      {to && <Link to={to} style={{ fontSize: 12, color: 'var(--ui-primary)', fontWeight: 600, textDecoration: 'none' }}>{link}</Link>}
    </div>
  );
}

function NextAction({ dash, resume }) {
  const profileCompletion = Number(dash?.profileCompletion || 0);
  const hasResume = Boolean(resume);
  const hasTargetRole = Boolean(dash?.student?.targetRole);
  const action = profileCompletion < 100
    ? { label: 'Complete your profile', detail: `${profileCompletion}% complete`, to: '/student/profile' }
    : !hasResume
      ? { label: 'Upload your resume', detail: 'Add a resume for ATS guidance', to: '/student/resume' }
      : !hasTargetRole
        ? { label: 'Choose a target role', detail: 'Set a direction for your roadmap', to: '/student/profile' }
        : { label: 'Continue your learning roadmap', detail: 'Keep building role-ready evidence', to: '/student/roadmap' };

  return (
    <section className="student-next-action" aria-labelledby="student-next-action-title">
      <div>
        <p className="student-eyebrow">Your next step</p>
        <h2 id="student-next-action-title">{action.label}</h2>
        <p>{action.detail}</p>
      </div>
      <Link className="btn btn-primary" to={action.to}>Open task</Link>
    </section>
  );
}

/* ─── Post Card ──────────────────────────────────────────────── */
function PostCard({ post }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState((post.likes || []).some(id => String(id._id || id) === String(user?.id)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function toggleLike() { setBusy(true); setError(''); try { await (liked ? postApi.unlike(post._id) : postApi.like(post._id)); setLiked(!liked); } catch(e) { setError(e.message || 'Unable to update like.'); } finally { setBusy(false); } }
  const fn = post.author?.firstName || '?';
  const ln = post.author?.lastName || '';
  return (
    <Card style={{ marginBottom:16 }}>
      <div style={{ display:'flex', gap:10, marginBottom:10 }}>
        <Avatar name={fn} size={38} />
        <div>
          <p style={{ margin:0, fontWeight:600, fontSize:14, color:'#0f2447' }}>{fn} {ln}</p>
          <p style={{ margin:0, fontSize:12, color:'#94a3b8', textTransform:'capitalize' }}>
            {post.author?.role || 'student'} · {timeAgo(post.createdAt)}
          </p>
        </div>
      </div>
      <p style={{ fontSize:14, color:'#334155', lineHeight:1.65, margin:'0 0 10px', whiteSpace:'pre-wrap' }}>{post.body}</p>
      {post.tags?.length > 0 && (
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
          {post.tags.map(t => <span key={t} style={{ padding:'2px 9px', borderRadius:20,
            background:'#eff6ff', color:'#3b82f6', fontSize:11, fontWeight:600 }}>#{t}</span>)}
        </div>
      )}
      <button type="button" disabled={busy} aria-pressed={liked} onClick={toggleLike} className="text-sm text-blue-700">{liked ? 'Unlike' : 'Like'}</button>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </Card>
  );
}

/* ─── Compose ────────────────────────────────────────────────── */
function Compose({ user, onPosted }) {
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    try {
      await postApi.create({ body: body.trim(), tags: tags.split(',').map(t=>t.trim()).filter(Boolean) });
      setBody(''); setTags(''); onPosted?.();
    } catch(e) { setError(e.message || 'Unable to publish post.'); } finally { setBusy(false); }
  }
  return (
    <Card style={{ marginBottom:16 }}>
      <form onSubmit={submit}>
        {error && <p role="alert" className="text-red-700">{error}</p>}
        <div style={{ display:'flex', gap:12 }}>
          <Avatar name={user?.firstName||'?'} size={38} />
          <div style={{ flex:1 }}>
            <textarea value={body} onChange={e=>setBody(e.target.value)} rows={3}
              placeholder="Share something with the SkillSetu community..."
              style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:10,
                padding:'10px 14px', fontSize:14, resize:'vertical', outline:'none',
                fontFamily:'inherit', background:'#f8fafc', boxSizing:'border-box',
                color:'#0f2447' }} />
            <div style={{ display:'flex', gap:8, marginTop:8 }}>
              <input value={tags} onChange={e=>setTags(e.target.value)}
                placeholder="Tags: python, placement…"
                style={{ flex:1, border:'1px solid #e2e8f0', borderRadius:8,
                  padding:'6px 12px', fontSize:13, outline:'none', fontFamily:'inherit',
                  background:'#f8fafc' }} />
              <button type="submit" disabled={busy||!body.trim()}
                style={{ background: busy||!body.trim()?'#94a3b8':'#1e40af',
                  color:'#fff', border:'none', borderRadius:8,
                  padding:'7px 20px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                {busy?'Posting…':'Post'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
}

/* ─── Resume Match ───────────────────────────────────────────── */
function ResumeMatch({ resume, dashData }) {
  const jobs = dashData?.recommendedJobs || [];
  const skills = resume?.parsed?.skills || [];
  if (!resume && !jobs.length) return null;
  return (
    <Card style={{ marginBottom:16, background:'#fff' }}>
      <SHead title="Resume guidance & open jobs" to="/student/resume" link="Full ATS →" />
      {resume?.ats?.overall && (
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
          <div style={{ flex:1, height:8, background:'#e0e7ff', borderRadius:8, overflow:'hidden' }}>
            <div style={{ width:`${resume.ats.overall}%`, height:'100%',
              background:'linear-gradient(90deg,#6366f1,#3b82f6)', borderRadius:8 }} />
          </div>
          <span style={{ fontWeight:800, color:'#1d4ed8', fontSize:14 }}>ATS {resume.ats.overall}%</span>
        </div>
      )}
      {jobs.length > 0 && (
        <div>
          <p style={{ fontSize:12, color:'#92400e', fontWeight:600, marginBottom:8 }}>Recently published jobs (not personalized matches):</p>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {jobs.slice(0,3).map(j=>(
              <div key={j._id} style={{ display:'flex', justifyContent:'space-between',
                alignItems:'center', padding:'8px 10px', background:'#fff',
                border:'1px solid #fed7aa', borderRadius:8 }}>
                <div>
                  <p style={{ margin:0, fontSize:13, fontWeight:600, color:'#0f2447' }}>{j.title}</p>
                  <p style={{ margin:0, fontSize:11, color:'#94a3b8' }}>{j.company?.name} · {j.location}</p>
                </div>
                <Link to="/student/marketplace" style={{ fontSize:12, color:'#c2410c', fontWeight:700,
                  textDecoration:'none', padding:'4px 10px', background:'#fff7ed',
                  borderRadius:6, border:'1px solid #fed7aa' }}>Apply</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

/* ─── Notification Bell ─────────────────────────────────────── */
function NotifBell({ count }) {
  if (!count) return null;
  return (
    <Link to="/student/notifications" style={{ position: 'relative', display: 'inline-flex', padding: '6px', borderRadius: 8, background: 'var(--ui-bg)', textDecoration: 'none', color: 'var(--ui-ink)' }} aria-label={`${count} unread notifications`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--ui-danger)', color: '#fff', fontSize: 10, fontWeight: 800, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {count > 9 ? '9+' : count}
      </span>
    </Link>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────── */
export default function StudentDashboard() {
  const { user } = useAuth();
  const [dash, setDash] = useState(null);
  const [resume, setResume] = useState(null);
  const [tracker, setTracker] = useState(null);
  const [posts, setPosts] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [postsLoading, setPostsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    Promise.all([
      studentApi.dashboard().then(r=>setDash(r.data)).catch(e=>setError(e.message || 'Unable to load dashboard.')),
      resumeApi.latest().then(r=>setResume(r.data?.resume)).catch(e=>setError(e.message || 'Unable to load dashboard.')),
      skillApi.tracker().then(r=>setTracker(r.data)).catch(e=>setError(e.message || 'Unable to load skill progress.')),
      notificationApi.list({ limit:10 }).then(r=>setNotifs(r.data?.items||r.data||[])).catch(e=>setError(e.message || 'Unable to load dashboard.')),
    ]).finally(()=>setLoading(false));
  }, []);

  const loadPosts = async (pg=1, append=false) => {
    if (pg===1) setPostsLoading(true);
    try {
      const r = await postApi.list({ page:pg, limit:8 });
      const items = r.data?.items || [];
      append ? setPosts(p=>[...p,...items]) : setPosts(items);
      const pag = r.data?.pagination;
      setHasMore(pag ? pg < pag.pages : false);
    } catch(e) { setError(e.message || 'Unable to load feed.'); } finally { setPostsLoading(false); }
  };
  useEffect(()=>{ loadPosts(1); }, []);

  const student = dash?.student;
  const firstName = user?.firstName || student?.user?.firstName || 'there';
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const allSkills = [...new Set([
    ...(student?.skills||[]).map(s=>s.name||s),
    ...(resume?.parsed?.skills||[]),
  ])].filter(Boolean);
  const unreadNotifs = notifs.filter(n=>!n.read).length;

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .dash-grid { display:grid; grid-template-columns:1fr 340px; gap:16px; }
        @media(max-width:900px){ .dash-grid{grid-template-columns:1fr;} }
      `}</style>
      <div style={{ width:'100%', maxWidth:1100, margin:'0 auto', padding:'28px 24px 48px' }}>
        {error && <p role="alert" className="mb-4 text-red-700">{error}</p>}
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ui-ink)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
              {greeting}, {firstName}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ui-muted)', margin: 0 }}>
              {student?.targetRole
                ? <><span>Target role: </span><strong style={{ color: 'var(--ui-primary)' }}>{student.targetRole}</strong></>
                : 'Set a target role to get your personalised roadmap.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <NotifBell count={unreadNotifs} />
            <Link to="/student/profile" style={{ textDecoration: 'none' }}>
              <Avatar name={firstName} size={38} />
            </Link>
          </div>
        </div>

        {!loading && dash && <NextAction dash={dash} resume={resume} />}

        {!loading && dash && <TodayMission roadmap={dash.roadmap} />}

        <p className="student-recorded-note">A simple view of the progress SkillSetu has recorded for you so far.</p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginBottom: 28 }}>
          {loading ? [1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 86 }} />) : (<>
            <Card style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ui-primary)' }}>
                {dash?.profileCompletion != null ? `${dash.profileCompletion}%` : '—'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ui-muted)', marginTop: 2 }}>Profile complete</div>
            </Card>
            <Card style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#7c3aed' }}>
                {resume?.ats?.overall != null ? `${resume.ats.overall}%` : '—'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ui-muted)', marginTop: 2 }}>ATS Score</div>
            </Card>
            <Card style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ui-success)' }}>{allSkills.length || 0}</div>
              <div style={{ fontSize: 12, color: 'var(--ui-muted)', marginTop: 2 }}>Skills tracked</div>
            </Card>
            <Card style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ui-warning)' }}>
                {dash?.applications?.length || 0}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ui-muted)', marginTop: 2 }}>Applications</div>
            </Card>
            {(dash?.interviews?.length || 0) > 0 && (
              <Card style={{ padding: '14px 16px', background: '#FFFBEB', border: '1px solid #FCD34D' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#92400E' }}>{dash.interviews.length}</div>
                <div style={{ fontSize: 12, color: '#92400E', marginTop: 2 }}>Interviews soon</div>
              </Card>
            )}
          </>)}
        </div>

        {!loading && dash && <div className="student-dashboard-grid">
          <CareerProgress dash={dash} resume={resume} tracker={tracker} />
          <FocusSession />
        </div>}

        {!loading && dash && <div className="student-dashboard-grid student-dashboard-grid-wide">
          <section className="student-panel" aria-labelledby="student-path-title">
            <div className="student-section-heading"><div><p className="student-eyebrow">Continue your path</p><h2 id="student-path-title">{dash.roadmap?.targetRole || student?.targetRole || 'Learning roadmap'}</h2><p>Move through your next available module in order.</p></div><Link className="student-text-link" to="/student/roadmap">Open full roadmap <ArrowRight size={15} /></Link></div>
            <LearningPath roadmap={dash.roadmap} />
          </section>
          <section className="student-panel" aria-labelledby="student-focus-skills-title">
            <div className="student-section-heading"><div><p className="student-eyebrow">Recommended focus</p><h2 id="student-focus-skills-title">Skills to strengthen</h2><p>Use evaluated evidence to choose your next practice.</p></div><Link className="student-text-link" to="/student/skills">Manage skills <ArrowRight size={15} /></Link></div>
            <SkillFocus tracker={tracker} skills={allSkills} />
          </section>
        </div>}

        {!loading && dash && <section className="student-panel student-recommendation-panel" aria-labelledby="student-recommendations-title">
          <div className="student-section-heading"><div><p className="student-eyebrow">Based on your progress</p><h2 id="student-recommendations-title">Recommended for you</h2><p>Learning and opportunity suggestions from your current target role and available platform data.</p></div></div>
          <Recommendations dash={dash} />
        </section>}

        <div className="student-activity-heading"><p className="student-eyebrow">Keep moving</p><h2>Activity and support</h2><p>Your community, notifications, resume guidance, and upcoming interviews stay close when you need them.</p></div>

        <div className="dash-grid">
          {/* LEFT — Feed */}
          <div>
            <SHead
              title="Community Feed"
              to="/student/feed"
              link="Full feed →"
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>}
            />
            {user && <Compose user={user} onPosted={()=>loadPosts(1)} />}

            {postsLoading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 130, marginBottom: 14 }} />) :
              posts.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: 32, color: 'var(--ui-muted)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ margin: '0 auto 12px', color: 'var(--ui-muted)' }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>No posts yet — be the first to share!</p>
                </Card>
              ) : (
                <>
                  {posts.map(p=><PostCard key={p._id} post={p} />)}
                  {hasMore && (
                    <button onClick={()=>{ const n=page+1; setPage(n); loadPosts(n,true); }}
                      style={{ width:'100%', padding:'10px', borderRadius:10,
                        border:'1px solid #e2e8f0', background:'#f8fafc',
                        fontSize:13, fontWeight:600, color:'#1e40af', cursor:'pointer' }}>
                      ↓ Load more
                    </button>
                  )}
                </>
              )
            }
          </div>

          {/* RIGHT — Info */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Resume match */}
            <ResumeMatch resume={resume} dashData={dash} />

            {/* My Skills */}
            <Card>
            <SHead
              title="My Skills"
              to="/student/skills"
              link="Manage →"
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
            />
              {loading ? <Skel h={56} /> :
                allSkills.length===0 ? (
                  <div style={{ textAlign:'center', padding:'12px 0' }}>
                    <p style={{ fontSize:13, color:'#94a3b8', marginBottom:10 }}>No skills yet.</p>
                    <Link to="/student/resume" style={{ padding:'7px 16px', background:'#eff6ff',
                      color:'#1d4ed8', borderRadius:8, fontWeight:600, fontSize:13, textDecoration:'none' }}>
                      Upload Resume →
                    </Link>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {allSkills.slice(0,18).map(s=><Chip key={s} label={s} />)}
                    {allSkills.length>18 && (
                      <span style={{ fontSize:12, color:'#94a3b8', alignSelf:'center' }}>+{allSkills.length-18} more</span>
                    )}
                  </div>
                )
              }
            </Card>

            {/* Upcoming Interviews */}
            {!loading && (dash?.interviews||[]).length>0 && (
              <Card style={{ background:'#fef9f0', border:'1px solid #fde68a' }}>
              <SHead
                title="Upcoming Interviews"
                to="/student/interviews"
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
              />
                {dash.interviews.slice(0,3).map(iv=>(
                  <div key={iv._id} style={{ padding:'8px 10px', borderRadius:8,
                    background:'#fff', border:'1px solid #fde68a', marginBottom:8 }}>
                    <p style={{ margin:0, fontWeight:700, fontSize:13, color:'#0f2447' }}>{iv.job?.title||'Interview'}</p>
                    <p style={{ margin:0, fontSize:12, color:'#92400e' }}>
                      {new Date(iv.scheduledAt).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                    </p>
                  </div>
                ))}
              </Card>
            )}

            {/* Notifications preview */}
            {notifs.length>0 && (
              <Card>
              <SHead
                title="Notifications"
                to="/student/notifications"
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
              />
              {notifs.slice(0,4).map(n => (
                <div key={n._id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--ui-border)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--ui-soft)', color: 'var(--ui-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: n.read ? 'var(--ui-muted)' : 'var(--ui-ink)' }}>{n.title}</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--ui-muted)' }}>{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ui-primary)', flexShrink: 0, marginLeft: 'auto', marginTop: 6 }} />}
                </div>
              ))}
              </Card>
            )}

            {/* Quick actions */}
            <div style={{ background: 'var(--ui-nav)', borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>Quick Actions</h3>
              </div>
              {[
                ['/student/resume', 'Upload / View Resume', 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8'],
                ['/student/skill-tracker', 'Skill Tracker', 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'],
                ['/student/roadmap', 'Learning Roadmap', 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0'],
                ['/student/marketplace', 'Browse Jobs', 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'],
                ['/student/courses', 'Courses', 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z'],
              ].map(([to, label, d]) => (
                <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.09)', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600, marginBottom: 6, transition: 'background 0.15s' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d}/></svg>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ProgressBar({ value, tone = 'primary' }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  return <div className="student-progress-track" aria-label={`${safeValue}% complete`}><span className={`student-progress-fill is-${tone}`} style={{ width: `${safeValue}%` }} /></div>;
}

function TodayMission({ roadmap }) {
  const items = roadmap?.items || [];
  const current = items.find((item) => !item.completed);
  if (!current) {
    return (
      <section className="student-mission student-mission-empty" aria-labelledby="student-mission-title">
        <div><p className="student-eyebrow">Today&apos;s mission</p><h2 id="student-mission-title">Your roadmap is clear</h2><p>Generate a roadmap or revisit completed items to choose your next learning step.</p></div>
        <Link className="btn btn-primary" to="/student/roadmap">Open roadmap <ArrowRight size={16} /></Link>
      </section>
    );
  }
  const phaseItems = items.filter((item) => String(item.phase || 1) === String(current.phase || 1));
  const phaseComplete = phaseItems.filter((item) => item.completed).length;
  const progress = phaseItems.length ? Math.round((phaseComplete / phaseItems.length) * 100) : 0;
  return (
    <section className="student-mission" aria-labelledby="student-mission-title">
      <div className="student-mission-icon"><Target size={22} /></div>
      <div className="student-mission-body">
        <p className="student-eyebrow">Today&apos;s mission · Phase {current.phase || 1}</p>
        <h2 id="student-mission-title">{current.title}</h2>
        <p>{current.description || 'Continue the next step in your learning roadmap.'}</p>
        <div className="student-mission-progress"><ProgressBar value={progress} /><span>{phaseComplete}/{phaseItems.length} phase items</span></div>
      </div>
      <Link className="btn btn-primary" to="/student/roadmap">Continue learning <ArrowRight size={16} /></Link>
    </section>
  );
}

function LearningPath({ roadmap }) {
  const items = (roadmap?.items || []).slice(0, 8);
  if (!items.length) return <div className="student-empty-guidance"><BookOpen size={20} /><span>Set a target role to generate your first learning path.</span><Link to="/student/roadmap">Set up roadmap</Link></div>;
  const firstIncomplete = items.findIndex((item) => !item.completed);
  return (
    <div className="student-path" aria-label="Learning roadmap modules">
      {items.map((item, index) => {
        const completed = Boolean(item.completed);
        const available = completed || index === firstIncomplete;
        return <Link className={`student-path-item is-${completed ? 'completed' : available ? 'available' : 'locked'}`} to="/student/roadmap" key={item._id || `${item.title}-${index}`}>
          <span className="student-path-marker">{completed ? <CheckCircle2 size={16} /> : available ? <Play size={14} /> : <LockKeyhole size={14} />}</span>
          <span><strong>{item.title}</strong><small>{completed ? 'Completed' : available ? 'Continue learning' : 'Unlock previous step'}</small></span>
        </Link>;
      })}
    </div>
  );
}

function CareerProgress({ dash, resume, tracker }) {
  const signals = [
    { label: 'Profile', value: dash?.profileCompletion, to: '/student/profile' },
    { label: 'Resume guidance', value: resume?.ats?.overall ?? dash?.atsScore, to: '/student/resume' },
    { label: 'Evaluated skills', value: tracker?.overall ?? dash?.skillScore, to: '/student/skill-tracker' },
  ];
  const available = signals.filter((signal) => signal.value != null);
  const snapshot = available.length ? Math.round(available.reduce((sum, signal) => sum + Number(signal.value), 0) / available.length) : null;
  return <section className="student-progress-panel" aria-labelledby="student-progress-title">
    <div className="student-section-heading"><div><p className="student-eyebrow">Career progress</p><h2 id="student-progress-title">Your readiness inputs</h2><p>Recorded signals from your profile, resume, and evaluated skills. This is guidance, not a hiring prediction.</p></div>{snapshot != null && <strong className="student-progress-score">{snapshot}%</strong>}</div>
    <div className="student-signal-list">{signals.map((signal) => <Link to={signal.to} className="student-signal" key={signal.label}><span><strong>{signal.label}</strong><small>{signal.value == null ? 'Not available yet' : `${signal.value}% recorded`}</small></span>{signal.value == null ? <span className="student-signal-unavailable">—</span> : <span className="student-signal-value">{signal.value}%</span>}<ProgressBar value={signal.value} /></Link>)}</div>
  </section>;
}

function SkillFocus({ tracker, skills }) {
  const evaluated = (tracker?.scores || []).slice().sort((a, b) => Number(a.overall || 0) - Number(b.overall || 0)).slice(0, 4);
  if (!evaluated.length) return <div className="student-empty-guidance"><TrendingUp size={20} /><span>{skills.length ? 'Your profile skills are ready for evaluation.' : 'Add skills to see where to focus next.'}</span><Link to="/student/skills">Review skills</Link></div>;
  return <div className="student-skill-list">{evaluated.map((skill) => <Link to="/student/skills" className="student-skill-row" key={skill._id || skill.skill}><span><strong>{skill.skill?.name || skill.skillName || skill.skill || 'Skill'}</strong><small>Build evidence with practice</small></span><span className="student-skill-score">{skill.overall ?? 0}%</span><ProgressBar value={skill.overall} tone="warning" /></Link>)}</div>;
}

function Recommendations({ dash }) {
  const courses = dash?.recommendedCourses || [];
  const jobs = dash?.recommendedJobs || [];
  if (!courses.length && !jobs.length) return <div className="student-empty-guidance"><BookOpen size={20} /><span>Complete your target role and profile to receive relevant recommendations.</span><Link to="/student/profile">Update profile</Link></div>;
  return <div className="student-recommendations">{courses.slice(0, 3).map((course) => <Link className="student-recommendation" to="/student/courses" key={course._id}><span className="student-recommendation-icon"><BookOpen size={17} /></span><span><strong>{course.title || course.name || 'Recommended course'}</strong><small>Recommended for your target role</small></span><ArrowRight size={16} /></Link>)}{jobs.slice(0, 2).map((job) => <Link className="student-recommendation" to="/student/marketplace" key={job._id}><span className="student-recommendation-icon"><Target size={17} /></span><span><strong>{job.title || 'Open opportunity'}</strong><small>{job.company?.name || 'Published opportunity'} · Explore fit</small></span><ArrowRight size={16} /></Link>)}</div>;
}

function FocusSession() {
  const [seconds, setSeconds] = useState(25 * 60);
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!active) return undefined;
    const interval = window.setInterval(() => setSeconds((current) => {
      if (current <= 1) { setActive(false); return 0; }
      return current - 1;
    }), 1000);
    return () => window.clearInterval(interval);
  }, [active]);
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const remainder = String(seconds % 60).padStart(2, '0');
  return <section className="student-focus" aria-labelledby="student-focus-title"><div className="student-focus-icon"><Timer size={20} /></div><div><p className="student-eyebrow">Focus session</p><h2 id="student-focus-title">{seconds ? `${minutes}:${remainder}` : 'Session complete'}</h2><p>{active ? 'Stay with your current roadmap task.' : seconds ? 'A quiet 25-minute block for deliberate practice.' : 'Nice work. Start another session when you are ready.'}</p></div><button type="button" className="btn btn-secondary" onClick={() => setActive((current) => !current)}>{active ? 'Pause session' : seconds ? 'Start focus' : 'Start again'}</button></section>;
}