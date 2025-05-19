import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
      description: 'The hotel/seller who owns the products in this order'
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        name: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        price: {
          type: Number,
          required: true
        },
        image: String
      }
    ],
    shippingAddress: {
      fullName: {
        type: String,
        required: true
      },
      address: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      postalCode: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      country: {
        type: String,
        default: 'India'
      },
      phone: {
        type: String,
        required: true
      }
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['cod', 'card', 'upi', 'netbanking', 'wallet']
    },
    paymentResult: {
      id: String,
      status: String,
      updateTime: String,
      email: String
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false
    },
    paidAt: Date,
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    statusUpdates: [
      {
        status: {
          type: String,
          enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
        },
        date: {
          type: Date,
          default: Date.now
        },
        note: String
      }
    ],
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String,
    expectedDeliveryDate: Date,
    trackingInfo: {
      carrier: String,
      trackingNumber: String,
      trackingUrl: String
    },
    // Fields for offline order tracking
    isOfflineOrder: {
      type: Boolean,
      default: false
    },
    offlineOrderId: String,
    isImported: {
      type: Boolean,
      default: false
    },
    importedAt: Date,
    pendingSync: {
      type: Boolean,
      default: false
    },
    // Fields for emergency orders
    isEmergencyOrder: {
      type: Boolean,
      default: false
    },
    customerContact: {
      name: String,
      phone: String,
      email: String
    }
  },
  {
    timestamps: true
  }
);

// Generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    // Get current date
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Get count of orders created today
    const datePrefix = `ORD-${year}${month}${day}`;
    const count = await mongoose.model('Order').countDocuments({
      orderNumber: { $regex: `^${datePrefix}` }
    });
    
    // Generate order number
    this.orderNumber = `${datePrefix}-${(count + 1).toString().padStart(4, '0')}`;
  }
  
  // Add status update if status changed
  if (this.isModified('status')) {
    this.statusUpdates.push({
      status: this.status,
      date: new Date(),
      note: `Order status changed to ${this.status}`
    });
    
    // Update corresponding date fields
    if (this.status === 'delivered') {
      this.deliveredAt = new Date();
    } else if (this.status === 'cancelled') {
      this.cancelledAt = new Date();
    }
  }
  
  next();
});

// Create indexes for common queries
orderSchema.index({ user: 1 });
orderSchema.index({ seller: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'items.product': 1 });
orderSchema.index({ seller: 1, createdAt: -1 });
orderSchema.index({ seller: 1, status: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order; 