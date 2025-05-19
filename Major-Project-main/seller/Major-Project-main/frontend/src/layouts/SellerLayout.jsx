import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import SellerNavbar from '../components/seller/SellerNavbar';

const SellerLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  
  // Calculate sidebar width based on expansion state
  const getSidebarWidth = () => {
    if (isMobile) return 0;
    if (isTablet) return sidebarExpanded ? 240 : 60;
    return sidebarExpanded ? 260 : 70;
  };
  
  // Handle sidebar expansion state changes
  const handleSidebarExpand = (expanded) => {
    setSidebarExpanded(expanded);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100vw'
    }}>
      <SellerNavbar onExpand={handleSidebarExpand} />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          pt: { xs: '56px', sm: '64px' }, // Space for the fixed navbar
          px: { xs: 0.5, sm: 1, md: 1.5 }, // Horizontal padding
          backgroundColor: '#f9f9f9',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
          ml: isMobile ? 0 : `${getSidebarWidth()}px`, // Adjust margin based on sidebar width
          width: isMobile ? '100%' : `calc(100% - ${getSidebarWidth()}px)`, // Adjust width based on sidebar
          transition: 'all 0.3s ease', // Smooth transition for width changes
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default SellerLayout; 