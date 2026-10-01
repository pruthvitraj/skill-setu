import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { companyApi } from '../../services/companyApi';

function Chip({ label, color = '#1d4ed8', bg = '#eff6ff', border = '#bfdbfe' }) {
  if (!label) return null;
  return (
    <span
      style={{
        padding: '3px 10px',
        borderRadius: 20,
        background: bg,
        color,
        border: `1px solid ${border}`,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '18px 20px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function statusStyle(status) {
  const styles = {
    draft: { color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' },
    pending_review: { color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
    published: { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
    closed: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  };
  return styles[status] || styles.draft;
}

function formatSalary(min, max) {
  if (min == null && max == null) return 'Salary not specified';
  const format = (value) => {
    if (value == null || value === '') return null;
    return `₹${Number(value).toLocaleString('en-IN')}`;
  };
  const a = format(min);
  const b = format(max);
  if (a && b) return `${a} - ${b}`;
  return a || b;
}

function JobCard({ job, deleting, onDelete, onDuplicate }) {
  const sc = statusStyle(job.status);
  const skills = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];

  return (
    <Card style={{ marginBottom: 12 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f2447' }}>
              {job.title}
            </p>
            <Chip
              label={(job.status || 'draft').replace(/_/g, ' ')}
              color={sc.color}
              bg={sc.bg}
              border={sc.border}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            <Chip label={job.company?.name || 'Company'} color="#22488f" />
            <Chip label={job.location || 'Location not specified'} color="#64748b" bg="#f8fafc" border="#e2e8f0" />
            <Chip label={(job.jobType || 'full_time').replace(/_/g, ' ')} color="#0f766e" bg="#f0fdfa" border="#99f6e4" />
            <Chip label={`${job.positions || 0} position${job.positions === 1 ? '' : 's'}`} color="#7c3aed" bg="#f5f3ff" border="#ddd6fe" />
          </div>

          <p style={{ margin: '12px 0 6px', fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
            {job.description || 'No description added.'}
          </p>

          {skills.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {skills.slice(0, 6).map((skill) => (
                <Chip key={skill} label={skill} color="#334155" bg="#f8fafc" border="#e2e8f0" />
              ))}
              {skills.length > 6 && <Chip label={`+${skills.length - 6} more`} color="#64748b" bg="#f8fafc" border="#e2e8f0" />}
            </div>
          )}

          <p style={{ margin: '12px 0 0', fontSize: 12, color: '#64748b' }}>
            {formatSalary(job.salaryMin, job.salaryMax)}
            {' · '}
            {job.applications || 0} applications
            {job.deadline && ` · Deadline: ${new Date(job.deadline).toLocaleDateString()}`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Link to={`/company/jobs/${job._id}/edit`} style={{ textDecoration: 'none' }}>
            <button
              type="button"
              style={{
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #e2e8f0',
                padding: '8px 15px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Edit
            </button>
          </Link>

          <button
            type="button"
            onClick={() => onDuplicate(job)}
            style={{
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #e2e8f0',
              padding: '8px 15px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Duplicate
          </button>

          <button
            type="button"
            disabled={deleting === job._id}
            onClick={() => onDelete(job._id)}
            style={{
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              padding: '8px 15px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: deleting === job._id ? 'not-allowed' : 'pointer',
              opacity: deleting === job._id ? 0.6 : 1,
            }}
          >
            {deleting === job._id ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </Card>
  );
}

function normalizeList(response) {
  const root = response?.data?.data || response?.data || response || {};
  return {
    items: Array.isArray(root) ? root : root.items || [],
    pagination: root.pagination || {},
  };
}

export default function CompanyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [filters, setFilters] = useState({ status: '', q: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const loadJobs = async (showRefresh = false) => {
    try {
      showRefresh ? setRefreshing(true) : setLoading(true);
      setError('');

      const response = await companyApi.jobs.list({
        status: filters.status || undefined,
        q: filters.q || undefined,
        page: pagination.page,
        limit: pagination.limit,
      });

      const result = normalizeList(response);
      setJobs(result.items);
      setPagination((current) => ({
        ...current,
        total: result.pagination.total ?? result.items.length,
        pages: result.pagination.pages ?? Math.max(1, Math.ceil((result.pagination.total ?? result.items.length) / current.limit)),
      }));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to load job postings.');
      setJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters.status, filters.q]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job posting? This cannot be undone.')) return;

    try {
      setDeleting(id);
      await companyApi.jobs.delete(id);
      await loadJobs(true);
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Failed to delete job posting.');
    } finally {
      setDeleting(null);
    }
  };

  const handleDuplicate = async (job) => {
    try {
      const payload = {
        title: `${job.title} (Copy)`,
        description: job.description || '',
        requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills : [],
        education: job.education || '',
        experience: job.experience || '',
        salaryMin: job.salaryMin ?? undefined,
        salaryMax: job.salaryMax ?? undefined,
        location: job.location || '',
        jobType: job.jobType || 'full_time',
        positions: job.positions || 1,
        deadline: job.deadline ? new Date(job.deadline).toISOString() : undefined,
        eligibility: job.eligibility || '',
        selectionProcess: job.selectionProcess || '',
        status: 'draft',
      };

      await companyApi.jobs.create(payload);
      await loadJobs(true);
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Failed to duplicate job posting.');
    }
  };

  const setFilter = (key, value) => {
    setPagination((current) => ({ ...current, page: 1 }));
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1100px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#0f2447',
              margin: '0 0 4px',
              fontFamily: 'Georgia, serif',
            }}
          >
            Job Openings
          </h1>
          <p style={{ margin: 0, color: '#64748b' }}>
            Manage your job postings and track applications
          </p>
        </div>

        <Link
          to="/company/jobs/new"
          style={{
            background: '#1e40af',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 10,
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          + Post New Job
        </Link>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={filters.status}
            onChange={(event) => setFilter('status', event.target.value)}
            style={{
              padding: '9px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 13,
              background: '#fff',
              color: '#334155',
            }}
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending review</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>

          <input
            type="text"
            placeholder="Search job title or description..."
            value={filters.q}
            onChange={(event) => setFilter('q', event.target.value)}
            style={{
              flex: 1,
              minWidth: 220,
              padding: '9px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 13,
              outline: 'none',
            }}
          />

          <button
            type="button"
            onClick={() => loadJobs(true)}
            disabled={refreshing}
            style={{
              background: '#fff',
              color: '#334155',
              border: '1px solid #e2e8f0',
              padding: '9px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: refreshing ? 'not-allowed' : 'pointer',
            }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </Card>

      {error && (
        <Card style={{ marginBottom: 16, background: '#fef2f2', borderColor: '#fecaca' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
            <p style={{ margin: 0, color: '#b91c1c', fontSize: 14 }}>{error}</p>
            <button
              type="button"
              onClick={() => loadJobs(true)}
              style={{
                background: '#fff',
                color: '#b91c1c',
                border: '1px solid #fecaca',
                padding: '7px 12px',
                borderRadius: 7,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        </Card>
      )}

      {loading ? (
        Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} style={{ height: 145, marginBottom: 12 }} />
        ))
      ) : jobs.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '55px 24px' }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>💼</div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#0f2447', margin: '0 0 8px' }}>
            No job openings found
          </p>
          <p style={{ color: '#64748b', margin: '0 0 20px' }}>
            Create your first job opening to start receiving applications.
          </p>
          <Link
            to="/company/jobs/new"
            style={{
              background: '#1e40af',
              color: '#fff',
              padding: '11px 22px',
              borderRadius: 9,
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: 14,
              display: 'inline-block',
            }}
          >
            + Post New Job
          </Link>
        </Card>
      ) : (
        <>
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              deleting={deleting}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ))}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 18,
              paddingTop: 16,
              borderTop: '1px solid #e2e8f0',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Showing {jobs.length} of {pagination.total} job{pagination.total === 1 ? '' : 's'}
            </span>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}
                style={{
                  padding: '8px 13px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#334155',
                  cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: pagination.page <= 1 ? 0.5 : 1,
                }}
              >
                Previous
              </button>
              <span style={{ padding: '8px 10px', fontSize: 13, color: '#64748b' }}>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                type="button"
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}
                style={{
                  padding: '8px 13px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#334155',
                  cursor: pagination.page >= pagination.pages ? 'not-allowed' : 'pointer',
                  opacity: pagination.page >= pagination.pages ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
