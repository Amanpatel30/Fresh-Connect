import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadImage, getImage, getImageById, deleteImage } from '../controllers/uploadController.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();

// Get directory name for static file serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Upload route - we'll remove the auth protection temporarily for testing
router.post('/upload', uploadImage);

// Get image routes
router.get('/images/:id', getImageById); // For MongoDB stored images
router.get('/uploads/:filename', getImage); // For filesystem stored images

// Delete image routes
router.delete('/images/:id', protect, deleteImage);
router.delete('/uploads/:filename', protect, deleteImage);

// Get image by path
router.get('/profiles/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(uploadsDir, 'profiles', filename);
  
  console.log('Getting profile image file:', filepath);
  
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({ 
      success: false,
      message: 'Image not found' 
    });
  }
});

// Get product image
router.get('/products/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(uploadsDir, 'products', filename);
  
  console.log('Getting product image file:', filepath);
  
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({ 
      success: false,
      message: 'Image not found' 
    });
  }
});

// Get document file
router.get('/documents/:filename', protect, (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(uploadsDir, 'documents', filename);
  
  console.log('Getting document file:', filepath);
  
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({ 
      success: false,
      message: 'Document not found' 
    });
  }
});

export default router; 