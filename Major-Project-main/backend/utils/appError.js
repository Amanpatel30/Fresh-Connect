/**
 * Custom Error class for handling operational errors
 * This class extends the built-in Error class and adds additional properties
 * for better error handling and formatting in API responses
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError; 