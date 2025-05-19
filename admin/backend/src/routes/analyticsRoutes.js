const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import models with dynamic loading based on availability
let SalesData, OrdersData, EngagementData, BuyerType, ProductCategory, 
    TransactionType, TopLocation, DailySale;

// Helper function to safely load a model
const safelyLoadModel = async (modelName, collectionName) => {
  try {
    // Check if collection exists
    const collections = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();
    if (collections.length > 0) {
      // Collection exists, try to get model
      try {
        return mongoose.model(modelName);
      } catch (err) {
        if (err.name === 'MissingSchemaError') {
          console.log(`Model ${modelName} not registered yet, skipping`);
        } else {
          console.error(`Error accessing model ${modelName}:`, err);
        }
        return null;
      }
    }
    return null;
  } catch (err) {
    console.error(`Error checking collection ${collectionName}:`, err);
    return null;
  }
};

// Initialize models based on available collections
const initModels = async () => {
  try {
    // Wait for mongoose connection to be ready
    if (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => {
        mongoose.connection.once('connected', resolve);
      });
    }

    SalesData = await safelyLoadModel('SalesData', 'salesdatas');
    OrdersData = await safelyLoadModel('OrdersData', 'ordersdatas');
    EngagementData = await safelyLoadModel('EngagementData', 'engagementdatas');
    BuyerType = await safelyLoadModel('BuyerType', 'buyertypes');
    ProductCategory = await safelyLoadModel('ProductCategory', 'productcategories');
    TransactionType = await safelyLoadModel('TransactionType', 'transactiontypes');
    TopLocation = await safelyLoadModel('TopLocation', 'toplocations');
    DailySale = await safelyLoadModel('DailySale', 'dailysales');
    
    console.log('Analytics models initialization completed');
  } catch (err) {
    console.error('Error initializing analytics models:', err);
  }
};

// Initialize models when the module is loaded
initModels().catch(console.error);

// API test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Analytics API is working' });
});

// @desc    Get sales data
// @route   GET /api/analytics/salesData
// @access  Public
router.get('/salesData', async (req, res) => {
  console.log('GET /api/analytics/salesData called');
  try {
    if (!SalesData) {
      SalesData = await safelyLoadModel('SalesData', 'salesdatas');
      if (!SalesData) {
        console.log('SalesData model not available');
        return res.status(404).json({ message: 'Sales data not found' });
      }
    }
    
    const salesData = await SalesData.findOne().sort({ createdAt: -1 });
    
    if (!salesData) {
      console.log('Sales data not found');
      return res.status(404).json({ message: 'Sales data not found' });
    }
    
    console.log('Returning sales data:', salesData);
    res.json(salesData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get orders data
// @route   GET /api/analytics/ordersData
// @access  Public
router.get('/ordersData', async (req, res) => {
  console.log('GET /api/analytics/ordersData called');
  try {
    if (!OrdersData) {
      OrdersData = await safelyLoadModel('OrdersData', 'ordersdatas');
      if (!OrdersData) {
        return res.status(404).json({ message: 'Orders data not found' });
      }
    }
    
    const ordersData = await OrdersData.findOne().sort({ createdAt: -1 });
    
    if (!ordersData) {
      return res.status(404).json({ message: 'Orders data not found' });
    }
    
    res.json(ordersData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get engagement data
// @route   GET /api/analytics/engagementData
// @access  Public
router.get('/engagementData', async (req, res) => {
  try {
    const engagementData = await EngagementData.findOne().sort({ createdAt: -1 });
    
    if (!engagementData) {
      return res.status(404).json({ message: 'Engagement data not found' });
    }
    
    res.json(engagementData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get buyer types
// @route   GET /api/analytics/buyerTypes
// @access  Public
router.get('/buyerTypes', async (req, res) => {
  console.log('GET /api/analytics/buyerTypes called');
  try {
    const buyerTypes = await BuyerType.find().sort({ percentage: -1 });
    
    if (!buyerTypes || buyerTypes.length === 0) {
      console.log('Buyer types not found');
      return res.status(404).json({ message: 'Buyer types not found' });
    }
    
    console.log(`Returning ${buyerTypes.length} buyer types`);
    res.json(buyerTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get product categories
// @route   GET /api/analytics/productCategories
// @access  Public
router.get('/productCategories', async (req, res) => {
  try {
    const productCategories = await ProductCategory.find().sort({ percentage: -1 });
    
    if (!productCategories || productCategories.length === 0) {
      return res.status(404).json({ message: 'Product categories not found' });
    }
    
    res.json(productCategories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get transaction types
// @route   GET /api/analytics/transactionTypes
// @access  Public
router.get('/transactionTypes', async (req, res) => {
  try {
    const transactionTypes = await TransactionType.find().sort({ percentage: -1 });
    
    if (!transactionTypes || transactionTypes.length === 0) {
      return res.status(404).json({ message: 'Transaction types not found' });
    }
    
    res.json(transactionTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get top locations
// @route   GET /api/analytics/topLocations
// @access  Public
router.get('/topLocations', async (req, res) => {
  try {
    const topLocations = await TopLocation.find().sort({ sales: -1 });
    
    if (!topLocations || topLocations.length === 0) {
      return res.status(404).json({ message: 'Top locations not found' });
    }
    
    res.json(topLocations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get daily sales
// @route   GET /api/analytics/dailySales
// @access  Public
router.get('/dailySales', async (req, res) => {
  try {
    // Get the last 7 days of sales data
    const dailySales = await DailySale.find().sort({ date: -1 }).limit(7);
    
    if (!dailySales || dailySales.length === 0) {
      return res.status(404).json({ message: 'Daily sales not found' });
    }
    
    res.json(dailySales.reverse()); // Reverse to get chronological order
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router; 