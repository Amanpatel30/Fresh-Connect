import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/authMiddleware.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import sharp from 'sharp';

const router = express.Router();

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File size threshold (10MB in bytes)
// Files larger than this will be stored in the filesystem
// Files smaller than this will be stored in MongoDB
const FILE_SIZE_THRESHOLD = 10 * 1024 * 1024;

// Image optimization settings
const IMAGE_QUALITY = 80; // JPEG quality 0-100
const MAX_WIDTH = 1200; // Maximum width
const MAX_HEIGHT = 1200; // Maximum height

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create a publicly accessible directory for images
const publicUploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(publicUploadsDir)) {
  fs.mkdirSync(publicUploadsDir, { recursive: true });
}

// Define ImageStorage schema for storing just images
// This avoids conflicts with the Product model which has many required fields
const ImageStorageSchema = new mongoose.Schema({
  data: Buffer,
  contentType: String,
  filename: String,
  filePath: String,
  uploadDate: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  storageType: String
});

// Get the ImageStorage model or create it
const ImageStorage = mongoose.models.ImageStorage || mongoose.model('ImageStorage', ImageStorageSchema);

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store all files in the publicUploadsDir for consistent access
    cb(null, publicUploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // Increased to 50MB to handle larger files
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
}).single('image');

// Helper function to optimize images
const optimizeImage = async (inputPath, outputPath, mimetype) => {
  try {
    // Get image info
    const metadata = await sharp(inputPath).metadata();
    
    // Determine if we need to resize based on dimensions
    const needsResize = metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT;
    
    // Set up the sharp pipeline
    let sharpPipeline = sharp(inputPath);
    
    // Resize if needed
    if (needsResize) {
      sharpPipeline = sharpPipeline.resize({
        width: Math.min(metadata.width, MAX_WIDTH),
        height: Math.min(metadata.height, MAX_HEIGHT),
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Format based on mimetype
    if (mimetype === 'image/png') {
      await sharpPipeline
        .png({ quality: IMAGE_QUALITY })
        .toFile(outputPath);
    } else {
      // Default to JPEG for everything else
      await sharpPipeline
        .jpeg({ quality: IMAGE_QUALITY })
        .toFile(outputPath);
    }
    
    console.log(`Image optimized: ${inputPath} -> ${outputPath}`);
    
    // Get file sizes for logging
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
    
    console.log(`Optimization reduced file size by ${savings}% (${originalSize} -> ${optimizedSize} bytes)`);
    
    return outputPath;
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw error;
  }
};

// Helper function to decode and save a data URI
const saveDataUriToFile = async (dataUri, filename) => {
  try {
    // Extract content type and base64 data
    const matches = dataUri.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid data URI format');
    }
    
    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Determine file extension
    let extension = '.jpg'; // Default
    if (contentType === 'image/png') extension = '.png';
    if (contentType === 'image/jpeg') extension = '.jpg';
    
    // Create a temporary file path
    const tempFilePath = path.join(publicUploadsDir, `temp-${filename}${extension}`);
    
    // Write buffer to temporary file
    fs.writeFileSync(tempFilePath, buffer);
    
    // Create output file path
    const outputFilePath = path.join(publicUploadsDir, `${filename}${extension}`);
    
    // Optimize the image
    await optimizeImage(tempFilePath, outputFilePath, contentType);
    
    // Remove the temporary file
    fs.unlinkSync(tempFilePath);
    
    return {
      filePath: outputFilePath,
      filename: path.basename(outputFilePath),
      contentType
    };
  } catch (error) {
    console.error('Error saving data URI to file:', error);
    throw error;
  }
};

// Upload route
router.post('/', protect, (req, res) => {
  console.log('Upload route hit');
  console.log('Request content type:', req.headers['content-type']);
  
  // Check if this is a data URI upload disguised as regular upload
  if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
    console.log('Detected JSON upload, checking for data URI');
    if (req.body && req.body.dataUri) {
      // Forward to the data URI endpoint
      console.log('Found data URI in JSON request, redirecting to data-uri endpoint');
      return handleDataUriUpload(req, res);
    }
  }
  
  // Normal file upload with multer
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      console.error('Multer error during upload:', err);
      return res.status(400).json({
        message: err.message || 'Error uploading file. Please try again.'
      });
    } else if (err) {
      // An unknown error occurred when uploading
      console.error('Unknown error during upload:', err);
      return res.status(400).json({
        message: err.message || 'Error uploading file. Please try again.'
      });
    }

    // Everything went fine with multer, but check if we have a file
    if (!req.file) {
      console.error('No file in request');
      // If there's no file, but we have a data URI in the request, use that instead
      if (req.body && req.body.dataUri) {
        console.log('Using data URI from request body instead');
        return handleDataUriUpload(req, res);
      }
      
      // Try to read from the raw body if it's a JSON request
      if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        try {
          const jsonBody = req.body;
          if (jsonBody && jsonBody.dataUri) {
            console.log('Found data URI in JSON body');
            req.body.dataUri = jsonBody.dataUri;
            return handleDataUriUpload(req, res);
          }
        } catch (jsonErr) {
          console.error('Error parsing JSON:', jsonErr);
        }
      }
      
      return res.status(400).json({ message: 'No image file provided' });
    }

    try {
      console.log('Processing uploaded file:', req.file);
      const fileName = req.file.filename;
      const filePath = req.file.path;
      
      // Create optimized version of the uploaded file
      const optimizedFileName = `opt-${fileName}`;
      const optimizedFilePath = path.join(publicUploadsDir, optimizedFileName);
      
      try {
        // Optimize the uploaded image
        await optimizeImage(filePath, optimizedFilePath, req.file.mimetype);
        
        // Remove original file to save space
        fs.unlinkSync(filePath);
        
        // Update file info to use optimized version
        const fileSize = fs.statSync(optimizedFilePath).size;
        
        // Generate URLs for the image
        const publicUrl = `${req.protocol}://${req.get('host')}/public/uploads/${optimizedFileName}`;
        const apiUrl = `${req.protocol}://${req.get('host')}/api/products/image/file/${optimizedFileName}`;
        
        console.log(`Optimized file saved to: ${optimizedFilePath}`);
        
        // Store metadata in MongoDB
        const imageDoc = new ImageStorage({
          filename: optimizedFileName,
          filePath: optimizedFilePath,
          contentType: req.file.mimetype || 'application/octet-stream',
          storageType: fileSize > FILE_SIZE_THRESHOLD ? 'filesystem' : 'database',
          user: req.user._id
        });
        
        // For files smaller than threshold, also store the binary data
        if (fileSize <= FILE_SIZE_THRESHOLD) {
          try {
            // Read file into memory
            const fileData = fs.readFileSync(optimizedFilePath);
            imageDoc.data = fileData;
            console.log(`Small file (${fileSize} bytes) also stored in database with ID: ${imageDoc._id}`);
          } catch (fileError) {
            console.error('Error reading file for database storage:', fileError);
            // Continue without storing binary data - we'll still have the file on disk
          }
        } else {
          console.log(`Large file (${fileSize} bytes) stored in filesystem only: ${optimizedFilePath}`);
        }
        
        // Save the document
        await imageDoc.save();
        
        // Return consistent data structure
        const imageData = {
          filename: optimizedFileName,
          contentType: req.file.mimetype || 'application/octet-stream',
          storageType: fileSize > FILE_SIZE_THRESHOLD ? 'filesystem' : 'database',
          url: apiUrl, // Always use the API endpoint for consistent access
          publicUrl: publicUrl
        };
        
        console.log('File successfully processed and stored');
        console.log('Image URLs:', { api: apiUrl, public: publicUrl });
        
        // Always return a consistent response format with url property
        res.json({
          message: 'Image uploaded and optimized successfully',
          imageData: imageData,
          url: apiUrl // Include url at the top level for consistent access
        });
      } catch (optimizationError) {
        console.error('Error optimizing image:', optimizationError);
        
        // Fall back to using the original unoptimized file
        const fileSize = fs.statSync(filePath).size;
        
        // Generate URLs for the image using original file
        const publicUrl = `${req.protocol}://${req.get('host')}/public/uploads/${fileName}`;
        const apiUrl = `${req.protocol}://${req.get('host')}/api/products/image/file/${fileName}`;
        
        const imageDoc = new ImageStorage({
          filename: fileName,
          filePath: filePath,
          contentType: req.file.mimetype || 'application/octet-stream',
          storageType: 'filesystem',
          user: req.user._id
        });
        
        await imageDoc.save();
        
        res.json({
          message: 'Image uploaded successfully (without optimization)',
          imageData: {
            filename: fileName,
            contentType: req.file.mimetype,
            url: apiUrl,
            publicUrl: publicUrl
          },
          url: apiUrl
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Error processing uploaded image' });
    }
  });
});

// Helper function to handle data URI uploads
const handleDataUriUpload = async (req, res) => {
  console.log('Data URI upload handler called');
  
  try {
    // Check if we have a data URI in the request
    if (!req.body || !req.body.dataUri) {
      return res.status(400).json({ message: 'No data URI provided' });
    }
    
    const dataUri = req.body.dataUri;
    
    // Validate it's actually a data URI
    if (!dataUri.startsWith('data:')) {
      return res.status(400).json({ message: 'Invalid data URI format' });
    }
    
    console.log('Received valid data URI, length:', dataUri.length);
    
    try {
      // Generate a unique filename
      const uniqueFilename = `datauri-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      
      // Save and optimize the data URI
      const fileInfo = await saveDataUriToFile(dataUri, uniqueFilename);
      
      // Generate URLs for the image
      const fileName = fileInfo.filename;
      const filePath = fileInfo.filePath;
      const publicUrl = `${req.protocol}://${req.get('host')}/public/uploads/${fileName}`;
      const apiUrl = `${req.protocol}://${req.get('host')}/api/products/image/file/${fileName}`;
      
      // Create image storage document
      const imageDoc = new ImageStorage({
        filename: fileName,
        filePath: filePath,
        contentType: fileInfo.contentType,
        storageType: 'filesystem',
        user: req.user._id
      });
      
      await imageDoc.save();
      
      // Return success response
      return res.json({
        message: 'Data URI optimized and saved as file',
        url: apiUrl,
        publicUrl: publicUrl
      });
    } catch (processingError) {
      console.error('Error processing data URI:', processingError);
      
      // Fall back to returning the original data URI
      console.log('Falling back to passing data URI directly');
      return res.json({
        message: 'Data URI accepted (unoptimized)',
        url: dataUri,
        isDataUri: true
      });
    }
  } catch (error) {
    console.error('Error processing data URI:', error);
    return res.status(500).json({ message: 'Error processing data URI' });
  }
};

// Route for handling data URIs directly
router.post('/data-uri', protect, handleDataUriUpload);

export default router; 