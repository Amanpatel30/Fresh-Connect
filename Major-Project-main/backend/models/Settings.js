import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Settings must belong to a user']
    },
    general: {
      language: {
        type: String,
        enum: ['en', 'hi', 'ta', 'te', 'mr'],
        default: 'en'
      },
      timezone: {
        type: String,
        default: 'UTC+5:30'
      },
      dateFormat: {
        type: String,
        enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
        default: 'DD/MM/YYYY'
      },
      currency: {
        type: String,
        enum: ['INR', 'USD', 'EUR', 'GBP'],
        default: 'INR'
      }
    },
    notifications: {
      emailNotifications: {
        type: Boolean,
        default: true
      },
      orderUpdates: {
        type: Boolean,
        default: true
      },
      productAlerts: {
        type: Boolean,
        default: true
      },
      marketingEmails: {
        type: Boolean,
        default: false
      },
      lowStockAlerts: {
        type: Boolean,
        default: true
      },
      desktopNotifications: {
        type: Boolean,
        default: true
      }
    },
    security: {
      twoFactorAuth: {
        type: Boolean,
        default: false
      },
      sessionTimeout: {
        type: Number,
        default: 30,
        min: 5,
        max: 120
      },
      loginAlerts: {
        type: Boolean,
        default: true
      }
    }
  },
  {
    timestamps: true,
  }
);

// Create or update settings for a user
settingsSchema.statics.createOrUpdateSettings = async function(userId, settingsData) {
  return this.findOneAndUpdate(
    { user: userId },
    settingsData,
    { new: true, upsert: true, runValidators: true }
  );
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings; 