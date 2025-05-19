import mongoose from 'mongoose';

const wishlistActivitySchema = new mongoose.Schema(
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
    action: {
      type: String,
      enum: ['add', 'remove'],
      required: true
    }
  },
  {
    timestamps: true
  }
);

const WishlistActivity = mongoose.model('WishlistActivity', wishlistActivitySchema);

export default WishlistActivity; 