import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        addedAt: {
          type: Date,
          default: Date.now
        },
        // Add additional fields for direct access without needing to populate
        productName: {
          type: String,
          default: null
        },
        productImage: {
          type: String,
          default: null
        },
        productCategory: {
          type: String,
          default: null
        },
        productPrice: {
          type: Number,
          default: null
        },
        productDiscountPrice: {
          type: Number,
          default: null
        },
        productSeller: {
          type: String,
          default: null
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Create an index on the user field for efficient querying
wishlistSchema.index({ user: 1 });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist; 