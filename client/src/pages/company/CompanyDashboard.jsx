import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { companyApi } from '../../services/companyApi';

function timeAgo(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Avatar({ name = '?', size = 36 }) {
  const pal = ['#22488f', '#7c3aed', '#0f766e', '#b45309', '#be123c', '#1d4ed8'];
  const c = pal[(name.charCodeAt(0) || 0) % pal.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: c,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.36, flexShrink: 0 }}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function Chip({ label, color = '#1d4ed8', bg = '#eff6ff', border = '#bfdbfe' }) {
  return (
    <span style={{ padding: '3px 10px', borderRadius: 20, background: bg,
      color, border: `1px solid ${border}`, fontSize: 12, fontWeight: 600 }}>
      {label}
    </span>
  );
}

function Card({ children, style = {} }) {
  return <div style={{ background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 14, padding: '18px 20px', ...style }}>{children}</div>;
}

function StatCard({ title, value, icon, color = '#22488f', trend }) {
  return (
    <Card style={{ background: 'linear-gradient(135deg, #fff, #f8fafc)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 500, color: '#64748b' }}>{title}</p>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#0f2447' }}>{value}</p>
          {trend && <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 600, color: trend.startsWith('+') ? '#16a34a' : '#ef4444' }}>{trend}</p>}
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}15`, color }}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

function ActivityItem({ activity }) {
  const colors = {
    application: '#3b82f6',
    shortlisted: '#16a34a',
    interview: '#7c3aed',
    hired: '#0f766e',
    rejected: '#ef4444',
    message: '#22488f',
    invitation: '#b45309',
  };
  const color = colors[activity.type] || '#64748b';
  return (
    <div style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, marginTop: 6, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 500, color: '#0f2447' }}>{activity.message}</p>
        <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{timeAgo(activity.createdAt)}</p>
      </div>
    </Card>
  );
}

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [dash, setDash] = useState(null);
  const [activities, setActivities] = useState([]);
  const [topJobs, setTopJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, actsRes, jobsRes] = await Promise.all([
          companyApi.dashboard(),
          companyApi.notifications.list({ limit: 10 }),
          companyApi.jobs.list({ limit: 5, page: 1 }),
        ]);
        setDash(dashRes.data?.data || dashRes.data);
        setActivities(actsRes.data?.data?.items || actsRes.data?.items || []);
        setTopJobs(jobsRes.data?.data?.items || jobsRes.data?.items || []);
      } catch (e) {
        console.error('Failed to load dashboard', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f2447', marginBottom: 20 }}>Company Dashboard</h1>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {[1,2,3,4,5,6].map(i => <Card key={i} style={{ height: 100 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f2447', margin: '0 0 4px', fontFamily: 'Georgia, serif' }}>Company Dashboard</h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: 15 }}>Welcome back, {user?.firstName}. Here's your recruitment overview.</p>
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: 24 }}>
        <StatCard title="Total Job Openings" value={dash?.totalJobs || 0} icon="📋" color="#22488f" />
        <StatCard title="Active Openings" value={dash?.activeJobs || 0} icon="🟢" color="#16a34a" />
        <StatCard title="Total Applications" value={dash?.applications || 0} icon="📄" color="#3b82f6" />
        <StatCard title="Shortlisted" value={dash?.shortlisted || 0} icon="⭐" color="#f59e0b" />
        <StatCard title="Interviews Scheduled" value={dash?.interviews || 0} icon="📅" color="#7c3aed" />
        <StatCard title="Candidates Hired" value={dash?.hired || 0} icon="🎉" color="#0f766e" />
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
        <Card style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f2447', fontFamily: 'Georgia, serif' }}>Top Performing Jobs</h2>
            <Link to="/company/jobs" style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
          </div>
          {topJobs.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '24px 0' }}>No jobs posted yet. <Link to="/company/jobs/new" style={{ color: '#3b82f6', fontWeight: 600 }}>Create your first job</Link></p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {topJobs.slice(0, 4).map(job => (
                <div key={job._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link to={`/company/jobs/${job._id}`} style={{ textDecoration: 'none' }}>
                      <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 600, color: '#0f2447' }}>{job.title}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{job.company?.name} · {job.location} · {job.jobType}</p>
                    </Link>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Chip label={`${job.applications || 0} apps`} color="#3b82f6" />
                    <Chip label={job.status} color={job.status === 'published' ? '#16a34a' : '#64748b'} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: '#0f2447', fontFamily: 'Georgia, serif' }}>Recent Activity</h2>
          {activities.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '24px 0' }}>No recent activity</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {activities.slice(0, 6).map((act, i) => (
                <ActivityItem key={act._id || i} activity={act} />
              ))}
            </div>
          )}
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <Link to="/company/notifications" style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>View all activity →</Link>
          </div>
        </Card>

        <Card>
          <h2 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: '#0f2447', fontFamily: 'Georgia, serif' }}>Hiring Funnel</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { name: 'Applied', value: dash?.applications || 0, color: '#3b82f6' },
              { name: 'Under Review', value: dash?.underReview || 0, color: '#f59e0b' },
              { name: 'Shortlisted', value: dash?.shortlisted || 0, color: '#f59e0b' },
              { name: 'Interview', value: dash?.interviews || 0, color: '#7c3aed' },
              { name: 'Hired', value: dash?.hired || 0, color: '#16a34a' },
            ].map((stage, i) => {
              const max = dash?.applications || 1;
              const pct = Math.round((stage.value / max) * 100);
              return (
                <div key={stage.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 80, fontSize: 12, fontWeight: 500, color: '#64748b' }}>{stage.name}</div>
                  <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: stage.color, borderRadius: 4, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ width: 50, textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#0f2447' }}>{stage.value}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}