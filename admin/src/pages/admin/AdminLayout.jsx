import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  CssBaseline,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  InputBase,
  Paper,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  VerifiedUser as VerifiedUserIcon,
  Apartment as HotelIcon,
  Category as CategoryIcon,
  Receipt as OrderIcon,
  Payment as PaymentIcon,
  Description as ReportIcon,
  Article as ContentIcon,
  BarChart as AnalyticsIcon,
  SupportAgent as ComplaintIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';

// Custom theme colors
const primaryColor = '#4CAF50'; // Green color for FreshConnect theme
const secondaryColor = '#FF5722';
const backgroundColor = '#f8f9fa';
const drawerWidth = 280;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users' },
  { 
    text: 'Verification', 
    icon: <VerifiedUserIcon />, 
    subItems: [
      { text: 'Seller Verification', path: '/admin/seller-verification' },
      { text: 'Hotel Verification', path: '/admin/hotel-verification' }
    ]
  },
  { text: 'Category Management', icon: <CategoryIcon />, path: '/admin/categories' },
  { text: 'Order Monitoring', icon: <OrderIcon />, path: '/admin/orders', badge: 5 },
  { text: 'Payment Management', icon: <PaymentIcon />, path: '/admin/payments' },
  { text: 'Report Generation', icon: <ReportIcon />, path: '/admin/reports' },
  { text: 'Content Management', icon: <ContentIcon />, path: '/admin/content' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/admin/analytics' },
  { text: 'Complaints', icon: <ComplaintIcon />, path: '/admin/complaints', badge: 2 },
  { text: 'System Settings', icon: <SettingsIcon />, path: '/admin/settings' },
];

const AdminLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationEl, setNotificationEl] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationEl(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Implement actual theme toggling logic here
  };

  const handleLogout = () => {
    // Handle logout logic here
    handleProfileMenuClose();
  };

  const handleItemClick = (item) => {
    if (item.subItems) {
      setExpandedItem(expandedItem === item.text ? null : item.text);
    } else if (isMobile) {
      handleDrawerToggle();
    }
  };

  const isActive = (path) => {
    return location.pathname === path || 
      (path !== '/admin' && location.pathname.startsWith(path));
  };

  const drawer = (
    <>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        backgroundColor: primaryColor,
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexGrow: 1
          }}>
            <Avatar 
              src="/logo.png" 
              alt="FreshConnect" 
              sx={{ width: 40, height: 40, mr: 1, backgroundColor: 'white' }}
            />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              FreshConnect
            </Typography>
          </Box>
          {isMobile && (
            <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
              <ChevronLeftIcon />
            </IconButton>
          )}
        </Box>
        <Divider sx={{ width: '100%', my: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          py: 1, 
          width: '100%',
          px: 2,
          borderRadius: 2,
          bgcolor: 'rgba(255,255,255,0.15)',
          mb: 1
        }}>
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40, 
              bgcolor: 'white',
              color: primaryColor,
              mr: 2
            }}
          >
            A
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
              Admin User
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Super Admin
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ overflow: 'auto', py: 2, flexGrow: 1, backgroundColor: darkMode ? '#1e1e2d' : 'white' }}>
        <List sx={{ px: 1 }}>
          {menuItems.map((item) => (
            <React.Fragment key={item.text}>
              <ListItem 
                disablePadding 
                sx={{ mb: 0.5 }}
              >
                <ListItemButton 
                  component={item.subItems ? 'div' : Link}
                  to={item.subItems ? undefined : item.path}
                  selected={item.subItems ? expandedItem === item.text : isActive(item.path)}
                  onClick={() => handleItemClick(item)}
                  sx={{
                    py: 1,
                    borderRadius: 2,
                    backgroundColor: item.subItems 
                      ? (expandedItem === item.text ? (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(76,175,80,0.08)') : 'transparent')
                      : (isActive(item.path) ? (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(76,175,80,0.12)') : 'transparent'),
                    '&:hover': {
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(76,175,80,0.08)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(76,175,80,0.12)',
                      '&:hover': {
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(76,175,80,0.18)',
                      },
                    }
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: item.subItems 
                        ? (expandedItem === item.text ? primaryColor : darkMode ? 'white' : 'inherit')
                        : (isActive(item.path) ? primaryColor : darkMode ? 'white' : 'inherit'),
                      minWidth: 40
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: item.subItems 
                        ? (expandedItem === item.text ? 'bold' : 'normal')
                        : (isActive(item.path) ? 'bold' : 'normal'),
                      fontSize: '0.95rem',
                      color: darkMode ? 'white' : 'inherit'
                    }}
                  />
                  {item.badge && (
                    <Chip 
                      size="small" 
                      label={item.badge} 
                      color="error" 
                      sx={{ height: 22, minWidth: 22, fontSize: '0.75rem' }} 
                    />
                  )}
                </ListItemButton>
              </ListItem>
              {item.subItems && expandedItem === item.text && (
                <List disablePadding>
                  {item.subItems.map((subItem) => (
                    <ListItem key={subItem.text} disablePadding sx={{ pl: 2 }}>
                      <ListItemButton
                        component={Link}
                        to={subItem.path}
                        selected={isActive(subItem.path)}
                        onClick={isMobile ? handleDrawerToggle : undefined}
                        sx={{
                          py: 0.75,
                          pl: 4,
                          borderRadius: 2,
                          backgroundColor: isActive(subItem.path) 
                            ? (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(76,175,80,0.12)') 
                            : 'transparent',
                          '&:hover': {
                            backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(76,175,80,0.08)',
                          },
                          '&.Mui-selected': {
                            backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(76,175,80,0.12)',
                            '&:hover': {
                              backgroundColor: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(76,175,80,0.18)',
                            },
                          }
                        }}
                      >
                        <ListItemText
                          primary={subItem.text}
                          primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: isActive(subItem.path) ? 'medium' : 'normal',
                            color: darkMode ? 'white' : 'inherit'
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid', 
        borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        backgroundColor: darkMode ? '#1e1e2d' : 'white'
      }}>
        <ListItemButton
          onClick={toggleDarkMode}
          sx={{
            borderRadius: 2,
            justifyContent: 'center',
            py: 1
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: darkMode ? 'white' : 'inherit' }}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </ListItemIcon>
          <ListItemText 
            primary={darkMode ? "Light Mode" : "Dark Mode"} 
            primaryTypographyProps={{
              fontSize: '0.95rem',
              color: darkMode ? 'white' : 'inherit'
            }}
          />
        </ListItemButton>
      </Box>
    </>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      backgroundColor: darkMode ? '#151521' : backgroundColor,
      minHeight: '100vh'
    }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: darkMode ? '#1e1e2d' : 'white',
          color: darkMode ? 'white' : 'black',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              display: { xs: 'none', sm: 'block' },
              fontWeight: 'bold'
            }}
          >
            {menuItems.find(item => isActive(item.path))?.text || 'Admin Panel'}
          </Typography>
          
          <Paper
            component="form"
            sx={{
              p: '0px 4px',
              display: 'flex',
              alignItems: 'center',
              width: 300,
              ml: 3,
              borderRadius: 2,
              backgroundColor: darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.03)',
              border: '1px solid',
              borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            }}
          >
            <SearchIcon sx={{ color: 'text.secondary', ml: 1 }} />
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search..."
              inputProps={{ 'aria-label': 'search' }}
            />
          </Paper>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex' }}>
            <IconButton color="inherit" onClick={toggleDarkMode} sx={{ ml: 1 }}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            
            <IconButton
              size="large"
              aria-label="show new messages"
              color="inherit"
              sx={{ ml: 1 }}
            >
              <Badge badgeContent={4} color="error">
                <MessageIcon />
              </Badge>
            </IconButton>
            
            <IconButton
              size="large"
              aria-label="show new notifications"
              color="inherit"
              onClick={handleNotificationOpen}
              sx={{ ml: 1 }}
            >
              <Badge badgeContent={7} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleProfileMenuOpen}
                size="large"
                edge="end"
                color="inherit"
                sx={{ ml: 1 }}
              >
                <Avatar sx={{ 
                  width: 35, 
                  height: 35, 
                  bgcolor: primaryColor,
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  border: '2px solid',
                  borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(76,175,80,0.2)'
                }}>A</Avatar>
              </IconButton>
            </Tooltip>
          </Box>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 3,
              sx: {
                overflow: 'visible',
                mt: 1.5,
                width: 200,
                borderRadius: 2,
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)'
                }
              }
            }}
          >
            <MenuItem onClick={handleProfileMenuClose} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <AccountIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="My Profile" />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>
          </Menu>
          
          <Menu
            anchorEl={notificationEl}
            open={Boolean(notificationEl)}
            onClose={handleNotificationClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 3,
              sx: {
                overflow: 'visible',
                mt: 1.5,
                width: 320,
                borderRadius: 2,
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)'
                }
              }
            }}
          >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Notifications</Typography>
              <Chip label="7 new" size="small" color="error" />
            </Box>
            <Divider />
            <MenuItem onClick={handleNotificationClose} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <VerifiedUserIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="New seller verification request" 
                secondary="5 minutes ago"
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </MenuItem>
            <MenuItem onClick={handleNotificationClose} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <OrderIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="New order received" 
                secondary="30 minutes ago"
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </MenuItem>
            <MenuItem onClick={handleNotificationClose} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <ComplaintIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="New complaint submitted" 
                secondary="2 hours ago"
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </MenuItem>
            <Divider />
            <Box sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography variant="button" sx={{ color: primaryColor, cursor: 'pointer' }}>
                View All Notifications
              </Typography>
            </Box>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none'
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '0 0 15px rgba(0,0,0,0.05)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          p: 3,
          backgroundColor: darkMode ? '#151521' : backgroundColor,
          color: darkMode ? 'white' : 'inherit',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout; 