import mongoose from 'mongoose';

const urgentSaleSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required']
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required'],
      min: [0, 'Price cannot be negative']
    },
    discountPrice: {
      type: Number,
      required: [true, 'Discount price is required'],
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: function(value) {
          return value < this.originalPrice;
        },
        message: 'Discount price must be less than original price'
      }
    },
    discountPercentage: {
      type: Number,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot be more than 100']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['food', 'grocery', 'bakery', 'dairy', 'fruits', 'vegetables', 'meat', 'seafood', 'other']
    },
    images: [
      {
        url: String,
        key: String
      }
    ],
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: ['kg', 'g', 'l', 'ml', 'pcs', 'dozen', 'box', 'pack', 'other']
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required']
    },
    status: {
      type: String,
      enum: ['active', 'sold', 'expired', 'cancelled'],
      default: 'active'
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      },
      address: {
        type: String,
        required: [true, 'Address is required']
      },
      city: {
        type: String,
        required: [true, 'City is required']
      },
      state: {
        type: String,
        required: [true, 'State is required']
      },
      pincode: {
        type: String,
        required: [true, 'Pincode is required']
      }
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    featuredUntil: {
      type: Date,
      default: null
    },
    isPickupOnly: {
      type: Boolean,
      default: true
    },
    tags: [String]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add index for location-based queries
urgentSaleSchema.index({ 'location.coordinates': '2dsphere' });

// Add index for expiry date queries
urgentSaleSchema.index({ expiryDate: 1 });

// Calculate discount percentage before saving
urgentSaleSchema.pre('save', function(next) {
  if (this.originalPrice && this.discountPrice) {
    this.discountPercentage = Math.round(
      ((this.originalPrice - this.discountPrice) / this.originalPrice) * 100
    );
  }
  next();
});

// Virtual for time remaining until expiry
urgentSaleSchema.virtual('timeRemaining').get(function() {
  if (!this.expiryDate) return null;
  const now = new Date();
  const expiryTime = new Date(this.expiryDate).getTime();
  const diff = expiryTime - now.getTime();
  
  // Return in hours if positive, 0 if expired
  return diff > 0 ? Math.floor(diff / (1000 * 60 * 60)) : 0;
});

// Virtual for checking if urgent sale is active
urgentSaleSchema.virtual('isActive').get(function() {
  const now = new Date();
  return (
    this.status === 'active' &&
    now >= new Date(this.startDate) &&
    now <= new Date(this.endDate) &&
    now <= new Date(this.expiryDate)
  );
});

// Virtual for populated seller info
urgentSaleSchema.virtual('sellerInfo', {
  ref: 'User',
  localField: 'seller',
  foreignField: '_id',
  justOne: true
});

// Create the model only if it doesn't exist
let UrgentSale;
try {
  UrgentSale = mongoose.model('UrgentSale');
} catch (error) {
  UrgentSale = mongoose.model('UrgentSale', urgentSaleSchema);
}

export default UrgentSale; 