/**
 * Debug Configuration
 * 
 * This file controls the visibility of debugging components in the application.
 * Set these to false in production to hide debugging tools.
 */

// Set to false to hide the Authentication Debugger
export const SHOW_AUTH_DEBUGGER = false;

// Set to false to hide the Login Debugger
export const SHOW_LOGIN_DEBUGGER = false;

// Helper function to check if a debugger should be shown
export const shouldShowDebugger = (debuggerType) => {
  // In production, always hide debuggers
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  
  // Otherwise check the specific debugger config
  switch (debuggerType) {
    case 'auth':
      return SHOW_AUTH_DEBUGGER;
    case 'login':
      return SHOW_LOGIN_DEBUGGER;
    default:
      return false;
  }
}; 