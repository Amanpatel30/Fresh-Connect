const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // BYPASS AUTHENTICATION FOR DEMO PURPOSES
  // Simulate a logged-in user with admin privileges
  req.user = { 
    id: 'demo-admin-id', 
    name: 'Demo Admin', 
    isAdmin: true
  };
  return next();

  // The code below is commented out to bypass authentication
  /*
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
  */
};

module.exports = authMiddleware; 