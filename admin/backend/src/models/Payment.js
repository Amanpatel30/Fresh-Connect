const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['UPI', 'Credit Card', 'Debit Card', 'Cash on Delivery', 'Net Banking']
  },
  status: {
    type: String,
    required: true,
    enum: ['completed', 'pending', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  gatewayResponse: {
    success: Boolean,
    code: String,
    message: String
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema); 