import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout - increased from 15s to prevent timeout issues
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    // Don't add token for authentication endpoints
    const isAuthEndpoint = config.url.includes('/login') || config.url.includes('/register');
    
    if (isAuthEndpoint) {
      // Don't add token for auth endpoints
      if (import.meta.env.DEV) {
        console.log('Auth endpoint request, not sending token:', config.url);
      }
      return config;
    }
    
    // Get token from localStorage on each request to ensure we have the latest
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Log authentication for debugging (only in development)
      if (import.meta.env.DEV) {
        console.log('Request with auth token:', config.url);
      }
    } else if (import.meta.env.DEV) {
      console.log('Request without auth token:', config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`API Response [${response.status}]:`, response.config.url);
      
      // For login endpoint, log the response structure
      if (response.config.url.includes('/login')) {
        console.log('Login response structure:', {
          hasData: !!response.data,
          isSuccess: response.data?.status === 'success',
          hasNestedData: !!response.data?.data,
          keys: Object.keys(response.data || {})
        });
        
        // If the response has a nested data structure, log it
        if (response.data?.status === 'success' && response.data?.data) {
          console.log('Nested data structure:', {
            keys: Object.keys(response.data.data || {}),
            hasToken: !!response.data.data.token,
            hasAccessToken: !!response.data.data.accessToken
          });
        }
      }
    }
    return response;
  },
  (error) => {
    // Log error details in development
    if (import.meta.env.DEV) {
      console.error(`API Error [${error.response?.status || 'Network'}]:`, error.config?.url);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
    
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access. Token may be invalid or expired.');
      
      // Only redirect if not already on the login page
      if (!window.location.pathname.includes('/login')) {
        // Store the current location before redirecting
        const currentPath = window.location.pathname;
        localStorage.setItem('redirectAfterLogin', currentPath);
        
        // Clear token and user data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Don't use window.location.href for redirects during API calls
        // Let the component handle the redirect through React Router
        console.log('Authentication failed. Component should handle redirect.');
      }
    }
    
    // Handle 403 Forbidden errors
    if (error.response && error.response.status === 403) {
      console.error('Forbidden access. User does not have permission.');
    }
    
    // Handle 500 Server errors
    if (error.response && error.response.status >= 500) {
      console.error('Server error:', error.response.data);
    }
    
    // Handle network errors
    if (error.message === 'Network Error') {
      console.error('Network error - check if the server is running');
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - the server took too long to respond');
    }
    
    return Promise.reject(error);
  }
);

// Function to check if the user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Function to get the current user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing user data:', e);
      // Clear potentially corrupted data
      localStorage.removeItem('user');
      return null;
    }
  }
  return null;
};

export default api; 