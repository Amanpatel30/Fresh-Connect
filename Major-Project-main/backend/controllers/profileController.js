import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { uploadFileToStorage, deleteFileFromStorage } from '../utils/fileStorage.js';

// Get seller profile
export const getSellerProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .select('name email phone role address businessName businessAddress gstin panNumber fssaiNumber businessType profileImage businessDocuments createdAt')
    .populate('ratings');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Update seller profile
export const updateSellerProfile = catchAsync(async (req, res, next) => {
  // Fields that are allowed to be updated
  const allowedFields = {
    name: req.body.name,
    phone: req.body.phone,
    address: req.body.address,
    businessName: req.body.businessName,
    businessAddress: req.body.businessAddress,
    businessType: req.body.businessType
  };

  // Remove undefined fields
  Object.keys(allowedFields).forEach(key => 
    allowedFields[key] === undefined && delete allowedFields[key]
  );

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    allowedFields,
    {
      new: true,
      runValidators: true
    }
  );

  if (!updatedUser) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Upload profile image
export const uploadProfileImage = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.profileImage) {
    return next(new AppError('Please upload a profile image', 400));
  }

  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Delete existing profile image if exists
  if (user.profileImage && user.profileImage.key) {
    await deleteFileFromStorage(user.profileImage.key);
  }

  // Upload new profile image
  const result = await uploadFileToStorage(
    req.files.profileImage, 
    `users/${req.user.id}/profile`
  );

  // Update user profile with new image
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      profileImage: {
        url: result.url,
        key: result.key
      }
    },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      profileImage: updatedUser.profileImage
    }
  });
});

// Update business documents
export const updateBusinessDocuments = catchAsync(async (req, res, next) => {
  const { gstin, panNumber, fssaiNumber } = req.body;

  // Update fields
  const updateFields = {};
  if (gstin) updateFields.gstin = gstin;
  if (panNumber) updateFields.panNumber = panNumber;
  if (fssaiNumber) updateFields.fssaiNumber = fssaiNumber;

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    updateFields,
    { new: true }
  );

  if (!updatedUser) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Upload document file
export const uploadDocumentFile = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.document) {
    return next(new AppError('Please upload a document', 400));
  }

  if (!req.body.type || !['gst', 'pan', 'fssai'].includes(req.body.type)) {
    return next(new AppError('Invalid document type', 400));
  }

  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Document type to field name mapping
  const documentTypeMap = {
    'gst': 'gstCertificate',
    'pan': 'panCard',
    'fssai': 'fssaiLicense'
  };

  const fieldName = documentTypeMap[req.body.type];

  // Delete existing document if it exists
  if (user.businessDocuments && user.businessDocuments[fieldName] && user.businessDocuments[fieldName].key) {
    await deleteFileFromStorage(user.businessDocuments[fieldName].key);
  }

  // Upload new document
  const result = await uploadFileToStorage(
    req.files.document, 
    `users/${req.user.id}/documents/${req.body.type}`
  );

  // Initialize businessDocuments object if it doesn't exist
  if (!user.businessDocuments) {
    user.businessDocuments = {};
  }

  // Update document in user profile
  user.businessDocuments[fieldName] = {
    url: result.url,
    key: result.key
  };

  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      document: user.businessDocuments[fieldName]
    }
  });
});

// Change password
export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, passwordConfirm } = req.body;

  // Check if all required fields are provided
  if (!currentPassword || !newPassword || !passwordConfirm) {
    return next(new AppError('Please provide current password, new password and password confirmation', 400));
  }

  // Check if new password and password confirmation match
  if (newPassword !== passwordConfirm) {
    return next(new AppError('New password and password confirmation do not match', 400));
  }

  // Get user from database
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if current password is correct
  const isCorrectPassword = await user.correctPassword(currentPassword, user.password);

  if (!isCorrectPassword) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // Update password
  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully'
  });
}); 