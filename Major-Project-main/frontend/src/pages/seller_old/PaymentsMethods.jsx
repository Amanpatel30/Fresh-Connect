import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Check as CheckIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { 
  getPaymentMethods, 
  createPaymentMethod, 
  updatePaymentMethod, 
  deletePaymentMethod,
  setDefaultPaymentMethod
} from '../../services/paymentMethodService';

const PaymentsMethods = () => {
  const theme = useTheme();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    type: 'bank',
    name: '',
    accountNumber: '',
    ifsc: '',
    upiId: '',
    walletId: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const response = await getPaymentMethods();
      
      if (response && response.data) {
        setPaymentMethods(response.data);
      } else {
        setPaymentMethods([]);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load payment methods',
        severity: 'error'
      });
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (method = null) => {
    if (method) {
      setEditingMethod(method);
      setFormData({
        type: method.type,
        name: method.name,
        accountNumber: method.accountNumber || '',
        ifsc: method.ifsc || '',
        upiId: method.upiId || '',
        walletId: method.walletId || ''
      });
    } else {
      setEditingMethod(null);
      setFormData({
        type: 'bank',
        name: '',
        accountNumber: '',
        ifsc: '',
        upiId: '',
        walletId: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    // Validate form data
    if (!formData.name || (formData.type === 'bank' && (!formData.accountNumber || !formData.ifsc)) || 
        (formData.type === 'upi' && !formData.upiId)) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }
    
    setSubmitting(true);
    try {
      let response;
      if (editingMethod) {
        response = await updatePaymentMethod(editingMethod._id, formData);
      } else {
        response = await createPaymentMethod(formData);
      }
      
      setSnackbar({
        open: true,
        message: editingMethod ? 'Payment method updated successfully' : 'Payment method added successfully',
        severity: 'success'
      });
      handleCloseDialog();
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error saving payment method:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save payment method',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) {
      return;
    }
    
    try {
      await deletePaymentMethod(id);
      setSnackbar({
        open: true,
        message: 'Payment method deleted successfully',
        severity: 'success'
      });
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete payment method',
        severity: 'error'
      });
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultPaymentMethod(id);
      setSnackbar({
        open: true,
        message: 'Default payment method updated',
        severity: 'success'
      });
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error setting default payment method:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update default payment method',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const renderPaymentMethodDetails = (method) => {
    switch (method.type) {
      case 'bank':
        return (
          <>
            <Typography variant="body2" color="text.secondary">
              Account: {method.accountNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              IFSC: {method.ifsc}
            </Typography>
          </>
        );
      case 'upi':
        return (
          <Typography variant="body2" color="text.secondary">
            UPI ID: {method.upiId}
          </Typography>
        );
      case 'wallet':
        return (
          <Typography variant="body2" color="text.secondary">
            Wallet ID: {method.walletId}
          </Typography>
        );
      default:
        return null;
    }
  };

  const renderFormFields = () => {
    switch (formData.type) {
      case 'bank':
        return (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Account Number"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="IFSC Code"
              name="ifsc"
              value={formData.ifsc}
              onChange={handleChange}
              required
            />
          </>
        );
      case 'upi':
        return (
          <TextField
            fullWidth
            margin="normal"
            label="UPI ID"
            name="upiId"
            value={formData.upiId}
            onChange={handleChange}
            required
          />
        );
      case 'wallet':
        return (
          <TextField
            fullWidth
            margin="normal"
            label="Wallet ID"
            name="walletId"
            value={formData.walletId}
            onChange={handleChange}
            required
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Payment Methods
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Method
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : paymentMethods.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No payment methods added yet. Add your first payment method to receive payments.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {paymentMethods.map((method) => (
            <Grid item xs={12} md={6} key={method._id}>
              <Card 
                sx={{ 
                  position: 'relative', 
                  border: method.isDefault ? `2px solid ${theme.palette.primary.main}` : 'none'
                }}
              >
                {method.isDefault && (
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 0, 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderBottomLeftRadius: 4
                    }}
                  >
                    <Typography variant="caption">Default</Typography>
                  </Box>
                )}
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6" component="div">
                        {method.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                        {method.type}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {renderPaymentMethodDetails(method)}
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1, 
                            bgcolor: 
                              method.status === 'verified' 
                                ? 'success.light' 
                                : method.status === 'rejected' 
                                  ? 'error.light' 
                                  : 'warning.light',
                            color: 
                              method.status === 'verified' 
                                ? 'success.dark' 
                                : method.status === 'rejected' 
                                  ? 'error.dark' 
                                  : 'warning.dark'
                          }}
                        >
                          {method.status.toUpperCase()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog(method)}
                        aria-label="edit"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(method._id)}
                        aria-label="delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      {!method.isDefault && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleSetDefault(method._id)}
                          aria-label="set as default"
                          color="primary"
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            margin="normal"
            label="Payment Method Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <MenuItem value="bank">Bank Account</MenuItem>
            <MenuItem value="upi">UPI</MenuItem>
            <MenuItem value="wallet">Wallet</MenuItem>
          </TextField>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={
              formData.type === 'bank' 
                ? 'e.g., HDFC Bank' 
                : formData.type === 'upi' 
                  ? 'e.g., Google Pay' 
                  : 'e.g., Paytm Wallet'
            }
            required
          />
          {renderFormFields()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingMethod ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentsMethods;