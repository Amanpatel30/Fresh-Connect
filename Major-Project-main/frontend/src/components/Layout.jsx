import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  Avatar,
  Badge,
  Stack,
  Paper,
  Tooltip,
  alpha,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as ProductsIcon,
  ShoppingCart as OrdersIcon,
  LocalOffer as UrgentSalesIcon,
  Person as ProfileIcon,
  Star as ReviewsIcon,
  Payment as PaymentsIcon,
  VerifiedUser as VerificationIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Spa as LeafIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
  Free as FreeIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Inventory as InventoryIcon,
  Leftover as LeftoverIcon,
  Menu as MenuIconIcon,
  Analytics as AnalyticsIcon,
  Feedback as FeedbackIcon,
} from '@mui/icons-material';

const drawerWidth = 250;
const collapsedWidth = 70;

const userNavItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/' },
  { text: 'Products', icon: <SearchIcon />, path: '/products' },
  { text: 'Cart', icon: <ShoppingCartIcon />, path: '/cart' },
  { text: 'Orders', icon: <OrdersIcon />, path: '/orders' },
  { text: 'Restaurants', icon: <StoreIcon />, path: '/restaurants' },
  { text: 'Urgent Sales', icon: <UrgentSalesIcon />, path: '/urgent-sales' },
  { text: 'Free Food', icon: <FreeIcon />, path: '/free-food' },
  { text: 'Profile', icon: <ProfileIcon />, path: '/profile' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const hotelNavItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/hotel' },
  { text: 'Purchase History', icon: <HistoryIcon />, path: '/hotel/purchase-history' },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/hotel/inventory' },
  { text: 'Verification', icon: <VerificationIcon />, path: '/hotel/verification' },
  { text: 'Leftover Food', icon: <LeftoverIcon />, path: '/hotel/leftover-food' },
  { text: 'Urgent Sales', icon: <UrgentSalesIcon />, path: '/hotel/urgent-sales' },
  { text: 'Menu', icon: <MenuIconIcon />, path: '/hotel/menu' },
  { text: 'Profile', icon: <ProfileIcon />, path: '/hotel/profile' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/hotel/analytics' },
  { text: 'Feedback', icon: <FeedbackIcon />, path: '/hotel/feedback' },
  { text: 'Orders', icon: <OrdersIcon />, path: '/hotel/orders' },
];

export default function Layout() {
  const theme = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(true);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerHover = (expanded) => {
    setIsDrawerExpanded(expanded);
  };

  const drawer = (
    <Box
      sx={{
        height: '100%',
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(195deg, ${alpha(theme.palette.primary.dark, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`
          : `linear-gradient(195deg, ${alpha(theme.palette.primary.light, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isDrawerExpanded ? 'flex-start' : 'center',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(8px)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <LeafIcon sx={{ color: '#fff', fontSize: 24 }} />
        </Box>
        {isDrawerExpanded && (
          <Typography
            variant="h6"
            sx={{
              ml: 2,
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px',
            }}
          >
            Whole Check
          </Typography>
        )}
      </Box>

      {/* Menu Items */}
      <List sx={{ p: 2 }}>
        {userNavItems.map((item, index) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.path}
            sx={{
              mb: 0.5,
              borderRadius: '10px',
              color: location.pathname === item.path ? 'primary.main' : 'text.primary',
              bgcolor: location.pathname === item.path 
                ? alpha(theme.palette.primary.main, 0.1) 
                : 'transparent',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              },
              transition: 'all 0.2s ease',
              minHeight: 44,
              px: 1.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 36,
                color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
              }}
            >
              {item.icon}
            </ListItemIcon>
            {isDrawerExpanded && (
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: location.pathname === item.path ? 600 : 500,
                }}
              />
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${isDrawerExpanded ? drawerWidth : collapsedWidth}px)` },
          ml: { sm: `${isDrawerExpanded ? drawerWidth : collapsedWidth}px` },
          bgcolor: alpha(theme.palette.background.paper, 0.7),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 }, px: { xs: 2, sm: 3 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              color: 'text.primary',
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          {/* Notification and Profile */}
          <Stack direction="row" spacing={1}>
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                gap: 0.5,
                p: 0.5,
                borderRadius: '12px',
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Tooltip title="Notifications" arrow>
                <IconButton 
                  size="small"
                  sx={{ 
                    width: 36, 
                    height: 36,
                    color: 'text.primary',
                    '&:hover': { 
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <Badge 
                    badgeContent={4} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.65rem',
                        height: 16,
                        minWidth: 16,
                      },
                    }}
                  >
                    <NotificationsIcon sx={{ fontSize: 20 }} />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              <Tooltip title="Profile" arrow>
                <IconButton 
                  size="small"
                  sx={{ 
                    width: 36, 
                    height: 36,
                    color: 'text.primary',
                    '&:hover': { 
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <AccountIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            </Paper>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{
          width: { sm: isDrawerExpanded ? drawerWidth : collapsedWidth },
          flexShrink: { sm: 0 },
          transition: 'width 0.3s ease',
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'background.paper',
              borderRight: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: isDrawerExpanded ? drawerWidth : collapsedWidth,
              overflow: 'hidden',
              transition: 'width 0.3s ease',
              bgcolor: 'background.paper',
              borderRight: 'none',
              boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.08)}`,
            },
          }}
          open
          onMouseEnter={() => handleDrawerHover(true)}
          onMouseLeave={() => handleDrawerHover(false)}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${isDrawerExpanded ? drawerWidth : collapsedWidth}px)` },
          ml: { sm: `${isDrawerExpanded ? drawerWidth : collapsedWidth}px` },
          transition: 'all 0.3s ease',
          minHeight: '100vh',
          pt: { xs: 8, sm: 9 },
          px: { xs: 2, sm: 3 },
          pb: 4,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
} 