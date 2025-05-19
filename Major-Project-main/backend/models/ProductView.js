import mongoose from 'mongoose';

const productViewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    viewDuration: {
      type: Number, // Duration in seconds
      default: 0
    },
    source: {
      type: String,
      enum: ['search', 'category', 'recommendation', 'wishlist', 'homepage', 'other'],
      default: 'other'
    }
  },
  {
    timestamps: true
  }
);

// Create a compound index for user and product to efficiently query user views
productViewSchema.index({ user: 1, product: 1 });

// Create an index on createdAt for efficient time-based querying
productViewSchema.index({ createdAt: -1 });

const ProductView = mongoose.model('ProductView', productViewSchema);

export default ProductView; 