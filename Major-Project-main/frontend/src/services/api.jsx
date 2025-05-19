import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: (import.meta.env.VITE_BASE_URL || 'http://https://fresh-connect-backend.onrender.com'),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000, // 30 seconds timeout - increased from 15s to prevent timeout issues
});

// Log the API configuration in development mode
if (import.meta.env.DEV) {
  console.log('API Configuration:', {
    baseURL: api.defaults.baseURL,
    timeout: api.defaults.timeout,
  });
}

// Log the base URL being used
console.log('API Base URL:', api.defaults.baseURL);

// Add these global variables at the top of the file after api initialization
// Cache to prevent duplicate requests for endpoints we know will fail
const FAILED_ENDPOINTS_CACHE = new Set();
// Map to store mock data for specific endpoints
const MOCK_DATA_MAP = new Map();
// Flag to track if we've initialized our mock data
let MOCK_DATA_INITIALIZED = false;
// Flag to control whether we use mock data or not
let USE_MOCK_DATA = false; // Set to false by default to prioritize real data fetching

// Initialize our mock data cache
function initializeMockData() {
  if (MOCK_DATA_INITIALIZED) return;
  
  // Add known endpoints that should return mock data
  MOCK_DATA_MAP.set('/api/hotels/verified', getMockHotelData());
  MOCK_DATA_MAP.set('/api/feedback', getMockFeedbackData());
  MOCK_DATA_MAP.set('/api/reviews', getMockFeedbackData());
  MOCK_DATA_MAP.set('/api/testimonials', getMockFeedbackData());
  MOCK_DATA_MAP.set('/api/ratings', getMockFeedbackData());
  MOCK_DATA_MAP.set('/api/urgent-sales', getMockUrgentSalesData());
  MOCK_DATA_MAP.set('/api/urgent-sales/public', getMockUrgentSalesData());
  MOCK_DATA_MAP.set('/api/sales/urgent', getMockUrgentSalesData());
  
  // Only load failed endpoints if we're using mock data
  if (USE_MOCK_DATA) {
    try {
      const savedFailedEndpoints = localStorage.getItem('failed_endpoints');
      if (savedFailedEndpoints) {
        const endpoints = JSON.parse(savedFailedEndpoints);
        endpoints.forEach(endpoint => FAILED_ENDPOINTS_CACHE.add(endpoint));
      }
    } catch (e) {
      console.log('Error loading failed endpoints from localStorage:', e);
    }
      } else {
    // Clear failed endpoints cache to ensure we try real API calls
    FAILED_ENDPOINTS_CACHE.clear();
    localStorage.removeItem('failed_endpoints');
  }
  
  MOCK_DATA_INITIALIZED = true;
}

// Initialize our mock data immediately
initializeMockData();

// Helper to check if an endpoint should be mocked
function shouldMockEndpoint(url) {
  // If mock data is disabled, don't mock anything
  if (!USE_MOCK_DATA) return false;
  
  if (!url) return false;
  
  // Check if this exact endpoint has failed before
  if (FAILED_ENDPOINTS_CACHE.has(url)) {
    return true;
  }
  
  // Check if this is a paginated version of a failed endpoint
  for (const endpoint of FAILED_ENDPOINTS_CACHE) {
    if (url.startsWith(endpoint + '?')) {
      return true;
    }
  }
  
  // Check known problematic endpoints - only if we're in mock mode
  if (USE_MOCK_DATA) {
    const problematicEndpoints = [
      '/api/hotels/verified',
      '/api/feedback',
      '/api/reviews',
      '/api/testimonials',
      '/api/ratings',
      '/api/urgent-sales',
      '/api/urgent-sales/public',
      '/api/sales/urgent'
    ];
    
    for (const endpoint of problematicEndpoints) {
      if (url === endpoint || url.startsWith(endpoint + '?')) {
        return true;
      }
    }
  }
  
  return false;
}

// Get the right mock data for an endpoint
function getMockDataForEndpoint(url) {
  if (!url) return null;
  
  // Check exact matches first
  if (MOCK_DATA_MAP.has(url)) {
    return MOCK_DATA_MAP.get(url);
  }
  
  // Check for base URLs
  for (const [endpoint, data] of MOCK_DATA_MAP.entries()) {
    if (url.startsWith(endpoint + '?')) {
      return data;
    }
  }
  
  // Specific checks for different API categories
  if (url.includes('/api/hotels') || url.includes('/api/restaurants')) {
    return getMockHotelData();
  } else if (url.includes('/api/feedback') || url.includes('/api/reviews')) {
    return getMockFeedbackData();
  } else if (url.includes('/api/urgent-sales') || url.includes('/api/sales')) {
    return getMockUrgentSalesData();
  }
  
  return null;
}

// REPLACE the old request interceptor with this one
api.interceptors.request.use(
  (config) => {
    // Only intercept GET requests for mocking if mock mode is enabled
    if (config.method === 'get' && USE_MOCK_DATA) {
      const url = config.url;
      
      // If this endpoint should be mocked, don't make the API call at all
      if (shouldMockEndpoint(url)) {
        console.log(`🔄 Using cached mock data for endpoint: ${url}`);
        
        // Cancel the request and handle it locally
        const mockData = getMockDataForEndpoint(url);
        
        if (mockData) {
          // Create a new cancelled token source
          const source = axios.CancelToken.source();
          config.cancelToken = source.token;
          
          // Schedule the cancel to happen immediately
          setTimeout(() => {
            source.cancel({
              mockData,
              isMockData: true,
              url
            });
          }, 0);
        }
      }
    }
    
    // Add token for authenticated endpoints
    if (!config.url.includes('/login') && !config.url.includes('/register')) {
      const token = localStorage.getItem('token') || localStorage.getItem('userToken');
      
      if (token) {
        // Ensure we're using a properly formatted token
        const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        config.headers.Authorization = formattedToken;
      }
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// REPLACE the response interceptor with this enhanced version
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response [${response.status}]:`, response.config.url);
    }
    return response;
  },
  (error) => {
    // Handle cancelled requests with mock data
    if (axios.isCancel(error) && error.message && error.message.isMockData) {
      console.log(`🔶 Using mock data for: ${error.message.url}`);
      
      // Return a successful response with our mock data
      return Promise.resolve({
        data: error.message.mockData,
        status: 200,
        statusText: 'OK (Mocked)',
        headers: {},
        config: error.config
      });
    }
    
    // Check if we have config information to process this error
    if (!error.config || !error.config.url) {
      return Promise.reject(error);
    }
    
    const url = error.config.url;
    
    // For 404 errors on endpoints that could use mock data, cache them to avoid future requests
    if (error.response && error.response.status === 404) {
      if (USE_MOCK_DATA) {
        // Only store failed endpoints if mock mode is enabled
        FAILED_ENDPOINTS_CACHE.add(url);
        
        // Save to localStorage for persistence between sessions
        try {
          localStorage.setItem('failed_endpoints', 
            JSON.stringify(Array.from(FAILED_ENDPOINTS_CACHE)));
        } catch (e) {
          console.log('Error saving failed endpoints to localStorage:', e);
        }
      }
      
      // Return mock data if available and mock mode is enabled
      if (USE_MOCK_DATA) {
        const mockData = getMockDataForEndpoint(url);
        if (mockData) {
          console.log(`🔷 Returning mock data after 404 for: ${url}`);
          return Promise.resolve({
            data: mockData,
            status: 200,
            statusText: 'OK (Mocked after 404)',
            headers: {},
            config: error.config
          });
        }
      }
    }
    
    // Normal error handling for non-mockable endpoints
    if (error.response) {
      console.log(`🔴 API Error [${error.response.status}]: ${url}`);
    } else if (error.request) {
      console.log('🔴 No response from server');
    } else {
      console.log('🔴 Request setup error:', error.message);
    }
    
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      console.log('⛔ Authentication token expired or invalid');
      
      // Don't redirect if on public page
      const isPublicPage = window.location.pathname === '/' || 
                          window.location.pathname.includes('/public');
      
      if (!isPublicPage && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth functions
export const login = (credentials) => api.post('/api/auth/login', credentials);
export const register = (userData) => api.post('/api/auth/register', userData);
export const logout = () => api.post('/api/auth/logout');

// Hotel-specific auth functions
export const loginHotel = (credentials) => {
  console.log('Attempting to login with credentials:', { email: credentials.email, passwordLength: credentials.password?.length });
  return api.post('/api/hotels/login', credentials)
    .then(response => {
      console.log('Login successful:', response.data);
      // Store the token in localStorage for future requests
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Ensure hotel-specific properties are explicitly set in the response
        if (response.data) {
          // Make sure isHotel and role are properly set
          response.data.isHotel = true;
          response.data.role = 'hotel';
          response.data.hotelId = response.data._id;
        }
      }
      return response;
    })
    .catch(error => {
      console.error('Login failed:', error.response?.data || error.message);
      throw error;
    });
};

export const registerHotel = (data) => api.post('/api/hotels', data);
export const checkHotelEmail = (email) => api.post('/api/hotels/check-email', { email });

// Check authentication status
export const checkAuthStatus = async () => {
  console.log('🔍 Running checkAuthStatus function');
  
  // Get token and verify it exists
  const token = localStorage.getItem('token');
  
  console.log('🔍 checkAuthStatus token retrieved from localStorage:', token ? 'found' : 'not found');
  
  if (!token) {
    return { isValid: false, error: 'No token found' };
  }
  
  try {
    console.log('Trying auth check endpoint: /api/check-auth');
    const response = await api.get('/api/check-auth');
    console.log('Authentication check successful with /api/check-auth:', response.data);
    return { isValid: true, data: response.data };
  } catch (error) {
    console.error('Authentication check failed:', error.message);
    return { isValid: false, error: error.message };
  }
};

// Direct function to check auth status with explicit token handling
export const checkAuthStatusDirect = async () => {
  console.log('📊 Running direct auth check function');

  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('📊 No token available for auth check');
      return { isValid: false, error: 'No authentication token found' };
    }

    // Clean the token (remove Bearer prefix if present)
    const cleanToken = token.startsWith('Bearer ') ? token.split(' ')[1].trim() : token;
    
    // Create a direct axios instance for this request
    const authCheckInstance = axios.create({
      baseURL: import.meta.env.VITE_BASE_URL || 'http://https://fresh-connect-backend.onrender.com',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Explicitly set Authorization header with proper format
    const headers = {
      'Authorization': `Bearer ${cleanToken}`
    };

    // Make the direct request
    const response = await authCheckInstance.get('/api/check-auth', { 
      headers, 
      timeout: 10000 
    });
    
    if (response.status === 200) {
      console.log('📊 Auth check successful', response.data);
      return { isValid: true, data: response.data };
    } else {
      console.error('📊 Auth check failed with status:', response.status);
      return { 
        isValid: false, 
        status: response.status, 
        error: 'Authentication failed'
      };
    }
  } catch (error) {
    console.error('📊 Auth check error:', error.message);
    
    return { isValid: false, error: error.message };
  }
};

// Verification status API
export const getVerificationStatus = () => {
  console.log('Calling getVerificationStatus API');
  return api.get('/api/verification/status');
};

// Dashboard APIs
export const getDashboardStats = () => api.get('/api/dashboard/stats');
export const getRecentActivity = () => api.get('/api/dashboard/activity');
export const testApi = () => api.get('/api/test');

// Database initialization functions
export const checkDatabaseInitialized = () => api.get('/api/database/status');
export const initializeDatabase = () => api.post('/api/database/initialize');

// Purchase History APIs
export const getPurchaseHistory = (page = 1, limit = 10) => {
  console.log(`Calling getPurchaseHistory API: /api/purchases?page=${page}&limit=${limit}`);
  return api.get(`/api/purchases?page=${page}&limit=${limit}`);
};

export const getPurchaseDetails = (purchaseId) => {
  console.log(`Calling getPurchaseDetails API: /api/purchases/${purchaseId}`);
  return api.get(`/api/purchases/${purchaseId}`);
};

export const addPurchase = (purchaseData) => {
  console.log('Calling addPurchase API: /api/purchases', purchaseData);
  return api.post('/api/purchases', purchaseData);
};

// Analytics APIs
export const getSalesAnalytics = (period = 'month') => {
  console.log(`Fetching sales analytics with period: ${period}`);
  return api.get(`/api/analytics/sales?period=${period}`)
    .then(response => {
      console.log('Sales analytics API response:', response.data);
      return response;
    })
    .catch(error => {
      console.error('Error fetching sales analytics:', error);
      throw error;
  });
};

export const getCustomerAnalytics = () => {
  console.log('Fetching customer analytics');
  return api.get('/api/analytics/customers')
    .then(response => {
      console.log('Customer analytics API response:', response.data);
      return response;
    })
    .catch(error => {
      console.error('Error fetching customer analytics:', error);
      throw error;
  });
};

export const getInventoryAnalytics = () => {
  console.log('Fetching inventory analytics');
  return api.get('/api/analytics/inventory')
    .then(response => {
      console.log('Inventory analytics API response:', response.data);
      return response;
    })
    .catch(error => {
      console.error('Error fetching inventory analytics:', error);
      throw error;
  });
};

// Hotel APIs
export const getVerifiedHotels = async () => {
  console.log('Fetching verified hotels');
  try {
    // Try multiple endpoints in sequence without throwing errors
    const endpoints = [
      '/api/hotels/verified',
      '/api/hotels?verified=true',
      '/api/restaurants/verified',
      '/api/sellers/verified'
    ];
    
    // Try each endpoint silently
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const response = await api.get(endpoint);
        
        if (response && response.data) {
          console.log(`Found verified hotels via endpoint: ${endpoint}`);
          
          // Handle both array and object responses
          if (Array.isArray(response.data)) {
            return { data: response.data };
          } else if (response.data.data && Array.isArray(response.data.data)) {
            return { data: response.data.data };
            } else {
            return { data: response.data };
            }
          }
      } catch (endpointError) {
        // Suppress detailed error logging for 404s
        if (endpointError.response && endpointError.response.status === 404) {
          console.log(`Endpoint ${endpoint} not found, trying next option...`);
        } else {
          console.log(`Error with endpoint ${endpoint}:`, endpointError.message);
        }
        // Continue to next endpoint (no throw)
      }
    }
    
    // If all endpoints fail, return mock data
    console.log('All hotel endpoints failed, returning mock data');
    return {
      data: getMockHotelData()
    };
    
  } catch (error) {
    console.error('Unexpected error fetching verified hotels:', error);
    // Return mock data as a fallback
    return {
      data: getMockHotelData()
    };
  }
};

// Helper function to return consistent mock hotel data
function getMockHotelData() {
  return [
    {
      _id: 'mock-hotel-1',
      name: 'Green Farm Restaurant',
      description: 'Specializing in farm-to-table cuisine and organic ingredients',
      rating: 4.8,
      reviews: 230,
      coverImage: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&h=300&q=80',
      location: 'Downtown',
      verified: true
    },
    {
      _id: 'mock-hotel-2',
      name: 'Spice Garden',
      description: 'Authentic Indian cuisine with fresh ingredients',
      rating: 4.6,
      reviews: 185,
      coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=300&q=80',
      location: 'Uptown',
      verified: true
    },
    {
      _id: 'mock-hotel-3',
      name: 'Ocean Breeze',
      description: 'Fresh seafood restaurant with daily specials',
      rating: 4.9,
      reviews: 310,
      coverImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&h=300&q=80',
      location: 'Riverside',
      verified: true
    }
  ];
}

// Function to get urgent sales for the homepage
export const getUrgentSales = async (page = 1, limit = 50) => {
  console.log(`Fetching urgent sales: page=${page}, limit=${limit}`);
  try {
    // Try multiple endpoints in sequence
    const endpoints = [
      `/api/urgent-sales?page=${page}&limit=${limit}&allSellers=true`,
      `/api/urgent-sales/public?page=${page}&limit=${limit}&allSellers=true`,
      `/api/sales/urgent?page=${page}&limit=${limit}&allSellers=true`
    ];
    
    // Try each endpoint silently
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying urgent sales endpoint: ${endpoint}`);
        const response = await api.get(endpoint);
        
        if (response && response.data) {
          console.log(`Found urgent sales via endpoint: ${endpoint}`);
          return response;
        }
      } catch (endpointError) {
        // Suppress detailed error logging for 404s
        if (endpointError.response && endpointError.response.status === 404) {
          console.log(`Endpoint ${endpoint} not found, trying next option...`);
        } else {
          console.log(`Error with endpoint ${endpoint}:`, endpointError.message);
        }
        // Continue to next endpoint (no throw)
      }
    }
    
    // If all endpoints fail, return mock data
    console.log('All urgent sales endpoints failed, returning mock data');
    return {
      data: getMockUrgentSalesData()
    };
    
  } catch (error) {
    console.error('Unexpected error fetching urgent sales:', error);
    // Return mock data as a fallback
    return {
      data: getMockUrgentSalesData()
    };
  }
};

// Helper function to return consistent mock urgent sales data
function getMockUrgentSalesData() {
  return [
    {
      _id: 'mock-sale-1',
      name: 'Fresh Organic Vegetables Bundle',
      description: 'Bundle of organic vegetables including carrots, tomatoes, and lettuce. Must sell today!',
      originalPrice: 25.99,
      discountedPrice: 12.99,
      discount: 50,
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=200&q=80',
      seller: {
        name: 'Green Farm Restaurant',
        location: 'Downtown'
      },
      stock: 5,
      category: 'Vegetables'
    },
    {
      _id: 'mock-sale-2',
      name: 'Assorted Pastries Pack',
      description: 'Freshly baked pastries from this morning. Includes croissants, muffins, and danishes.',
      originalPrice: 18.99,
      discountedPrice: 9.49,
      discount: 50,
      expiryDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      image: 'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?w=300&h=200&q=80',
      seller: {
        name: 'Morning Bakery',
        location: 'Eastside'
      },
      stock: 8,
      category: 'Bakery'
    },
    {
      _id: 'mock-sale-3',
      name: 'Fruit Platter',
      description: 'Assorted seasonal fruits, cut and ready to serve.',
      originalPrice: 15.99,
      discountedPrice: 7.99,
      discount: 50,
      expiryDate: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
      image: 'https://images.unsplash.com/photo-1621796274929-fd792f242396?w=300&h=200&q=80',
      seller: {
        name: 'Fruit Emporium',
        location: 'Westside'
      },
      stock: 3,
      category: 'Fruits'
    }
  ];
}

// Function to get feedback for the homepage
export const getFeedback = async (page = 1, limit = 10) => {
  console.log('Fetching feedback');
  try {
    // Try main endpoints in sequence without throwing errors
    const endpoints = [
      `/api/feedback?page=${page}&limit=${limit}`,
      '/api/reviews',
      '/api/testimonials',
      '/api/ratings'
    ];
    
    // Try each endpoint silently
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying feedback endpoint: ${endpoint}`);
        const response = await api.get(endpoint);
        
        if (response && response.data) {
          console.log(`Found feedback data via endpoint: ${endpoint}`);
          // Handle both array and paginated object responses
          if (Array.isArray(response.data)) {
            return response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            return response.data.data;
          } else {
            return response.data;
          }
        }
      } catch (endpointError) {
        // Suppress detailed error logging for 404s
        if (endpointError.response && endpointError.response.status === 404) {
          console.log(`Endpoint ${endpoint} not found, trying next option...`);
        } else {
          console.log(`Error with endpoint ${endpoint}:`, endpointError.message);
        }
        // Continue to next endpoint (no throw)
      }
    }
    
    // If all endpoints fail, return mock data
    console.log('All feedback endpoints failed, returning mock data');
    return getMockFeedbackData();
    
  } catch (error) {
    // This catch should never be reached unless there's a critical error
    console.error('Unexpected error fetching feedback:', error);
    return getMockFeedbackData();
  }
};

// Helper function to return consistent mock feedback data
function getMockFeedbackData() {
  return [
    {
      _id: 'mock-feedback-1',
      user: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        role: 'Customer'
      },
      comment: 'The vegetables were incredibly fresh and the delivery was prompt. Will definitely order again!',
      rating: 5,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'mock-feedback-2',
      user: {
        name: 'Green Farm Cafe',
        email: 'contact@greenfarm.com',
        role: 'Restaurant'
      },
      comment: 'This platform has helped us reduce waste and connect with customers who appreciate our sustainable practices.',
      rating: 5,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'mock-feedback-3',
      user: {
        name: 'Michael Chen',
        email: 'michael@example.com',
        role: 'Customer'
      },
      comment: 'The urgent sales feature saved me money while getting high-quality food that would have otherwise gone to waste.',
      rating: 4,
      createdAt: new Date().toISOString()
    }
  ];
}

// Verification document APIs
export const getVerificationDocuments = () => {
  console.log('Calling getVerificationDocuments API');
  return api.get('/api/verification/documents');
};

export const applyForVerification = (verificationData) => {
  console.log('Calling applyForVerification API', verificationData);
  return api.post('/api/verification/apply', verificationData);
};

export const uploadVerificationDocument = (documentData) => {
  console.log('Calling uploadVerificationDocument API', documentData);
  return api.post('/api/verification/document', documentData);
};

export const deleteVerificationDocument = (documentId) => {
  console.log('Calling deleteVerificationDocument API', documentId);
  return api.delete(`/api/verification/document/${documentId}`);
};

export const cancelVerification = () => {
  console.log('Calling cancelVerification API');
  return api.delete('/api/verification/cancel');
};

// Leftover Food APIs
export const getLeftoverFood = async (page = 1, limit = 10) => {
  const token = localStorage.getItem('token');
  console.log(`Fetching leftover food: page=${page}, limit=${limit}`);
  return api.get(`/api/leftover-food?page=${page}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// Free Food Listings API for public users
export const getFreeFoodListings = async (page = 1, limit = 50, search = '', category = '') => {
  console.log(`Fetching free food listings: page=${page}, limit=${limit}, search=${search}, category=${category}`);
    
    let url = `/api/leftover-food?page=${page}&limit=${limit}`;
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    
    // Add all hotels flag to get data from all hotels
    url += '&allHotels=true';
    
  try {
    const response = await api.get(url);
    return response;
  } catch (error) {
    console.error('Error fetching free food listings:', error);
    throw error;
  }
};

// Function to delete leftover food item
export const deleteLeftoverFood = async (id) => {
  try {
    const response = await api.delete(`/api/leftover-food/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting leftover food:', error);
    throw error;
  }
};

// Function to get my leftover food listings
export const getMyLeftoverFood = async () => {
  try {
    const response = await api.get('/api/leftover-food/my-listings');
    return response.data;
  } catch (error) {
    console.error('Error fetching my leftover food:', error);
    throw error;
  }
};

// Function to add leftover food
export const addLeftoverFood = async (foodData) => {
  try {
    const response = await api.post('/api/leftover-food', foodData);
    return response.data;
  } catch (error) {
    console.error('Error adding leftover food:', error);
    throw error;
  }
};

// Function to update leftover food
export const updateLeftoverFood = async (id, foodData) => {
  try {
    const response = await api.put(`/api/leftover-food/${id}`, foodData);
    return response.data;
  } catch (error) {
    console.error('Error updating leftover food:', error);
    throw error;
  }
};

// Urgent Sales APIs
export const getMyUrgentSales = async () => {
  console.log('Fetching my urgent sales');
  try {
    const response = await api.get('/api/urgent-sales/my-listings');
      return response.data;
  } catch (error) {
    console.error('Error fetching my urgent sales:', error);
    return [];
  }
};

export const createUrgentSale = (saleData) => {
  console.log('Creating urgent sale with data:', saleData);
  
  // Format data for MongoDB schema
  const formattedData = {
    name: saleData.name.trim(),
    description: saleData.description.trim(),
    category: saleData.category,
    price: Number(parseFloat(saleData.originalPrice || saleData.price || 0)),
    originalPrice: Number(parseFloat(saleData.originalPrice || saleData.price || 0)),
    discountedPrice: Number(parseFloat(saleData.discountedPrice || 0)),
    discount: Math.round(((Number(parseFloat(saleData.originalPrice || saleData.price || 0)) - Number(parseFloat(saleData.discountedPrice || 0))) / Number(parseFloat(saleData.originalPrice || saleData.price || 0))) * 100),
    quantity: Number(parseInt(saleData.stock || saleData.quantity || 0)),
    stock: Number(parseInt(saleData.stock || saleData.quantity || 0)),
    unit: saleData.unit || 'piece',
    expiryDate: saleData.expiryDate,
    image: saleData.image,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return api.post('/api/urgent-sales', formattedData);
};

export const updateUrgentSaleWithProductHandling = (saleId, saleData) => {
  console.log(`Updating urgent sale ID: ${saleId}`);
  
  // Format data for MongoDB update
  const formattedData = {
    name: saleData.name.trim(),
    description: saleData.description.trim(),
    category: saleData.category,
    price: Number(parseFloat(saleData.originalPrice || saleData.price || 0)),
    originalPrice: Number(parseFloat(saleData.originalPrice || saleData.price || 0)),
    discountedPrice: Number(parseFloat(saleData.discountedPrice || 0)),
    discount: Math.round(((Number(parseFloat(saleData.originalPrice || saleData.price || 0)) - Number(parseFloat(saleData.discountedPrice || 0))) / Number(parseFloat(saleData.originalPrice || saleData.price || 0))) * 100),
    quantity: Number(parseInt(saleData.stock || saleData.quantity || 0)),
    stock: Number(parseInt(saleData.stock || saleData.quantity || 0)),
    unit: saleData.unit || 'piece',
    expiryDate: saleData.expiryDate,
    image: saleData.image,
    status: saleData.status || 'active',
    updatedAt: new Date().toISOString()
  };
  
  return api.put(`/api/urgent-sales/${saleId}`, formattedData);
};

// Delete urgent sale (permanent deletion)
export const deleteUrgentSale = (saleId) => {
  console.log(`Permanently deleting urgent sale ID: ${saleId}`);
  
  // Validate input
  if (!saleId) {
    console.error('Sale ID is required for deletion');
    return Promise.reject(new Error('Sale ID is required'));
  }
  
  return api.delete(`/api/urgent-sales/${saleId}`);
};

// Alias for backward compatibility - this is the function that was missing
export const hardDeleteUrgentSale = deleteUrgentSale;

// Add createUrgentSaleWithProductHandling function
export const createUrgentSaleWithProductHandling = async (saleData) => {
  console.log('Creating urgent sale with product validation handling:', saleData);
  
  // Format data for MongoDB schema
  const formattedData = {
    name: saleData.name?.trim(),
    description: saleData.description?.trim() || `${saleData.name} available at a discounted price for a limited time.`,
    category: saleData.category || 'food',
    originalPrice: Number(parseFloat(saleData.originalPrice || saleData.price || 0)),
    discountedPrice: Number(parseFloat(saleData.discountedPrice || 0)),
    price: Number(parseFloat(saleData.originalPrice || saleData.price || 0)),
    discount: Math.round(((Number(parseFloat(saleData.originalPrice || saleData.price || 0)) - Number(parseFloat(saleData.discountedPrice || 0))) / Number(parseFloat(saleData.originalPrice || saleData.price || 0))) * 100),
    stock: Number(parseInt(saleData.stock || saleData.quantity || 0)),
    quantity: Number(parseInt(saleData.stock || saleData.quantity || 0)),
    unit: saleData.unit || 'piece',
    expiryDate: saleData.expiryDate,
    image: saleData.image,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return api.post('/api/urgent-sales', formattedData);
};

// Add getMyUrgentSalesDirectDB function 
export const getMyUrgentSalesDirectDB = async () => {
  console.log('Fetching my urgent sales with direct DB query approach');
  
  try {
    // Try the standard endpoint first
    try {
      const response = await api.get('/api/urgent-sales/my-listings');
      if (response.data && Array.isArray(response.data)) {
        console.log(`Successfully fetched ${response.data.length} urgent sales`);
        return response.data;
    }
  } catch (error) {
      console.error('Standard endpoint failed:', error);
    }
    
    // Try alternative endpoints
    const endpoints = [
      '/api/urgent-sales/my-sales',
      '/api/urgent-sales/hotel-sales',
      '/api/urgent-sales'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const response = await api.get(endpoint);
        
        if (response.data && Array.isArray(response.data)) {
          console.log(`Found ${response.data.length} sales with endpoint ${endpoint}`);
          return response.data;
        }
        
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          console.log(`Found ${response.data.data.length} sales in paginated response`);
          return response.data.data;
        }
      } catch (endpointError) {
        console.error(`Endpoint ${endpoint} failed:`, endpointError.message);
        // Continue to next endpoint
      }
    }
    
    // If all endpoints fail, return empty array
    console.log('All endpoints failed, returning empty array');
    return [];
  } catch (error) {
    console.error('Error in getMyUrgentSalesDirectDB:', error);
    return [];
  }
};

// Add createUrgentSaleWithLocalFallback function
export const createUrgentSaleWithLocalFallback = async (saleData, onSuccess) => {
  // Create a unique ID for the sale (temporary)
  const tempId = 'temp_' + Date.now();
  
  // Format the data for direct use
  const directSaleData = {
    _id: tempId,
    name: saleData.name,
    description: saleData.description,
    category: saleData.category || 'Vegetables',
    originalPrice: Number(parseFloat(saleData.originalPrice)),
    price: Number(parseFloat(saleData.originalPrice)),
    discountedPrice: Number(parseFloat(saleData.discountedPrice)),
    discount: Math.round(((saleData.originalPrice - saleData.discountedPrice) / saleData.originalPrice) * 100),
    stock: Number(parseInt(saleData.stock)),
    quantity: Number(parseInt(saleData.stock)),
    unit: saleData.unit || 'piece',
    expiryDate: saleData.expiryDate,
    image: saleData.image,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Immediately call the success callback to update the UI
  if (onSuccess && typeof onSuccess === 'function') {
    onSuccess(directSaleData);
  }
  
  // Try to save to the backend anyway
  try {
    const response = await createUrgentSaleWithProductHandling(saleData);
    console.log('Successfully saved urgent sale to backend:', response);
      return response;
  } catch (error) {
    console.error('Failed to save urgent sale to backend, but UI was updated:', error);
    // Return the local data we created
    return directSaleData;
  }
};

// Inventory APIs
export const getInventoryItems = async (page = 1, limit = 10, search = '') => {
  const token = localStorage.getItem('token');
  console.log(`Fetching inventory items: page=${page}, limit=${limit}, search=${search}`);
  return api.get(`/api/inventory?page=${page}&limit=${limit}&search=${search}`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    timeout: 5001 // Add timeout to prevent long waiting times
    });
};

export const getInventoryItem = async (itemId) => {
  const token = localStorage.getItem('token');
  console.log(`Fetching inventory item: ${itemId}`);
  return api.get(`/api/inventory/${itemId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    timeout: 5001
  });
};

export const addInventoryItem = async (itemData) => {
  const token = localStorage.getItem('token');
  console.log('Adding inventory item:', itemData);
  return api.post('/api/inventory', itemData, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    timeout: 5001
    });
};

export const updateInventoryItem = async (itemId, itemData) => {
  const token = localStorage.getItem('token');
  console.log(`Updating inventory item ${itemId}:`, itemData);
  return api.put(`/api/inventory/${itemId}`, itemData, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    timeout: 5001
    });
};

export const deleteInventoryItem = async (itemId) => {
  const token = localStorage.getItem('token');
  console.log(`Deleting inventory item: ${itemId}`);
  return api.delete(`/api/inventory/${itemId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    timeout: 5001
    });
};

// Menu Management APIs
export const getMenuItems = async (page = 1, limit = 10) => {
  console.log(`Fetching menu items (page: ${page}, limit: ${limit})`);
  try {
    // Try the menu-items endpoint
    const response = await api.get(`/api/menu-items?page=${page}&limit=${limit}`);
    console.log('Successfully fetched menu items');
      return response;
  } catch (error) {
    console.error('Error fetching menu items:', error);
      throw error;
  }
};

export const getMenuItem = (menuId) => {
  console.log(`Fetching menu item details for ID: ${menuId}`);
  return api.get(`/api/menu-items/${menuId}`);
};

export const addMenuItem = (menuData) => {
  console.log('Adding new menu item');
  return api.post('/api/menu-items', menuData);
};

export const updateMenuItem = (menuId, menuData) => {
  console.log(`Updating menu item ID: ${menuId}`);
  return api.put(`/api/menu-items/${menuId}`, menuData);
};

export const deleteMenuItem = (menuId) => {
  console.log(`Deleting menu item ID: ${menuId}`);
  return api.delete(`/api/menu-items/${menuId}`);
};

export const getMenuCategories = async () => {
  console.log('Fetching menu categories');
  try {
    const response = await api.get('/api/menu-items/categories');
    return response;
  } catch (error) {
    console.error('Error fetching menu categories:', error);
    throw error;
  }
};

// Order Management APIs
export const getOrders = (page = 1, limit = 10, status = '') => {
  console.log(`Fetching orders (page: ${page}, limit: ${limit}, status: ${status})`);
  return api.get(`/api/orders?page=${page}&limit=${limit}&status=${status}`);
};

export const getOrderDetails = (orderId) => {
  console.log(`Fetching order details for ID: ${orderId}`);
  return api.get(`/api/orders/${orderId}`);
};

export const updateOrderStatus = (orderId, status) => {
  console.log(`Updating order status for ID: ${orderId} to ${status}`);
  // Format the status data properly
  const statusData = { status: status };
  return api.patch(`/api/orders/${orderId}/status`, statusData);
};

export const createOrder = async (orderData) => {
  console.log('Creating new order');
  return api.post('/api/orders', orderData);
};

export const createTestOrder = async (orderData) => {
  try {
    console.log('Creating test order with data:', orderData);
    const response = await api.post('/api/orders/test', orderData);
    console.log('Test order creation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating test order:', error);
    // Try alternative endpoint if primary fails
    try {
      console.log('Trying alternative test order endpoint...');
      const alternativeResponse = await api.post('/orders/test', orderData);
      console.log('Alternative test order creation response:', alternativeResponse.data);
      return alternativeResponse.data;
    } catch (alternativeError) {
      console.error('Error with alternative test order endpoint:', alternativeError);
      throw alternativeError;
    }
  }
};

// Image Services
export const getImage = async (imageId) => {
  try {
    console.log(`Getting image with ID: ${imageId}`);
    // Check if the imageId is a full URL
    if (imageId && (imageId.startsWith('http://') || imageId.startsWith('https://'))) {
      return imageId;
    }
    
    // If it's an ID, fetch it from the API
    // First try the product image endpoint
    try {
      const response = await api.get(`/api/products/${imageId}/image`);
      if (response.data && response.data.url) {
        return response.data.url;
      }
    } catch (error) {
      console.log(`Product image fetch failed for ${imageId}, trying uploads directory`);
    }
    
    // If product image fails, try the uploads directory
    return `${api.defaults.baseURL}/uploads/${imageId}`;
  } catch (error) {
    console.error(`Error fetching image with ID ${imageId}:`, error);
    // Return a default image URL as fallback
    return 'https://via.placeholder.com/300';
  }
};

// Restaurant/Hotel Services 
export const getRestaurantById = async (id) => {
  console.log(`Fetching restaurant with ID: ${id}`);
  try {
    const response = await api.get(`/api/hotels/${id}`);
      return response.data;
    } catch (error) {
    console.error(`Error fetching restaurant with ID ${id}:`, error);
        throw error;
      }
};

// User Services
export const getCurrentUser = async () => {
  try {
    // Try to get user from localStorage first
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const userData = JSON.parse(userJson);
      if (userData && userData._id) {
        console.log('Retrieved user from localStorage');
        return { success: true, data: userData };
      }
    }
    
    // If not in localStorage, try to fetch from API
    console.log('Fetching current user from API');
    const response = await api.get('/api/users/profile');
        
        if (response.data) {
      // Store the user data in localStorage for future use
      localStorage.setItem('user', JSON.stringify(response.data));
      return { success: true, data: response.data };
    }
    
    return { success: false, message: 'User not found' };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return { success: false, error: error.message, data: null };
  }
};

// Function to reserve leftover food item (add to cart)
export const reserveLeftoverFood = async (id) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('You need to be logged in to reserve items');
    }
    
    console.log(`Attempting to reserve leftover food item ${id}`);
    
    const response = await api.post(`/api/leftover-food/${id}/reserve`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Reservation response:', response.data);
    
    if (response.data && response.data.success) {
      return {
        success: true,
        message: response.data.message || 'Item reserved successfully',
        status: response.data.status || 'reserved'
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to reserve item'
      };
    }
  } catch (error) {
    console.error('Error reserving leftover food:', error);
    
    // Extract error message from response if available
    const errorMessage = error.response?.data?.message || error.message || 'Failed to reserve item';
    
    return {
      success: false,
      message: errorMessage
    };
  }
};

export default api; 