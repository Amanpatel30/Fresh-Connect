/**
 * Utility function to handle async route handlers without using try-catch blocks
 * 
 * @param {Function} fn - The async function to wrap
 * @returns {Function} Express middleware function that catches errors
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 