import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from '../models/Review.js';
import SellerAnalytics from '../models/SellerAnalytics.js';
import SellerSalesData from '../models/SellerSalesData.js';
import PaymentTransaction from '../models/PaymentTransaction.js';
import PaymentSummary from '../models/PaymentSummary.js';

// Load environment variables
dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/major-project', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected for seeding test data'))
.catch(err => console.error('MongoDB connection error:', err));

// Generate random date in the past (between 1 and maxDays days ago)
const randomPastDate = (maxDays = 30) => {
  const date = new Date();
  const randomDays = Math.floor(Math.random() * maxDays) + 1;
  date.setDate(date.getDate() - randomDays);
  return date;
};

// Generate random reviews
const generateReviews = async (sellerId, count = 20) => {
  console.log(`Generating ${count} reviews for seller ${sellerId}`);
  
  const reviews = [];
  const ratings = [4, 5, 3, 5, 4, 5, 2, 4, 5, 3];
  const products = [
    { _id: '65f1dd6a7cd6a8e5c10c2a10', name: 'Organic Apples', image: '/uploads/products/apple.jpg' },
    { _id: '65f1dd6a7cd6a8e5c10c2a11', name: 'Fresh Oranges', image: '/uploads/products/orange.jpg' },
    { _id: '65f1dd6a7cd6a8e5c10c2a12', name: 'Ripe Bananas', image: '/uploads/products/banana.jpg' },
    { _id: '65f1dd6a7cd6a8e5c10c2a13', name: 'Local Strawberries', image: '/uploads/products/strawberry.jpg' },
    { _id: '65f1dd6a7cd6a8e5c10c2a14', name: 'Farm Fresh Milk', image: '/uploads/products/milk.jpg' }
  ];
  
  const comments = [
    'Great product, will buy again!',
    'Fast delivery and good quality.',
    'Packaging could be better, but the product is good.',
    'Excellent quality, highly recommended.',
    'Not as fresh as I expected, but still good.',
    'Amazing taste and freshness!',
    'Good value for money.',
    'Very satisfied with this purchase.',
    'Slightly overpriced, but the quality makes up for it.',
    'Will definitely order again!'
  ];
  
  const customers = [
    { _id: '65f1dd6a7cd6a8e5c10c2a20', name: 'John Doe', image: '/uploads/avatars/user1.jpg' },
    { _id: '65f1dd6a7cd6a8e5c10c2a21', name: 'Jane Smith', image: '/uploads/avatars/user2.jpg' },
    { _id: '65f1dd6a7cd6a8e5c10c2a22', name: 'Robert Johnson', image: '/uploads/avatars/user3.jpg' },
    { _id: '65f1dd6a7cd6a8e5c10c2a23', name: 'Emily Davis', image: '/uploads/avatars/user4.jpg' },
    { _id: '65f1dd6a7cd6a8e5c10c2a24', name: 'Michael Wilson', image: '/uploads/avatars/user5.jpg' }
  ];
  
  for (let i = 0; i < count; i++) {
    const rating = ratings[Math.floor(Math.random() * ratings.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const comment = comments[Math.floor(Math.random() * comments.length)];
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const date = randomPastDate(30);
    
    // Make some reviews responded to
    const responded = Math.random() > 0.6;
    let response = null;
    
    if (responded) {
      response = {
        text: 'Thank you for your feedback! We appreciate your support.',
        date: new Date(date.getTime() + 86400000) // One day after review
      };
    }
    
    reviews.push({
      sellerId,
      customer,
      product,
      rating,
      comment,
      date,
      responded,
      response,
      helpful: Math.floor(Math.random() * 10)
    });
  }
  
  try {
    // Clear existing reviews for this seller
    await Review.deleteMany({ sellerId });
    
    // Insert new reviews
    await Review.insertMany(reviews);
    console.log(`${reviews.length} reviews created successfully for seller ${sellerId}`);
  } catch (error) {
    console.error('Error creating reviews:', error);
  }
};

// Generate analytics data
const generateAnalytics = async (sellerId) => {
  console.log(`Generating analytics data for seller ${sellerId}`);
  
  try {
    // Clear existing analytics for this seller
    await SellerAnalytics.deleteMany({ sellerId });
    
    const analytics = {
      sellerId,
      date: new Date(),
      orderStats: {
        total: 150,
        pending: 5,
        processing: 10,
        shipped: 15,
        delivered: 120,
        cancelled: 5
      },
      productStats: {
        total: 45,
        active: 40,
        outOfStock: 3,
        lowStock: 7
      },
      revenueStats: {
        total: 15003,
        thisMonth: 3500,
        lastMonth: 3200,
        growth: 9.4
      },
      inventoryData: [
        { name: 'Fruits', value: 35 },
        { name: 'Vegetables', value: 25 },
        { name: 'Dairy', value: 20 },
        { name: 'Bakery', value: 15 },
        { name: 'Other', value: 5 }
      ],
      topSellingItems: [
        { productId: '65f1dd6a7cd6a8e5c10c2a10', name: 'Organic Apples', sales: 250, percentage: 20, image: '/uploads/products/apple.jpg' },
        { productId: '65f1dd6a7cd6a8e5c10c2a11', name: 'Fresh Oranges', sales: 180, percentage: 15, image: '/uploads/products/orange.jpg' },
        { productId: '65f1dd6a7cd6a8e5c10c2a12', name: 'Ripe Bananas', sales: 150, percentage: 12, image: '/uploads/products/banana.jpg' },
        { productId: '65f1dd6a7cd6a8e5c10c2a13', name: 'Local Strawberries', sales: 120, percentage: 10, image: '/uploads/products/strawberry.jpg' },
        { productId: '65f1dd6a7cd6a8e5c10c2a14', name: 'Farm Fresh Milk', sales: 100, percentage: 8, image: '/uploads/products/milk.jpg' }
      ],
      weeklySales: [
        { day: 'Monday', amount: 550 },
        { day: 'Tuesday', amount: 480 },
        { day: 'Wednesday', amount: 620 },
        { day: 'Thursday', amount: 540 },
        { day: 'Friday', amount: 780 },
        { day: 'Saturday', amount: 850 },
        { day: 'Sunday', amount: 680 }
      ],
      notifications: [
        { id: '1', type: 'order', message: 'New order received', time: '10 minutes ago', timestamp: new Date() },
        { id: '2', type: 'payment', message: 'Payment received for order #12345', time: '2 hours ago', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { id: '3', type: 'inventory', message: 'Apples are running low in stock', time: '1 day ago', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      ]
    };
    
    await SellerAnalytics.create(analytics);
    console.log(`Analytics data created for seller ${sellerId}`);
  } catch (error) {
    console.error('Error creating analytics data:', error);
  }
};

// Generate sales data
const generateSalesData = async (sellerId) => {
  console.log(`Generating sales data for seller ${sellerId}`);
  
  try {
    // Clear existing sales data for this seller
    await SellerSalesData.deleteMany({ sellerId });
    
    const salesData = {
      sellerId,
      date: new Date(),
      monthlySales: [
        { month: 'January', total: 2500 },
        { month: 'February', total: 2800 },
        { month: 'March', total: 3200 },
        { month: 'April', total: 3000 },
        { month: 'May', total: 3500 },
        { month: 'June', total: 3800 },
        { month: 'July', total: 4000 },
        { month: 'August', total: 4200 },
        { month: 'September', total: 3900 },
        { month: 'October', total: 4100 },
        { month: 'November', total: 4300 },
        { month: 'December', total: 4500 }
      ],
      categoryPerformance: [
        { name: 'Fruits', sales: 6000, percentage: 40 },
        { name: 'Vegetables', sales: 4500, percentage: 30 },
        { name: 'Dairy', sales: 3000, percentage: 20 },
        { name: 'Bakery', sales: 1500, percentage: 10 }
      ],
      dailySales: (() => {
        const days = [];
        const now = new Date();
        for (let i = 30; i >= 0; i--) {
          const date = new Date();
          date.setDate(now.getDate() - i);
          days.push({
            date: date.toISOString().split('T')[0],
            sales: Math.floor(Math.random() * 500) + 300
          });
        }
        return days;
      })(),
      productPerformance: [
        { productId: '65f1dd6a7cd6a8e5c10c2a10', name: 'Organic Apples', sales: 250, revenue: 1250, growth: 15, profit: 625 },
        { productId: '65f1dd6a7cd6a8e5c10c2a11', name: 'Fresh Oranges', sales: 180, revenue: 900, growth: 10, profit: 450 },
        { productId: '65f1dd6a7cd6a8e5c10c2a12', name: 'Ripe Bananas', sales: 150, revenue: 450, growth: 5, profit: 225 },
        { productId: '65f1dd6a7cd6a8e5c10c2a13', name: 'Local Strawberries', sales: 120, revenue: 960, growth: 20, profit: 480 },
        { productId: '65f1dd6a7cd6a8e5c10c2a14', name: 'Farm Fresh Milk', sales: 100, revenue: 500, growth: 8, profit: 250 }
      ],
      salesByRegion: [
        { region: 'North', sales: 5001 },
        { region: 'South', sales: 4000 },
        { region: 'East', sales: 3500 },
        { region: 'West', sales: 4500 }
      ]
    };
    
    await SellerSalesData.create(salesData);
    console.log(`Sales data created for seller ${sellerId}`);
  } catch (error) {
    console.error('Error creating sales data:', error);
  }
};

// Generate payment transactions
const generatePaymentTransactions = async (sellerId, count = 30) => {
  console.log(`Generating ${count} payment transactions for seller ${sellerId}`);
  
  const transactions = [];
  const types = ['sale', 'refund', 'payout', 'fee'];
  const typeDistribution = [0.8, 0.1, 0.05, 0.05]; // 80% sales, 10% refunds, 5% payouts, 5% fees
  const statuses = ['completed', 'pending', 'failed'];
  const statusDistribution = [0.85, 0.1, 0.05]; // 85% completed, 10% pending, 5% failed
  
  const orders = [
    { orderId: '65f1dd6a7cd6a8e5c10c2b10', orderNumber: 'ORD-001', totalAmount: 150 },
    { orderId: '65f1dd6a7cd6a8e5c10c2b11', orderNumber: 'ORD-002', totalAmount: 75 },
    { orderId: '65f1dd6a7cd6a8e5c10c2b12', orderNumber: 'ORD-003', totalAmount: 200 },
    { orderId: '65f1dd6a7cd6a8e5c10c2b13', orderNumber: 'ORD-004', totalAmount: 120 },
    { orderId: '65f1dd6a7cd6a8e5c10c2b14', orderNumber: 'ORD-005', totalAmount: 90 }
  ];
  
  const paymentMethods = ['credit_card', 'paypal', 'bank_transfer'];
  
  for (let i = 0; i < count; i++) {
    // Select type based on distribution
    let typeIndex = 0;
    const typeRandom = Math.random();
    let typeCumulative = 0;
    
    for (let j = 0; j < typeDistribution.length; j++) {
      typeCumulative += typeDistribution[j];
      if (typeRandom <= typeCumulative) {
        typeIndex = j;
        break;
      }
    }
    
    const type = types[typeIndex];
    
    // Select status based on distribution
    let statusIndex = 0;
    const statusRandom = Math.random();
    let statusCumulative = 0;
    
    for (let j = 0; j < statusDistribution.length; j++) {
      statusCumulative += statusDistribution[j];
      if (statusRandom <= statusCumulative) {
        statusIndex = j;
        break;
      }
    }
    
    const status = statuses[statusIndex];
    
    // Generate amount between $10 and $300
    const amount = parseFloat((Math.random() * 290 + 10).toFixed(2));
    
    // Calculate fee (5% of amount)
    const fee = parseFloat((amount * 0.05).toFixed(2));
    
    // Calculate net amount
    const netAmount = type === 'sale' ? amount - fee : type === 'refund' ? -amount : type === 'payout' ? -amount : -fee;
    
    // Select random order (for sale and refund types)
    const order = type === 'sale' || type === 'refund' ? orders[Math.floor(Math.random() * orders.length)] : null;
    
    // Select random payment method
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    
    // Generate random date (last 90 days)
    const date = randomPastDate(90);
    
    // Create transaction ID
    const prefix = type === 'sale' ? 'SALE' : type === 'refund' ? 'REF' : type === 'payout' ? 'PAY' : 'FEE';
    const transactionId = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    transactions.push({
      sellerId,
      transactionId,
      amount,
      fee: type === 'sale' ? fee : 0,
      netAmount,
      type,
      status,
      date,
      order,
      paymentMethod,
      description: type === 'sale' ? `Payment for order ${order?.orderNumber}` :
                  type === 'refund' ? `Refund for order ${order?.orderNumber}` :
                  type === 'payout' ? 'Payout to bank account' :
                  'Platform fee'
    });
  }
  
  try {
    // Clear existing transactions for this seller
    await PaymentTransaction.deleteMany({ sellerId });
    
    // Insert new transactions
    await PaymentTransaction.insertMany(transactions);
    console.log(`${transactions.length} payment transactions created for seller ${sellerId}`);
  } catch (error) {
    console.error('Error creating payment transactions:', error);
  }
};

// Generate payment summary
const generatePaymentSummary = async (sellerId) => {
  console.log(`Generating payment summary for seller ${sellerId}`);
  
  try {
    // Clear existing payment summary for this seller
    await PaymentSummary.deleteMany({ sellerId });
    
    // Calculate total earnings from transactions
    const transactions = await PaymentTransaction.find({ sellerId, type: 'sale', status: 'completed' });
    const totalEarnings = transactions.reduce((sum, tx) => sum + tx.netAmount, 0);
    
    // Calculate pending payments
    const pendingTransactions = await PaymentTransaction.find({ sellerId, type: 'sale', status: 'pending' });
    const pendingPayments = pendingTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    // Calculate available balance (70% of total earnings to simulate some payouts already made)
    const availableBalance = totalEarnings * 0.7;
    
    const lastPayout = await PaymentTransaction.findOne({ 
      sellerId, 
      type: 'payout', 
      status: 'completed' 
    }).sort({ date: -1 });
    
    const paymentSummary = {
      sellerId,
      date: new Date(),
      totalEarnings,
      pendingPayments,
      availableBalance,
      lastPayoutDate: lastPayout ? lastPayout.date : null,
      lastPayoutAmount: lastPayout ? lastPayout.amount : 0,
      monthlySummary: {
        sales: totalEarnings,
        refunds: totalEarnings * 0.05,
        fees: totalEarnings * 0.05,
        net: totalEarnings * 0.9
      },
      yearToDateSummary: {
        sales: totalEarnings * 12,
        refunds: totalEarnings * 0.05 * 12,
        fees: totalEarnings * 0.05 * 12,
        net: totalEarnings * 0.9 * 12
      },
      payoutSchedule: {
        frequency: 'monthly',
        nextPayoutDate: (() => {
          const date = new Date();
          date.setDate(1); // Set to first of month
          date.setMonth(date.getMonth() + 1); // Next month
          return date;
        })(),
        minimumAmount: 100
      }
    };
    
    await PaymentSummary.create(paymentSummary);
    console.log(`Payment summary created for seller ${sellerId}`);
  } catch (error) {
    console.error('Error creating payment summary:', error);
  }
};

// Main function to seed all data
const seedAllData = async () => {
  try {
    // Sample seller ID - update this with your actual seller ID
    const sellerId = process.argv[2] || '65f1dd6a7cd6a8e5c10c2a01';
    
    console.log(`Starting to seed test data for seller: ${sellerId}`);
    
    // Generate reviews
    await generateReviews(sellerId, 20);
    
    // Generate analytics data
    await generateAnalytics(sellerId);
    
    // Generate sales data
    await generateSalesData(sellerId);
    
    // Generate payment transactions
    await generatePaymentTransactions(sellerId, 30);
    
    // Generate payment summary
    await generatePaymentSummary(sellerId);
    
    console.log('All test data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding test data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedAllData(); 