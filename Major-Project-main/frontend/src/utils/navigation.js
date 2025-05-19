import { isPublicRoute } from '../components/auth/AuthWrapper';

/**
 * Navigate to a route with authentication check
 * 
 * @param {function} navigate - React Router's navigate function
 * @param {string} path - The path to navigate to
 * @param {boolean} isLoggedIn - Whether the user is logged in
 * @param {object} options - Additional navigation options
 * @returns {boolean} - Whether the navigation was handled
 */
export const navigateWithAuth = (navigate, path, isLoggedIn, options = {}) => {
  // Check if the path is public
  const isPublic = isPublicRoute(path);
  
  // If the path is public or the user is logged in, navigate directly
  if (isPublic || isLoggedIn) {
    navigate(path, options);
    return true;
  }
  
  // If the path is protected and the user is not logged in,
  // redirect to login with state to redirect back after login
  navigate('/login', { 
    state: { 
      from: { pathname: path },
      ...options.state 
    },
    ...options 
  });
  return false;
};

/**
 * Navigate to a hotel route with authentication check
 * 
 * @param {function} navigate - React Router's navigate function
 * @param {string} path - The path to navigate to
 * @param {boolean} isLoggedIn - Whether the user is logged in
 * @param {boolean} isHotel - Whether the user is a hotel
 * @param {object} options - Additional navigation options
 * @returns {boolean} - Whether the navigation was handled
 */
export const navigateToHotelRoute = (navigate, path, isLoggedIn, isHotel, options = {}) => {
  // Remove leading slash if it exists
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullPath = cleanPath.startsWith('/hotel') ? cleanPath : `/hotel${cleanPath}`;
  
  // If the user is logged in but not a hotel, show an error
  if (isLoggedIn && !isHotel) {
    navigate('/unauthorized', { 
      state: { 
        message: 'You do not have permission to access hotel pages',
        ...options.state
      },
      ...options 
    });
    return false;
  }
  
  // Otherwise use standard auth navigation
  return navigateWithAuth(navigate, fullPath, isLoggedIn, options);
}; 