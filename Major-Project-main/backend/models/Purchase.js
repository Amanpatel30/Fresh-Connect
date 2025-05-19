import mongoose from 'mongoose';

const purchaseSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Hotel',
    },
    items: [
      {
        inventoryItem: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Inventory',
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        unit: {
          type: String,
          required: true,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        totalPrice: {
          type: Number,
          required: true,
        },
      },
    ],
    supplier: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Cash', 'Credit Card', 'Bank Transfer', 'Other'],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['Paid', 'Pending', 'Cancelled'],
      default: 'Pending',
    },
    notes: {
      type: String,
    },
    receiptNumber: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Purchase = mongoose.model('Purchase', purchaseSchema);

export default Purchase; 