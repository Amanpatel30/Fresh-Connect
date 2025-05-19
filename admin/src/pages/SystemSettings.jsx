import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Switch,
  FormControlLabel,
  FormGroup,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  CloudUpload as CloudUploadIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  List as ListIcon,
  SettingsBackupRestore as BackupIcon,
  LocalShipping as ShippingIcon,
  Store as StoreIcon,
  Restaurant as RestaurantIcon,
  Verified as VerifiedIcon,
  Spa as EcoIcon
} from '@mui/icons-material';

const API_BASE_URL = 'http://localhost:5001/api';

const SystemSettings = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for tab management
  const [tabValue, setTabValue] = useState(0);
  
  // State for form values
  const [formValues, setFormValues] = useState({
    siteName: 'FreshConnect Admin',
    siteUrl: 'https://admin.freshconnect.com',
    adminEmail: 'admin@freshconnect.com',
    itemsPerPage: 20,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    timezone: 'UTC+0',
    smtpServer: 'smtp.freshconnect.com',
    smtpPort: 587,
    smtpUser: 'notifications@freshconnect.com',
    smtpPassword: '************',
    fromEmail: 'notifications@freshconnect.com',
    fromName: 'FreshConnect System',
    backupFrequency: 'daily',
    storageLocation: 'cloud',
    maxFileSize: 10,
    autoDeleteDays: 30,
    verificationFee: 499,
    commissionRate: 5,
    urgentSaleDiscount: 30,
    maxFreeListingDays: 3,
    deliveryRadius: 25
  });
  
  // State for switches
  const [switches, setSwitches] = useState({
    enableNotifications: true,
    enableEmailAlerts: true,
    requireTwoFactor: false,
    enableApiAccess: true,
    publicRegistration: true,
    maintenanceMode: false,
    enableDebugMode: false,
    automaticBackups: true,
    compressBackups: true,
    enableVerification: true,
    allowUrgentSales: true,
    allowFreeFood: true,
    requirePhotoVerification: true,
    enableRatings: true
  });
  
  // State for saving status
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };
  
  // Handle switch changes
  const handleSwitchChange = (event) => {
    const { name, checked } = event.target;
    setSwitches({
      ...switches,
      [name]: checked
    });
  };
  
  // Test API connection
  const testSettingsAPI = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`);
      const data = await response.json();
      console.log('Settings API test successful:', data);
      return true;
    } catch (error) {
      console.error('Settings API test failed:', error);
      return false;
    }
  };
  
  // Fetch settings from API
  const fetchSettings = async () => {
    if (location.pathname !== '/settings') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/settings`);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update state with fetched data
      if (data && Object.keys(data).length > 0) {
        // Extract form values and switches from API data
        const apiFormValues = {};
        const apiSwitches = {};
        
        // Map API data to form values and switches
        Object.entries(data).forEach(([key, value]) => {
          if (typeof value === 'boolean') {
            apiSwitches[key] = value;
          } else {
            apiFormValues[key] = value;
          }
        });
        
        // Update state if we have values
        if (Object.keys(apiFormValues).length > 0) {
          setFormValues(prev => ({...prev, ...apiFormValues}));
        }
        
        if (Object.keys(apiSwitches).length > 0) {
          setSwitches(prev => ({...prev, ...apiSwitches}));
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load settings from server. Using default values.');
      // Keep using the default values in state
    } finally {
      setLoading(false);
    }
  };
  
  // Save settings to API
  const handleSave = () => {
    setSaving(true);
    
    // Combine form values and switches
    const settingsData = {
      ...formValues,
      ...switches
    };
    
    // Try to save to API
    fetch(`${API_BASE_URL}/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingsData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Settings saved successfully:', data);
        setSaved(true);
      })
      .catch(error => {
        console.error('Error saving settings:', error);
        setError('Failed to save settings to server');
      })
      .finally(() => {
        setSaving(false);
      });
  };
  
  // Check if current page is Settings and test API
  useEffect(() => {
    if (location.pathname === '/settings') {
      testSettingsAPI();
    }
  }, [location.pathname]);
  
  // Fetch settings data when on Settings page
  useEffect(() => {
    fetchSettings();
  }, [location.pathname]);
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSaved(false);
  };
  
  // Tabs content
  const TabPanel = ({ children, value, index }) => {
    return (
      <Box role="tabpanel" hidden={value !== index} sx={{ mt: 3 }}>
        {value === index && children}
      </Box>
    );
  };
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          System Settings
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            sx={{ mr: 2 }}
            onClick={fetchSettings}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>
      
      {/* Loading and Error States */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error} Using default values.
        </Alert>
      )}
      
      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<SettingsIcon />} label="General" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<StoreIcon />} label="Seller Settings" />
          <Tab icon={<RestaurantIcon />} label="Hotel Settings" />
          <Tab icon={<EmailIcon />} label="Email" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<StorageIcon />} label="Storage & Backup" />
          <Tab icon={<ShippingIcon />} label="Delivery" />
        </Tabs>
      </Paper>
      
      {/* General Settings */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Site Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Site Name"
                      name="siteName"
                      value={formValues.siteName}
                      onChange={handleInputChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Site URL"
                      name="siteUrl"
                      value={formValues.siteUrl}
                      onChange={handleInputChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Admin Email"
                      name="adminEmail"
                      value={formValues.adminEmail}
                      onChange={handleInputChange}
                      margin="normal"
                      type="email"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={switches.maintenanceMode}
                            onChange={handleSwitchChange}
                            name="maintenanceMode"
                            color="primary"
                          />
                        }
                        label="Maintenance Mode"
                      />
                      <Typography variant="caption" color="text.secondary">
                        When enabled, the site will be inaccessible to regular users.
                      </Typography>
                    </FormGroup>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Display Settings</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Items Per Page"
                      name="itemsPerPage"
                      value={formValues.itemsPerPage}
                      onChange={handleInputChange}
                      margin="normal"
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Date Format</InputLabel>
                      <Select
                        name="dateFormat"
                        value={formValues.dateFormat}
                        label="Date Format"
                        onChange={handleInputChange}
                      >
                        <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                        <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                        <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Time Format</InputLabel>
                      <Select
                        name="timeFormat"
                        value={formValues.timeFormat}
                        label="Time Format"
                        onChange={handleInputChange}
                      >
                        <MenuItem value="12h">12 Hour (AM/PM)</MenuItem>
                        <MenuItem value="24h">24 Hour</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Timezone</InputLabel>
                      <Select
                        name="timezone"
                        value={formValues.timezone}
                        label="Timezone"
                        onChange={handleInputChange}
                      >
                        <MenuItem value="UTC-8">Pacific Time (UTC-8)</MenuItem>
                        <MenuItem value="UTC-5">Eastern Time (UTC-5)</MenuItem>
                        <MenuItem value="UTC+0">UTC</MenuItem>
                        <MenuItem value="UTC+1">Central European Time (UTC+1)</MenuItem>
                        <MenuItem value="UTC+5:30">Indian Time (UTC+5:30)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Security Settings */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Authentication</Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Two-Factor Authentication"
                      secondary="Add an extra layer of security to your admin accounts"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={switches.requireTwoFactor}
                        onChange={handleSwitchChange}
                        name="requireTwoFactor"
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Public User Registration"
                      secondary="Allow users to create their own accounts"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={switches.publicRegistration}
                        onChange={handleSwitchChange}
                        name="publicRegistration"
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" color="primary" startIcon={<RefreshIcon />}>
                    Reset All Security Keys
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>System Logs</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={switches.enableDebugMode}
                        onChange={handleSwitchChange}
                        name="enableDebugMode"
                        color="primary"
                      />
                    }
                    label="Debug Mode"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                    Enables detailed error logging for troubleshooting.
                  </Typography>
                </FormGroup>
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" color="primary">
                    View System Logs
                  </Button>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Last System Check: Today, 10:30 AM
                  </Typography>
                  <Alert severity="success" sx={{ mt: 1 }}>
                    All systems operational
                  </Alert>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Seller Settings */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Vegetable Seller Verification</Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <VerifiedIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Enable Seller Verification"
                      secondary="Allow vegetable sellers to get verified status"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={switches.enableVerification}
                        onChange={handleSwitchChange}
                        name="enableVerification"
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <EcoIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Require Photo Verification"
                      secondary="Sellers must upload photos of their produce"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={switches.requirePhotoVerification}
                        onChange={handleSwitchChange}
                        name="requirePhotoVerification"
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Verification Fee (₹)"
                      name="verificationFee"
                      value={formValues.verificationFee}
                      onChange={handleInputChange}
                      margin="normal"
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Commission Rate (%)"
                      name="commissionRate"
                      value={formValues.commissionRate}
                      onChange={handleInputChange}
                      margin="normal"
                      type="number"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Urgent Sales Settings</Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <StoreIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Allow Urgent Sales"
                      secondary="Enable sellers to list soon-to-expire vegetables at a discount"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={switches.allowUrgentSales}
                        onChange={handleSwitchChange}
                        name="allowUrgentSales"
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Default Urgent Sale Discount (%)"
                      name="urgentSaleDiscount"
                      value={formValues.urgentSaleDiscount}
                      onChange={handleInputChange}
                      margin="normal"
                      type="number"
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Verification Process
                  </Typography>
                  <List>
                    <ListItem button component="a" href="#">
                      <ListItemText primary="Manage Verification Checklist" />
                    </ListItem>
                    <Divider />
                    <ListItem button component="a" href="#">
                      <ListItemText primary="View Pending Verifications" />
                    </ListItem>
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Hotel Settings */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Hotel Verification</Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <RestaurantIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Enable Hotel Verification"
                      secondary="Allow hotels to get verified for using quality vegetables"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={switches.enableVerification}
                        onChange={handleSwitchChange}
                        name="enableVerification"
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <EcoIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Enable Ratings"
                      secondary="Allow customers to rate hotels based on food quality"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={switches.enableRatings}
                        onChange={handleSwitchChange}
                        name="enableRatings"
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" color="primary">
                    Manage Verification Badges
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Food Waste Reduction</Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <RestaurantIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Allow Cancelled Order Listings"
                      secondary="Enable hotels to sell untouched cancelled food at a discount"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={true}
                        onChange={handleSwitchChange}
                        name="allowCancelledOrders"
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <EcoIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Allow Free Food Listings"
                      secondary="Enable hotels to list leftover food for free collection"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={switches.allowFreeFood}
                        onChange={handleSwitchChange}
                        name="allowFreeFood"
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Max Free Listing Days"
                      name="maxFreeListingDays"
                      value={formValues.maxFreeListingDays}
                      onChange={handleInputChange}
                      margin="normal"
                      type="number"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Email Settings */}
      <TabPanel value={tabValue} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>SMTP Settings</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="SMTP Server"
                      name="smtpServer"
                      value={formValues.smtpServer}
                      onChange={handleInputChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="SMTP Port"
                      name="smtpPort"
                      value={formValues.smtpPort}
                      onChange={handleInputChange}
                      margin="normal"
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="SMTP Username"
                      name="smtpUser"
                      value={formValues.smtpUser}
                      onChange={handleInputChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="SMTP Password"
                      name="smtpPassword"
                      value={formValues.smtpPassword}
                      onChange={handleInputChange}
                      margin="normal"
                      type="password"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Button variant="outlined" color="primary">
                        Test Connection
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Email Templates</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="From Email"
                      name="fromEmail"
                      value={formValues.fromEmail}
                      onChange={handleInputChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="From Name"
                      name="fromName"
                      value={formValues.fromName}
                      onChange={handleInputChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <List>
                      <ListItem button component="a" href="#">
                        <ListItemText primary="Welcome Email" secondary="Sent to new users" />
                      </ListItem>
                      <Divider />
                      <ListItem button component="a" href="#">
                        <ListItemText primary="Verification Approved" secondary="Sent when seller is verified" />
                      </ListItem>
                      <Divider />
                      <ListItem button component="a" href="#">
                        <ListItemText primary="Order Confirmation" secondary="Sent after purchase" />
                      </ListItem>
                      <Divider />
                      <ListItem button component="a" href="#">
                        <ListItemText primary="Urgent Sale Alert" secondary="Notifies about expiring items" />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Notifications Settings */}
      <TabPanel value={tabValue} index={5}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Notification Preferences</Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="System Notifications"
                      secondary="Important alerts about the system"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={switches.enableNotifications}
                        onChange={handleSwitchChange}
                        name="enableNotifications"
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email Alerts"
                      secondary="Receive important notifications via email"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={switches.enableEmailAlerts}
                        onChange={handleSwitchChange}
                        name="enableEmailAlerts"
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Event Notifications</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Choose which events trigger notifications for administrators.
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={<Switch defaultChecked color="primary" />}
                    label="New Seller Registration"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked color="primary" />}
                    label="New Hotel Registration"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked color="primary" />}
                    label="New Verification Request"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked color="primary" />}
                    label="New Urgent Sale Listing"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked color="primary" />}
                    label="New Free Food Listing"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked color="primary" />}
                    label="Payment Failure"
                  />
                </FormGroup>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Storage & Backup Settings */}
      <TabPanel value={tabValue} index={6}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>File Storage</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Storage Location</InputLabel>
                      <Select
                        name="storageLocation"
                        value={formValues.storageLocation}
                        label="Storage Location"
                        onChange={handleInputChange}
                      >
                        <MenuItem value="local">Local Server</MenuItem>
                        <MenuItem value="cloud">Cloud Storage</MenuItem>
                        <MenuItem value="hybrid">Hybrid (Local + Cloud)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Max File Size (MB)"
                      name="maxFileSize"
                      value={formValues.maxFileSize}
                      onChange={handleInputChange}
                      margin="normal"
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Auto-Delete After (days)"
                      name="autoDeleteDays"
                      value={formValues.autoDeleteDays}
                      onChange={handleInputChange}
                      margin="normal"
                      type="number"
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Storage Usage
                  </Typography>
                  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <CircularProgress
                      variant="determinate"
                      value={65}
                      size={80}
                      thickness={5}
                      sx={{ mr: 2 }}
                    />
                    <Box>
                      <Typography variant="h6">65% Used</Typography>
                      <Typography variant="body2" color="text.secondary">
                        6.5 GB of 10 GB
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Backup Settings</Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <BackupIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Automatic Backups"
                      secondary="Regularly backup system data"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={switches.automaticBackups}
                        onChange={handleSwitchChange}
                        name="automaticBackups"
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <StorageIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Compress Backups"
                      secondary="Save storage space with compression"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={switches.compressBackups}
                        onChange={handleSwitchChange}
                        name="compressBackups"
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Backup Frequency</InputLabel>
                  <Select
                    name="backupFrequency"
                    value={formValues.backupFrequency}
                    label="Backup Frequency"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
                
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button variant="outlined" color="primary" startIcon={<BackupIcon />}>
                    Backup Now
                  </Button>
                  <Button variant="outlined" color="primary">
                    View Backups
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* API & Integrations Settings */}
      <TabPanel value={tabValue} index={5}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>API Access</Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <ListIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Enable API"
                      secondary="Allow external applications to access your data via API"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={switches.enableApiAccess}
                        onChange={handleSwitchChange}
                        name="enableApiAccess"
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    API Keys
                  </Typography>
                  <TextField
                    fullWidth
                    label="Your API Key"
                    value="d41d8cd98f00b204e9800998ecf8427e"
                    margin="normal"
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton edge="end" size="small">
                            <RefreshIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button variant="outlined" color="primary" sx={{ mt: 2 }}>
                    Regenerate API Key
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Integrations</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Connect with third-party services to extend functionality.
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Payment Gateway"
                      secondary="Connected: Stripe"
                    />
                    <Button size="small" variant="outlined">
                      Configure
                    </Button>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Delivery Partners"
                      secondary="Connected: Local Delivery Network"
                    />
                    <Button size="small" variant="outlined">
                      Configure
                    </Button>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Analytics"
                      secondary="Connected: Google Analytics"
                    />
                    <Button size="small" variant="outlined">
                      Configure
                    </Button>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Food Quality Verification"
                      secondary="Connected: FoodSafe Certification"
                    />
                    <Button size="small" variant="outlined">
                      Configure
                    </Button>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={saved || error !== null}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={error ? "error" : "success"} 
          sx={{ width: '100%' }}
        >
          {error ? error : 'Settings saved successfully!'}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SystemSettings;
