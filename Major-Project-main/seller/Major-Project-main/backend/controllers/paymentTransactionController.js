import PaymentTransaction from '../models/PaymentTransaction.js';
import { errorHandler } from '../utils/errorHandler.js';

// Get all payment transactions for a seller
export const getPaymentTransactions = async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    // Build query
    const query = { seller: sellerId };
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by type if provided
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Execute query
    const transactions = await PaymentTransaction.find(query)
      .populate('order', 'orderNumber totalAmount')
      .populate('paymentMethod', 'type name')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    // Get total count
    const total = await PaymentTransaction.countDocuments(query);
    
    // Pagination result
    const pagination = {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit
    };
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      pagination,
      data: transactions
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Get a single payment transaction
export const getPaymentTransaction = async (req, res) => {
  try {
    const transaction = await PaymentTransaction.findById(req.params.id)
      .populate('order', 'orderNumber totalAmount items')
      .populate('paymentMethod', 'type name accountNumber ifsc upiId walletId');
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Check if the transaction belongs to the logged-in seller
    if (transaction.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this transaction'
      });
    }
    
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Create a new payment transaction (admin only)
export const createPaymentTransaction = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create transactions'
      });
    }
    
    // Create the transaction
    const transaction = await PaymentTransaction.create(req.body);
    
    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Update a payment transaction status (admin only)
export const updateTransactionStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update transaction status'
      });
    }
    
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status'
      });
    }
    
    // Update the transaction
    const transaction = await PaymentTransaction.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Get payment summary for a seller
export const getPaymentSummary = async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    // Get total earnings
    const totalEarnings = await PaymentTransaction.aggregate([
      { $match: { seller: sellerId, status: 'completed', type: 'payout' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get pending payments
    const pendingPayments = await PaymentTransaction.aggregate([
      { $match: { seller: sellerId, status: 'pending', type: 'payout' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get monthly earnings for the current year
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);
    
    const monthlyEarnings = await PaymentTransaction.aggregate([
      {
        $match: {
          seller: sellerId,
          status: 'completed',
          type: 'payout',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Format monthly earnings
    const formattedMonthlyEarnings = Array(12).fill(0);
    monthlyEarnings.forEach(item => {
      formattedMonthlyEarnings[item._id - 1] = item.total;
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalEarnings: totalEarnings.length > 0 ? totalEarnings[0].total : 0,
        pendingPayments: pendingPayments.length > 0 ? pendingPayments[0].total : 0,
        monthlyEarnings: formattedMonthlyEarnings
      }
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
}; 