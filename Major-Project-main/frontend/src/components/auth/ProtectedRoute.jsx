import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { checkAuthStatus, checkAuthStatusDirect } from '../../services/api.jsx';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isLoggedIn, loading, authChecked, hasHotelPermissions } = useUser();
  const location = useLocation();
  const [verifyingAuth, setVerifyingAuth] = useState(true);
  const [authValid, setAuthValid] = useState(null);
  
  // Public routes that should never be protected
  const publicRoutes = [
    '/',
    '/home',
    '/hotel/register',
    '/hotel/logout',
    '/login',
    '/register',
    '/force-logout',
    '/about-us',
    '/contact-us',
    '/terms-conditions',
    '/privacy-policy',
    '/faq',
    '/blog',
    '/support',
    '/restaurants',
    '/products'
  ];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.includes(location.pathname);
  
  // If this is a public route, render the children immediately
  if (isPublicRoute) {
    console.log('Public route detected:', location.pathname);
    return children;
  }

  // Debug logging
  useEffect(() => {
    if (user) {
      console.log('ProtectedRoute - User data:', {
        id: user._id,
        email: user.email,
        role: user.role,
        isHotel: user.isHotel,
        hotelId: user.hotelId,
        token: user.token ? 'present' : 'missing',
        hasHotelPermissions: hasHotelPermissions()
      });
    } else {
      console.log('ProtectedRoute - No user data found');
    }
    console.log('Current path:', location.pathname);
    console.log('Allowed roles:', allowedRoles);
    console.log('localStorage token:', localStorage.getItem('token') ? 'present' : 'missing');
  }, [user, location.pathname, allowedRoles, hasHotelPermissions]);

  // Verify token directly with the backend
  useEffect(() => {
    const verifyAuth = async () => {
      // If public route, skip verification
      if (isPublicRoute) {
        console.log('⭐ ROUTE: Public route - skipping auth check');
        setVerifyingAuth(false);
        setAuthValid(true);
        return;
      }
      
      // If not logged in, skip verification
      if (!isLoggedIn) {
        console.log('⭐ ROUTE: Not logged in - failing auth check');
        setVerifyingAuth(false);
        setAuthValid(false);
        return;
      }
      
      // Log the token that will be used for verification
      const token = localStorage.getItem('token');
      console.log('⭐ ROUTE: Found token for auth check:', token ? `${token.substring(0, 10)}...` : 'none');
      console.log('⭐ ROUTE: Token length:', token ? token.length : 0);
      
      try {
        console.log('⭐ ROUTE: Verifying authentication with backend (direct method)...');
        
        // Try the direct method first
        const directResponse = await checkAuthStatusDirect();
        
        if (directResponse.isValid) {
          console.log('⭐ ROUTE: Direct auth check succeeded');
          setAuthValid(true);
        } else {
          console.log('⭐ ROUTE: Direct auth check failed with status:', directResponse.status);
          
          // Only set auth as invalid for auth-specific errors
          if (directResponse.status === 401) {
            console.warn('⭐ ROUTE: Auth failed (401) - will redirect to login');
            setAuthValid(false);
          } else {
            // For other errors, maintain current session
            console.warn('⭐ ROUTE: Non-auth error - maintaining current session');
            setAuthValid(true);
          }
        }
      } catch (err) {
        console.error('⭐ ROUTE: Auth verification exception:', err);
        // Maintain session on unexpected errors
        setAuthValid(true);
      } finally {
        setVerifyingAuth(false);
      }
    };
    
    verifyAuth();
  }, [isLoggedIn, location.pathname, isPublicRoute]);

  // While checking authentication, show loading spinner
  if (loading || verifyingAuth) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // If not logged in or auth is invalid, redirect to appropriate login page
  if (!isLoggedIn || authValid === false) {
    console.log('Not logged in or auth invalid, redirecting to login');
    // Always redirect to the main login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Special case for hotel routes - allow access if user has any hotel-related properties
  if (location.pathname.startsWith('/hotel') && 
      !isPublicRoute) {
    
    // Use the hasHotelPermissions function to check access
    const isHotelOwner = hasHotelPermissions();
      
    console.log('Hotel route access check:', isHotelOwner ? 'granted' : 'denied');
    
    if (!isHotelOwner) {
      console.warn('Access denied: User is not a hotel owner');
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is logged in and has the required role, render the children
  return children;
};

export default ProtectedRoute; 