import mongoose from 'mongoose';

const paymentTransactionSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  fee: {
    type: Number,
    default: 0
  },
  netAmount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['sale', 'refund', 'payout', 'fee'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  date: {
    type: Date,
    default: Date.now
  },
  order: {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    orderNumber: String,
    totalAmount: Number
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'bank_transfer'],
    required: true
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
paymentTransactionSchema.index({ sellerId: 1, date: -1 });
paymentTransactionSchema.index({ transactionId: 1 }, { unique: true });
paymentTransactionSchema.index({ type: 1, status: 1 });
paymentTransactionSchema.index({ 'order.orderId': 1 });

const PaymentTransaction = mongoose.model('PaymentTransaction', paymentTransactionSchema);

export default PaymentTransaction; 