import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: false
    },
    type: {
      type: String,
      enum: ['order', 'inventory', 'payment', 'customer', 'review', 'system'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedModel'
    },
    relatedModel: {
      type: String,
      enum: ['Order', 'Product', 'User', 'Payment']
    },
    link: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for common queries
notificationSchema.index({ user: 1 });
notificationSchema.index({ seller: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 