import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { LockOpen, Lock } from '@mui/icons-material';
import { useUser } from '../context/UserContext';

const AuthStatus = () => {
  const { isAuthenticated, user, isLoading } = useUser();
  
  if (isLoading) {
    return (
      <Tooltip title="Checking authentication...">
        <Chip
          icon={<Lock fontSize="small" />}
          label="Checking..."
          size="small"
          color="default"
          sx={{ 
            borderRadius: 1.5,
            '& .MuiChip-label': { fontWeight: 500 }
          }}
        />
      </Tooltip>
    );
  }
  
  if (isAuthenticated()) {
    return (
      <Tooltip title={`Logged in as ${user?.name || 'User'} (${user?.role || 'user'})`}>
        <Chip
          icon={<LockOpen fontSize="small" />}
          label={`${user?.name?.split(' ')[0] || 'User'}`}
          size="small"
          color="success"
          sx={{ 
            borderRadius: 1.5,
            '& .MuiChip-label': { fontWeight: 500 }
          }}
        />
      </Tooltip>
    );
  }
  
  return (
    <Tooltip title="Not authenticated">
      <Chip
        icon={<Lock fontSize="small" />}
        label="Not logged in"
        size="small"
        color="error"
        sx={{ 
          borderRadius: 1.5,
          '& .MuiChip-label': { fontWeight: 500 }
        }}
      />
    </Tooltip>
  );
};

export default AuthStatus; 