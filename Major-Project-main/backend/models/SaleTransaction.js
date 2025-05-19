import mongoose from 'mongoose';

const saleTransactionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UrgentSale',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  // The actual price at which the product was sold
  salePrice: {
    type: Number,
    required: true
  },
  // The original price when the product was sold (for historical record)
  originalPrice: {
    type: Number,
    required: true
  },
  // The discount percentage at the time of sale
  discount: {
    type: Number,
    required: true
  },
  // The category of the product at time of sale
  category: {
    type: String,
    required: true
  },
  // Date when the sale occurred
  soldAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  // Status of the transaction
  status: {
    type: String,
    enum: ['pending', 'completed', 'refunded', 'cancelled'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Create indexes for efficient queries
saleTransactionSchema.index({ seller: 1, soldAt: -1 });
saleTransactionSchema.index({ product: 1 });
saleTransactionSchema.index({ status: 1 });
saleTransactionSchema.index({ category: 1 });

const SaleTransaction = mongoose.model('SaleTransaction', saleTransactionSchema);

export default SaleTransaction; 