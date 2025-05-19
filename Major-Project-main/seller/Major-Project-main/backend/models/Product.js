import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product must have a name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'A product must have a description'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'A product must have a price'],
    min: [0, 'Price must be greater than or equal to 0']
  },
  stock: {
    type: Number,
    required: [true, 'A product must have stock information'],
    min: [0, 'Stock must be greater than or equal to 0']
  },
  unit: {
    type: String,
    required: [true, 'A product must have a unit (e.g., kg, g, pcs)'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'A product must belong to a category'],
    trim: true
  },
  image: {
    type: String,
    required: [true, 'A product must have an image']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Only require the seller in production, not in development
    required: function() {
      return process.env.NODE_ENV === 'production';
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  salesCount: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexing for better query performance
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ salesCount: -1 });

// Pre-save hook to ensure updatedAt is set correctly
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for checking if product is low on stock
productSchema.virtual('isLowStock').get(function() {
  return this.stock < 5; // Consider low stock if less than 5 units
});

// Virtual for calculating the discounted price
productSchema.virtual('discountedPrice').get(function() {
  if (!this.discount) return this.price;
  return this.price - (this.price * (this.discount / 100));
});

const Product = mongoose.model('Product', productSchema);

export default Product; 