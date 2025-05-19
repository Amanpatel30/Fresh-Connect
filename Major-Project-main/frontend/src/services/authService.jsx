import api from './api';

// Register hotel account
export const registerHotel = async (registrationData) => {
  try {
    console.log('Registering hotel with data:', registrationData);
    const response = await api.post('/api/auth/hotel/register', registrationData);
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error registering hotel:', error);
    throw error;
  }
};

// Login to hotel account
export const loginHotel = async (email, password) => {
  try {
    console.log('Logging in hotel with email:', email);
    const response = await api.post('/api/auth/hotel/login', { email, password });
    console.log('Login response:', response.data);
    
    // Store token in localStorage if login successful
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userType', 'hotel');
      localStorage.setItem('userId', response.data.hotel._id || response.data.hotel.id);
      localStorage.setItem('userEmail', email);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error logging in hotel:', error);
    throw error;
  }
};

// Logout function
export const logout = () => {
  console.log('Logging out...');
  // Remove stored user data
  localStorage.removeItem('token');
  localStorage.removeItem('userType');
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
};

// Check if user is logged in
export const isLoggedIn = () => {
  const token = localStorage.getItem('token');
  return !!token; // Return true if token exists
};

// Get current user type
export const getUserType = () => {
  return localStorage.getItem('userType');
};

// Get current user ID
export const getUserId = () => {
  return localStorage.getItem('userId');
};

// Get current user's token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Get user profile information
export const getUserProfile = async () => {
  try {
    console.log('Fetching user profile...');
    
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication required');
    }
    
    const response = await api.get('/api/hotel/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('User profile response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    console.log('Updating user profile with data:', profileData);
    
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication required');
    }
    
    const response = await api.put('/api/hotel/profile', profileData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Profile update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
  try {
    console.log('Changing password...');
    
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication required');
    }
    
    const response = await api.post('/api/auth/change-password', {
      currentPassword,
      newPassword
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Password change response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Request password reset
export const requestPasswordReset = async (email) => {
  try {
    console.log('Requesting password reset for email:', email);
    const response = await api.post('/api/auth/forgot-password', { email });
    console.log('Password reset request response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
};

// Reset password with token
export const resetPassword = async (token, newPassword) => {
  try {
    console.log('Resetting password with token...');
    const response = await api.post('/api/auth/reset-password', {
      token,
      newPassword
    });
    console.log('Password reset response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

export default {
  registerHotel,
  loginHotel,
  logout,
  isLoggedIn,
  getUserType,
  getUserId,
  getToken,
  getUserProfile,
  updateUserProfile,
  changePassword,
  requestPasswordReset,
  resetPassword
}; 