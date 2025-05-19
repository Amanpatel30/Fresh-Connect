import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { catchAsync } from '../utils/catchAsync.js';
import { errorHandler } from '../utils/errorHandler.js';

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
  
  // Execute query
  const orders = await Order.find(query)
    .populate('buyer', 'name email')
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
    
    // Execute query
    const orders = await Order.find(query)
      .populate('buyer', 'name email')
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
    errorHandler(error, req, res);
  }
};

// Get a single order
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email phone')
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
    errorHandler(error, req, res);
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
    errorHandler(error, req, res);
  }
};

// Get order statistics for seller dashboard
export const getOrderStats = catchAsync(async (req, res) => {
  const sellerId = req.user._id;
  
  // Get total orders
  const totalOrders = await Order.countDocuments({ seller: sellerId });
  
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
    .populate('buyer', 'name email');
  
  // Store results in res.locals
  res.locals.orderStats = {
    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    recentOrders
  };
});

// Get pending orders for a seller
export const getPendingOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    const pendingOrders = await Order.find({ 
      seller: sellerId, 
      status: 'pending' 
    })
      .populate('buyer', 'name email')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: pendingOrders.length,
      data: pendingOrders
    });
  } catch (error) {
    errorHandler(error, req, res);
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
      .populate('buyer', 'name email')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: shippingOrders.length,
      data: shippingOrders
    });
  } catch (error) {
    errorHandler(error, req, res);
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

  const order = await Order.create({
    buyer: req.user._id,
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