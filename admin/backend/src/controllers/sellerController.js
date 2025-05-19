const User = require('../models/User');

/**
 * @desc    Get all sellers
 * @route   GET /api/sellers
 * @access  Admin
 */
const getAllSellers = async (req, res) => {
  try {
    const filters = { role: 'seller' };
    
    // Handle query parameters for filtering
    if (req.query.status) {
      if (req.query.status === 'verified') {
        filters.isVerified = true;
      } else if (req.query.status === 'unverified') {
        filters.isVerified = false;
      }
    }

    // Filter by state or city if provided
    if (req.query.state) {
      filters['address.state'] = req.query.state;
    }
    
    if (req.query.city) {
      filters['address.city'] = req.query.city;
    }

    // Filter by registration date range
    if (req.query.from) {
      const fromDate = new Date(req.query.from);
      filters.createdAt = { ...filters.createdAt, $gte: fromDate };
    }
    
    if (req.query.to) {
      const toDate = new Date(req.query.to);
      filters.createdAt = { ...filters.createdAt, $lte: toDate };
    }

    // Search by name or email
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filters.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    // Set up pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const sellers = await User.find(filters)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const total = await User.countDocuments(filters);

    res.json({
      success: true,
      count: sellers.length,
      total,
      pagination: {
        current: page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: sellers
    });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * @desc    Get seller by ID
 * @route   GET /api/sellers/:id
 * @access  Admin
 */
const getSellerById = async (req, res) => {
  try {
    const seller = await User.findOne({ 
      _id: req.params.id,
      role: 'seller'
    }).select('-password');

    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      });
    }

    res.json({
      success: true,
      data: seller
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * @desc    Update seller verification status
 * @route   PUT /api/sellers/:id
 * @access  Admin
 */
const updateSellerStatus = async (req, res) => {
  try {
    const { isVerified, notes } = req.body;
    
    const seller = await User.findOne({ 
      _id: req.params.id,
      role: 'seller'
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      });
    }

    // Update verification status and notes
    seller.isVerified = isVerified;
    if (notes) {
      seller.verificationNotes = notes;
    }

    await seller.save();

    res.json({
      success: true,
      data: seller
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * @desc    Get seller statistics
 * @route   GET /api/sellers/stats
 * @access  Admin
 */
const getSellerStats = async (req, res) => {
  try {
    // Get counts of verified vs unverified sellers
    const verificationStats = await User.aggregate([
      { $match: { role: 'seller' } },
      { $group: {
        _id: '$isVerified',
        count: { $sum: 1 }
      }}
    ]);

    // Get counts by state
    const locationStats = await User.aggregate([
      { $match: { role: 'seller' } },
      { $group: {
        _id: '$address.state',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get counts by registration month
    const registrationStats = await User.aggregate([
      { $match: { role: 'seller' } },
      { $group: {
        _id: { 
          year: { $year: '$createdAt' }, 
          month: { $month: '$createdAt' } 
        },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      data: {
        verification: verificationStats,
        location: locationStats,
        registration: registrationStats,
        total: await User.countDocuments({ role: 'seller' })
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

module.exports = {
  getAllSellers,
  getSellerById,
  updateSellerStatus,
  getSellerStats
}; 