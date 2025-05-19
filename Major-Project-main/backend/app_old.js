import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import leftoverFoodRoutes from './routes/leftoverFoodRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import menuItemRoutes from './routes/menuItemRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import urgentSaleRoutes from './routes/urgentSaleRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import fileUpload from 'express-fileupload';

// Seller routes
import sellerRoutes from './routes/sellerRoutes.js';
import sellerProductRoutes from './routes/sellerProductRoutes.js';
import sellerOrderRoutes from './routes/sellerOrderRoutes.js';
import sellerUrgentSalesRoutes from './routes/sellerUrgentSalesRoutes.js';
import sellerAnalyticsRoutes from './routes/sellerAnalyticsRoutes.js';
import sellerPaymentRoutes from './routes/sellerPaymentRoutes.js';
import sellerReviewRoutes from './routes/sellerReviewRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import Hotel from './models/Hotel.js';
import mongoose from 'mongoose';
import User from './models/User.js';
import * as productController from './controllers/productController.js';
import fs from 'fs';

// Direct wishlist handlers for backward compatibility
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  checkWishlist,
  moveToCart
} from './controllers/wishlistController.js';
import { protect } from './middleware/authMiddleware.js';

// Direct cart handlers for backward compatibility
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  applyCoupon,
  calculateShipping
} from './controllers/cartController.js';

// Import the uploads route using ES module syntax
import uploadsRoutes from './routes/uploads.js';

dotenv.config();

const app = express();

// Update CORS configuration to be more permissive for development
app.use(cors({
  origin: function(origin, callback) {
    // Allow any origin for development
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role', 'Origin', 'Accept'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests manually for more debugging
app.options('*', (req, res) => {
  console.log('Received preflight request from:', req.headers.origin);
  console.log('Requested method:', req.headers['access-control-request-method']);
  console.log('Requested headers:', req.headers['access-control-request-headers']);
  
  res.status(204).end();
});

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (req.method !== 'GET') {
    console.log('Request body:', req.body);
  }
  next();
});

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create a public/uploads directory if it doesn't exist
const publicUploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(publicUploadsDir)) {
  fs.mkdirSync(publicUploadsDir, { recursive: true });
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Then add this middleware setup before the routes are defined
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true
}));

// Authentication check endpoint
app.get('/api/check-auth', async (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.log('Invalid token:', err.message);
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      // Check if MongoDB is connected
      if (mongoose.connection.readyState !== 1) {
        console.log('MongoDB not connected, using mock user for check-auth');
        // Return mock user for development when database is unavailable
        return res.status(200).json({
          message: 'Authentication successful (MOCK - No DB Connection)',
          user: {
            id: decoded.id || '67ce83e6b49cd8fe9297a753',
            email: 'mock@example.com',
            name: 'Mock User',
            role: 'hotel',
            isHotel: true,
            hotelId: decoded.id || '67ce83e6b49cd8fe9297a753'
          }
        });
      }
      
      // Find the user by ID
      try {
        // First try to find in Hotel model
        const hotel = await Hotel.findById(decoded.id);
        if (hotel) {
          console.log('Authenticated hotel user:', {
            id: decoded.id,
            role: 'hotel',
            model: 'Hotel'
          });
          
          // Return hotel user info
          return res.status(200).json({
            message: 'Authentication successful',
            user: {
              id: decoded.id,
              email: hotel.email,
              name: hotel.name,
              role: 'hotel',
              isHotel: true,
              hotelId: hotel._id
            }
          });
        }
        
        // If not found in Hotel model, try User model
        const user = await User.findById(decoded.id);
        if (user) {
          console.log('Authenticated regular user:', {
            id: decoded.id,
            role: user.role,
            model: 'User'
          });
          
          // Return regular user info
          return res.status(200).json({
            message: 'Authentication successful',
            user: {
              id: decoded.id,
              email: user.email,
              name: user.name,
              role: user.role || 'user',
              isUser: true,
              userId: user._id
            }
          });
        }
        
        console.log('User not found in either Hotel or User models');
        return res.status(401).json({ message: 'User not found' });
      } catch (error) {
        console.error('Error finding user:', error);
        
        // If it's a database connection error, return mock user
        if (error.name === 'MongooseError' || error.name === 'MongoError') {
          console.log('Database error during check-auth, using mock user');
          return res.status(200).json({
            message: 'Authentication successful (MOCK - DB Error)',
            user: {
              id: decoded.id || '67ce83e6b49cd8fe9297a753',
              email: 'mock@example.com',
              name: 'Mock User',
              role: 'hotel',
              isHotel: true,
              hotelId: decoded.id || '67ce83e6b49cd8fe9297a753'
            }
          });
        }
        
        return res.status(500).json({ message: 'Server error' });
      }
    });
  } catch (error) {
    console.error('Error in check-auth endpoint:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Routes
app.use('/api/users', userRoutes);
app.use('/user', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/leftover-food', leftoverFoodRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/urgent-sales', urgentSaleRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Seller routes
app.use('/api/sellers', sellerRoutes);
app.use('/api/seller/products', sellerProductRoutes);
app.use('/api/seller/orders', sellerOrderRoutes);
app.use('/api/seller/urgent-sales', sellerUrgentSalesRoutes);
app.use('/api/seller/analytics', sellerAnalyticsRoutes);
app.use('/api/seller/payments', sellerPaymentRoutes);
app.use('/api/seller/reviews', sellerReviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/settings', settingsRoutes);

// Test endpoints
app.get('/api/test', (req, res) => {
  res.json({ message: 'API test endpoint is working' });
});

// Direct auth endpoints for compatibility with frontend
app.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Email not registered'
      });
    }
    
    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect password'
      });
    }
    
    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during login'
    });
  }
});

app.post('/users/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'user' // Default role
    });

    if (user) {
      // Generate token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });
      
      res.status(201).json({
        status: 'success',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          token
        }
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during registration'
    });
  }
});

// Direct check-auth endpoint for frontend compatibility
app.get('/check-auth', async (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.log('Invalid token:', err.message);
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      // Check if MongoDB is connected
      if (mongoose.connection.readyState !== 1) {
        console.log('MongoDB not connected, using mock user for check-auth');
        // Return mock user for development when database is unavailable
        return res.status(200).json({
          message: 'Authentication successful (MOCK - No DB Connection)',
          user: {
            id: decoded.id || '67ce83e6b49cd8fe9297a753',
            email: 'mock@example.com',
            name: 'Mock User',
            role: 'hotel',
            isHotel: true,
            hotelId: decoded.id || '67ce83e6b49cd8fe9297a753'
          }
        });
      }
      
      // Find the user by ID
      try {
        // First try to find in Hotel model
        const hotel = await Hotel.findById(decoded.id);
        if (hotel) {
          console.log('Authenticated hotel user:', {
            id: decoded.id,
            role: 'hotel',
            model: 'Hotel'
          });
          
          // Return hotel user info
          return res.status(200).json({
            message: 'Authentication successful',
            user: {
              id: decoded.id,
              email: hotel.email,
              name: hotel.name,
              role: 'hotel',
              isHotel: true,
              hotelId: hotel._id
            }
          });
        }
        
        // If not found in Hotel, try User model
        const user = await User.findById(decoded.id);
        if (user) {
          console.log('Authenticated regular user:', {
            id: decoded.id,
            role: user.role,
            model: 'User'
          });
          
          // Return regular user info
          return res.status(200).json({
            message: 'Authentication successful',
            user: {
              id: decoded.id,
              email: user.email,
              name: user.name,
              role: user.role || 'user',
              isUser: true,
              userId: user._id
            }
          });
        }
        
        console.log('User not found in either Hotel or User models');
        return res.status(401).json({ message: 'User not found' });
      } catch (error) {
        console.error('Error finding user:', error);
        return res.status(500).json({ message: 'Server error' });
      }
    });
  } catch (error) {
    console.error('Error in check-auth endpoint:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/dashboard/test', (req, res) => {
  res.json({ message: 'Dashboard test endpoint is working' });
});

// Add a new route for accessing product images by filename, similar to the store-image project
app.get('/api/products/image/file/:filename', productController.getProductImageByFilename);

// Add a public route for accessing product images by ID
app.get('/api/products/image/:id', productController.getProductImage);

// Add a public route for getting all products
app.get('/api/products', async (req, res) => {
  try {
    // Get all products, excluding the binary image data
    const products = await mongoose.model('Product').find().select('-image.data').populate('seller', 'name');
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Direct wishlist handlers for backward compatibility
app.post('/user/wishlist', protect, addToWishlist);
app.delete('/user/wishlist/:productId', protect, removeFromWishlist);
app.get('/user/wishlist', protect, getWishlist);
app.get('/user/wishlist/check/:productId', protect, checkWishlist);
app.post('/user/wishlist/:productId/move-to-cart', protect, moveToCart);

// Direct cart handlers for backward compatibility
app.get('/user/cart', protect, getCart);
app.post('/user/cart', protect, addToCart);
app.delete('/user/cart', protect, clearCart);
app.put('/user/cart/:productId', protect, updateCartItem);
app.delete('/user/cart/:productId', protect, removeFromCart);
app.post('/user/cart/coupon', protect, applyCoupon);
app.post('/user/cart/shipping', protect, calculateShipping);

// Direct order handlers for backward compatibility
app.use('/user/orders', orderRoutes);

// Add API prefixed routes for cart as well
app.get('/api/cart', protect, getCart);
app.post('/api/cart', protect, addToCart);
app.delete('/api/cart', protect, clearCart);
app.put('/api/cart/:productId', protect, updateCartItem);
app.delete('/api/cart/:productId', protect, removeFromCart);
app.post('/api/cart/coupon', protect, applyCoupon);
app.post('/api/cart/shipping', protect, calculateShipping);

// Add missing API endpoints that the frontend is requesting
app.get('/urgent-sales', (req, res) => {
  // Return empty array for now
  res.status(200).json({
    status: 'success',
    data: []
  });
});

app.get('/hotels/verified', (req, res) => {
  // Return empty array for now
  res.status(200).json({
    status: 'success',
    data: []
  });
});

app.get('/feedback', (req, res) => {
  // Return empty array for now
  res.status(200).json({
    status: 'success',
    data: []
  });
});

app.post('/feedback', (req, res) => {
  // Mock successful feedback submission
  res.status(201).json({
    status: 'success',
    message: 'Feedback submitted successfully',
    data: {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date()
    }
  });
});

// Add the uploads route
app.use('/api/upload', uploadsRoutes);

// Serve uploads directory statically with better error handling
const uploadsPath = path.join(__dirname, 'uploads');
console.log(`Setting up static file serving from: ${uploadsPath}`);

// Ensure uploads directory exists
try {
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log(`Created uploads directory: ${uploadsPath}`);
  }
} catch (err) {
  console.error(`Error creating uploads directory: ${err.message}`);
}

// Serve the uploads directory
app.use('/uploads', express.static(uploadsPath));
console.log(`Static file serving configured for /uploads at ${uploadsPath}`);

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

// Ensure all directories exist before using them
// Add this after the server startup
const ensureDirectories = () => {
  const dirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads/images'),
    path.join(__dirname, 'uploads/files')
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  }
};

// Call this function after the server starts
ensureDirectories();

// Export the app instead of starting the server here
export default app; 