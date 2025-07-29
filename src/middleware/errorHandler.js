const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  // Database connection errors
  if (error.code === 'ECONNREFUSED') {
    return res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // PostgreSQL errors
  if (error.code === '23505') { // Unique constraint violation
    return res.status(400).json({
      success: false,
      message: 'Resource already exists'
    });
  }

  if (error.code === '23503') { // Foreign key constraint violation
    return res.status(400).json({
      success: false,
      message: 'Referenced resource does not exist'
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
};

module.exports = errorHandler;