import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['bank', 'upi', 'wallet']
  },
  name: {
    type: String,
    required: true
  },
  // For bank accounts
  accountNumber: {
    type: String,
    required: function() { return this.type === 'bank'; }
  },
  ifsc: {
    type: String,
    required: function() { return this.type === 'bank'; }
  },
  // For UPI
  upiId: {
    type: String,
    required: function() { return this.type === 'upi'; }
  },
  // For wallets
  walletId: {
    type: String,
    required: function() { return this.type === 'wallet'; }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one default payment method per seller
paymentMethodSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { seller: this.seller, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
export default PaymentMethod; 