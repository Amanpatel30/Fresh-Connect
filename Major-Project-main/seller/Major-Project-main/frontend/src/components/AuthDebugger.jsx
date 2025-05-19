import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import { useUser } from '../context/UserContext';

const AuthDebugger = () => {
  const { user, isAuthenticated, logout, refreshUser, isLoading } = useUser();
  const [localStorageData, setLocalStorageData] = useState({
    token: null,
    user: null,
    redirectAfterLogin: null
  });
  
  // Update local storage data display
  const updateLocalStorageData = () => {
    setLocalStorageData({
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user'),
      redirectAfterLogin: localStorage.getItem('redirectAfterLogin')
    });
  };
  
  useEffect(() => {
    updateLocalStorageData();
    
    // Set up interval to refresh data
    const interval = setInterval(updateLocalStorageData, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleClearStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('redirectAfterLogin');
    updateLocalStorageData();
  };
  
  const handleRefreshUser = () => {
    refreshUser();
    updateLocalStorageData();
  };
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: 2,
        mb: 3
      }}
    >
      <Typography variant="h6" gutterBottom>Authentication Debugger</Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">Authentication Status:</Typography>
        <Typography variant="body1" fontWeight="medium">
          {isLoading ? 'Checking...' : isAuthenticated() ? 'Authenticated' : 'Not Authenticated'}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">User Context:</Typography>
        <Typography variant="body2" component="pre" sx={{ 
          p: 1, 
          bgcolor: 'background.default',
          borderRadius: 1,
          overflowX: 'auto'
        }}>
          {JSON.stringify(user, null, 2) || 'null'}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">Local Storage:</Typography>
        <Typography variant="body2" component="pre" sx={{ 
          p: 1, 
          bgcolor: 'background.default',
          borderRadius: 1,
          overflowX: 'auto'
        }}>
          {JSON.stringify(localStorageData, null, 2)}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleRefreshUser}
        >
          Refresh User
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleClearStorage}
          color="error"
        >
          Clear Storage
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={logout}
          color="warning"
        >
          Logout
        </Button>
      </Box>
    </Paper>
  );
};

export default AuthDebugger; 