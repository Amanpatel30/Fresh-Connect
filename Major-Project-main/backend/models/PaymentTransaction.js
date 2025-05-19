import mongoose from 'mongoose';

const paymentTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller'
    // Not required as not all transactions involve a seller
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
    enum: ['purchase', 'sale', 'refund', 'payout', 'fee'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
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
    enum: ['card', 'cod', 'upi', 'netbanking', 'wallet', 'credit_card', 'paypal', 'bank_transfer'],
    required: true
  },
  paymentDetails: {
    card: {
      last4: String,
      brand: String,
      expMonth: Number,
      expYear: Number
    },
    upi: {
      id: String
    },
    wallet: {
      provider: String
    },
    bank: {
      name: String,
      accountLast4: String
    }
  },
  description: {
    type: String
  },
  currency: {
    type: String,
    default: 'INR'
  },
  metadata: {
    type: Object
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
paymentTransactionSchema.index({ user: 1, date: -1 });
paymentTransactionSchema.index({ sellerId: 1, date: -1 });
paymentTransactionSchema.index({ transactionId: 1 }, { unique: true });
paymentTransactionSchema.index({ type: 1, status: 1 });
paymentTransactionSchema.index({ 'order.orderId': 1 });

const PaymentTransaction = mongoose.model('PaymentTransaction', paymentTransactionSchema);

export default PaymentTransaction; 