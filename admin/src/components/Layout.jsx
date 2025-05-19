import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  InputBase,
  Badge,
  useTheme,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Nature as LeafIcon
} from '@mui/icons-material';
import ContentManagementIcon from '@mui/icons-material/Article';
import AnalyticsIcon from '@mui/icons-material/BarChart';
import ReportsIcon from '@mui/icons-material/Assessment';
import UsersIcon from '@mui/icons-material/People';
import SellerVerificationIcon from '@mui/icons-material/VerifiedUser';
import HotelVerificationIcon from '@mui/icons-material/Hotel';
import OrderMonitoringIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import ComplaintIcon from '@mui/icons-material/Report';
import SettingsIcon from '@mui/icons-material/Settings';
import Header from './Header';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New order received', read: false },
    { id: 2, text: 'User verification pending', read: false },
    { id: 3, text: 'Payment successful', read: false },
    { id: 4, text: 'New complaint filed', read: false },
  ]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const menuItems = [
    { path: '/', icon: <HomeIcon />, label: 'Dashboard' },
    { divider: true },
    { path: '/users', icon: <UsersIcon />, label: 'User Management' },
    { path: '/seller-verification', icon: <SellerVerificationIcon />, label: 'Seller Verification' },
    { path: '/hotel-verification', icon: <HotelVerificationIcon />, label: 'Hotel Verification' },
    { path: '/orders', icon: <OrderMonitoringIcon />, label: 'Order Monitoring' },
    { path: '/payments', icon: <PaymentIcon />, label: 'Payment Management' },
    { path: '/complaints', icon: <ComplaintIcon />, label: 'Complaint Handling' },
    { divider: true },
    { path: '/content', icon: <ContentManagementIcon />, label: 'Content' },
    { path: '/analytics', icon: <AnalyticsIcon />, label: 'Analytics' },
    { path: '/reports', icon: <ReportsIcon />, label: 'Reports' },
    { path: '/system-settings', icon: <SettingsIcon />, label: 'System Settings' },
  ];

  const isActive = (path) => location.pathname === path;

  // Enhanced search handler with navigation
  const handleSearch = (searchText, result) => {
    console.log('Searching for:', searchText);
    
    // If a specific result was selected (from dropdown)
    if (result) {
      // Navigate based on result type
      switch (result.type) {
        case 'page':
          navigate(result.path);
          break;
        case 'product':
          navigate(`/products/${result.id}`);
          break;
        case 'order':
          navigate(`/orders/${result.id}`);
          break;
        case 'user':
          navigate(`/users/${result.id}`);
          break;
        default:
          // General search
          navigate(`/search?q=${encodeURIComponent(searchText)}`);
      }
      
      setSnackbar({
        open: true,
        message: `Navigating to: ${result.title}`,
        severity: 'success'
      });
    } 
    // General search (pressing enter)
    else if (searchText.length > 2) {
      setSnackbar({
        open: true,
        message: `Searching for: ${searchText}`,
        severity: 'info'
      });
    }
  };

  const handleNotificationClick = () => {
    console.log('Notifications clicked');
    // Mark all notifications as read
    const updatedNotifications = notifications.map(notif => ({
      ...notif,
      read: true
    }));
    setNotifications(updatedNotifications);
    
    setSnackbar({
      open: true,
      message: 'All notifications marked as read',
      severity: 'success'
    });
  };

  const handleProfileClick = () => {
    console.log('Profile clicked');
    navigate('/profile');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Props for the Header component
  const headerProps = {
    appName: 'FreshConnect',
    notificationCount: notifications.filter(n => !n.read).length,
    searchPlaceholder: 'Search pages, products, orders...',
    userName: 'Admin User',
    userAvatar: null,
    onSearchChange: handleSearch,
    onNotificationClick: handleNotificationClick,
    onProfileClick: handleProfileClick,
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: 'background.default',
      background: 'linear-gradient(180deg, rgba(230, 230, 235, 0.8) 0%, rgba(210, 205, 245, 0.9) 100%)',
    }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: 80,
          position: 'fixed', // Fix the entire sidebar
          height: '100vh',   // Full viewport height
          left: 0,           // Align to left
          top: 0,           // Align to top
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 3,
          px: 1,
          bgcolor: 'background.paper', // Add background color
          zIndex: 1200,     // Ensure sidebar stays above content
          boxShadow: 1,     // Optional: add subtle shadow
          // Hide scrollbar but keep functionality
          overflowY: 'auto',
          msOverflowStyle: 'none', // IE and Edge
          scrollbarWidth: 'none', // Firefox
          '&::-webkit-scrollbar': { // Chrome, Safari, Opera
            display: 'none'
          }
        }}
      >
        {/* Logo - Fixed at top */}
        <Box
          sx={{ 
            width: 56, 
            height: 56, 
            mb: 4,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: '#4CAF50',
            borderRadius: '50%',
            overflow: 'hidden'
          }}
        >
          {/* SVG Logo */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24"
            dangerouslySetInnerHTML={{
              __html: `
                <defs>
                  <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#00E676"/>
                    <stop offset="100%" style="stop-color:#00C853"/>
                  </linearGradient>
                  <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#B9F6CA;stop-opacity:0.8"/>
                    <stop offset="100%" style="stop-color:#B9F6CA;stop-opacity:0"/>
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="0.5" result="blur"/>
                    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                  </filter>
                </defs>
                <path d="M18.5,3.5C10,4.5,4,11,2,21" stroke="#E8F5E9" stroke-width="0.5" stroke-dasharray="1,1" opacity="0.8"/>
                <path d="M18.5,3.5C17,5,14,5.25,9,6.25C4,7.25,2,11.5,2,13.5C2,15.5,3.75,17.25,3.75,17.25C5.75,12.25,11,9.5,15.5,9C12.5,12,10.5,14.5,8,20C19,20,22,3,22,3C21,3,20,3.25,18.5,3.5Z" fill="url(#leafGradient)" filter="url(#glow)"/>
                <path d="M8,20C10.5,14.5,12.5,12,15.5,9" fill="none" stroke="#69F0AE" stroke-width="0.7" stroke-linecap="round"/>
                <path d="M5,16C8,13,12,11,15.5,9" fill="none" stroke="#69F0AE" stroke-width="0.5" stroke-linecap="round"/>
                <path d="M6.5,13C10,11.5,13,10.5,15.5,9" fill="none" stroke="#69F0AE" stroke-width="0.3" stroke-linecap="round"/>
                <path d="M7,13C12,12.5,14,11,15.5,9" fill="none" stroke="url(#glowGradient)" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="17" cy="6" r="0.25" fill="#FFFFFF" opacity="0.9"/>
                <circle cx="11" cy="10" r="0.25" fill="#FFFFFF" opacity="0.9"/>
                <circle cx="8" cy="14" r="0.25" fill="#FFFFFF" opacity="0.9"/>
                <circle cx="9" cy="17" r="0.25" fill="#FFFFFF" opacity="0.9"/>
                <circle cx="5" cy="13" r="0.25" fill="#FFFFFF" opacity="0.9"/>
                <path d="M19,5.5L19.5,5" stroke="#FFFFFF" stroke-width="0.5" opacity="0.8"/>
                <path d="M17,7.5L17.5,7" stroke="#FFFFFF" stroke-width="0.5" opacity="0.8"/>
                <path d="M15,9.5L15.5,9" stroke="#FFFFFF" stroke-width="0.5" opacity="0.8"/>
              `
            }}
          />
        </Box>

        {/* Navigation Items */}
        <List sx={{ 
          width: '100%',
          flex: 1,     
          pb: 2, // Space at bottom to ensure all icons are visible
        }}>
          {menuItems.map((item, index) => 
            item.divider ? (
              <Divider key={`divider-${index}`} sx={{ my: 1.5 }} />
            ) : (
              <ListItem 
                key={item.path} 
                disablePadding 
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  mb: 0.75,
                }}
              >
                <Tooltip title={item.label} placement="right">
                  <IconButton
                    component={Link}
                    to={item.path}
                    sx={{
                      borderRadius: 2,
                      p: 1.25,
                      color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                      bgcolor: isActive(item.path) ? 'action.selected' : 'transparent',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    {item.icon}
                  </IconButton>
                </Tooltip>
              </ListItem>
            )
          )}
        </List>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginLeft: '80px',
          width: 'calc(100% - 80px)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          position: 'relative',
          bgcolor: 'background.default',
          '& > *': {
            flex: '0 0 auto'
          }
        }}
      >
        <Header {...headerProps} />

        {/* Page Content */}
        <Box
          sx={{
            flex: 1,
            p: 4,
            overflow: 'auto',
            minHeight: 'calc(100vh - 80px)', // Account for header height
            '& > *': {
              maxWidth: '100%',
              overflow: 'auto'
            }
          }}
        >
          <Outlet />
        </Box>
        
        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={3000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Layout;