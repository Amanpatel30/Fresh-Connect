import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Box, useTheme, Typography, Menu, MenuItem, Divider, Avatar, Tooltip, Button } from '@mui/material';
import { Outlet, useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { 
  AppstoreOutlined, 
  ShopOutlined, 
  CodeOutlined, 
  SafetyCertificateOutlined, 
  NodeExpandOutlined, 
  DatabaseOutlined, 
  LogoutOutlined,
  SettingOutlined,
  BarChartOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
  DownOutlined,
  UpOutlined,
  PieChartOutlined,
  TeamOutlined,
  HistoryOutlined,
  BellOutlined,
  UserOutlined,
  FileOutlined
} from '@ant-design/icons';
import Icon3D from '../hotelOwner/Icon3D';
import '../hotelOwner/HotelOwner3D.css';

// Import our components
import Dashboard from '../hotelOwner/Dashboard';
import Inventory from '../hotelOwner/Inventory';
import PurchaseHistory from '../../pages/hotelOwner/PurchaseHistory';
import VerificationBadge from '../../pages/hotelOwner/VerifiedBadge';
import LeftoverFood from '../../pages/hotelOwner/LeftoverFood';
import UrgentSales from '../../pages/hotelOwner/UrgentSales'; // Import the new UrgentSales component

// Import actual components for hotel owner dashboard panels
import MenuManagement from '../../pages/hotelOwner/MenuManagement';
import ProfileSettings from '../../pages/hotelOwner/ProfileSettings';
import AnalyticsDashboard from '../../pages/hotelOwner/AnalyticsDashboard';
import CustomerFeedback from '../../pages/hotelOwner/CustomerFeedback';
import OrderManagement from '../../pages/hotelOwner/OrderManagement';
import VerificationDocuments from '../../pages/hotelOwner/VerificationDocuments';

// Custom tooltip component - memoized to prevent unnecessary re-renders
const CustomTooltip = React.memo(({ children, label, visible }) => {
  return (
    <div className="tooltip-wrapper">
      {children}
    </div>
  );
});

const HotelOwnerLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser(); // Get user and logout function from context
  const [activeTab, setActiveTab] = useState(location.pathname.split('/')[2] || 'dashboard');
  const [showTabSet, setShowTabSet] = useState(1); // 1 for primary tabs, 2 for secondary tabs
  const sidebarRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // User profile menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // Handle user menu open
  const handleUserMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle user menu close
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle logout
  const handleLogout = () => {
    handleUserMenuClose(); // Close the menu
    logout(); // Call the logout function from context
  };

  // Define primary navigation items with their 3D icons - memoized
  const primaryNavItems = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: AppstoreOutlined, path: '/hotel/dashboard', color: '#6366f1' },
    { id: 'purchase-history', label: 'Purchase History', icon: ShopOutlined, path: '/hotel/purchase-history', color: '#ef4444' },
    { id: 'inventory', label: 'Inventory Management', icon: CodeOutlined, path: '/hotel/inventory', color: '#3b82f6' },
    { id: 'verification', label: 'Verified Badge Management', icon: SafetyCertificateOutlined, path: '/hotel/verification', color: '#a78bfa' },
    { id: 'leftover-food', label: 'Leftover Food Listing', icon: NodeExpandOutlined, path: '/hotel/leftover-food', color: '#10b981' },
    { id: 'urgent-sales', label: 'Urgent Food Sale', icon: DatabaseOutlined, path: '/hotel/urgent-sales', color: '#22c55e' },
    { id: 'menu', label: 'Menu Management', icon: PieChartOutlined, path: '/hotel/menu', color: '#06b6d4' },
    { id: 'profile', label: 'Profile Settings', icon: UserOutlined, path: '/hotel/profile', color: '#8b5cf6' },
    { id: 'analytics', label: 'Analytics Dashboard', icon: BarChartOutlined, path: '/hotel/analytics', color: '#f59e0b' },
    { id: 'feedback', label: 'Customer Feedback', icon: MessageOutlined, path: '/hotel/feedback', color: '#ec4899' },
    { id: 'orders', label: 'Order Management', icon: ShoppingCartOutlined, path: '/hotel/orders', color: '#f97316' },
    { id: 'documents', label: 'Verification Documents', icon: FileOutlined, path: '/hotel/documents', color: '#64748b' },
    // Add logout as a navigation item
    { id: 'logout', label: 'Logout', icon: LogoutOutlined, action: handleLogout, color: '#ef4444' },
  ], [handleLogout]);

  // Define secondary navigation items (empty, but we'll keep the structure)
  const secondaryNavItems = [];

  // Get current nav items based on which set is shown
  const currentNavItems = primaryNavItems;

  // Memoize event handlers to prevent unnecessary re-renders
  const handleTabChange = useCallback((itemId) => {
    // Get the clicked item
    const item = primaryNavItems.find(i => i.id === itemId);
    
    // If the item has an action function, execute it
    if (item && item.action) {
      item.action();
      return;
    }
    
    // Otherwise, navigate to the path
    setActiveTab(itemId);
    navigate(item?.path || '/hotel/dashboard');
  }, [navigate, primaryNavItems]);

  // Add a useEffect to ensure proper viewport settings for mobile
  useEffect(() => {
    // Check if viewport meta tag exists
    let viewport = document.querySelector('meta[name="viewport"]');
    
    // If it doesn't exist, create it
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    
    // Set the content attribute for proper mobile rendering
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    
    // Cleanup on unmount
    return () => {
      // Option to restore original viewport if needed
      // document.head.removeChild(viewport);
    };
  }, []);

  // Dragging functionality for sidebar
  const handleMouseDown = useCallback((e) => {
    const isRightClick = e.button === 2;
    const isMobile = window.innerWidth <= 768;
    
    if (!isMobile && !isRightClick) {
      return;
    }

    if (isRightClick) {
      e.preventDefault();
    }
    
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setScrollLeft(sidebarRef.current ? sidebarRef.current.scrollLeft : 0);
    
    if (sidebarRef.current) {
      sidebarRef.current.classList.add('dragging');
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    if (!sidebarRef.current) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = clientX - startX;
    sidebarRef.current.scrollLeft = scrollLeft - x;
  }, [isDragging, startX, scrollLeft]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (sidebarRef.current) {
      sidebarRef.current.classList.remove('dragging');
    }
  }, []);

  // Add mouseup event listener to document to handle cases when mouse is released outside sidebar
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMouseUp]);

  // Prevent context menu on right-click for the sidebar
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
  }, []);

  // Add wheel event handler for touchpad scrolling
  const handleWheel = useCallback((e) => {
    // Only handle wheel events on mobile view
    if (window.innerWidth > 768) {
      return;
    }

    // Prevent the default scroll behavior
    e.preventDefault();
    
    // Scroll horizontally based on the deltaY of the wheel event
    if (sidebarRef.current) {
      sidebarRef.current.scrollLeft += e.deltaY;
    }
  }, []);

  // Add wheel event listener to the sidebar
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (sidebar) {
      sidebar.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      if (sidebar) {
        sidebar.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleWheel]);

  // Find current item
  const currentItem = useMemo(() => 
    primaryNavItems.find(i => i.id === activeTab), 
    [primaryNavItems, activeTab]
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: 'rgb(206, 208, 237)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Left Sidebar */}
      <Box
        component="aside"
        className="sidebar-container"
        ref={sidebarRef}
        sx={{
          position: 'fixed',
          left: 20,
          top: 0,
          height: '100vh',
          width: '130px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          overflow: 'visible',
          padding: '40px 0',
          WebkitOverflowScrolling: 'touch',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onContextMenu={handleContextMenu}
      >
        {/* Navigation Icons */}
        <Box 
          className="sidebar-inner"
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 0, 
            alignItems: 'center',
            py: 4,
            px: 3,
            width: '120px',
            height: 'calc(100vh - 100px)',
            maxHeight: '85vh',
            position: 'relative',
            borderRadius: '30px',
            overflowY: 'auto',
            overflowX: 'hidden',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              display: 'none'
            }
          }}
        >
          {/* Current Navigation Items */}
          <AnimatePresence initial={false}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 60,
                  damping: 20,
                  duration: 0.4
                }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '9px',
                alignItems: 'center',
                width: '100%',
                padding: '0px 0',
                flex: 1,
              }}
            >
              {currentNavItems.map((item) => (
                <div
                  key={item.id}
                  className={`tooltip-container ${activeTab === item.id ? 'tooltip-container-active' : ''}`}
                  style={{ margin: '2px 0' }}
                >
                  <Icon3D 
                    icon={item.icon} 
                    color={item.color} 
                    isActive={activeTab === item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`icon-container ${activeTab === item.id ? 'icon-active' : ''}`}
                  />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Divider */}
          <Box 
            sx={{ 
              width: '50px', 
              height: '2px', 
              background: 'rgba(255, 255, 255, 0.5)',
              my: 2
            }} 
          />
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          ml: { xs: 0, sm: '170px' },
          mt: { xs: 1, sm: 2 },
          mb: { xs: '80px', sm: 0 },
          maxWidth: { xs: '100%', sm: 'calc(100vw - 190px)' },
          overflowX: 'hidden',
          backgroundColor: theme.palette.mode === 'dark' ? '#111827' : '#f8fafc',
          borderRadius: { xs: '0', sm: '30px 30px 30px 30px' },
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          minHeight: '8vh',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
        }}
      >
        <div
          className="dashboard-content"
            style={{ 
            width: '100%',
              height: '100%',
            padding: '20px 0    ',
            // borderRadius: '30000px',
            }}
          >
          {/* Dashboard Header */}
            <Box
            className="content-header" 
              sx={{
              mb: 3, 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              overflow: 'hidden',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 }
            }}
          >
            <Typography variant="h4" sx={{ 
              fontWeight: 600, 
              color: theme.palette.mode === 'dark' ? 'white' : '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}>
              <Box 
                component="span" 
                sx={{ 
                  display: 'inline-flex',
                  p: { xs: 1, sm: 1.5 },
                  borderRadius: '16px',
                  bgcolor: currentItem?.color + '20',
                }}
              >
                {currentItem && React.createElement(currentItem.icon, {
                  style: { 
                    fontSize: window.innerWidth < 600 ? '24px' : '32px',
                    color: currentItem.color
                  }
                })}
              </Box>
              {currentItem?.label}
              </Typography>
            
            {/* Header Buttons */}
              <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Notifications">
                <button className="header-button">
                  <BellOutlined />
                </button>
              </Tooltip>

              <Tooltip title="Account Settings">
                <button 
                  className="header-button"
                  onClick={handleUserMenuClick}
                  aria-controls={open ? 'user-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                >
                  <UserOutlined />
                </button>
              </Tooltip>
            </Box>
            
            {/* User Menu */}
            <Menu
              id="user-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleUserMenuClose}
              MenuListProps={{
                'aria-labelledby': 'user-button',
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              sx={{
                '& .MuiPaper-root': {
                  borderRadius: '16px',
                  minWidth: '180px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  mt: 1.5,
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {user?.name || 'Hotel Manager'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                  {user?.email || 'manager@hotel.com'}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { handleUserMenuClose(); navigate('/hotel/profile'); }}>
                <UserOutlined style={{ marginRight: 8 }} /> Profile
              </MenuItem>
              <MenuItem onClick={() => { handleUserMenuClose(); navigate('/hotel/settings'); }}>
                <SettingOutlined style={{ marginRight: 8 }} /> Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <LogoutOutlined style={{ marginRight: 8 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
          
          {/* Main Dashboard Content - Switch based on active tab */}
          <Box className="glass-effect" sx={{ 
            p: { xs: 2, sm: 3 }, 
            borderRadius: '20px',
            height: { xs: 'calc(100vh - 180px)', sm: 'calc(100vh - 160px)' },
            overflowY: 'auto'
          }}>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/purchase-history" element={<PurchaseHistory />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/verification" element={<VerificationBadge />} />
              <Route path="/leftover-food" element={<LeftoverFood />} />
              <Route path="/urgent-sales" element={<UrgentSales />} />
              <Route path="/menu" element={<MenuManagement />} />
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/feedback" element={<CustomerFeedback />} />
              <Route path="/orders" element={<OrderManagement />} />
              <Route path="/documents" element={<VerificationDocuments />} />
              <Route path="/*" element={<Navigate to="/hotel/dashboard" replace />} />
            </Routes>
            </Box>
        </div>
      </Box>
    </Box>
  );
};

export default React.memo(HotelOwnerLayout); 