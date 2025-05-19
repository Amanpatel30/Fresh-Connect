import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Stack,
  CircularProgress,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { 
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon,
  GetApp as DownloadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useThemeMode } from '../../context/ThemeContext';
import * as orderService from '../../services/orderService';
import { useSnackbar } from 'notistack';

// Status Card component
const StatusCard = ({ title, value, color }) => {
  const { mode } = useThemeMode();
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        background: mode === 'dark' ? '#1e1e2d' : '#ffffff',
        border: '1px solid',
        borderColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        textAlign: 'center',
        gap: 1,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }
      }}
    >
      <Typography color="text.secondary" variant="body2" sx={{ fontSize: '0.9rem' }}>
        {title}
      </Typography>
      <Box 
        component="div" 
        sx={{ 
          fontWeight: 'bold', 
          color: color,
          fontSize: { xs: '1.8rem', md: '2.5rem' }
        }}
      >
        {value}
      </Box>
    </Paper>
  );
};

const Orders = () => {
  const { mode } = useThemeMode();
  const { enqueueSnackbar } = useSnackbar();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
    cancelled: 0
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 10
  });

  // Fetch orders when the component mounts or filters change
  useEffect(() => {
    fetchOrders();
  }, [filters, page]);

  // Fetch order statistics only once when component mounts
  useEffect(() => {
    fetchOrderStats();
  }, []);

  // Fetch orders from the API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Create the filter parameters
      const filterParams = {
        ...filters,
        page,
        search: searchTerm,
        status: statusFilter !== 'All Status' ? statusFilter.toLowerCase() : ''
      };
      
      console.log('Fetching orders with parameters:', filterParams);
      
      const response = await orderService.getSellerOrders(filterParams);
      console.log('Order response structure:', JSON.stringify(response, null, 2));
      
      if (response && response.data) {
        // Map the order data to the expected format if needed
        const formattedOrders = response.data.map(order => {
          // Create a consistent structure regardless of the API response format
          return {
            id: order.id || order._id,
            customer: order.customer || order.buyer?.name || order.shippingAddress?.fullName || 'Unknown Customer',
            date: order.date || (order.createdAt && new Date(order.createdAt).toLocaleDateString()) || 'N/A',
            total: order.total || (order.totalAmount && `₹${order.totalAmount.toFixed(2)}`) || 'N/A',
            status: order.status || 'pending',
            items: order.items || [],
            shippingAddress: order.shippingAddress || {},
            buyer: order.buyer || {},
            // Keep the original order object to ensure we don't lose any data
            original: order
          };
        });
        
        console.log('Formatted orders:', formattedOrders);
        setOrders(formattedOrders);
        setTotalPages(response.pagination?.pages || 1);
        
        // If no stats have been loaded yet, use the counts from this response
        if (totalStats.total === 0 && response.counts) {
          setTotalStats({
            total: response.counts.total || 0,
            pending: response.counts.pending || 0,
            processing: response.counts.processing || 0,
            delivered: response.counts.delivered || 0,
            cancelled: response.counts.cancelled || 0
          });
        }
      } else {
        console.warn('No order data received from API');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      enqueueSnackbar('Failed to load orders. Please try again.', { variant: 'error' });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch order statistics
  const fetchOrderStats = async () => {
    try {
      const response = await orderService.getOrderStats();
      console.log('Order stats API response:', response);
      
      // Log the FULL response structure to debug
      console.log('FULL order stats response:', JSON.stringify(response, null, 2));
      
      if (response && response.orderStats) {
        // If response has an orderStats object, use that directly
        console.log('Found orderStats object:', response.orderStats);
        
        const statsData = {
          total: response.orderStats.totalOrders || response.orderStats.total || 0,
          pending: response.orderStats.pendingOrders || response.orderStats.pending || 0,
          processing: response.orderStats.processingOrders || response.orderStats.processing || 0,
          delivered: response.orderStats.deliveredOrders || response.orderStats.delivered || 0,
          cancelled: response.orderStats.cancelledOrders || response.orderStats.cancelled || 0
        };
        
        console.log('Setting total stats from API:', statsData);
        setTotalStats(statsData);
      } 
      else if (response && response.data && response.data.orderStats) {
        // If response has data.orderStats, use that
        console.log('Found data.orderStats object:', response.data.orderStats);
        
        const statsData = {
          total: response.data.orderStats.totalOrders || response.data.orderStats.total || 0,
          pending: response.data.orderStats.pendingOrders || response.data.orderStats.pending || 0,
          processing: response.data.orderStats.processingOrders || response.data.orderStats.processing || 0,
          delivered: response.data.orderStats.deliveredOrders || response.data.orderStats.delivered || 0,
          cancelled: response.data.orderStats.cancelledOrders || response.data.orderStats.cancelled || 0
        };
        
        console.log('Setting total stats from API:', statsData);
        setTotalStats(statsData);
      }
      else if (response && response.data) {
        // If we have complete order data without filtering
        const allOrders = await orderService.getAllOrders();
        
        if (allOrders && allOrders.data) {
          const pendingCount = allOrders.data.filter(o => o.status === 'pending').length;
          const processingCount = allOrders.data.filter(o => (o.status === 'processing' || o.status === 'shipped')).length;
          const deliveredCount = allOrders.data.filter(o => o.status === 'delivered').length;
          const cancelledCount = allOrders.data.filter(o => o.status === 'cancelled').length;
          
          const statsData = {
            total: allOrders.data.length,
            pending: pendingCount,
            processing: processingCount,
            delivered: deliveredCount,
            cancelled: cancelledCount
          };
          
          console.log('Setting total stats from all orders:', statsData);
          setTotalStats(statsData);
        }
      } else {
        console.warn('No order stats data received from API');
        // Make a separate call to get ALL orders for stats if orders endpoint exists
        try {
          const allOrders = await orderService.getAllOrders();
          
          if (allOrders && allOrders.data) {
            const pendingCount = allOrders.data.filter(o => o.status === 'pending').length;
            const processingCount = allOrders.data.filter(o => (o.status === 'processing' || o.status === 'shipped')).length;
            const deliveredCount = allOrders.data.filter(o => o.status === 'delivered').length;
            const cancelledCount = allOrders.data.filter(o => o.status === 'cancelled').length;
            
            const statsData = {
              total: allOrders.data.length,
              pending: pendingCount,
              processing: processingCount,
              delivered: deliveredCount,
              cancelled: cancelledCount
            };
            
            console.log('Setting total stats from all orders fallback:', statsData);
            setTotalStats(statsData);
          }
        } catch (error) {
          console.error('Error fetching all orders for stats:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      // Fallback to first page of orders if stats API fails
      try {
        const allOrders = await orderService.getAllOrders();
        if (allOrders && allOrders.data) {
          const statsData = calculateStatsFromOrders(allOrders.data);
          console.log('Setting total stats from fallback orders:', statsData);
          setTotalStats(statsData);
        }
      } catch (fallbackError) {
        console.error('Fallback stats calculation failed:', fallbackError);
      }
    }
  };
  
  // Helper function to calculate stats from an array of orders
  const calculateStatsFromOrders = (ordersArray) => {
    if (!ordersArray || ordersArray.length === 0) {
      return {
        total: 0,
        pending: 0,
        processing: 0,
        delivered: 0,
        cancelled: 0
      };
    }
    
    const pendingCount = ordersArray.filter(o => o.status === 'pending').length;
    const processingCount = ordersArray.filter(o => (o.status === 'processing' || o.status === 'shipped')).length;
    const deliveredCount = ordersArray.filter(o => o.status === 'delivered').length;
    const cancelledCount = ordersArray.filter(o => o.status === 'cancelled').length;
    
    return {
      total: ordersArray.length,
      pending: pendingCount,
      processing: processingCount,
      delivered: deliveredCount,
      cancelled: cancelledCount
    };
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: event.target.value, page: 1 }));
      setPage(1);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  // Handle status filter change
  const handleStatusChange = (event) => {
    const status = event.target.value;
    setStatusFilter(status);
    setFilters(prev => ({ 
      ...prev, 
      status: status !== 'All Status' ? status.toLowerCase() : '',
      page: 1
    }));
    setPage(1);
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    setFilters(prev => ({ ...prev, page: value }));
  };

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    // Check if order exists and has required properties
    if (!order) return false;
    
    // Handle customer property safely with optional chaining and fallbacks
    const customerName = order.customer?.toLowerCase() || 
                        order.buyer?.name?.toLowerCase() || 
                        order.shippingAddress?.fullName?.toLowerCase() || 
                        '';
    
    // Handle ID property safely
    const orderId = order.id?.toLowerCase() || order._id?.toLowerCase() || '';
    
    const matchesSearch = searchTerm === '' || 
                          customerName.includes(searchTerm.toLowerCase()) ||
                          orderId.includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All Status' || 
                          order.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Add state for order details dialog
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updatedStatus, setUpdatedStatus] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  // Handle view order details
  const handleViewOrder = (order) => {
    console.log('View order clicked:', order);
    setSelectedOrder(order);
    setUpdatedStatus(order.status || 'pending');
    setDialogOpen(true);
  };

  // Handle close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setStatusUpdateLoading(false);
  };

  // Handle status update
  const handleOrderStatusChange = (event) => {
    setUpdatedStatus(event.target.value);
  };

  // Get valid next statuses for an order based on current status
  const getValidNextStatuses = (currentStatus) => {
    const transitions = {
      'pending': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'returned'],
      'delivered': [], // No further transitions allowed
      'cancelled': [], // No further transitions allowed
      'returned': [] // No further transitions allowed
    };
    
    return transitions[currentStatus] || [];
  };

  // Check if a status transition is valid
  const isValidStatusTransition = (currentStatus, newStatus) => {
    // Allow setting the same status
    if (currentStatus === newStatus) return true;
    
    // Get valid next statuses for current status
    const validNextStatuses = getValidNextStatuses(currentStatus);
    
    // Check if new status is in the valid list
    return validNextStatuses.includes(newStatus);
  };

  // Get a helpful message about valid transitions
  const getStatusTransitionMessage = (currentStatus) => {
    const validStatuses = getValidNextStatuses(currentStatus);
    
    if (validStatuses.length === 0) {
      return 'This order is in a final state and cannot be changed.';
    }
    
    return `This order can be updated to: ${validStatuses.join(', ')}`;
  };

  // Update order status in the database
  const updateOrderStatus = async () => {
    if (!selectedOrder || !updatedStatus) return;
    
    // Validate the status transition
    const currentStatus = selectedOrder.status;
    
    if (!isValidStatusTransition(currentStatus, updatedStatus)) {
      enqueueSnackbar(
        `Invalid status transition from "${currentStatus}" to "${updatedStatus}".` +
        ` Valid next statuses are: ${getValidNextStatuses(currentStatus).join(', ') || 'none'}`,
        { variant: 'error' }
      );
      return; // Exit without attempting update
    }
    
    setStatusUpdateLoading(true);
    try {
      // Call the API to update the order status
      const response = await orderService.updateOrderStatus(
        selectedOrder.id || selectedOrder._id || selectedOrder.original?._id,
        { status: updatedStatus }
      );
      
      console.log('Order status update response:', response);
      
      if (response && (response.success || response.data)) {
        enqueueSnackbar('Order status updated successfully', { variant: 'success' });
        
        // Update local orders data
        setOrders(prevOrders => prevOrders.map(order => {
          if (order.id === selectedOrder.id) {
            return { ...order, status: updatedStatus };
          }
          return order;
        }));
        
        // Refresh order data and stats
        fetchOrders();
        fetchOrderStats(); // Refresh the stats to reflect the updated status counts
        
        // Close the dialog
        handleCloseDialog();
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      enqueueSnackbar('Failed to update order status. Please try again.', { variant: 'error' });
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  return (
    <Box sx={{ p: 0 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: mode === 'dark' ? '#f0f0f0' : '#1e293b' }}>
          Orders
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            size="small"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              borderColor: mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
              color: mode === 'dark' ? '#f0f0f0' : '#1e293b',
              '&:hover': {
                borderColor: mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              }
            }}
          >
            Export
          </Button>
        </Stack>
      </Box>
      
      {/* Status Cards */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2">
          Debug - Orders: {totalStats.total} | Pending: {totalStats.pending} | Processing: {totalStats.processing} | Delivered: {totalStats.delivered}
        </Typography>
      </Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <StatusCard
            title="Total Orders"
            value={totalStats.total}
            color="#4361ee"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatusCard
            title="Pending Orders"
            value={totalStats.pending}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatusCard
            title="Processing"
            value={totalStats.processing}
            color="#3b82f6"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatusCard
            title="Delivered"
            value={totalStats.delivered}
            color="#10b981"
          />
        </Grid>
      </Grid>
      
      {/* Search and Filter */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          backgroundColor: mode === 'dark' ? '#1e1e2d' : '#ffffff',
          border: '1px solid',
          borderColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        }}
      >
        <TextField
          placeholder="Search orders..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ 
            width: { xs: '100%', sm: '350px' },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
        
        <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
          <FormControl 
            size="small" 
            sx={{ 
              width: { xs: '100%', sm: '200px' },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          >
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="Status"
              onChange={handleStatusChange}
            >
              <MenuItem value="All Status">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Processing">Processing</MenuItem>
              <MenuItem value="Shipped">Shipped</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
              <MenuItem value="Returned">Returned</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            size="small"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              borderColor: mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
              color: mode === 'dark' ? '#f0f0f0' : '#1e293b',
              '&:hover': {
                borderColor: mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              }
            }}
          >
            Filters
          </Button>
        </Box>
      </Paper>
      
      {/* Orders Table */}
      <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Table sx={{ minWidth: 650 }} aria-label="orders table">
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            }}>
              <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Loading skeleton rows
              Array.from(new Array(5)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={6} sx={{ py: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {index === 2 && <CircularProgress size={24} sx={{ mr: 2 }} />}
                      {index === 2 && <Typography color="text.secondary">Loading orders...</Typography>}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredOrders.length === 0 ? (
              // No orders found
              <TableRow>
                <TableCell colSpan={6} sx={{ py: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No orders found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      {searchTerm ? `No orders matching "${searchTerm}"` : statusFilter !== 'All Status' ? `No ${statusFilter.toLowerCase()} orders found` : 'There are no orders to display'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              // Orders data
              filteredOrders.map((order) => (
                <TableRow
                  key={order.id}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': {
                      backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
                    }
                  }}
                >
                  <TableCell 
                    component="th" 
                    scope="row"
                    sx={{ 
                      color: mode === 'dark' ? '#f0f0f0' : '#1e293b',
                      fontWeight: 500,
                      borderBottom: '1px solid',
                      borderColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    }}
                  >
                    {order.id}
                  </TableCell>
                  <TableCell
                    sx={{ 
                      color: mode === 'dark' ? '#f0f0f0' : '#1e293b',
                      borderBottom: '1px solid',
                      borderColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    }}
                  >
                    {order.customer}
                  </TableCell>
                  <TableCell
                    sx={{ 
                      color: mode === 'dark' ? '#f0f0f0' : '#1e293b',
                      borderBottom: '1px solid',
                      borderColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    }}
                  >
                    {order.date}
                  </TableCell>
                  <TableCell
                    sx={{ 
                      color: mode === 'dark' ? '#f0f0f0' : '#1e293b',
                      fontWeight: 500,
                      borderBottom: '1px solid',
                      borderColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    }}
                  >
                    {order.total}
                  </TableCell>
                  <TableCell
                    sx={{ 
                      borderBottom: '1px solid',
                      borderColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    }}
                  >
                    <Chip 
                      label={order.status} 
                      size="small"
                      sx={{ 
                        backgroundColor: 
                          order.status === 'pending' ? '#FEF3C7' : 
                          order.status === 'processing' ? '#DBEAFE' : 
                          order.status === 'shipped' ? '#E0F2FE' :
                          order.status === 'delivered' ? '#D1FAE5' :
                          order.status === 'cancelled' ? '#FEE2E2' :
                          order.status === 'returned' ? '#FED7AA' : '#D1D5DB',
                        color: 
                          order.status === 'pending' ? '#D97706' : 
                          order.status === 'processing' ? '#2563EB' : 
                          order.status === 'shipped' ? '#0284C7' :
                          order.status === 'delivered' ? '#059669' :
                          order.status === 'cancelled' ? '#DC2626' :
                          order.status === 'returned' ? '#B45309' : '#4B5563',
                        fontWeight: 500,
                        textTransform: 'capitalize',
                        borderRadius: '6px',
                      }}
                    />
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      borderBottom: '1px solid',
                      borderColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    }}
                  >
                    <IconButton 
                      size="small"
                      onClick={() => handleViewOrder(order)}
                      aria-label="View order details"
                      sx={{ 
                        color: '#4361ee',
                        backgroundColor: 'rgba(67, 97, 238, 0.1)',
                        borderRadius: '8px',
                        padding: '5px',
                        visibility: 'visible', // Ensure visibility
                        '&:hover': {
                          backgroundColor: 'rgba(67, 97, 238, 0.2)',
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination - only show when not loading and there are orders */}
      {!loading && filteredOrders.length > 0 && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Order Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pb: 1
          }}
          component="div"
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Order Details
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseDialog}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Order ID
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedOrder.id || selectedOrder._id || selectedOrder.original?._id || 'N/A'}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Customer
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedOrder.customer || selectedOrder.original?.shippingAddress?.fullName || 'N/A'}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Date
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedOrder.date || new Date(selectedOrder.original?.createdAt).toLocaleDateString() || 'N/A'}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Status
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip 
                      label={selectedOrder.status || 'N/A'} 
                      color={
                        selectedOrder.status === 'pending' ? 'warning' :
                        selectedOrder.status === 'processing' ? 'info' :
                        selectedOrder.status === 'shipped' ? 'primary' :
                        selectedOrder.status === 'delivered' ? 'success' : 
                        selectedOrder.status === 'cancelled' ? 'error' : 'default'
                      } 
                      size="small" 
                      sx={{ textTransform: 'capitalize' }}
                    />
                    
                    {/* Status Update Selector */}
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel id="update-status-label">Update Status</InputLabel>
                      <Select
                        labelId="update-status-label"
                        id="update-status-select"
                        value={updatedStatus}
                        label="Update Status"
                        onChange={handleOrderStatusChange}
                        disabled={getValidNextStatuses(selectedOrder.status).length === 0}
                      >
                        <MenuItem 
                          value="pending" 
                          disabled={!isValidStatusTransition(selectedOrder.status, 'pending')}
                        >
                          Pending
                        </MenuItem>
                        <MenuItem 
                          value="processing" 
                          disabled={!isValidStatusTransition(selectedOrder.status, 'processing')}
                        >
                          Processing
                        </MenuItem>
                        <MenuItem 
                          value="shipped" 
                          disabled={!isValidStatusTransition(selectedOrder.status, 'shipped')}
                        >
                          Shipped
                        </MenuItem>
                        <MenuItem 
                          value="delivered" 
                          disabled={!isValidStatusTransition(selectedOrder.status, 'delivered')}
                        >
                          Delivered
                        </MenuItem>
                        <MenuItem 
                          value="cancelled" 
                          disabled={!isValidStatusTransition(selectedOrder.status, 'cancelled')}
                        >
                          Cancelled
                        </MenuItem>
                        <MenuItem 
                          value="returned" 
                          disabled={!isValidStatusTransition(selectedOrder.status, 'returned')}
                        >
                          Returned
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  
                  {/* Status Transition Help Text */}
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ mt: 1, display: 'block' }}
                  >
                    {getStatusTransitionMessage(selectedOrder.status)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Shipping Address
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedOrder.original?.shippingAddress?.address || 'N/A'}<br />
                  {selectedOrder.original?.shippingAddress?.city || ''}{selectedOrder.original?.shippingAddress?.city ? ', ' : ''}
                  {selectedOrder.original?.shippingAddress?.state || ''} {selectedOrder.original?.shippingAddress?.postalCode || ''}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Payment Method
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedOrder.original?.paymentMethod || 'N/A'}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Total
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {selectedOrder.total || selectedOrder.original?.totalAmount ? `₹${selectedOrder.original?.totalAmount}` : 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Order Items
                </Typography>
                <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(selectedOrder.items || selectedOrder.original?.items || []).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name || 'Product'}</TableCell>
                          <TableCell align="right">₹{item.price}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">₹{item.price * item.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
          <Button 
            color="primary" 
            variant="contained"
            onClick={updateOrderStatus}
            disabled={
              statusUpdateLoading || 
              updatedStatus === selectedOrder?.status || 
              getValidNextStatuses(selectedOrder?.status).length === 0
            }
          >
            {statusUpdateLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders; 