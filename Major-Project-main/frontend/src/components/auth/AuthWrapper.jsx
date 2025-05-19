import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// List of routes that should always be accessible without login
export const publicRoutes = [
  '/',
  '/home',
  '/login',
  '/register',
  '/hotel/register',
  '/hotel/logout',
  '/about-us',
  '/contact-us',
  '/terms-conditions',
  '/privacy-policy',
  '/faq',
  '/support',
  '/forgot-password',
  '/reset-password',
  '/email-verification',
  '/force-logout'
];

/**
 * Helper function to check if a path is public
 * @param {string} path - The path to check
 * @returns {boolean} - Whether the path is public
 */
export const isPublicRoute = (path) => {
  return publicRoutes.some(route => 
    path === route || path.startsWith('/blog')
  );
};

/**
 * AuthWrapper - Route protection component that redirects to login if user is not authenticated
 * Allows access to public routes without authentication
 */
const AuthWrapper = ({ children }) => {
  const { isLoggedIn, loading, authChecked } = useUser();
  const location = useLocation();
  
  // Check if the current path is a public route
  const isCurrentRoutePublic = isPublicRoute(location.pathname);
  
  // If this is a public route, allow access
  if (isCurrentRoutePublic) {
    return children;
  }

  // While checking authentication, show loading spinner
  if (loading || !authChecked) {
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

  // If not logged in, redirect to login page with return path
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is logged in, render the protected content
  return children;
};

export default AuthWrapper; 