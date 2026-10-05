import { useCallback, useEffect, useState } from 'react';
import { companyApi } from '../../services/companyApi';
import PageHeader, { SectionHeading } from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Feedback from '../../components/common/Feedback';

export default function CompanyAnalytics() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const response = await companyApi.dashboard(); setDashboard(response.data); }
    catch (e) { setDashboard(null); setError(e.message || 'Unable to load analytics.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const monthly = dashboard?.monthlyApplications || [];
  const jobs = dashboard?.jobPerformance || [];
  const skills = dashboard?.skillDemand || [];
  const stages = dashboard?.funnel || [];
  const unavailable = value => value == null ? 'Unavailable' : value;
  return <div className="ui-page">
    <PageHeader title="Analytics" description="Recorded applications, interview activity and job requirements for your company." />
    <p className="ui-helper">Trends: last six months. Totals: all recorded applications. Stage counts are not conversion rates.</p>
    {loading ? <Feedback kind="loading">Loading analytics…</Feedback> : error || !dashboard ? <Feedback kind="error" title="Analytics unavailable" action={<Button type="button" onClick={load}>Retry analytics</Button>}>{error || 'No analytics response was received.'} No totals are shown until the request succeeds.</Feedback> : <>
      <section className="ui-section" aria-label="Recorded totals"><dl className="ui-totals">{[['Applications', dashboard.applications], ['Currently shortlisted', dashboard.shortlisted], ['Interviews', dashboard.interviews], ['Hired', dashboard.hired]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{unavailable(value)}</dd></div>)}</dl></section>
      <div className="ui-analytics-columns">
        <section className="ui-section"><SectionHeading title="Application trends" description="Applications received in each of the last six months." />{monthly.length ? <ChartList rows={monthly.map(item => ({label:item.month,value:item.applications}))} unit="applications" /> : <Feedback kind="empty">No monthly application activity recorded.</Feedback>}</section>
        <section className="ui-section"><SectionHeading title="Current application stages" description="Current lifecycle stages, not cumulative conversion." />{stages.length ? <ChartList rows={stages.map(item => ({label:item.label,value:item.value}))} unit="applications" /> : <Feedback kind="empty">No application stages recorded.</Feedback>}</section>
      </div>
      <section className="ui-section"><SectionHeading title="Job activity" description="Recorded activity by posting; shortlist and interview counts follow the existing reporting definitions." />{jobs.length ? <div className="ui-table-scroll" role="region" aria-label="Job activity table" tabIndex={0}><table className="ui-table"><caption>Application and interview counts by job</caption><thead><tr>{['Job', 'Applications', 'Shortlisted', 'Interviews'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{jobs.map((job,i) => <tr key={job._id || `${job.title}-${i}`}><td>{job.title}</td><td>{unavailable(job.applications)}</td><td>{unavailable(job.shortlisted)}</td><td>{unavailable(job.interviews)}</td></tr>)}</tbody></table></div> : <Feedback kind="empty">No job activity recorded.</Feedback>}</section>
      <section className="ui-section"><SectionHeading title="Requested skills" description="Requirements across your current jobs, not candidate competency scores." />{skills.length ? <ChartList rows={skills.map(item => ({label:item.skill,value:item.demand}))} unit="job requirements" /> : <Feedback kind="empty">No skill requirements recorded.</Feedback>}</section>
    </>}
  </div>;
}
function ChartList({ rows, unit }) {
  const max = Math.max(1, ...rows.map(item => Number(item.value) || 0));
  return <ul className="ui-chart-list">{rows.map((item,i) => <li key={`${item.label}-${i}`}><span>{item.label}</span><span>{item.value == null ? 'Unavailable' : `${item.value} ${unit}`}</span><div className="ui-chart-track" aria-hidden="true"><span style={{width:`${Math.min(100, (Number(item.value) || 0) / max * 100)}%`}} /></div></li>)}</ul>;
}
