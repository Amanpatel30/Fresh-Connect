import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import { fileURLToPath } from 'url';

const router = express.Router();

// Get current directory using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists with more robust error handling
const uploadDir = path.join(__dirname, '../uploads');
const imageDir = path.join(uploadDir, 'images');
const filesDir = path.join(uploadDir, 'files');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created upload directory: ${uploadDir}`);
  }
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
    console.log(`Created images directory: ${imageDir}`);
  }
  if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
    console.log(`Created files directory: ${filesDir}`);
  }
} catch (err) {
  console.error('Error creating upload directories:', err);
}

// Configure storage for file uploads with better error handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      // Create subfolders based on file type
      const subfolder = file.mimetype.startsWith('image/') ? 'images' : 'files';
      const targetDir = path.join(uploadDir, subfolder);
      
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`Created target directory: ${targetDir}`);
      }
      
      console.log(`Storing file in: ${targetDir}`);
      cb(null, targetDir);
    } catch (error) {
      console.error('Error in storage destination:', error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    try {
      const userId = req.user && req.user.id ? req.user.id : 'anonymous';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExt = path.extname(file.originalname).toLowerCase() || '.jpg';
      const filename = `user-${userId}-${uniqueSuffix}${fileExt}`;
      console.log(`Generated filename: ${filename}`);
      cb(null, filename);
    } catch (error) {
      console.error('Error in filename generation:', error);
      cb(error);
    }
  }
});

// Filter only image files
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    console.log(`Rejected file: ${file.originalname}`);
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Configure multer with size limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB size limit
  }
});

// Route to handle profile image uploads
router.post('/profile', protect, (req, res) => {
  // Use the upload middleware with better error handling
  upload.single('file')(req, res, async (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({ 
        success: false, 
        message: 'File upload error',
        error: err.message
      });
    }
    
    try {
      // Check for authentication
      if (!req.user || !req.user.id) {
        console.error('User not authenticated or ID missing:', req.user);
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required',
          details: 'Missing user identification'
        });
      }
      
      // Log auth details for debugging
      console.log('Auth details:', {
        userId: req.user.id,
        headers: {
          authorization: req.headers.authorization ? 'Present (not shown)' : 'Missing',
          contentType: req.headers['content-type']
        }
      });

      if (!req.file) {
        console.error('No file in request:', {
          body: Object.keys(req.body),
          files: req.files ? Object.keys(req.files) : 'No files'
        });
        
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded',
          details: 'File missing in request'
        });
      }

      console.log('File upload details:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      });

      // Convert local path to URL format for client access
      const serverUrl = process.env.BACKEND_URL || 'http://https://fresh-connect-backend.onrender.com';
      const relativePath = req.file.path.replace(/\\/g, '/').split('uploads/')[1];
      const imageUrl = `${serverUrl}/uploads/${relativePath}`;

      // Update user profile with new avatar URL
      try {
        await User.findByIdAndUpdate(req.user.id, { avatarUrl: imageUrl });
        console.log(`Updated user ${req.user.id} with avatar: ${imageUrl}`);
      } catch (dbError) {
        console.error('Error updating user profile:', dbError);
        // Continue anyway since we have the file uploaded
      }

      // Return success response with image URL
      res.status(200).json({
        success: true,
        url: imageUrl,
        originalname: req.file.originalname,
        message: 'Profile image uploaded successfully'
      });
    } catch (error) {
      console.error('Error during profile image upload:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading profile image',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });
});

// Generic file upload route that accepts any file type
router.post('/', protect, (req, res) => {
  // Use the upload middleware with better error handling
  upload.single('file')(req, res, async (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({ 
        success: false, 
        message: 'File upload error',
        error: err.message
      });
    }
    
    try {
      // Check for authentication
      if (!req.user || !req.user.id) {
        console.error('User not authenticated or ID missing:', req.user);
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required',
          details: 'Missing user identification'
        });
      }
      
      // Log auth details for debugging
      console.log('Auth details for generic upload:', {
        userId: req.user.id,
        headers: {
          authorization: req.headers.authorization ? 'Present (not shown)' : 'Missing',
          contentType: req.headers['content-type']
        }
      });

      if (!req.file) {
        console.error('No file in request:', {
          body: Object.keys(req.body),
          files: req.files ? Object.keys(req.files) : 'No files'
        });
        
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded',
          details: 'File missing in request'
        });
      }

      console.log('Generic file upload details:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      });

      // Convert local path to URL format for client access
      const serverUrl = process.env.BACKEND_URL || 'http://https://fresh-connect-backend.onrender.com';
      const relativePath = req.file.path.replace(/\\/g, '/').split('uploads/')[1];
      const fileUrl = `${serverUrl}/uploads/${relativePath}`;

      // For images that might be user avatars, try to update user profile
      if (req.file.mimetype.startsWith('image/') && req.body.category === 'profile') {
        try {
          await User.findByIdAndUpdate(req.user.id, { avatarUrl: fileUrl });
          console.log(`Updated user ${req.user.id} with avatar: ${fileUrl}`);
        } catch (dbError) {
          console.error('Error updating user profile:', dbError);
          // Continue anyway since we have the file uploaded
        }
      }

      res.status(200).json({
        success: true,
        url: fileUrl,
        originalname: req.file.originalname,
        message: 'File uploaded successfully'
      });
    } catch (error) {
      console.error('Error during file upload:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading file',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });
});

export default router;
