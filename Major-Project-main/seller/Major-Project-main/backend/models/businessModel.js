import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
  businessType: {
    type: String,
    required: true,
    enum: ['hotel', 'seller']
  },
  businessName: {
    type: String,
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  businessLicense: {
    type: String,
    required: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  // Hotel specific fields
  hotelType: {
    type: String,
    required: function() { return this.businessType === 'hotel'; }
  },
  cuisine: [{
    type: String,
    required: function() { return this.businessType === 'hotel'; }
  }],
  seatingCapacity: {
    type: Number,
    required: function() { return this.businessType === 'hotel'; }
  },
  // Seller specific fields
  productCategories: [{
    type: String,
    required: function() { return this.businessType === 'seller'; }
  }],
  storageType: {
    type: String,
    required: function() { return this.businessType === 'seller'; }
  },
  deliveryRadius: {
    type: Number,
    required: function() { return this.businessType === 'seller'; }
  },
  ratings: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Business = mongoose.model('Business', businessSchema);
export default Business;