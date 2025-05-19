const mongoose = require('mongoose');

const topLocationSchema = mongoose.Schema({
  region: {
    type: String,
    required: true
  },
  sales: {
    type: Number,
    required: true,
    default: 0
  },
  percentage: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

const TopLocation = mongoose.model('TopLocation', topLocationSchema);

module.exports = TopLocation; 