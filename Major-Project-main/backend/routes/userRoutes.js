import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  register,
  login,
  getProfile,
  updateProfile,
  updateAddress,
  deleteAddress,
  updatePaymentMethod,
  deletePaymentMethod,
  updateNotificationSettings,
  changePassword,
  getDashboardStats,
  getOrderStats,
  getRecentActivity,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  getAddresses,
  getPaymentSessionData,
  savePaymentSessionData,
  deletePaymentSessionData
} from '../controllers/userController.js';
import mongoose from 'mongoose';
import Wishlist from '../models/Wishlist.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Review from '../models/Review.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Authentication check endpoint - added to fix seller panel auth check
router.get('/check-auth', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Return authenticated user data
    return res.status(200).json({
      message: 'Authentication successful',
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role || 'user',
        isUser: true,
        userId: req.user._id
      }
    });
  } catch (error) {
    // console.error('Error in /api/users/check-auth endpoint:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Dashboard routes
router.get('/dashboard/stats', protect, getDashboardStats);
router.get('/orders/stats', protect, getOrderStats);
router.get('/activity', protect, getRecentActivity);

// Address management
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);

// Payment methods
router.post('/payment-methods', protect, updatePaymentMethod);
router.delete('/payment-methods/:id', protect, deletePaymentMethod);

// Session data management
router.get('/session/payment-data', protect, getPaymentSessionData);
router.post('/session/payment-data', protect, savePaymentSessionData);
router.delete('/session/payment-data', protect, deletePaymentSessionData);

// Notification settings
router.put('/notification-settings', protect, updateNotificationSettings);

// Password management
router.put('/change-password', protect, changePassword);

// Wishlist routes
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist', protect, addToWishlist);
router.delete('/wishlist/:productId', protect, removeFromWishlist);
router.get('/wishlist/check/:productId', protect, checkWishlist);

// Review routes
router.get('/reviews', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log(`Getting reviews for user: ${userId}`);
    
    // Query the database for real reviews
    const reviews = await Review.find({ user: userId })
      .populate('product', 'name images price')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 });
    
    // Transform the data to match the expected format in the frontend
    const transformedReviews = reviews.map(review => ({
      id: review._id,
      productId: review.product._id,
      productName: review.product.name,
      productImage: review.product.images && review.product.images.length > 0 
        ? review.product.images[0].url 
        : 'https://via.placeholder.com/80',
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt,
      likes: review.likes || 0,
      seller: review.seller || 'Store',
      orderId: review.order ? review.order.orderNumber : 'N/A'
    }));
    
    // If no reviews found and we're in development, return mock data
    if (transformedReviews.length === 0 && process.env.NODE_ENV === 'development') {
      console.log('No reviews found, returning mock data for development');
      const mockReviews = [
        {
          id: 1,
          productId: 'P001',
          productName: 'Fresh Organic Vegetables Mix',
          productImage: 'https://via.placeholder.com/80',
          rating: 5,
          comment: 'Excellent quality vegetables! Very fresh and delivered promptly.',
          date: new Date('2023-06-10'),
          likes: 3,
          seller: 'Organic Farms',
          orderId: 'ORD-10025'
        },
        {
          id: 2,
          productId: 'P002',
          productName: 'Premium Basmati Rice (5kg)',
          productImage: 'https://via.placeholder.com/80',
          rating: 4,
          comment: 'Good quality rice, but packaging could be better.',
          date: new Date('2023-05-20'),
          likes: 1,
          seller: 'Grain Bazaar',
          orderId: 'ORD-10024'
        }
      ];
      
      res.status(200).json({
        status: 'success',
        data: mockReviews
      });
      return;
    }
    
    res.status(200).json({
      status: 'success',
      data: transformedReviews
    });
  } catch (error) {
    console.error('Error getting user reviews:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error getting user reviews',
      error: error.message
    });
  }
});

router.post('/reviews', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, rating, comment, title = '', orderId } = req.body;
    
    if (!productId || !rating) {
      return res.status(400).json({
        status: 'error',
        message: 'Product ID and rating are required'
      });
    }
    
    console.log(`Creating review for product ${productId} by user ${userId}`);
    
    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({ 
      user: userId, 
      product: productId 
    });
    
    if (existingReview) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already reviewed this product'
      });
    }
    
    // Create the review
    const newReview = new Review({
      user: userId,
      product: productId,
      order: orderId || null,
      rating,
      title,
      comment,
      createdAt: new Date()
    });
    
    // Save to database
    const savedReview = await newReview.save();
    
    // Populate some fields for the response
    await savedReview.populate('product', 'name images');
    await savedReview.populate('order', 'orderNumber');
    
    // Transform to match frontend format
    const transformedReview = {
      id: savedReview._id,
      productId: savedReview.product._id,
      productName: savedReview.product.name,
      productImage: savedReview.product.images && savedReview.product.images.length > 0 
        ? savedReview.product.images[0].url 
        : 'https://via.placeholder.com/80',
      rating: savedReview.rating,
      comment: savedReview.comment,
      date: savedReview.createdAt,
      likes: 0,
      seller: 'Store',
      orderId: savedReview.order ? savedReview.order.orderNumber : 'N/A'
    };
    
    res.status(201).json({
      status: 'success',
      data: transformedReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating review',
      error: error.message
    });
  }
});

router.put('/reviews/:reviewId', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { reviewId } = req.params;
    const { rating, comment, title } = req.body;
    
    console.log(`Updating review ${reviewId} by user ${userId}`);
    
    // Find the review and check ownership
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }
    
    // Check if this review belongs to the user
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to edit this review'
      });
    }
    
    // Update the review
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (title !== undefined) review.title = title;
    review.updatedAt = new Date();
    
    // Save to database
    const updatedReview = await review.save();
    
    // Populate for the response
    await updatedReview.populate('product', 'name images');
    await updatedReview.populate('order', 'orderNumber');
    
    // Transform to match frontend format
    const transformedReview = {
      id: updatedReview._id,
      productId: updatedReview.product._id,
      productName: updatedReview.product.name,
      productImage: updatedReview.product.images && updatedReview.product.images.length > 0 
        ? updatedReview.product.images[0].url 
        : 'https://via.placeholder.com/80',
      rating: updatedReview.rating,
      comment: updatedReview.comment,
      date: updatedReview.createdAt,
      updatedAt: updatedReview.updatedAt,
      likes: updatedReview.likes || 0,
      seller: 'Store',
      orderId: updatedReview.order ? updatedReview.order.orderNumber : 'N/A'
    };
    
    res.status(200).json({
      status: 'success',
      data: transformedReview
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating review',
      error: error.message
    });
  }
});

router.delete('/reviews/:reviewId', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { reviewId } = req.params;
    
    console.log(`Deleting review ${reviewId} by user ${userId}`);
    
    // Find the review and check ownership
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }
    
    // Check if this review belongs to the user
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this review'
      });
    }
    
    // Delete the review
    await Review.deleteOne({ _id: reviewId });
    
    res.status(200).json({
      status: 'success',
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting review',
      error: error.message
    });
  }
});

router.get('/reviews/pending', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log(`Getting pending review products for user: ${userId}`);
    
    // Find delivered orders for this user
    const orders = await Order.find({ 
      user: userId,
      status: 'delivered' 
    }).populate('items.product');
    
    // Get all products this user has already reviewed
    const existingReviews = await Review.find({ user: userId });
    const reviewedProductIds = existingReviews.map(review => review.product.toString());
    
    // Create a list of products from orders that haven't been reviewed yet
    const pendingReviewProducts = [];
    
    orders.forEach(order => {
      order.items.forEach(item => {
        // Only add if the product exists and hasn't been reviewed yet
        if (
          item.product && 
          !reviewedProductIds.includes(item.product._id.toString()) &&
          !pendingReviewProducts.some(p => p.id === item.product._id.toString())
        ) {
          pendingReviewProducts.push({
            id: item.product._id,
            name: item.product.name,
            image: item.product.images && item.product.images.length > 0 
              ? item.product.images[0].url 
              : 'https://via.placeholder.com/80',
            purchaseDate: order.createdAt,
            orderId: order._id
          });
        }
      });
    });
    
    // If no pending reviews found and we're in development, return mock data
    if (pendingReviewProducts.length === 0 && process.env.NODE_ENV === 'development') {
      console.log('No pending reviews found, returning mock data for development');
      const mockPendingReviews = [
        {
          id: 'P005',
          name: 'Organic Brown Eggs (12pcs)',
          image: 'https://via.placeholder.com/80',
          purchaseDate: new Date('2023-07-01'),
          orderId: 'ORD-10030'
        },
        {
          id: 'P006',
          name: 'Fresh Whole Wheat Bread',
          image: 'https://via.placeholder.com/80',
          purchaseDate: new Date('2023-07-05'),
          orderId: 'ORD-10032'
        }
      ];
      
      res.status(200).json({
        status: 'success',
        data: mockPendingReviews
      });
      return;
    }
    
    res.status(200).json({
      status: 'success',
      data: pendingReviewProducts
    });
  } catch (error) {
    console.error('Error getting pending review products:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error getting pending review products',
      error: error.message
    });
  }
});

// Order routes
router.get('/orders', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log(`Getting orders for user: ${userId}`);
    
    // Get all orders for the user
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name price images');
    
    console.log(`Found ${orders.length} orders for user`);
    
    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error getting user orders:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error getting user orders',
      error: error.message
    });
  }
});

// For testing: Get stats for a specific user by ID (admin only)
router.get('/stats/:userId', protect, admin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if dashboardStats exists for this user
    const dashboardStats = await mongoose.connection.db.collection('dashboardStats').findOne({
      user: mongoose.Types.ObjectId(userId)
    });
    
    // Check if wishlist exists for this user
    const wishlist = await Wishlist.findOne({ user: userId });
    const wishlistCount = wishlist ? wishlist.products.length : 0;
    
    // Get orders for this user
    const orders = await Order.find({ user: userId });
    const orderStats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(order => 
        ['pending', 'processing', 'shipped'].includes(order.status)
      ).length,
      totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0)
    };
    
    res.status(200).json({
      status: 'success',
      userId,
      dashboardStats: dashboardStats || { message: 'No dashboard stats found' },
      wishlist: {
        exists: !!wishlist,
        count: wishlistCount,
        id: wishlist ? wishlist._id : null
      },
      orderStats
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error getting user stats',
      error: error.message
    });
  }
});

export default router;