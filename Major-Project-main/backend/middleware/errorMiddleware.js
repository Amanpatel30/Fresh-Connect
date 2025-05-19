const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  // Log the error for debugging
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Handle MongoDB connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
    console.error('Database connection error detected');
    return res.status(503).json({
      message: 'Database connection error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Database unavailable',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
  
  // Handle other specific errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: err.errors,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
  
  // Default error handling
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { notFound, errorHandler }; 