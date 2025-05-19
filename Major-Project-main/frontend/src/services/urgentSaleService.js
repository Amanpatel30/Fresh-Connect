import api from './api';

// Utility function to sanitize data before sending to API
const sanitizeData = (data) => {
  const sanitized = { ...data };
  
  // Ensure numeric fields are actually numbers
  ['price', 'discountedPrice', 'discount', 'quantity'].forEach(field => {
    if (sanitized[field] !== undefined) {
      // Convert to number and ensure it's not NaN
      sanitized[field] = Number(sanitized[field]);
      if (isNaN(sanitized[field])) {
        console.warn(`Invalid ${field} value:`, data[field]);
        sanitized[field] = 0; // Default to 0 for invalid numbers
      }
    }
  });
  
  return sanitized;
};

// Get all urgent sales with optional filters
export const getUrgentSales = async (filters = {}) => {
  // Define multiple endpoints to try in order of priority
  const endpoints = [
    '/api/seller/urgent-sales',  // Our primary endpoint - specific to seller
    '/seller/urgent-sales',      // Alternative without api prefix
    '/api/urgent-sales/seller',  // Alternative organization
    '/api/urgent-sales'          // Fallback general endpoint
  ];
  
  console.log('Attempting to fetch urgent sales data from database...');
  
  // Create query params
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
    
  const queryString = params.toString() ? `?${params.toString()}` : '';
  let lastError = null;
  
  // Try each endpoint in sequence
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying database endpoint: ${endpoint}${queryString}`);
      const response = await api.get(`${endpoint}${queryString}`);
      
      console.log(`Success fetching from database via endpoint: ${endpoint}`, response.data);
      
      // Process response based on its format
      if (response.data === null || response.data === undefined) {
        console.warn(`Endpoint ${endpoint} returned null/undefined data from database`);
        continue; // Try next endpoint
      }
      
      // If we got a response with a status and data, return the data directly
      if (response.data?.status === 'success' && response.data?.data) {
        return response.data;
      }
      
      // Otherwise just return the data
      return response.data;
    } catch (error) {
      console.warn(`Failed to fetch from database with endpoint: ${endpoint}`, error);
      lastError = error;
      // Continue to next endpoint
    }
  }
  
  // If we've tried all endpoints and none worked, throw the last error
  throw new Error(`Failed to fetch urgent sales from database: ${lastError?.message || 'Unknown error'}`);
};

// Get a single urgent sale by ID
export const getUrgentSale = async (id) => {
  try {
    const response = await api.get(`/api/seller/urgent-sales/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching urgent sale ${id}:`, error);
    throw error;
  }
};

// Create a new urgent sale
export const createUrgentSale = async (urgentSaleData) => {
  // Sanitize data before sending
  const sanitizedData = sanitizeData(urgentSaleData);
  console.log('Creating urgent sale in database with sanitized data:', sanitizedData);
  
  // Make sure we have a proper image
  if (sanitizedData.image && sanitizedData.image.length > 0) {
    console.log('Image is present in data, length:', sanitizedData.image.length);
    
    // If the image is a base64 data URL but very long, just log the beginning
    if (typeof sanitizedData.image === 'string' && sanitizedData.image.length > 100) {
      console.log('Image preview:', sanitizedData.image.substring(0, 100) + '...');
    }
  } else {
    console.warn('No image provided for urgent sale');
  }
  
  // List of endpoints to try, in order of preference
  const endpoints = [
    '/api/seller/urgent-sales',  // Try the direct API endpoint first
    '/seller/urgent-sales',      // Alternative without API prefix
    '/api/urgent-sales/seller',  // Alternative organization
    '/api/urgent-sales'          // Fallback general endpoint
  ];
  
  // Try each endpoint in order
  for (const endpoint of endpoints) {
    try {
      console.log(`Attempting to create urgent sale in database using endpoint: ${endpoint}`);
      const response = await api.post(endpoint, sanitizedData);
      console.log(`Success saving to database via ${endpoint}:`, response?.status, response?.statusText);
      console.log('Response data from database:', response?.data);
      
      // If we got a successful response but no data, create a default response
      if (!response.data) {
        console.warn('API returned a successful status but no data, creating fallback response');
        return {
          status: 'success',
          data: {
            ...sanitizedData,
            _id: `temp-${Date.now()}`,
            createdAt: new Date().toISOString()
          }
        };
      }
      
      return response.data;
    } catch (error) {
      console.warn(`Failed to save to database at ${endpoint}:`, error?.message || 'Unknown error');
      console.log('Error details:', error?.response?.data || error);
      // Continue to next endpoint
    }
  }
  
  // If all endpoints fail
  throw new Error('Could not create urgent sale in database. Please check your network connection and API configuration.');
};

// Update an existing urgent sale
export const updateUrgentSale = async (id, saleData) => {
  // Sanitize data before sending
  const sanitizedData = sanitizeData(saleData);
  console.log(`Updating urgent sale ${id} in database with sanitized data:`, sanitizedData);
  
  // List of endpoints to try, in order of preference
  const endpoints = [
    `/api/seller/urgent-sales/${id}`,
    `/seller/urgent-sales/${id}`,
    `/api/urgent-sales/seller/${id}`,
    `/api/urgent-sales/${id}`
  ];
  
  // Try each endpoint in order
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      console.log(`Attempting to update urgent sale in database using endpoint: ${endpoint}`);
      
      // Try both PATCH and PUT methods
      let response = null;
      try {
        // Try PATCH first (for partial updates)
        response = await api.patch(endpoint, sanitizedData);
      } catch (patchError) {
        console.warn(`PATCH failed, trying PUT: ${patchError.message}`);
        // Fall back to PUT if PATCH fails
        response = await api.put(endpoint, sanitizedData);
      }
      
      console.log(`Success updating in database via ${endpoint}:`, response?.status, response?.statusText);
      console.log('Response data from database:', response?.data);
      
      // Return the response data
      return response.data;
    } catch (error) {
      console.warn(`Failed to update in database at ${endpoint}:`, error?.message || 'Unknown error');
      console.log('Error details:', error?.response?.data || error);
      lastError = error;
      // Continue to next endpoint
    }
  }
  
  // If all endpoints fail
  throw lastError || new Error(`Failed to update urgent sale ${id} in database with all available endpoints`);
};

// Delete an urgent sale
export const deleteUrgentSale = async (id) => {
  // Define multiple endpoints to try
  const endpoints = [
    `/api/seller/urgent-sales/${id}`,
    `/seller/urgent-sales/${id}`,
    `/api/urgent-sales/seller/${id}`,
    `/api/urgent-sales/${id}`
  ];
  
  console.log(`Attempting to delete urgent sale ${id} from database...`);
  let lastError = null;
  
  // Try each endpoint in sequence
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying to delete from database at endpoint: ${endpoint}`);
      const response = await api.delete(`${endpoint}`);
      
      console.log(`Success deleting from database via endpoint: ${endpoint}`, response.data);
      return response.data;
    } catch (error) {
      console.warn(`Failed to delete from database with endpoint: ${endpoint}`, error);
      lastError = error;
      // Continue to next endpoint
    }
  }
  
  // If we've tried all endpoints and none worked, throw the last error
  throw lastError || new Error(`Failed to delete urgent sale ${id} from database with all available endpoints`);
};

// Get active urgent sales
export const getActiveUrgentSales = async () => {
  try {
    const now = new Date().toISOString();
    const response = await api.get(`/api/seller/urgent-sales?endDate[$gt]=${now}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching active urgent sales:', error);
    throw error;
  }
};

// Get expired urgent sales
export const getExpiredUrgentSales = async () => {
  try {
    const now = new Date().toISOString();
    const response = await api.get(`/api/seller/urgent-sales?endDate[$lt]=${now}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expired urgent sales:', error);
    throw error;
  }
};

// Toggle product status (active/inactive)
export const toggleStatus = async (id) => {
  if (!id) {
    throw new Error('Product ID is required to toggle status');
  }

  console.log(`Attempting to toggle status for product ${id}...`);
  
  // Define multiple endpoints to try in order of priority
  const endpoints = [
    `/api/seller/urgent-sales/${id}/status`,
    `/seller/urgent-sales/${id}/status`,
    `/api/urgent-sales/seller/${id}/status`,
    `/api/urgent-sales/${id}/status`
  ];
  
  let lastError = null;
  
  // Try each endpoint in sequence
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying to toggle status at endpoint: ${endpoint}`);
      const response = await api.patch(endpoint, {});
      
      console.log(`Successfully toggled status via endpoint: ${endpoint}`, response.data);
      return response.data;
    } catch (error) {
      console.warn(`Failed to toggle status with endpoint: ${endpoint}`, error);
      lastError = error;
      // Continue to next endpoint
    }
  }
  
  // If all endpoints fail, throw the last error
  throw lastError || new Error(`Failed to toggle status for product ${id} with all available endpoints`);
};

// Mark a product as sold
export const markAsSold = async (id, quantity = 1) => {
  // Define multiple endpoints to try
  const endpoints = [
    `/api/urgent-sales/${id}/sell`,
    `/urgent-sales/${id}/sell`,
    `/api/seller/urgent-sales/${id}/sell`
  ];
  
  console.log(`Attempting to mark product ${id} as sold, quantity: ${quantity}...`);
  let lastError = null;
  
  // Try each endpoint in sequence
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying to mark as sold using endpoint: ${endpoint}`);
      const response = await api.post(endpoint, { quantity });
      
      console.log(`Success marking as sold via endpoint: ${endpoint}`, response.data);
      return response.data;
    } catch (error) {
      console.warn(`Failed to mark as sold with endpoint: ${endpoint}`, error);
      lastError = error;
      // Continue to next endpoint
    }
  }
  
  // If we've tried all endpoints and none worked, throw the last error
  throw lastError || new Error(`Failed to mark product ${id} as sold with all available endpoints`);
};

export default {
  getUrgentSales,
  getUrgentSale,
  createUrgentSale,
  updateUrgentSale,
  deleteUrgentSale,
  getActiveUrgentSales,
  getExpiredUrgentSales,
  toggleStatus,
  markAsSold
}; 