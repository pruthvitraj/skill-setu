import { Terminal, Route, BookOpen, ListChecks } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import PageHeader from '../common/PageHeader';
import '../../styles/shellmentor.css';

const links = [
  { to: '/student/roadmap', label: 'Learning roadmap', icon: Route },
  { to: '/student/courses', label: 'Courses', icon: BookOpen },
  { to: '/student/assessments', label: 'Practice & assessments', icon: ListChecks },
];
export default function LearningWorkspace({ title, description, children }) {
  return <div className="sm-learning"><div className="sm-content">
    <div className="sm-overline sm-workspace-label"><Terminal size={16} aria-hidden="true" />SkillSetu / Learning workspace</div>
    <nav className="sm-learning-nav" aria-label="Student learning">{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to}><Icon size={16} aria-hidden="true" />{label}</NavLink>)}</nav>
    <PageHeader title={title} description={description} />
    {children}
  </div></div>;
}
export function LearningEmpty({ children }) {
  return <div className="sm-empty">{children}</div>;
}
