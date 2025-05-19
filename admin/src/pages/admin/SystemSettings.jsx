import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsData, setSettingsData] = useState({
    general: {
      siteName: '',
      siteDescription: '',
      contactEmail: '',
      phoneNumber: '',
      address: '',
      logoUrl: '',
      faviconUrl: ''
    },
    payments: {
      currency: 'INR',
      taxRate: 0,
      enablePayPal: true,
      enableStripe: true,
      enableCashOnDelivery: true,
      payPalClientId: '',
      stripePublicKey: '',
      stripeSecretKey: ''
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      emailFromAddress: '',
      emailFromName: '',
      enableEmailNotifications: true
    },
    security: {
      enableTwoFactorAuth: false,
      sessionTimeout: 60,
      passwordMinLength: 8,
      requirePasswordNumbers: true,
      requirePasswordSymbols: true,
      requirePasswordUppercase: true
    }
  });
  const [error, setError] = useState(null);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [helpDialogContent, setHelpDialogContent] = useState({ title: '', content: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Fetch settings from backend
  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      const data = await response.json();
      setSettingsData(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle settings change
  const handleInputChange = (section, field, value) => {
    setSettingsData(prevData => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [field]: value
      }
    }));
  };

  // Handle switch toggle
  const handleSwitchChange = (section, field) => (event) => {
    handleInputChange(section, field, event.target.checked);
  };

  // Handle numeric input change
  const handleNumberChange = (section, field, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) || value === '') {
      handleInputChange(section, field, value === '' ? '' : numValue);
    }
  };

  // Save settings
  const handleSaveSettings = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setSnackbarMessage('Settings saved successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Show help dialog
  const handleHelpClick = (title, content) => {
    setHelpDialogContent({ title, content });
    setHelpDialogOpen(true);
  };

  // Close help dialog
  const handleCloseHelpDialog = () => {
    setHelpDialogOpen(false);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Render general settings tab
  const renderGeneralSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Site Name"
          value={settingsData.general.siteName}
          onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
          margin="normal"
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Contact Email"
          value={settingsData.general.contactEmail}
          onChange={(e) => handleInputChange('general', 'contactEmail', e.target.value)}
          margin="normal"
          variant="outlined"
          type="email"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Site Description"
          value={settingsData.general.siteDescription}
          onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
          margin="normal"
          variant="outlined"
          multiline
          rows={2}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Phone Number"
          value={settingsData.general.phoneNumber}
          onChange={(e) => handleInputChange('general', 'phoneNumber', e.target.value)}
          margin="normal"
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Address"
          value={settingsData.general.address}
          onChange={(e) => handleInputChange('general', 'address', e.target.value)}
          margin="normal"
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Logo URL"
          value={settingsData.general.logoUrl}
          onChange={(e) => handleInputChange('general', 'logoUrl', e.target.value)}
          margin="normal"
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => handleHelpClick(
                    'Logo URL',
                    'Enter the URL for your site logo. The recommended size is 200x60 pixels.'
                  )}
                  edge="end"
                >
                  <HelpOutlineIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Favicon URL"
          value={settingsData.general.faviconUrl}
          onChange={(e) => handleInputChange('general', 'faviconUrl', e.target.value)}
          margin="normal"
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => handleHelpClick(
                    'Favicon URL',
                    'Enter the URL for your site favicon. The favicon should be a 32x32 or 16x16 pixel .ico file.'
                  )}
                  edge="end"
                >
                  <HelpOutlineIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Grid>
    </Grid>
  );

  // Render payment settings tab
  const renderPaymentSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          select
          SelectProps={{ native: true }}
          label="Currency"
          value={settingsData.payments.currency}
          onChange={(e) => handleInputChange('payments', 'currency', e.target.value)}
          margin="normal"
          variant="outlined"
        >
          <option value="USD">USD - US Dollar</option>
          <option value="EUR">EUR - Euro</option>
          <option value="GBP">GBP - British Pound</option>
          <option value="JPY">JPY - Japanese Yen</option>
          <option value="CAD">CAD - Canadian Dollar</option>
          <option value="AUD">AUD - Australian Dollar</option>
          <option value="INR">INR - Indian Rupee</option>
        </TextField>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Tax Rate (%)"
          value={settingsData.payments.taxRate}
          onChange={(e) => handleNumberChange('payments', 'taxRate', e.target.value)}
          margin="normal"
          variant="outlined"
          type="number"
          inputProps={{ min: 0, step: 0.01 }}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Payment Methods
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>

      <Grid item xs={12} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={settingsData.payments.enablePayPal}
              onChange={handleSwitchChange('payments', 'enablePayPal')}
              color="primary"
            />
          }
          label="Enable PayPal"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={settingsData.payments.enableStripe}
              onChange={handleSwitchChange('payments', 'enableStripe')}
              color="primary"
            />
          }
          label="Enable Stripe"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={settingsData.payments.enableCashOnDelivery}
              onChange={handleSwitchChange('payments', 'enableCashOnDelivery')}
              color="primary"
            />
          }
          label="Enable Cash on Delivery"
        />
      </Grid>

      {settingsData.payments.enablePayPal && (
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="PayPal Client ID"
            value={settingsData.payments.payPalClientId}
            onChange={(e) => handleInputChange('payments', 'payPalClientId', e.target.value)}
            margin="normal"
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleHelpClick(
                      'PayPal Client ID',
                      'Enter your PayPal client ID from the PayPal Developer Dashboard.'
                    )}
                    edge="end"
                  >
                    <HelpOutlineIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
      )}

      {settingsData.payments.enableStripe && (
        <>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Stripe Public Key"
              value={settingsData.payments.stripePublicKey}
              onChange={(e) => handleInputChange('payments', 'stripePublicKey', e.target.value)}
              margin="normal"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Stripe Secret Key"
              value={settingsData.payments.stripeSecretKey}
              onChange={(e) => handleInputChange('payments', 'stripeSecretKey', e.target.value)}
              margin="normal"
              variant="outlined"
              type="password"
            />
          </Grid>
        </>
      )}
    </Grid>
  );

  // Render email settings tab
  const renderEmailSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settingsData.email.enableEmailNotifications}
              onChange={handleSwitchChange('email', 'enableEmailNotifications')}
              color="primary"
            />
          }
          label="Enable Email Notifications"
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          SMTP Settings
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="SMTP Host"
          value={settingsData.email.smtpHost}
          onChange={(e) => handleInputChange('email', 'smtpHost', e.target.value)}
          margin="normal"
          variant="outlined"
          disabled={!settingsData.email.enableEmailNotifications}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="SMTP Port"
          value={settingsData.email.smtpPort}
          onChange={(e) => handleNumberChange('email', 'smtpPort', e.target.value)}
          margin="normal"
          variant="outlined"
          type="number"
          disabled={!settingsData.email.enableEmailNotifications}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="SMTP Username"
          value={settingsData.email.smtpUser}
          onChange={(e) => handleInputChange('email', 'smtpUser', e.target.value)}
          margin="normal"
          variant="outlined"
          disabled={!settingsData.email.enableEmailNotifications}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="SMTP Password"
          value={settingsData.email.smtpPassword}
          onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
          margin="normal"
          variant="outlined"
          type="password"
          disabled={!settingsData.email.enableEmailNotifications}
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Email Content Settings
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="From Email Address"
          value={settingsData.email.emailFromAddress}
          onChange={(e) => handleInputChange('email', 'emailFromAddress', e.target.value)}
          margin="normal"
          variant="outlined"
          disabled={!settingsData.email.enableEmailNotifications}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="From Name"
          value={settingsData.email.emailFromName}
          onChange={(e) => handleInputChange('email', 'emailFromName', e.target.value)}
          margin="normal"
          variant="outlined"
          disabled={!settingsData.email.enableEmailNotifications}
        />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="outlined" 
            color="primary"
            disabled={!settingsData.email.enableEmailNotifications || saving}
            startIcon={<RefreshIcon />}
          >
            Test Email Configuration
          </Button>
        </Box>
      </Grid>
    </Grid>
  );

  // Render security settings tab
  const renderSecuritySettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settingsData.security.enableTwoFactorAuth}
              onChange={handleSwitchChange('security', 'enableTwoFactorAuth')}
              color="primary"
            />
          }
          label="Enable Two-Factor Authentication for Admin Users"
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Session Settings
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Session Timeout (minutes)"
          value={settingsData.security.sessionTimeout}
          onChange={(e) => handleNumberChange('security', 'sessionTimeout', e.target.value)}
          margin="normal"
          variant="outlined"
          type="number"
          inputProps={{ min: 5, step: 1 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => handleHelpClick(
                    'Session Timeout',
                    'Set the amount of time (in minutes) after which an inactive user session will expire. Minimum recommended value is 15 minutes.'
                  )}
                  edge="end"
                >
                  <HelpOutlineIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Password Policy
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Minimum Password Length"
          value={settingsData.security.passwordMinLength}
          onChange={(e) => handleNumberChange('security', 'passwordMinLength', e.target.value)}
          margin="normal"
          variant="outlined"
          type="number"
          inputProps={{ min: 6, step: 1 }}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={settingsData.security.requirePasswordNumbers}
              onChange={handleSwitchChange('security', 'requirePasswordNumbers')}
              color="primary"
            />
          }
          label="Require Numbers"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={settingsData.security.requirePasswordSymbols}
              onChange={handleSwitchChange('security', 'requirePasswordSymbols')}
              color="primary"
            />
          }
          label="Require Symbols"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={settingsData.security.requirePasswordUppercase}
              onChange={handleSwitchChange('security', 'requirePasswordUppercase')}
              color="primary"
            />
          }
          label="Require Uppercase"
        />
      </Grid>
    </Grid>
  );

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderGeneralSettings();
      case 1:
        return renderPaymentSettings();
      case 2:
        return renderEmailSettings();
      case 3:
        return renderSecuritySettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Settings
      </Typography>

      <Card sx={{ mb: 4, p: 2 }}>
        <CardContent>
          <Typography variant="body1">
            Configure your system settings here. Changes made will affect how the entire system operates.
            Be careful when modifying these settings as they may impact your users' experience.
          </Typography>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Paper sx={{ p: 0 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="General" />
              <Tab label="Payment" />
              <Tab label="Email" />
              <Tab label="Security" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {renderTabContent()}
            </Box>

            <Divider />

            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                startIcon={<RefreshIcon />}
                onClick={fetchSettings}
                sx={{ mr: 1 }}
                disabled={loading || saving}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveSettings}
                disabled={loading || saving}
              >
                {saving ? <CircularProgress size={24} /> : 'Save Settings'}
              </Button>
            </Box>
          </Paper>
        </>
      )}

      {/* Help Dialog */}
      <Dialog open={helpDialogOpen} onClose={handleCloseHelpDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{helpDialogContent.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">{helpDialogContent.content}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHelpDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default SystemSettings; 