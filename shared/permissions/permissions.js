const { ROLES } = require('../constants/roles');

const PERMISSIONS = {
  [ROLES.STUDENT]: [
    'profile:own',
    'resume:own',
    'assessment:take',
    'scores:own',
    'roadmap:own',
    'jobs:view',
    'jobs:apply',
    'applications:own',
    'interviews:own',
    'messages:allowed',
  ],
  [ROLES.TPO]: [
    'university:manage',
    'students:university',
    'skills:analytics',
    'drives:manage',
    'companies:requests',
    'announcements:create',
    'placement:analytics',
    'reports:generate',
  ],
  [ROLES.RECRUITER]: [
    'company:manage',
    'jobs:create',
    'jobs:own',
    'candidates:eligible',
    'applications:manage',
    'interviews:schedule',
    'hire:candidates',
    'drives:request',
  ],
};

function hasPermission(role, permission) {
  return Boolean(PERMISSIONS[role]?.includes(permission));
}

module.exports = { PERMISSIONS, hasPermission };
