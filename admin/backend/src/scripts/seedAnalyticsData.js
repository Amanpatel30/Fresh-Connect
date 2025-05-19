const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Load models
const SalesData = require('../models/SalesData');
const OrdersData = require('../models/OrdersData');
const EngagementData = require('../models/EngagementData');
const BuyerType = require('../models/BuyerType');
const ProductCategory = require('../models/ProductCategory');
const TransactionType = require('../models/TransactionType');
const TopLocation = require('../models/TopLocation');
const DailySale = require('../models/DailySale');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Sample data
const salesData = {
  today: 28450,
  yesterday: 26200,
  weekly: 182350,
  monthly: 745620,
  yearToDate: 3214850,
  percentChange: 8.6
};

const ordersData = {
  today: 156,
  yesterday: 142,
  weekly: 984,
  monthly: 4152,
  yearToDate: 23648,
  percentChange: 9.9
};

const engagementData = {
  avgOrderValue: 182.5,
  ordersPerBuyer: 3.7,
  cancellationRate: 4.8,
  topProducts: [
    { product: 'Organic Tomatoes', sales: 32450, percentChange: 15.3 },
    { product: 'Fresh Lettuce', sales: 28760, percentChange: 8.7 },
    { product: 'Bell Peppers', sales: 21540, percentChange: -2.1 },
    { product: 'Carrots', sales: 19870, percentChange: 12.4 },
    { product: 'Cucumbers', sales: 15230, percentChange: 6.2 }
  ]
};

const buyerTypes = [
  { source: 'Hotels & Restaurants', percentage: 55, sales: 415620, color: 'primary.main' },
  { source: 'End Consumers', percentage: 23, sales: 173490, color: 'secondary.main' },
  { source: 'Food Processors', percentage: 12, sales: 90450, color: 'success.main' },
  { source: 'Retailers', percentage: 8, sales: 60320, color: 'info.main' },
  { source: 'Charity & Others', percentage: 2, sales: 15080, color: 'warning.main' }
];

const productCategories = [
  { name: 'Leafy Greens', percentage: 34 },
  { name: 'Root Vegetables', percentage: 28 },
  { name: 'Fruits & Berries', percentage: 22 },
  { name: 'Herbs & Spices', percentage: 16 }
];

const transactionTypes = [
  { name: 'Regular Purchase', percentage: 68 },
  { name: 'Urgent Sale', percentage: 22 },
  { name: 'Food Waste Reduction', percentage: 7 },
  { name: 'Bulk Purchase', percentage: 3 }
];

const topLocations = [
  { region: 'North Region', sales: 285400, percentage: 38 },
  { region: 'South Region', sales: 225600, percentage: 30 },
  { region: 'East Region', sales: 150320, percentage: 20 },
  { region: 'West Region', sales: 75210, percentage: 10 },
  { region: 'Other Areas', sales: 15080, percentage: 2 }
];

const dailySales = [
  { date: '2023-05-14', sales: 25400 },
  { date: '2023-05-15', sales: 27800 },
  { date: '2023-05-16', sales: 32100 },
  { date: '2023-05-17', sales: 24500 },
  { date: '2023-05-18', sales: 29700 },
  { date: '2023-05-19', sales: 26200 },
  { date: '2023-05-20', sales: 28450 }
];

// Seed function
const seedData = async () => {
  try {
    // Clear existing data
    await SalesData.deleteMany();
    await OrdersData.deleteMany();
    await EngagementData.deleteMany();
    await BuyerType.deleteMany();
    await ProductCategory.deleteMany();
    await TransactionType.deleteMany();
    await TopLocation.deleteMany();
    await DailySale.deleteMany();

    // Insert data
    await SalesData.create(salesData);
    await OrdersData.create(ordersData);
    await EngagementData.create(engagementData);
    await BuyerType.insertMany(buyerTypes);
    await ProductCategory.insertMany(productCategories);
    await TransactionType.insertMany(transactionTypes);
    await TopLocation.insertMany(topLocations);
    await DailySale.insertMany(dailySales);

    console.log('Analytics data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding analytics data:', error);
    process.exit(1);
  }
};

// Run seeder
seedData(); 