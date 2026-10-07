import { useEffect, useRef, useState } from 'react';
import { BookOpen, ArrowUpRight } from 'lucide-react';
import Button from '../../components/common/Button';
import Feedback from '../../components/common/Feedback';
import LearningWorkspace, { LearningEmpty } from '../../components/learning/LearningWorkspace';
import LearningSearch from '../../components/learning/LearningSearch';
import { courseApi } from '../../services/courseApi';

function CourseCard({ course }) {
  return <article className="sm-panel sm-course"><div className="sm-summary"><BookOpen className="sm-icon" size={20} aria-hidden="true" /><span className="sm-meta">{course.level || 'Level not specified'} / {course.duration || 'Duration not specified'}</span></div><div><h3>{course.title}</h3><p className="sm-meta mt-2">{course.provider || 'Provider not specified'}</p></div><p className="sm-description">{course.description || 'No description provided.'}</p><div className="sm-course-footer"><span className="sm-meta sm-cyan">{course.skill || 'Skill not specified'}</span>{course.url ? <a className="btn-primary" href={course.url} target="_blank" rel="noreferrer">Open course<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only">: {course.title} (opens in a new tab)</span></a> : <span className="sm-meta">Link unavailable</span>}</div></article>;
}
export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [appliedSkill, setAppliedSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestId = useRef(0);
  const lastRequest = useRef({ page: 1, filter: '' });
  async function load(page = 1, filter = appliedSkill) {
    const id = ++requestId.current;
    lastRequest.current = { page, filter };
    setLoading(true); setError('');
    const [catalog] = await Promise.allSettled([
      courseApi.list({ page, limit: 9, skill: filter || undefined }),
    ]);
    if (id !== requestId.current) return;
    if (catalog.status === 'fulfilled') {
      setCourses(catalog.value.data.items || []);
      setPagination(catalog.value.data.pagination || { page, pages: 1, total: 0 });
      setAppliedSkill(filter);
    } else setError(catalog.reason.message || 'Unable to load courses.');
    setLoading(false);
  }
  useEffect(() => { load(); return () => { requestId.current += 1; }; }, []);
  return <LearningWorkspace title="Courses" description="Find focused resources for your next learning task. Courses open on the provider’s website; viewing them does not create competency evidence.">
    <LearningSearch />

  </LearningWorkspace>;
}
