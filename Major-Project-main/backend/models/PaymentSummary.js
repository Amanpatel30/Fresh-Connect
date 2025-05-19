import mongoose from 'mongoose';

const paymentSummarySchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  pendingPayments: {
    type: Number,
    default: 0
  },
  availableBalance: {
    type: Number,
    default: 0
  },
  lastPayoutDate: {
    type: Date
  },
  lastPayoutAmount: {
    type: Number,
    default: 0
  },
  monthlySummary: {
    sales: { type: Number, default: 0 },
    refunds: { type: Number, default: 0 },
    fees: { type: Number, default: 0 },
    net: { type: Number, default: 0 }
  },
  yearToDateSummary: {
    sales: { type: Number, default: 0 },
    refunds: { type: Number, default: 0 },
    fees: { type: Number, default: 0 },
    net: { type: Number, default: 0 }
  },
  payoutSchedule: {
    frequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly'],
      default: 'monthly'
    },
    nextPayoutDate: {
      type: Date
    },
    minimumAmount: {
      type: Number,
      default: 100
    }
  }
}, {
  timestamps: true
});

// Create index for faster queries
paymentSummarySchema.index({ sellerId: 1 });

const PaymentSummary = mongoose.model('PaymentSummary', paymentSummarySchema);

export default PaymentSummary; 