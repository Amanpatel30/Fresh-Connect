const mongoose = require('mongoose');

const topProductSchema = mongoose.Schema({
  product: {
    type: String,
    required: true
  },
  sales: {
    type: Number,
    required: true,
    default: 0
  },
  percentChange: {
    type: Number,
    required: true,
    default: 0
  }
});

const engagementDataSchema = mongoose.Schema({
  avgOrderValue: {
    type: Number,
    required: true,
    default: 0
  },
  ordersPerBuyer: {
    type: Number,
    required: true,
    default: 0
  },
  cancellationRate: {
    type: Number,
    required: true,
    default: 0
  },
  topProducts: [topProductSchema]
}, {
  timestamps: true
});

const EngagementData = mongoose.model('EngagementData', engagementDataSchema);

module.exports = EngagementData; 