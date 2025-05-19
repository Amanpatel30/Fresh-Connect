import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Inventory from '../models/Inventory.js';
import UrgentSale from '../models/UrgentSale.js';
import MenuItem from '../models/MenuItem.js';
import mongoose from 'mongoose';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    const hotelId = req.user ? req.user.id || req.user._id : null;
    console.log('Fetching dashboard stats for hotel ID:', hotelId);
    
    // Convert hotelId to ObjectId ensuring it's valid
    let hotelIdObj = null;
    if (hotelId) {
      try {
        if (typeof hotelId === 'string' && mongoose.Types.ObjectId.isValid(hotelId)) {
          hotelIdObj = new mongoose.Types.ObjectId(hotelId);
        } else if (hotelId instanceof mongoose.Types.ObjectId) {
          hotelIdObj = hotelId;
        }
        console.log('Hotel ID converted to ObjectId:', hotelIdObj);
      } catch (err) {
        console.error('Error converting hotel ID to ObjectId:', err);
      }
    }
    
    // Create match query for seller
    const sellerMatchQuery = {
      $or: [
        { seller: hotelIdObj },
        { hotelId: hotelIdObj },
        { hotel: hotelIdObj },
      ]
    };
    
    if (hotelId && !hotelIdObj) {
      // If we couldn't convert to ObjectId but have a string, try string comparison as fallback
      sellerMatchQuery.$or.push({ 'seller.toString()': hotelId.toString() });
    }
    
    console.log('Seller match query for dashboard:', JSON.stringify(sellerMatchQuery));
    
    // Get total revenue from completed orders for this hotel
    const totalRevenueData = await Order.aggregate([
      { 
        $match: { 
          status: { $in: ['delivered', 'completed'] }, 
          paymentStatus: { $in: ['paid', 'completed'] },
          ...sellerMatchQuery
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].total : 0;
    console.log('Total revenue:', totalRevenue);
    
    // Get weekly sales data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    console.log('Seller match query for weekly sales:', JSON.stringify(sellerMatchQuery));
    
    // Special check for test hotel ID
    const specificHotelId = '67d993b3fc12aa16718aa438'; 
    let specialHotelQuery = {};
    
    if (hotelId === specificHotelId || hotelId.toString() === specificHotelId) {
      console.log('Processing weekly sales for test hotel ID:', specificHotelId);
      specialHotelQuery = {
        $or: [
          { seller: new mongoose.Types.ObjectId(specificHotelId) },
          { 'seller.toString()': specificHotelId },
          { seller: specificHotelId },
          { hotelId: new mongoose.Types.ObjectId(specificHotelId) },
          { hotelId: specificHotelId },
          { hotel: new mongoose.Types.ObjectId(specificHotelId) },
          { hotel: specificHotelId }
        ]
      };
    }
    
    // Log raw orders for debugging this specific hotel
    if (hotelId === specificHotelId || hotelId.toString() === specificHotelId) {
      console.log('Looking up raw orders for test hotel...');
      const rawOrders = await Order.find({
        $or: [
          { seller: new mongoose.Types.ObjectId(specificHotelId) },
          { seller: specificHotelId },
          { hotelId: new mongoose.Types.ObjectId(specificHotelId) },
          { hotelId: specificHotelId }
        ]
      }).select('_id seller hotelId createdAt totalAmount status paymentStatus').lean();
      
      console.log(`Found ${rawOrders.length} raw orders for test hotel:`, 
        rawOrders.map(o => ({
          id: o._id, 
          seller: o.seller, 
          hotelId: o.hotelId,
          amount: o.totalAmount,
          status: o.status,
          paymentStatus: o.paymentStatus,
          date: o.createdAt
        }))
      );
    }
    
    const weeklySalesData = await Order.aggregate([
      {
        $match: {
          $and: [
            {
              status: { $in: ['delivered', 'completed', 'pending', 'processing', 'shipped'] }
            },
            {
              $or: [
                { paymentStatus: { $in: ['paid', 'completed'] } },
                { isPaid: true },
                // Accept all payment statuses for testing
                { totalAmount: { $gt: 0 } }
              ]
            },
            hotelId === specificHotelId ? specialHotelQuery : sellerMatchQuery,
            { createdAt: { $gte: sevenDaysAgo } }
          ]
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          sales: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    console.log('Weekly sales data from DB:', weeklySalesData);

    // Format weekly data for chart
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklySales = daysOfWeek.map((day, index) => {
      const dayData = weeklySalesData.find(d => d._id === index + 1);
      return {
        day: day,
        sales: dayData ? dayData.sales : 0
      };
    });

    console.log('Formatted weekly sales:', weeklySales);

    // Get monthly sales
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const monthlySalesData = await Order.aggregate([
      { 
        $match: { 
          status: { $in: ['delivered', 'completed'] }, 
          paymentStatus: { $in: ['paid', 'completed'] },
          ...sellerMatchQuery,
          createdAt: { $gte: firstDayOfMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const monthlySales = monthlySalesData.length > 0 ? monthlySalesData[0].total : 0;
    
    // Get total orders and pending orders
    const totalOrders = await Order.countDocuments({
      ...sellerMatchQuery
    });
    
    const pendingOrders = await Order.countDocuments({ 
      status: { $in: ['pending', 'processing'] },
      ...sellerMatchQuery
    });
    
    // Get total customer count (unique buyers) for this hotel
    const totalCustomersData = await Order.aggregate([
      { 
        $match: { 
          ...sellerMatchQuery
        } 
      },
      { $group: { _id: '$buyer' } },
      { $count: 'totalCustomers' }
    ]);
    
    const totalCustomers = totalCustomersData.length > 0 ? totalCustomersData[0].totalCustomers : 0;
    
    // Get inventory value for this hotel
    const inventoryOwnerMatchQuery = {
      $or: [
        { owner: hotelIdObj },
        { hotelId: hotelIdObj },
        { hotel: hotelIdObj }
      ]
    };
    
    const inventoryValueData = await Inventory.aggregate([
      { 
        $match: inventoryOwnerMatchQuery
      },
      { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$price'] } } } }
    ]);
    
    const inventoryValue = inventoryValueData.length > 0 ? inventoryValueData[0].total : 0;
    
    // Get low stock items count for this hotel
    const lowStockItems = await Inventory.countDocuments({
      ...inventoryOwnerMatchQuery,
      quantity: { $lte: 10 } // Using a fixed threshold for simplicity
    });
    
    // Get top selling items for this hotel based on actual sales
    const topSellingItemsData = await Order.aggregate([
      {
        $match: {
          status: { $in: ['delivered', 'completed'] },
          paymentStatus: { $in: ['paid', 'completed'] },
          ...sellerMatchQuery
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          sales: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          name: '$_id',
          sales: 1,
          totalRevenue: 1
        }
      }
    ]);

    console.log('Top selling items from DB:', topSellingItemsData);
    
    // Get previous period data for comparison
    const previousPeriodStart = new Date(sevenDaysAgo);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
    
    const previousRevenueData = await Order.aggregate([
      { 
        $match: { 
          status: { $in: ['delivered', 'completed'] }, 
          paymentStatus: { $in: ['paid', 'completed'] },
          ...sellerMatchQuery,
          createdAt: { $gte: previousPeriodStart, $lt: sevenDaysAgo }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const previousRevenue = previousRevenueData.length > 0 ? previousRevenueData[0].total : 0;
    
    const previousOrdersCount = await Order.countDocuments({
      ...sellerMatchQuery,
      createdAt: { $gte: previousPeriodStart, $lt: sevenDaysAgo }
    });
    
    // Get today's revenue and orders
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayRevenueData = await Order.aggregate([
      { 
        $match: { 
          status: { $in: ['delivered', 'completed'] }, 
          paymentStatus: { $in: ['paid', 'completed'] },
          ...sellerMatchQuery,
          createdAt: { $gte: todayStart }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const todayRevenue = todayRevenueData.length > 0 ? todayRevenueData[0].total : 0;
    
    const todayOrdersCount = await Order.countDocuments({
      ...sellerMatchQuery,
      createdAt: { $gte: todayStart }
    });

    res.json({
      totalRevenue,
      totalSales: totalRevenue,
      monthlySales,
      totalOrders,
      pendingOrders,
      totalCustomers,
      inventoryValue,
      lowStockItems,
      topSellingItems: topSellingItemsData,
      weeklySales,
      revenueByMonth: [],
      previousRevenue,
      previousOrdersCount,
      todayRevenue,
      todayOrdersCount,
      ordersCount: totalOrders
    });
    
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ 
      message: 'Error getting dashboard statistics',
      error: error.message 
    });
  }
});

// @desc    Get recent activity
// @route   GET /api/dashboard/activity
// @access  Private
const getRecentActivity = asyncHandler(async (req, res) => {
  try {
    // Get the authenticated user
    const sellerId = req.user ? req.user._id : null;
    console.log('Seller ID for recent activity:', sellerId);
    
    // Get recent orders (last 5) for this seller
    const recentOrders = await Order.find({ seller: sellerId }) // Filter by seller
      .sort({ createdAt: -1 })
      .limit(2)
      .select('_id totalAmount createdAt status')
      .lean();

    // Get recent customers (users who placed orders) with this seller
    const recentCustomers = await Order.find({ seller: sellerId }) // Filter by seller
      .sort({ createdAt: -1 })
      .limit(1)
      .populate('buyer', 'name')
      .select('buyer createdAt')
      .lean();

    // Get low stock items for this seller
    const lowStockItems = await Inventory.find({
      owner: sellerId, // Filter by owner (seller)
      quantity: { $lte: 10 }
    })
      .limit(1)
      .select('name quantity')
      .lean();

    // Get recent payments for this seller
    const recentPayments = await Order.find({ 
      seller: sellerId, // Filter by seller
      paymentStatus: 'completed'
    })
      .sort({ updatedAt: -1 })
      .limit(1)
      .select('_id totalAmount updatedAt')
      .lean();

    // Build the activity array
    const activity = [];

    // Add order activities
    recentOrders.forEach((order) => {
      activity.push({
        id: `order-${order._id}`,
        type: 'order',
        title: 'New Order Received',
        message: `Order #${order._id.toString().slice(-5)} received for $${order.totalAmount}`,
        time: getRelativeTime(order.createdAt)
      });
    });

    // Add payment activities
    recentPayments.forEach(payment => {
      activity.push({
        id: `payment-${payment._id}`,
        type: 'payment',
        title: 'Payment Received',
        message: `Payment of $${payment.totalAmount} received for Order #${payment._id.toString().slice(-5)}`,
        time: getRelativeTime(payment.updatedAt)
      });
    });

    // Add inventory activities
    lowStockItems.forEach(item => {
      activity.push({
        id: `inventory-${item._id}`,
        type: 'inventory',
        title: 'Low Stock Alert',
        message: `${item.name} is running low on stock (${item.quantity} units left)`,
        time: '1 hour ago' // Approximated
      });
    });

    // Add customer activities
    recentCustomers.forEach(order => {
      if (order.buyer) {
        activity.push({
          id: `customer-${order.buyer._id}`,
          type: 'customer',
          title: 'New Customer',
          message: `${order.buyer.name} placed their first order`,
          time: getRelativeTime(order.createdAt)
        });
      }
    });

    // Sort by newest first
    activity.sort((a, b) => {
      const timeA = a.time.match(/(\d+)/);
      const timeB = b.time.match(/(\d+)/);
      return (timeA && timeB) ? parseInt(timeA[0]) - parseInt(timeB[0]) : 0;
    });

    res.json(activity);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Error fetching recent activity', error: error.message });
  }
});

// Helper function to format relative time
function getRelativeTime(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 60) {
    return `${diffMins || 1} minutes ago`;
  } else if (diffMins < 24 * 60) {
    const hours = Math.floor(diffMins / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffMins / (60 * 24));
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

// @desc    Get seller dashboard data
// @route   GET /api/seller/dashboard
// @access  Private/Seller
const getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    // Mock dashboard data for development
    const dashboardData = {
      summary: {
        totalSales: 12500,
        totalOrders: 153,
        totalProducts: 42,
        averageOrderValue: 81.7
      },
      recentOrders: [
        {
          _id: '1',
          orderNumber: 'ORD-2023-001',
          customer: 'John Doe',
          total: 126.50,
          status: 'delivered',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          _id: '2',
          orderNumber: 'ORD-2023-002',
          customer: 'Jane Smith',
          total: 85.20,
          status: 'processing',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          _id: '3',
          orderNumber: 'ORD-2023-003',
          customer: 'Robert Johnson',
          total: 210.75,
          status: 'shipped',
          createdAt: new Date()
        }
      ],
      topProducts: [
        {
          _id: '1',
          name: 'Organic Tomatoes',
          price: 12.99,
          sold: 120,
          revenue: 1558.80
        },
        {
          _id: '2',
          name: 'Fresh Spinach',
          price: 8.50,
          sold: 98,
          revenue: 833.00
        },
        {
          _id: '3',
          name: 'Apple Basket',
          price: 15.99,
          sold: 75,
          revenue: 1199.25
        }
      ],
      salesData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [1200, 1900, 1500, 2200, 1800, 2400]
      }
    };
    
    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching seller dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
};

// @desc    Get sales data
// @route   GET /api/seller/orders/stats
// @access  Private/Seller
const getSalesData = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const period = req.query.period || 'month'; // day, week, month, year
    
    // Mock sales data for development
    const salesData = {
      period,
      summary: {
        totalSales: 12500,
        totalOrders: 153,
        averageOrderValue: 81.7
      },
      timeline: {
        labels: period === 'day' 
          ? ['9am', '12pm', '3pm', '6pm', '9pm']
          : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        data: period === 'day'
          ? [1200, 1800, 1500, 2100, 1900]
          : [3200, 2800, 3500, 3000]
      },
      categories: [
        { name: 'Vegetables', value: 45 },
        { name: 'Fruits', value: 30 },
        { name: 'Dairy', value: 15 },
        { name: 'Other', value: 10 }
      ]
    };
    
    res.status(200).json({
      success: true,
      data: salesData
    });
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales data'
    });
  }
};

// Convert functions to named exports
export { 
  getDashboardStats,
  getSellerDashboard,
  getSalesData
}; 