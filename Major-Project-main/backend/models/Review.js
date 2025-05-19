import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  customer: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: '/uploads/avatars/default.jpg'
    }
  },
  product: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: '/uploads/products/default.jpg'
    }
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  responded: {
    type: Boolean,
    default: false
  },
  response: {
    text: String,
    date: Date
  },
  helpful: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  // Don't run validation for fields not included in updates
  validateBeforeSave: true,
  // This option ensures we don't lose fields when updating
  strict: false
});

// Create indexes for faster queries
reviewSchema.index({ sellerId: 1, date: -1 });
reviewSchema.index({ rating: 1 });

// Pre-save hook to set default values if fields are missing
reviewSchema.pre('save', function(next) {
  // If the document is being updated with a response, ensure required fields are present
  if (this.isModified('response') || this.isModified('responded')) {
    // Ensure customer exists with defaults if not present
    if (!this.customer) {
      this.customer = {
        _id: mongoose.Types.ObjectId(),
        name: 'Unknown Customer',
        image: '/uploads/avatars/default.jpg'
      };
    } else {
      // Set defaults for any missing customer fields
      if (!this.customer._id) this.customer._id = mongoose.Types.ObjectId();
      if (!this.customer.name) this.customer.name = 'Unknown Customer';
      if (!this.customer.image) this.customer.image = '/uploads/avatars/default.jpg';
    }

    // Ensure product exists with defaults if not present
    if (!this.product) {
      this.product = {
        _id: mongoose.Types.ObjectId(),
        name: 'Unknown Product',
        image: '/uploads/products/default.jpg'
      };
    } else {
      // Set defaults for any missing product fields
      if (!this.product._id) this.product._id = mongoose.Types.ObjectId();
      if (!this.product.name) this.product.name = 'Unknown Product';
      if (!this.product.image) this.product.image = '/uploads/products/default.jpg';
    }
  }
  
  next();
});

const Review = mongoose.model('Review', reviewSchema);

export default Review; 