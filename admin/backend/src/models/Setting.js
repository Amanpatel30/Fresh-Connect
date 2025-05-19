const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['general', 'payment', 'email', 'shipping', 'security', 'appearance'],
    default: 'general'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Static method to get settings by category
settingSchema.statics.getByCategory = function(category) {
  return this.find({ category });
};

// Static method to get all public settings
settingSchema.statics.getPublic = function() {
  return this.find({ isPublic: true });
};

// Static method to update a setting
settingSchema.statics.updateSetting = function(key, value, userId) {
  return this.findOneAndUpdate(
    { key },
    { 
      value, 
      updatedBy: userId,
      updatedAt: Date.now()
    },
    { new: true, upsert: true }
  );
};

module.exports = mongoose.model('Setting', settingSchema); 