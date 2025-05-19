import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect } from './backend/middleware/authMiddleware.js';

// Import routes
import userRoutes from './backend/routes/userRoutes.js';
import uploadRoutes from './backend/routes/uploadRoutes.js';
import productRoutes from './backend/routes/productRoutes.js';
import urgentSalesRoutes from './backend/routes/urgentSalesRoutes.js';
import leftoverFoodRoutes from './backend/routes/leftoverFoodRoutes.js';
import orderRoutes from './backend/routes/orderRoutes.js';
import verificationRoutes from './backend/routes/verificationRoutes.js';
import inventoryRoutes from './backend/routes/inventoryRoutes.js';
import wishlistRoutes from './backend/routes/wishlistRoutes.js';
import cartRoutes from './backend/routes/cartRoutes.js';
import hotelRoutes from './backend/routes/hotelRoutes.js';
import analyticsRoutes from './backend/routes/analyticsRoutes.js';

// Configure environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 5001;

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Logging middleware

// Static folders
app.use('/public', express.static(path.join(__dirname, 'backend/public')));
app.use('/uploads', express.static(path.join(__dirname, 'backend/uploads')));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/urgent-sales', urgentSalesRoutes);
app.use('/api/leftover-food', leftoverFoodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/analytics', analyticsRoutes);

// Check authentication status
app.get('/api/check-auth', protect, (req, res) => {
  // The authMiddleware will handle this - if it reaches here, the token is valid
  console.log('Auth check route reached - token valid');
  console.log('User data:', { id: req.user._id, role: req.user.role });
  res.status(200).json({ 
    message: 'Authentication successful',
    user: {
      id: req.user._id,
      role: req.user.role,
      email: req.user.email
    }
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  // server.close(() => process.exit(1));
}); 