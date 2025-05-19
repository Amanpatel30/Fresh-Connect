import catchAsync from '../utils/catchAsync.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg, .webp and .jpeg format allowed!'));
  }
});

// Get seller profile
export const getSellerProfile = catchAsync(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Check if user is a seller
    if (user.role !== 'seller') {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied. User is not a seller.'
      });
    }
    
    // Return seller profile data
    res.status(200).json({
      status: 'success',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        shopName: user.shopName || '',
        address: user.address || '',
        description: user.description || '',
        avatar: user.avatar || '',
        shopImage: user.shopImage || '',
        documents: user.documents || {
          gst: '',
          pan: '',
          fssai: ''
        }
      }
    });
  } catch (error) {
    console.error('Error in getSellerProfile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching profile'
    });
  }
});

// Update seller profile
export const updateSellerProfile = catchAsync(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Check if user is a seller
    if (user.role !== 'seller') {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied. User is not a seller.'
      });
    }
    
    // Update fields
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.shopName = req.body.shopName || user.shopName;
    user.address = req.body.address || user.address;
    user.description = req.body.description || user.description;
    
    // Update documents if provided
    if (req.body.documents) {
      user.documents = {
        ...user.documents,
        ...req.body.documents
      };
    }
    
    // Save updated user
    const updatedUser = await user.save();
    
    // Return updated profile
    res.status(200).json({
      status: 'success',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        shopName: updatedUser.shopName || '',
        address: updatedUser.address || '',
        description: updatedUser.description || '',
        avatar: updatedUser.avatar || '',
        shopImage: updatedUser.shopImage || '',
        documents: updatedUser.documents || {
          gst: '',
          pan: '',
          fssai: ''
        }
      }
    });
  } catch (error) {
    console.error('Error in updateSellerProfile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating profile'
    });
  }
});

// Upload profile image (avatar or shop image)
export const uploadProfileImage = catchAsync(async (req, res) => {
  const uploadSingle = upload.single('image');
  
  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        status: 'fail',
        message: err.message
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No image file provided'
      });
    }
    
    try {
      const user = await User.findById(req.user._id);
      
      if (!user) {
        return res.status(404).json({
          status: 'fail',
          message: 'User not found'
        });
      }
      
      // Check if user is a seller
      if (user.role !== 'seller') {
        return res.status(403).json({
          status: 'fail',
          message: 'Access denied. User is not a seller.'
        });
      }
      
      const imageType = req.body.type; // 'avatar' or 'shopImage'
      const imageUrl = `/api/uploads/profiles/${req.file.filename}`;
      
      if (imageType === 'avatar') {
        user.avatar = imageUrl;
      } else if (imageType === 'shopImage') {
        user.shopImage = imageUrl;
      } else {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid image type. Must be "avatar" or "shopImage"'
        });
      }
      
      await user.save();
      
      res.status(200).json({
        status: 'success',
        data: {
          imageUrl,
          type: imageType
        }
      });
    } catch (error) {
      console.error('Error in uploadProfileImage:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error while uploading image'
      });
    }
  });
});

// Update business documents
export const updateBusinessDocuments = catchAsync(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Check if user is a seller
    if (user.role !== 'seller') {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied. User is not a seller.'
      });
    }
    
    // Update documents
    user.documents = {
      ...user.documents,
      ...req.body
    };
    
    // Save updated user
    await user.save();
    
    // Return updated documents
    res.status(200).json({
      status: 'success',
      data: user.documents
    });
  } catch (error) {
    console.error('Error in updateBusinessDocuments:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating documents'
    });
  }
});

// Upload document file (GST certificate, PAN card, etc.)
export const uploadDocumentFile = catchAsync(async (req, res) => {
  const uploadSingle = upload.single('document');
  
  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        status: 'fail',
        message: err.message
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No document file provided'
      });
    }
    
    try {
      const user = await User.findById(req.user._id);
      
      if (!user) {
        return res.status(404).json({
          status: 'fail',
          message: 'User not found'
        });
      }
      
      // Check if user is a seller
      if (user.role !== 'seller') {
        return res.status(403).json({
          status: 'fail',
          message: 'Access denied. User is not a seller.'
        });
      }
      
      const documentType = req.body.type; // 'gst', 'pan', 'fssai', etc.
      const documentUrl = `/api/uploads/profiles/${req.file.filename}`;
      
      if (!documentType) {
        return res.status(400).json({
          status: 'fail',
          message: 'Document type is required'
        });
      }
      
      // Initialize documents object if it doesn't exist
      if (!user.documents) {
        user.documents = {};
      }
      
      // Update the specific document
      user.documents[documentType] = documentUrl;
      
      await user.save();
      
      res.status(200).json({
        status: 'success',
        data: {
          documentUrl,
          type: documentType
        }
      });
    } catch (error) {
      console.error('Error in uploadDocumentFile:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error while uploading document'
      });
    }
  });
});

// Change password
export const changePassword = catchAsync(async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide both current password and new password'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Check if current password is correct
    const isPasswordCorrect = await user.matchPassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'fail',
        message: 'Current password is incorrect'
      });
    }
    
    // Update the password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while changing password'
    });
  }
}); 