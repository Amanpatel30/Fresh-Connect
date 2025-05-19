import jwt from 'jsonwebtoken';

// Generate JWT Token function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });
};

export { generateToken }; 