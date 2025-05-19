import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  businessType: {
    type: String,
    required: true,
  },
  registrationNumber: {
    type: String,
    unique: true,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  documents: [{
    type: String,  // URLs to uploaded documents
  }],
  bankDetails: {
    accountNumber: String,
    bankName: String,
    ifscCode: String,
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true
});

const Seller = mongoose.model('Seller', sellerSchema);
export default Seller;