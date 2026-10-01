import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { companyApi } from '../../services/companyApi';

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

function JobCard({ job, onEdit, onDelete, onDuplicate }) {
  const statusColors = {
    draft: { color: '#64748b', bg: '#f1f5f9' },
    pending_review: { color: '#f59e0b', bg: '#fffbeb' },
    published: { color: '#16a34a', bg: '#f0fdf4' },
    closed: { color: '#ef4444', bg: '#fef2f2' },
  };
  const sc = statusColors[job.status] || statusColors.draft;
  return (
    <Card style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Link to={`/company/jobs/${job._id}`} style={{ textDecoration: 'none' }}>
            <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#0f2447' }}>{job.title}</p>
          </Link>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            <Chip label={job.company?.name} color="#22488f" />
            <Chip label={job.location} color="#64748b" />
            <Chip label={job.jobType} color="#7c3aed" />
            <Chip label={job.workMode || 'on-site'} color="#0f766e" />
            <Chip label={job.status} color={sc.color} bg={sc.bg} border={sc.color} />
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
            {job.applications || 0} applications · Posted {new Date(job.createdAt).toLocaleDateString()}
            {job.deadline && ` · Deadline: ${new Date(job.deadline).toLocaleDateString()}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to={`/company/jobs/${job._id}/edit`} style={{ textDecoration: 'none' }}>
            <button style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
          </Link>
          <button onClick={() => onDuplicate?.(job._id)} style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Duplicate</button>
          <button onClick={() => onDelete?.(job._id)} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
        </div>
      </div>
    </Card>
  );
}

export default function CompanyJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [filters, setFilters] = useState({ status: '', q: '' });
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadJobs();
  }, [pagination.page, filters]);

  async function loadJobs() {
    setLoading(true);
    try {
      const res = await companyApi.jobs.list({ ...filters, page: pagination.page, limit: pagination.limit });
      const data = res.data?.data || res.data;
      setJobs(data?.items || data || []);
      setPagination(p => ({ ...p, total: data?.pagination?.total || data?.total || 0, pages: data?.pagination?.pages || 1 }));
    } catch (e) {
      console.error('Failed to load jobs', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this job? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await companyApi.jobs.delete(id);
      setJobs(jobs.filter(j => j._id !== id));
    } catch (e) {
      alert('Failed to delete job');
    } finally {
      setDeleting(null);
    }
  }

  async function handleDuplicate(id) {
    try {
      const job = jobs.find(j => j._id === id);
      if (!job) return;
      const { _id, createdAt, updatedAt, applications, ...payload } = job;
      payload.title = `${payload.title} (Copy)`;
      payload.status = 'draft';
      await companyApi.jobs.create(payload);
      loadJobs();
    } catch (e) {
      alert('Failed to duplicate job');
    }
  }

  const statusOptions = ['All', 'draft', 'pending_review', 'published', 'closed'];

  return (
    <div style={{ padding: '24px', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f2447', margin: '0 0 4px', fontFamily: 'Georgia, serif' }}>Job Openings</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Manage your job postings and track applications</p>
        </div>
        <Link to="/company/jobs/new" style={{ background: '#1e40af', color: '#fff', padding: '12px 24px', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          + Post New Job
        </Link>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value, page: 1 })} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: '#fff' }}>
            {statusOptions.map(s => <option key={s} value={s === 'All' ? '' : s}>{s}</option>)}
          </select>
          <input type="text" placeholder="Search jobs..." value={filters.q} onChange={e => setFilters({ ...filters, q: e.target.value, page: 1 })} style={{ flex: 1, minWidth: 200, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} />
        </div>
      </Card>

      {loading ? (
        Array(5).fill(0).map((_, i) => <Card key={i} style={{ height: 100 }} />)
      ) : jobs.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ fontSize: 18, fontWeight: 600, color: '#0f2447', margin: '16px 0 8px' }}>No job openings yet</p>
          <p style={{ color: '#64748b', marginBottom: 20 }}>Create your first job opening to start receiving applications</p>
          <Link to="/company/jobs/new" style={{ background: '#1e40af', color: '#fff', padding: '12px 24px', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Create Job</Link>
        </Card>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {jobs.map(job => <JobCard key={job._id} job={job} onEdit={navigate} onDelete={handleDelete} onDuplicate={handleDuplicate} />)}
          </div>
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1} style={{ padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer', opacity: pagination.page === 1 ? 0.5 : 1 }}>Previous</button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 16px', color: '#64748b' }}>Page {pagination.page} of {pagination.pages}</span>
              <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.pages} style={{ padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: pagination.page === pagination.pages ? 'not-allowed' : 'pointer', opacity: pagination.page === pagination.pages ? 0.5 : 1 }}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}