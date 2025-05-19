import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import PaymentTransaction from '../models/PaymentTransaction.js';

const router = express.Router();

// @desc    Create a new payment transaction
// @route   POST /api/payment/transactions
// @access  Private
router.post('/transactions', protect, async (req, res) => {
  try {
    // Extract transaction data from request body
    const {
      sellerId,
      transactionId,
      amount,
      fee,
      netAmount,
      type,
      status,
      date,
      order,
      paymentMethod,
      paymentDetails,
      description,
      currency
    } = req.body;

    // Validate required fields
    if (!transactionId || !amount || !type || !paymentMethod) {
      return res.status(400).json({
        status: 'error',
        message: 'Required fields missing: transactionId, amount, type, and paymentMethod are required'
      });
    }

    // Create new transaction
    const transaction = new PaymentTransaction({
      user: req.user._id,
      sellerId,
      transactionId,
      amount,
      fee: fee || 0,
      netAmount: netAmount || amount,
      type,
      status: status || 'completed',
      date: date || new Date(),
      order,
      paymentMethod,
      paymentDetails,
      description,
      currency: currency || 'INR'
    });

    // Save transaction to database
    const savedTransaction = await transaction.save();

    res.status(201).json({
      status: 'success',
      data: savedTransaction
    });
  } catch (error) {
    console.error('Error creating payment transaction:', error);
    
    // Handle duplicate transaction ID
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Transaction with this ID already exists'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to create payment transaction',
      error: error.message
    });
  }
});

// @desc    Get user's payment transactions
// @route   GET /api/payment/transactions
// @access  Private
router.get('/transactions', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = { user: userId };
    
    // Add filters if provided
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Date range
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    // Get transactions
    const transactions = await PaymentTransaction.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    
    // Count total matching documents
    const total = await PaymentTransaction.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      page,
      pages: Math.ceil(total / limit),
      total,
      transactions
    });
  } catch (error) {
    console.error('Error fetching payment transactions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch payment transactions',
      error: error.message
    });
  }
});

// @desc    Get a specific transaction by ID
// @route   GET /api/payment/transactions/:id
// @access  Private
router.get('/transactions/:id', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const transactionId = req.params.id;
    
    // Find transaction for this user
    const transaction = await PaymentTransaction.findOne({
      _id: transactionId,
      user: userId
    });
    
    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch transaction details',
      error: error.message
    });
  }
});

export default router; 