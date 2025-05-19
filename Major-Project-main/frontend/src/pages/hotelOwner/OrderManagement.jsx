import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Snackbar,
  Alert,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { format } from 'date-fns';
import { getOrders, getOrderDetails, updateOrderStatus } from '../../services/api.jsx';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Status filters for tabs
  const statusFilters = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Set test token if none exists (for development only)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, setting test token for development');
      const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Y2U4M2U2YjQ5Y2Q4ZmU5Mjk3YTc1MyIsImlhdCI6MTY5MzAyMDYxMSwiZXhwIjoxNjk1NjEyNjExfQ.NzhfN8xxWwz8d2_lLXYVmnmJ5hHwIKUUGZQ-ZSOK-n8';
      localStorage.setItem('token', testToken);
      console.log('Test token set successfully');
    }
  }, []);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching orders...');
      
      // Get status filter based on selected tab
      const statusFilter = tabValue === 0 ? '' : statusFilters[tabValue].toLowerCase();
      console.log(`Using status filter: ${statusFilter}`);
      
      // Log the API URL being called
      console.log(`API URL: /api/orders?page=${page + 1}&limit=${rowsPerPage}&status=${statusFilter}`);
      
      // Log the auth token
      const token = localStorage.getItem('token');
      console.log('Auth token available:', !!token);
      if (token) {
        console.log('Token first 20 chars:', token.substring(0, 20) + '...');
      }
      
      const response = await getOrders(page + 1, rowsPerPage, statusFilter);
      console.log('Orders response:', response);
      
      let ordersData = [];
      
      if (response.data && Array.isArray(response.data.data)) {
        console.log('Using response.data.data');
        ordersData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        console.log('Using response.data');
        ordersData = response.data;
      } else if (response.data && response.data.orders && Array.isArray(response.data.orders)) {
        console.log('Using response.data.orders');
        ordersData = response.data.orders;
      } else {
        console.log('No valid orders array found in response:', response.data);
      }
      
      // Log the first order to see its structure
      if (ordersData.length > 0) {
        console.log('First order structure:', JSON.stringify(ordersData[0], null, 2));
        
        // Check if buyer is populated
        if (ordersData[0].buyer) {
          console.log('Buyer data in first order:', ordersData[0].buyer);
        } else {
          console.log('No buyer data in first order');
        }
        
        // Process orders to ensure buyer information is available
        ordersData = ordersData.map(order => {
          // If buyer is an ID string instead of an object, create a placeholder
          if (order.buyer && typeof order.buyer === 'string') {
            console.log(`Order ${order._id} has buyer as string ID: ${order.buyer}`);
            order.buyer = { _id: order.buyer, name: 'Customer #' + order.buyer.substring(0, 6) };
          }
          
          // Ensure there's always a buyer object
          if (!order.buyer) {
            console.log(`Order ${order._id} has no buyer, creating placeholder`);
            order.buyer = { name: 'Unknown Customer' };
          }
          
          return order;
        });
      } else {
        console.log('No orders found in response');
      }
      
      setOrders(ordersData);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error details:', error.response?.data || error.message);
      setSnackbar({
        open: true,
        message: 'Failed to fetch orders. Please ensure the backend server is running.',
        severity: 'error'
      });
      
      // Set empty orders array
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle dialog open for viewing order details
  const handleOpenOrderDialog = async (order) => {
    try {
      // Fetch detailed order information
      const orderId = order._id || order.id;
      console.log(`Fetching details for order ID: ${orderId}`);
      
      const response = await getOrderDetails(orderId);
      console.log('Order details response:', response);
      
      if (response.data && response.data.data) {
        setCurrentOrder(response.data.data);
        setStatusUpdate(response.data.data.status);
      } else if (response.data) {
        setCurrentOrder(response.data);
        setStatusUpdate(response.data.status);
      } else {
        setCurrentOrder(order);
        setStatusUpdate(order.status);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      // Fallback to using the order data we already have
      setCurrentOrder(order);
      setStatusUpdate(order.status);
    }
    
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentOrder(null);
  };

  // Add a function to get valid next statuses based on current status
  const getValidNextStatuses = (currentStatus) => {
    const validTransitions = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: []
    };
    
    return validTransitions[currentStatus] || [];
  };
  
  // Add a function to get a helpful message about status transitions
  const getStatusTransitionMessage = (currentStatus) => {
    switch(currentStatus) {
      case 'pending':
        return 'This order can be moved to "processing" when you start preparing it, or "cancelled" if needed.';
      case 'processing':
        return 'This order must be moved to "shipped" before it can be delivered.';
      case 'shipped':
        return 'This order can be marked as "delivered" once the customer receives it.';
      case 'delivered':
        return 'This order has been delivered and cannot be updated further.';
      case 'cancelled':
        return 'This order has been cancelled and cannot be updated further.';
      default:
        return '';
    }
  };

  // Handle order status update
  const handleStatusUpdate = async () => {
    try {
      // Validate status transition
      const orderId = currentOrder._id || currentOrder.id;
      const currentStatus = currentOrder.status;
      const validNextStatuses = getValidNextStatuses(currentStatus);
      
      if (!validNextStatuses.includes(statusUpdate) && statusUpdate !== currentStatus) {
        setSnackbar({
          open: true,
          message: `Cannot change status from "${currentStatus}" to "${statusUpdate}". Valid next statuses are: ${validNextStatuses.join(', ') || 'none'}.`,
          severity: 'error'
        });
        return;
      }
      
      setLoading(true);
      
      // Get the order ID
      console.log(`Updating status for order ID: ${orderId} to ${statusUpdate}`);
      console.log(`API endpoint: PATCH /api/orders/${orderId}/status`);
      
      // Call API to update order status
      const response = await updateOrderStatus(orderId, statusUpdate);
      console.log('Status update response:', response);
      
      // Update local state to reflect the change
      setOrders(orders.map(order => {
        const orderIdToCompare = order._id || order.id;
        return orderIdToCompare === orderId ? { ...order, status: statusUpdate } : order;
      }));
      
      setSnackbar({
        open: true,
        message: 'Order status updated successfully',
        severity: 'success'
      });
      
      handleCloseDialog();
      
      // Refresh orders after update
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      console.error('Error details:', error.response?.data || error.message);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      setSnackbar({
        open: true,
        message: `Failed to update order status: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter orders based on tab and search term
  const filteredOrders = orders.filter(order => {
    // Filter by tab (if we're not fetching from the server with filters)
    if (tabValue > 0) {
      const statusToMatch = statusFilters[tabValue].toLowerCase();
      if (order.status !== statusToMatch) {
        // Special case for "completed" which might be "delivered" in the database
        if (!(statusToMatch === 'completed' && order.status === 'delivered')) {
          return false;
        }
      }
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const address = getFormattedAddress(order).toLowerCase();
      const customerName = getCustomerName(order).toLowerCase();
      const orderId = (order._id || order.id || '').toString().toLowerCase();
      const orderNumber = (order.orderNumber || '').toString().toLowerCase();
      
      return (
        orderId.includes(searchLower) ||
        orderNumber.includes(searchLower) ||
        customerName.includes(searchLower) ||
        address.includes(searchLower) ||
        (Array.isArray(order.items) && order.items.some(item => 
          (item.name || '').toLowerCase().includes(searchLower) ||
          (item.product?.name || '').toLowerCase().includes(searchLower)
        ))
      );
    }
    
    return true;
  });

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  // Calculate total items in order
  const calculateTotalItems = (items) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  // Fetch orders when tab, page, or rowsPerPage changes
  useEffect(() => {
    fetchOrders();
  }, [tabValue, page, rowsPerPage]);

  // Helper function to get customer name from order
  const getCustomerName = (order) => {
    // For embedded buyer objects (as seen in the database)
    if (order.buyer && typeof order.buyer === 'object' && order.buyer.name) {
      return order.buyer.name;
    }
    
    // Check all possible locations for customer name
    if (order.buyer?.name) {
      return order.buyer.name;
    }
    if (order.customer?.name) {
      return order.customer.name;
    }
    if (order.user?.name) {
      return order.user.name;
    }
    if (order.userName) {
      return order.userName;
    }
    if (order.customerName) {
      return order.customerName;
    }
    if (order.buyerName) {
      return order.buyerName;
    }
    
    // If we have a buyer/customer/user object but no name property
    if (order.buyer && typeof order.buyer === 'object') {
      // Try to find any name-like property
      const buyer = order.buyer;
      
      if (buyer.fullName) return buyer.fullName;
      if (buyer.firstName) return buyer.firstName + (buyer.lastName ? ' ' + buyer.lastName : '');
      if (buyer.username) return buyer.username;
      if (buyer.email) return buyer.email;
    }
    
    // Same for customer object
    if (order.customer && typeof order.customer === 'object') {
      const customer = order.customer;
      
      if (customer.fullName) return customer.fullName;
      if (customer.firstName) return customer.firstName + (customer.lastName ? ' ' + customer.lastName : '');
      if (customer.username) return customer.username;
      if (customer.email) return customer.email;
    }
    
    // Same for user object
    if (order.user && typeof order.user === 'object') {
      const user = order.user;
      
      if (user.fullName) return user.fullName;
      if (user.firstName) return user.firstName + (user.lastName ? ' ' + user.lastName : '');
      if (user.username) return user.username;
      if (user.email) return user.email;
    }
    
    return 'Unknown Customer';
  };

  // Helper function to get customer phone
  const getCustomerPhone = (order) => {
    if (order.phone) return order.phone;
    if (order.buyer?.phone) return order.buyer.phone;
    if (order.customer?.phone) return order.customer.phone;
    if (order.user?.phone) return order.user.phone;
    if (order.contactNumber) return order.contactNumber;
    if (order.phoneNumber) return order.phoneNumber;
    if (order.mobileNumber) return order.mobileNumber;
    
    return 'N/A';
  };

  // Helper function to get formatted shipping address
  const getFormattedAddress = (order) => {
    // Check if we have a shipping address object
    if (order.shippingAddress && typeof order.shippingAddress === 'object') {
      const address = order.shippingAddress;
      const parts = [];
      
      if (address.street) parts.push(address.street);
      if (address.city) parts.push(address.city);
      if (address.state) parts.push(address.state);
      if (address.postalCode) parts.push(address.postalCode);
      if (address.country) parts.push(address.country);
      
      if (parts.length > 0) {
        return parts.join(', ');
      }
    }
    
    // Check for address as a string
    if (order.address && typeof order.address === 'string') {
      return order.address;
    }
    
    // Check for delivery address
    if (order.deliveryAddress) {
      if (typeof order.deliveryAddress === 'string') {
        return order.deliveryAddress;
      } else if (typeof order.deliveryAddress === 'object') {
        const address = order.deliveryAddress;
        const parts = [];
        
        if (address.street) parts.push(address.street);
        if (address.city) parts.push(address.city);
        if (address.state) parts.push(address.state);
        if (address.postalCode) parts.push(address.postalCode);
        if (address.country) parts.push(address.country);
        
        if (parts.length > 0) {
          return parts.join(', ');
        }
      }
    }
    
    // Check if address is in the customer or buyer object
    if (order.customer && order.customer.address) {
      return typeof order.customer.address === 'string' 
        ? order.customer.address 
        : Object.values(order.customer.address).filter(Boolean).join(', ');
    }
    
    if (order.buyer && order.buyer.address) {
      return typeof order.buyer.address === 'string' 
        ? order.buyer.address 
        : Object.values(order.buyer.address).filter(Boolean).join(', ');
    }
    
    return 'N/A';
  };

  // Helper function to get formatted payment method
  const getFormattedPaymentMethod = (order) => {
    if (!order.paymentMethod) return 'N/A';
    
    const method = order.paymentMethod.toLowerCase();
    
    if (method === 'cod' || method === 'cash' || method === 'cash_on_delivery') {
      return 'Cash on Delivery';
    } else if (method === 'online' || method === 'card' || method === 'credit_card' || method === 'debit_card') {
      return 'Online Payment';
    } else if (method === 'upi') {
      return 'UPI';
    } else if (method === 'wallet') {
      return 'Wallet';
    } else if (method === 'bank_transfer') {
      return 'Bank Transfer';
    }
    
    // Capitalize first letter of each word
    return method.replace(/\b\w/g, l => l.toUpperCase());
  };
  
  // Helper function to get formatted payment status
  const getFormattedPaymentStatus = (order) => {
    if (!order.paymentStatus) return 'N/A';
    
    // Capitalize first letter
    return order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1);
  };

  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Order Management
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="order tabs"
          >
            <Tab label="All Orders" />
            <Tab label="Pending" />
            <Tab label="Processing" />
            <Tab label="Shipped" />
            <Tab label="Delivered" />
            <Tab label="Cancelled" />
          </Tabs>
        </Box>
        
        <Box display="flex" mb={3}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        {loading && orders.length === 0 ? (
          <Box display="flex" justifyContent="center" my={5}>
            <CircularProgress />
          </Box>
        ) : filteredOrders.length === 0 ? (
          <Box textAlign="center" my={5}>
            <Typography variant="h6" color="textSecondary">
              No orders found
            </Typography>
            {tabValue === 0 ? (
              <Typography variant="body1" color="textSecondary" mt={1}>
                When customers place orders, they will appear here
              </Typography>
            ) : (
              <Typography variant="body1" color="textSecondary" mt={1}>
                No {tabValue === 1 ? 'pending' : tabValue === 2 ? 'processing' : tabValue === 3 ? 'shipped' : tabValue === 4 ? 'delivered' : 'cancelled'} orders found
              </Typography>
            )}
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((order) => (
                      <TableRow key={order._id || order.id}>
                        <TableCell>
                          {(order._id || order.id)?.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {getCustomerName(order)}
                        </TableCell>
                        <TableCell>
                          {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {Array.isArray(order.items) ? calculateTotalItems(order.items) : 0} items
                        </TableCell>
                        <TableCell>
                          ₹{(order.totalAmount || order.total || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={order.status ? (order.status.charAt(0).toUpperCase() + order.status.slice(1)) : 'Unknown'} 
                            color={getStatusColor(order.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleOpenOrderDialog(order)}
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredOrders.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
      
      {/* Order Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Order Details
        </DialogTitle>
        <DialogContent>
          {currentOrder && (
            <Box mt={2}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Order Information
                  </Typography>
                  <Box mb={2}>
                    <Typography variant="body2">
                      <strong>Order ID:</strong> {currentOrder._id || currentOrder.id || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Date:</strong> {currentOrder.createdAt ? formatDate(currentOrder.createdAt) : 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Payment Method:</strong> {getFormattedPaymentMethod(currentOrder)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Payment Status:</strong> {getFormattedPaymentStatus(currentOrder)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Customer Information
                  </Typography>
                  <Box mb={2}>
                    <Typography variant="body2">
                      <strong>Name:</strong> {getCustomerName(currentOrder)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {getCustomerPhone(currentOrder)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Address:</strong> {getFormattedAddress(currentOrder)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Order Items
              </Typography>
              
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentOrder.items && currentOrder.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name || 'Unknown Item'}</TableCell>
                        <TableCell align="right">{item.quantity || 0} {item.unit || 'unit'}</TableCell>
                        <TableCell align="right">₹{(item.price || 0).toFixed(2)}</TableCell>
                        <TableCell align="right">₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right"><strong>Total Amount:</strong></TableCell>
                      <TableCell align="right"><strong>₹{(currentOrder.totalAmount || currentOrder.total || 0).toFixed(2)}</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Update Order Status
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                {getStatusTransitionMessage(currentOrder.status)}
              </Alert>
              
              <Box display="flex" alignItems="center">
                <FormControl fullWidth sx={{ mr: 2 }}>
                  <InputLabel id="status-select-label">Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    value={statusUpdate}
                    label="Status"
                    onChange={(e) => setStatusUpdate(e.target.value)}
                    disabled={currentOrder.status === 'delivered' || currentOrder.status === 'cancelled'}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="shipped">Shipped</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleStatusUpdate}
                  disabled={statusUpdate === currentOrder.status || loading || currentOrder.status === 'delivered' || currentOrder.status === 'cancelled'}
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Status'}
                </Button>
              </Box>
              
              {/* Add a helper text to show valid transitions */}
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Valid next statuses: {getValidNextStatuses(currentOrder.status).join(', ') || 'None (final status)'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderManagement; 