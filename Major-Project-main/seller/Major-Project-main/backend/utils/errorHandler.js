// Error handler for API requests
export const errorHandler = (error, req, res) => {
  console.error('Error:', error);
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `Duplicate field value: ${field}. Please use another value.`
    });
  }
  
  // Mongoose cast error (invalid ID)
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${error.path}: ${error.value}`
    });
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please log in again.'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Your token has expired. Please log in again.'
    });
  }
  
  // Default to 500 server error
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
}; 