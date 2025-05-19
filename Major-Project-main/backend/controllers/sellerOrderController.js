import Order from '../models/Order.js';
import Product from '../models/Product.js';
import catchAsync from '../utils/catchAsync.js';
import errorHandler from '../utils/errorHandler.js';

// Get all orders for a seller
export const getOrders = catchAsync(async (req, res) => {
  const sellerId = req.user._id;
  
  // Build query
  const query = { seller: sellerId };
  
  // Filter by status if provided
  if (req.query.status) {
    query.status = req.query.status;
  }
  
  // Filter by payment status if provided
  if (req.query.paymentStatus) {
    query.paymentStatus = req.query.paymentStatus;
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
  
  // Execute query - Fix populate to use 'user' instead of 'buyer'
  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);
  
  // Get total count
  const total = await Order.countDocuments(query);
  
  // Pagination result
  const pagination = {
    total,
    pages: Math.ceil(total / limit),
    page,
    limit
  };
  
  res.status(200).json({
    status: 'success',
    count: orders.length,
    pagination,
    data: orders
  });
});

// Get all orders for a seller (legacy function, keeping for compatibility)
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    // Build query
    const query = { seller: sellerId };
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by payment status if provided
    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
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
    
    // Execute query - Fix populate to use 'user' instead of 'buyer'
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    // Get total count
    const total = await Order.countDocuments(query);
    
    // Pagination result
    const pagination = {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit
    };
    
    res.status(200).json({
      success: true,
      count: orders.length,
      pagination,
      data: orders
    });
  } catch (error) {
    // Fix: Handle error directly instead of using errorHandler
    console.log('Error in getSellerOrders:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get a single order
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if the order belongs to the logged-in seller
    if (order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.log('Error in getOrder:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status'
      });
    }
    
    let order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if the order belongs to the logged-in seller
    if (order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }
    
    // Update the order
    order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.log('Error in updateOrderStatus:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get order statistics for seller dashboard
export const getOrderStats = async (req, res) => {
  try {
    console.log('getOrderStats function called with period:', req.query.period);
    const sellerId = req.user._id;
    const period = req.query.period || 'week';
    
    // Get total orders
    const totalOrders = await Order.countDocuments({ seller: sellerId });
    console.log('Total orders for seller:', totalOrders);
    
    // Get orders by status
    const pendingOrders = await Order.countDocuments({ 
      seller: sellerId, 
      status: 'pending' 
    });
    
    const processingOrders = await Order.countDocuments({ 
      seller: sellerId, 
      status: 'processing' 
    });
    
    const shippedOrders = await Order.countDocuments({ 
      seller: sellerId, 
      status: 'shipped' 
    });
    
    const deliveredOrders = await Order.countDocuments({ 
      seller: sellerId, 
      status: 'delivered' 
    });
    
    const cancelledOrders = await Order.countDocuments({ 
      seller: sellerId, 
      status: 'cancelled' 
    });
    
    // Get recent orders
    const recentOrders = await Order.find({ seller: sellerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');
    
    // Calculate sales data for the chart based on period
    console.log('Calculating sales data for period:', period);
    
    let startDate, endDate;
    const now = new Date();
    
    // Determine date range based on period
    if (period === 'week') {
      // Get last 7 days
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      endDate = now;
      console.log('Date range for weekly data:', startDate, 'to', endDate);
    } else if (period === 'month') {
      // Get last 30 days
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
      endDate = now;
    } else if (period === 'year') {
      // Get last 12 months
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      endDate = now;
    } else {
      // Default to week
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      endDate = now;
    }
    
    // Get orders for the period
    const periodOrders = await Order.find({
      seller: sellerId,
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    console.log(`Found ${periodOrders.length} orders for the period`);
    
    // For weekly data, group by day of week
    const salesByDay = {};
    const lastWeekSalesByDay = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Initialize sales for all days to 0
    days.forEach(day => {
      salesByDay[day] = 0;
      lastWeekSalesByDay[day] = 0;
    });
    
    // Calculate this week's sales
    periodOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const dayIndex = orderDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dayName = days[dayIndex];
      
      // Sum up order amounts for each day
      salesByDay[dayName] += order.totalAmount || 0;
    });
    
    // Calculate last week's sales (for comparison)
    const lastWeekStartDate = new Date(startDate);
    const lastWeekEndDate = new Date(endDate);
    lastWeekStartDate.setDate(lastWeekStartDate.getDate() - 7);
    lastWeekEndDate.setDate(lastWeekEndDate.getDate() - 7);
    
    const lastWeekOrders = await Order.find({
      seller: sellerId,
      createdAt: { $gte: lastWeekStartDate, $lte: lastWeekEndDate }
    });
    
    console.log(`Found ${lastWeekOrders.length} orders for last week`);
    
    // Calculate last week's sales
    lastWeekOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const dayIndex = orderDate.getDay();
      const dayName = days[dayIndex];
      
      // Sum up order amounts for each day
      lastWeekSalesByDay[dayName] += order.totalAmount || 0;
    });
    
    // Format the data for the chart (array of objects with day, sales, lastWeekSales)
    const formattedData = days.map(day => ({
      day,
      sales: Math.round(salesByDay[day]),
      lastWeekSales: Math.round(lastWeekSalesByDay[day])
    }));
    
    // Weekly sales are from Monday to Sunday, so reorder the array
    const mondayIndex = days.indexOf('Mon');
    const reorderedData = [
      ...formattedData.slice(mondayIndex),
      ...formattedData.slice(0, mondayIndex)
    ];
    
    console.log('Formatted weekly sales data:', reorderedData);
    
    // Return all stats
    return res.status(200).json({
      success: true,
      data: reorderedData,
      orderStats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        recentOrders
      }
    });
  } catch (error) {
    console.log('Error in getOrderStats:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error when fetching order stats',
      error: error.message
    });
  }
};

// Get pending orders for a seller
export const getPendingOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    const pendingOrders = await Order.find({ 
      seller: sellerId, 
      status: 'pending' 
    })
      .populate('user', 'name email')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: pendingOrders.length,
      data: pendingOrders
    });
  } catch (error) {
    console.log('Error in getPendingOrders:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get shipping orders for a seller
export const getShippingOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    const shippingOrders = await Order.find({ 
      seller: sellerId, 
      status: { $in: ['processing', 'shipped'] } 
    })
      .populate('user', 'name email')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: shippingOrders.length,
      data: shippingOrders
    });
  } catch (error) {
    console.log('Error in getShippingOrders:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create a new order (usually called by buyer)
export const createOrder = catchAsync(async (req, res) => {
  const {
    items,
    shippingAddress,
    phone,
    paymentMethod,
    seller
  } = req.body;

  // Validate products and calculate total
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: `Product ${item.product} not found`
      });
    }

    if (product.stock < item.quantity) {
      return res.status(400).json({
        status: 'fail',
        message: `Insufficient stock for ${product.name}`
      });
    }

    // Reduce product stock
    product.stock -= item.quantity;
    await product.save();

    orderItems.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      unit: product.unit,
      price: product.price
    });

    totalAmount += product.price * item.quantity;
  }

  // Use 'user' instead of 'buyer' for consistency with the schema
  const order = await Order.create({
    user: req.user._id,
    seller,
    items: orderItems,
    shippingAddress,
    phone,
    totalAmount,
    paymentMethod
  });

  res.status(201).json({
    status: 'success',
    data: order
  });
}); 