import mongoose from 'mongoose';

const verificationSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Hotel',
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    documents: [
      {
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
          enum: ['License', 'Certificate', 'ID', 'Other'],
        },
        url: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    reviewDate: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: {
      type: String,
    },
    notes: {
      type: String,
    },
    expiryDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Verification = mongoose.model('Verification', verificationSchema);

export default Verification; 