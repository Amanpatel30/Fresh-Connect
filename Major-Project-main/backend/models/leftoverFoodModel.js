import mongoose from 'mongoose';

const leftoverFoodSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    required: true,
    enum: ['portions', 'kg', 'plates']
  },
  expiryTime: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'sold', 'expired'],
    default: 'available'
  },
  images: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['meals', 'snacks', 'desserts', 'beverages', 'other']
  },
  dietaryInfo: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'halal', 'contains-nuts', 'gluten-free', 'dairy-free']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
leftoverFoodSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const LeftoverFood = mongoose.model('LeftoverFood', leftoverFoodSchema);

export default LeftoverFood; 