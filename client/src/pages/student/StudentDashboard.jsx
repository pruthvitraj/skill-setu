import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentApi } from '../../services/studentApi';
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
function SHead({ title, to, link='View all →' }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
      <h2 style={{ fontSize:16, fontWeight:700, color:'#0f2447', margin:0, fontFamily:'Georgia,serif' }}>{title}</h2>
      {to && <Link to={to} style={{ fontSize:12, color:'#3b82f6', fontWeight:600, textDecoration:'none' }}>{link}</Link>}
    </div>
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
    <Card style={{ marginBottom:14 }}>
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
    <Card style={{ marginBottom:18 }}>
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
    <Card style={{ marginBottom:18, background:'#fff' }}>
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
    <Link to="/student/notifications" style={{ position:'relative', display:'inline-flex',
      padding:'6px', borderRadius:8, background:'#f1f5f9', textDecoration:'none' }}>
      🔔
      <span style={{ position:'absolute', top:-4, right:-4, background:'#ef4444',
        color:'#fff', fontSize:10, fontWeight:800, borderRadius:'50%',
        width:16, height:16, display:'flex', alignItems:'center', justifyContent:'center' }}>
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
  const allSkills = [...new Set([
    ...(student?.skills||[]).map(s=>s.name||s),
    ...(resume?.parsed?.skills||[]),
  ])].filter(Boolean);
  const unreadNotifs = notifs.filter(n=>!n.read).length;

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .dash-grid { display:grid; grid-template-columns:1fr 340px; gap:24px; }
        @media(max-width:900px){ .dash-grid{grid-template-columns:1fr;} }
      `}</style>
      <div style={{ maxWidth:1100, padding:'28px 24px 48px' }}>
        {error && <p role="alert" className="mb-4 text-red-700">{error}</p>}
        {/* Header row */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
          <div>
            <h1 style={{ fontSize:26, fontWeight:800, color:'#0f2447',
              fontFamily:'Georgia,serif', margin:'0 0 4px' }}>
              👋 Welcome back, {firstName}!
            </h1>
            <p style={{ fontSize:14, color:'#64748b', margin:0 }}>
              {student?.targetRole
                ? <>Your target role: <strong style={{color:'#1d4ed8'}}>{student.targetRole}</strong></>
                : 'Set a target role to get your personalised roadmap.'}
            </p>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <NotifBell count={unreadNotifs} />
            <Link to="/student/profile" style={{ textDecoration:'none' }}>
              <Avatar name={firstName} size={38} />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:28 }}>
          {loading ? [1,2,3,4].map(i=><Skel key={i} h={86} />) : (<>
            <Card style={{ padding:'14px 16px' }}>
              <div style={{ fontSize:22, fontWeight:800, color:'#22488f' }}>
                {dash?.profileCompletion!=null ? `${dash.profileCompletion}%` : '—'}
              </div>
              <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>Profile complete</div>
            </Card>
            <Card style={{ padding:'14px 16px' }}>
              <div style={{ fontSize:22, fontWeight:800, color:'#7c3aed' }}>
                {resume?.ats?.overall!=null ? `${resume.ats.overall}%` : '—'}
              </div>
              <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>ATS Score</div>
            </Card>
            <Card style={{ padding:'14px 16px' }}>
              <div style={{ fontSize:22, fontWeight:800, color:'#0f766e' }}>{allSkills.length||0}</div>
              <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>Skills tracked</div>
            </Card>
            <Card style={{ padding:'14px 16px' }}>
              <div style={{ fontSize:22, fontWeight:800, color:'#b45309' }}>
                {dash?.applications?.length||0}
              </div>
              <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>Applications</div>
            </Card>
            {(dash?.interviews?.length||0) > 0 && (
              <Card style={{ padding:'14px 16px', background:'#fef9f0', border:'1px solid #fde68a' }}>
                <div style={{ fontSize:22, fontWeight:800, color:'#92400e' }}>{dash.interviews.length}</div>
                <div style={{ fontSize:12, color:'#92400e', marginTop:2 }}>Interviews soon</div>
              </Card>
            )}
          </>)}
        </div>

        <div className="dash-grid">
          {/* LEFT — Feed */}
          <div>
            <SHead title="📰 Community Feed" to="/student/feed" link="Full feed →" />
            {user && <Compose user={user} onPosted={()=>loadPosts(1)} />}

            {postsLoading ? [1,2,3].map(i=><Skel key={i} h={130} />) :
              posts.length===0 ? (
                <Card style={{ textAlign:'center', padding:32, color:'#94a3b8' }}>
                  <p style={{ fontSize:28, margin:'0 0 8px' }}>✍️</p>
                  <p style={{ fontSize:14, fontWeight:600 }}>No posts yet — be the first to share!</p>
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
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            {/* Resume match */}
            <ResumeMatch resume={resume} dashData={dash} />

            {/* My Skills */}
            <Card>
              <SHead title="🛠 My Skills" to="/student/skills" link="Manage →" />
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
                <SHead title="🗓 Upcoming Interviews" to="/student/interviews" />
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
                <SHead title="🔔 Notifications" to="/student/notifications" />
                {notifs.slice(0,4).map(n=>(
                  <div key={n._id} style={{ display:'flex', gap:10, alignItems:'flex-start',
                    padding:'8px 0', borderBottom:'1px solid #f1f5f9' }}>
                    <span style={{ fontSize:18 }}>
                      {n.type==='interview'?'🗓':n.type==='announcement'?'📢':n.type==='shortlisted'?'✅':'🔔'}
                    </span>
                    <div>
                      <p style={{ margin:0, fontSize:13, fontWeight:600, color: n.read?'#64748b':'#0f2447' }}>{n.title}</p>
                      <p style={{ margin:0, fontSize:11, color:'#94a3b8' }}>{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span style={{ width:8, height:8, borderRadius:'50%',
                      background:'#3b82f6', flexShrink:0, marginLeft:'auto', marginTop:4 }} />}
                  </div>
                ))}
              </Card>
            )}

            {/* Quick actions */}
            <div style={{ background:'#0f2447',
              borderRadius:14, padding:'18px 20px' }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:'#fff', margin:'0 0 12px', fontFamily:'Georgia,serif' }}>
                🚀 Quick Actions
              </h3>
              {[
                ['/student/resume','📄 Upload / View Resume'],
                ['/student/skill-tracker','📊 Skill Tracker'],
                ['/student/roadmap','🗺 AI Roadmap'],
                ['/student/marketplace','💼 Browse Jobs'],
                ['/student/courses','📚 Courses'],
              ].map(([to,label])=>(
                <Link key={to} to={to} style={{ display:'block', padding:'9px 14px',
                  borderRadius:9, background:'rgba(255,255,255,0.12)', color:'#fff',
                  textDecoration:'none', fontSize:13, fontWeight:600, marginBottom:6 }}>
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