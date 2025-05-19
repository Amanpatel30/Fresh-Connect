import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  LocalShipping as ShippingIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getShippingOrders, updateOrderStatus } from '../../services/orderService';

const OrdersShipping = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchShippingOrders();
  }, []);

  const fetchShippingOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching shipping orders...');
      const response = await getShippingOrders();
      
      // Debug logs to see the response structure
      console.log('Shipping orders API response:', response);
      
      // Check if we have data and it's properly structured
      if (response && response.data && Array.isArray(response.data)) {
        console.log(`Found ${response.data.length} shipping/processing orders`);
        setOrders(response.data);
      } else if (response && Array.isArray(response.data?.data)) {
        console.log(`Found ${response.data.data.length} shipping/processing orders in data.data`);
        setOrders(response.data.data);
      } else {
        console.log('No shipping orders found or unexpected data structure:', response);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching shipping orders:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load shipping orders',
        severity: 'error'
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  const handleOpenStatusDialog = (order) => {
    setSelectedOrder(order);
    // Default to 'shipped' if processing, else 'delivered', with fallback
    const currentStatus = order?.status || 'processing';
    const nextStatus = currentStatus === 'processing' ? 'shipped' : 'delivered';
    setNewStatus(nextStatus);
    setStatusDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
  };

  const handleStatusChange = (event) => {
    setNewStatus(event.target.value);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) {
      setSnackbar({
        open: true,
        message: 'Missing order information or status',
        severity: 'error'
      });
      return;
    }
    
    try {
      setStatusLoading(true);
      
      // Get the order ID using optional chaining and fallbacks
      const orderId = selectedOrder._id || selectedOrder.id;
      
      if (!orderId) {
        throw new Error('No valid order ID found');
      }
      
      // Call the API with proper error handling
      const response = await updateOrderStatus(orderId, { status: newStatus });
      
      console.log('Status update response:', response);
      
      // Update local state
      if (newStatus === 'delivered') {
        setOrders(orders.filter(order => {
          const orderIdToCompare = order._id || order.id;
          return orderIdToCompare !== orderId;
        }));
      } else {
        setOrders(orders.map(order => {
          const orderIdToCompare = order._id || order.id;
          return orderIdToCompare === orderId 
            ? { ...order, status: newStatus } 
            : order;
        }));
      }
      
      setSnackbar({
        open: true,
        message: `Order status updated to ${newStatus}`,
        severity: 'success'
      });
      
      handleCloseStatusDialog();
    } catch (error) {
      console.error('Error updating order status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update order status: ' + (error.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setStatusLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return format(date, 'dd MMM yyyy, hh:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'processing':
        return 0;
      case 'shipped':
        return 1;
      case 'delivered':
        return 2;
      default:
        return 0;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Shipping Orders
      </Typography>

      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : orders.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No shipping orders found.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id || order.id}>
                    <TableCell>{order.orderNumber || order._id || order.id || 'N/A'}</TableCell>
                    <TableCell>{order.createdAt ? formatDate(order.createdAt) : 'N/A'}</TableCell>
                    <TableCell>
                      {order.buyer?.name || 
                       order.customer || 
                       order.shippingAddress?.fullName || 
                       'Unknown Customer'}
                    </TableCell>
                    <TableCell>{(order.items?.length || 0)} items</TableCell>
                    <TableCell>{formatCurrency(order.totalAmount || 0)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status || 'N/A'} 
                        color={
                          order.status === 'processing' ? 'warning' : 
                          order.status === 'shipped' ? 'info' : 
                          order.status === 'delivered' ? 'success' : 'default'
                        } 
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewDetails(order)}
                        aria-label="view details"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenStatusDialog(order)}
                        aria-label="update status"
                        color="primary"
                      >
                        {order.status === 'processing' ? (
                          <ShippingIcon fontSize="small" />
                        ) : (
                          <CheckIcon fontSize="small" />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Stepper activeStep={getStatusStep(selectedOrder.status)} alternativeLabel>
                  <Step>
                    <StepLabel>Processing</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Shipped</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Delivered</StepLabel>
                  </Step>
                </Stepper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Order ID
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedOrder.orderNumber || selectedOrder._id || selectedOrder.id || 'N/A'}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedOrder.createdAt ? formatDate(selectedOrder.createdAt) : 'N/A'}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <Chip 
                    label={selectedOrder.status || 'N/A'} 
                    color={
                      selectedOrder.status === 'processing' ? 'warning' : 
                      selectedOrder.status === 'shipped' ? 'info' : 
                      selectedOrder.status === 'delivered' ? 'success' : 'default'
                    } 
                    size="small"
                  />
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Payment Status
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <Chip 
                    label={selectedOrder.paymentStatus || 'pending'} 
                    color={
                      selectedOrder.paymentStatus === 'paid' ? 'success' : 
                      selectedOrder.paymentStatus === 'refunded' ? 'error' : 'warning'
                    } 
                    size="small"
                  />
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Customer
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedOrder.buyer?.name || 
                   selectedOrder.customer || 
                   selectedOrder.shippingAddress?.fullName || 
                   'Unknown Customer'}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedOrder.buyer?.email || 
                   selectedOrder.email || 
                   selectedOrder.shippingAddress?.email || 
                   'N/A'}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedOrder.buyer?.phone || 
                   selectedOrder.phone || 
                   selectedOrder.shippingAddress?.phone || 
                   'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Items
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(selectedOrder.items || []).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {item.product?.images && item.product.images[0] ? (
                                <Box
                                  component="img"
                                  src={`/uploads/${item.product.images[0]}`}
                                  alt={item.product?.name || 'Product'}
                                  sx={{ width: 40, height: 40, mr: 2, objectFit: 'cover' }}
                                />
                              ) : null}
                              {item.product?.name || item.name || 'Product'}
                            </Box>
                          </TableCell>
                          <TableCell align="right">{formatCurrency(item.price || 0)}</TableCell>
                          <TableCell align="right">{item.quantity || 0}</TableCell>
                          <TableCell align="right">{formatCurrency((item.price || 0) * (item.quantity || 0))}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                          Total
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(selectedOrder.totalAmount || 0)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              
              {selectedOrder.shippingAddress && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Shipping Address
                  </Typography>
                  <Typography variant="body1">
                    {selectedOrder.shippingAddress.street || selectedOrder.shippingAddress.address || 'N/A'}
                    {selectedOrder.shippingAddress.city ? `, ${selectedOrder.shippingAddress.city}` : ''}
                  </Typography>
                  <Typography variant="body1">
                    {selectedOrder.shippingAddress.state ? `${selectedOrder.shippingAddress.state}` : ''}
                    {selectedOrder.shippingAddress.postalCode ? `, ${selectedOrder.shippingAddress.postalCode}` : ''}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={selectedOrder?.status === 'processing' ? <ShippingIcon /> : <CheckIcon />}
            onClick={() => {
              handleCloseDetails();
              handleOpenStatusDialog(selectedOrder);
            }}
          >
            {selectedOrder?.status === 'processing' ? 'Mark as Shipped' : 'Mark as Delivered'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Change the status of order {selectedOrder?.orderNumber}
          </Typography>
          <TextField
            select
            fullWidth
            label="New Status"
            value={newStatus}
            onChange={handleStatusChange}
            margin="normal"
          >
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Cancel</Button>
          <Button 
            onClick={handleUpdateStatus} 
            variant="contained"
            disabled={statusLoading}
          >
            {statusLoading ? <CircularProgress size={24} /> : 'Update'}
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

export default OrdersShipping;