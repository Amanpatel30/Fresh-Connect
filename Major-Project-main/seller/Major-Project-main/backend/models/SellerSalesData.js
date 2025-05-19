import mongoose from 'mongoose';

const sellerSalesDataSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  monthlySales: [{
    month: String,
    total: Number
  }],
  categoryPerformance: [{
    name: String,
    sales: Number,
    percentage: Number
  }],
  dailySales: [{
    date: String,
    sales: Number
  }],
  productPerformance: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    sales: Number,
    revenue: Number,
    growth: Number,
    profit: Number
  }],
  salesByRegion: [{
    region: String,
    sales: Number
  }]
}, {
  timestamps: true
});

// Create index for faster queries
sellerSalesDataSchema.index({ sellerId: 1 });

const SellerSalesData = mongoose.model('SellerSalesData', sellerSalesDataSchema);

export default SellerSalesData; 