import mongoose from 'mongoose';

const sellerAnalyticsSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  orderStats: {
    total: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    processing: { type: Number, default: 0 },
    shipped: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 }
  },
  productStats: {
    total: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    outOfStock: { type: Number, default: 0 },
    lowStock: { type: Number, default: 0 }
  },
  revenueStats: {
    total: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 },
    lastMonth: { type: Number, default: 0 },
    growth: { type: Number, default: 0 }
  },
  inventoryData: [{
    name: String,
    value: Number
  }],
  topSellingItems: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    sales: Number,
    percentage: Number,
    image: String
  }],
  weeklySales: [{
    day: String,
    amount: Number
  }],
  notifications: [{
    id: String,
    type: String,
    message: String,
    time: String,
    timestamp: Date
  }]
}, {
  timestamps: true
});

// Create index for faster queries
sellerAnalyticsSchema.index({ sellerId: 1 });

const SellerAnalytics = mongoose.model('SellerAnalytics', sellerAnalyticsSchema);

export default SellerAnalytics; 