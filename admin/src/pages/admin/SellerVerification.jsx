import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Grid,
  Button,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  TextField
} from '@mui/material';
import {
  PersonOutline as PersonIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  DocumentScanner as DocumentIcon
} from '@mui/icons-material';

const SellerVerification = () => {
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [docsDialogOpen, setDocsDialogOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');

  useEffect(() => {
    const fetchPendingSellers = async () => {
      try {
        const response = await fetch('/api/admin/sellers/pending');
        if (!response.ok) {
          throw new Error('Failed to fetch pending seller verifications');
        }
        const data = await response.json();
        setPendingSellers(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching pending sellers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingSellers();
  }, []);

  const handleOpenDetails = (seller) => {
    setSelectedSeller(seller);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSeller(null);
  };

  const handleViewDocuments = () => {
    setDocsDialogOpen(true);
  };

  const handleCloseDocsDialog = () => {
    setDocsDialogOpen(false);
  };

  const handleApproveSeller = async (sellerId) => {
    try {
      console.log(`Attempting to approve seller with ID: ${sellerId}`);
      
      const response = await fetch(`/api/admin/sellers/${sellerId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approved: true,
          notes: verificationNotes || "Approved by admin"
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify seller');
      }

      console.log("Seller verification successful:", data);

      // Remove the approved seller from the list
      setPendingSellers(pendingSellers.filter(seller => seller._id !== sellerId));
      
      // Close dialogs if open
      setDialogOpen(false);
      setDocsDialogOpen(false);
      setSelectedSeller(null);
      
      // Show success message (you could implement a toast notification here)
      alert("Seller successfully verified!");
      
    } catch (err) {
      console.error('Error approving seller:', err);
      // Show error notification
      alert(`Error approving seller: ${err.message}`);
    }
  };
  
  const handleRejectSeller = async (sellerId) => {
    try {
      if (!verificationNotes) {
        alert("Please provide rejection reason in the notes");
        return;
      }
      
      console.log(`Attempting to reject seller with ID: ${sellerId}`);
      
      const response = await fetch(`/api/admin/sellers/${sellerId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approved: false,
          notes: verificationNotes
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reject seller');
      }

      console.log("Seller rejection successful:", data);

      // Remove the rejected seller from the list
      setPendingSellers(pendingSellers.filter(seller => seller._id !== sellerId));
      
      // Close dialogs if open
      setDialogOpen(false);
      setDocsDialogOpen(false);
      setSelectedSeller(null);
      
      // Show success message
      alert("Seller rejected successfully");
      
    } catch (err) {
      console.error('Error rejecting seller:', err);
      // Show error notification
      alert(`Error rejecting seller: ${err.message}`);
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
        Seller Verification
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Review and approve seller applications
      </Typography>

      {pendingSellers.length === 0 ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">No pending seller verifications</Typography>
          <Typography variant="body2" color="textSecondary">
            All seller applications have been processed.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {pendingSellers.map((seller) => (
            <Grid item xs={12} sm={6} md={4} key={seller._id}>
              <Card elevation={3}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar 
                      src={seller.profileImage} 
                      alt={seller.name}
                      sx={{ width: 50, height: 50, mr: 2 }}
                    >
                      {seller.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="div">
                        {seller.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {seller.email}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box mb={2}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                      {seller.phone || 'No phone number'}
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                      {seller.address && seller.address.city 
                        ? `${seller.address.city}, ${seller.address.country}` 
                        : 'No address'}
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <DocumentIcon fontSize="small" sx={{ mr: 1 }} />
                      {seller.verificationDocuments ? 'Documents Submitted' : 'No Documents'}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="center">
                    <Chip 
                      label="Pending Verification" 
                      color="warning" 
                      size="small"
                    />
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => handleOpenDetails(seller)}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<ApproveIcon />}
                    onClick={() => handleApproveSeller(seller._id)}
                  >
                    Approve
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Seller Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedSeller && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <Avatar 
                  src={selectedSeller.profileImage} 
                  sx={{ mr: 2 }}
                >
                  {selectedSeller.name.charAt(0)}
                </Avatar>
                <Typography variant="h6">{selectedSeller.name}</Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <EmailIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Email" 
                    secondary={selectedSeller.email} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <PhoneIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Phone" 
                    secondary={selectedSeller.phone || 'Not provided'} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <LocationIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Address" 
                    secondary={
                      selectedSeller.address 
                        ? `${selectedSeller.address.street || ''}, ${selectedSeller.address.city || ''}, ${selectedSeller.address.state || ''}, ${selectedSeller.address.postalCode || ''}, ${selectedSeller.address.country || ''}` 
                        : 'Not provided'
                    } 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <BusinessIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Account Created" 
                    secondary={new Date(selectedSeller.createdAt).toLocaleDateString()} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <DocumentIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Verification Documents" 
                  />
                  <ListItemSecondaryAction>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={handleViewDocuments}
                      disabled={!selectedSeller.verificationDocuments}
                    >
                      View Documents
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
              
              <Box mt={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Verification Notes
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="Enter notes about this verification (required for rejection)"
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="inherit">
                Close
              </Button>
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<RejectIcon />}
                onClick={() => handleRejectSeller(selectedSeller._id)}
              >
                Reject
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<ApproveIcon />}
                onClick={() => handleApproveSeller(selectedSeller._id)}
              >
                Approve
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Documents Dialog */}
      <Dialog
        open={docsDialogOpen}
        onClose={handleCloseDocsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Verification Documents</DialogTitle>
        <DialogContent dividers>
          {selectedSeller && selectedSeller.verificationDocuments ? (
            <Grid container spacing={2}>
              {/* ID Proof */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      ID Proof
                    </Typography>
                    <Box 
                      component="img" 
                      src={selectedSeller.verificationDocuments.idProof} 
                      alt="ID Proof"
                      sx={{
                        width: '100%',
                        maxHeight: '300px',
                        objectFit: 'contain',
                        display: 'block',
                        mb: 1
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Address Proof */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Address Proof
                    </Typography>
                    <Box 
                      component="img" 
                      src={selectedSeller.verificationDocuments.addressProof} 
                      alt="Address Proof"
                      sx={{
                        width: '100%',
                        maxHeight: '300px',
                        objectFit: 'contain',
                        display: 'block',
                        mb: 1
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Business Proof */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Business Proof
                    </Typography>
                    <Box 
                      component="img" 
                      src={selectedSeller.verificationDocuments.businessProof} 
                      alt="Business Proof"
                      sx={{
                        width: '100%',
                        maxHeight: '300px',
                        objectFit: 'contain',
                        display: 'block',
                        mb: 1
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Typography>No documents available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDocsDialog} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellerVerification; 