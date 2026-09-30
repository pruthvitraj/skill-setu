class AppError extends Error {
  constructor(message, status = 400, errorCode = 'ERROR') {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
  }
}

module.exports = { AppError };
