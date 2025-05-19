import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Rating
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Hotel as HotelIcon
} from '@mui/icons-material';

const HotelVerification = () => {
  const [pendingHotels, setPendingHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchPendingHotels = async () => {
      try {
        const response = await fetch('/api/admin/hotels/pending');
        if (!response.ok) {
          throw new Error('Failed to fetch pending hotels');
        }
        const data = await response.json();
        setPendingHotels(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching pending hotels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingHotels();
  }, []);

  const handleOpenDetails = (hotel) => {
    setSelectedHotel(hotel);
    setDetailsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDetailsDialogOpen(false);
  };

  const handleApproveHotel = async (hotelId) => {
    try {
      const response = await fetch(`/api/admin/hotels/${hotelId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to verify hotel');
      }

      // Remove the approved hotel from the list
      setPendingHotels(pendingHotels.filter(hotel => hotel._id !== hotelId));
      
      // Close dialog if open
      setDetailsDialogOpen(false);
      
      // Show success message (implement as needed)
    } catch (err) {
      console.error('Error approving hotel:', err);
      // Show error notification
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Hotel Verification
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Review and verify new hotel listings
      </Typography>

      {pendingHotels.length === 0 ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <HotelIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6">No Pending Hotels</Typography>
          <Typography variant="body2" color="textSecondary">
            All hotel listings have been verified.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {pendingHotels.map((hotel) => (
            <Grid item xs={12} md={6} key={hotel._id}>
              <Card elevation={3}>
                <CardMedia
                  component="img"
                  height="200"
                  image={hotel.images && hotel.images.length > 0 ? hotel.images[0] : 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={hotel.name}
                />
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h5" component="div">
                      {hotel.name}
                    </Typography>
                    <Chip 
                      label="Pending Verification" 
                      color="warning"
                      size="small"
                    />
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {hotel.city}, {hotel.state}, {hotel.country}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <Rating value={hotel.rating || 0} readOnly precision={0.5} size="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ${hotel.pricePerNight}/night
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 1
                  }}>
                    {hotel.description}
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Button 
                    variant="outlined"
                    onClick={() => handleOpenDetails(hotel)}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<ApproveIcon />}
                    onClick={() => handleApproveHotel(hotel._id)}
                  >
                    Approve
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Hotel Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedHotel && (
          <>
            <DialogTitle>
              <Typography variant="h5">{selectedHotel.name}</Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box
                    component="img"
                    src={selectedHotel.images && selectedHotel.images.length > 0 
                      ? selectedHotel.images[0] 
                      : 'https://via.placeholder.com/500x300?text=No+Image'}
                    alt={selectedHotel.name}
                    sx={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 1,
                      mb: 2
                    }}
                  />
                  
                  {selectedHotel.images && selectedHotel.images.length > 1 && (
                    <Grid container spacing={1}>
                      {selectedHotel.images.slice(1, 4).map((image, index) => (
                        <Grid item xs={4} key={index}>
                          <Box
                            component="img"
                            src={image}
                            alt={`${selectedHotel.name} ${index + 2}`}
                            sx={{
                              width: '100%',
                              height: 80,
                              objectFit: 'cover',
                              borderRadius: 1
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <List disablePadding>
                    <ListItem>
                      <ListItemText 
                        primary="Contact Information" 
                        secondary={
                          <Box>
                            <Box display="flex" alignItems="center" mt={1}>
                              <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                              {selectedHotel.email}
                            </Box>
                            <Box display="flex" alignItems="center" mt={1}>
                              <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                              {selectedHotel.contact}
                            </Box>
                          </Box>
                        } 
                        primaryTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                      />
                    </ListItem>
                    
                    <Divider component="li" />
                    
                    <ListItem>
                      <ListItemText 
                        primary="Location" 
                        secondary={
                          <Box mt={1}>
                            {selectedHotel.address}, {selectedHotel.city}, {selectedHotel.state}, {selectedHotel.pincode}, {selectedHotel.country}
                          </Box>
                        } 
                        primaryTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                      />
                    </ListItem>
                    
                    <Divider component="li" />
                    
                    <ListItem>
                      <ListItemText 
                        primary="Price per Night" 
                        secondary={`$${selectedHotel.pricePerNight}`}
                        primaryTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                      />
                    </ListItem>
                    
                    <Divider component="li" />
                    
                    <ListItem>
                      <ListItemText 
                        primary="Amenities" 
                        secondary={
                          <Box mt={1}>
                            {selectedHotel.amenities && selectedHotel.amenities.length > 0 ? (
                              selectedHotel.amenities.map((amenity, index) => (
                                <Chip 
                                  key={index} 
                                  label={amenity} 
                                  size="small" 
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))
                            ) : (
                              'No amenities listed'
                            )}
                          </Box>
                        } 
                        primaryTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedHotel.description}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="inherit">
                Close
              </Button>
              <Button 
                onClick={() => handleApproveHotel(selectedHotel._id)} 
                color="primary" 
                variant="contained"
                startIcon={<ApproveIcon />}
              >
                Approve Hotel
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default HotelVerification; 