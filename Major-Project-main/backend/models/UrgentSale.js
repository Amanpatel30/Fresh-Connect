import mongoose from 'mongoose';

const urgentSaleSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Vegetables', 'Fruits', 'Dairy', 'Prepared Food', 'Bakery', 'Meat', 'Seafood', 'Other']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'piece', 'dozen', 'bundle', 'box', 'bunch', 'liter']
  },
  expiryDate: {
    type: Date,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'inactive', 'sold']
  },
  views: {
    type: Number,
    default: 0
  },
  sales: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const UrgentSale = mongoose.model('UrgentSale', urgentSaleSchema);
export default UrgentSale; 