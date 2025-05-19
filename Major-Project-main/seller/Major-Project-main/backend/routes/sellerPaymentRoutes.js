import express from 'express';
import { protect, seller } from '../middleware/authMiddleware.js';
import PaymentTransaction from '../models/PaymentTransaction.js';
import PaymentSummary from '../models/PaymentSummary.js';
import mongoose from 'mongoose';

const router = express.Router();

// @desc    Get payment transactions
// @route   GET /api/seller/payments/transactions
// @access  Private/Seller
router.get('/transactions', protect, seller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filter options
    const filter = { sellerId };
    
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      filter.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    // Sort options
    let sort = {};
    if (req.query.sort === 'amount-high') {
      sort = { amount: -1 };
    } else if (req.query.sort === 'amount-low') {
      sort = { amount: 1 };
    } else {
      // Default sort by date
      sort = { date: -1 };
    }
    
    const transactions = await PaymentTransaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const totalTransactions = await PaymentTransaction.countDocuments(filter);
    
    res.json({
      transactions,
      page,
      pages: Math.ceil(totalTransactions / limit),
      total: totalTransactions
    });
  } catch (error) {
    console.error('Error fetching payment transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get payment summary
// @route   GET /api/seller/payments/summary
// @access  Private/Seller
router.get('/summary', protect, seller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    // Get existing payment summary or create a new one
    let paymentSummary = await PaymentSummary.findOne({ sellerId });
    
    if (!paymentSummary) {
      // If no payment summary exists, we'll generate a basic one
      paymentSummary = await generateBasicPaymentSummary(sellerId);
    }
    
    res.json(paymentSummary);
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get payment transaction by ID
// @route   GET /api/seller/payments/transactions/:id
// @access  Private/Seller
router.get('/transactions/:id', protect, seller, async (req, res) => {
  try {
    const transaction = await PaymentTransaction.findOne({
      _id: req.params.id,
      sellerId: req.user._id
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get payment statistics
// @route   GET /api/seller/payments/stats
// @access  Private/Seller
router.get('/stats', protect, seller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const timeRange = req.query.range || 'month'; // week, month, quarter, year
    
    // Convert sellerId to ObjectId
    const sellerIdObj = mongoose.Types.ObjectId.isValid(sellerId) 
      ? new mongoose.Types.ObjectId(sellerId)
      : sellerId;
    
    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1); // Default to month
    }
    
    // Get transaction statistics
    const transactionStats = await PaymentTransaction.aggregate([
      {
        $match: {
          sellerId: sellerIdObj,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalFees: { $sum: '$fee' },
          totalNetAmount: { $sum: '$netAmount' }
        }
      }
    ]);
    
    // Format transaction stats
    const stats = {};
    transactionStats.forEach(item => {
      stats[item._id] = {
        count: item.count,
        totalAmount: item.totalAmount,
        totalFees: item.totalFees,
        totalNetAmount: item.totalNetAmount
      };
    });
    
    // Get daily transaction amounts
    const dailyTransactions = await PaymentTransaction.aggregate([
      {
        $match: {
          sellerId: sellerIdObj,
          date: { $gte: startDate, $lte: endDate },
          type: 'sale',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          totalAmount: { $sum: '$netAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Format daily data
    const dailyData = dailyTransactions.map(item => ({
      date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
      amount: item.totalAmount,
      transactions: item.count
    }));
    
    // Get payment method distribution
    const paymentMethodDistribution = await PaymentTransaction.aggregate([
      {
        $match: {
          sellerId: sellerIdObj,
          date: { $gte: startDate, $lte: endDate },
          type: 'sale'
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);
    
    res.json({
      timeRange,
      stats,
      dailyData,
      paymentMethodDistribution
    });
  } catch (error) {
    console.error('Error fetching payment statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Request a payout
// @route   POST /api/seller/payments/request-payout
// @access  Private/Seller
router.post('/request-payout', protect, seller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { amount, paymentMethod } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }
    
    // Get payment summary to check available balance
    const paymentSummary = await PaymentSummary.findOne({ sellerId });
    
    if (!paymentSummary) {
      return res.status(404).json({ message: 'Payment summary not found' });
    }
    
    if (paymentSummary.availableBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance for payout' });
    }
    
    // Create payout transaction
    const payoutTransaction = new PaymentTransaction({
      sellerId,
      transactionId: `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      amount,
      fee: 0,
      netAmount: -amount, // Negative because money is leaving the account
      type: 'payout',
      status: 'pending',
      date: new Date(),
      paymentMethod,
      description: 'Payout request'
    });
    
    await payoutTransaction.save();
    
    // Update payment summary
    paymentSummary.availableBalance -= amount;
    await paymentSummary.save();
    
    res.status(201).json({
      message: 'Payout request submitted successfully',
      transaction: payoutTransaction
    });
  } catch (error) {
    console.error('Error requesting payout:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate basic payment summary
const generateBasicPaymentSummary = async (sellerId) => {
  // This would normally be calculated from real data
  // For now, we'll create placeholder data
  const paymentSummary = new PaymentSummary({
    sellerId,
    date: new Date(),
    totalEarnings: 0,
    pendingPayments: 0,
    availableBalance: 0,
    lastPayoutDate: null,
    lastPayoutAmount: 0,
    monthlySummary: {
      sales: 0,
      refunds: 0,
      fees: 0,
      net: 0
    },
    yearToDateSummary: {
      sales: 0,
      refunds: 0,
      fees: 0,
      net: 0
    },
    payoutSchedule: {
      frequency: 'monthly',
      nextPayoutDate: (() => {
        const date = new Date();
        date.setDate(1); // Set to first of month
        date.setMonth(date.getMonth() + 1); // Next month
        return date;
      })(),
      minimumAmount: 100
    }
  });
  
  return await paymentSummary.save();
};

export default router;