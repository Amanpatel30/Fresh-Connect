import mongoose from 'mongoose';

const urgentSaleSchema = mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    name: {
      type: String,
      required: [true, 'Please add a product name']
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    category: {
      type: String,
      required: [true, 'Please add a category']
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price cannot be negative']
    },
    discountedPrice: {
      type: Number,
      required: [true, 'Please add a discounted price'],
      min: [0, 'Discounted price cannot be negative'],
      validate: {
        validator: function(value) {
          return value <= this.price;
        },
        message: 'Discounted price must be less than or equal to the original price'
      }
    },
    discount: {
      type: Number,
      min: 0,
      max: 100
    },
    quantity: {
      type: Number,
      required: [true, 'Please add a quantity'],
      min: [1, 'Quantity must be at least 1']
    },
    unit: {
      type: String,
      required: [true, 'Please add a unit'],
      enum: ['kg', 'g', 'lb', 'piece', 'bundle', 'box', 'liter', 'ml']
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please add an expiry date']
    },
    image: {
      type: String,
      default: 'https://via.placeholder.com/150'
    },
    images: [String],
    featured: {
      type: Boolean,
      default: false
    },
    tags: [String],
    status: {
      type: String,
      enum: ['active', 'inactive', 'completed', 'cancelled'],
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for checking if the product is expired
urgentSaleSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiryDate;
});

// Virtual for calculating days until expiry
urgentSaleSchema.virtual('daysUntilExpiry').get(function() {
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Index for faster queries
urgentSaleSchema.index({ seller: 1 });
urgentSaleSchema.index({ category: 1 });
urgentSaleSchema.index({ featured: 1 });
urgentSaleSchema.index({ status: 1 });
urgentSaleSchema.index({ expiryDate: 1 });

const UrgentSale = mongoose.model('UrgentSale', urgentSaleSchema);
export default UrgentSale; 