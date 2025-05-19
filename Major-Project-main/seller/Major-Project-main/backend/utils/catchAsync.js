export const catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(err => {
      console.error(`Error in ${fn.name || 'unnamed function'}:`, err);
      console.error(`Request path: ${req.method} ${req.originalUrl}`);
      console.error(`Request body:`, req.body);
      
      // Pass to next middleware
      next(err);
    });
  };
}; 