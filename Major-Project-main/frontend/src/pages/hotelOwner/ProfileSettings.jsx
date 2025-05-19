import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import PreviewIcon from '@mui/icons-material/Preview';

const ProfileSettings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Add form validation state
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Profile data
  const [profileData, setProfileData] = useState({
    name: 'Taj Hotel & Restaurant',
    email: 'info@tajhotel.com',
    phone: '+91 9876543210',
    address: '123 Main Street, Mumbai, Maharashtra 400001',
    description: 'A luxury hotel and restaurant offering authentic Indian cuisine with a modern twist. We specialize in both vegetarian and non-vegetarian dishes prepared by our expert chefs.',
    website: 'www.tajhotel.com',
    foundedYear: '1995',
    ownerName: 'Rajan Patel',
    profileImage: 'https://source.unsplash.com/random/200x200/?restaurant',
    coverImage: 'https://source.unsplash.com/random/1200x400/?restaurant-interior'
  });

  // Password change data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    orderUpdates: true,
    marketingEmails: false,
    securityAlerts: true,
    appUpdates: true
  });

  // Add state for image previews
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setEditMode(false);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
    
    // Clear error for this field when user makes changes
    if (profileErrors[name]) {
      setProfileErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    // Clear error for this field when user makes changes
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked
    });
  };

  const validateProfileData = () => {
    const errors = {};
    
    // Validate name
    if (!profileData.name || profileData.name.trim() === '') {
      errors.name = 'Hotel name is required';
    } else if (profileData.name.length < 3) {
      errors.name = 'Hotel name must be at least 3 characters';
    } else if (profileData.name.length > 100) {
      errors.name = 'Hotel name must be less than 100 characters';
    }
    
    // Validate email
    if (!profileData.email || profileData.email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(profileData.email)) {
      errors.email = 'Invalid email address';
    }
    
    // Validate phone
    if (!profileData.phone || profileData.phone.trim() === '') {
      errors.phone = 'Phone number is required';
    } else if (!/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(profileData.phone)) {
      errors.phone = 'Invalid phone number format';
    }
    
    // Validate address
    if (!profileData.address || profileData.address.trim() === '') {
      errors.address = 'Address is required';
    } else if (profileData.address.length < 10) {
      errors.address = 'Address must be at least 10 characters';
    } else if (profileData.address.length > 200) {
      errors.address = 'Address must be less than 200 characters';
    }
    
    // Validate owner name
    if (!profileData.ownerName || profileData.ownerName.trim() === '') {
      errors.ownerName = 'Owner name is required';
    } else if (profileData.ownerName.length < 3) {
      errors.ownerName = 'Owner name must be at least 3 characters';
    } else if (profileData.ownerName.length > 100) {
      errors.ownerName = 'Owner name must be less than 100 characters';
    }
    
    // Validate founded year
    if (profileData.foundedYear) {
      const year = parseInt(profileData.foundedYear);
      const currentYear = new Date().getFullYear();
      if (isNaN(year)) {
        errors.foundedYear = 'Founded year must be a valid number';
      } else if (year < 1900 || year > currentYear) {
        errors.foundedYear = `Founded year must be between 1900 and ${currentYear}`;
      }
    }
    
    // Validate website (optional)
    if (profileData.website && !profileData.website.match(/^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/)) {
      errors.website = 'Invalid website format';
    }
    
    // Validate description (optional)
    if (profileData.description && profileData.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordData = () => {
    const errors = {};
    
    // Validate current password
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    } else if (passwordData.currentPassword.length < 6) {
      errors.currentPassword = 'Current password is invalid';
    }
    
    // Validate new password
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    } else if (passwordData.newPassword === passwordData.currentPassword) {
      errors.newPassword = 'New password must be different from current password';
    }
    
    // Validate confirm password
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = () => {
    // Validate profile data
    if (!validateProfileData()) {
      setSnackbar({
        open: true,
        message: 'Please correct the errors in the form',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
      setEditMode(false);
      setLoading(false);
    }, 1500);
  };

  const handleSavePassword = () => {
    // Validate password data
    if (!validatePasswordData()) {
      setSnackbar({
        open: true,
        message: 'Please correct the errors in the form',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setSnackbar({
        open: true,
        message: 'Password updated successfully!',
        severity: 'success'
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setLoading(false);
    }, 1500);
  };

  const handleSaveNotifications = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setSnackbar({
        open: true,
        message: 'Notification settings updated successfully!',
        severity: 'success'
      });
      setLoading(false);
    }, 1500);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setProfileImagePreview(previewUrl);
    
    // In a real app, you would handle file upload here
    console.log('Profile image change:', file);
    
    // For demo, we'll just show a success message
    setSnackbar({
      open: true,
      message: 'Profile image updated successfully!',
      severity: 'success'
    });
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setCoverImagePreview(previewUrl);
    
    // In a real app, you would handle file upload here
    console.log('Cover image change:', file);
    
    // For demo, we'll just show a success message
    setSnackbar({
      open: true,
      message: 'Cover image updated successfully!',
      severity: 'success'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Profile Settings
      </Typography>
      
      <Paper elevation={3} sx={{ mb: 4 }}>
        <Box sx={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
          <Box
            component="img"
            src={coverImagePreview || profileData.coverImage}
            alt="Cover"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '50%',
              p: 1
            }}
          >
            <input
              accept="image/*"
              id="cover-image-upload"
              type="file"
              style={{ display: 'none' }}
              onChange={handleCoverImageChange}
            />
            <label htmlFor="cover-image-upload">
              <IconButton
                color="primary"
                component="span"
                sx={{ color: 'white' }}
              >
                <PhotoCameraIcon />
              </IconButton>
            </label>
          </Box>
        </Box>
        
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Avatar
                  src={profileImagePreview || profileData.profileImage}
                  alt={profileData.name}
                  sx={{ width: 150, height: 150, border: '4px solid white', boxShadow: 3 }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'primary.main',
                    borderRadius: '50%',
                    p: 0.5
                  }}
                >
                  <input
                    accept="image/*"
                    id="profile-image-upload"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleProfileImageChange}
                  />
                  <label htmlFor="profile-image-upload">
                    <IconButton
                      color="primary"
                      component="span"
                      size="small"
                      sx={{ color: 'white' }}
                    >
                      <PhotoCameraIcon fontSize="small" />
                    </IconButton>
                  </label>
                </Box>
              </Box>
              <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                {profileData.name}
              </Typography>
              <Chip 
                label="Verified Hotel" 
                color="success" 
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
                Member since {profileData.foundedYear}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={9}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab icon={<AccountCircleIcon />} label="Profile" />
                  <Tab icon={<SecurityIcon />} label="Security" />
                  <Tab icon={<NotificationsIcon />} label="Notifications" />
                </Tabs>
              </Box>
              
              {/* Profile Tab */}
              {tabValue === 0 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button
                      variant={editMode ? "outlined" : "contained"}
                      color={editMode ? "error" : "primary"}
                      startIcon={editMode ? <CancelIcon /> : <EditIcon />}
                      onClick={handleEditToggle}
                      sx={{ mr: 1 }}
                    >
                      {editMode ? "Cancel" : "Edit Profile"}
                    </Button>
                    {editMode && (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                        onClick={handleSaveProfile}
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    )}
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Hotel Name"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                        margin="normal"
                        error={!!profileErrors.name}
                        helperText={profileErrors.name}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Owner Name"
                        name="ownerName"
                        value={profileData.ownerName}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                        margin="normal"
                        error={!!profileErrors.ownerName}
                        helperText={profileErrors.ownerName}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                        margin="normal"
                        error={!!profileErrors.email}
                        helperText={profileErrors.email}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                        margin="normal"
                        error={!!profileErrors.phone}
                        helperText={profileErrors.phone}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address"
                        name="address"
                        value={profileData.address}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                        margin="normal"
                        multiline
                        rows={2}
                        error={!!profileErrors.address}
                        helperText={profileErrors.address}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Website"
                        name="website"
                        value={profileData.website}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                        margin="normal"
                        error={!!profileErrors.website}
                        helperText={profileErrors.website}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Founded Year"
                        name="foundedYear"
                        value={profileData.foundedYear}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                        margin="normal"
                        type="number"
                        InputProps={{
                          inputProps: { 
                            min: 1900, 
                            max: new Date().getFullYear(),
                            step: 1
                          }
                        }}
                        error={!!profileErrors.foundedYear}
                        helperText={profileErrors.foundedYear}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={profileData.description}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                        margin="normal"
                        multiline
                        rows={4}
                        error={!!profileErrors.description}
                        helperText={profileErrors.description}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              {/* Security Tab */}
              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Change Password
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        name="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        margin="normal"
                        error={!!passwordErrors.currentPassword}
                        helperText={passwordErrors.currentPassword}
                        required
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="New Password"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        margin="normal"
                        error={!!passwordErrors.newPassword}
                        helperText={passwordErrors.newPassword}
                        required
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                edge="end"
                              >
                                {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        margin="normal"
                        error={!!passwordErrors.confirmPassword}
                        helperText={passwordErrors.confirmPassword}
                        required
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSavePassword}
                        disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      >
                        {loading ? "Updating..." : "Update Password"}
                      </Button>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                    Account Security
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch checked={true} color="primary" />}
                        label="Two-Factor Authentication"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                        Secure your account with two-factor authentication
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch checked={true} color="primary" />}
                        label="Login Notifications"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                        Receive notifications when someone logs into your account
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                      >
                        Delete Account
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              {/* Notifications Tab */}
              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Notification Preferences
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={notificationSettings.emailNotifications} 
                            onChange={handleNotificationChange}
                            name="emailNotifications"
                            color="primary"
                          />
                        }
                        label="Email Notifications"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                        Receive notifications via email
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={notificationSettings.smsNotifications} 
                            onChange={handleNotificationChange}
                            name="smsNotifications"
                            color="primary"
                          />
                        }
                        label="SMS Notifications"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                        Receive notifications via SMS
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={notificationSettings.orderUpdates} 
                            onChange={handleNotificationChange}
                            name="orderUpdates"
                            color="primary"
                          />
                        }
                        label="Order Updates"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                        Receive notifications about order status changes
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={notificationSettings.marketingEmails} 
                            onChange={handleNotificationChange}
                            name="marketingEmails"
                            color="primary"
                          />
                        }
                        label="Marketing Emails"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                        Receive promotional emails and offers
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={notificationSettings.securityAlerts} 
                            onChange={handleNotificationChange}
                            name="securityAlerts"
                            color="primary"
                          />
                        }
                        label="Security Alerts"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                        Receive alerts about security-related activities
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={notificationSettings.appUpdates} 
                            onChange={handleNotificationChange}
                            name="appUpdates"
                            color="primary"
                          />
                        }
                        label="App Updates"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                        Receive notifications about app updates and new features
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveNotifications}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      >
                        {loading ? "Saving..." : "Save Preferences"}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      )}
    </Box>
  );
};

export default ProfileSettings; 