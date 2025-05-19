import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const HotelLogout = () => {
  const { logout } = useUser();

  useEffect(() => {
    // Execute logout action on component mount
    const performLogout = async () => {
      try {
        await logout();
      } catch (error) {
        console.error('Error during logout:', error);
      }
    };

    performLogout();
  }, [logout]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress size={60} />
      <Box sx={{ mt: 2, color: 'text.primary' }}>Logging out...</Box>
      {/* Auto-redirect after a brief delay */}
      <Navigate to="/login" replace />
    </Box>
  );
};

export default HotelLogout; 