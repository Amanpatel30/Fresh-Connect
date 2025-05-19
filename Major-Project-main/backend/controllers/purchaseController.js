import asyncHandler from 'express-async-handler';
import Purchase from '../models/Purchase.js';
import Inventory from '../models/Inventory.js';

// @desc    Get all purchases with pagination
// @route   GET /api/purchases
// @access  Private
const getPurchases = asyncHandler(async (req, res) => {
  console.log('GET /api/purchases called');
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { user: req.user._id };
  
  // If hotel ID is provided, filter by hotel
  if (req.query.hotel) {
    query.hotel = req.query.hotel;
  }

  console.log('Query:', query);
  
  // Check if there are any purchases in the database
  const count = await Purchase.countDocuments({});
  console.log('Total purchases in database:', count);
  
  // If no purchases exist, create a test purchase
  if (count === 0) {
    console.log('No purchases found, creating test purchase');
    try {
      const testPurchase = {
        user: req.user._id,
        hotel: req.user.hotelId || req.user._id, // Use hotelId if available, otherwise use user ID
        supplier: 'Test Supplier',
        items: [
          {
            name: 'Test Item',
            quantity: 10,
            unit: 'kg',
            unitPrice: 5.99,
            totalPrice: 59.90,
          }
        ],
        totalAmount: 59.90,
        paymentMethod: 'Cash',
        paymentStatus: 'Paid',
        notes: 'This is a test purchase',
        receiptNumber: 'TEST-001',
      };
      
      await Purchase.create(testPurchase);
      console.log('Test purchase created');
    } catch (error) {
      console.error('Error creating test purchase:', error);
    }
  }

  const total = await Purchase.countDocuments(query);
  console.log('Purchases matching query:', total);
  
  const purchases = await Purchase.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('hotel', 'name')
    .populate('items.inventoryItem', 'name');

  console.log('Returning purchases:', purchases.length);
  
  res.json({
    items: purchases,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Get purchase by ID
// @route   GET /api/purchases/:id
// @access  Private
const getPurchaseById = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findById(req.params.id)
    .populate('hotel', 'name')
    .populate('items.inventoryItem', 'name');

  if (purchase) {
    // Check if the purchase belongs to the logged-in user
    if (purchase.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this purchase');
    }
    res.json(purchase);
  } else {
    res.status(404);
    throw new Error('Purchase not found');
  }
});

// @desc    Create a new purchase
// @route   POST /api/purchases
// @access  Private
const createPurchase = asyncHandler(async (req, res) => {
  const {
    hotel,
    items,
    supplier,
    totalAmount,
    paymentMethod,
    paymentStatus,
    notes,
    receiptNumber,
  } = req.body;

  if (!hotel || !items || items.length === 0 || !supplier || !paymentMethod) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Create the purchase
  const purchase = await Purchase.create({
    user: req.user._id,
    hotel,
    items,
    supplier,
    totalAmount,
    paymentMethod,
    paymentStatus: paymentStatus || 'Pending',
    notes,
    receiptNumber,
  });

  // Update inventory quantities
  for (const item of items) {
    const inventoryItem = await Inventory.findById(item.inventoryItem);
    if (inventoryItem) {
      inventoryItem.quantity += item.quantity;
      await inventoryItem.save();
    }
  }

  res.status(201).json(purchase);
});

// @desc    Update a purchase
// @route   PUT /api/purchases/:id
// @access  Private
const updatePurchase = asyncHandler(async (req, res) => {
  const {
    paymentStatus,
    notes,
    receiptNumber,
  } = req.body;

  const purchase = await Purchase.findById(req.params.id);

  if (purchase) {
    // Check if the purchase belongs to the logged-in user
    if (purchase.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this purchase');
    }

    // Only allow updating payment status, notes, and receipt number
    purchase.paymentStatus = paymentStatus || purchase.paymentStatus;
    purchase.notes = notes || purchase.notes;
    purchase.receiptNumber = receiptNumber || purchase.receiptNumber;

    const updatedPurchase = await purchase.save();
    res.json(updatedPurchase);
  } else {
    res.status(404);
    throw new Error('Purchase not found');
  }
});

// @desc    Delete a purchase
// @route   DELETE /api/purchases/:id
// @access  Private
const deletePurchase = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findById(req.params.id);

  if (purchase) {
    // Check if the purchase belongs to the logged-in user
    if (purchase.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this purchase');
    }

    // If the purchase is already paid, don't allow deletion
    if (purchase.paymentStatus === 'Paid') {
      res.status(400);
      throw new Error('Cannot delete a paid purchase');
    }

    // Revert inventory quantities if the purchase is being deleted
    for (const item of purchase.items) {
      const inventoryItem = await Inventory.findById(item.inventoryItem);
      if (inventoryItem) {
        inventoryItem.quantity -= item.quantity;
        // Ensure quantity doesn't go below 0
        if (inventoryItem.quantity < 0) {
          inventoryItem.quantity = 0;
        }
        await inventoryItem.save();
      }
    }

    await Purchase.deleteOne({ _id: req.params.id });
    res.json({ message: 'Purchase removed' });
  } else {
    res.status(404);
    throw new Error('Purchase not found');
  }
});

export {
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
}; 