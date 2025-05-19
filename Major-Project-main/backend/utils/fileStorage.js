import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set uploads directory
const uploadsDir = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Generate a unique filename using crypto instead of uuid
 * @param {String} originalName - Original file name
 * @returns {String} Unique filename
 */
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  const safeName = path.basename(originalName, extension).replace(/\s+/g, '-');
  
  return `${safeName}-${timestamp}-${randomString}${extension}`;
};

/**
 * Upload file to local storage
 * @param {Object} file - File object from request
 * @param {String} subPath - Sub-path for file storage
 * @returns {Promise<Object>} File information including URL and key
 */
export const uploadFileToStorage = async (file, subPath = '') => {
  return new Promise((resolve, reject) => {
    try {
      // Create unique filename
      const uniqueFilename = generateUniqueFilename(file.name);
      
      // Create full path
      const fullPath = path.join(uploadsDir, subPath);
      const filePath = path.join(fullPath, uniqueFilename);
      
      // Ensure directory exists
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      
      // Move file to uploads directory
      file.mv(filePath, (err) => {
        if (err) {
          return reject(err);
        }
        
        // Generate relative URL for file
        const relativePath = path.join(subPath, uniqueFilename).replace(/\\/g, '/');
        
        resolve({
          url: `/uploads/${relativePath}`,
          key: relativePath
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Delete file from local storage
 * @param {String} key - File key (relative path)
 * @returns {Promise<Boolean>} Success status
 */
export const deleteFileFromStorage = async (key) => {
  return new Promise((resolve, reject) => {
    try {
      const filePath = path.join(uploadsDir, key);
      
      // Check if file exists
      if (fs.existsSync(filePath)) {
        // Delete file
        fs.unlinkSync(filePath);
      }
      
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
}; 