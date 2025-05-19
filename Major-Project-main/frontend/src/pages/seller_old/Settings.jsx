import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tab,
  Tabs,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  Stack,
  CircularProgress,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Save as SaveIcon, Notifications as NotificationsIcon, Security as SecurityIcon, Language as LanguageIcon } from '@mui/icons-material';
import { useThemeMode } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import * as profileService from '../../services/profileService';
import * as settingsService from '../../services/settingsService';

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Settings = () => {
  const { mode } = useThemeMode();
  const { user } = useUser();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    language: 'en',
    timezone: 'UTC+5:30',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR'
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    productAlerts: true,
    marketingEmails: false,
    lowStockAlerts: true,
    desktopNotifications: true
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginAlerts: true
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Password validation errors
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch settings from API
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await settingsService.getSettings();
      
      if (response && response.success && response.data) {
        // Update state with settings from API
        setGeneralSettings(response.data.general);
        setNotificationSettings(response.data.notifications);
        setSecuritySettings(response.data.security);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load settings. Using default values.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle general settings change
  const handleGeneralSettingChange = (event) => {
    const { name, value } = event.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: value
    });
  };

  // Handle notification settings toggle
  const handleNotificationToggle = (event) => {
    const { name, checked } = event.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked
    });
  };

  // Handle security settings change
  const handleSecuritySettingChange = (event) => {
    const { name, value, checked } = event.target;
    const newValue = event.target.type === 'checkbox' ? checked : value;
    setSecuritySettings({
      ...securitySettings,
      [name]: newValue
    });
  };

  // Handle password change form
  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });

    // Clear validation error when user types
    if (passwordErrors[name]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: ''
      });
    }
  };

  // Validate password form
  const validatePasswordForm = () => {
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    let isValid = true;

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
      isValid = false;
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
      isValid = false;
    } else if (passwordData.confirmPassword !== passwordData.newPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  // Save general settings
  const saveGeneralSettings = async () => {
    setLoading(true);
    try {
      const response = await settingsService.updateGeneralSettings(generalSettings);
      
      setSnackbar({
        open: true,
        message: response.message || 'General settings saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving general settings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save general settings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Save notification settings
  const saveNotificationSettings = async () => {
    setLoading(true);
    try {
      const response = await settingsService.updateNotificationSettings(notificationSettings);
      
      setSnackbar({
        open: true,
        message: response.message || 'Notification settings saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save notification settings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Save security settings
  const saveSecuritySettings = async () => {
    setLoading(true);
    try {
      const response = await settingsService.updateSecuritySettings(securitySettings);
      
      setSnackbar({
        open: true,
        message: response.message || 'Security settings saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving security settings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save security settings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async () => {
    // Validate the password form
    if (!validatePasswordForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await profileService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response && response.status === 'success') {
        setSnackbar({
          open: true,
          message: 'Password changed successfully',
          severity: 'success'
        });
        
        // Reset the form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        throw new Error(response?.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      
      // Check if it's an authentication error (incorrect current password)
      if (error.response && error.response.status === 401) {
        setSnackbar({
          open: true,
          message: 'Current password is incorrect',
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: error.message || 'Failed to change password',
          severity: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const backgroundPaper = {
    p: 0,
    borderRadius: 3,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    background: mode === 'dark' ? '#1e1e2d' : '#ffffff',
    border: '1px solid',
    borderColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  };

  return (
    <Box sx={{ p: 0 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: mode === 'dark' ? '#f0f0f0' : '#1e293b' }}>
        Settings
      </Typography>

      <Paper sx={backgroundPaper}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="settings tabs"
          >
            <Tab 
              label="General" 
              icon={<LanguageIcon />} 
              iconPosition="start" 
              sx={{ textTransform: 'none', minHeight: 64 }}
            />
            <Tab 
              label="Notifications" 
              icon={<NotificationsIcon />} 
              iconPosition="start" 
              sx={{ textTransform: 'none', minHeight: 64 }}
            />
            <Tab 
              label="Security" 
              icon={<SecurityIcon />} 
              iconPosition="start" 
              sx={{ textTransform: 'none', minHeight: 64 }}
            />
          </Tabs>
        </Box>

        {/* General Settings */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            General Settings
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="language-label">Language</InputLabel>
                <Select
                  labelId="language-label"
                  id="language"
                  name="language"
                  value={generalSettings.language}
                  label="Language"
                  onChange={handleGeneralSettingChange}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="hi">Hindi</MenuItem>
                  <MenuItem value="ta">Tamil</MenuItem>
                  <MenuItem value="te">Telugu</MenuItem>
                  <MenuItem value="mr">Marathi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="timezone-label">Timezone</InputLabel>
                <Select
                  labelId="timezone-label"
                  id="timezone"
                  name="timezone"
                  value={generalSettings.timezone}
                  label="Timezone"
                  onChange={handleGeneralSettingChange}
                >
                  <MenuItem value="UTC+5:30">Indian Standard Time (IST)</MenuItem>
                  <MenuItem value="UTC+0">Greenwich Mean Time (GMT)</MenuItem>
                  <MenuItem value="UTC-5">Eastern Standard Time (EST)</MenuItem>
                  <MenuItem value="UTC-8">Pacific Standard Time (PST)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="dateFormat-label">Date Format</InputLabel>
                <Select
                  labelId="dateFormat-label"
                  id="dateFormat"
                  name="dateFormat"
                  value={generalSettings.dateFormat}
                  label="Date Format"
                  onChange={handleGeneralSettingChange}
                >
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="currency-label">Currency</InputLabel>
                <Select
                  labelId="currency-label"
                  id="currency"
                  name="currency"
                  value={generalSettings.currency}
                  label="Currency"
                  onChange={handleGeneralSettingChange}
                >
                  <MenuItem value="INR">Indian Rupee (₹)</MenuItem>
                  <MenuItem value="USD">US Dollar ($)</MenuItem>
                  <MenuItem value="EUR">Euro (€)</MenuItem>
                  <MenuItem value="GBP">British Pound (£)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={saveGeneralSettings}
                  disabled={loading}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    backgroundColor: '#4361ee',
                    '&:hover': {
                      backgroundColor: '#3a56d4',
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notification Settings */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Notification Settings
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                  Email Notifications
                </Typography>
                <Stack spacing={2} sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onChange={handleNotificationToggle}
                        name="emailNotifications"
                        color="primary"
                      />
                    }
                    label="Enable email notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.orderUpdates}
                        onChange={handleNotificationToggle}
                        name="orderUpdates"
                        color="primary"
                        disabled={!notificationSettings.emailNotifications}
                      />
                    }
                    label="Order updates"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.productAlerts}
                        onChange={handleNotificationToggle}
                        name="productAlerts"
                        color="primary"
                        disabled={!notificationSettings.emailNotifications}
                      />
                    }
                    label="Product alerts"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.marketingEmails}
                        onChange={handleNotificationToggle}
                        name="marketingEmails"
                        color="primary"
                        disabled={!notificationSettings.emailNotifications}
                      />
                    }
                    label="Marketing and promotional emails"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.lowStockAlerts}
                        onChange={handleNotificationToggle}
                        name="lowStockAlerts"
                        color="primary"
                        disabled={!notificationSettings.emailNotifications}
                      />
                    }
                    label="Low stock alerts"
                  />
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                  Browser Notifications
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.desktopNotifications}
                      onChange={handleNotificationToggle}
                      name="desktopNotifications"
                      color="primary"
                    />
                  }
                  label="Enable desktop notifications"
                />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={saveNotificationSettings}
                  disabled={loading}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    backgroundColor: '#4361ee',
                    '&:hover': {
                      backgroundColor: '#3a56d4',
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Settings */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Security Settings
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                  Account Security
                </Typography>
                <Stack spacing={2} sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.twoFactorAuth}
                        onChange={handleSecuritySettingChange}
                        name="twoFactorAuth"
                        color="primary"
                      />
                    }
                    label="Enable Two-Factor Authentication"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.loginAlerts}
                        onChange={handleSecuritySettingChange}
                        name="loginAlerts"
                        color="primary"
                      />
                    }
                    label="Login alerts for new devices"
                  />
                </Stack>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                  Session Timeout (minutes)
                </Typography>
                <TextField
                  type="number"
                  name="sessionTimeout"
                  value={securitySettings.sessionTimeout}
                  onChange={handleSecuritySettingChange}
                  InputProps={{
                    inputProps: { min: 5, max: 120 }
                  }}
                  fullWidth
                  sx={{ mb: 2 }}
                />

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Your account will be automatically logged out after this period of inactivity.
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={saveSecuritySettings}
                    disabled={loading}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      backgroundColor: '#4361ee',
                      '&:hover': {
                        backgroundColor: '#3a56d4',
                      }
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Save Settings'}
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                  Change Password
                </Typography>
                
                <TextField
                  label="Current Password"
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                  margin="normal"
                  error={!!passwordErrors.currentPassword}
                  helperText={passwordErrors.currentPassword}
                />
                
                <TextField
                  label="New Password"
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                  margin="normal"
                  error={!!passwordErrors.newPassword}
                  helperText={passwordErrors.newPassword}
                />
                
                <TextField
                  label="Confirm New Password"
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                  margin="normal"
                  error={!!passwordErrors.confirmPassword}
                  helperText={passwordErrors.confirmPassword}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={changePassword}
                    disabled={loading}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      backgroundColor: '#4361ee',
                      '&:hover': {
                        backgroundColor: '#3a56d4',
                      }
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Change Password'}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;