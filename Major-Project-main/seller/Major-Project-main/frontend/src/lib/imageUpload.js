import axios from 'axios';

// Constants for local storage
const LOCAL_IMAGES_KEY = 'product_images_local_storage';
const LOCAL_URL_PREFIX = 'local://';

/**
 * Store an image locally in browser storage
 * @param {string} dataUrl - Data URL of the image
 * @returns {string} - Local storage URL reference
 */
export const storeLocalImage = (dataUrl) => {
  try {
    if (!dataUrl) {
      console.error('No data URL provided to storeLocalImage');
      return null;
    }

    // Generate a unique ID for the image
    const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const fullImageId = `${LOCAL_URL_PREFIX}${imageId}`;
    
    // Get existing images from localStorage or initialize empty object
    let storedImages = {};
    try {
      const existingData = localStorage.getItem(LOCAL_IMAGES_KEY);
      if (existingData) {
        storedImages = JSON.parse(existingData);
      }
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      // Continue with empty object if there's an error
    }
    
    // Add the new image
    storedImages[imageId] = dataUrl;
    
    // Save back to localStorage
    try {
      localStorage.setItem(LOCAL_IMAGES_KEY, JSON.stringify(storedImages));
      console.log('Image saved to localStorage with ID:', imageId);
    } catch (e) {
      console.error('Error writing to localStorage:', e);
      // Local storage might be full - try to clear some old images
      const keysToKeep = Object.keys(storedImages).slice(-10); // Keep only the last 10 images
      const reducedImages = {};
      keysToKeep.forEach(key => {
        reducedImages[key] = storedImages[key];
      });
      
      try {
        localStorage.setItem(LOCAL_IMAGES_KEY, JSON.stringify(reducedImages));
        console.log('Reduced localStorage usage and saved image');
      } catch (innerError) {
        console.error('Failed to save even with reduced storage:', innerError);
        return dataUrl; // Return the raw data URL as fallback
      }
    }
    
    // Return the reference URL
    return fullImageId;
  } catch (error) {
    console.error('Error storing image locally:', error);
    return dataUrl; // Return the raw data URL as fallback
  }
};

/**
 * Retrieve a locally stored image
 * @param {string} imageUrl - Local image reference URL
 * @returns {string|null} - Data URL of the image or null if not found
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Check if it's a local image
  if (imageUrl.startsWith(LOCAL_URL_PREFIX)) {
    try {
      const imageId = imageUrl.replace(LOCAL_URL_PREFIX, '');
      const storedData = localStorage.getItem(LOCAL_IMAGES_KEY);
      
      if (storedData) {
        const storedImages = JSON.parse(storedData);
        if (storedImages[imageId]) {
          return storedImages[imageId];
        } else {
          console.error('Image ID not found in local storage:', imageId);
        }
      } else {
        console.error('No images found in local storage');
      }
    } catch (error) {
      console.error('Error retrieving local image:', error);
    }
    
    // If the image is not found in localStorage, check if the URL is already a data URL
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    
    return null;
  }
  
  // If the image is already a data URL, return it
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // If not a local image or data URL, return as is
  return imageUrl;
};

/**
 * Validate an image file
 * @param {File} file - The file to validate
 * @returns {Object} - { valid: boolean, error: string | null }
 */
export const validateImage = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Only JPG and PNG images are allowed.'
    };
  }
  
  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File size too large. Maximum size is 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
  }
  
  return { valid: true, error: null };
};

/**
 * Create an image preview as a data URL
 * @param {File} file - The image file
 * @returns {Promise<string>} - Promise resolving to data URL
 */
export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Mock the upload process but use local storage
 * This version doesn't attempt to contact the backend at all
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<string>} - Promise resolving to local image URL
 */
export const uploadImage = async (file, onProgress = null) => {
  // Validate the file
  const validation = validateImage(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  try {
    // Simulate upload progress
    if (onProgress) {
      for (let i = 0; i <= 100; i += 10) {
        onProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    // Convert file to data URL
    const dataUrl = await createImagePreview(file);
    
    // Store locally
    const localUrl = storeLocalImage(dataUrl);
    if (!localUrl) {
      throw new Error('Failed to store image locally');
    }
    
    return localUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error;
  }
};

/**
 * Safely stores an image either remotely (if possible) or locally (as fallback)
 * @param {File} file - The image file to store
 * @param {Function} onProgress - Progress callback for upload
 * @param {string} token - Auth token
 * @param {boolean} forceLocal - Force using local storage even if remote is available
 * @returns {Promise<{url: string, isLocal: boolean}>} - The stored image URL and whether it's local
 */
export const storeImage = async (file, onProgress = null, token = null, forceLocal = false) => {
  try {
    // Create a preview regardless of storage method
    const dataUrl = await createImagePreview(file);
    
    // If forceLocal is true, skip remote upload attempt
    if (forceLocal) {
      const localUrl = storeLocalImage(dataUrl);
      return { url: localUrl, isLocal: true };
    }
    
    // Try remote upload first
    try {
      const remoteUrl = await uploadImage(file, onProgress);
      return { url: remoteUrl, isLocal: false };
    } catch (uploadError) {
      console.log('Remote upload failed, falling back to local storage:', uploadError);
      // If remote fails, store locally
      const localUrl = storeLocalImage(dataUrl);
      return { url: localUrl, isLocal: true };
    }
  } catch (error) {
    console.error('Error in storeImage:', error);
    throw error;
  }
}; 