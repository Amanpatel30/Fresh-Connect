import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Button, 
  Card, 
  CardContent, 
  CardActions, 
  Grid, 
  Chip, 
  Avatar, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Divider,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar
} from '@mui/material';
import { 
  VerifiedUser, 
  HourglassEmpty, 
  Cancel, 
  Assignment, 
  InsertDriveFile, 
  Visibility, 
  ThumbUp, 
  ThumbDown, 
  History, 
  Business, 
  LocalShipping, 
  NoteAdd, 
  Check, 
  Close, 
  Phone, 
  Email,
  Search,
  FilterList
} from '@mui/icons-material';

// Mock data for pending verifications
const mockPendingVerifications = [
  {
    id: 1,
    sellerName: 'Organic Valley',
    shopName: 'Organic Valley Farms',
    email: 'contact@organicvalley.com',
    phone: '+91 9876543210',
    submitted: '2023-05-15',
    documents: [
      { type: 'GST Certificate', file: 'gst_certificate.pdf', uploaded: '2023-05-15' },
      { type: 'PAN Card', file: 'pan_card.pdf', uploaded: '2023-05-15' },
      { type: 'Business License', file: 'business_license.pdf', uploaded: '2023-05-15' },
      { type: 'Address Proof', file: 'address_proof.pdf', uploaded: '2023-05-15' }
    ],
    status: 'pending',
    waitingDays: 5
  },
  {
    id: 2,
    sellerName: 'Fresh Farms',
    shopName: 'Fresh Farms Produce',
    email: 'info@freshfarms.com',
    phone: '+91 8765432109',
    submitted: '2023-05-17',
    documents: [
      { type: 'GST Certificate', file: 'gst_certificate.pdf', uploaded: '2023-05-17' },
      { type: 'PAN Card', file: 'pan_card.pdf', uploaded: '2023-05-17' },
      { type: 'Business License', file: 'business_license.pdf', uploaded: '2023-05-17' }
    ],
    status: 'pending',
    waitingDays: 3
  },
  {
    id: 3,
    sellerName: 'Green Harvest',
    shopName: 'Green Harvest Co.',
    email: 'support@greenharvest.com',
    phone: '+91 7654321098',
    submitted: '2023-05-10',
    documents: [
      { type: 'GST Certificate', file: 'gst_certificate.pdf', uploaded: '2023-05-10' },
      { type: 'PAN Card', file: 'pan_card.pdf', uploaded: '2023-05-10' },
      { type: 'Business License', file: 'business_license.pdf', uploaded: '2023-05-10' },
      { type: 'FSSAI License', file: 'fssai_license.pdf', uploaded: '2023-05-10' }
    ],
    status: 'pending',
    waitingDays: 10
  },
  {
    id: 4,
    sellerName: "Nature's Basket",
    shopName: "Nature's Fresh Basket",
    email: 'orders@naturesbasket.com',
    phone: '+91 6543210987',
    submitted: '2023-05-18',
    documents: [
      { type: 'GST Certificate', file: 'gst_certificate.pdf', uploaded: '2023-05-18' },
      { type: 'PAN Card', file: 'pan_card.pdf', uploaded: '2023-05-18' },
      { type: 'Business License', file: 'business_license.pdf', uploaded: '2023-05-18' }
    ],
    status: 'pending',
    waitingDays: 2
  },
];

// Mock data for processed verifications
const mockProcessedVerifications = [
  {
    id: 5,
    sellerName: 'Farm Fresh Co.',
    shopName: 'Farm Fresh Vegetables',
    email: 'help@farmfresh.com',
    phone: '+91 9876543211',
    submitted: '2023-05-01',
    processedDate: '2023-05-05',
    documents: [
      { type: 'GST Certificate', file: 'gst_certificate.pdf', uploaded: '2023-05-01' },
      { type: 'PAN Card', file: 'pan_card.pdf', uploaded: '2023-05-01' },
      { type: 'Business License', file: 'business_license.pdf', uploaded: '2023-05-01' }
    ],
    status: 'approved',
    processedBy: 'Admin User'
  },
  {
    id: 6,
    sellerName: 'Veggie World',
    shopName: 'Veggie World Mart',
    email: 'sales@veggieworld.com',
    phone: '+91 8765432100',
    submitted: '2023-05-02',
    processedDate: '2023-05-07',
    documents: [
      { type: 'GST Certificate', file: 'gst_certificate.pdf', uploaded: '2023-05-02' },
      { type: 'PAN Card', file: 'pan_card.pdf', uploaded: '2023-05-02' }
    ],
    status: 'rejected',
    rejectionReason: 'Incomplete documentation. Business license is missing.',
    processedBy: 'Admin User'
  },
  {
    id: 7,
    sellerName: 'Sunshine Farms',
    shopName: 'Sunshine Organic Farms',
    email: 'contact@sunshinefarms.com',
    phone: '+91 7654321099',
    submitted: '2023-05-03',
    processedDate: '2023-05-08',
    documents: [
      { type: 'GST Certificate', file: 'gst_certificate.pdf', uploaded: '2023-05-03' },
      { type: 'PAN Card', file: 'pan_card.pdf', uploaded: '2023-05-03' },
      { type: 'Business License', file: 'business_license.pdf', uploaded: '2023-05-03' },
      { type: 'FSSAI License', file: 'fssai_license.pdf', uploaded: '2023-05-03' }
    ],
    status: 'approved',
    processedBy: 'Admin User'
  }
];

const SellerVerification = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [dialogType, setDialogType] = useState('');
  const [verifications, setVerifications] = useState({
    pending: mockPendingVerifications,
    processed: mockProcessedVerifications
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle dialog open
  const handleDialogOpen = (seller, type) => {
    setSelectedSeller(seller);
    setDialogType(type);
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setOpenDialog(false);
    setRejectionReason('');
  };

  // Handle approve verification
  const handleApprove = () => {
    const updatedPending = verifications.pending.filter(
      seller => seller.id !== selectedSeller.id
    );
    
    const approvedSeller = {
      ...selectedSeller,
      status: 'approved',
      processedDate: new Date().toISOString().split('T')[0],
      processedBy: 'Admin User'
    };
    
    setVerifications({
      pending: updatedPending,
      processed: [approvedSeller, ...verifications.processed]
    });
    
    setSnackbar({
      open: true,
      message: `${selectedSeller.sellerName} has been approved successfully!`,
      severity: 'success'
    });
    
    handleDialogClose();
  };

  // Handle reject verification
  const handleReject = () => {
    if (!rejectionReason.trim()) {
      setSnackbar({
        open: true,
        message: 'Please provide a reason for rejection',
        severity: 'error'
      });
      return;
    }
    
    const updatedPending = verifications.pending.filter(
      seller => seller.id !== selectedSeller.id
    );
    
    const rejectedSeller = {
      ...selectedSeller,
      status: 'rejected',
      rejectionReason: rejectionReason,
      processedDate: new Date().toISOString().split('T')[0],
      processedBy: 'Admin User'
    };
    
    setVerifications({
      pending: updatedPending,
      processed: [rejectedSeller, ...verifications.processed]
    });
    
    setSnackbar({
      open: true,
      message: `${selectedSeller.sellerName} has been rejected.`,
      severity: 'info'
    });
    
    handleDialogClose();
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <Box mb={4} display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
            Seller Verification
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and verify seller documentation
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <TextField
            placeholder="Search seller..."
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: <Search fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterList />}
          >
            Filter
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                borderRadius: '12px',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                },
                height: '100%'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar
                    sx={{
                      backgroundColor: '#f59e0b20',
                      color: '#f59e0b',
                      width: 48,
                      height: 48
                    }}
                  >
                    <HourglassEmpty />
                  </Avatar>
                  <Box ml={2}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Pending
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {verifications.pending.length}
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={70} 
                  sx={{ 
                    mb: 1, 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: '#f59e0b20',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#f59e0b',
                    }
                  }} 
                />
                <Typography variant="caption" color="text.secondary">
                  {verifications.pending.length > 0 ? `Oldest request: ${verifications.pending.reduce((max, obj) => obj.waitingDays > max ? obj.waitingDays : max, 0)} days ago` : 'No pending requests'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                borderRadius: '12px',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                },
                height: '100%'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar
                    sx={{
                      backgroundColor: '#22c55e20',
                      color: '#22c55e',
                      width: 48,
                      height: 48
                    }}
                  >
                    <VerifiedUser />
                  </Avatar>
                  <Box ml={2}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Approved
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {verifications.processed.filter(v => v.status === 'approved').length}
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={50} 
                  sx={{ 
                    mb: 1, 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: '#22c55e20',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#22c55e',
                    }
                  }} 
                />
                <Typography variant="caption" color="text.secondary">
                  Last approved: Today
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                borderRadius: '12px',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                },
                height: '100%'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar
                    sx={{
                      backgroundColor: '#ef444420',
                      color: '#ef4444',
                      width: 48,
                      height: 48
                    }}
                  >
                    <Cancel />
                  </Avatar>
                  <Box ml={2}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Rejected
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {verifications.processed.filter(v => v.status === 'rejected').length}
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={20} 
                  sx={{ 
                    mb: 1, 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: '#ef444420',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#ef4444',
                    }
                  }} 
                />
                <Typography variant="caption" color="text.secondary">
                  Last rejected: 3 days ago
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                borderRadius: '12px',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                },
                height: '100%'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar
                    sx={{
                      backgroundColor: '#4a90e220',
                      color: '#4a90e2',
                      width: 48,
                      height: 48
                    }}
                  >
                    <Assignment />
                  </Avatar>
                  <Box ml={2}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {verifications.pending.length + verifications.processed.length}
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={90} 
                  sx={{ 
                    mb: 1, 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: '#4a90e220',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#4a90e2',
                    }
                  }} 
                />
                <Typography variant="caption" color="text.secondary">
                  Average processing time: 3 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Paper 
          sx={{ 
            mb: 4, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ px: 2, pt: 1 }}
          >
            <Tab 
              label="Pending Verification" 
              icon={<Badge badgeContent={verifications.pending.length} color="warning" sx={{ '& .MuiBadge-badge': { top: -8, right: -8 } }}><HourglassEmpty /></Badge>}
              iconPosition="start"
            />
            <Tab 
              label="Processed" 
              icon={<History />}
              iconPosition="start"
            />
          </Tabs>
        </Paper>
      </motion.div>

      {/* Pending Verifications Tab */}
      {tabValue === 0 && (
        <motion.div variants={itemVariants}>
          {verifications.pending.length > 0 ? (
            <Grid container spacing={3}>
              {verifications.pending.map((seller) => (
                <Grid item xs={12} md={6} key={seller.id}>
                  <Card 
                    sx={{ 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      borderRadius: '12px',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <CardContent>
                      <Box 
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 2
                        }}
                      >
                        <Box display="flex" alignItems="center">
                          <Avatar 
                            sx={{ 
                              bgcolor: '#f59e0b', 
                              width: 48, 
                              height: 48,
                              mr: 2
                            }}
                          >
                            {seller.sellerName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" gutterBottom>
                              {seller.shopName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {seller.sellerName}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip 
                          label={`Waiting ${seller.waitingDays} days`} 
                          color="warning" 
                          size="small"
                          sx={{ fontWeight: 'medium' }}
                        />
                      </Box>

                      <Divider sx={{ mb: 2 }} />
                      
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Box display="flex" alignItems="center">
                            <Email fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                            <Typography variant="body2">{seller.email}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box display="flex" alignItems="center">
                            <Phone fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                            <Typography variant="body2">{seller.phone}</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Submitted Documents
                      </Typography>
                      <List dense>
                        {seller.documents.map((doc, index) => (
                          <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <InsertDriveFile fontSize="small" color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={doc.type} 
                              secondary={`Uploaded on ${doc.uploaded}`}
                              primaryTypographyProps={{ variant: 'body2' }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                            <Tooltip title="View Document">
                              <IconButton edge="end" size="small">
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'flex-end' }}>
                      <Button 
                        variant="outlined" 
                        color="error"
                        startIcon={<ThumbDown />}
                        onClick={() => handleDialogOpen(seller, 'reject')}
                      >
                        Reject
                      </Button>
                      <Button 
                        variant="contained" 
                        color="success"
                        startIcon={<ThumbUp />}
                        onClick={() => handleDialogOpen(seller, 'approve')}
                      >
                        Approve
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={5}>
              <VerifiedUser sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Pending Verifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All seller verification requests have been processed.
              </Typography>
            </Box>
          )}
        </motion.div>
      )}

      {/* Processed Verifications Tab */}
      {tabValue === 1 && (
        <motion.div variants={itemVariants}>
          {verifications.processed.length > 0 ? (
            <Grid container spacing={3}>
              {verifications.processed.map((seller) => (
                <Grid item xs={12} md={6} key={seller.id}>
                  <Card 
                    sx={{ 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      borderRadius: '12px',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <CardContent>
                      <Box 
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 2
                        }}
                      >
                        <Box display="flex" alignItems="center">
                          <Avatar 
                            sx={{ 
                              bgcolor: seller.status === 'approved' ? '#22c55e' : '#ef4444', 
                              width: 48, 
                              height: 48,
                              mr: 2
                            }}
                          >
                            {seller.sellerName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" gutterBottom>
                              {seller.shopName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {seller.sellerName}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip 
                          icon={seller.status === 'approved' ? <Check /> : <Close />}
                          label={seller.status === 'approved' ? 'Approved' : 'Rejected'} 
                          color={seller.status === 'approved' ? 'success' : 'error'} 
                          size="small"
                          sx={{ fontWeight: 'medium' }}
                        />
                      </Box>

                      <Divider sx={{ mb: 2 }} />
                      
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Submitted On
                          </Typography>
                          <Typography variant="body2">
                            {seller.submitted}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Processed On
                          </Typography>
                          <Typography variant="body2">
                            {seller.processedDate}
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      {seller.status === 'rejected' && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          <Typography variant="caption" fontWeight="medium">
                            Reason for Rejection
                          </Typography>
                          <Typography variant="body2">
                            {seller.rejectionReason}
                          </Typography>
                        </Alert>
                      )}
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Submitted Documents
                      </Typography>
                      <List dense>
                        {seller.documents.map((doc, index) => (
                          <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <InsertDriveFile fontSize="small" color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={doc.type} 
                              secondary={`Uploaded on ${doc.uploaded}`}
                              primaryTypographyProps={{ variant: 'body2' }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                            <Tooltip title="View Document">
                              <IconButton edge="end" size="small">
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'flex-end' }}>
                      <Button 
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => handleDialogOpen(seller, 'view')}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={5}>
              <History sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Processed Verifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                There are no processed seller verification requests.
              </Typography>
            </Box>
          )}
        </motion.div>
      )}

      {/* Approval Dialog */}
      <Dialog
        open={openDialog && dialogType === 'approve'}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Seller Verification</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            You are about to approve this seller. They will be able to list products on the platform.
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            {selectedSeller?.shopName}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {selectedSeller?.sellerName}
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Verification Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body2">
                  {selectedSeller?.email}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body2">
                  {selectedSeller?.phone}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Submitted On
                </Typography>
                <Typography variant="body2">
                  {selectedSeller?.submitted}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Waiting Time
                </Typography>
                <Typography variant="body2">
                  {selectedSeller?.waitingDays} days
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Documents ({selectedSeller?.documents.length})
            </Typography>
            <List dense>
              {selectedSeller?.documents.map((doc, index) => (
                <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Check fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={doc.type} 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit">Cancel</Button>
          <Button 
            onClick={handleApprove} 
            variant="contained" 
            color="success"
            startIcon={<VerifiedUser />}
          >
            Confirm Approval
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog
        open={openDialog && dialogType === 'reject'}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Seller Verification</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            You are about to reject this seller. Please provide a detailed reason.
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            {selectedSeller?.shopName}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {selectedSeller?.sellerName}
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            id="reason"
            label="Reason for Rejection"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
            helperText="Provide clear information about why the verification was rejected and what the seller needs to do to get approved"
          />
          
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Common Reasons</InputLabel>
              <Select
                value=""
                label="Common Reasons"
                onChange={(e) => setRejectionReason(e.target.value)}
              >
                <MenuItem value="Incomplete documentation. Please submit all required documents.">
                  Incomplete documentation
                </MenuItem>
                <MenuItem value="Documents are not legible. Please resubmit clear copies.">
                  Illegible documents
                </MenuItem>
                <MenuItem value="Documents have expired. Please provide up-to-date documents.">
                  Expired documents
                </MenuItem>
                <MenuItem value="Information mismatch. Details on documents do not match registration information.">
                  Information mismatch
                </MenuItem>
                <MenuItem value="Business address verification failed. Please provide valid address proof.">
                  Address verification failed
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit">Cancel</Button>
          <Button 
            onClick={handleReject} 
            variant="contained" 
            color="error"
            startIcon={<Cancel />}
          >
            Reject Verification
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={openDialog && dialogType === 'view'}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Verification Details</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar 
              sx={{ 
                bgcolor: selectedSeller?.status === 'approved' ? '#22c55e' : '#ef4444', 
                width: 56, 
                height: 56,
                mr: 2
              }}
            >
              {selectedSeller?.sellerName.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedSeller?.shopName}
              </Typography>
              <Chip 
                icon={selectedSeller?.status === 'approved' ? <Check /> : <Close />}
                label={selectedSeller?.status === 'approved' ? 'Approved' : 'Rejected'} 
                color={selectedSeller?.status === 'approved' ? 'success' : 'error'} 
                size="small"
                sx={{ fontWeight: 'medium' }}
              />
            </Box>
    </Box>
          
          {selectedSeller?.status === 'rejected' && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="caption" fontWeight="medium">
                Reason for Rejection
              </Typography>
              <Typography variant="body2">
                {selectedSeller?.rejectionReason}
              </Typography>
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Seller Name
              </Typography>
              <Typography variant="body2">
                {selectedSeller?.sellerName}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body2">
                {selectedSeller?.email}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Phone
              </Typography>
              <Typography variant="body2">
                {selectedSeller?.phone}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Submitted On
              </Typography>
              <Typography variant="body2">
                {selectedSeller?.submitted}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Processed On
              </Typography>
              <Typography variant="body2">
                {selectedSeller?.processedDate}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Processed By
              </Typography>
              <Typography variant="body2">
                {selectedSeller?.processedBy}
              </Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Documents
          </Typography>
          <List dense>
            {selectedSeller?.documents.map((doc, index) => (
              <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <InsertDriveFile fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={doc.type} 
                  secondary={`Uploaded on ${doc.uploaded}`}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                <Tooltip title="View Document">
                  <IconButton edge="end" size="small">
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default SellerVerification; 