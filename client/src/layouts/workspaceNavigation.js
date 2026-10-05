// Current destinations only. Editor/detail paths and aliases share their parent item.
const item = (path, label, aliases = []) => ({ path, label, aliases });
export const workspaceNavigation = {
  student: [
    ['Overview', [item('/student/dashboard', 'Dashboard')]],
    ['Learn', [item('/student/roadmap', 'Learning roadmap'), item('/student/courses', 'Courses'), item('/student/assessments', 'Practice & assessments'), item('/student/challenges', 'Company challenges')]],
    ['Skills & evidence', [item('/student/skills', 'Profile skills'), item('/student/skill-tracker', 'Skill tracker'), item('/student/profile', 'Profile & Digital Card')]],
    ['Opportunities', [item('/student/marketplace', 'Jobs'), item('/student/applications', 'Applications'), item('/student/interviews', 'Interviews'), item('/student/resume', 'Resume / ATS guidance')]],
    ['Community', [item('/student/feed', 'Feed'), item('/student/network', 'Network'), item('/student/messages', 'Messages')]],
    ['Account', [item('/student/notifications', 'Notifications'), item('/student/settings', 'Settings')]],
  ],
  recruiter: [
    ['Overview', [item('/company/dashboard', 'Dashboard')]],
    ['Hiring', [item('/company/applications', 'Applications'), item('/company/interviews', 'Interviews'), item('/company/jobs', 'Jobs')]],
    ['Evaluation', [item('/company/challenges', 'Company challenges')]],
    ['Campus coordination', [item('/company/drives', 'Placement drives')]],
    ['People & communication', [item('/company/network', 'Network'), item('/company/messages', 'Messages'), item('/company/team', 'Team')]],
    ['Insights', [item('/company/analytics', 'Analytics')]],
    ['Account', [item('/company/notifications', 'Notifications'), item('/company/settings', 'Settings')]],
  ],
  tpo: [
    ['Overview', [item('/tpo/dashboard', 'Dashboard')]],
    ['Students & evidence', [item('/tpo/students', 'Students'), item('/tpo/skills', 'Skill analytics'), item('/tpo/challenges', 'Company challenges')]],
    ['Placement coordination', [item('/tpo/placement-drives', 'Placement drives', ['/tpo/drives']), item('/tpo/companies', 'Companies'), item('/tpo/internships', 'Internships'), item('/tpo/applications', 'Applications'), item('/tpo/interviews', 'Interviews')]],
    ['Communication', [item('/tpo/announcements', 'Announcements'), item('/tpo/messages', 'Messages')]],
    ['Insights', [item('/tpo/placement-analytics', 'Placement analytics', ['/tpo/analytics']), item('/tpo/reports', 'Reports')]],
    ['Account', [item('/tpo/notifications', 'Notifications'), item('/tpo/settings', 'Settings')]],
  ],
};
export function isWorkspaceItemActive(item, pathname) {
  return [item.path, ...item.aliases].some(path => pathname === path || pathname.startsWith(`${path}/`));
}
