function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (!parsed.success) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errorCode: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      });
    }
    req.validated = parsed.data;
    next();
  };
}

module.exports = { validate };
