const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SalesData = require('../models/SalesData');
const OrdersData = require('../models/OrdersData');
const EngagementData = require('../models/EngagementData');
const BuyerType = require('../models/BuyerType');
const ProductCategory = require('../models/ProductCategory');
const TransactionType = require('../models/TransactionType');
const TopLocation = require('../models/TopLocation');
const DailySale = require('../models/DailySale');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error(err));

// Function to check collections
const checkCollections = async () => {
  try {
    console.log('=== CHECKING COLLECTIONS ===');
    
    // Check SalesData
    const salesData = await SalesData.find();
    console.log('SalesData count:', salesData.length);
    if (salesData.length > 0) {
      console.log('Sample SalesData:', salesData[0]);
    }
    
    // Check OrdersData
    const ordersData = await OrdersData.find();
    console.log('OrdersData count:', ordersData.length);
    if (ordersData.length > 0) {
      console.log('Sample OrdersData:', ordersData[0]);
    }
    
    // Check EngagementData
    const engagementData = await EngagementData.find();
    console.log('EngagementData count:', engagementData.length);
    if (engagementData.length > 0) {
      console.log('Sample EngagementData:', engagementData[0]);
    }
    
    // Check BuyerType
    const buyerTypes = await BuyerType.find();
    console.log('BuyerType count:', buyerTypes.length);
    if (buyerTypes.length > 0) {
      console.log('Sample BuyerType:', buyerTypes[0]);
    }
    
    // Check ProductCategory
    const productCategories = await ProductCategory.find();
    console.log('ProductCategory count:', productCategories.length);
    if (productCategories.length > 0) {
      console.log('Sample ProductCategory:', productCategories[0]);
    }
    
    // Check TransactionType
    const transactionTypes = await TransactionType.find();
    console.log('TransactionType count:', transactionTypes.length);
    if (transactionTypes.length > 0) {
      console.log('Sample TransactionType:', transactionTypes[0]);
    }
    
    // Check TopLocation
    const topLocations = await TopLocation.find();
    console.log('TopLocation count:', topLocations.length);
    if (topLocations.length > 0) {
      console.log('Sample TopLocation:', topLocations[0]);
    }
    
    // Check DailySale
    const dailySales = await DailySale.find();
    console.log('DailySale count:', dailySales.length);
    if (dailySales.length > 0) {
      console.log('Sample DailySale:', dailySales[0]);
    }
    
    console.log('=== CHECK COMPLETE ===');
    process.exit();
  } catch (error) {
    console.error('Error checking collections:', error);
    process.exit(1);
  }
};

// Run the check
checkCollections(); 