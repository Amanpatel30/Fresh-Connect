import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\d{10}$/, 'Phone number must be 10 digits']
  },
  role: {
    type: String,
    enum: ['user'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  cart: {
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
  wishlist: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  addresses: [
    {
      id: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString()
      },
      type: {
        type: String,
        enum: ['Home', 'Work', 'Other'],
        default: 'Home'
      },
      fullName: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      isDefault: {
        type: Boolean,
        default: false
      }
    }
  ],
  paymentMethods: [
    {
      id: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString()
      },
      type: {
        type: String,
        enum: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Wallet'],
        required: true
      },
      cardNumber: String,
      cardHolderName: String,
      expiryDate: String,
      upiId: String,
      bankName: String,
      accountNumber: String,
      isDefault: {
        type: Boolean,
        default: false
      }
    }
  ],
  notificationSettings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    orderUpdates: {
      type: Boolean,
      default: true
    },
    promotions: {
      type: Boolean,
      default: false
    },
    appNotifications: {
      type: Boolean,
      default: true
    },
    urgentSales: {
      type: Boolean,
      default: true
    },
    freeFood: {
      type: Boolean,
      default: true
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  sessionData: {
    paymentData: {
      type: mongoose.Schema.Types.Mixed
    },
    paymentDataUpdatedAt: {
      type: Date
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }
});

// Update timestamps on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if password matches
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User; 