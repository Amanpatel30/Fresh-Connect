import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';

// Load env vars
dotenv.config();

// Set environment variables with fallbacks
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/major-project';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'freshconnect_secure_jwt_secret_key_2025';

// Force port 5001
const PORT = process.env.PORT || 5001;

// Debug logging
console.log('Environment variables loaded:');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('PORT:', PORT);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000, // 30 seconds timeout for server selection
  socketTimeoutMS: 60000, // 60 seconds timeout for socket operations
  connectTimeoutMS: 30000, // 30 seconds timeout for initial connection
  heartbeatFrequencyMS: 10000, // Heartbeat every 10 seconds
  maxPoolSize: 10, // Maximum 10 connections
  minPoolSize: 1, // Minimum 1 connection
  // Removed deprecated options
})
  .then(() => {
    console.log('Connected to MongoDB successfully at:', process.env.MONGODB_URI);
    
    // Start the server on port 5001 only
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`API is available at http://localhost:${PORT}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`
Error: Port 5001 is already in use
Please ensure no other application is running on port 5001 before starting the server.
To find and stop the process using port 5001:
1. Open PowerShell as Administrator
2. Run: netstat -ano | findstr :5001
3. Note the PID (last number)
4. Run: taskkill /F /PID <PID>
`);
        process.exit(1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    console.error('Error details:', err);
    console.log('Starting server without database connection...');
    
    // Start the server anyway to handle API requests with appropriate error responses
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT} (NO DATABASE CONNECTION)`);
      console.log(`API is available at http://localhost:${PORT}`);
      console.log('WARNING: The server is running without a database connection. Some features will not work.');
      console.log('Please ensure MongoDB is running at:', process.env.MONGODB_URI);
    });
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
  process.exit(1);
});

export default app;
