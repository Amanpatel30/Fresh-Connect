const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Support', 'Manager', 'Seller', 'Customer', 'seller', 'user', 'admin', 'hotel'],
    default: 'user'
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationNotes: {
    type: String
  },
  verificationRejected: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  documents: {
    gst: String,
    pan: String,
    fssai: String,
    shopLicense: String,
    fssaiNumber: String,
    gstNumber: String,
    licenseNumber: String,
    panNumber: String
  },
  shopName: {
    type: String,
    default: ''
  },
  shopAddress: {
    type: String,
    default: ''
  },
  shopDescription: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Pre-save hook to update updatedAt field and ensure status consistency
UserSchema.pre('save', function(next) {
  // Update timestamp
  this.updatedAt = Date.now();
  
  // NOTE: This hook was causing issues with status updates
  // We're commenting out the automatic synchronization and handling it manually in controllers
  // to avoid unexpected behavior
  
  /* 
  // Ensure status and isActive are in sync
  if (this.isModified('status') && !this.isModified('isActive')) {
    this.isActive = this.status === 'Active';
    console.log(`[Model] Updated isActive to ${this.isActive} based on status=${this.status}`);
  } else if (this.isModified('isActive') && !this.isModified('status')) {
    this.status = this.isActive ? 'Active' : 'Inactive';
    console.log(`[Model] Updated status to ${this.status} based on isActive=${this.isActive}`);
  }
  */
  
  // Add detailed logging to help diagnose status update issues
  if (this.isModified('status') || this.isModified('isActive')) {
    console.log('--------- PRE-SAVE LOG ---------');
    console.log(`User: ${this.name} (${this.email})`);
    console.log(`isModified('status'): ${this.isModified('status')}`);
    console.log(`isModified('isActive'): ${this.isModified('isActive')}`);
    console.log(`Current status: ${this.status}`);
    console.log(`Current isActive: ${this.isActive}`);
    console.log('-------------------------------');
  }
  
  next();
});

module.exports = mongoose.model('User', UserSchema); 