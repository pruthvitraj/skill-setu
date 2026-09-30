const { AppError } = require('../utils/AppError');

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission for this action', 403, 'FORBIDDEN'));
    }
    next();
  };
}

module.exports = { requireRoles };
