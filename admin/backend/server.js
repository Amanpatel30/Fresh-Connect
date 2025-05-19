const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files - Only include routes that exist
const userRoutes = require('./src/routes/userRoutes');
const hotelRoutes = require('./src/routes/hotelRoutes');
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes');
const sellerRoutes = require('./src/routes/sellerRoutes');
const listingRoutes = require('./src/routes/listingRoutes');
const verificationRoutes = require('./src/routes/verificationRoutes');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5003'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Log all routes for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Add specific logging for verification endpoints
app.use('/api/users/:id/verify', (req, res, next) => {
  console.log(`[VERIFICATION] ${req.method} ${req.url}`);
  console.log(`[VERIFICATION] Body:`, req.body);
  next();
});

// Mount routers
app.use('/api/users', userRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/verifications', verificationRoutes);

// Add route to test API
app.get('/api-test', (req, res) => {
  res.json({ message: 'API is working' });
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Set up PORT
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
}); 