import mongoose from 'mongoose';

const feedbackSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    categories: {
      type: [String],
      default: [],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    reply: {
      type: String,
      default: null,
    },
    replyDate: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    orderReference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    status: {
      type: String,
      enum: ['pending', 'responded', 'resolved'],
      default: 'pending',
    },
    isPublic: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback; 