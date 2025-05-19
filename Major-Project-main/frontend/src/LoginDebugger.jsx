import React, { useState } from 'react';
import { Box, Typography, Paper, Button, TextField, Divider, Alert } from '@mui/material';
import * as authService from '../services/authService';
import { useUser } from '../context/UserContext';

const LoginDebugger = () => {
  const { login, user, isAuthenticated } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleDirectLogin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Clear any existing token before attempting to log in
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      console.log('Debug: Attempting direct login with:', email);
      
      // Call the auth service directly
      const response = await authService.login({
        email,
        password
      });
      
      console.log('Debug: Raw API response:', response);
      
      // Check if the response has the expected structure
      let userData = response;
      
      // Log the structure for debugging
      console.log('Debug: Response structure:', {
        hasToken: !!userData.token,
        hasAccessToken: !!userData.accessToken,
        keys: Object.keys(userData)
      });
      
      setResult({
        success: true,
        data: userData
      });
      
      // Try to login with the response
      const loginSuccess = login(userData);
      
      if (!loginSuccess) {
        setError('Login function failed to store user data');
      } else {
        console.log('Debug: Login successful, user data stored');
      }
    } catch (err) {
      console.log('Debug: Login error:', err);
      setError(err.message || 'Login failed');
      setResult({
        success: false,
        error: err.toString(),
        response: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  };
  
  const checkLocalStorage = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const redirectPath = localStorage.getItem('redirectAfterLogin');
    
    setResult({
      success: true,
      data: {
        token: token ? `${token.substring(0, 10)}...` : null,
        user: userData ? JSON.parse(userData) : null,
        redirectAfterLogin: redirectPath
      }
    });
  };
  
  const clearStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('redirectAfterLogin');
    setResult({
      success: true,
      data: 'Storage cleared'
    });
  };
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: 2,
        mb: 3
      }}
    >
      <Typography variant="h6" gutterBottom>Login Debugger</Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">Current Authentication Status:</Typography>
        <Typography variant="body1" fontWeight="medium">
          {isAuthenticated() ? 'Authenticated' : 'Not Authenticated'}
        </Typography>
      </Box>
      
      {user && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Current User:</Typography>
          <Typography variant="body2" component="pre" sx={{ 
            p: 1, 
            bgcolor: 'background.default',
            borderRadius: 1,
            overflowX: 'auto'
          }}>
            {JSON.stringify(user, null, 2)}
          </Typography>
        </Box>
      )}
      
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          size="small"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          size="small"
        />
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={handleDirectLogin}
          disabled={loading || !email || !password}
        >
          {loading ? 'Loading...' : 'Test Direct Login'}
        </Button>
        <Button 
          variant="outlined" 
          onClick={checkLocalStorage}
        >
          Check Storage
        </Button>
        <Button 
          variant="outlined" 
          color="error"
          onClick={clearStorage}
        >
          Clear Storage
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {result && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Result:</Typography>
          <Typography variant="body2" component="pre" sx={{ 
            p: 1, 
            bgcolor: result.success ? 'success.lighter' : 'error.lighter',
            borderRadius: 1,
            overflowX: 'auto'
          }}>
            {JSON.stringify(result.data, null, 2)}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default LoginDebugger; 