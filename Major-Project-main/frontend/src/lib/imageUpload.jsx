import axios from 'axios';

// Validate image before upload
export const validateImage = (file) => {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  // Check if file is an image
  if (!file.type.match('image.*')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: `Image size exceeds 10MB (${(file.size / (1024 * 1024)).toFixed(2)}MB)` };
  }

  return { valid: true };
};

// Create a store for local image URLs when backend is unavailable
const localImageStore = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Error accessing localStorage:', e);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Error writing to localStorage:', e);
    }
  },
  getAllImageUrls: () => {
    try {
      const urls = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('local_image_')) {
          urls.push(localStorage.getItem(key));
        }
      }
      return urls;
    } catch (e) {
      console.error('Error reading localStorage:', e);
      return [];
    }
  },
  // Save blob URL references to maintain them across page refreshes
  saveBlobReference: (blobUrl, imageInfo) => {
    try {
      // Store a reference to this blob URL with a timestamp
      const references = JSON.parse(localStorage.getItem('blob_url_references') || '{}');
      
      // Add this reference
      references[blobUrl] = {
        created: Date.now(),
        ...imageInfo
      };
      
      localStorage.setItem('blob_url_references', JSON.stringify(references));
    } catch (e) {
      console.error('Error saving blob reference:', e);
    }
  }
};

// Upload image to server with fallback for offline use
export const uploadImage = async (file) => {
  console.log("Starting image upload process", file.name, file.size);
  
  try {
    // Validate file before upload
    const validation = validateImage(file);
    if (!validation.valid) {
      console.error("Image validation failed:", validation.error);
      // Create a simpler error data URL as fallback
      return { 
        url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23f8d7da"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" text-anchor="middle" fill="%23721c24"%3EInvalid Image%3C/text%3E%3C/svg%3E',
        isError: true,
        error: validation.error
      };
    }
    
    // Reduce the image resolution if it's very large to improve performance
    let processedFile = file;
    if (file.size > 1024 * 1024) { // If file is larger than 1MB
      console.log("Large image detected, will try to process before upload");
      try {
        processedFile = await resizeImageIfNeeded(file);
        console.log(`Resized image from ${file.size} to ${processedFile.size} bytes`);
      } catch (resizeError) {
        console.warn("Could not resize image:", resizeError);
        // Continue with original file
      }
    }
    
    // Always create a data URL as a fallback
    const dataUrl = await createDataURLFast(processedFile);
    
    // Check if user is authenticated for server upload
    const token = localStorage.getItem('token');
    if (!token) {
      console.log("No authentication token found, using data URL only");
      return { url: dataUrl };
    }
    
    // First attempt: Try server upload
    try {
      console.log("Attempting server upload");
      const formData = new FormData();
      formData.append('image', processedFile, processedFile.name);
      
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://https://fresh-connect-backend.onrender.com'}/api/upload`;
      
      const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      },
        // Use a longer timeout for large files
        timeout: processedFile.size > 2 * 1024 * 1024 ? 30000 : 15001 
    });
    
    if (!response.ok) {
        throw new Error(`Server upload failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
      console.log("Server upload succeeded:", result);
      
      if (result.url) {
        return { url: result.url };
      }
      throw new Error('No URL in server response');
    } catch (serverError) {
      console.warn("Server upload failed, using data URI instead:", serverError);
      
      // Skip the data URI upload endpoint and just return the data URL directly
      // This prevents further errors when the endpoint isn't working
      return { url: dataUrl };
    }
  } catch (error) {
    console.error("Error in upload process:", error);
    return { 
      url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23f8d7da"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" text-anchor="middle" fill="%23721c24"%3EError: ' + (error.message || 'Unknown') + '%3C/text%3E%3C/svg%3E',
      isError: true,
      error: error.message
    };
  }
};

// Helper function to create a data URL more efficiently
const createDataURLFast = (file) => {
  return new Promise((resolve, reject) => {
    // For very large files, create a simplified placeholder instead
    if (file.size > 8 * 1024 * 1024) { // 8MB
      console.warn("File is too large for data URL, using placeholder");
      resolve('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" text-anchor="middle" fill="%23666"%3EImage Too Large%3C/text%3E%3C/svg%3E');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to create data URL"));
    reader.readAsDataURL(file);
  });
};

// Helper function to resize an image if it's too large
const resizeImageIfNeeded = (file) => {
  return new Promise((resolve, reject) => {
    // Skip if not an image or if svg
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      resolve(file);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions if needed
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = Math.round(height * (MAX_WIDTH / width));
            width = MAX_WIDTH;
          } else {
            width = Math.round(width * (MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
          
          // Create canvas and resize
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with reduced quality
          canvas.toBlob((blob) => {
            if (!blob) {
              console.warn("Could not create blob from canvas");
              resolve(file); // Use original as fallback
              return;
            }
            
            // Create a new file from the blob
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            
            console.log(`Resized image from ${file.size} to ${resizedFile.size} bytes`);
            resolve(resizedFile);
          }, file.type, 0.85); // 85% quality
        } else {
          // No resize needed
          resolve(file);
        }
      };
      
      img.onerror = () => {
        console.warn("Error loading image for resize");
        resolve(file);
      };
      
      img.src = event.target.result;
    };
    
    reader.onerror = (error) => {
      console.warn("Error reading file for resize:", error);
      resolve(file);
    };
    
    reader.readAsDataURL(file);
  });
};

// Helper function to test if URL is accessible
const testImageUrl = async (url) => {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string') {
      resolve(false);
      return;
    }
    
    const img = new Image();
    const testTimeout = setTimeout(() => {
      console.log("URL access test timed out:", url);
      resolve(false);
    }, 3000);
    
    img.onload = () => {
      clearTimeout(testTimeout);
      console.log("URL access test succeeded:", url);
      resolve(true);
    };
    
    img.onerror = () => {
      clearTimeout(testTimeout);
      console.log("URL access test failed:", url);
      resolve(false);
    };
    
    img.src = url;
  });
};

// Fix blob URLs in app
export const fixBlobUrlReferences = () => {
  try {
    // Get all blob references in localStorage
    const blobRefs = localStorage.getItem('blob_url_references');
    if (!blobRefs) return;
    
    const references = JSON.parse(blobRefs);
    
    // Look for any listings in localStorage that might contain these blob URLs
    const FALLBACK_KEY = 'leftover_food_listings';
    const listingsJson = localStorage.getItem(FALLBACK_KEY);
    
    if (!listingsJson) return;
    
    let listings = JSON.parse(listingsJson);
    let anyChanges = false;
    
    // Fix any listings that might reference blob URLs incorrectly
    listings = listings.map(listing => {
      if (!listing.images || !Array.isArray(listing.images)) return listing;
      
      const fixedImages = listing.images.map(image => {
        // If it's already a blob URL, leave it as is
        if (typeof image === 'string' && image.startsWith('blob:')) {
          return image;
        }
        
        // Check if this URL has the wrong prefix issue
        if (typeof image === 'string' && image.includes('blob:http')) {
          // Extract the actual blob URL
          const match = image.match(/blob:http[^/]*\/\/[^/]+\/[a-zA-Z0-9-]+/);
          if (match) {
            anyChanges = true;
            console.log(`Fixed blob URL reference: ${image} -> ${match[0]}`);
            return match[0];
          }
        }
        
        return image;
      });
      
      if (JSON.stringify(fixedImages) !== JSON.stringify(listing.images)) {
        anyChanges = true;
        return { ...listing, images: fixedImages };
      }
      
      return listing;
    });
    
    // Save back to localStorage if any changes were made
    if (anyChanges) {
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(listings));
      console.log('Fixed blob URL references in localStorage');
    }
  } catch (e) {
    console.error('Error fixing blob URL references:', e);
  }
};

/**
 * Clean up a URL for storage (just return it as is, but with proper formatting)
 */
export const cleanBlobUrl = (url) => {
  // If it's not a string, return as is (might be object, null, etc.)
  if (typeof url !== 'string') {
    console.log('cleanBlobUrl: Not a string, returning as is', url);
    return url;
  }
  
  console.log('cleanBlobUrl: Processing URL:', url.substring(0, 50) + (url.length > 50 ? '...' : ''));
  
  // If it's already a data URL, return as is
  if (url.startsWith('data:')) {
    console.log('cleanBlobUrl: Data URL detected, returning unchanged');
    return url;
  }
  
  // If it's a blob URL, check for malformed prefixes
  if (url.startsWith('blob:')) {
    // Previously converted blob URLs might have a prefix that needs to be removed
    if (url.includes('blob:http')) {
      const match = url.match(/blob:http[^/]*\/\/[^/]+\/[a-zA-Z0-9-]+/);
      if (match) {
        console.log(`cleanBlobUrl: Cleaning up prefixed blob URL: ${url.substring(0, 30)}... -> ${match[0]}`);
        return match[0];
      }
    }
    console.log('cleanBlobUrl: Blob URL detected, returning unchanged');
    return url;
  }
  
  // Handle URLs with data: embedded incorrectly
  if (url.includes('data:image/') && !url.startsWith('data:')) {
    // Extract the data URL portion
    const match = url.match(/(data:image\/[^;]+;base64,[a-zA-Z0-9+/=]+)/);
    if (match) {
      console.log(`cleanBlobUrl: Extracted embedded data URL from: ${url.substring(0, 30)}...`);
      return match[1];
    }
  }
  
  // For API URLs or other URLs, return as is
  console.log('cleanBlobUrl: Regular URL, returning unchanged');
  return url;
};

// Helper function to revive blob URLs when the page reloads
// This can be called when the application starts to try to restore blob URLs
export const reviveBlobUrls = () => {
  try {
    // First, fix any bad references
    fixBlobUrlReferences();
    
    // Get all blob references
    const references = JSON.parse(localStorage.getItem('blob_url_references') || '{}');
    
    // Log the found references
    console.log('Found blob references:', Object.keys(references).length);
    
    // Unfortunately, blob URLs cannot be truly revived across page refreshes
    // We can only mark them as expired and handle this case in the UI
    Object.keys(references).forEach(blobUrl => {
      // Mark as expired
      references[blobUrl].expired = true;
    });
    
    // Save the updated references
    localStorage.setItem('blob_url_references', JSON.stringify(references));
    
    // Return the list of expired blob URLs that need handling
    return Object.keys(references).filter(url => references[url].expired);
  } catch (e) {
    console.error('Error reviving blob URLs:', e);
    return [];
  }
};

// Check if a URL is an expired blob URL
export const isExpiredBlobUrl = (url) => {
  if (!url || !url.startsWith('blob:')) return false;
  
  try {
    const references = JSON.parse(localStorage.getItem('blob_url_references') || '{}');
    return references[url]?.expired === true;
  } catch (e) {
    console.error('Error checking blob URL status:', e);
    return false;
  }
};

// Get all images (useful for offline mode)
export const getAllLocalImages = () => {
  return localImageStore.getAllImageUrls();
};

// Default export
export default {
  uploadImage,
  validateImage,
  getAllLocalImages,
  reviveBlobUrls,
  isExpiredBlobUrl
};

// Create a preview URL for an image file
export const createImagePreview = (file) => {
  if (!file) return null;
  return URL.createObjectURL(file);
};

// Store an image file to server and get a URL
export const storeImage = async (file) => {
  return uploadImage(file);
};

// Get a display URL for an image
export const getImageUrl = (imageData) => {
  // If it's already a string URL, return it
  if (typeof imageData === 'string') return imageData;
  
  // If it's an object with url property
  if (imageData && imageData.url) return imageData.url;
  
  // If it's null/undefined or doesn't have a URL
  return null;
};

// Store an image locally (in state) without uploading
export const storeLocalImage = (file) => {
  if (!file) return null;
  
  return {
    file,
    preview: URL.createObjectURL(file),
    name: file.name,
    size: file.size,
    type: file.type
  };
}; 