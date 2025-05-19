import api from './api';

// Login user
export const login = async (credentials) => {
  try {
    const response = await api.post('/users/login', credentials);
    
    // Log the response for debugging
    console.log('Auth service login response:', response);
    
    // Check if we have a valid response with data
    if (!response || !response.data) {
      throw new Error('Invalid response from server');
    }
    
    // The API response structure appears to be { status: "success", data: { user data with token } }
    // Extract the actual user data from the nested structure
    const responseData = response.data;
    
    // Check if the response has the expected structure
    if (responseData.status === 'success' && responseData.data) {
      // Extract the user data from the nested structure
      const userData = responseData.data;
      
      // Check if the token exists in the user data
      if (!userData.token && !userData.accessToken) {
        console.error('No token found in user data:', userData);
        throw new Error('No authentication token received from server');
      }
      
      // Return the user data
      return userData;
    } else {
      // If the response doesn't have the expected structure, try to use it directly
      const userData = responseData;
      
      // Ensure we have a token in the response
      if (!userData.token && !userData.accessToken) {
        console.error('No token found in response:', userData);
        throw new Error('No authentication token received from server');
      }
      
      // Return the user data
      return userData;
    }
  } catch (error) {
    console.error('Login error in authService:', error);
    throw error;
  }
};

// Register user
export const register = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Logout user
export const logout = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('redirectAfterLogin');
    console.log('Logout successful: Local storage cleared');
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    return false;
  }
};

// Get current user profile
export const getCurrentUserProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put('/users/profile', userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Check if token is valid
export const validateToken = async () => {
  try {
    const response = await api.get('/users/validate-token');
    return response.data;
  } catch (error) {
    console.error('Token validation error:', error);
    throw error;
  }
}; 