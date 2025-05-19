import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    discountPrice: {
      type: Number,
      min: 0
    },
    category: {
      type: String,
      required: true
    },
    subcategory: {
      type: String
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    // Main product image as base64 string
    image: {
      type: String,
      required: [true, 'A product must have a main image']
    },
    // Additional product images as array of base64 strings
    images: [String],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    tags: [String],
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['g', 'kg', 'lb', 'oz'],
        default: 'g'
      }
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm'
      }
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for common queries
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ isActive: 1, isFeatured: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product; 