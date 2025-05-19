const mongoose = require('mongoose');

const buyerTypeSchema = mongoose.Schema({
  source: {
    type: String,
    required: true
  },
  percentage: {
    type: Number,
    required: true,
    default: 0
  },
  sales: {
    type: Number,
    required: true,
    default: 0
  },
  color: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const BuyerType = mongoose.model('BuyerType', buyerTypeSchema);

module.exports = BuyerType; 