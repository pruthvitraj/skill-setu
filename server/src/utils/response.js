function success(res, message, data = {}, status = 200) {
  return res.status(status).json({ success: true, message, data });
}

function fail(res, message, errorCode = 'ERROR', status = 400, details) {
  const body = { success: false, message, errorCode };
  if (details) body.details = details;
  return res.status(status).json(body);
}

module.exports = { success, fail };
