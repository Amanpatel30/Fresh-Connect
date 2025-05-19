import mongoose from 'mongoose';

const inventorySchema = mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Hotel',
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['vegetables', 'fruits', 'dairy', 'meat', 'seafood', 'grains', 'spices', 'beverages', 'other', 'meals', 'bakery', 'produce'],
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    unit: {
      type: String,
      required: true,
      enum: ['kg', 'g', 'l', 'ml', 'pcs', 'box', 'pack', 'portions', 'slices', 'bowls', 'plates'],
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    supplier: {
      name: { type: String, default: '' },
      contact: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    expiryDate: {
      type: Date,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    minStockLevel: {
      type: Number,
      default: 5,
    },
    isLowStock: {
      type: Boolean,
      default: false,
    },
    isOutOfStock: {
      type: Boolean,
      default: false,
    },
    isReserved: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      default: 'Main Storage',
    },
    notes: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: []
    },
    isLeftoverFood: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

// Update stock status before saving
inventorySchema.pre('save', function (next) {
  if (this.quantity <= 0) {
    this.isOutOfStock = true;
    this.isLowStock = false;
  } else if (this.quantity <= this.minStockLevel) {
    this.isLowStock = true;
    this.isOutOfStock = false;
  } else {
    this.isLowStock = false;
    this.isOutOfStock = false;
  }
  next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory; 