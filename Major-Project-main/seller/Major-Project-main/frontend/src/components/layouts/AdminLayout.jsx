import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Badge, Divider, Avatar, Tooltip, Snackbar, Alert } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Icons
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  LightMode as LightModeIcon,
  AccountCircle,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Language as LanguageIcon,
  Add as AddIcon
} from '@mui/icons-material';

import AdminNavbar from '../admin/AdminNavbar';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  boxShadow: 'none',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  backgroundColor: alpha(theme.palette.background.default, 0.8),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  color: theme.palette.text.primary,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const StyledToolbar = styled(Toolbar)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 24px',
});

const ContentWrapper = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  minHeight: '100vh',
  background: theme.palette.background.default,
  marginLeft: '80px',
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const ExpandedContentWrapper = styled(ContentWrapper)(({ theme }) => ({
  marginLeft: '240px',
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.easeOut,
    duration: theme.transitions.duration.enteringScreen,
  }),
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: 10,
  padding: 8,
  boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.05)',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  }
}));

const AdminLayout = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [greeting, setGreeting] = useState('Good Morning');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Get greeting based on time of day
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting('Good Morning');
    } else if (hours < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, []);

  // Handle notifications menu
  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  // Handle user menu
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  // Function to show notifications
  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  const notifications = [
    { id: 1, message: 'New seller registration: Green Farms', time: '10 minutes ago', read: false },
    { id: 2, message: 'Verification documents submitted by Organic Valley', time: '1 hour ago', read: false },
    { id: 3, message: 'New complaint from customer #28456', time: '3 hours ago', read: true },
  ];

  return (
    <Box sx={{ display: 'flex', overflow: 'hidden' }}>
      <AdminNavbar />
      
      <StyledAppBar position="fixed">
        <StyledToolbar>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
            {greeting}, Admin
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Search Button */}
            <ActionButton size="medium">
              <SearchIcon />
            </ActionButton>
            
            {/* Light Mode Button */}
            <ActionButton size="medium">
              <LightModeIcon />
            </ActionButton>
            
            {/* Notifications */}
            <ActionButton
              size="medium"
              onClick={handleNotificationsOpen}
            >
              <Badge badgeContent={2} color="error">
                <NotificationsIcon />
              </Badge>
            </ActionButton>
            <Menu
              anchorEl={notificationsAnchorEl}
              open={Boolean(notificationsAnchorEl)}
              onClose={handleNotificationsClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  width: 320,
                  borderRadius: 2,
                  boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                  '& .MuiMenuItem-root': {
                    px: 2,
                    py: 1.5,
                    borderRadius: 1,
                    my: 0.5,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Notifications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You have {notifications.filter(n => !n.read).length} unread notifications
                </Typography>
              </Box>
              <Divider />
              {notifications.map((notification) => (
                <MenuItem 
                  key={notification.id}
                  onClick={handleNotificationsClose}
                  sx={{ 
                    backgroundColor: notification.read ? 'transparent' : alpha('#5D5FEF', 0.05),
                    '&:hover': {
                      backgroundColor: notification.read ? alpha('#5D5FEF', 0.04) : alpha('#5D5FEF', 0.08)
                    }
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notification.time}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
              <Divider />
              <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
                <Typography 
                  variant="body2" 
                  color="primary"
                  sx={{ 
                    cursor: 'pointer',
                    fontWeight: 500,
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  View all notifications
                </Typography>
              </Box>
            </Menu>
            
            {/* Add Button */}
            <ActionButton 
              size="medium" 
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              <AddIcon />
            </ActionButton>
            
            {/* User Menu */}
            <Box>
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{
                  padding: 0,
                  '&:hover': {
                    backgroundColor: 'transparent',
                  }
                }}
              >
                <Avatar alt="User Avatar" />
              </IconButton>
              <Menu
                anchorEl={userMenuAnchorEl}
                open={Boolean(userMenuAnchorEl)}
                onClose={handleUserMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: 2,
                    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                    '& .MuiMenuItem-root': {
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      my: 0.5,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Admin User
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    admin@example.com
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleUserMenuClose}>
                  <AccountCircle sx={{ mr: 1.5 }} />
                  Profile
                </MenuItem>
                <MenuItem onClick={handleUserMenuClose}>
                  <SettingsIcon sx={{ mr: 1.5 }} />
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleUserMenuClose}>
                  <LogoutIcon sx={{ mr: 1.5 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </StyledToolbar>
      </StyledAppBar>
      
      <Box component="main" sx={{ flexGrow: 1, position: 'relative' }}>
        <Box sx={{ mt: '64px' }}>
          <Outlet context={{ showNotification }} />
        </Box>
      </Box>
      
      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5001}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminLayout;