const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  const requestId = req?.requestId || 'unknown';

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, error: 'Invalid ID format', requestId });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, error: `${field} already exists`, requestId });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, error: messages.join(', '), requestId });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Invalid token', requestId });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Token expired', requestId });
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'File too large. Maximum size is 10MB', requestId });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ success: false, error: 'Too many files. Maximum is 10', requestId });
    }
    return res.status(400).json({ success: false, error: err.message, requestId });
  }

  if (err.message === 'File type not allowed') {
    return res.status(400).json({ success: false, error: 'File type not allowed', requestId });
  }

  console.error(`[${new Date().toISOString()}] requestId=${requestId}`, err);

  res.status(err.statusCode || 500).json({
    success: false,
    error: error.message || 'Server error',
    requestId
  });
};

module.exports = errorHandler;
