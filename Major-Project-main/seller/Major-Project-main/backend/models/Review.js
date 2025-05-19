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
      type: String
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
  timestamps: true
});

// Create indexes for faster queries
reviewSchema.index({ sellerId: 1, date: -1 });
reviewSchema.index({ rating: 1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review; 