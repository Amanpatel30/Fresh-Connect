import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Divider,
  Paper,
  TextField,
  InputAdornment,
  Alert,
  Snackbar,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  FormControlLabel,
  Collapse,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  Visibility,
  VisibilityOff,
  Lock,
  VpnKey,
  PhoneAndroid,
  Email,
  Security,
  History,
  Logout,
  Delete,
  Save,
  CheckCircleOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const ProfileSecurity = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // State for password visibility
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  
  // State for 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  // State for notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  
  // State for account deletion dialog
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  
  // State for password validation
  const [passwordErrors, setPasswordErrors] = useState({});
  
  // State for alerts
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  
  // Mock login sessions data
  const loginSessions = [
    {
      device: 'Chrome on Windows',
      location: 'Mumbai, India',
      ip: '103.24.56.78',
      time: new Date(2023, 2, 10, 14, 30),
      current: true
    },
    {
      device: 'Android App',
      location: 'Bangalore, India',
      ip: '45.118.32.69',
      time: new Date(2023, 2, 9, 9, 15),
      current: false
    },
    {
      device: 'Safari on MacOS',
      location: 'Delhi, India',
      ip: '182.68.104.32',
      time: new Date(2023, 2, 5, 17, 45),
      current: false
    }
  ];
  
  // Handle password change form input
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    // Clear errors when typing
    if (passwordErrors[name]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: null
      });
    }
  };
  
  // Toggle password visibility
  const handleTogglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };
  
  // Validate password form
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must contain uppercase, lowercase, and numbers';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle password update submission
  const handleUpdatePassword = () => {
    if (!validatePasswordForm()) return;
    
    // In a real app, you would call an API to update the password
    
    // Show success message
    setAlert({
      open: true,
      message: 'Password updated successfully',
      severity: 'success'
    });
    
    // Reset form
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };
  
  // Handle 2FA toggle
  const handleTwoFactorToggle = () => {
    if (twoFactorEnabled) {
      // In a real app, you would call an API to disable 2FA
      setTwoFactorEnabled(false);
      setAlert({
        open: true,
        message: 'Two-factor authentication disabled',
        severity: 'info'
      });
    } else {
      setShowTwoFactorSetup(true);
    }
  };
  
  // Handle 2FA setup
  const handleTwoFactorSetup = () => {
    // In a real app, you would verify the code and enable 2FA
    if (verificationCode.length !== 6) {
      setAlert({
        open: true,
        message: 'Please enter a valid 6-digit code',
        severity: 'error'
      });
      return;
    }
    
    setTwoFactorEnabled(true);
    setShowTwoFactorSetup(false);
    setVerificationCode('');
    setAlert({
      open: true,
      message: 'Two-factor authentication enabled',
      severity: 'success'
    });
  };
  
  // Handle session logout
  const handleSessionLogout = (session) => {
    // In a real app, you would call an API to end the session
    if (session.current) {
      setAlert({
        open: true,
        message: 'You cannot end your current session from here',
        severity: 'warning'
      });
      return;
    }
    
    setAlert({
      open: true,
      message: 'Session ended successfully',
      severity: 'success'
    });
  };
  
  // Handle account deletion
  const handleDeleteAccount = () => {
    // In a real app, you would call an API to delete the account
    if (deleteConfirmationText !== 'delete my account') {
      setAlert({
        open: true,
        message: 'Please type "delete my account" to confirm',
        severity: 'error'
      });
      return;
    }
    
    setDeleteAccountDialogOpen(false);
    setDeleteConfirmationText('');
    
    // Show success message and redirect
    setAlert({
      open: true,
      message: 'Account deletion initiated. You will be logged out shortly.',
      severity: 'info'
    });
    
    // In a real app, you would redirect to a logged-out page after a delay
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };
  
  // Close alert
  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };
  
  return (
    <Box>
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
      
      <Box mb={4} display="flex" alignItems="center">
        <IconButton 
          onClick={() => navigate('/seller/profile')}
          sx={{ mr: 2, bgcolor: 'background.paper' }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Security Settings
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Password Section */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{ 
                p: 3, 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Lock color="primary" sx={{ mr: 2 }} />
              <Typography variant="h6">Change Password</Typography>
            </Box>
            
            <Divider />
            
            <CardContent>
              <Box component="form" noValidate>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="currentPassword"
                  label="Current Password"
                  type={showPassword.currentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  error={!!passwordErrors.currentPassword}
                  helperText={passwordErrors.currentPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleTogglePasswordVisibility('currentPassword')}
                          edge="end"
                        >
                          {showPassword.currentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="newPassword"
                  label="New Password"
                  type={showPassword.newPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  error={!!passwordErrors.newPassword}
                  helperText={passwordErrors.newPassword || 'Must be at least 8 characters with uppercase, lowercase, and numbers'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleTogglePasswordVisibility('newPassword')}
                          edge="end"
                        >
                          {showPassword.newPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type={showPassword.confirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  error={!!passwordErrors.confirmPassword}
                  helperText={passwordErrors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleTogglePasswordVisibility('confirmPassword')}
                          edge="end"
                        >
                          {showPassword.confirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  onClick={handleUpdatePassword}
                  startIcon={<Save />}
                >
                  Update Password
                </Button>
              </Box>
            </CardContent>
          </Paper>
        </Grid>
        
        {/* Two-Factor Authentication Section */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{ 
                p: 3, 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <VpnKey color="primary" sx={{ mr: 2 }} />
              <Typography variant="h6">Two-Factor Authentication</Typography>
            </Box>
            
            <Divider />
            
            <CardContent>
              <Typography variant="body1" paragraph>
                Two-factor authentication adds an extra layer of security to your account by requiring more than just a password to sign in.
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2
                }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Enable Two-Factor Authentication
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {twoFactorEnabled 
                      ? 'Your account is protected with 2FA' 
                      : 'Protect your account with 2FA'}
                  </Typography>
                </Box>
                <Switch
                  checked={twoFactorEnabled}
                  onChange={handleTwoFactorToggle}
                  color="primary"
                />
              </Box>
              
              <Collapse in={showTwoFactorSetup}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    mb: 3,
                    bgcolor: theme.palette.mode === 'dark' 
                      ? 'rgba(0, 0, 0, 0.2)' 
                      : 'rgba(0, 0, 0, 0.02)'
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    Set up Two-Factor Authentication
                  </Typography>
                  
                  <Box sx={{ textAlign: 'center', my: 2 }}>
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/FreshConnect:seller@example.com%3Fsecret=JBSWY3DPEHPK3PXP%26issuer=FreshConnect" 
                      alt="QR Code for 2FA" 
                      style={{ width: 150, height: 150, margin: '0 auto' }}
                    />
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Scan this QR code with your authenticator app
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1, bgcolor: 'background.paper', p: 1, borderRadius: 1 }}>
                      JBSWY3DPEHPK3PXP
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" gutterBottom>
                    Enter the 6-digit verification code from your authenticator app:
                  </Typography>
                  
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    sx={{ mt: 1, mb: 2 }}
                    inputProps={{ maxLength: 6, inputMode: 'numeric' }}
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                      color="inherit" 
                      onClick={() => setShowTwoFactorSetup(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={handleTwoFactorSetup}
                    >
                      Verify and Enable
                    </Button>
                  </Box>
                </Paper>
              </Collapse>
              
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Notification Settings
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailNotifications}
                      onChange={() => setEmailNotifications(!emailNotifications)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">Email Notifications</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Receive email alerts for unusual login attempts
                      </Typography>
                    </Box>
                  }
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    mb: 1
                  }}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={smsNotifications}
                      onChange={() => setSmsNotifications(!smsNotifications)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">SMS Notifications</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Receive text messages for suspicious activities
                      </Typography>
                    </Box>
                  }
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start'
                  }}
                />
              </Box>
            </CardContent>
          </Paper>
        </Grid>
        
        {/* Active Sessions Section */}
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{ 
                p: 3, 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <History color="primary" sx={{ mr: 2 }} />
              <Typography variant="h6">Active Sessions</Typography>
            </Box>
            
            <Divider />
            
            <CardContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                These are the devices that are currently logged into your account. If you see a session that you don't recognize, end it immediately and change your password.
              </Typography>
              
              <List sx={{ width: '100%' }}>
                {loginSessions.map((session, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemIcon>
                        <Security color={session.current ? 'primary' : 'action'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center">
                            {session.device}
                            {session.current && (
                              <Chip 
                                label="Current Session" 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {session.location}
                            </Typography>
                            {` — IP: ${session.ip} • Last active: ${format(session.time, 'dd MMM yyyy, hh:mm a')}`}
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<Logout />}
                          onClick={() => handleSessionLogout(session)}
                          disabled={session.current}
                        >
                          End Session
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < loginSessions.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Paper>
        </Grid>
        
        {/* Danger Zone Section */}
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              border: `1px solid ${theme.palette.error.light}`,
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{ 
                p: 3, 
                bgcolor: theme.palette.error.lighter,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Delete color="error" sx={{ mr: 2 }} />
              <Typography variant="h6" color="error">Danger Zone</Typography>
            </Box>
            
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Delete Your Account
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This will permanently delete your account and all your data. This action cannot be undone.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => setDeleteAccountDialogOpen(true)}
                >
                  Delete Account
                </Button>
              </Box>
            </CardContent>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteAccountDialogOpen}
        onClose={() => setDeleteAccountDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: theme.palette.error.main }}>
          Delete Account Confirmation
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.
          </Typography>
          
          <Typography variant="body1" paragraph>
            All your data, including products, orders, and payment information will be permanently deleted.
          </Typography>
          
          <Alert severity="warning" sx={{ my: 2 }}>
            Please type <b>delete my account</b> to confirm.
          </Alert>
          
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type 'delete my account' to confirm"
            value={deleteConfirmationText}
            onChange={(e) => setDeleteConfirmationText(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => setDeleteAccountDialogOpen(false)} 
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount} 
            color="error" 
            variant="contained"
            disabled={deleteConfirmationText !== 'delete my account'}
          >
            Permanently Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileSecurity; 