import mongoose from 'mongoose';

const UrgentSaleSchema = new mongoose.Schema({
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
    required: true
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
    required: true
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
  tags: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'sold'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0
  },
  sales: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Calculate discountedPrice before saving
UrgentSaleSchema.pre('save', function(next) {
  if (this.isModified('price') || this.isModified('discount')) {
    this.discountedPrice = this.price - (this.price * this.discount / 100);
  }
  next();
});

// Check if the model already exists before defining it
const UrgentSale = mongoose.models.UrgentSale || mongoose.model('UrgentSale', UrgentSaleSchema, 'urgentsales');

export default UrgentSale; 