import mongoose from 'mongoose';

const staffSchema = mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
      enum: ['Kitchen', 'Service', 'Front Desk', 'Maintenance', 'Management', 'Housekeeping', 'Other'],
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String },
    },
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String },
    },
    dateOfBirth: {
      type: Date,
    },
    dateHired: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      enum: ['Active', 'On Leave', 'Terminated', 'Suspended'],
      default: 'Active',
    },
    documents: [
      {
        name: { type: String },
        url: { type: String },
        uploadDate: { type: Date, default: Date.now },
      },
    ],
    salary: {
      amount: { type: Number },
      currency: { type: String, default: 'USD' },
      paymentFrequency: { type: String, enum: ['Weekly', 'Bi-weekly', 'Monthly'], default: 'Monthly' },
    },
    leaveBalance: {
      sick: { type: Number, default: 0 },
      vacation: { type: Number, default: 0 },
      personal: { type: Number, default: 0 },
    },
    performance: {
      lastReviewDate: { type: Date },
      rating: { type: Number, min: 1, max: 5 },
      comments: { type: String },
    },
    schedule: [
      {
        day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
        startTime: { type: String },
        endTime: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Staff = mongoose.model('Staff', staffSchema);

export default Staff; 