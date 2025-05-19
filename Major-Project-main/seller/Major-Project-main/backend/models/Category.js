import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A category must have a name'],
      trim: true,
      maxlength: [50, 'A category name cannot be more than 50 characters']
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