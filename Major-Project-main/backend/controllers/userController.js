import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import catchAsync from '../utils/catchAsync.js';
import Product from '../models/Product.js';
import Wishlist from '../models/Wishlist.js';
import Cart from '../models/Cart.js';
import ProductView from '../models/ProductView.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import WishlistActivity from '../models/WishlistActivity.js';
import mongoose from 'mongoose';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Register user
export const register = catchAsync(async (req, res) => {
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
    res.status(201).json({
      status: 'success',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  }
});

// Login user
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
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

  res.status(200).json({
    status: 'success',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id)
    }
  });
});

// Get user profile
export const getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (user) {
    res.status(200).json({
      status: 'success',
      data: user
    });
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'User not found'
    });
  }
});

// Update user profile
export const updateProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    // Update address if provided
    if (req.body.address) {
      user.address = {
        ...user.address,
        ...req.body.address
      };
    }

    // Update avatar if provided
    if (req.body.avatar) {
      user.avatar = req.body.avatar;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses,
        paymentMethods: user.paymentMethods
      }
    });
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'User not found'
    });
  }
});

// Update user address
export const updateAddress = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'User not found'
    });
  }

  const { id, ...addressData } = req.body;
  
  // If isDefault is true, set all other addresses to false
  if (addressData.isDefault) {
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }

  // If this is the first address, make it default
  if (user.addresses.length === 0) {
    addressData.isDefault = true;
  }

  if (id) {
    // Update existing address
    const addressIndex = user.addresses.findIndex(addr => addr.id === id);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Address not found'
      });
    }
    
    user.addresses[addressIndex] = { ...user.addresses[addressIndex].toObject(), ...addressData, id };
  } else {
    // Add new address
    user.addresses.push(addressData);
  }

  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      addresses: user.addresses
    }
  });
});

// Delete user address
export const deleteAddress = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'User not found'
    });
  }

  const addressId = req.params.id;
  const addressIndex = user.addresses.findIndex(addr => addr.id === addressId);
  
  if (addressIndex === -1) {
    return res.status(404).json({
      status: 'fail',
      message: 'Address not found'
    });
  }

  // Check if we're deleting a default address
  const isDefault = user.addresses[addressIndex].isDefault;
  
  // Remove the address
  user.addresses.splice(addressIndex, 1);
  
  // If we deleted the default address and there are other addresses, make the first one default
  if (isDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      addresses: user.addresses
    }
  });
});

// Update user payment method
export const updatePaymentMethod = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'User not found'
    });
  }

  const { id, ...paymentData } = req.body;
  
  // If isDefault is true, set all other payment methods to false
  if (paymentData.isDefault) {
    user.paymentMethods.forEach(method => {
      method.isDefault = false;
    });
  }

  // If this is the first payment method, make it default
  if (user.paymentMethods.length === 0) {
    paymentData.isDefault = true;
  }

  if (id) {
    // Update existing payment method
    const paymentIndex = user.paymentMethods.findIndex(method => method.id === id);
    
    if (paymentIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Payment method not found'
      });
    }
    
    user.paymentMethods[paymentIndex] = { ...user.paymentMethods[paymentIndex].toObject(), ...paymentData, id };
  } else {
    // Add new payment method
    user.paymentMethods.push(paymentData);
  }

  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      paymentMethods: user.paymentMethods
    }
  });
});

// Delete user payment method
export const deletePaymentMethod = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'User not found'
    });
  }

  const paymentId = req.params.id;
  const paymentIndex = user.paymentMethods.findIndex(method => method.id === paymentId);
  
  if (paymentIndex === -1) {
    return res.status(404).json({
      status: 'fail',
      message: 'Payment method not found'
    });
  }

  // Check if we're deleting a default payment method
  const isDefault = user.paymentMethods[paymentIndex].isDefault;
  
  // Remove the payment method
  user.paymentMethods.splice(paymentIndex, 1);
  
  // If we deleted the default payment method and there are other methods, make the first one default
  if (isDefault && user.paymentMethods.length > 0) {
    user.paymentMethods[0].isDefault = true;
  }

  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      paymentMethods: user.paymentMethods
    }
  });
});

// Update notification settings
export const updateNotificationSettings = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'User not found'
    });
  }

  user.notificationSettings = {
    ...user.notificationSettings,
    ...req.body
  };

  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      notificationSettings: user.notificationSettings
    }
  });
});

// Change password
export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide current and new password'
    });
  }

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');
  
  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'User not found'
    });
  }

  // Check if current password is correct
  const isMatch = await user.matchPassword(currentPassword);
  
  if (!isMatch) {
    return res.status(401).json({
      status: 'fail',
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully'
  });
});

// Get user dashboard statistics
export const getDashboardStats = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get counts from various collections
    const ordersCount = await Order.countDocuments({ user: userId });
    const wishlistCount = await Wishlist.countDocuments({ user: userId });
    const reviewsCount = await Review.countDocuments({ user: userId });
    
    // Calculate total amount spent
    const orders = await Order.find({ user: userId });
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Get pending and delivered order counts
    const pendingOrdersCount = await Order.countDocuments({ 
      user: userId, 
      status: { $in: ['pending', 'processing', 'shipped'] } 
    });
    
    const deliveredOrdersCount = await Order.countDocuments({ 
      user: userId, 
      status: 'delivered' 
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        totalOrders: ordersCount,
        pendingOrders: pendingOrdersCount,
        deliveredOrders: deliveredOrdersCount,
        totalSpent,
        wishlistCount,
        reviewsCount
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// Get user order statistics
export const getOrderStats = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get order counts by status
    const pendingCount = await Order.countDocuments({ user: userId, status: 'pending' });
    const processingCount = await Order.countDocuments({ user: userId, status: 'processing' });
    const shippedCount = await Order.countDocuments({ user: userId, status: 'shipped' });
    const deliveredCount = await Order.countDocuments({ user: userId, status: 'delivered' });
    const cancelledCount = await Order.countDocuments({ user: userId, status: 'cancelled' });
    
    // Get total amount spent in orders
    const orders = await Order.find({ user: userId });
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Get recent orders (last 3)
    const recentOrders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(3);
    
    res.status(200).json({
      status: 'success',
      data: {
        orderCounts: {
          pending: pendingCount,
          processing: processingCount,
          shipped: shippedCount,
          delivered: deliveredCount,
          cancelled: cancelledCount,
          total: orders.length
        },
        totalSpent,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch order statistics'
    });
  }
});

// Get user recent activity
export const getRecentActivity = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 5;
    
    // Combine activities from different collections
    const activities = [];
    
    // Get recent orders
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    orders.forEach(order => {
      activities.push({
        type: 'order',
        action: 'placed',
        orderId: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        date: order.createdAt,
        status: order.status
      });
    });
    
    // Get recent reviews
    const reviews = await Review.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    reviews.forEach(review => {
      activities.push({
        type: 'review',
        action: 'reviewed',
        productId: review.product,
        rating: review.rating,
        comment: review.comment ? review.comment.substring(0, 30) + '...' : '',
        date: review.createdAt
      });
    });
    
    // Get recent wishlist activity
    const wishlistActivities = await WishlistActivity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    wishlistActivities.forEach(activity => {
      activities.push({
        type: 'wishlist',
        action: activity.action,
        productId: activity.product,
        date: activity.createdAt
      });
    });
    
    // Sort all activities by date (newest first)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Limit to requested number
    const limitedActivities = activities.slice(0, limit);
    
    res.status(200).json({
      status: 'success',
      data: limitedActivities
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch recent activity'
    });
  }
});

// Get user addresses
export const getAddresses = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: user.addresses || []
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch addresses'
    });
  }
});

// Save payment session data
export const savePaymentSessionData = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionData } = req.body;
    
    if (!sessionData) {
      return res.status(400).json({
        status: 'fail',
        message: 'Session data is required'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Update user's sessionData
    user.sessionData = sessionData;
    await user.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Payment session data saved successfully'
    });
  } catch (error) {
    console.error('Error saving payment session data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to save payment session data'
    });
  }
});

// Get payment session data
export const getPaymentSessionData = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: user.sessionData || {}
    });
  } catch (error) {
    console.error('Error fetching payment session data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch payment session data'
    });
  }
});

// Delete payment session data
export const deletePaymentSessionData = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Remove session data
    user.sessionData = undefined;
    await user.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Payment session data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payment session data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete payment session data'
    });
  }
});

// Get wishlist
export const getWishlist = catchAsync(async (req, res) => {
  try {
    // Get user from middleware
    const userId = req.user._id;
    
    // Find user and populate wishlist products
    const user = await User.findById(userId).populate({
      path: 'wishlist.productId',
      select: 'name price discountPrice images description category stock ratings seller'
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        wishlist: user.wishlist.map(item => ({
          product: item.productId,
          addedAt: item.addedAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch wishlist'
    });
  }
});

// Add to wishlist
export const addToWishlist = catchAsync(async (req, res) => {
  try {
    // Get user from middleware
    const userId = req.user._id;
    
    // Get product ID from request body
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Product ID is required'
      });
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Check if product is already in wishlist
    const isProductInWishlist = user.wishlist.some(item => 
      item.productId.toString() === productId
    );
    
    if (isProductInWishlist) {
      return res.status(400).json({
        status: 'fail',
        message: 'Product already in wishlist'
      });
    }
    
    // Add product to wishlist
    user.wishlist.push({
      productId: productId,
      addedAt: new Date()
    });
    
    await user.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Product added to wishlist'
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add product to wishlist'
    });
  }
});

// Remove from wishlist
export const removeFromWishlist = catchAsync(async (req, res) => {
  try {
    // Get user from middleware
    const userId = req.user._id;
    
    // Get product ID from params
    const productId = req.params.productId;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Check if product is in wishlist
    const productIndex = user.wishlist.findIndex(item => 
      item.productId.toString() === productId
    );
    
    if (productIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found in wishlist'
      });
    }
    
    // Remove product from wishlist
    user.wishlist.splice(productIndex, 1);
    
    await user.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove product from wishlist'
    });
  }
});

// Check if product is in wishlist
export const checkWishlist = catchAsync(async (req, res) => {
  try {
    // Get user from middleware
    const userId = req.user._id;
    
    // Get product ID from params
    const productId = req.params.productId;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Check if product is in wishlist
    const isInWishlist = user.wishlist.some(item => 
      item.productId.toString() === productId
    );
    
    res.status(200).json({
      status: 'success',
      isInWishlist
    });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check wishlist status'
    });
  }
});