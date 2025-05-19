import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { AlertOctagon, Home, LogIn } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user } = useUser();
  
  // Get the custom message if provided
  const message = location.state?.message || "You don't have permission to access this page.";

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: 'background.paper',
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            mb: 3
          }}
        >
          <AlertOctagon size={64} color="#ef4444" />
        </Box>
        
        <Typography variant="h3" color="error" gutterBottom fontWeight="bold">
          Unauthorized Access
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mb: 4 }}>
          {message}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
          <Button 
            variant="contained" 
            color="primary"
            size="large"
            onClick={() => navigate('/')}
            startIcon={<Home />}
          >
            Go Home
          </Button>
          
          {!isLoggedIn && (
            <Button 
              variant="outlined" 
              color="primary"
              size="large"
              onClick={() => navigate('/login', { state: { from: location } })}
              startIcon={<LogIn />}
            >
              Login
            </Button>
          )}
        </Box>
        
        {/* User diagnostic information */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ 
            mt: 4, 
            p: 3, 
            bgcolor: 'grey.100', 
            borderRadius: 2,
            textAlign: 'left'
          }}>
            <Typography variant="h6" gutterBottom>Debug Information:</Typography>
            <Box component="pre" sx={{ 
              p: 2, 
              bgcolor: 'background.paper', 
              borderRadius: 1,
              fontSize: '0.8rem',
              overflow: 'auto',
              maxHeight: 200
            }}>
              {JSON.stringify({
                user: user ? {
                  id: user._id,
                  email: user.email,
                  role: user.role,
                  isHotel: user.isHotel ? 'Yes' : 'No',
                } : 'Not logged in',
                currentPath: location.pathname,
                isLoggedIn: isLoggedIn ? 'Yes' : 'No',
                fromPath: location.state?.from?.pathname || 'N/A'
              }, null, 2)}
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Unauthorized; 