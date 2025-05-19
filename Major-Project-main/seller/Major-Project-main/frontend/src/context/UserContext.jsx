import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authService from '../services/authService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from localStorage on initial render
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          try {
            const userData = JSON.parse(storedUser);
            // Ensure the token is attached to the user object
            userData.token = storedToken;
            setUser(userData);
            console.log('User loaded from localStorage:', userData.name || userData.email);
          } catch (parseError) {
            console.error('Error parsing user data from localStorage:', parseError);
            // Clear corrupted data
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        } else {
          console.log('No user found in localStorage');
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserFromStorage();
  }, []);

  const login = (userData) => {
    // Ensure we have a token
    if (!userData || (!userData.token && !userData.accessToken)) {
      console.error('No token provided in login data:', userData);
      return false;
    }
    
    try {
      // Extract the token (prefer token over accessToken if both exist)
      const token = userData.token || userData.accessToken;
      console.log('Storing user data in context and localStorage, token found:', !!token);
      
      // Create a clean user object without token duplication
      const userDataWithoutToken = { ...userData };
      
      // Remove both token fields to avoid duplication
      delete userDataWithoutToken.token;
      delete userDataWithoutToken.accessToken;
      
      // Update state first with complete data including token
      const userStateData = {
        ...userDataWithoutToken,
        token // Keep token in the state object for convenience
      };
      
      setUser(userStateData);
      
      // Then store in localStorage (separately)
      localStorage.setItem('user', JSON.stringify(userDataWithoutToken));
      localStorage.setItem('token', token);
      
      console.log('User logged in and data stored successfully');
      return true;
    } catch (error) {
      console.error('Error storing user data:', error);
      return false;
    }
  };

  const logout = () => {
    try {
      console.log('Logging out user');
      // Clear state first
      setUser(null);
      
      // Then clear localStorage
      authService.logout();
      
      console.log('User logged out and data cleared');
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  };

  // Check if the user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const isAuth = !!user && !!token;
    console.log('Authentication check:', isAuth ? 'Authenticated' : 'Not authenticated');
    return isAuth;
  };

  // Refresh the user data from localStorage
  const refreshUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        try {
          const userData = JSON.parse(storedUser);
          userData.token = storedToken;
          setUser(userData);
          console.log('User data refreshed from localStorage');
          return true;
        } catch (parseError) {
          console.error('Error parsing user data during refresh:', parseError);
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return false;
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated, 
      refreshUser,
      isLoading 
    }}>
      {children}
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
