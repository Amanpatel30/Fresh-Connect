const mongoose = require('mongoose');
const Verification = require('../models/Verification');
require('dotenv').config();

const sampleVerifications = [
  {
    userId: "65f2e8b7c261e8b7c261e8b7", // Replace with actual user ID
    type: "seller",
    status: "pending",
    documents: {
      businessLicense: "license123.pdf",
      taxId: "tax123.pdf",
      addressProof: "address123.pdf"
    },
    submittedAt: new Date(),
    notes: "New seller verification request"
  },
  {
    userId: "65f2e8b7c261e8b7c261e8b8", // Replace with actual user ID
    type: "seller",
    status: "approved",
    documents: {
      businessLicense: "license456.pdf",
      taxId: "tax456.pdf",
      addressProof: "address456.pdf"
    },
    submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    reviewedBy: "65f2e8b7c261e8b7c261e8b9", // Replace with actual admin ID
    reviewedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    notes: "All documents verified and approved"
  }
];

const seedVerifications = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing verifications
    await Verification.deleteMany({});
    console.log('Cleared existing verifications');

    // Insert sample verifications
    const insertedVerifications = await Verification.insertMany(sampleVerifications);
    console.log(`Successfully inserted ${insertedVerifications.length} verifications`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding verifications:', error);
    process.exit(1);
  }
};

seedVerifications(); 