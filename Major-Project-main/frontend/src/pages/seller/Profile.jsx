import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  AccountBalance as AccountBalanceIcon,
  Badge as BadgeIcon,
  Receipt as ReceiptIcon,
  Today as TodayIcon,
  Update as UpdateIcon,
  Person as PersonIcon,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material';
import * as profileService from '../../services/profileService';
import { useUser } from '../../context/UserContext';

const Profile = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Create default profile data
  const createDefaultProfile = () => {
    return {
      _id: user?.id || '12345',
      name: user?.name || 'User Name',
      email: user?.email || 'user@example.com',
      role: 'seller',
      phone: user?.phone || '1234567890',
      address: 'Shop Address',
      businessName: 'Your Business Name',
      businessAddress: 'Business Address',
      businessDescription: 'Business Description',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: {
        gst: 'GST1234567890',
        pan: 'ABCDE1234F',
        fssai: 'FSSAI12345678901'
      }
    };
  };

  // Format date in a readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Fetch profile data from the database
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        console.log('Fetching profile from server...');
        
        // Fetch profile from the server
        const response = await profileService.getUserProfile();
        
        // Log the full response for debugging
        console.log('API Response:', response);
        console.log('Response data structure:', JSON.stringify(response, null, 2));
        
        // If profile exists on server, use it
        if (response && response.data) {
          console.log('Profile data received:', response.data);
          
          // Extract the actual user data - may need to adjust based on actual API response structure
          const userData = response.data.user || response.data;
          
          console.log('Using profile data:', userData);
          setProfile(userData);
        } else {
          throw new Error('No profile data returned from server');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Use default profile data if API fails
        const defaultProfile = createDefaultProfile();
        console.log('Using default profile data:', defaultProfile);
        setProfile(defaultProfile);
        setError('Unable to connect to server. Displaying default profile data.');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      setProfile(createDefaultProfile());
      setLoading(false);
    }
  }, [user]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={error}
      />

      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={profile?.avatar || '/default-avatar.png'}
                alt={profile?.name}
                sx={{ width: 100, height: 100, mr: 3 }}
              />
              <Box>
                <Typography variant="h5" gutterBottom>
                  {profile?.name || profile?.businessName || 'Rahul Merchant'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {profile?.email || 'seller@example.com'}
                </Typography>
                <Chip 
                  label={profile?.role || 'seller'}
                  color="primary"
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Account Information */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <VpnKeyIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Account ID" 
                    secondary={profile?._id || '67da265797b1af1c7087a031'} 
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Full Name" 
                    secondary={profile?.name || 'Rahul Merchant'} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email" 
                    secondary={profile?.email || 'seller@example.com'} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Phone" 
                    secondary={profile?.phone || '7854321096'} 
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <TodayIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Account Created" 
                    secondary={profile?.createdAt ? formatDate(profile.createdAt) : 'March 19, 2025'} 
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <UpdateIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Last Updated" 
                    secondary={profile?.updatedAt ? formatDate(profile.updatedAt) : 'March 19, 2025'} 
                  />
                </ListItem>
              </List>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Business Information */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Business Information
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Business Name" 
                    secondary={profile?.businessName || 'Fresh Produce Co.'} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Business Address" 
                    secondary={profile?.businessAddress || profile?.address || '125 Market Street, Business District'} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Business Description" 
                    secondary={profile?.businessDescription || 'Organic fruits and vegetables from local farms'} 
                  />
                </ListItem>
              </List>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Business Documents */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Business Documents
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <ReceiptIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="GST Number" 
                    secondary={profile?.documents?.gst || 'GST1234567890'} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <BadgeIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="PAN Number" 
                    secondary={profile?.documents?.pan || 'ABCDE1234F'} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <AccountBalanceIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="FSSAI License" 
                    secondary={profile?.documents?.fssai || 'FSSAI12345678901'} 
                  />
                </ListItem>
              </List>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile; 