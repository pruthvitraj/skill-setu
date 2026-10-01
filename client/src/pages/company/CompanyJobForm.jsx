import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { companyApi } from '../../services/companyApi';

const JOB_TYPES = [
  ['full_time', 'Full time'],
  ['part_time', 'Part time'],
  ['internship', 'Internship'],
  ['contract', 'Contract'],
];

const STATUSES = [
  ['draft', 'Draft'],
  ['pending_review', 'Pending review'],
  ['published', 'Published'],
  ['closed', 'Closed'],
];

const EMPTY_FORM = {
  title: '',
  description: '',
  requiredSkills: '',
  education: '',
  experience: '',
  salaryMin: '',
  salaryMax: '',
  location: '',
  jobType: 'full_time',
  positions: '1',
  deadline: '',
  eligibility: '',
  selectionProcess: '',
  status: 'draft',
};

function fieldStyle() {
  return {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: 9,
    background: '#fff',
    color: '#0f172a',
    fontSize: 14,
    outline: 'none',
  };
}

function labelStyle() {
  return {
    display: 'block',
    marginBottom: 6,
    fontSize: 13,
    fontWeight: 700,
    color: '#334155',
  };
}

function normalizeJob(response) {
  const root = response?.data?.data || response?.data || response || {};
  return root.job || root;
}

function normalizeList(response) {
  const root = response?.data?.data || response?.data || response || {};
  return Array.isArray(root) ? root : root.items || [];
}

function toDateInput(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function toForm(job) {
  return {
    title: job.title || '',
    description: job.description || '',
    requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : '',
    education: job.education || '',
    experience: job.experience || '',
    salaryMin: job.salaryMin ?? '',
    salaryMax: job.salaryMax ?? '',
    location: job.location || '',
    jobType: job.jobType || 'full_time',
    positions: job.positions ?? 1,
    deadline: toDateInput(job.deadline),
    eligibility: job.eligibility || '',
    selectionProcess: job.selectionProcess || '',
    status: job.status || 'draft',
  };
}

export default function CompanyJobForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editing) return;

    async function loadJob() {
      try {
        setLoading(true);
        setError('');

        // The public GET /jobs/:id only returns published jobs. For recruiter editing,
        // load the authenticated recruiter's own jobs and select the requested job.
        const response = await companyApi.jobs.list({ page: 1, limit: 100 });
        const jobs = normalizeList(response);
        const job = jobs.find((item) => String(item._id) === String(id));

        if (!job) {
          throw new Error('Job posting not found in your company account.');
        }

        setForm(toForm(job));
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Unable to load this job posting.');
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [editing, id]);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const buildPayload = () => {
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      requiredSkills: form.requiredSkills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean),
      education: form.education.trim() || undefined,
      experience: form.experience.trim() || undefined,
      salaryMin: form.salaryMin === '' ? undefined : Number(form.salaryMin),
      salaryMax: form.salaryMax === '' ? undefined : Number(form.salaryMax),
      location: form.location.trim() || undefined,
      jobType: form.jobType,
      positions: Number(form.positions) || 1,
      deadline: form.deadline ? new Date(`${form.deadline}T23:59:59`).toISOString() : undefined,
      eligibility: form.eligibility.trim() || undefined,
      selectionProcess: form.selectionProcess.trim() || undefined,
      status: form.status,
    };

    return payload;
  };

  const validate = () => {
    if (!form.title.trim()) return 'Job title is required.';
    if (form.salaryMin !== '' && Number(form.salaryMin) < 0) return 'Minimum salary cannot be negative.';
    if (form.salaryMax !== '' && Number(form.salaryMax) < 0) return 'Maximum salary cannot be negative.';
    if (form.salaryMin !== '' && form.salaryMax !== '' && Number(form.salaryMin) > Number(form.salaryMax)) {
      return 'Minimum salary cannot be greater than maximum salary.';
    }
    if (!form.positions || Number(form.positions) < 1) return 'At least one position is required.';
    return '';
  };

  const submit = async (event) => {
    event.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = buildPayload();
      if (editing) {
        await companyApi.jobs.update(id, payload);
      } else {
        await companyApi.jobs.create(payload);
      }

      navigate('/company/jobs', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || `Unable to ${editing ? 'update' : 'create'} the job posting.`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', maxWidth: '1000px' }}>
        <div style={{ color: '#64748b', fontSize: 14 }}>Loading job posting...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px' }}>
      <div style={{ marginBottom: 24 }}>
        <Link
          to="/company/jobs"
          style={{ color: '#1d4ed8', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
        >
          ← Back to Job Openings
        </Link>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#0f2447',
            margin: '12px 0 4px',
            fontFamily: 'Georgia, serif',
          }}
        >
          {editing ? 'Edit Job Posting' : 'Post New Job'}
        </h1>
        <p style={{ margin: 0, color: '#64748b' }}>
          {editing ? 'Update the details of this job opening.' : 'Create a real job opening for students and candidates on SkillSetu.'}
        </p>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: '12px 14px',
            borderRadius: 9,
            border: '1px solid #fecaca',
            background: '#fef2f2',
            color: '#b91c1c',
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={submit}>
        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 22,
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: '0 0 18px', fontSize: 17, color: '#0f2447' }}>Basic Information</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <label>
              <span style={labelStyle()}>Job title *</span>
              <input
                style={fieldStyle()}
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="e.g. Junior Data Engineer"
                required
              />
            </label>

            <label>
              <span style={labelStyle()}>Location</span>
              <input
                style={fieldStyle()}
                value={form.location}
                onChange={(event) => updateField('location', event.target.value)}
                placeholder="e.g. Bengaluru / Remote"
              />
            </label>
          </div>

          <label style={{ display: 'block', marginTop: 16 }}>
            <span style={labelStyle()}>Description</span>
            <textarea
              style={{ ...fieldStyle(), minHeight: 130, resize: 'vertical' }}
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Describe the role, responsibilities and what the candidate will work on."
            />
          </label>

          <label style={{ display: 'block', marginTop: 16 }}>
            <span style={labelStyle()}>Required skills</span>
            <input
              style={fieldStyle()}
              value={form.requiredSkills}
              onChange={(event) => updateField('requiredSkills', event.target.value)}
              placeholder="React, JavaScript, Node.js, MongoDB"
            />
            <span style={{ display: 'block', marginTop: 5, fontSize: 12, color: '#64748b' }}>
              Separate skills with commas.
            </span>
          </label>
        </div>

        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 22,
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: '0 0 18px', fontSize: 17, color: '#0f2447' }}>Requirements & Compensation</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <label>
              <span style={labelStyle()}>Education</span>
              <input style={fieldStyle()} value={form.education} onChange={(event) => updateField('education', event.target.value)} placeholder="B.E / B.Tech in Computer Science" />
            </label>

            <label>
              <span style={labelStyle()}>Experience</span>
              <input style={fieldStyle()} value={form.experience} onChange={(event) => updateField('experience', event.target.value)} placeholder="0-2 years" />
            </label>

            <label>
              <span style={labelStyle()}>Job type</span>
              <select style={fieldStyle()} value={form.jobType} onChange={(event) => updateField('jobType', event.target.value)}>
                {JOB_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>

            <label>
              <span style={labelStyle()}>Number of positions</span>
              <input style={fieldStyle()} type="number" min="1" value={form.positions} onChange={(event) => updateField('positions', event.target.value)} />
            </label>

            <label>
              <span style={labelStyle()}>Minimum salary (₹)</span>
              <input style={fieldStyle()} type="number" min="0" value={form.salaryMin} onChange={(event) => updateField('salaryMin', event.target.value)} placeholder="600000" />
            </label>

            <label>
              <span style={labelStyle()}>Maximum salary (₹)</span>
              <input style={fieldStyle()} type="number" min="0" value={form.salaryMax} onChange={(event) => updateField('salaryMax', event.target.value)} placeholder="1000000" />
            </label>

            <label>
              <span style={labelStyle()}>Application deadline</span>
              <input style={fieldStyle()} type="date" value={form.deadline} onChange={(event) => updateField('deadline', event.target.value)} />
            </label>

            <label>
              <span style={labelStyle()}>Status</span>
              <select style={fieldStyle()} value={form.status} onChange={(event) => updateField('status', event.target.value)}>
                {STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 22,
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: '0 0 18px', fontSize: 17, color: '#0f2447' }}>Eligibility & Selection</h2>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={labelStyle()}>Eligibility</span>
            <textarea
              style={{ ...fieldStyle(), minHeight: 90, resize: 'vertical' }}
              value={form.eligibility}
              onChange={(event) => updateField('eligibility', event.target.value)}
              placeholder="e.g. 2026 batch, 7.5+ CGPA, no active backlogs"
            />
          </label>

          <label style={{ display: 'block' }}>
            <span style={labelStyle()}>Selection process</span>
            <textarea
              style={{ ...fieldStyle(), minHeight: 90, resize: 'vertical' }}
              value={form.selectionProcess}
              onChange={(event) => updateField('selectionProcess', event.target.value)}
              placeholder="Application → Shortlist → Assessment → Interview → Selection"
            />
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
          <Link
            to="/company/jobs"
            style={{
              background: '#fff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '11px 20px',
              borderRadius: 9,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: '#1e40af',
              color: '#fff',
              border: 'none',
              padding: '11px 22px',
              borderRadius: 9,
              fontSize: 14,
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.65 : 1,
            }}
          >
            {saving ? (editing ? 'Saving...' : 'Creating...') : (editing ? 'Save Changes' : 'Create Job')}
          </button>
        </div>
      </form>
    </div>
  );
}
