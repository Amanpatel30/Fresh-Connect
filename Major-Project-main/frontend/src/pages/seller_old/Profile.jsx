import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import * as profileService from '../../services/profileService';
import { useUser } from '../../context/UserContext';

const Profile = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Create a default profile from user data
  const createDefaultProfile = () => {
    return {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      shopName: user?.shopName || 'Your Shop Name',
      address: '',
      description: 'No description available yet. Edit your profile to add a description.',
      avatar: user?.avatar || 'https://source.unsplash.com/random/150x150/?portrait',
      shopImage: 'https://source.unsplash.com/random/800x400/?store',
      documents: {
        gst: '',
        pan: '',
        fssai: '',
      },
    };
  };

  // Fetch profile data from MongoDB or localStorage
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        console.log('Fetching profile from server...');
        
        // Fetch profile from the server
        const response = await profileService.getSellerProfile();
        
        // If profile exists on server, use it
        if (response && response.data) {
          console.log('Profile fetched successfully');
          setProfile(response.data);
          setEditedProfile(response.data);
        } else {
          throw new Error('No profile data returned from server');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        
        // Create a default profile if we can't get one from the server
        const defaultProfile = createDefaultProfile();
        setProfile(defaultProfile);
        setEditedProfile(defaultProfile);
        
        // Show error message
        setMessage({
          type: 'error',
          text: 'Unable to connect to server. Please try again later.',
        });
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleImageUpload = async (event, type) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setMessage({
        type: 'error',
        text: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.',
      });
      setSnackbarOpen(true);
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'File too large. Maximum size is 5MB.',
      });
      setSnackbarOpen(true);
      return;
    }
    
    try {
      setImageUploading(true);
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);
      
      const response = await profileService.uploadProfileImage(formData);
      
      if (response && response.data && response.data.imageUrl) {
        setEditedProfile(prev => ({
          ...prev,
          [type === 'avatar' ? 'avatar' : 'shopImage']: response.data.imageUrl
        }));
        
        setMessage({
          type: 'success',
          text: `${type === 'avatar' ? 'Profile' : 'Shop'} image uploaded successfully!`,
        });
        setSnackbarOpen(true);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error(`Error uploading ${type} image:`, error);
      setMessage({
        type: 'error',
        text: `Failed to upload ${type} image. Please try again.`,
      });
      setSnackbarOpen(true);
    } finally {
      setImageUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested document fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditedProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditedProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Validate required fields
      if (!editedProfile.name || !editedProfile.shopName) {
        setMessage({
          type: 'error',
          text: 'Name and Shop Name are required',
        });
        setSnackbarOpen(true);
        return;
      }
      
      setLoading(true);
      
      // Update profile via API
      const response = await profileService.updateSellerProfile(editedProfile);
      
      if (response && response.data) {
        setProfile(response.data);
        setIsEditing(false);
        setMessage({
          type: 'success',
          text: 'Profile updated successfully',
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: 'Error updating profile. Please try again.',
      });
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (loading && !profile) {
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

      {message && (
        <Alert 
          severity={message.type} 
          onClose={() => setMessage(null)}
          sx={{ mb: 2 }}
        >
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={isEditing ? editedProfile?.avatar : profile?.avatar}
                  sx={{ width: 120, height: 120 }}
                />
                {isEditing && (
                  <IconButton
                    color="primary"
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'white'
                    }}
                    disabled={imageUploading}
                  >
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={(e) => handleImageUpload(e, 'avatar')}
                    />
                    {imageUploading ? <CircularProgress size={24} /> : <PhotoCameraIcon />}
                  </IconButton>
                )}
              </Box>
              <Box sx={{ ml: 3 }}>
                <Typography variant="h5">
                  {isEditing ? editedProfile?.shopName : profile?.shopName || 'Your Shop Name'}
                </Typography>
                <Typography color="textSecondary">
                  {isEditing ? editedProfile?.email : profile?.email}
                </Typography>
              </Box>
              {!isEditing && (
                <IconButton
                  sx={{ position: 'absolute', top: 16, right: 16 }}
                  onClick={() => setIsEditing(true)}
                >
                  <EditIcon />
                </IconButton>
              )}
            </Box>

            <Box sx={{ position: 'relative', mb: 3 }}>
              <img
                src={isEditing ? editedProfile?.shopImage : profile?.shopImage}
                alt="Shop"
                style={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: 8
                }}
                onError={(e) => {
                  e.target.src = 'https://source.unsplash.com/random/800x400/?store';
                }}
              />
              {isEditing && (
                <IconButton
                  color="primary"
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: 'white'
                  }}
                  disabled={imageUploading}
                >
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={(e) => handleImageUpload(e, 'shopImage')}
                  />
                  {imageUploading ? <CircularProgress size={24} /> : <PhotoCameraIcon />}
                </IconButton>
              )}
            </Box>

            {isEditing ? (
              <Box component="form" onSubmit={handleSaveProfile}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Shop Name"
                      name="shopName"
                      value={editedProfile?.shopName || ''}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={editedProfile?.phone || ''}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={editedProfile?.address || ''}
                      onChange={handleChange}
                      multiline
                      rows={2}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={editedProfile?.description || ''}
                      onChange={handleChange}
                      multiline
                      rows={4}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button onClick={() => {
                        setIsEditing(false);
                        setEditedProfile(profile);
                      }}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        variant="contained"
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" paragraph>
                  {profile?.description || 'No description available.'}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography color="textSecondary">Phone</Typography>
                    <Typography>{profile?.phone || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography color="textSecondary">Email</Typography>
                    <Typography>{profile?.email}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography color="textSecondary">Address</Typography>
                    <Typography>{profile?.address || 'Not provided'}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Documents Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Business Documents
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="GST Number"
                  name="documents.gst"
                  value={isEditing ? editedProfile?.documents?.gst || '' : profile?.documents?.gst || ''}
                  onChange={handleChange}
                  InputProps={{ readOnly: !isEditing }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="PAN Number"
                  name="documents.pan"
                  value={isEditing ? editedProfile?.documents?.pan || '' : profile?.documents?.pan || ''}
                  onChange={handleChange}
                  InputProps={{ readOnly: !isEditing }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="FSSAI License"
                  name="documents.fssai"
                  value={isEditing ? editedProfile?.documents?.fssai || '' : profile?.documents?.fssai || ''}
                  onChange={handleChange}
                  InputProps={{ readOnly: !isEditing }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile; 