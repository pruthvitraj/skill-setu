import { useEffect, useRef, useState } from 'react';
import PageHeader, { SectionHeading } from '../../components/common/PageHeader';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Feedback from '../../components/common/Feedback';
import { useNavigate } from 'react-router-dom';
import { tpoApi } from '../../services/tpoApi';

const placementStatuses = [
  { value: '', label: 'All placement statuses' },
  { value: 'available', label: 'Available' },
  { value: 'in_process', label: 'In process' },
  { value: 'placed', label: 'Placed' },
  { value: 'not_interested', label: 'Not interested' },
];

const interviewStatuses = [
  { value: '', label: 'All interview statuses' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rescheduled', label: 'Rescheduled' },
];

export default function TpoStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  const [filters, setFilters] = useState({
    q: '',
    department: '',
    batch: '',
    skill: '',
    status: '',
    interviewStatus: '',
  });

  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    batches: [],
    skills: [],
  });

  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(true);
  const [filterError, setFilterError] = useState('');
  const [error, setError] = useState('');
  const latestRequest = useRef(0);
  useEffect(() => () => { latestRequest.current += 1; }, []);

  async function loadStudents(page = 1) {
    const request = ++latestRequest.current;
    setLoading(true);
    setError('');

    try {
      const response = await tpoApi.students({
        ...filters,
        page,
        limit: pagination.limit,
      });

      if (request !== latestRequest.current) return;
      setStudents(response.data?.items || []);
      setPagination(
        response.data?.pagination || {
          page,
          pages: 1,
          total: 0,
          limit: pagination.limit,
        }
      );
    } catch (err) {
      if (request !== latestRequest.current) return;
      setError(err?.message || 'Unable to load students.');
      setStudents([]);
    } finally {
      if (request === latestRequest.current) setLoading(false);
    }
  }

  async function loadFilterOptions() {
    setFilterLoading(true);
    setFilterError('');

    try {
      const response = await tpoApi.studentFilters();

      setFilterOptions({
        departments: response.data?.departments || [],
        batches: response.data?.batches || [],
        skills: response.data?.skills || [],
      });
    } catch {
      setFilterError('Filter options could not be loaded. Search and placement/interview filters remain available.');
      setFilterOptions({
        departments: [],
        batches: [],
        skills: [],
      });
    } finally {
      setFilterLoading(false);
    }
  }

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadStudents(1);
  }, [
    filters.q,
    filters.department,
    filters.batch,
    filters.skill,
    filters.status,
    filters.interviewStatus,
  ]);

  function updateFilter(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function clearFilters() {
    setFilters({
      q: '',
      department: '',
      batch: '',
      skill: '',
      status: '',
      interviewStatus: '',
    });
  }

  const hasFilters = Object.values(filters).some(Boolean);

  return <div className="ui-page">
    <PageHeader title="Students" description="Search students belonging to your university by identity, skills, placement status and interview activity." />
    <section className="ui-section" aria-label="Student filters">
      <SectionHeading title="Find a student" description="Filters remain scoped to your university." />
      <div className="ui-filter-grid">
        <Input label="Search students" value={filters.q} onChange={event => updateFilter('q', event.target.value)} placeholder="Name, email or enrollment number" />
        <Select label="Department" value={filters.department} onChange={event => updateFilter('department', event.target.value)} disabled={filterLoading} options={[{value:'',label:'All departments'},...filterOptions.departments.map(item => ({value:item._id,label:item.name}))]} />
        <Select label="Batch" value={filters.batch} onChange={event => updateFilter('batch', event.target.value)} disabled={filterLoading} options={[{value:'',label:'All batches'},...filterOptions.batches.map(batch => ({value:batch,label:batch}))]} />
        <Select label="Skill" value={filters.skill} onChange={event => updateFilter('skill', event.target.value)} disabled={filterLoading} options={[{value:'',label:'All skills'},...filterOptions.skills.map(skill => ({value:skill,label:skill}))]} />
        <Select label="Placement status" value={filters.status} onChange={event => updateFilter('status', event.target.value)} options={placementStatuses} />
        <Select label="Interview status" value={filters.interviewStatus} onChange={event => updateFilter('interviewStatus', event.target.value)} options={interviewStatuses} />
      </div>
      {filterError && <Feedback kind="error" action={<Button variant="secondary" type="button" onClick={loadFilterOptions}>Retry filter options</Button>}>{filterError}</Feedback>}
      <div className="ui-filter-actions"><p role="status" className="ui-muted">{loading ? 'Searching…' : error ? 'Student count unavailable' : `${pagination.total} student${pagination.total === 1 ? '' : 's'} found`}</p>{hasFilters && <Button variant="secondary" type="button" onClick={clearFilters}>Clear filters</Button>}</div>
    </section>
    {loading ? <Feedback kind="loading">Loading institutional students…</Feedback> : error ? <Feedback kind="error" title="Students unavailable" action={<Button type="button" onClick={() => loadStudents(pagination.page)}>Retry students</Button>}>{error}</Feedback> : !students.length ? <Feedback kind="empty" title={hasFilters ? 'No students match these filters' : 'No institutional students found'} action={hasFilters && <Button variant="secondary" type="button" onClick={clearFilters}>Clear filters</Button>}>{hasFilters ? 'Change or clear your criteria to search again.' : 'Only students linked to your university appear here.'}</Feedback> : <>
      <div className="ui-table-scroll ui-students-desktop" role="region" aria-label="Institutional students table" tabIndex={0}>
        <table className="ui-table"><caption>University students · scroll horizontally on small screens to reach all columns and View</caption><thead><tr>{['Student','Department','Batch','Self-reported skills','Evidence score','Placement','Action'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
        <tbody>{students.map(student => { const user=student.user || {}; const name=`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed student'; return <tr key={student._id}>
          <td><strong>{name}</strong><p className="ui-helper">{user.email || 'No email'}</p>{student.enrollmentNo && <p className="ui-helper">{student.enrollmentNo}</p>}</td>
          <td>{student.department?.name || 'Not assigned'}</td><td>{student.batch || '—'}</td>
          <td>{student.skills?.length ? student.skills.slice(0,3).map(skill => skill.name).join(', ') : 'No skills added'}{student.skills?.length > 3 && ` (+${student.skills.length-3})`}</td>
          <td>{student.skillScore == null ? 'Not evaluated' : `${student.skillScore}%`}</td><td>{(student.placementStatus || 'unknown').replaceAll('_',' ')}</td>
          <td><Button variant="secondary" type="button" aria-label={`View ${name}`} onClick={() => navigate(`/tpo/students/${student._id}`)}>View</Button></td>
        </tr>; })}</tbody></table>
      </div>
      <ul className="ui-student-list" aria-label="Institutional students">{students.map(student => { const user=student.user || {}; const name=`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed student'; return <li key={student._id}>
        <h2>{name}</h2><p className="ui-helper">{user.email || 'No email'}</p>{student.enrollmentNo && <p className="ui-helper">{student.enrollmentNo}</p>}
        <dl><div><dt>Department / batch</dt><dd>{student.department?.name || 'Not assigned'} · {student.batch || '—'}</dd></div><div><dt>Self-reported skills</dt><dd>{student.skills?.length ? student.skills.map(skill => skill.name).join(', ') : 'No skills added'}</dd></div><div><dt>Evidence score / placement</dt><dd>{student.skillScore == null ? 'Not evaluated' : `${student.skillScore}%`} · {(student.placementStatus || 'unknown').replaceAll('_',' ')}</dd></div></dl>
        <Button variant="secondary" type="button" aria-label={`View ${name}`} onClick={() => navigate(`/tpo/students/${student._id}`)}>View student</Button>
      </li>; })}</ul>
      <div className="ui-pagination"><p>Showing {students.length} of {pagination.total} students</p><div><Button variant="secondary" type="button" disabled={pagination.page <= 1 || loading} onClick={() => loadStudents(pagination.page-1)}>Previous</Button><span>Page {pagination.page} of {pagination.pages}</span><Button variant="secondary" type="button" disabled={pagination.page >= pagination.pages || loading} onClick={() => loadStudents(pagination.page+1)}>Next</Button></div></div>
      <p className="ui-helper">Evidence scores summarize evaluated evidence, not hiring or placement predictions.</p>
    </>}
  </div>;
}
