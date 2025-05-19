import express from 'express';
import { protect, sellerOnly } from '../middleware/authMiddleware.js';
import SellerAnalytics from '../models/SellerAnalytics.js';
import SellerSalesData from '../models/SellerSalesData.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

const router = express.Router();

// @desc    Get seller dashboard analytics
// @route   GET /api/seller/analytics/dashboard
// @access  Private/Seller
router.get('/dashboard', protect, sellerOnly, async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    // Get existing analytics or create new ones
    let analytics = await SellerAnalytics.findOne({ sellerId });
    
    if (!analytics) {
      // If no analytics exist, we'll generate basic ones
      // In a real app, this would be done by a scheduled job
      analytics = await generateBasicAnalytics(sellerId);
    }
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get seller sales data
// @route   GET /api/seller/analytics/sales
// @access  Private/Seller
router.get('/sales', protect, sellerOnly, async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    // Get existing sales data or create new ones
    let salesData = await SellerSalesData.findOne({ sellerId });
    
    if (!salesData) {
      // If no sales data exist, we'll generate basic ones
      salesData = await generateBasicSalesData(sellerId);
    }
    
    res.json(salesData);
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get real-time order statistics
// @route   GET /api/seller/analytics/orders
// @access  Private/Seller
router.get('/orders', protect, sellerOnly, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const timeRange = req.query.range || 'week'; // day, week, month, year
    
    // Convert sellerId to ObjectId
    const sellerIdObj = mongoose.Types.ObjectId.isValid(sellerId) 
      ? new mongoose.Types.ObjectId(sellerId)
      : sellerId;
    
    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7); // Default to week
    }
    
    // Get order statistics
    const orderStats = await Order.aggregate([
      {
        $match: {
          seller: sellerIdObj,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          averageOrderValue: { $avg: '$totalPrice' }
        }
      }
    ]);
    
    // Get order status breakdown
    const orderStatusBreakdown = await Order.aggregate([
      {
        $match: {
          seller: sellerIdObj,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format status breakdown
    const statusBreakdown = {};
    orderStatusBreakdown.forEach(item => {
      statusBreakdown[item._id] = item.count;
    });
    
    // Get daily order counts
    const dailyOrders = await Order.aggregate([
      {
        $match: {
          seller: sellerIdObj,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Format daily data
    const dailyData = dailyOrders.map(item => ({
      date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
      orders: item.count,
      revenue: item.revenue
    }));
    
    res.json({
      timeRange,
      stats: orderStats.length > 0 ? {
        totalOrders: orderStats[0].totalOrders,
        totalRevenue: orderStats[0].totalRevenue,
        averageOrderValue: parseFloat(orderStats[0].averageOrderValue.toFixed(2))
      } : {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0
      },
      statusBreakdown,
      dailyData
    });
  } catch (error) {
    console.error('Error fetching order analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get product performance analytics
// @route   GET /api/seller/analytics/products
// @access  Private/Seller
router.get('/products', protect, sellerOnly, async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    // Convert sellerId to ObjectId
    const sellerIdObj = mongoose.Types.ObjectId.isValid(sellerId) 
      ? new mongoose.Types.ObjectId(sellerId)
      : sellerId;
    
    // Get product statistics
    const productStats = await Product.aggregate([
      {
        $match: { seller: sellerIdObj }
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          outOfStockProducts: { $sum: { $cond: [{ $eq: ['$countInStock', 0] }, 1, 0] } },
          lowStockProducts: { $sum: { $cond: [{ $and: [{ $gt: ['$countInStock', 0] }, { $lt: ['$countInStock', 10] }] }, 1, 0] } }
        }
      }
    ]);
    
    // Get top selling products
    const topSellingProducts = await Order.aggregate([
      {
        $match: {
          seller: sellerIdObj,
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          image: { $first: '$orderItems.image' },
          totalSold: { $sum: '$orderItems.qty' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);
    
    // Get category distribution
    const categoryDistribution = await Product.aggregate([
      {
        $match: { seller: sellerIdObj }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      productStats: productStats.length > 0 ? productStats[0] : {
        totalProducts: 0,
        activeProducts: 0,
        outOfStockProducts: 0,
        lowStockProducts: 0
      },
      topSellingProducts,
      categoryDistribution
    });
  } catch (error) {
    console.error('Error fetching product analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate basic analytics
const generateBasicAnalytics = async (sellerId) => {
  // This would normally be calculated from real data
  // For now, we'll create placeholder data
  const analytics = new SellerAnalytics({
    sellerId,
    date: new Date(),
    orderStats: {
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    },
    productStats: {
      total: 0,
      active: 0,
      outOfStock: 0,
      lowStock: 0
    },
    revenueStats: {
      total: 0,
      thisMonth: 0,
      lastMonth: 0,
      growth: 0
    },
    inventoryData: [],
    topSellingItems: [],
    weeklySales: [
      { day: 'Monday', amount: 0 },
      { day: 'Tuesday', amount: 0 },
      { day: 'Wednesday', amount: 0 },
      { day: 'Thursday', amount: 0 },
      { day: 'Friday', amount: 0 },
      { day: 'Saturday', amount: 0 },
      { day: 'Sunday', amount: 0 }
    ],
    notifications: []
  });
  
  return await analytics.save();
};

// Helper function to generate basic sales data
const generateBasicSalesData = async (sellerId) => {
  // This would normally be calculated from real data
  // For now, we'll create placeholder data
  const salesData = new SellerSalesData({
    sellerId,
    date: new Date(),
    monthlySales: [],
    categoryPerformance: [],
    dailySales: [],
    productPerformance: [],
    salesByRegion: []
  });
  
  return await salesData.save();
};

export default router; 