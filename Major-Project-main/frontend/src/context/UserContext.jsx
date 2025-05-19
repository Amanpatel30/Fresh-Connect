import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkAuthStatus } from '../services/api';
import { message } from 'antd';
import api from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [lastAuthCheck, setLastAuthCheck] = useState(0);

  // Add updateUser function
  const updateUser = (updatedUserData) => {
    console.log('Updating user data:', updatedUserData);
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  // Check authentication status
  const checkAuth = async (forceCheck = false) => {
    // Don't check more than once every 30 seconds unless forced
    const now = Date.now();
    if (!forceCheck && (now - lastAuthCheck < 30000)) {
      return { isValid: !!user, user };
    }

    setLastAuthCheck(now);
    setLoading(true);
    
    try {
      // First try loading from localStorage if available
      const token = localStorage.getItem('token') || localStorage.getItem('userToken');
      const storedUser = localStorage.getItem('user');
      
      if (!token) {
        console.log('No token found in localStorage');
        setUser(null);
        setLoading(false);
        setAuthChecked(true);
        return { isValid: false, user: null };
      }
      
      // Load localStorage user first to avoid UI flashing
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }

      // Try different auth check endpoints
      const authEndpoints = [
        '/api/check-auth',
        '/api/users/check-auth',
        '/api/auth/check',
        '/api/user/verify'
      ];

      let authSuccess = false;
      
      for (const endpoint of authEndpoints) {
        try {
          console.log(`Trying auth check endpoint: ${endpoint}`);
          const response = await api.get(endpoint);
          
          // Handle the new response format
          if (response.status === 200) {
            // Check if the response indicates authenticated or not
            if (response.data.isAuthenticated === false) {
              console.log(`Authentication failed for ${endpoint}: User not authenticated`);
              continue; // Try next endpoint
            }
            
            console.log(`Authentication check successful with ${endpoint}:`, response.data);
            
            // Update user if response contains user data
            if (response.data.user) {
              setUser(response.data.user);
              localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            
            authSuccess = true;
            break;
          }
        } catch (error) {
          console.log(`Auth check failed with ${endpoint}:`, error.response?.status);
          // Continue to next endpoint if this one fails
        }
      }
      
      if (authSuccess) {
        return { isValid: true, user };
      }

      // If all endpoints fail, check if token is valid by decoding
      if (token) {
        try {
          const base64Url = token.split('.')[1];
          if (base64Url) {
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const { exp } = JSON.parse(jsonPayload);
            
            // Check if token is expired
            if (exp && exp * 1000 > Date.now()) {
              console.log('Token valid based on expiration time');
              return { isValid: true, user };
            }
          }
        } catch (e) {
          console.log('Error decoding token:', e);
        }
      }
      
      // If we get here, authentication failed
      console.log('Authentication check failed on all endpoints');
      
      // Clear user data since auth failed
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userToken');
      setUser(null);
      
      // Show user-friendly message only on important pages
      if (window.location.pathname !== '/login' && 
          !window.location.pathname.startsWith('/products')) {
        message.error('Your session has expired. Please log in again.');
      }
      
      return { isValid: false, user: null };
    } catch (error) {
      console.error('Error in authentication check:', error);
      return { isValid: false, error };
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    checkAuth(true);
  }, []);

  // Public method to force auth check
  const refreshAuth = () => checkAuth(true);

  const login = (userData) => {
    console.log('Logging in user:', userData);
    
    // Check if userData has the expected structure
    if (!userData) {
      console.error('Invalid user data structure:', userData);
      return false;
    }

    try {
      // Store user info and token
      const userInfo = {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        role: userData.role || 'user',
        // Preserve hotel-specific properties
        isHotel: userData.isHotel || false,
        hotelId: userData.hotelId || null
      };

      // Extract token from userData
      let token = userData.token;

      if (!token) {
        console.error('No token found in user data');
        return false;
      }

      // Ensure token is properly formatted (remove 'Bearer ' if present)
      if (token.startsWith('Bearer ')) {
        console.warn('Token includes Bearer prefix - removing before storage');
        token = token.split(' ')[1];
      }

      console.log('Token to be stored:', token.substring(0, 15) + '...');
      console.log('Token length:', token.length);

      // Log the user info being saved
      console.log('Saving user info with hotel properties:', userInfo);

      // Set user state with the user info
      setUser(userInfo);
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(userInfo));
      localStorage.setItem('token', token);
      
      // Verify token was stored correctly
      const storedToken = localStorage.getItem('token');
      console.log('Stored token check:', storedToken.substring(0, 15) + '...');
      console.log('Stored correctly:', storedToken === token);
      
      // Reset auth check timestamp to force a fresh check
      setLastAuthCheck(0);
      
      return true;
    } catch (error) {
      console.error('Error processing login data:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('Logging out user');
    
    // Clear user state
    setUser(null);
    
    // Clear all auth-related items from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userToken');
    localStorage.removeItem('redirectAfterLogin');
    
    // Force a small delay to ensure the state is updated
    setTimeout(() => {
      // Always redirect to the main login page
      window.location.href = '/login';
    }, 100);
  };

  const hasHotelPermissions = () => {
    return user?.isHotel && user?.role === 'hotel';
  };

  const value = {
    user,
    loading,
    authChecked,
    login,
    logout,
    hasHotelPermissions,
    isLoggedIn: !!user,
    updateUser,
    refreshAuth,
    checkAuth,
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
