import { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import { interviewApi } from '../../services/interviewApi';

function Empty({ children }) {
  return <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">{children}</p>;
}

function dateLabel(value) {
  if (!value) return 'Date not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date not set' : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function InterviewCard({ interview }) {
  return <article className="rounded-xl border border-slate-200 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-bold text-slate-900">{interview.job?.title || 'Interview'}</h3><p className="mt-1 text-sm capitalize text-slate-500">{interview.round || 'Technical'} round · {interview.mode || 'online'}</p></div><div className="flex gap-2"><span className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold capitalize text-indigo-700">{interview.status || 'scheduled'}</span><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-700">{interview.result || 'pending'}</span></div></div><div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><p className="text-xs uppercase tracking-wide text-slate-500">When</p><p className="mt-1 font-semibold text-slate-900">{dateLabel(interview.scheduledAt)}</p></div><div><p className="text-xs uppercase tracking-wide text-slate-500">Where</p><p className="mt-1 font-semibold text-slate-900">{interview.mode === 'offline' ? interview.location || 'Location not provided' : interview.meetingLink ? <a className="text-indigo-600" href={interview.meetingLink} target="_blank" rel="noreferrer">Open meeting link</a> : 'Meeting link not provided'}</p></div></div>{interview.interviewers?.length ? <p className="mt-4 text-sm text-slate-600"><span className="font-semibold text-slate-900">Interviewers:</span> {interview.interviewers.join(', ')}</p> : null}{interview.feedback ? <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600"><p className="font-semibold text-slate-900">Feedback</p><p className="mt-1 whitespace-pre-line">{interview.feedback}</p></div> : null}</article>;
}

export default function StudentInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setLoading(true); setError('');
    interviewApi.list().then((response) => setInterviews(response.data.items || [])).catch((requestError) => setError(requestError.message || 'Unable to load interviews.')).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div className="p-6 text-sm text-slate-500">Loading your interviews...</div>;
  if (error) return <div className="p-6"><div className="card"><h1 className="text-xl font-bold">My interviews</h1><p className="mt-2 text-sm text-red-600">{error}</p><Button className="mt-4" type="button" onClick={load}>Try again</Button></div></div>;

  const now = Date.now();
  const upcoming = interviews.filter((interview) => interview.scheduledAt && new Date(interview.scheduledAt).getTime() >= now && interview.status !== 'cancelled');
  const past = interviews.filter((interview) => !upcoming.includes(interview));

  return <div className="min-h-screen bg-canvas"><div className="mx-auto max-w-5xl space-y-5 p-6">
    <header><p className="text-sm font-semibold text-indigo-600">Student workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">My interviews</h1><p className="mt-2 text-sm text-slate-500">Keep track of interview logistics, outcomes, and recruiter feedback.</p></header>
    {!interviews.length ? <section className="card"><Empty>You have no interviews scheduled yet.</Empty><a className="btn-primary mt-4 inline-flex" href="/student/applications">View applications</a></section> : <><section className="card"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold text-slate-900">Upcoming interviews</h2><span className="text-sm text-slate-500">{upcoming.length}</span></div><div className="mt-4 space-y-4">{upcoming.length ? upcoming.map((interview) => <InterviewCard interview={interview} key={interview._id} />) : <Empty>No upcoming interviews.</Empty>}</div></section><section className="card"><h2 className="text-xl font-bold text-slate-900">Interview history</h2><div className="mt-4 space-y-4">{past.length ? past.map((interview) => <InterviewCard interview={interview} key={interview._id} />) : <Empty>No past interviews.</Empty>}</div></section></>}
  </div></div>;
}