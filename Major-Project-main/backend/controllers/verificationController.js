import asyncHandler from 'express-async-handler';
import Verification from '../models/Verification.js';
import Hotel from '../models/Hotel.js';

// @desc    Get verification status for the logged-in user
// @route   GET /api/verification/status
// @access  Private
const getVerificationStatus = asyncHandler(async (req, res) => {
  const verification = await Verification.findOne({
    user: req.user._id,
  }).sort({ createdAt: -1 });

  if (verification) {
    res.json({
      status: verification.status,
      applicationDate: verification.applicationDate,
      reviewDate: verification.reviewDate,
      isActive: verification.isActive,
      expiryDate: verification.expiryDate,
      documents: verification.documents,
      rejectionReason: verification.rejectionReason,
    });
  } else {
    res.json({
      status: 'Not Applied',
      message: 'You have not applied for verification yet.',
    });
  }
});

// @desc    Get all verification documents for the logged-in user
// @route   GET /api/verification/documents
// @access  Private
const getVerificationDocuments = asyncHandler(async (req, res) => {
  const verification = await Verification.findOne({
    user: req.user._id,
  }).sort({ createdAt: -1 });

  if (verification && verification.documents.length > 0) {
    res.json(verification.documents);
  } else {
    res.json([]);
  }
});

// @desc    Apply for verification
// @route   POST /api/verification/apply
// @access  Private
const applyForVerification = asyncHandler(async (req, res) => {
  const { documents, notes } = req.body;

  if (!documents || documents.length === 0) {
    res.status(400);
    throw new Error('Please upload at least one document for verification');
  }

  // Check if user already has a pending or approved verification
  const existingVerification = await Verification.findOne({
    user: req.user._id,
    $or: [{ status: 'Pending' }, { status: 'Approved', isActive: true }],
  });

  if (existingVerification) {
    res.status(400);
    throw new Error(
      `You already have a ${existingVerification.status.toLowerCase()} verification application`
    );
  }

  // Create new verification application
  const verification = await Verification.create({
    user: req.user._id,
    hotel: req.user.hotelId || req.user._id,
    documents,
    notes,
    status: 'Pending',
    applicationDate: new Date(),
  });

  if (verification) {
    res.status(201).json({
      message: 'Verification application submitted successfully',
      verification: {
        status: verification.status,
        applicationDate: verification.applicationDate,
        documents: verification.documents,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid verification data');
  }
});

// @desc    Upload a verification document
// @route   POST /api/verification/document
// @access  Private
const uploadDocument = asyncHandler(async (req, res) => {
  const { name, type, url } = req.body;

  if (!name || !type || !url) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const document = {
    name,
    type,
    url,
    uploadedAt: new Date(),
  };

  // Find the most recent verification application
  let verification = await Verification.findOne({
    user: req.user._id,
  }).sort({ createdAt: -1 });

  if (verification && verification.status === 'Pending') {
    // Add document to existing pending verification
    verification.documents.push(document);
    await verification.save();
  } else {
    // Create new verification with this document
    verification = await Verification.create({
      user: req.user._id,
      hotel: req.user.hotelId || req.user._id,
      documents: [document],
      status: 'Pending',
      applicationDate: new Date(),
    });
  }

  res.status(201).json({
    message: 'Document uploaded successfully',
    document,
  });
});

// @desc    Delete a verification document
// @route   DELETE /api/verification/document/:id
// @access  Private
const deleteDocument = asyncHandler(async (req, res) => {
  const documentId = req.params.id;

  const verification = await Verification.findOne({
    user: req.user._id,
    status: 'Pending',
  });

  if (!verification) {
    res.status(404);
    throw new Error('No pending verification application found');
  }

  // Find and remove the document
  const documentIndex = verification.documents.findIndex(
    (doc) => doc._id.toString() === documentId
  );

  if (documentIndex === -1) {
    res.status(404);
    throw new Error('Document not found');
  }

  verification.documents.splice(documentIndex, 1);
  await verification.save();

  res.json({
    message: 'Document deleted successfully',
  });
});

// @desc    Cancel verification application
// @route   DELETE /api/verification/cancel
// @access  Private
const cancelVerification = asyncHandler(async (req, res) => {
  const verification = await Verification.findOne({
    user: req.user._id,
    status: 'Pending',
  });

  if (!verification) {
    res.status(404);
    throw new Error('No pending verification application found');
  }

  await Verification.deleteOne({ _id: verification._id });

  res.json({
    message: 'Verification application cancelled successfully',
  });
});

// @desc    Admin: Get all verification applications
// @route   GET /api/verification/admin
// @access  Private/Admin
const getAllVerifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const status = req.query.status || '';

  const query = {};
  if (status) {
    query.status = status;
  }

  const total = await Verification.countDocuments(query);
  const verifications = await Verification.find(query)
    .sort({ applicationDate: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'name email')
    .populate('hotel', 'name');

  res.json({
    verifications,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Admin: Review verification application
// @route   PUT /api/verification/admin/:id
// @access  Private/Admin
const reviewVerification = asyncHandler(async (req, res) => {
  const { status, rejectionReason, expiryDate, notes } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Please provide a status');
  }

  if (status === 'Rejected' && !rejectionReason) {
    res.status(400);
    throw new Error('Please provide a reason for rejection');
  }

  const verification = await Verification.findById(req.params.id);

  if (!verification) {
    res.status(404);
    throw new Error('Verification application not found');
  }

  verification.status = status;
  verification.reviewDate = new Date();
  verification.reviewedBy = req.user._id;
  verification.rejectionReason = rejectionReason || '';
  verification.notes = notes || verification.notes;
  
  if (status === 'Approved') {
    verification.isActive = true;
    verification.expiryDate = expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Default 1 year
    
    // Update hotel verification status
    await Hotel.findByIdAndUpdate(
      verification.hotel,
      { isVerified: true, verificationExpiryDate: verification.expiryDate },
      { new: true }
    );
  } else if (status === 'Rejected') {
    verification.isActive = false;
    verification.expiryDate = null;
  }

  await verification.save();

  res.json({
    message: `Verification application ${status.toLowerCase()} successfully`,
    verification,
  });
});

export {
  getVerificationStatus,
  getVerificationDocuments,
  applyForVerification,
  uploadDocument,
  deleteDocument,
  cancelVerification,
  getAllVerifications,
  reviewVerification,
}; 