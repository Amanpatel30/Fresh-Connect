/**
 * Handles errors in the application, returning appropriate status code and error messages
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with error details
 */
const errorHandler = (err, req, res) => {
  // Default error status and message
  let statusCode = 500;
  let message = 'Server Error';
  let errors = {};

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    
    // Extract validation errors
    Object.keys(err.errors).forEach(key => {
      errors[key] = err.errors[key].message;
    });
  }
  
  // Mongoose duplicate key error
  else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate Key Error';
    
    // Get the field that caused the error
    const field = Object.keys(err.keyValue)[0];
    errors[field] = `${field} already exists`;
  }
  
  // Mongoose cast error (invalid ID)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid Data';
    errors[err.path] = `Invalid ${err.path}`;
  }
  
  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid Token';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token Expired';
  }
  
  // Custom AppError
  else if (err.isOperational) {
    statusCode = err.statusCode;
    message = err.message;
  }
  
  // Handle other errors
  else {
    // Console log unknown errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', err);
    }
  }

  // Return error response
  return res.status(statusCode).json({
    status: 'error',
    message,
    ...(Object.keys(errors).length > 0 && { errors }),
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default errorHandler; 