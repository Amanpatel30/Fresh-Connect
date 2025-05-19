import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Typography, IconButton, Badge, Avatar, Button, useMediaQuery, useTheme, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Dashboard as DashboardIcon,
  Inventory2 as InventoryIcon,
  ShoppingBag as OrdersIcon,
  LocalOffer as SalesIcon,
  Person as ProfileIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import SellerNavbar from '../seller/SellerNavbar';
import { useThemeMode } from '../../context/ThemeContext';
import AuthStatus from '../AuthStatus';
import LogoutButton from '../LogoutButton';
import { useUser } from '../../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';

const SellerLayout = () => {
  const { mode } = useThemeMode();
  const { user } = useUser();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(min-width:601px) and (max-width:1024px)');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileNavValue, setMobileNavValue] = useState(0);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Determine sidebar width based on screen size and expansion state
  const getSidebarWidth = () => {
    if (isMobile) return 0;
    if (isTablet) return sidebarExpanded ? 240 : 60;
    return sidebarExpanded ? 260 : 70;
  };

  // Handle sidebar expansion change
  const handleSidebarExpand = (expanded) => {
    setSidebarExpanded(expanded);
  };

  // Set the active mobile navigation value based on the current path
  useEffect(() => {
    console.log('Current location path:', location.pathname);
    
    if (location.pathname === '/seller') {
      console.log('Setting mobile nav value to 0 (Dashboard)');
      setMobileNavValue(0);
    }
    else if (location.pathname.startsWith('/seller/products')) {
      console.log('Setting mobile nav value to 1 (Products)');
      setMobileNavValue(1);
    }
    else if (location.pathname.startsWith('/seller/orders')) {
      console.log('Setting mobile nav value to 2 (Orders)');
      setMobileNavValue(2);
    }
    else if (location.pathname.startsWith('/seller/urgent-sales')) {
      console.log('Setting mobile nav value to 3 (Sales)');
      setMobileNavValue(3);
    }
    else if (location.pathname.startsWith('/seller/profile')) {
      console.log('Setting mobile nav value to 4 (Profile)');
      setMobileNavValue(4);
    }
  }, [location.pathname]);

  // Toggle search bar on mobile
  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    console.log('Toggling mobile menu, current state:', mobileMenuOpen);
    setMobileMenuOpen(!mobileMenuOpen);
    console.log('Mobile menu state after toggle:', !mobileMenuOpen);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      bgcolor: mode === 'dark' ? '#0f172a' : '#f8fafc',
      position: 'relative',
      overflow: 'hidden' 
    }}>
      {/* Sidebar */}
      {!isMobile ? (
        <SellerNavbar onExpand={handleSidebarExpand} />
      ) : (
        <SellerNavbar 
          onExpand={handleSidebarExpand} 
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { xs: 0, sm: `${getSidebarWidth()}px` },
          mt: { xs: 0, sm: 0 },
          mb: { xs: '65px', sm: 0 },
          p: { xs: 1.5, sm: 2, md: 3 },
          width: { xs: '100%', sm: `calc(100% - ${getSidebarWidth()}px)` },
          transition: 'all 0.3s ease',
          overflowX: 'hidden'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: { xs: 2, sm: 3 },
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            gap: { xs: 1, sm: 2 },
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* Left side - Title */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            width: { xs: '100%', md: 'auto' },
            justifyContent: { xs: 'space-between', md: 'flex-start' }
          }}>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              fontWeight="600" 
              color={mode === 'dark' ? 'white' : 'text.primary'}
            >
              {!isMobile ? 'Seller Dashboard' : 'Dashboard'}
            </Typography>
            {isMobile ? (
              <>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton 
                    onClick={toggleSearchBar}
                    size="small"
                    sx={{
                      bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '8px',
                      width: 36,
                      height: 36
                    }}
                  >
                    <SearchIcon sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)', fontSize: 20 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '8px',
                      width: 36,
                      height: 36
                    }}
                  >
                    <Badge badgeContent={4} color="error">
                      <NotificationsIcon sx={{ color: mode === 'dark' ? 'white' : 'text.primary', fontSize: 20 }} />
                    </Badge>
                  </IconButton>
                  <Avatar
                    src={user?.profileImage || "/avatar.jpg"}
                    alt={user?.name || "User"}
                    sx={{
                      width: 36,
                      height: 36,
                      cursor: 'pointer',
                      border: mode === 'dark' ? '2px solid rgba(255, 255, 255, 0.1)' : '2px solid rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </Box>
              </>
            ) : (
              <AuthStatus />
            )}
          </Box>

          {/* Mobile search bar - conditionally rendered */}
          {isMobile && showSearchBar && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: '8px',
                px: 2,
                py: 1,
                mb: 2,
                width: '100%',
                mt: 1
              }}
            >
              <SearchIcon sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)', mr: 1, fontSize: 20 }} />
              <input
                type="text"
                placeholder="Search..."
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: mode === 'dark' ? 'white' : 'black',
                  width: '100%',
                  fontSize: '14px'
                }}
              />
            </Box>
          )}

          {/* Desktop right side controls */}
          {!isMobile && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1, sm: 2 }, 
              width: { xs: '100%', md: 'auto' },
              flexWrap: { xs: 'wrap', sm: 'nowrap' }
            }}>
              {/* Search bar */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  flex: { xs: 1, md: 'auto' },
                  minWidth: { md: '240px' },
                  order: { xs: 1, sm: 1 }
                }}
              >
                <SearchIcon sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)', mr: 1 }} />
                <input
                  type="text"
                  placeholder="Search..."
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: mode === 'dark' ? 'white' : 'black',
                    width: '100%',
                    fontSize: '14px'
                  }}
                />
              </Box>

              {/* Filter button - hide on small mobile */}
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                sx={{
                  borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                  color: mode === 'dark' ? 'white' : 'text.primary',
                  '&:hover': {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                    bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                  },
                  display: { xs: 'none', sm: 'flex' },
                  order: { xs: 3, sm: 2 }
                }}
              >
                Filter
              </Button>

              {/* Notification icon */}
              <IconButton
                sx={{
                  bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                  },
                  order: { xs: 2, sm: 3 }
                }}
              >
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon sx={{ color: mode === 'dark' ? 'white' : 'text.primary' }} />
                </Badge>
              </IconButton>

              {/* User avatar */}
              <Avatar
                src={user?.profileImage || "/avatar.jpg"}
                alt={user?.name || "User"}
                sx={{
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  cursor: 'pointer',
                  border: mode === 'dark' ? '2px solid rgba(255, 255, 255, 0.1)' : '2px solid rgba(0, 0, 0, 0.1)',
                  order: { xs: 3, sm: 4 }
                }}
              />
              
              {/* Logout button - hide on small mobile */}
              <Box sx={{ display: { xs: 'none', sm: 'block' }, order: { xs: 4, sm: 5 } }}>
                <LogoutButton size="small" />
              </Box>
            </Box>
          )}
        </Box>

        {/* Page content */}
        <Box sx={{ position: 'relative', zIndex: 0 }}>
          <Outlet />
        </Box>
      </Box>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            zIndex: 1000,
            boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)',
            borderRadius: '16px 16px 0 0',
            overflow: 'hidden',
          }} 
          elevation={3}
        >
          <BottomNavigation
            value={mobileNavValue}
            onChange={(event, newValue) => {
              // Only change the navigation value if it's not the "More" button (index 5)
              if (newValue !== 5) {
                setMobileNavValue(newValue);
                switch(newValue) {
                  case 0:
                    navigate('/seller');
                    break;
                  case 1:
                    navigate('/seller/products');
                    break;
                  case 2:
                    navigate('/seller/orders');
                    break;
                  case 3:
                    navigate('/seller/urgent-sales');
                    break;
                  case 4:
                    navigate('/seller/profile');
                    break;
                  default:
                    break;
                }
              }
            }}
            showLabels
            sx={{ 
              bgcolor: mode === 'dark' ? '#1e293b' : 'white',
              height: 65,
              '& .MuiBottomNavigationAction-root': {
                color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                minWidth: 0,
                padding: '6px 4px',
                '&.Mui-selected': {
                  color: mode === 'dark' ? 'white' : 'primary.main',
                },
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.65rem',
                  marginTop: '2px'
                }
              }
            }}
          >
            <BottomNavigationAction label="Home" icon={<DashboardIcon />} />
            <BottomNavigationAction label="Products" icon={<InventoryIcon />} />
            <BottomNavigationAction 
              label="Orders" 
              icon={
                <Badge badgeContent={3} color="error">
                  <OrdersIcon />
                </Badge>
              } 
            />
            <BottomNavigationAction label="Sales" icon={<SalesIcon />} />
            <BottomNavigationAction label="Profile" icon={<ProfileIcon />} />
            <BottomNavigationAction 
              label="More" 
              icon={<MenuIcon />} 
              onClick={(e) => {
                e.stopPropagation(); // Prevent bottom navigation from handling this click
                toggleMobileMenu();
              }}
              sx={{
                color: '#4ade80 !important',
              }}
            />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};

export default SellerLayout; 