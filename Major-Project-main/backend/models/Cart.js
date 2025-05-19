import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1
        },
        price: {
          type: Number,
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
        productDiscountPrice: {
          type: Number,
          default: null
        },
        productSeller: {
          type: String,
          default: null
        },
        productSellerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          default: null
        },
        productStock: {
          type: Number,
          default: null
        }
      }
    ],
    totalItems: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Create an index on the user field for efficient querying
cartSchema.index({ user: 1 });

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  // Calculate total items and amount
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart; 