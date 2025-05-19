const mongoose = require('mongoose');

const dailySaleSchema = mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  sales: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

const DailySale = mongoose.model('DailySale', dailySaleSchema);

module.exports = DailySale; 