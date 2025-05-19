import axios from 'axios';

export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    // Get the authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication required');
    }

    console.log('⭐ Starting image upload...');
    
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL || 'http://localhost:5001'}/api/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    console.log('⭐ Upload response:', response.data);

    // Check if the response contains the URL in the expected structure
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    // Handle URL based on storage type
    let imageUrl;
    
    // The server returns the URL in imageData.url
    if (response.data.imageData && response.data.imageData.url) {
      imageUrl = response.data.imageData.url;
      console.log('⭐ Found URL in imageData.url:', imageUrl);
      
      // Log storage type for debugging
      if (response.data.imageData.storageType) {
        console.log(`Image stored using ${response.data.imageData.storageType} storage strategy`);
      }
    } else if (response.data.url) {
      // Fallback for direct url in response
      imageUrl = response.data.url;
      console.log('⭐ Found URL directly in response.url:', imageUrl);
    } else {
      console.error('⭐ No URL found in response:', response.data);
      throw new Error('No image URL found in server response');
    }
    
    // Ensure the URL is correctly formatted for our image component
    if (imageUrl) {
      // If URL contains a filename but doesn't use our file endpoint format
      if (imageUrl.includes('/api/products/image/') && !imageUrl.includes('/file/')) {
        const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
        const filename = imageUrl.split('/').pop();
        if (filename) {
          // Convert to proper file endpoint format
          console.log(`Converting URL format to file endpoint: ${filename}`);
          imageUrl = `${baseUrl}/api/products/image/file/${filename}`;
        }
      }
      
      // Ensure the URL is absolute
      if (!imageUrl.startsWith('http')) {
        const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
        imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }
      
      console.log('⭐ Final image URL:', imageUrl);
      
      // Return the URL directly, not as an object - this matches how LeftoverFood.jsx expects it
      return imageUrl;
    }
    
    throw new Error('Failed to process image URL');
  } catch (error) {
    console.error('Error uploading image:', error);
    if (error.response?.status === 413) {
      throw new Error('Image size too large. Please upload a smaller image.');
    } else if (error.response?.status === 404) {
      throw new Error('Upload service not available. Please try again later.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Upload timed out. Please try again.');
    } else {
      throw new Error('Failed to upload image. Please try again later.');
    }
  }
}; 