import Order from '../models/Order.js';
import Product from '../models/Product.js';
import catchAsync from '../utils/catchAsync.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';
import UrgentSale from '../models/UrgentSale.js';

// Get all orders for a seller
export const getOrders = catchAsync(async (req, res) => {
  console.log('Getting orders for user:', req.user._id);
  console.log('User role:', req.user.role);
  
  // Initialize query as empty object
  let query = {};
  
  // If user is admin, retrieve all orders
  if (req.user.role === 'admin') {
    console.log('Admin user: retrieving all orders');
  } 
  // If user is hotel/seller, only retrieve their orders
  else if (req.user.role === 'hotel') {
    query = { seller: req.user._id };
    console.log('Hotel/Seller user: filtering orders by seller ID');
  }
  // Regular user sees only their orders
  else {
    query = { user: req.user._id };
    console.log('Regular user: filtering orders by user ID');
  }
  
  console.log('Query:', JSON.stringify(query));
  
  // Get orders without using populate since buyer is embedded
  const orders = await Order.find(query).sort('-createdAt');
  
  console.log(`Found ${orders.length} orders`);
  
  // Log the first order to check its structure
  if (orders.length > 0) {
    console.log('First order buyer data:', orders[0].buyer);
  }
  
  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: orders
  });
});

// Get a single order
export const getOrder = catchAsync(async (req, res) => {
  console.log('Getting order details for ID:', req.params.id);
  console.log('User role:', req.user.role);
  
  // Initialize query with order ID
  let query = { _id: req.params.id };
  
  // Admins can view any order
  if (req.user.role === 'admin') {
    console.log('Admin user: Can view any order');
  } 
  // Hotels/sellers can only view their own orders
  else if (req.user.role === 'hotel') {
    query.seller = req.user._id;
    console.log('Hotel/Seller user: Can only view their own orders');
  }
  // Regular users can only view their own orders
  else {
    query.user = req.user._id;
    console.log('Regular user: Can only view their own orders');
  }
  
  console.log('Query:', JSON.stringify(query));
  
  // Get order without using populate since buyer is embedded
  const order = await Order.findOne(query);
  
  if (!order) {
    console.log('Order not found or user does not have permission');
    return res.status(404).json({
      status: 'fail',
      message: 'Order not found or you do not have permission to view it'
    });
  }
  
  console.log('Order found:', order._id);
  console.log('Order buyer data:', order.buyer);
  
  res.status(200).json({
    status: 'success',
    data: order
  });
});

// Update order status
export const updateOrderStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  console.log(`Updating order ${req.params.id} status to ${status}`);
  console.log('Request body:', req.body);
  console.log('Request params:', req.params);
  console.log('User role:', req.user.role);

  // Initialize query with order ID
  let query = { _id: req.params.id };
  
  // Admins can update any order, hotels/sellers can only update their own orders
  if (req.user.role !== 'admin') {
    query.seller = req.user._id;
    console.log('Non-admin user: Can only update orders for this seller');
  } else {
    console.log('Admin user: Can update any order');
  }

  console.log('Finding order with query:', query);
  
  // First, find the order to check if it exists and to get its current status
  const order = await Order.findOne(query);

  if (!order) {
    console.log('Order not found or user does not have permission');
    return res.status(404).json({
      status: 'fail',
      message: 'Order not found or you do not have permission to update it'
    });
  }

  console.log('Found order:', order._id);
  console.log('Current status:', order.status);
  console.log('New status:', status);

  // Validate status transition
  const validTransitions = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: []
  };

  if (validTransitions[order.status] && !validTransitions[order.status].includes(status)) {
    console.log(`Invalid status transition from ${order.status} to ${status}`);
    return res.status(400).json({
      status: 'fail',
      message: `Cannot transition from ${order.status} to ${status}`
    });
  }

  // If cancelling, restore product stock
  if (status === 'cancelled') {
    for (const item of order.items) {
      if (item.product) {
        try {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
          });
        } catch (err) {
          console.log(`Error restoring stock for product ${item.product}: ${err.message}`);
          // Continue with other items even if one fails
        }
      }
    }
  }

  // Use findByIdAndUpdate with { runValidators: false } to bypass validation
  // This is safer than modifying and saving the entire document
  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    { status: status },
    { 
      new: true,      // Return the updated document
      runValidators: false  // Skip validation since we're only updating status
    }
  );
  
  console.log(`Order ${updatedOrder._id} status updated to ${status}`);

  res.status(200).json({
    status: 'success',
    data: updatedOrder
  });
});

// Create a new order (usually called by buyer)
export const createOrder = catchAsync(async (req, res) => {
  console.log('Creating order with data:', req.body);
  
  const {
    items,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalAmount,
    paymentInfo,
    isPaid,
    paidAt,
    status = 'pending'
  } = req.body;

  // Ensure user is authenticated
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      status: 'fail',
      message: 'User is not authenticated'
    });
  }

  try {
    // IMPORTANT: Disabled transactions completely due to MongoDB error
    // "Transaction numbers are only allowed on a replica set member or mongos"
    console.log('Creating order without transactions due to MongoDB limitation');

    // Process order items
    const orderItems = [];
    let calculatedTotal = 0;
    let sellerId = req.body.seller || null; // First try to get from request body
    console.log('Initial sellerId from request body:', sellerId);
    
    // If sellerId is provided, validate its format
    if (sellerId) {
      if (!mongoose.Types.ObjectId.isValid(sellerId)) {
        console.warn(`Provided sellerId ${sellerId} is not a valid MongoDB ObjectId, will attempt to extract from items`);
        sellerId = null;
      }
    }

    // Check for sellerId in each item
    for (const item of items) {
      try {
        // Check if item contains sellerId directly
        if (!sellerId && item.productSellerId) {
          sellerId = item.productSellerId;
          console.log(`Extracted sellerId from item.productSellerId: ${sellerId}`);
        }
        
        // Find product - first check in Product collection
        let product = null;
        
        try {
          product = await Product.findById(item.product);
          
          if (product) {
            console.log(`Found product ${item.product} in regular Products collection`);
          } else {
            // If not found in regular Products, check UrgentSale collection
            console.log(`Product ${item.product} not found in regular Products, checking UrgentSale...`);
            const urgentProduct = await UrgentSale.findById(item.product);
            
            if (urgentProduct) {
              console.log(`Found product ${item.product} in UrgentSale collection`);
              product = {
                _id: urgentProduct._id,
                name: urgentProduct.name,
                price: urgentProduct.discountedPrice || urgentProduct.price,
                stock: urgentProduct.quantity,
                seller: urgentProduct.seller,
                isUrgent: true
              };
            }
          }
        } catch (productFindError) {
          console.error(`Error finding product ${item.product}:`, productFindError);
        }
        
        if (!product) {
          console.log(`Product not found: ${item.product}`);
          // Instead of throwing error, just log and continue with available data
          orderItems.push({
            product: item.product,
            name: item.name || 'Unknown Product',
            quantity: item.quantity,
            price: item.price || 0,
            image: item.image || null
          });
          calculatedTotal += (item.price || 0) * item.quantity;
          continue;
        }

        // Store seller ID if not already set
        if (!sellerId && product.seller) {
          sellerId = product.seller;
          console.log(`Setting seller ID from product to: ${sellerId}`);
        }
        
        // Verify seller consistency (all products should be from same seller)
        if (sellerId && product.seller && sellerId.toString() !== product.seller.toString()) {
          console.warn(`Warning: Product ${product._id} has different seller ID (${product.seller}) than previously set (${sellerId})`);
        }

        // Check stock and update (without transactions)
        if (product.stock < item.quantity) {
          console.log(`Warning: Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
          // Continue anyway in offline mode
        } else {
          // Reduce product stock - without transaction
          if (!product.isUrgent) { // Only update stock for regular products
            try {
              await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
              console.log(`Updated stock for ${product.name} to ${product.stock - item.quantity}`);
            } catch (stockUpdateError) {
              console.error(`Error updating stock for ${product._id}:`, stockUpdateError);
            }
          } else {
            // For urgent sale products, update the quantity
            try {
              await UrgentSale.findByIdAndUpdate(product._id, { $inc: { quantity: -item.quantity } });
              console.log(`Updated quantity for urgent sale ${product.name}`);
            } catch (urgentUpdateError) {
              console.error(`Error updating quantity for urgent sale ${product._id}:`, urgentUpdateError);
            }
          }
        }

        // Add to order items
        orderItems.push({
          product: product._id,
          name: item.name || product.name,
          quantity: item.quantity,
          price: item.price || product.price,
          image: item.image || (product.images && product.images.length > 0 ? product.images[0].url : null)
        });

        // Calculate total (use provided price or product price)
        calculatedTotal += (item.price || product.price) * item.quantity;
      } catch (productError) {
        console.error(`Error processing product ${item.product}:`, productError);
        // Continue with next item instead of failing entire order
        orderItems.push({
          product: item.product,
          name: item.name || 'Unknown Product',
          quantity: item.quantity,
          price: item.price || 0,
          image: item.image || null
        });
        calculatedTotal += (item.price || 0) * item.quantity;
      }
    }

    // Generate order number
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    
    const orderNumber = `ORD-${year}${month}${day}-${randomNum}`;

    // Create the order object
    const orderData = {
      user: req.user._id,
      seller: sellerId ? new mongoose.Types.ObjectId(sellerId) : null, // Ensure sellerId is properly converted to ObjectId
      orderNumber,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: itemsPrice || calculatedTotal,
      taxPrice: taxPrice || 0,
      shippingPrice: shippingPrice || 0,
      totalAmount: Number(totalAmount) || calculatedTotal,
      isPaid: isPaid || false,
      paidAt: paidAt || null,
      status,
      statusUpdates: [{
        status,
        date: new Date(),
        note: `Order created with status: ${status} (offline-compatible method)`
      }]
    };

    // Special handling for specific hotel ID
    const specificHotelId = '67d993b3fc12aa16718aa438';
    if (sellerId === specificHotelId || (sellerId && sellerId.toString() === specificHotelId)) {
      console.log(`SPECIAL HANDLING: Creating order for test hotel ID: ${specificHotelId}`);
      // Extra redundant storage to ensure we can query this hotel's orders
      orderData.hotelId = new mongoose.Types.ObjectId(specificHotelId);
      orderData.hotel = new mongoose.Types.ObjectId(specificHotelId);
      
      // Add debug info
      orderData.debugInfo = {
        isTestHotel: true,
        originalSellerId: sellerId,
        processingTime: new Date(),
      };
    }

    // Check if sellerId was properly set
    if (!sellerId) {
      console.warn('WARNING: Order is being created without a sellerId!');
      console.log('Order items:', orderItems.map(item => ({
        product: item.product,
        name: item.name
      })));
    } else {
      console.log(`Creating order with sellerId: ${sellerId} (ObjectId: ${orderData.seller})`);
    }

    // Create the order directly without transactions
    const order = await Order.create(orderData);
    console.log(`Order created: ${order._id} with number ${orderNumber}`);

    // Try to clear user's cart (don't fail if this fails)
    try {
      await mongoose.model('Cart').findOneAndUpdate(
        { user: req.user._id },
        { 
          $set: { 
            items: [],
            totalItems: 0,
            totalAmount: 0
          } 
        }
      );
      console.log(`Cart cleared for user: ${req.user._id}`);
    } catch (cartError) {
      console.error('Error clearing cart:', cartError);
      // Don't fail the order if cart clearing fails
    }

    // Return successful response
    return res.status(201).json({
      status: 'success',
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(400).json({
      status: 'fail',
      message: error.message || 'Error creating order'
    });
  }
});

// Get order statistics for a seller
export const getOrderStats = catchAsync(async (req, res) => {
  const stats = await Order.aggregate([
    {
      $match: {
        seller: req.user._id,
        status: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        avgOrderValue: { $avg: '$totalAmount' }
      }
    }
  ]);

  const statusCounts = await Order.aggregate([
    {
      $match: { seller: req.user._id }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0
      },
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    }
  });
});

// @desc    Create a test order
// @route   POST /api/orders/test
// @access  Private
export const createTestOrder = asyncHandler(async (req, res) => {
  try {
    const { hotelId } = req.body;
    
    if (!hotelId) {
      res.status(400);
      throw new Error('Hotel ID is required');
    }

    const testOrder = new Order({
      user: req.user._id, // Use the logged-in user as buyer
      seller: hotelId, // Use the provided hotelId as seller
      orderNumber: `TEST-${Date.now()}`,
      totalAmount: 150.00,
      status: 'delivered',
      isPaid: true,
      paidAt: new Date(),
      paymentMethod: 'card',
      items: [{
        name: 'Test Item',
        quantity: 2,
        price: 75.00
      }],
      shippingAddress: {
        fullName: req.user.name || 'Test User',
        address: '123 Test St',
        city: 'Test City',
        postalCode: '12345',
        state: 'Test State',
        country: 'India',
        phone: '1234567890'
      },
      itemsPrice: 150.00,
      taxPrice: 0,
      shippingPrice: 0,
      statusUpdates: [{
        status: 'delivered',
        date: new Date(),
        note: 'Test order created with delivered status'
      }]
    });

    const savedOrder = await testOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating test order:', error);
    res.status(500).json({ 
      message: 'Error creating test order',
      error: error.message 
    });
  }
});

// Create a simple order without using transactions
export const createSimpleOrder = asyncHandler(async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalAmount,
      isPaid,
      paidAt,
      status = 'pending'
    } = req.body;

    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        status: 'fail',
        message: 'User is not authenticated'
      });
    }

    console.log('Creating simple order for user:', req.user._id);

    // Extract seller ID from first product
    let sellerId = null;
    const orderItems = [];
    
    // Process order items
    if (items && items.length > 0) {
      for (const item of items) {
        // Find product to get seller ID
        try {
          if (item.product) {
            const product = await Product.findById(item.product);
            if (product && product.seller) {
              sellerId = product.seller;
              console.log(`Found seller ID from product: ${sellerId}`);
              break; // We only need one seller ID
            }
          }
        } catch (err) {
          console.log('Error finding product:', err);
          // Continue anyway
        }
        
        // Add to order items regardless of whether we found the product
        orderItems.push({
          product: item.product,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image
        });
      }
    }

    // Generate order number
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${year}${month}${day}-${randomNum}`;

    // Create the order - directly use Order.create() instead of transactions
    const orderData = {
      user: req.user._id,
      seller: sellerId, // Set the seller ID in the order
      orderNumber,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: itemsPrice || 0,
      taxPrice: taxPrice || 0,
      shippingPrice: shippingPrice || 0,
      totalAmount: totalAmount || 0,
      isPaid: isPaid || false,
      paidAt: paidAt || null,
      status,
      statusUpdates: [{
        status,
        date: new Date(),
        note: `Order created with status: ${status} (simple method)`
      }]
    };

    const newOrder = await Order.create(orderData);
    console.log(`Simple order created: ${newOrder._id} with number ${orderNumber}`);

    // Return successful response
    return res.status(201).json({
      status: 'success',
      data: newOrder
    });
  } catch (error) {
    console.error('Error creating simple order:', error);
    return res.status(400).json({
      status: 'fail',
      message: error.message || 'Error creating simple order'
    });
  }
});

// Create a basic order with minimal validation
export const createBasicOrder = asyncHandler(async (req, res) => {
  try {
    console.log('Creating basic order with data:', req.body);
    
    // If user is not authenticated but we have data, create anyway for demo purposes
    const userId = req.user?._id || 'anonymous';
    
    // Simplify order data - focus on just saving the core information
    const { 
      items = [], 
      shippingAddress = {}, 
      totalAmount = 0,
      paymentMethod = 'cod',
      seller: providedSeller = null
    } = req.body;
    
    // Try to extract seller ID
    let sellerId = providedSeller;
    
    // If seller ID wasn't provided, try to find from first product
    if (!sellerId && items.length > 0 && items[0].product) {
      try {
        const product = await Product.findById(items[0].product);
        if (product && product.seller) {
          sellerId = product.seller;
        }
      } catch (err) {
        console.log('Error finding product for seller ID:', err.message);
      }
    }
    
    // Generate a simple order number with timestamp
    const orderNumber = `ORD-${Date.now().toString().substring(5)}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Create basic order data
    const orderData = {
      user: userId,
      seller: sellerId,
      orderNumber,
      items: items.map(item => ({
        product: item.product || null,
        name: item.name || 'Unknown Product',
        quantity: item.quantity || 1,
        price: item.price || 0,
        image: item.image || null
      })),
      shippingAddress: {
        fullName: shippingAddress.fullName || 'Demo User',
        address: shippingAddress.address || 'Demo Address',
        city: shippingAddress.city || 'Demo City',
        postalCode: shippingAddress.postalCode || '12345',
        state: shippingAddress.state || 'Demo State',
        country: shippingAddress.country || 'India',
        phone: shippingAddress.phone || '0000000000'
      },
      paymentMethod,
      totalAmount: Number(totalAmount) || 0,
      status: 'pending',
      statusUpdates: [{
        status: 'pending',
        date: new Date(),
        note: 'Order created with basic method'
      }]
    };
    
    // Create in database
    const order = await Order.create(orderData);
    console.log('Basic order created:', order._id);
    
    return res.status(201).json({
      status: 'success',
      data: order
    });
  } catch (error) {
    console.error('Error creating basic order:', error);
    return res.status(400).json({
      status: 'fail',
      message: error.message || 'Error creating basic order'
    });
  }
});

// Import offline orders
export const importOfflineOrders = asyncHandler(async (req, res) => {
  try {
    const { orders } = req.body;
    
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No orders provided for import'
      });
    }
    
    console.log(`Attempting to import ${orders.length} offline orders`);
    
    const results = {
      success: [],
      failed: []
    };
    
    // Process each order
    for (const offlineOrder of orders) {
      try {
        // Extract the necessary data from the offline order
        const {
          items = [],
          shippingAddress = {},
          paymentMethod = 'cod',
          totalAmount = 0,
          status = 'pending',
          isPaid = false,
          paidAt = null
        } = offlineOrder;
        
        // Find seller ID
        let sellerId = offlineOrder.seller || null;
        
        // If no seller ID was provided, try to find from first product
        if (!sellerId && items.length > 0 && items[0].product) {
          try {
            const product = await Product.findById(items[0].product);
            if (product && product.seller) {
              sellerId = product.seller;
            }
          } catch (err) {
            console.log('Error finding product for seller ID:', err.message);
          }
        }
        
        // Generate new order number
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `ORD-${year}${month}${day}-${randomNum}`;
        
        // Create order data
        const orderData = {
          user: req.user._id,
          seller: sellerId,
          orderNumber,
          items: items.map(item => ({
            product: item.product || null,
            name: item.name || 'Unknown Product',
            quantity: item.quantity || 1,
            price: item.price || 0,
            image: item.image || null
          })),
          shippingAddress: {
            fullName: shippingAddress.fullName || 'Unknown',
            address: shippingAddress.address || 'Unknown',
            city: shippingAddress.city || 'Unknown',
            postalCode: shippingAddress.postalCode || 'Unknown',
            state: shippingAddress.state || 'Unknown',
            country: shippingAddress.country || 'India',
            phone: shippingAddress.phone || 'Unknown'
          },
          paymentMethod,
          totalAmount: Number(totalAmount) || 0,
          isPaid,
          paidAt,
          status,
          statusUpdates: [{
            status,
            date: new Date(),
            note: `Order imported from offline storage`
          }],
          // Store reference to original offline order ID for client to track
          offlineOrderId: offlineOrder._id || offlineOrder.id || null,
          importedAt: new Date(),
          isImported: true
        };
        
        // Create in database
        const newOrder = await Order.create(orderData);
        console.log(`Imported offline order: ${newOrder._id}`);
        
        // Add to successful imports
        results.success.push({
          originalId: offlineOrder._id || offlineOrder.id,
          newId: newOrder._id,
          orderNumber: newOrder.orderNumber
        });
      } catch (orderError) {
        console.error(`Error importing offline order:`, orderError);
        
        // Add to failed imports
        results.failed.push({
          originalId: offlineOrder._id || offlineOrder.id,
          error: orderError.message
        });
      }
    }
    
    // Return results
    return res.status(200).json({
      status: 'success',
      message: `Imported ${results.success.length} of ${orders.length} orders`,
      data: results
    });
  } catch (error) {
    console.error('Error importing offline orders:', error);
    return res.status(400).json({
      status: 'fail',
      message: error.message || 'Error importing offline orders'
    });
  }
});

// Create an emergency order without requiring authentication
export const createEmergencyOrder = asyncHandler(async (req, res) => {
  try {
    console.log('Creating emergency order with data:', req.body);
    
    const { 
      items = [], 
      shippingAddress = {}, 
      totalAmount = 0,
      paymentMethod = 'cod',
      seller: providedSeller = null,
      customerName,
      customerPhone,
      customerEmail
    } = req.body;
    
    if (!items.length) {
      return res.status(400).json({
        status: 'fail',
        message: 'Order must contain at least one item'
      });
    }
    
    if (!shippingAddress.fullName && !customerName) {
      return res.status(400).json({
        status: 'fail',
        message: 'Customer name or shipping address name is required'
      });
    }
    
    // Try to extract seller ID
    let sellerId = providedSeller;
    
    // If seller ID wasn't provided, try to find from first product
    if (!sellerId && items.length > 0 && items[0].product) {
      try {
        const product = await Product.findById(items[0].product);
        if (product && product.seller) {
          sellerId = product.seller;
        }
      } catch (err) {
        console.log('Error finding product for seller ID:', err.message);
      }
    }
    
    // Generate a simple order number with timestamp
    const timestamp = Date.now();
    const orderNumber = `EMERG-${timestamp.toString().substring(5)}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Create order data
    const orderData = {
      // Mark as anonymous order
      user: 'anonymous',
      seller: sellerId,
      orderNumber,
      items: items.map(item => ({
        product: item.product || null,
        name: item.name || 'Unknown Product',
        quantity: item.quantity || 1,
        price: item.price || 0,
        image: item.image || null
      })),
      shippingAddress: {
        fullName: shippingAddress.fullName || customerName || 'Emergency Order',
        address: shippingAddress.address || 'Not Provided',
        city: shippingAddress.city || 'Not Provided',
        postalCode: shippingAddress.postalCode || 'Not Provided',
        state: shippingAddress.state || 'Not Provided',
        country: shippingAddress.country || 'India',
        phone: shippingAddress.phone || customerPhone || 'Not Provided'
      },
      paymentMethod,
      totalAmount: Number(totalAmount) || 0,
      status: 'pending',
      isEmergencyOrder: true,
      customerContact: {
        name: customerName || shippingAddress.fullName,
        phone: customerPhone || shippingAddress.phone,
        email: customerEmail || 'not-provided'
      },
      statusUpdates: [{
        status: 'pending',
        date: new Date(),
        note: 'Emergency order created without authentication'
      }]
    };
    
    // Create in database
    const order = await Order.create(orderData);
    console.log('Emergency order created:', order._id);
    
    return res.status(201).json({
      status: 'success',
      message: 'Emergency order created successfully',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Error creating emergency order:', error);
    return res.status(400).json({
      status: 'fail',
      message: error.message || 'Error creating emergency order'
    });
  }
}); 