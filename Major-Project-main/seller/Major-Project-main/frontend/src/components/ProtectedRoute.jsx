import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import LoadingScreen from './LoadingScreen';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, isLoading, refreshUser } = useUser();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [authStatus, setAuthStatus] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      if (isLoading) {
        console.log('ProtectedRoute: Still loading user data from context');
        return; // Wait for the context to finish loading
      }
      
      console.log('ProtectedRoute: Checking authentication for path:', location.pathname);
      
      // Try to refresh user data from localStorage if not available
      if (!user) {
        const refreshed = refreshUser();
        console.log('ProtectedRoute: Attempted to refresh user data:', refreshed ? 'Success' : 'Failed');
      }
      
      // Check authentication status
      const isAuth = isAuthenticated();
      console.log('ProtectedRoute: Authentication status:', isAuth ? 'Authenticated' : 'Not authenticated');
      setAuthStatus(isAuth);
      
      // If not authenticated, store the current path for redirect after login
      if (!isAuth) {
        console.log('ProtectedRoute: User not authenticated, storing redirect path:', location.pathname);
        localStorage.setItem('redirectAfterLogin', location.pathname);
      } else if (user) {
        console.log('ProtectedRoute: User authenticated as:', user.name || user.email, 'with role:', user.role);
      }
      
      setIsChecking(false);
    };
    
    checkAuthentication();
  }, [isLoading, isAuthenticated, location.pathname, refreshUser, user]);

  // Show loading screen while checking authentication
  if (isLoading || isChecking) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // Check if user is authenticated
  if (!authStatus) {
    console.log('ProtectedRoute: Redirecting to login from:', location.pathname);
    return <Navigate to="/login" state={{ from: location, redirectTo: location.pathname }} replace />;
  }

  // If role is required, check if user has the required role
  if (requiredRole && user?.role !== requiredRole) {
    console.log(`ProtectedRoute: User role (${user?.role}) doesn't match required role (${requiredRole})`);
    
    // Redirect to appropriate home page based on user role
    if (user?.role === 'seller') {
      return <Navigate to="/seller" replace />;
    } else if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === 'hotel') {
      return <Navigate to="/hotel-owner" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }

  // If authenticated and has required role (or no role required), render children
  return children;
};

export default ProtectedRoute; 