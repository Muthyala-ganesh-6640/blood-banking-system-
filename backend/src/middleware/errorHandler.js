// Centralized error handler
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Validation errors
  if (err && err.errors && Array.isArray(err.errors)) {
    return res.status(400).json({ errors: err.errors });
  }

  if (err && err.statusCode) {
    return res.status(err.statusCode).json({
      message: err.message || 'Request failed'
    });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
}

module.exports = errorHandler;

