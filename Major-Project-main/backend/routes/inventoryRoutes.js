import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getInventoryItems, 
  getInventoryItem, 
  addInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem 
} from '../controllers/inventoryController.js';
import mongoose from 'mongoose';

const router = express.Router();

// Middleware to check database connection and provide mock data if needed
const handleDatabaseConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.log('MongoDB not connected, returning mock inventory data');
    
    // Return mock inventory data
    const mockItems = [
      {
        id: 'mock-inv-1',
        name: 'Rice (Mock)',
        quantity: 50,
        unit: 'kg',
        category: 'grains',
        unitPrice: 2.5,
        supplier: 'Mock Supplier',
        reorderLevel: 10,
        status: 'In Stock',
        createdAt: new Date().toISOString()
      },
      {
        id: 'mock-inv-2',
        name: 'Tomatoes (Mock)',
        quantity: 10,
        unit: 'kg',
        category: 'vegetables',
        unitPrice: 3.2,
        supplier: 'Mock Supplier',
        reorderLevel: 15,
        status: 'Low Stock',
        createdAt: new Date().toISOString()
      },
      {
        id: 'mock-inv-3',
        name: 'Chicken (Mock)',
        quantity: 0,
        unit: 'kg',
        category: 'meat',
        unitPrice: 8.5,
        supplier: 'Mock Supplier',
        reorderLevel: 5,
        status: 'Out of Stock',
        createdAt: new Date().toISOString()
      }
    ];
    
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    // Filter items based on search
    let filteredItems = [...mockItems];
    if (search) {
      const searchLower = search.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        item.supplier.toLowerCase().includes(searchLower)
      );
    }
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);
    
    // Return mock response
    return res.status(200).json({
      items: paginatedItems,
      total: filteredItems.length,
      page,
      pages: Math.ceil(filteredItems.length / limit),
      message: 'Using mock data - MongoDB connection failed'
    });
  }
  
  // If database is connected, proceed to the actual controller
  next();
};

// Apply protect middleware to all routes
router.use(protect);

// Get all inventory items with pagination
router.get('/', handleDatabaseConnection, getInventoryItems);

// Get a single inventory item
router.get('/:id', getInventoryItem);

// Create a new inventory item
router.post('/', addInventoryItem);

// Update an inventory item
router.put('/:id', updateInventoryItem);

// Delete an inventory item
router.delete('/:id', deleteInventoryItem);

export default router; 