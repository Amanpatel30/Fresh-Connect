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
  Pagination
} from '@mui/material';
import { 
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon,
  GetApp as DownloadIcon
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
      <Typography 
        variant="h3" 
        sx={{ 
          fontWeight: 'bold', 
          color: color,
          fontSize: { xs: '1.8rem', md: '2.5rem' }
        }}
      >
        {value}
      </Typography>
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
  const [stats, setStats] = useState({
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

  // Fetch order statistics
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
      
      const response = await orderService.getSellerOrders(filterParams);
      
      if (response && response.data) {
        setOrders(response.data);
        setTotalPages(response.pagination?.pages || 1);
        
        // If no stats have been loaded yet, use the counts from this response
        if (stats.total === 0 && response.counts) {
          setStats({
            total: response.counts.total || 0,
            pending: response.counts.pending || 0,
            processing: response.counts.processing || 0,
            delivered: response.counts.delivered || 0,
            cancelled: response.counts.cancelled || 0
          });
        }
      } else {
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
      
      if (response && response.data) {
        setStats({
          total: response.data.totalOrders || 0,
          pending: response.data.pendingOrders || 0,
          processing: response.data.processingOrders || 0,
          delivered: response.data.deliveredOrders || 0,
          cancelled: response.data.cancelledOrders || 0
        });
      }
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      // Set default values if API fails
      setStats({
        total: 0,
        pending: 0,
        processing: 0,
        delivered: 0,
        cancelled: 0
      });
    }
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
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || order.status === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

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
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <StatusCard
            title="Total Orders"
            value={stats.total}
            color="#4361ee"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatusCard
            title="Pending Orders"
            value={stats.pending}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatusCard
            title="Processing"
            value={stats.processing}
            color="#3b82f6"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatusCard
            title="Delivered"
            value={stats.delivered}
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
              <MenuItem value="Delivered">Delivered</MenuItem>
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
                        backgroundColor: order.status === 'pending' ? '#FEF3C7' : order.status === 'processing' ? '#DBEAFE' : '#D1FAE5',
                        color: order.status === 'pending' ? '#D97706' : order.status === 'processing' ? '#2563EB' : '#059669',
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
                      sx={{ 
                        color: '#4361ee',
                        backgroundColor: 'rgba(67, 97, 238, 0.1)',
                        borderRadius: '8px',
                        '&:hover': {
                          backgroundColor: 'rgba(67, 97, 238, 0.2)',
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
    </Box>
  );
};

export default Orders; 