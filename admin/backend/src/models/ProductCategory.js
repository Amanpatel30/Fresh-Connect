const mongoose = require('mongoose');

const productCategorySchema = mongoose.Schema({
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

const ProductCategory = mongoose.model('ProductCategory', productCategorySchema);

module.exports = ProductCategory; 