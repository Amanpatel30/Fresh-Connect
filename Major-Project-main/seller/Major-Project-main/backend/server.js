import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import urgentSalesRoutes from './routes/urgentSalesRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import paymentMethodRoutes from './routes/paymentMethodRoutes.js';
import paymentTransactionRoutes from './routes/paymentTransactionRoutes.js';
import sellerProductRoutes from './routes/sellerProductRoutes.js';
import sellerOrderRoutes from './routes/sellerOrderRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import sellerReviewRoutes from './routes/sellerReviewRoutes.js';
import sellerAnalyticsRoutes from './routes/sellerAnalyticsRoutes.js';
import sellerPaymentRoutes from './routes/sellerPaymentRoutes.js';

// Load env vars
dotenv.config();

// Set environment variables with fallbacks
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || '5001';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/major-project';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'freshconnect_secure_jwt_secret_key_2025';

// Debug logging
console.log('Environment variables loaded:');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('PORT:', process.env.PORT);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Get directory name for static file serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/uploads', uploadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/urgent-sales', urgentSalesRoutes);
app.use('/api/urgentsales', urgentSalesRoutes);
app.use('/api/seller/urgent-sales', urgentSalesRoutes);
app.use('/api/seller/urgentsales', urgentSalesRoutes);
app.use('/api/seller/payment-methods', paymentMethodRoutes);
app.use('/api/seller/payment-transactions', paymentTransactionRoutes);
app.use('/api/seller/products', sellerProductRoutes);
app.use('/api/seller/orders', sellerOrderRoutes);
app.use('/api/seller/categories', categoryRoutes);
app.use('/api/seller/settings', settingsRoutes);
app.use('/api/seller/reviews', sellerReviewRoutes);
app.use('/api/seller/analytics', sellerAnalyticsRoutes);
app.use('/api/seller/payments', sellerPaymentRoutes);

// Special route for profile debugging
app.get('/api/seller/profile/debug', (req, res) => {
  console.log('Debug profile endpoint accessed');
  res.status(200).json({
    status: 'success',
    message: 'Profile debug endpoint is working',
    serverTime: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mockMode: true,
    data: {
      _id: '123456789',
      name: 'Debug User',
      email: 'debug@example.com',
      phone: '1234567890',
      shopName: 'Debug Shop',
      address: 'Debug Address',
      description: 'This is a debug profile for testing purposes.',
      avatar: 'https://source.unsplash.com/random/150x150/?portrait',
      shopImage: 'https://source.unsplash.com/random/800x400/?store',
      documents: {
        gst: 'GST12345',
        pan: 'PAN12345',
        fssai: 'FSSAI12345'
      }
    }
  });
});

// Add a direct route for testing seller profile
app.get('/api/seller/profile/test', (req, res) => {
  console.log('Test profile endpoint accessed');
  res.status(200).json({
    status: 'success',
    message: 'This is a test profile endpoint that bypasses authentication',
    data: {
      _id: 'test123',
      name: 'Test User',
      email: 'test@example.com',
      phone: '9876543210',
      shopName: 'Test Shop',
      address: 'Test Address',
      description: 'This is a test profile for debugging purposes.',
      avatar: 'https://source.unsplash.com/random/150x150/?portrait',
      shopImage: 'https://source.unsplash.com/random/800x400/?store',
      documents: {
        gst: '',
        pan: '',
        fssai: ''
      }
    }
  });
});

// Global variable to track DB connection status
let isDbConnected = false;

// Database connection
const connectDB = async () => {
  console.log('Attempting MongoDB connection...');
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);
    console.log(`Connection state: ${conn.connection.readyState}`);
    
    isDbConnected = true;
    return true;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    isDbConnected = false;
    return false;
  }
};

// Database status endpoint
app.get('/api/db-status', (req, res) => {
  const connectionStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  const status = {
    connected: mongoose.connection.readyState === 1,
    state: connectionStates[mongoose.connection.readyState] || 'unknown',
    dbName: mongoose.connection.name || 'not connected',
    host: mongoose.connection.host || 'not connected',
    port: mongoose.connection.port || 'not connected'
  };
  
  res.json(status);
});

// Middleware to check DB connection
app.use('/api/products', (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    if (!isDbConnected) {
      console.error('Attempt to modify data while database is disconnected');
      return res.status(503).json({ 
        status: 'error',
        message: 'Database connection is not available. Please try again later.' 
      });
    }
  }
  next();
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `Duplicate field value: ${field}. Please use another value.`
    });
  }
  
  // Mongoose cast error (invalid ID)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please log in again.'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Your token has expired. Please log in again.'
    });
  }
  
  // Default to 500 server error
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    availableRoutes: [
      '/api/auth',
      '/api/users',
      '/api/products',
      '/api/orders',
      '/api/seller/profile',
      '/api/seller/dashboard',
      '/api/seller/urgent-sales',
      '/api/seller/payment-methods',
      '/api/seller/payment-transactions',
      '/api/seller/products',
      '/api/seller/orders'
    ]
  });
});

// Function to start server with retry logic
const startServer = async (retryCount = 0) => {
  const maxRetries = 5;
  const connected = await connectDB();
  
  if (connected) {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  } else if (retryCount < maxRetries) {
    console.log(`Retrying database connection (${retryCount + 1}/${maxRetries})...`);
    setTimeout(() => startServer(retryCount + 1), 5001);
  } else {
    console.error(`Failed to connect to database after ${maxRetries} attempts`);
    console.log('Starting server without database connection...');
    
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT} (without database connection)`);
    });
  }
};

// Start the server
startServer();
