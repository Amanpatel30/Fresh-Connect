import React, { createContext, useState, useContext, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

// Create the context
const HeaderContext = createContext();

// Create a provider component
export const HeaderProvider = ({ children }) => {
  // Default state for header data
  const [headerData, setHeaderData] = useState({
    appName: 'FreshConnect',
    notificationCount: 0,
    searchPlaceholder: 'Search...',
    userName: 'User',
    userAvatar: null,
  });

  // Use ref to track previous value and prevent unnecessary updates
  const prevDataRef = useRef(headerData);

  // Handler functions
  const handleSearch = (searchText) => {
    console.log('Searching for:', searchText);
    // Implement search functionality
  };

  const handleNotificationClick = () => {
    console.log('Notifications clicked');
    // Implement notification view
  };

  const handleProfileClick = () => {
    console.log('Profile clicked');
    // Implement profile actions
  };

  // Function to update header data
  // Use useCallback to keep function reference stable
  const updateHeaderData = useCallback((newData) => {
    // Check if the update would actually change anything to prevent unnecessary renders
    const isChanged = Object.keys(newData).some(
      key => newData[key] !== prevDataRef.current[key]
    );
    
    if (isChanged) {
      setHeaderData(prev => {
        const updated = { ...prev, ...newData };
        prevDataRef.current = updated;
        return updated;
      });
    }
  }, []);

  // Context value
  const value = {
    ...headerData,
    onSearchChange: handleSearch,
    onNotificationClick: handleNotificationClick,
    onProfileClick: handleProfileClick,
    updateHeaderData,
  };

  return (
    <HeaderContext.Provider value={value}>
      {children}
    </HeaderContext.Provider>
  );
};

HeaderProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook for using the header context
export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
};

export default HeaderContext; 