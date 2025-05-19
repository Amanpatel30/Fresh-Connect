import SaleTransaction from '../models/SaleTransaction.js';
import UrgentSale from '../models/UrgentSale.js';
import mongoose from 'mongoose';

/**
 * Record a new sale transaction with the price at the time of sale
 * @param {String} productId - The ID of the UrgentSale product
 * @param {Number} quantity - The quantity sold
 * @returns {Promise<Object>} - The created transaction
 */
export const recordSaleTransaction = async (productId, quantity = 1) => {
  // Find the product to get current price information
  const product = await UrgentSale.findById(productId);
  
  if (!product) {
    throw new Error(`Product not found with ID: ${productId}`);
  }
  
  if (product.quantity < quantity) {
    throw new Error(`Not enough quantity available. Requested: ${quantity}, Available: ${product.quantity}`);
  }
  
  // Create a new transaction with the CURRENT price information
  const transaction = await SaleTransaction.create({
    product: product._id,
    seller: product.seller,
    productName: product.name,
    quantity: quantity,
    salePrice: product.discountedPrice,
    originalPrice: product.price,
    discount: product.discount,
    category: product.category,
    soldAt: new Date(),
    status: 'completed'
  });
  
  // Update the product's quantity and sales count
  product.quantity -= quantity;
  product.sales = (product.sales || 0) + quantity;
  product.lastSoldAt = new Date();
  
  // If quantity reaches 0, mark as sold out
  if (product.quantity <= 0) {
    product.status = 'sold';
  }
  
  await product.save();
  
  return transaction;
};

/**
 * Calculate total revenue based on actual sale transactions, not current product prices
 * @param {String} sellerId - The seller's ID
 * @param {Object} filters - Additional filters like date range
 * @returns {Promise<Object>} - Revenue statistics
 */
export const calculateRevenue = async (sellerId, filters = {}) => {
  const matchCriteria = {
    seller: new mongoose.Types.ObjectId(sellerId),
    status: 'completed'
  };
  
  // Add date range filter if provided
  if (filters.startDate && filters.endDate) {
    matchCriteria.soldAt = { 
      $gte: new Date(filters.startDate), 
      $lte: new Date(filters.endDate) 
    };
  } else if (filters.startDate) {
    matchCriteria.soldAt = { $gte: new Date(filters.startDate) };
  } else if (filters.endDate) {
    matchCriteria.soldAt = { $lte: new Date(filters.endDate) };
  }
  
  // Calculate total revenue from actual transactions
  const revenueStats = await SaleTransaction.aggregate([
    { $match: matchCriteria },
    { 
      $group: {
        _id: null,
        totalSales: { $sum: '$quantity' },
        totalRevenue: { $sum: { $multiply: ['$salePrice', '$quantity'] } },
        avgDiscount: { $avg: '$discount' }
      }
    }
  ]);
  
  // Get revenue by category
  const categoryRevenue = await SaleTransaction.aggregate([
    { $match: matchCriteria },
    { 
      $group: {
        _id: '$category',
        sales: { $sum: '$quantity' },
        revenue: { $sum: { $multiply: ['$salePrice', '$quantity'] } }
      }
    },
    {
      $project: {
        category: '$_id',
        sales: 1,
        revenue: 1,
        _id: 0
      }
    }
  ]);
  
  // Get trending products (top sellers)
  const topProducts = await SaleTransaction.aggregate([
    { $match: matchCriteria },
    { 
      $group: {
        _id: '$product',
        productName: { $first: '$productName' },
        totalSold: { $sum: '$quantity' },
        revenue: { $sum: { $multiply: ['$salePrice', '$quantity'] } }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $project: {
        product: '$_id',
        productName: 1,
        totalSold: 1,
        revenue: 1,
        _id: 0
      }
    }
  ]);
  
  return {
    totalSales: revenueStats[0]?.totalSales || 0,
    totalRevenue: revenueStats[0]?.totalRevenue || 0,
    averageDiscount: revenueStats[0]?.avgDiscount || 0,
    categoryRevenue,
    topProducts
  };
};

/**
 * Get recent transactions for a seller
 * @param {String} sellerId - The seller's ID
 * @param {Number} limit - Maximum number of transactions to return
 * @returns {Promise<Array>} - List of recent transactions
 */
export const getRecentTransactions = async (sellerId, limit = 10) => {
  return SaleTransaction.find({ seller: sellerId })
    .sort({ soldAt: -1 })
    .limit(limit);
};

export default {
  recordSaleTransaction,
  calculateRevenue,
  getRecentTransactions
}; 