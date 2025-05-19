import Product from '../models/Product.js';
import Order from '../models/Order.js';
import UrgentSale from '../models/urgentSaleModel.js';
import { errorHandler } from '../utils/errorHandler.js';
import mongoose from 'mongoose';

// @desc    Get seller dashboard data
// @route   GET /api/seller/dashboard
// @access  Private/Seller
export const getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    // Get product statistics
    const productPromise = Product.aggregate([
      { $match: { seller: new mongoose.Types.ObjectId(sellerId) } },
      { 
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: { 
            $sum: { 
              $cond: [{ $gt: ["$stock", 0] }, 1, 0] 
            } 
          },
          lowStockProducts: { 
            $sum: { 
              $cond: [
                { $and: [
                  { $gt: ["$stock", 0] },
                  { $lte: ["$stock", 5] }
                ]}, 
                1, 
                0
              ] 
            } 
          },
          outOfStockProducts: { 
            $sum: { 
              $cond: [{ $lte: ["$stock", 0] }, 1, 0] 
            } 
          }
        }
      }
    ]);
    
    // Get product categories
    const categoriesPromise = Product.aggregate([
      { $match: { seller: new mongoose.Types.ObjectId(sellerId) } },
      { 
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          name: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);
    
    // Get order statistics
    const orderPromise = Order.aggregate([
      { $match: { seller: new mongoose.Types.ObjectId(sellerId) } },
      { 
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          completedOrders: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] 
            } 
          },
          pendingOrders: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0] 
            } 
          },
          processingOrders: { 
            $sum: { 
              $cond: [
                { $or: [
                  { $eq: ["$status", "processing"] },
                  { $eq: ["$status", "shipped"] }
                ]}, 
                1, 
                0
              ] 
            } 
          }
        }
      }
    ]);
    
    // Get orders in the last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const thisWeekRevenuePromise = Order.aggregate([
      { 
        $match: { 
          seller: new mongoose.Types.ObjectId(sellerId),
          createdAt: { $gte: oneWeekAgo }
        } 
      },
      { 
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" }
        }
      }
    ]);
    
    // Get orders in the previous week
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const lastWeekRevenuePromise = Order.aggregate([
      { 
        $match: { 
          seller: new mongoose.Types.ObjectId(sellerId),
          createdAt: { 
            $gte: twoWeeksAgo,
            $lt: oneWeekAgo
          }
        } 
      },
      { 
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" }
        }
      }
    ]);
    
    // Get urgent sale statistics
    const urgentSalePromise = UrgentSale.aggregate([
      { $match: { seller: new mongoose.Types.ObjectId(sellerId) } },
      { 
        $group: {
          _id: null,
          totalUrgentSales: { $sum: 1 },
          activeUrgentSales: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "active"] }, 1, 0] 
            } 
          }
        }
      }
    ]);
    
    // Get top selling products
    const topSellingProductsPromise = Product.find({ seller: new mongoose.Types.ObjectId(sellerId) })
      .sort('-salesCount')
      .limit(5);
    
    // Execute all promises
    const [
      productStats, 
      categories,
      orderStats, 
      thisWeekRevenue,
      lastWeekRevenue,
      urgentSaleStats,
      topSellingProducts
    ] = await Promise.all([
      productPromise,
      categoriesPromise,
      orderPromise,
      thisWeekRevenuePromise,
      lastWeekRevenuePromise,
      urgentSalePromise,
      topSellingProductsPromise
    ]);
    
    // Calculate weekly change for revenue
    const thisWeekRev = thisWeekRevenue.length > 0 ? thisWeekRevenue[0].revenue : 0;
    const lastWeekRev = lastWeekRevenue.length > 0 ? lastWeekRevenue[0].revenue : 0;
    const revenueChange = lastWeekRev === 0 
      ? '100.0' 
      : ((thisWeekRev - lastWeekRev) / lastWeekRev * 100).toFixed(1);
    
    // Prepare response
    const responseData = {
      productStats: {
        totalProducts: productStats.length > 0 ? productStats[0].totalProducts : 0,
        activeProducts: productStats.length > 0 ? productStats[0].activeProducts : 0,
        lowStockProducts: productStats.length > 0 ? productStats[0].lowStockProducts : 0,
        outOfStockProducts: productStats.length > 0 ? productStats[0].outOfStockProducts : 0,
        weeklyChange: '0.0', // placeholder, would need historical data to calculate
        productsByCategory: categories
      },
      orderStats: {
        totalOrders: orderStats.length > 0 ? orderStats[0].totalOrders : 0,
        completedOrders: orderStats.length > 0 ? orderStats[0].completedOrders : 0,
        pendingOrders: orderStats.length > 0 ? orderStats[0].pendingOrders : 0,
        processingOrders: orderStats.length > 0 ? orderStats[0].processingOrders : 0,
        totalRevenue: orderStats.length > 0 ? orderStats[0].totalRevenue : 0,
        thisWeekRevenue: thisWeekRev,
        lastWeekRevenue: lastWeekRev,
        revenueChange,
        weeklyChange: '0.0' // placeholder, would need historical data to calculate
      },
      urgentSaleStats: {
        totalUrgentSales: urgentSaleStats.length > 0 ? urgentSaleStats[0].totalUrgentSales : 0,
        activeUrgentSales: urgentSaleStats.length > 0 ? urgentSaleStats[0].activeUrgentSales : 0
      },
      topSellingProducts
    };
    
    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    errorHandler(error, req, res);
  }
};

// @desc    Get sales data for a specific time period
// @route   GET /api/seller/orders/stats
// @access  Private/Seller
export const getSalesData = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { period = 'week' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    // Set start date based on period
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
        startDate.setDate(startDate.getDate() - 7);
    }
    
    // Group by day if week or day, by month if month or year
    const groupBy = period === 'week' || period === 'day' ? { day: { $dayOfMonth: '$createdAt' }, month: { $month: '$createdAt' } } : { month: { $month: '$createdAt' } };
    
    // Get sales data grouped by time unit
    const salesData = await Order.aggregate([
      { 
        $match: { 
          seller: new mongoose.Types.ObjectId(sellerId),
          createdAt: { 
            $gte: startDate,
            $lte: endDate
          }
        } 
      },
      { 
        $group: {
          _id: groupBy,
          amount: { $sum: "$totalAmount" }
        }
      },
      {
        $project: {
          _id: 0,
          day: period === 'week' || period === 'day' ? '$_id.day' : '$_id.month',
          amount: 1
        }
      },
      { $sort: { day: 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: salesData
    });
  } catch (error) {
    console.error('Error fetching sales data:', error);
    errorHandler(error, req, res);
  }
}; 