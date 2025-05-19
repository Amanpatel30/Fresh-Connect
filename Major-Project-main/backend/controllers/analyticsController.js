import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import User from '../models/User.js';
import MenuItem from '../models/MenuItem.js';
import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// @desc    Get sales analytics
// @route   GET /api/analytics/sales
// @access  Private (Hotel Owner)
const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  const hotelId = req.user._id;
  
  // Define time periods
  let startDate;
  const endDate = new Date();
  
  switch (period) {
    case 'day':
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
  }

  try {
    // For demo/development: Create sample data if no orders exist
    const orderCount = await Order.countDocuments({ 
      seller: hotelId 
    });

    if (orderCount === 0) {
      // Return sample data for demo/development
      const sampleData = {
        revenue: [
          { name: '2023-11-01', revenue: 12500, orders: 25 },
          { name: '2023-11-02', revenue: 14200, orders: 28 },
          { name: '2023-11-03', revenue: 16800, orders: 32 },
          { name: '2023-11-04', revenue: 15600, orders: 30 },
          { name: '2023-11-05', revenue: 18900, orders: 36 },
          { name: '2023-11-06', revenue: 22000, orders: 42 },
          { name: '2023-11-07', revenue: 25001, orders: 45 }
        ],
        totalRevenue: 125001,
        totalOrders: 238,
        averageOrderValue: 525.21,
        popularItems: [
          { name: 'Butter Chicken', value: 45, revenue: 15750 },
          { name: 'Paneer Butter Masala', value: 38, revenue: 12160 },
          { name: 'Chicken Biryani', value: 36, revenue: 10080 },
          { name: 'Naan', value: 32, revenue: 1280 },
          { name: 'Masala Dosa', value: 28, revenue: 3360 }
        ],
        orderSources: [
          { name: 'Website', value: 30 },
          { name: 'Mobile App', value: 25 },
          { name: 'Phone', value: 15 },
          { name: 'Walk-in', value: 30 }
        ],
        orders: [
          { name: '2023-11-01', value: 25 },
          { name: '2023-11-02', value: 28 },
          { name: '2023-11-03', value: 32 },
          { name: '2023-11-04', value: 30 },
          { name: '2023-11-05', value: 36 },
          { name: '2023-11-06', value: 42 },
          { name: '2023-11-07', value: 45 }
        ]
      };

      return res.json({
        success: true,
        data: sampleData
      });
    }

    // Get revenue data from real database
    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['delivered', 'completed'] },
          seller: new mongoose.Types.ObjectId(hotelId)
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Format revenue data for charts
    const formattedRevenueData = revenueData.map(item => ({
      name: item._id,
      revenue: item.revenue,
      orders: item.orders
    }));
    
    // Get total revenue and orders
    const totals = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['delivered', 'completed'] },
          seller: new mongoose.Types.ObjectId(hotelId)
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);
    
    // Calculate metrics
    const totalRevenue = totals.length > 0 ? totals[0].totalRevenue : 0;
    const totalOrders = totals.length > 0 ? totals[0].totalOrders : 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Get popular menu items
    const popularItems = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['delivered', 'completed'] },
          seller: new mongoose.Types.ObjectId(hotelId)
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          value: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { value: -1 } },
      { $limit: 5 }
    ]);
    
    // Placeholder for order sources (future enhancement)
    const orderSources = [
      { name: 'Website', value: 30 },
      { name: 'Mobile App', value: 25 },
      { name: 'Phone', value: 15 },
      { name: 'Walk-in', value: 30 }
    ];
    
    // Format orders data
    const ordersData = formattedRevenueData.map(item => ({
      name: item.name,
      value: item.orders
    }));
    
    res.json({
      success: true,
      data: {
        revenue: formattedRevenueData,
        totalRevenue,
        totalOrders,
        averageOrderValue,
        popularItems,
        orderSources,
        orders: ordersData
      }
    });
  } catch (error) {
    console.error('Error in getSalesAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales analytics',
      error: error.message
    });
  }
});

// @desc    Get customer analytics
// @route   GET /api/analytics/customers
// @access  Private (Hotel Owner)
const getCustomerAnalytics = asyncHandler(async (req, res) => {
  const hotelId = req.user._id;
  
  try {
    // For demo/development: Return sample data if no real data available
    const orderCount = await Order.countDocuments({ 
      seller: hotelId 
    });

    if (orderCount === 0) {
      const sampleData = {
        totalCustomers: 189,
        newCustomers: 42,
        returningCustomers: 147,
        customerData: [
          { name: 'New', value: 42 },
          { name: 'Returning', value: 147 }
        ],
        customerGrowth: [
          { name: 'Jan', value: 110 },
          { name: 'Feb', value: 120 },
          { name: 'Mar', value: 125 },
          { name: 'Apr', value: 130 },
          { name: 'May', value: 140 },
          { name: 'Jun', value: 145 },
          { name: 'Jul', value: 150 },
          { name: 'Aug', value: 160 },
          { name: 'Sep', value: 170 },
          { name: 'Oct', value: 175 },
          { name: 'Nov', value: 180 },
          { name: 'Dec', value: 189 }
        ]
      };

      return res.json({
        success: true,
        data: sampleData
      });
    }

    // Get unique customers who ordered from this hotel
    const uniqueCustomers = await Order.aggregate([
      {
        $match: {
          seller: new mongoose.Types.ObjectId(hotelId)
        }
      },
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastOrder: { $max: '$createdAt' }
        }
      }
    ]);
    
    // Calculate metrics
    const totalCustomers = uniqueCustomers.length;
    
    // Get new vs returning customers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newCustomers = uniqueCustomers.filter(
      customer => new Date(customer.lastOrder) >= thirtyDaysAgo && customer.orderCount === 1
    ).length;
    
    const returningCustomers = uniqueCustomers.filter(
      customer => new Date(customer.lastOrder) >= thirtyDaysAgo && customer.orderCount > 1
    ).length;
    
    // Format customer data for charts
    const customerData = [
      { name: 'New', value: newCustomers },
      { name: 'Returning', value: returningCustomers }
    ];
    
    // Customer growth over time (simplified for now)
    const today = new Date();
    const customerGrowth = [
      { name: 'Jan', value: Math.round(totalCustomers * 0.55) },
      { name: 'Feb', value: Math.round(totalCustomers * 0.60) },
      { name: 'Mar', value: Math.round(totalCustomers * 0.65) },
      { name: 'Apr', value: Math.round(totalCustomers * 0.70) },
      { name: 'May', value: Math.round(totalCustomers * 0.75) },
      { name: 'Jun', value: Math.round(totalCustomers * 0.80) },
      { name: 'Jul', value: Math.round(totalCustomers * 0.82) },
      { name: 'Aug', value: Math.round(totalCustomers * 0.85) },
      { name: 'Sep', value: Math.round(totalCustomers * 0.90) },
      { name: 'Oct', value: Math.round(totalCustomers * 0.95) },
      { name: 'Nov', value: Math.round(totalCustomers * 0.98) },
      { name: 'Dec', value: totalCustomers }
    ];
    
    res.json({
      success: true,
      data: {
        totalCustomers,
        newCustomers,
        returningCustomers,
        customerData,
        customerGrowth
      }
    });
  } catch (error) {
    console.error('Error in getCustomerAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer analytics',
      error: error.message
    });
  }
});

// @desc    Get inventory analytics
// @route   GET /api/analytics/inventory
// @access  Private (Hotel Owner)
const getInventoryAnalytics = asyncHandler(async (req, res) => {
  const hotelId = req.user._id;
  
  try {
    // Get inventory items for this hotel
    const inventoryCount = await Inventory.countDocuments({
      $or: [
        { owner: hotelId },
        { hotelId: hotelId }
      ]
    });

    // For demo/development: Return sample data if no inventory data
    if (inventoryCount === 0) {
      // Return sample data for demo/development
      const sampleData = {
        inventoryValue: 275001,
        lowStockItems: [
          { name: "Tomatoes", quantity: 5, unit: "kg", category: "Vegetables" },
          { name: "Cream", quantity: 3, unit: "kg", category: "Dairy" },
          { name: "Butter", quantity: 4, unit: "kg", category: "Dairy" }
        ],
        inventoryByCategory: [
          { name: "Meat", value: 85001 },
          { name: "Dairy", value: 45001 },
          { name: "Vegetables", value: 35001 },
          { name: "Grains", value: 60000 },
          { name: "Spices", value: 30000 },
          { name: "Flour", value: 20000 }
        ]
      };

      return res.json({
        success: true,
        data: sampleData
      });
    }

    // Get inventory items from the database
    const inventoryItems = await Inventory.find({
      $or: [
        { owner: hotelId },
        { hotelId: hotelId }
      ]
    });
    
    // Calculate inventory value
    const inventoryValue = inventoryItems.reduce(
      (total, item) => total + (item.price * item.quantity), 0
    );
    
    // Get low stock items
    const lowStockItems = inventoryItems
      .filter(item => item.quantity <= 10)
      .map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit || 'unit',
        category: item.category
      }));
    
    // Get inventory by category
    const inventoryByCategory = await Inventory.aggregate([
      {
        $match: {
          $or: [
            { owner: new mongoose.Types.ObjectId(hotelId) },
            { hotelId: new mongoose.Types.ObjectId(hotelId) }
          ]
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          value: { $sum: { $multiply: ['$price', '$quantity'] } }
        }
      },
      {
        $project: {
          name: '$_id',
          value: 1,
          _id: 0
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        inventoryValue,
        lowStockItems,
        inventoryByCategory
      }
    });
  } catch (error) {
    console.error('Error in getInventoryAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory analytics',
      error: error.message
    });
  }
});

export {
  getSalesAnalytics,
  getCustomerAnalytics,
  getInventoryAnalytics
}; 