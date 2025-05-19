import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, List, ListItem, ListItemIcon, Typography, Tooltip, ListItemText, Collapse, IconButton, useMediaQuery, Drawer, ListItemButton, Button } from '@mui/material';
import { useThemeMode } from '../../context/ThemeContext';
import './SellerNavbar.css';

// Import icons
import { 
  Dashboard as DashboardIcon,
  Inventory2 as InventoryIcon,
  ShoppingBag as OrdersIcon,
  Person as ProfileIcon,
  Star as ReviewsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Storefront as StorefrontIcon,
  Payments as PaymentsIcon,
  LocalOffer as SalesIcon,
  SupportAgent as SupportIcon,
  Analytics as AnalyticsIcon,
  VerifiedUser as VerificationIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Home as HomeIcon,
  BarChart as BarChartIcon,
  ViewList as ViewListIcon,
  AddCircle as AddCircleIcon,
  Category as CategoryIcon,
  Pending as PendingIcon,
  LocalShipping as ShippingIcon,
  ManageAccounts as ManageAccountsIcon,
  Security as SecurityIcon,
  RateReview as RateReviewIcon,
  Reply as ReplyIcon,
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
  History as HistoryIcon,
  HelpCenter as HelpCenterIcon,
  ContactSupport as ContactSupportIcon,
  Discount as DiscountIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Spa as SpaIcon,
  NaturePeople,
  Grass as GrassIcon,
  LocalFlorist as LocalFloristIcon,
  FilterVintage as FilterVintageIcon,
  Agriculture as AgricultureIcon,
  EnergySavingsLeaf as EnergySavingsLeafIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

const SellerNavbar = ({ onExpand, mobileMenuOpen, setMobileMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useThemeMode();
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(min-width:601px) and (max-width:1024px)');
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const timeoutRef = useRef(null);
  const navbarRef = useRef(null);
  const submenuTimeoutRef = useRef(null);

  // Call onExpand callback when isExpanded changes
  useEffect(() => {
    if (onExpand) {
      onExpand(isExpanded);
    }
  }, [isExpanded, onExpand]);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      // Auto-collapse on mobile when resizing
      if (width <= 600 && isExpanded) {
        setIsExpanded(false);
      }
      
      // Auto-expand when switching from mobile to desktop
      if (width > 600 && !isTablet) {
        setIsExpanded(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded, isMobile, isTablet]);

  // Handle clicks outside the navbar to close it on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isExpanded && navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsExpanded(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isExpanded]);

  // Auto-expand menu for active item on initial load
  useEffect(() => {
    const currentPath = location.pathname;
    console.log("Current path for auto-expand:", currentPath);
    
    // Only expand menu initially on page load if we're not on desktop
    // For desktop, we'll let the hover behavior handle it
    if (isMobile || isTablet) {
      // First check for exact dashboard paths
      if (currentPath === '/seller' || currentPath === '/seller/') {
        // Expand Dashboard menu
        const dashboardIndex = navItems.findIndex(item => item.path === '/seller');
        if (dashboardIndex !== -1) {
          setExpandedMenu(dashboardIndex);
          console.log("Auto-expanding Dashboard menu at index:", dashboardIndex);
        }
        return;
      }
      
      // Then check for other paths
      const activeItemIndex = navItems.findIndex(item => 
        item.subItems && item.subItems.some(subItem => {
          const match = subItem.path === currentPath;
          if (match) console.log("Found matching submenu path:", subItem.path);
          return match;
        })
      );
      
      if (activeItemIndex !== -1) {
        console.log("Setting expanded menu to index:", activeItemIndex);
        setExpandedMenu(activeItemIndex);
      }
    }
  // Only run this effect on component mount, not on location changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Use mobileMenuOpen prop when available
  useEffect(() => {
    if (mobileMenuOpen !== undefined) {
      setIsMenuOpen(mobileMenuOpen);
    }
  }, [mobileMenuOpen]);

  // Update parent component when menu state changes
  useEffect(() => {
    if (setMobileMenuOpen && isMenuOpen !== mobileMenuOpen) {
      setMobileMenuOpen(isMenuOpen);
    }
  }, [isMenuOpen, setMobileMenuOpen, mobileMenuOpen]);

  // Clean up all timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (submenuTimeoutRef.current) {
        clearTimeout(submenuTimeoutRef.current);
      }
    };
  }, []);

  // Function to get vegetable-themed dropdown icon based on index
  const getDropdownIcon = (index, isOpen) => {
    // Rotating vegetable/plant-themed icons for dropdowns
    const icons = [
      isOpen ? <FilterVintageIcon fontSize="small" className="rotating-icon"/> : <FilterVintageIcon fontSize="small" />,
      isOpen ? <NaturePeople fontSize="small" className="rotating-icon"/> : <NaturePeople fontSize="small" />,
      isOpen ? <GrassIcon fontSize="small" className="rotating-icon"/> : <GrassIcon fontSize="small" />,
      isOpen ? <LocalFloristIcon fontSize="small" className="rotating-icon"/> : <LocalFloristIcon fontSize="small" />,
      isOpen ? <SpaIcon fontSize="small" className="rotating-icon"/> : <SpaIcon fontSize="small" />,
      isOpen ? <EnergySavingsLeafIcon fontSize="small" className="rotating-icon"/> : <EnergySavingsLeafIcon fontSize="small" />,
      isOpen ? <AgricultureIcon fontSize="small" className="rotating-icon"/> : <AgricultureIcon fontSize="small" />,
    ];
    
    // Use modulo to cycle through available icons
    return icons[index % icons.length];
  };

  // Define navigation items with their icons, routes, and submenus
  const navItems = [
    {
      path: '/seller',
      icon: <DashboardIcon />,
      label: 'Dashboard',
      color: '#4f46e5',
      subItems: [
        { path: '/seller', label: 'Overview', icon: <DashboardIcon fontSize="small" /> },
        { path: '/seller/analytics', label: 'Analytics', icon: <BarChartIcon fontSize="small" /> }
      ]
    },
    {
      path: '/seller/products',
      icon: <InventoryIcon />,
      label: 'Products',
      color: '#0ea5e9',
      subItems: [
        { path: '/seller/products', label: 'All Products', icon: <ViewListIcon fontSize="small" /> },
        { path: '/seller/products/add', label: 'Add Product', icon: <AddCircleIcon fontSize="small" /> },
        { path: '/seller/products/categories', label: 'Categories', icon: <CategoryIcon fontSize="small" /> }
      ]
    },
    {
      path: '/seller/orders',
      icon: <OrdersIcon />,
      label: 'Orders',
      badge: 3,
      color: '#f97316',
      subItems: [
        { path: '/seller/orders', label: 'All Orders', icon: <ViewListIcon fontSize="small" /> },
        { path: '/seller/orders/pending', label: 'Pending Orders', icon: <PendingIcon fontSize="small" /> },
        { path: '/seller/orders/shipping', label: 'Shipping', icon: <ShippingIcon fontSize="small" /> }
      ]
    },
    {
      path: '/seller/urgent-sales',
      icon: <SalesIcon />,
      label: 'Sales',
      color: '#ec4899',
      subItems: [
        { path: '/seller/urgent-sales', label: 'Manage Sales', icon: <DiscountIcon fontSize="small" /> }
      ]
    },
    {
      path: '/seller/profile',
      icon: <ProfileIcon />,
      label: 'Profile',
      color: '#14b8a6',
      subItems: [
        { path: '/seller/profile', label: 'My Profile', icon: <ManageAccountsIcon fontSize="small" /> },
        { path: '/seller/profile/security', label: 'Security', icon: <SecurityIcon fontSize="small" /> }
      ]
    },
    {
      path: '/seller/reviews',
      icon: <ReviewsIcon />,
      label: 'Reviews',
      color: '#eab308',
      subItems: [
        { path: '/seller/reviews', label: 'All Reviews', icon: <RateReviewIcon fontSize="small" /> },
        { path: '/seller/reviews/respond', label: 'Respond', icon: <ReplyIcon fontSize="small" /> }
      ]
    },
    {
      path: '/seller/payments',
      icon: <PaymentsIcon />,
      label: 'Payments',
      color: '#22c55e',
      subItems: [
        { path: '/seller/payments', label: 'Overview', icon: <AccountBalanceIcon fontSize="small" /> },
        { path: '/seller/payments/methods', label: 'Payment Methods', icon: <CreditCardIcon fontSize="small" /> },
        { path: '/seller/payments/history', label: 'Payment History', icon: <HistoryIcon fontSize="small" /> }
      ]
    },
    {
      path: '/seller/verification',
      icon: <VerificationIcon />,
      label: 'Verification',
      color: '#06b6d4',
      subItems: []
    },
    {
      path: '/seller/support',
      icon: <SupportIcon />,
      label: 'Support',
      color: '#8b5cf6',
      subItems: [
        { path: '/seller/support', label: 'Help Center', icon: <HelpCenterIcon fontSize="small" /> },
        { path: '/seller/support/contact', label: 'Contact Us', icon: <ContactSupportIcon fontSize="small" /> }
      ]
    },
    {
      path: '/seller/settings',
      icon: <SettingsIcon />,
      label: 'Settings',
      color: '#6b7280',
      subItems: [
        { path: '/seller/settings', label: 'General Settings', icon: <SettingsIcon fontSize="small" /> },
      ]
    }
  ];

  const isActive = (path) => {
    // Handle dashboard special case
    if (path === '/seller') {
      return (location.pathname === '/seller' || location.pathname === '/seller/') &&
             !location.pathname.includes('/seller/analytics');
    }
    
    // If we're checking for an exact match to current location
    if (path === location.pathname) {
      return true;
    }
    
    // Special handling for parent menus when their submenu is active
    for (const menuItem of navItems) {
      // Check if we're testing a parent menu path
      if (path === menuItem.path && menuItem.subItems && menuItem.subItems.length > 0) {
        // Check if any of this parent's submenu items are active
        const hasActiveSubmenu = menuItem.subItems.some(subItem => 
          subItem.path === location.pathname || 
          (subItem.path !== '/seller' && location.pathname.startsWith(subItem.path + '/'))
        );
        
        if (hasActiveSubmenu) {
          return true;
        }
      }
    }
    
    // For any other case, use exact matching
    return false;
  };

  const handleNavigation = (path) => {
    console.log('Navigating to:', path);
    navigate(path);
    // Close the navbar on mobile after navigation
    if (isMobile) {
      setIsExpanded(false);
      setIsMenuOpen(false);
      if (setMobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
  };

  const toggleMenu = (index) => {
    console.log('Toggling menu:', index);
    setExpandedMenu(expandedMenu === index ? null : index);
  };

  const handleMouseEnter = () => {
    // Clear any existing timeout to prevent flickering
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (!isMobile && !isTablet) {
      setIsExpanded(true);
      if (onExpand) onExpand(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isTablet) {
      // Add a delay before collapsing the sidebar to prevent flickering
      timeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
        setExpandedMenu(null);
        setHoveredMenu(null);
        if (onExpand) onExpand(false);
      }, 300); // 300ms delay
    }
  };

  // Update handleItemMouseEnter for better submenu handling
  const handleItemMouseEnter = (index) => {
    if (!isMobile && !isTablet) {
      // Clear any existing submenu timeout
      if (submenuTimeoutRef.current) {
        clearTimeout(submenuTimeoutRef.current);
        submenuTimeoutRef.current = null;
      }
      
      setHoveredMenu(index);
      
      // Always open submenu on hover if it has subitems
      const item = navItems[index];
      if (item && item.subItems && item.subItems.length > 0) {
        setExpandedMenu(index);
      }
    }
  };

  const handleItemMouseLeave = () => {
    if (!isMobile && !isTablet) {
      // Use a small delay before clearing the hovered menu state
      submenuTimeoutRef.current = setTimeout(() => {
        setHoveredMenu(null);
      }, 50);
    }
  };

  const toggleMobileExpansion = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    if (setMobileMenuOpen) {
      setMobileMenuOpen(newState);
    }
  };

  const handleOverlayClick = () => {
    if (isMobile && isExpanded) {
      setIsExpanded(false);
      setIsMenuOpen(false);
    }
  };

  // Determine which items to show on mobile
  const visibleNavItems = isMobile && !isExpanded 
    ? [] // Don't show any items in collapsed mobile view
    : navItems;

  const handleLogout = () => {
    // Implement logout functionality
    console.log('Logging out');
  };

  return (
    <>
      {isMobile ? (
        <>
          {/* Mobile Menu Toggle Button */}
          <IconButton
            onClick={toggleMobileExpansion}
            size="large"
            color="inherit"
            aria-label="menu"
            sx={{
              position: 'fixed',
              bottom: 80, // Position above the bottom navigation
              right: 16, // Position at the right side
              zIndex: 1200,
              bgcolor: '#4ade80', // Freshconnect green color
              color: 'white',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              '&:hover': {
                bgcolor: '#22c55e',
              },
              width: 56, // Larger size
              height: 56, // Larger size
              borderRadius: '50%',
            }}
          >
            <MenuIcon fontSize="medium" />
          </IconButton>

          {/* Mobile Drawer */}
          <Drawer
            anchor="bottom"
            open={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            PaperProps={{
              sx: {
                height: 'calc(100% - 65px)', // Leave space for bottom navigation
                maxHeight: '85vh',
                width: '100%', 
                bgcolor: '#192841',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
                borderRadius: '20px 20px 0 0',
                overflowX: 'hidden',
              }
            }}
            ModalProps={{
              keepMounted: true // Better open performance on mobile
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              p: 2, 
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              bgcolor: 'rgba(255,255,255,0.03)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EnergySavingsLeafIcon 
                  sx={{ 
                    fontSize: 28, 
                    color: '#4ade80', 
                    mr: 1.5,
                    filter: 'drop-shadow(0 0 3px rgba(74, 222, 128, 0.5))'
                  }} 
                />
                <Typography variant="h6" fontWeight="700" color="white">
                  Freshconnect Menu
                </Typography>
              </Box>
              <IconButton 
                onClick={() => setIsMenuOpen(false)} 
                sx={{ 
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.05)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Mobile Menu List */}
            <Box sx={{ 
              p: 2, 
              overflowY: 'auto', 
              height: 'calc(100% - 60px)',
              display: 'flex',
              flexDirection: 'column',
              width: '100%'
            }}>
              {/* Menu Header with Title */}
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600, 
                  color: 'white', 
                  textAlign: 'center' 
                }}
              >
                Menu Options
              </Typography>
              
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                gap: 1.5,
                px: 1,
              }}>
                {navItems.map((item, index, array) => (
                  <React.Fragment key={item.label}>
                    <Box>
                      {/* Main menu item */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 1.5,
                          borderRadius: '12px',
                          bgcolor: isActive(item.path) ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.15)',
                            transform: 'translateX(4px)'
                          },
                          '&:active': {
                            bgcolor: 'rgba(255,255,255,0.2)',
                            transform: 'translateX(0px)'
                          },
                          boxShadow: isActive(item.path) ? '0 2px 10px rgba(0,0,0,0.2)' : 'none'
                        }}
                        onClick={() => {
                          console.log('Menu item clicked:', item.label, item.path);
                          if (item.subItems && item.subItems.length > 0) {
                            toggleMenu(index);
                          } else {
                            handleNavigation(item.path);
                          }
                        }}
                      >
                        <Box 
                          sx={{ 
                            p: 1, 
                            borderRadius: '50%', 
                            bgcolor: `${item.color}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            minWidth: 40,
                            height: 40,
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                          }}
                        >
                          {React.cloneElement(item.icon, { style: { color: item.color, fontSize: '1.3rem' } })}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              color: 'white', 
                              fontWeight: isActive(item.path) ? 600 : 500,
                              fontSize: '1rem',
                            }}
                          >
                            {item.label}
                          </Typography>
                        </Box>
                        {item.badge && (
                          <Box 
                            sx={{ 
                              bgcolor: item.color,
                              color: 'white',
                              borderRadius: '12px',
                              px: 1,
                              py: 0.25,
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                              mr: 1,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                          >
                            {item.badge}
                          </Box>
                        )}
                        {item.subItems && item.subItems.length > 0 && (
                          <Box 
                            sx={{
                              transition: 'transform 0.3s ease',
                              transform: expandedMenu === index ? 'rotate(180deg)' : 'rotate(0deg)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {expandedMenu === index ? (
                              <ExpandLessIcon sx={{ color: 'white' }} />
                            ) : (
                              <ExpandMoreIcon sx={{ color: 'white' }} />
                            )}
                          </Box>
                        )}
                      </Box>
                      
                      {/* Submenu items */}
                      {item.subItems && item.subItems.length > 0 && (
                        <Collapse in={expandedMenu === index} timeout="auto">
                          <Box sx={{ 
                            ml: 5, 
                            mt: 1.5, 
                            mb: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            pl: 1,
                            borderLeft: `2px solid ${item.color}`
                          }}>
                            {item.subItems.map((subItem) => (
                              <Box 
                                key={subItem.label}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  p: 1.5,
                                  borderRadius: '8px',
                                  bgcolor: isActive(subItem.path) ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.15)',
                                    transform: 'translateX(4px)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                                  },
                                }}
                                onClick={() => {
                                  console.log('Submenu item clicked:', subItem.path);
                                  handleNavigation(subItem.path);
                                }}
                              >
                                {subItem.icon && (
                                  <Box sx={{ mr: 2, color: item.color }}>
                                    {subItem.icon}
                                  </Box>
                                )}
                                <Typography variant="body2" sx={{ color: 'white', fontWeight: isActive(subItem.path) ? 600 : 500 }}>
                                  {subItem.label}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Collapse>
                      )}
                    </Box>
                    {index < array.length - 1 && (
                      <Box 
                        sx={{ 
                          height: '1px', 
                          bgcolor: 'rgba(255,255,255,0.06)', 
                          width: '100%', 
                          my: 0.5 
                        }} 
                      />
                    )}
                  </React.Fragment>
                ))}
              </Box>
            </Box>
          </Drawer>
        </>
      ) : (
        // Desktop/Tablet Sidebar
        <Box
          ref={navbarRef}
          className={`seller-navbar ${isExpanded ? 'expanded' : 'collapsed'}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleMouseEnter}  // Ensure it expands on click as well
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            bgcolor: 'transparent', // Use the background from CSS
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
          }}
        >
          {/* Logo Area */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center', // Always center the logo
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              height: 64
            }}
          >
            {/* App Logo with Freshconnect and leaf icon */}
            {isExpanded ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EnergySavingsLeafIcon 
                  sx={{ 
                    fontSize: 28, 
                    color: '#4ade80', 
                    mr: 1,
                    filter: 'drop-shadow(0 0 3px rgba(74, 222, 128, 0.5))'
                  }} 
                />
                <Typography variant="h6" fontWeight="700" color="white">
                  Freshconnect
                </Typography>
              </Box>
            ) : (
              <Box 
                sx={{ 
                  width: 42, 
                  height: 42, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderRadius: '8px',
                  background: 'linear-gradient(45deg, rgba(74, 222, 128, 0.2), rgba(74, 222, 128, 0.1))',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}
              >
                <EnergySavingsLeafIcon 
                  sx={{ 
                    fontSize: 24, 
                    color: '#4ade80',
                    filter: 'drop-shadow(0 0 3px rgba(74, 222, 128, 0.5))'
                  }} 
                />
              </Box>
            )}
          </Box>

          {/* Navigation Menu Box */}
          <Box
            sx={{
              flex: 1,
              width: '100%',
              overflowY: 'auto', 
              overflowX: 'hidden',
              height: 'calc(100% - 64px)',
              paddingRight: 0, // Ensure no extra padding causes overflow
              '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar in WebKit browsers
              msOverflowStyle: 'none', // Hide scrollbar in IE/Edge
              scrollbarWidth: 'none', // Hide scrollbar in Firefox
            }}
          >
            <List component="nav" disablePadding sx={{ width: '100%', padding: '10px 8px' }}>
              {navItems.map((item, index) => (
                <React.Fragment key={item.label}>
                  <ListItem 
                    disablePadding 
                    sx={{ 
                      display: 'block', 
                      width: '100%',
                      margin: '4px 0',
                    }}
                  >
                    <ListItemButton
                      onClick={() => item.subItems && item.subItems.length > 0 ? toggleMenu(index) : handleNavigation(item.path)}
                      onMouseEnter={() => handleItemMouseEnter(index)}
                      onMouseLeave={handleItemMouseLeave}
                      selected={isActive(item.path)}
                      sx={{
                        justifyContent: isExpanded ? 'initial' : 'center',
                        px: isExpanded ? 2.5 : 2.5,
                        py: 1.2,
                        borderRadius: '10px',
                        minHeight: 44,
                        width: '100%',
                        textAlign: isExpanded ? 'left' : 'center',
                      }}
                    >
                      <ListItemIcon sx={{ 
                        minWidth: isExpanded ? 36 : 'auto',
                        color: isActive(item.path) ? item.color : (mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'text.secondary'),
                        mr: isExpanded ? 2 : 0,
                        justifyContent: 'center'
                      }}>
                        {item.icon}
                        {item.badge && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -4,
                              right: -4,
                              width: 18,
                              height: 18,
                              bgcolor: item.color,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                              color: 'white',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                          >
                            {item.badge}
                          </Box>
                        )}
                      </ListItemIcon>
                      
                      {isExpanded && (
                        <>
                          <ListItemText 
                            primary={item.label} 
                            primaryTypographyProps={{ 
                              fontWeight: isActive(item.path) ? '600' : '500',
                              fontSize: '1rem',
                              color: isActive(item.path) ? item.color : (mode === 'dark' ? 'white' : 'text.primary')
                            }} 
                          />
                          
                          {item.subItems && item.subItems.length > 0 && (
                            <Box sx={{ color: 'white' }}>
                              {expandedMenu === index ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </Box>
                          )}
                        </>
                      )}
                    </ListItemButton>
                  </ListItem>
                  
                  {item.subItems && (
                    <Collapse in={expandedMenu === index} timeout="auto" unmountOnExit sx={{ width: '100%' }}>
                      <List component="div" disablePadding sx={{ width: '100%' }}>
                        {item.subItems.map((subItem, subIndex) => (
                          <ListItemButton
                            key={subItem.label}
                            onClick={() => {
                              console.log('Submenu item clicked:', subItem.path);
                              handleNavigation(subItem.path);
                            }}
                            selected={isActive(subItem.path)}
                            sx={{
                              pl: 4,
                              py: 0.75,
                              borderRadius: '8px',
                              ml: 2,
                              mr: 0,
                              mb: 0.5,
                              width: 'calc(100% - 12px)', // Account for left margin
                              bgcolor: isActive(subItem.path) ? (mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent',
                              '&:hover': {
                                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                              }
                            }}
                          >
                            {subItem.icon && (
                              <ListItemIcon 
                                sx={{ 
                                  minWidth: 30, 
                                  mr: 1,
                                  color: isActive(subItem.path) ? item.color : (mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary')
                                }}
                              >
                                {subItem.icon}
                              </ListItemIcon>
                            )}
                            <ListItemText
                              primary={subItem.label}
                              primaryTypographyProps={{ 
                                fontSize: '0.9rem',
                                fontWeight: isActive(subItem.path) ? '500' : '400',
                                color: isActive(subItem.path) ? item.color : (mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'text.secondary')
                              }}
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              ))}
            </List>

            {/* Divider */}
            {isExpanded && (
              <Box sx={{ 
                width: '100%', 
                height: '1px', 
                bgcolor: 'rgba(255,255,255,0.1)', 
                my: 1.5,
                mx: 0
              }} />
            )}

            {/* Logout Button */}
            <List sx={{ width: '100%', padding: '0 8px' }}>
              <ListItem disablePadding sx={{ 
                display: 'block', 
                width: '100%',
                margin: '6px 0',
                mt: 2,
                mb: 1,
              }}>
                <ListItemButton 
                  onClick={handleLogout}
                  sx={{
                    justifyContent: isExpanded ? 'initial' : 'center',
                    px: isExpanded ? 2.5 : 2.5,
                    py: 1.2,
                    borderRadius: '10px',
                    minHeight: 44,
                    width: '100%',
                    color: '#ef4444',
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(239, 68, 68, 0.15)'
                    },
                    transition: 'all 0.2s ease',
                    textAlign: isExpanded ? 'left' : 'center',
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: 'inherit',
                    minWidth: isExpanded ? 36 : 'auto', 
                    mr: isExpanded ? 2 : 0,
                    justifyContent: 'center',
                  }}>
                    <LogoutIcon />
                  </ListItemIcon>
                  {isExpanded && (
                    <ListItemText 
                      primary="Logout" 
                      primaryTypographyProps={{ 
                        fontSize: '0.95rem',
                        fontWeight: 600,
                      }} 
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Box>
      )}
    </>
  );
};

export default SellerNavbar;