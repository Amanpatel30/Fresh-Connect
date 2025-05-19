const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Complaint = require('../models/Complaint');
const Setting = require('../models/Setting');
const Payment = require('../models/Payment');
const mongoose = require('mongoose');

// Dashboard summary data
exports.getDashboardData = async (req, res) => {
  try {
    // Check if collections exist before querying
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Available collections:', collectionNames);

    // Initialize response object
    const response = {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      recentOrders: [],
      pendingVerifications: 0,
      pendingHotels: 0,
      totalSales: 0,
      salesData: [],
      verifiedSellers: 0,
      verifiedHotels: 0,
      urgentListingsCount: 0,
      freeListingsCount: 0
    };

    // Process collections based on what's available
    if (collectionNames.includes('users')) {
      response.totalUsers = await User.countDocuments();
      response.pendingVerifications = await User.countDocuments({ isVerified: false });
      response.verifiedSellers = await User.countDocuments({ role: 'seller', isVerified: true });
    }
    
    if (collectionNames.includes('products')) {
      response.totalProducts = await Product.countDocuments();
    }
    
    if (collectionNames.includes('orders')) {
      response.totalOrders = await Order.countDocuments();
      response.recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email');
      
      // Recent sales calculation
      const orders = await Order.find({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });
      response.totalSales = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    }
    
    if (collectionNames.includes('hotels')) {
      response.pendingHotels = await Hotel.countDocuments({ isVerified: false });
      response.verifiedHotels = await Hotel.countDocuments({ isVerified: true });
    }

    // Get analytics data from available collections
    if (collectionNames.includes('salesdatas')) {
      try {
        const SalesData = mongoose.model('SalesData');
        const salesData = await SalesData.findOne().sort({ createdAt: -1 });
        if (salesData) {
          response.salesData = salesData;
        }
      } catch (err) {
        console.error('Error fetching sales data:', err);
      }
    }
    
    // Check alternative collection names
    if (collectionNames.includes('dailysales')) {
      try {
        const DailySale = mongoose.model('DailySale');
        const dailySales = await DailySale.find().sort({ date: -1 }).limit(7);
        if (dailySales && dailySales.length) {
          response.salesData = dailySales.map(day => ({
            name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
            value: day.amount
          }));
        }
      } catch (err) {
        console.error('Error fetching daily sales:', err);
      }
    }
    
    // Check listings collections
    if (collectionNames.includes('listings')) {
      try {
        const Listing = mongoose.model('Listing');
        response.urgentListingsCount = await Listing.countDocuments({ isUrgent: true });
        response.freeListingsCount = await Listing.countDocuments({ isFree: true });
      } catch (err) {
        console.error('Error fetching listings data:', err);
      }
    }
    
    // Log what we're returning
    console.log('Returning dashboard data with values:', {
      totalUsers: response.totalUsers,
      totalProducts: response.totalProducts,
      totalOrders: response.totalOrders,
      pendingVerifications: response.pendingVerifications,
      pendingHotels: response.pendingHotels,
      totalSales: response.totalSales,
      hasSalesData: response.salesData && response.salesData.length > 0
    });
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getDashboardData:', error);
    res.status(500).json({ message: error.message });
  }
};

// User Management
exports.getAllUsers = async (req, res) => {
  try {
    // If role query parameter is provided, filter by role
    const query = req.query.role ? { role: req.query.role } : {};
    
    // For debugging
    console.log('Admin getAllUsers query:', query);
    
    const users = await User.find(query).select('-password');
    
    // For debugging
    console.log(`Found ${users.length} users matching criteria`);
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Seller Verification
exports.getPendingSellerVerifications = async (req, res) => {
  try {
    const pendingSellers = await User.find({
      role: 'seller',
      isVerified: false
    }).select('-password');
    
    res.status(200).json(pendingSellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifySeller = async (req, res) => {
  try {
    const { approved, notes } = req.body;
    const isVerified = approved === true || approved === 'true';
    
    console.log(`Verifying seller ${req.params.id} with status: ${isVerified ? 'approved' : 'rejected'}`);
    
    const updateData = { 
      isVerified, 
      verificationNotes: notes,
      verifiedAt: isVerified ? new Date() : null
    };
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'seller') {
      return res.status(400).json({ message: 'User is not a seller' });
    }
    
    // Update user with verification data
    Object.assign(user, updateData);
    await user.save();
    
    // Log the verification
    console.log(`Seller ${user.name} (${user._id}) verification status updated to: ${isVerified ? 'verified' : 'rejected'}`);
    
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        verifiedAt: user.verifiedAt
      }
    });
  } catch (error) {
    console.error('Error verifying seller:', error);
    res.status(400).json({ 
      success: false,
      message: error.message
    });
  }
};

// Hotel Verification
exports.getPendingHotels = async (req, res) => {
  try {
    const pendingHotels = await Hotel.find({ isVerified: false });
    res.status(200).json(pendingHotels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
    res.status(200).json(hotel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Product Category Management
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { name, description, image, parent, featured } = req.body;
    
    const category = new Category({
      name,
      description,
      image,
      parent,
      featured
    });
    
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Also update products with this category to uncategorized or handle as needed
    
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Order Monitoring
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderStatuses = async (req, res) => {
  try {
    const pending = await Order.countDocuments({ isDelivered: false, isPaid: true });
    const processing = await Order.countDocuments({ isDelivered: false, isPaid: true });
    const completed = await Order.countDocuments({ isDelivered: true });
    const cancelled = await Order.countDocuments({ isCancelled: true });
    
    res.status(200).json({
      pending,
      processing,
      completed,
      cancelled
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Payment Management
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .sort({ paymentDate: -1 })
      .populate('orderId', 'orderNumber totalAmount');
    
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Report Generation
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { isPaid: true };
    if (startDate && endDate) {
      query.paidAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const orders = await Order.find(query)
      .populate('user', 'name email');
    
    // Calculate total sales
    const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const itemsSold = orders.reduce((sum, order) => {
      return sum + order.orderItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
    
    res.status(200).json({
      totalSales,
      itemsSold,
      orderCount: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Content Management
exports.getContent = async (req, res) => {
  // This would normally connect to a Content model
  // For now we'll return placeholder data
  try {
    res.status(200).json({
      homepageBanner: {
        title: 'Welcome to Our Platform',
        subtitle: 'Find the best products and services',
        imageUrl: '/images/banner.jpg'
      },
      aboutPage: {
        title: 'About Us',
        content: 'Our company...'
      },
      contactInfo: {
        email: 'contact@example.com',
        phone: '123-456-7890'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Analytics
exports.getAnalytics = async (req, res) => {
  try {
    // User growth - past 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Sales data - past 6 months
    const salesData = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          paidAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { $month: '$paidAt' },
          total: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          totalSold: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);
    
    res.status(200).json({
      userGrowth,
      salesData,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Complaint Handling
exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('orderId')
      .populate('productId');
    
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderId')
      .populate('productId')
      .populate('adminId', 'name');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    res.status(200).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, adminResponse, adminId } = req.body;
    
    const updateData = { 
      status, 
      adminResponse, 
      adminId
    };
    
    if (status === 'resolved') {
      updateData.resolvedAt = Date.now();
    }
    
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate('user', 'name email')
      .populate('orderId')
      .populate('productId')
      .populate('adminId', 'name');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    res.status(200).json(complaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// System Settings
exports.getSystemSettings = async (req, res) => {
  try {
    const settings = await Setting.find().sort({ category: 1, key: 1 });
    
    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});
    
    res.status(200).json(groupedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSystemSettings = async (req, res) => {
  try {
    const { key, value, adminId } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({ message: 'Key and value are required' });
    }
    
    const updatedSetting = await Setting.updateSetting(key, value, adminId);
    
    res.status(200).json(updatedSetting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPublicSettings = async (req, res) => {
  try {
    const publicSettings = await Setting.getPublic();
    
    // Transform to an object with key-value pairs
    const settings = publicSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 