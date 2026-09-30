export function fullName(user) {
  if (!user) return '—';
  return `${user.firstName || ''} ${user.lastName || ''}`.trim();
}

export function roleHome(role) {
  if (role === 'tpo') return '/tpo/dashboard';
  if (role === 'recruiter') return '/recruiter/dashboard';
  return '/student/dashboard';
}
