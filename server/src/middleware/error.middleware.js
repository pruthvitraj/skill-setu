const { AppError } = require('../utils/AppError');
const logger = require('../utils/logger');

function errorMiddleware(err, req, res, next) {
  if (res.headersSent) return next(err);

  const status = err.code === 11000 ? 409 : err.name === 'CastError' || err.name === 'ValidationError' ? 422 : err.status || 500;
  const errorCode = err.errorCode || (status === 500 ? 'INTERNAL_ERROR' : 'ERROR');
  if (status >= 500) logger.error(err.stack || err.message);

  res.status(status).json({
    success: false,
    message: err.code === 11000 ? 'This record already exists' : status === 500 ? 'Something went wrong' : err.message,
    errorCode,
  });
}

function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found', errorCode: 'NOT_FOUND' });
}

module.exports = { errorMiddleware, notFound, AppError };
