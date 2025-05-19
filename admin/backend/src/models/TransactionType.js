const mongoose = require('mongoose');

const transactionTypeSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  percentage: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

const TransactionType = mongoose.model('TransactionType', transactionTypeSchema);

module.exports = TransactionType; 