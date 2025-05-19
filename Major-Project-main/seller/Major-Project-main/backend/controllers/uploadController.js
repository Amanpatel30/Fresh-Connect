import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
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
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
});

// Simple upload image function - store all images in the filesystem for now
export const uploadImage = (req, res) => {
  console.log('Upload request received');
  
  const uploadMiddleware = upload.single('image');
  
  uploadMiddleware(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading file. Please try again.'
      });
    } else if (err) {
      console.error('Other upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading file. Please try again.'
      });
    }

    // Everything went fine
    if (!req.file) {
      console.error('No file provided');
      return res.status(400).json({ 
        success: false,
        message: 'No image file provided' 
      });
    }

    try {
      console.log('File uploaded successfully:', req.file);
      
      // Create URL for the uploaded image
      const imageUrl = `/uploads/${req.file.filename}`;
      
      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        imageUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    } catch (error) {
      console.error('Upload processing error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error processing uploaded image',
        error: error.message 
      });
    }
  });
};

// Get image by filename
export const getImage = (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(uploadsDir, filename);
  
  console.log('Getting image file:', filepath);
  
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({ 
      success: false,
      message: 'Image not found' 
    });
  }
};

// Get image by ID (placeholder for MongoDB-stored images)
export const getImageById = async (req, res) => {
  res.status(501).json({ 
    success: false,
    message: 'MongoDB image storage not implemented yet' 
  });
};

// Delete image
export const deleteImage = async (req, res) => {
  // Handle filesystem images
  const filename = req.params.filename;
  if (filename) {
    const filepath = path.join(uploadsDir, filename);
    
    if (fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
        return res.json({ 
          success: true,
          message: 'Image deleted successfully' 
        });
      } catch (error) {
        console.error('Error deleting file:', error);
        return res.status(500).json({ 
          success: false,
          message: 'Error deleting image',
          error: error.message 
        });
      }
    }
  }
  
  // If we get here, the image wasn't found
  res.status(404).json({ 
    success: false,
    message: 'Image not found' 
  });
}; 