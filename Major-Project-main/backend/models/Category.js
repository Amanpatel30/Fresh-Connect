import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A category must have a name'],
      trim: true,
      maxlength: [50, 'A category name cannot be more than 50 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    color: {
      type: String,
      default: '#4caf50' // Default green color
    },
    order: {
      type: Number,
      default: 0
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A category must belong to a seller']
    },
    count: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create slug from the name
categorySchema.pre('save', function(next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    // Generate a slug by converting to lowercase, replacing spaces with hyphens,
    // removing special characters, and appending a timestamp to ensure uniqueness
    this.slug = this.name.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single one
      + '-' + Date.now().toString().slice(-4); // Add timestamp suffix
  }
  next();
});

// Create a virtual field for product count
categorySchema.virtual('products', {
  ref: 'Product',
  foreignField: 'category',
  localField: '_id',
  count: true
});

// Update product count whenever it's queried
categorySchema.pre(/^find/, function(next) {
  this.populate({
    path: 'products',
    select: 'count'
  });
  next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category; 