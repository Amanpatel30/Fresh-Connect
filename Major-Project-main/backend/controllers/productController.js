import Product from '../models/Product.js';
import catchAsync from '../utils/catchAsync.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define Image Storage schema here to avoid circular references
let ImageStorage;
try {
  ImageStorage = mongoose.model('ImageStorage');
} catch (err) {
  // Define the schema if it doesn't exist
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
  ImageStorage = mongoose.model('ImageStorage', ImageStorageSchema);
}

// Get all products for a seller
export const getProducts = catchAsync(async (req, res) => {
  const products = await Product.find({ seller: req.user._id }).select('-image.data');
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: products
  });
});

// Get a single product
export const getProduct = catchAsync(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    seller: req.user._id
  }).select('-image.data');

  if (!product) {
    return res.status(404).json({
      status: 'fail',
      message: 'Product not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: product
  });
});

// Create a new product
export const createProduct = catchAsync(async (req, res) => {
  const newProduct = await Product.create({
    ...req.body,
    seller: req.user._id
  });

  // Don't send image binary data in response
  const productResponse = newProduct.toObject();
  if (productResponse.image && productResponse.image.data) {
    productResponse.image.data = undefined;
  }

  res.status(201).json({
    status: 'success',
    data: productResponse
  });
});

// Update a product
export const updateProduct = catchAsync(async (req, res) => {
  const product = await Product.findOneAndUpdate(
    {
      _id: req.params.id,
      seller: req.user._id
    },
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).select('-image.data');

  if (!product) {
    return res.status(404).json({
      status: 'fail',
      message: 'Product not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: product
  });
});

// Delete a product
export const deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    seller: req.user._id
  });

  if (!product) {
    return res.status(404).json({
      status: 'fail',
      message: 'Product not found'
    });
  }

  // If product has an image stored in filesystem, delete it
  if (product.image && product.image.storageType === 'filesystem' && product.image.filePath) {
    try {
      fs.unlinkSync(product.image.filePath);
      console.log(`Deleted file: ${product.image.filePath}`);
    } catch (err) {
      console.error(`Error deleting file: ${err.message}`);
    }
  }

  await Product.findByIdAndDelete(product._id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Add a review to a product
export const addProductReview = catchAsync(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      status: 'fail',
      message: 'Product not found'
    });
  }

  // Check if user has already reviewed
  const alreadyReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    return res.status(400).json({
      status: 'fail',
      message: 'Product already reviewed'
    });
  }

  const review = {
    user: req.user._id,
    rating: Number(rating),
    comment
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save();

  res.status(201).json({
    status: 'success',
    message: 'Review added'
  });
});

// Get product image - serves images from database or filesystem
export const getProductImage = catchAsync(async (req, res) => {
  try {
    // Find product by ID
    const product = await Product.findById(req.params.id);
    if (!product || !product.image) {
      return res.status(404).send('Image not found');
    }
    
    // Check if content type exists and is valid, use a default if not
    let contentType = 'application/octet-stream'; // Default content type
    if (product.image.contentType && typeof product.image.contentType === 'string') {
      contentType = product.image.contentType;
    }
    
    // Set content type for the response
    res.set('Content-Type', contentType);
    
    // Set CORS headers to allow cross-origin requests
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    // FILESYSTEM PRIORITY STRATEGY:
    // First check if image exists in filesystem regardless of storage type
    if (product.image.filePath) {
      const filePath = path.resolve(product.image.filePath);
      
      // If file exists in filesystem, serve it
      if (fs.existsSync(filePath)) {
        console.log(`Serving image for product ${product._id} from filesystem: ${filePath}`);
        return fs.createReadStream(filePath).pipe(res);
      } else {
        console.log(`File path exists but file not found for product ${product._id}: ${filePath}`);
        // Continue to database check if file not found
      }
    }
    
    // DATABASE FALLBACK:
    // If not found in filesystem or no filePath, check database
    if (product.image.data) {
      console.log(`Serving image for product ${product._id} from database`);
      return res.send(product.image.data);
    }
    
    // If we reach here, image is not available in either location
    return res.status(404).send('Image not found in filesystem or database');
    
  } catch (error) {
    console.error('Error retrieving image:', error);
    return res.status(500).send('Error retrieving image');
  }
});

// Get product image by filename - serves images from filesystem or falls back to database
export const getProductImageByFilename = catchAsync(async (req, res) => {
  try {
    const filename = req.params.filename;
    console.log(`\n🔍 IMAGE REQUEST: ${filename}`);
    
    // First try to find the image in the filesystem
    const uploadsDir = path.join(__dirname, '../uploads');
    const filePath = path.join(uploadsDir, filename);
    
    // Check if file exists in the filesystem
    if (fs.existsSync(filePath)) {
      console.log('=================================================');
      console.log(`✅ IMAGE FOUND: FILESYSTEM`);
      console.log(`📍 LOCATION: ${filePath}`);
      console.log('=================================================\n');
      
      // Determine content type based on file extension
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.gif') contentType = 'image/gif';
      
      // Set content type and serve file
      res.set('Content-Type', contentType);
      return fs.createReadStream(filePath).pipe(res);
    }
    
    // If not found in filesystem, try to find in database
    console.log('❌ File not found in filesystem, checking database models');
    
    // First check the ImageStorage model (our new approach)
    const imageDoc = await ImageStorage.findOne({
      filename: filename
    });
    
    if (imageDoc) {
      console.log('=================================================');
      console.log(`✅ IMAGE FOUND: ImageStorage MODEL`);
      console.log(`🆔 DOCUMENT ID: ${imageDoc._id}`);
      
      // If it's stored in the filesystem, serve from there
      if (imageDoc.storageType === 'filesystem' && imageDoc.filePath && fs.existsSync(imageDoc.filePath)) {
        console.log(`📍 LOCATION: ${imageDoc.filePath} (FILESYSTEM REFERENCE)`);
        console.log('=================================================\n');
        res.set('Content-Type', imageDoc.contentType || 'application/octet-stream');
        return fs.createReadStream(imageDoc.filePath).pipe(res);
      }
      
      // If it has binary data, serve that
      if (imageDoc.data) {
        console.log(`📦 STORAGE: DATABASE (BINARY DATA)`);
        console.log('=================================================\n');
        res.set('Content-Type', imageDoc.contentType || 'application/octet-stream');
        return res.send(imageDoc.data);
      }
    }
    
    // Fallback - look for a Product with this filename (backward compatibility)
    const product = await Product.findOne({
      'image.filename': filename
    });
    
    if (product && product.image && product.image.data) {
      console.log('=================================================');
      console.log(`✅ IMAGE FOUND: Product MODEL (LEGACY)`);
      console.log(`🆔 PRODUCT ID: ${product._id}`);
      console.log(`📦 STORAGE: DATABASE (BINARY DATA)`);
      console.log('=================================================\n');
      let contentType = product.image.contentType || 'application/octet-stream';
      res.set('Content-Type', contentType);
      return res.send(product.image.data);
    }
    
    // If not found by exact match, try to find by pattern matching
    if (!product) {
      const productByPattern = await Product.findOne({
        $or: [
          { 'image.filePath': { $regex: filename, $options: 'i' } },
          { 'image.filename': { $regex: filename, $options: 'i' } }
        ]
      });
      
      if (productByPattern && productByPattern.image && productByPattern.image.data) {
        console.log(`Found product with pattern matching: ${productByPattern._id}`);
        let contentType = productByPattern.image.contentType || 'application/octet-stream';
        res.set('Content-Type', contentType);
        return res.send(productByPattern.image.data);
      }
    }
    
    // If still not found, we need to handle a special case for filenames
    // generated by our upload middleware (they have format: image-timestamp-random.ext)
    const imageIdMatch = filename.match(/^image-(\d+)-(\d+)(.*)/);
    if (imageIdMatch) {
      // This is a generated filename from our upload middleware
      console.log('Handling generated filename pattern');
      
      // Try to find in ImageStorage first using regex
      const imageByPattern = await ImageStorage.findOne({
        filename: { $regex: imageIdMatch[1], $options: 'i' }
      });
      
      if (imageByPattern) {
        console.log(`Found image in ImageStorage with timestamp pattern: ${imageByPattern._id}`);
        if (imageByPattern.data) {
          res.set('Content-Type', imageByPattern.contentType || 'application/octet-stream');
          return res.send(imageByPattern.data);
        }
      }
      
      // Then try finding in Product model
      const allProducts = await Product.find({});
      for (const prod of allProducts) {
        if (prod.image && prod.image.filename && prod.image.filename.includes(imageIdMatch[1])) {
          console.log(`Found product with timestamp match: ${prod._id}`);
          if (prod.image.data) {
            let contentType = prod.image.contentType || 'application/octet-stream';
            res.set('Content-Type', contentType);
            return res.send(prod.image.data);
          }
        }
      }
    }
    
    // If we reach here, the image wasn't found
    console.log('=================================================');
    console.log(`❌ IMAGE NOT FOUND: ${filename}`);
    console.log('Checked filesystem, ImageStorage, and Product models');
    console.log('=================================================\n');
    return res.status(404).send('Image not found');
  } catch (error) {
    console.error('Error retrieving image by filename:', error);
    return res.status(500).send('Error retrieving image');
  }
}); 