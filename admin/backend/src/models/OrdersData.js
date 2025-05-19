const mongoose = require('mongoose');

const ordersDataSchema = mongoose.Schema({
  today: {
    type: Number,
    required: true,
    default: 0
  },
  yesterday: {
    type: Number,
    required: true,
    default: 0
  },
  weekly: {
    type: Number,
    required: true,
    default: 0
  },
  monthly: {
    type: Number,
    required: true,
    default: 0
  },
  yearToDate: {
    type: Number,
    required: true,
    default: 0
  },
  percentChange: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

const OrdersData = mongoose.model('OrdersData', ordersDataSchema);

module.exports = OrdersData; 