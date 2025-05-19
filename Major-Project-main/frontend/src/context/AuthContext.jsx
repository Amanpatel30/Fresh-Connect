import React from 'react';
import { UserProvider } from './UserContext';

// This is a wrapper component that re-exports the UserProvider as AuthProvider
// This allows us to maintain backward compatibility with code expecting an AuthProvider
export const AuthProvider = ({ children }) => {
  return <UserProvider>{children}</UserProvider>;
};

// Re-export the useUser hook as useAuth for consistency
export { useUser as useAuth } from './UserContext'; 