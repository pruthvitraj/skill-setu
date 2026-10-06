import { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import { courseApi } from '../../services/courseApi';

function Empty({ children }) {
  return <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">{children}</p>;
}

function CourseCard({ course }) {
  return <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><span className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold capitalize text-indigo-700">{course.level || 'All levels'}</span><span className="text-xs text-slate-500">{course.duration || 'Self-paced'}</span></div><h3 className="mt-4 text-lg font-bold text-slate-900">{course.title}</h3><p className="mt-1 text-sm font-medium text-slate-500">{course.provider || 'SkillSetu learning'}</p><p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{course.description || 'Build practical knowledge for your career path.'}</p><div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4"><span className="text-xs font-semibold text-slate-500">{course.skill || 'Career development'}</span>{course.url ? <a className="btn-primary" href={course.url} target="_blank" rel="noreferrer">Open course</a> : <span className="text-xs text-slate-400">No link available</span>}</div></article>;
}

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [skill, setSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(page = 1, filter = skill) {
    setLoading(true); setError('');
    try {
      const [catalogResponse, recommendationResponse] = await Promise.all([courseApi.list({ page, limit: 9, skill: filter || undefined }), page === 1 ? courseApi.recommended() : Promise.resolve(null)]);
      setCourses(catalogResponse.data.items || []);
      setPagination(catalogResponse.data.pagination || { page, pages: 1, total: 0 });
      if (recommendationResponse) setRecommended(recommendationResponse.data.items || []);
    } catch (requestError) { setError(requestError.message || 'Unable to load courses.'); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function search(event) { event.preventDefault(); load(1, skill); }

  return <div className="student-courses-page"><div className="student-courses-container">
    <header className="student-courses-header"><div><p className="student-eyebrow">Student workspace · Learn</p><h1>Learning library</h1><p>Find focused resources for the skills you want to build next.</p></div><span className="student-courses-note">Recommendations use your current profile data</span></header>
    <section className="card"><form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={search}><label className="block flex-1"><span className="label">Filter by skill</span><input className="input" value={skill} onChange={(event) => setSkill(event.target.value)} placeholder="SQL, Python, React..." /></label><Button type="submit" disabled={loading}>Search courses</Button>{skill && <Button type="button" variant="ghost" onClick={() => { setSkill(''); load(1, ''); }}>Clear</Button>}</form></section>
    {error ? <section className="card"><p className="text-sm text-red-600">{error}</p><Button className="mt-4" type="button" onClick={() => load(pagination.page)}>Try again</Button></section> : loading ? <p className="p-6 text-sm text-slate-500">Loading courses...</p> : <>
      <section><div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-slate-900">Recommended for you</h2><p className="mt-1 text-sm text-slate-500">Based on your profile skills and target role.</p></div></div>{recommended.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{recommended.slice(0, 3).map((course) => <CourseCard course={course} key={course._id} />)}</div> : <Empty>No recommended courses yet.</Empty>}</section>
      <section><div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-xl font-bold text-slate-900">Course catalog</h2><p className="mt-1 text-sm text-slate-500">{pagination.total || 0} course{pagination.total === 1 ? '' : 's'} available.</p></div></div>{courses.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{courses.map((course) => <CourseCard course={course} key={course._id} />)}</div> : <Empty>{skill ? 'No courses match this skill.' : 'No courses are available yet.'}</Empty>}<div className="mt-6 flex items-center justify-center gap-3"><Button type="button" variant="ghost" disabled={pagination.page <= 1 || loading} onClick={() => load(pagination.page - 1)}>Previous</Button><span className="text-sm text-slate-500">Page {pagination.page || 1} of {pagination.pages || 1}</span><Button type="button" variant="ghost" disabled={pagination.page >= pagination.pages || loading} onClick={() => load(pagination.page + 1)}>Next</Button></div></section>
    </>}
  </div></div>;
}