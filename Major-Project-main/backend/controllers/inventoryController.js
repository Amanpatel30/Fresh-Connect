import asyncHandler from 'express-async-handler';
import Inventory from '../models/Inventory.js';

// @desc    Get all inventory items for a hotel
// @route   GET /api/inventory
// @access  Private
const getInventoryItems = asyncHandler(async (req, res) => {
  try {
    console.log('Getting inventory items for user:', req.user?._id);
    console.log('User object:', JSON.stringify(req.user));
    
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;
    
    const hotelId = req.user?._id;
    
    if (!hotelId) {
      console.error('No hotel ID found in request');
      
      // For development, return mock data instead of error
      if (process.env.NODE_ENV === 'development') {
        console.log('Returning mock data for development');
        return res.json({
          items: [
            {
              id: '1',
              name: 'Sample Item 1',
              category: 'vegetables',
              quantity: 10,
              unit: 'kg',
              unitPrice: 5.99,
              supplier: 'Sample Supplier',
              status: 'In Stock',
              reorderLevel: 5,
              createdAt: new Date()
            },
            {
              id: '2',
              name: 'Sample Item 2',
              category: 'fruits',
              quantity: 3,
              unit: 'kg',
              unitPrice: 7.99,
              supplier: 'Sample Supplier',
              status: 'Low Stock',
              reorderLevel: 5,
              createdAt: new Date()
            }
          ],
          total: 2,
          page: parseInt(page),
          pages: 1
        });
      }
      
      return res.status(400).json({ 
        message: 'Hotel ID is required',
        success: false
      });
    }

    // Build search query
    const searchQuery = search 
      ? { 
          hotel: hotelId,
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
            { 'supplier.name': { $regex: search, $options: 'i' } }
          ]
        }
      : { hotel: hotelId };

    console.log('Search query:', JSON.stringify(searchQuery));

    // For development, if no items exist, return empty array instead of error
    const count = await Inventory.countDocuments(searchQuery);
    console.log('Found', count, 'inventory items');
    
    if (count === 0) {
      return res.json({ 
        items: [],
        total: 0,
        page: parseInt(page),
        pages: 0
      });
    }

    const items = await Inventory.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Format items for frontend
    const formattedItems = items.map(item => ({
      id: item._id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.price,
      supplier: item.supplier?.name || '',
      reorderLevel: item.minStockLevel,
      status: item.isLowStock ? 'Low Stock' : (item.isOutOfStock ? 'Out of Stock' : 'In Stock'),
      createdAt: item.createdAt
    }));

    res.json({ 
      items: formattedItems,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Error in getInventoryItems:', error);
    res.status(500).json({
      message: 'Error fetching inventory items',
      error: error.message
    });
  }
});

// @desc    Get a single inventory item
// @route   GET /api/inventory/:id
// @access  Private
const getInventoryItem = asyncHandler(async (req, res) => {
  try {
    const item = await Inventory.findOne({ 
      _id: req.params.id,
      hotel: req.user._id 
    });

    if (!item) {
      res.status(404);
      throw new Error('Inventory item not found');
    }

    // Format for frontend
    const formattedItem = {
      id: item._id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.price,
      supplier: item.supplier?.name || '',
      reorderLevel: item.minStockLevel,
      status: item.isLowStock ? 'Low Stock' : (item.isOutOfStock ? 'Out of Stock' : 'In Stock'),
      createdAt: item.createdAt
    };

    res.json(formattedItem);
  } catch (error) {
    console.error('Error in getInventoryItem:', error);
    res.status(500).json({
      message: 'Error fetching inventory item',
      error: error.message
    });
  }
});

// @desc    Add a new inventory item
// @route   POST /api/inventory
// @access  Private
const addInventoryItem = asyncHandler(async (req, res) => {
  try {
    console.log('Adding inventory item:', req.body);
    
    const { 
      name, 
      category, 
      quantity, 
      unit, 
      unitPrice, 
      supplier, 
      reorderLevel 
    } = req.body;

    // Validate required fields
    if (!name || !category || !quantity || !unit || !unitPrice) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }

    // Create the inventory item
    const newItem = new Inventory({
      hotel: req.user._id,
      name,
      category,
      quantity,
      unit,
      price: unitPrice, // map unitPrice to price
      supplier: { name: supplier },
      minStockLevel: reorderLevel || 5, // Default to 5 if not provided
      purchaseDate: new Date()
    });

    console.log('Saving inventory item:', newItem);
    const savedItem = await newItem.save();
    console.log('Saved inventory item:', savedItem);

    // Format for frontend response
    const formattedItem = {
      id: savedItem._id,
      name: savedItem.name,
      category: savedItem.category,
      quantity: savedItem.quantity,
      unit: savedItem.unit,
      unitPrice: savedItem.price,
      supplier: savedItem.supplier?.name || '',
      reorderLevel: savedItem.minStockLevel,
      status: savedItem.isLowStock ? 'Low Stock' : (savedItem.isOutOfStock ? 'Out of Stock' : 'In Stock'),
      createdAt: savedItem.createdAt
    };

    res.status(201).json({ 
      message: 'Inventory item added successfully',
      item: formattedItem
    });
  } catch (error) {
    console.error('Error in addInventoryItem:', error);
    res.status(500).json({
      message: 'Error adding inventory item',
      error: error.message
    });
  }
});

// @desc    Update an inventory item
// @route   PUT /api/inventory/:id
// @access  Private
const updateInventoryItem = asyncHandler(async (req, res) => {
  try {
    const { 
      name, 
      category, 
      quantity, 
      unit, 
      unitPrice, 
      supplier, 
      reorderLevel 
    } = req.body;

    // Find the item first
    const item = await Inventory.findOne({ 
      _id: req.params.id,
      hotel: req.user._id 
    });

    if (!item) {
      res.status(404);
      throw new Error('Inventory item not found');
    }

    // Update fields
    item.name = name || item.name;
    item.category = category || item.category;
    item.quantity = quantity !== undefined ? quantity : item.quantity;
    item.unit = unit || item.unit;
    item.price = unitPrice !== undefined ? unitPrice : item.price;
    
    if (supplier) {
      item.supplier = { name: supplier };
    }
    
    if (reorderLevel !== undefined) {
      item.minStockLevel = reorderLevel;
    }

    const updatedItem = await item.save();

    // Format for frontend response
    const formattedItem = {
      id: updatedItem._id,
      name: updatedItem.name,
      category: updatedItem.category,
      quantity: updatedItem.quantity,
      unit: updatedItem.unit,
      unitPrice: updatedItem.price,
      supplier: updatedItem.supplier?.name || '',
      reorderLevel: updatedItem.minStockLevel,
      status: updatedItem.isLowStock ? 'Low Stock' : (updatedItem.isOutOfStock ? 'Out of Stock' : 'In Stock'),
      createdAt: updatedItem.createdAt
    };

    res.json({ 
      message: 'Inventory item updated successfully',
      item: formattedItem
    });
  } catch (error) {
    console.error('Error in updateInventoryItem:', error);
    res.status(500).json({
      message: 'Error updating inventory item',
      error: error.message
    });
  }
});

// @desc    Delete an inventory item
// @route   DELETE /api/inventory/:id
// @access  Private
const deleteInventoryItem = asyncHandler(async (req, res) => {
  try {
    const item = await Inventory.findOne({ 
      _id: req.params.id,
      hotel: req.user._id 
    });

    if (!item) {
      res.status(404);
      throw new Error('Inventory item not found');
    }

    await item.deleteOne();

    res.json({ 
      message: 'Inventory item deleted successfully',
      id: req.params.id
    });
  } catch (error) {
    console.error('Error in deleteInventoryItem:', error);
    res.status(500).json({
      message: 'Error deleting inventory item',
      error: error.message
    });
  }
});

export {
  getInventoryItems,
  getInventoryItem,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
}; 