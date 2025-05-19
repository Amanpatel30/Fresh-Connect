import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Badge,
  Paper,
  Avatar,
  Tooltip,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  Slider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  LocalShipping as ShippingIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Preview as PreviewIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  WarningAmber as WarningIcon,
  LocalAtm as AtmIcon,
  MonetizationOn as PaidIcon,
  Inventory as InventoryIcon,
  Restaurant as RestaurantIcon,
  Store as StoreIcon,
  Person as PersonIcon,
  Nature as OrganicIcon,
  AccessTime as ExpiringSoonIcon,
  Discount as DiscountIcon,
  Recycling as CompostIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Kitchen as FoodBankIcon,
  VerifiedUser as VerifiedIcon,
  Cached as ProcessingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

// API base URL
const API_URL = 'http://localhost:5003/api/orders';

// Create a test JWT token if none exists
const ensureToken = () => {
  let token = localStorage.getItem('token');
  if (!token) {
    // Create a simple test token (for development only)
    // In production, this should be obtained through proper authentication
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJuYW1lIjoiVGVzdCBVc2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    localStorage.setItem('token', testToken);
    token = testToken;
  }
  return token;
};

// Sample order data (fallback if API fails)
const FALLBACK_ORDERS = [
  {
    id: 'ORD-78945',
    customer: {
      name: 'Hilton Garden Inn',
      email: 'purchasing@hilton.com',
      avatar: 'HG',
      type: 'hotel',
      phone: '+1-555-123-4567',
      address: '123 Main St, New York, NY 10001'
    },
    orderDate: '2023-05-15',
    status: 'Delivered',
    amount: 459.99,
    paymentStatus: 'Paid',
    items: 8,
    orderType: 'Regular Vegetables',
    sellerName: 'Green Farms Organic',
    sellerVerified: true,
    shippingAddress: '123 Main St, New York, NY 10001'
  },
  // ... keep other sample orders
];

// Function to test API connection
const testOrdersAPI = async () => {
  try {
    // Get token from localStorage
    const token = ensureToken();
    
    // Get all orders
    const response = await fetch(`${API_URL}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    console.log('Orders API test successful');
    return { success: true, data };
  } catch (error) {
    console.error('Orders API test error:', error);
    return { success: false, error: error.message };
  }
};

const OrderMonitoring = () => {
  const location = useLocation();
  // State
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiWorking, setApiWorking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortField, setSortField] = useState('orderDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [orderTypeFilter, setOrderTypeFilter] = useState('All');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('All');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5001]);
  const [sellerFilter, setSellerFilter] = useState('All');
  const [itemCountFilter, setItemCountFilter] = useState('All');
  
  // Check if we're on the Orders page
  const isOrdersPage = location.pathname.includes('/orders') || location.pathname.includes('/order');
  
  // Only log API URL when on Orders page
  useEffect(() => {
    if (isOrdersPage) {
      console.log('Using Orders API URL:', API_URL);
    }
  }, [isOrdersPage]);

  // Test API connection
  useEffect(() => {
    const testAPI = async () => {
      if (!isOrdersPage) {
        return; // Skip API calls if not on Orders page
      }
      
      console.log('Testing Orders API connection...');
      const result = await testOrdersAPI();
      setApiWorking(result.success);
    };
    
    testAPI();
  }, [isOrdersPage]);
  
  // Load orders data
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isOrdersPage) {
        return; // Skip API calls if not on Orders page
      }
      
      setLoading(true);
      
      try {
        // Get token from localStorage
        const token = ensureToken();
        
        // Fetch orders from MongoDB major-project orders collection
        const response = await fetch(API_URL, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        let ordersData;
        
        if (response.ok) {
          ordersData = await response.json();
          console.log('Orders data fetched successfully from MongoDB:', ordersData);
        } else {
          console.error('Error fetching orders from MongoDB:', response.status);
          ordersData = FALLBACK_ORDERS;
        }
        
        // Format the data as needed
        const formattedOrders = ordersData.map((order, index) => {
          // Extract MongoDB ID and preserve it
          const mongoId = order._id && order._id.$oid ? order._id.$oid : (order._id || `temp-${index}`);
          
          // Use the existing orderNumber if available, otherwise create a formatted one
          const orderId = order.orderNumber || `ORD-${new Date().getFullYear()}-${String(index + 1).padStart(4, '0')}`;
          
          // Extract user ID in correct format
          const userId = order.user && order.user.$oid ? order.user.$oid : (order.user || null);
          
          // Extract seller ID in correct format
          const sellerId = order.seller && order.seller.$oid ? order.seller.$oid : (order.seller || null);
          
          // Get seller name from the order data or use a default format
          const sellerName = order.sellerName || (order.seller?.name || `Farmer ${sellerId ? sellerId.slice(-4) : 'Unknown'}`);
          
          // Only set payment status to Paid when order status is delivered
          const paymentStatus = order.status?.toLowerCase() === 'delivered' ? 'Paid' : 'Pending';
          
          return {
            id: orderId,
            originalId: mongoId,
            customer: {
              name: order.shippingAddress?.fullName || 'Unknown Customer',
              email: order.user?.email || '',
              avatar: order.shippingAddress?.fullName?.charAt(0) || 'U',
              type: order.customerType || 'consumer',
              phone: order.shippingAddress?.phone || '',
              address: order.shippingAddress?.address || ''
            },
            orderDate: order.createdAt ? new Date(order.createdAt.$date || order.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
            orderDateRaw: order.createdAt ? new Date(order.createdAt.$date || order.createdAt) : new Date(),
            status: order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending',
            amount: order.totalAmount || 0,
            paymentStatus: paymentStatus,
            items: order.items?.length || 0,
            orderType: 'Regular Vegetables',
            sellerName: sellerName,
            sellerVerified: true,
            shippingAddress: order.shippingAddress ? 
              `${order.shippingAddress.address || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.postalCode || ''}, ${order.shippingAddress.country || ''}` : '',
            userId: userId,
            sellerId: sellerId,
            rawData: order // Store original data for reference
          };
        });
        
        console.log('Formatted orders:', formattedOrders);
        setOrders(formattedOrders);
        setFilteredOrders(formattedOrders);
      } catch (error) {
        console.error('Error fetching orders data from MongoDB:', error);
        setOrders(FALLBACK_ORDERS);
        setFilteredOrders(FALLBACK_ORDERS);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [isOrdersPage]);
  
  // Refresh data function
  const refreshOrdersData = async () => {
    if (!isOrdersPage) {
      return; // Skip API calls if not on Orders page
    }
    
    setLoading(true);
    
    try {
      // Get token from localStorage
      const token = ensureToken();
      
      // Fetch orders from MongoDB major-project orders collection
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      let ordersData;
      
      if (response.ok) {
        ordersData = await response.json();
        console.log('Orders data refreshed successfully from MongoDB:', ordersData);
      } else {
        console.error('Error refreshing orders from MongoDB:', response.status);
        ordersData = FALLBACK_ORDERS;
      }
      
      // Format the data as needed
      const formattedOrders = ordersData.map((order, index) => {
        // Extract MongoDB ID and preserve it
        const mongoId = order._id && order._id.$oid ? order._id.$oid : (order._id || `temp-${index}`);
        
        // Use the existing orderNumber if available, otherwise create a formatted one
        const orderId = order.orderNumber || `ORD-${new Date().getFullYear()}-${String(index + 1).padStart(4, '0')}`;
        
        // Extract user ID in correct format
        const userId = order.user && order.user.$oid ? order.user.$oid : (order.user || null);
        
        // Extract seller ID in correct format
        const sellerId = order.seller && order.seller.$oid ? order.seller.$oid : (order.seller || null);
        
        // Get seller name from the order data or use a default format
        const sellerName = order.sellerName || (order.seller?.name || `Farmer ${sellerId ? sellerId.slice(-4) : 'Unknown'}`);
        
        // Only set payment status to Paid when order status is delivered
        const paymentStatus = order.status?.toLowerCase() === 'delivered' ? 'Paid' : 'Pending';
        
        return {
          id: orderId,
          originalId: mongoId,
          customer: {
            name: order.shippingAddress?.fullName || 'Unknown Customer',
            email: order.user?.email || '',
            avatar: order.shippingAddress?.fullName?.charAt(0) || 'U',
            type: order.customerType || 'consumer',
            phone: order.shippingAddress?.phone || '',
            address: order.shippingAddress?.address || ''
          },
          orderDate: order.createdAt ? new Date(order.createdAt.$date || order.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          orderDateRaw: order.createdAt ? new Date(order.createdAt.$date || order.createdAt) : new Date(),
          status: order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending',
          amount: order.totalAmount || 0,
          paymentStatus: paymentStatus,
          items: order.items?.length || 0,
          orderType: 'Regular Vegetables',
          sellerName: sellerName,
          sellerVerified: true,
          shippingAddress: order.shippingAddress ? 
            `${order.shippingAddress.address || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.postalCode || ''}, ${order.shippingAddress.country || ''}` : '',
          userId: userId,
          sellerId: sellerId,
          rawData: order // Store original data for reference
        };
      });
      
      setOrders(formattedOrders);
      setFilteredOrders(formattedOrders);
    } catch (error) {
      console.error('Error refreshing orders data from MongoDB:', error);
      setOrders(FALLBACK_ORDERS);
      setFilteredOrders(FALLBACK_ORDERS);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter orders based on search query and filters
  useEffect(() => {
    let filtered = [...orders];
    
    // Apply search
    if (searchQuery.trim() !== '') {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        order => 
          order.id.toLowerCase().includes(lowercaseQuery) || 
          order.customer.name.toLowerCase().includes(lowercaseQuery) ||
          order.customer.email.toLowerCase().includes(lowercaseQuery) ||
          order.sellerName.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    // If a specific status is selected from the dropdown, use that as priority
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(order => 
        order.status.toLowerCase() === selectedStatus.toLowerCase()
      );
    } 
    // Otherwise, apply status filter based on tab selection
    else if (tabValue === 1) {
      filtered = filtered.filter(order => 
        order.status.toLowerCase() === 'pending'
      );
    } else if (tabValue === 2) {
      filtered = filtered.filter(order => 
        ['processing', 'shipped'].includes(order.status.toLowerCase())
      );
    } else if (tabValue === 3) {
      filtered = filtered.filter(order => 
        order.status.toLowerCase() === 'delivered'
      );
    } else if (tabValue === 4) {
      filtered = filtered.filter(order => 
        ['cancelled', 'returned'].includes(order.status.toLowerCase())
      );
    }
    
    // Apply order type filter if not "All"
    if (orderTypeFilter !== 'All') {
      filtered = filtered.filter(order => order.orderType === orderTypeFilter);
    }
    
    // Apply customer type filter if not "All"
    if (customerTypeFilter !== 'All') {
      filtered = filtered.filter(order => order.customer.type === customerTypeFilter);
    }
    
    // Apply date filter
    const today = new Date();
    if (dateFilter === 'Today') {
      // Convert to date strings for comparison - today starts at 00:00:00
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const tomorrowStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDateRaw);
        return orderDate >= todayStart && orderDate < tomorrowStart;
      });
    } else if (dateFilter === 'This Week') {
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0); // Set to start of day
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDateRaw);
        return orderDate >= weekAgo;
      });
    } else if (dateFilter === 'This Month') {
      const monthAgo = new Date();
      monthAgo.setMonth(today.getMonth() - 1);
      monthAgo.setHours(0, 0, 0, 0); // Set to start of day
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDateRaw);
        return orderDate >= monthAgo;
      });
    }
    
    // Apply price range filter
    filtered = filtered.filter(order => 
      order.amount >= priceRange[0] && order.amount <= priceRange[1]
    );
    
    // Apply seller filter
    if (sellerFilter !== 'All') {
      filtered = filtered.filter(order => order.sellerName === sellerFilter);
    }
    
    // Apply item count filter
    if (itemCountFilter !== 'All') {
      if (itemCountFilter === '1-3') {
        filtered = filtered.filter(order => order.items >= 1 && order.items <= 3);
      } else if (itemCountFilter === '4-6') {
        filtered = filtered.filter(order => order.items >= 4 && order.items <= 6);
      } else if (itemCountFilter === '7+') {
        filtered = filtered.filter(order => order.items >= 7);
      }
    }
    
    // Sort the filtered results
    filtered.sort((a, b) => {
      let comparison = 0;
      if (a[sortField] < b[sortField]) {
        comparison = -1;
      } else if (a[sortField] > b[sortField]) {
        comparison = 1;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredOrders(filtered);
    setPage(0);
  }, [orders, searchQuery, tabValue, selectedStatus, dateFilter, 
      sortField, sortDirection, orderTypeFilter, customerTypeFilter,
      priceRange, sellerFilter, itemCountFilter]);
  
  // Handle search
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelectedStatus('All'); // Reset the status filter when changing tabs
  };
  
  // Handle status filter
  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };
  
  // Handle date filter
  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
  };
  
  // Handle order type filter
  const handleOrderTypeChange = (event) => {
    setOrderTypeFilter(event.target.value);
  };
  
  // Handle customer type filter
  const handleCustomerTypeChange = (event) => {
    setCustomerTypeFilter(event.target.value);
  };
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle sort
  const handleSort = (field) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };
  
  // Handle menu open
  const handleMenuOpen = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle order details open
  const handleOrderDetailsOpen = (order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };
  
  // Handle order details close
  const handleOrderDetailsClose = () => {
    setOrderDetailsOpen(false);
  };
  
  // Handle update order status
  const handleUpdateStatus = async (orderId, status) => {
    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = ensureToken();
      
      console.log(`Updating order ${orderId} status to ${status}`);
      
      const response = await fetch(`${API_URL}/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update order status: ${response.status}`);
      }
      
      // Refresh orders data
      await refreshOrdersData();
      
      setSnackbarMessage(`Order status updated to ${status}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating order status:', error);
      setSnackbarMessage(`Error updating order status: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Get chip color by status
  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
      case 'returned':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Get payment status color
  const getPaymentStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'paid':
        return 'success';
      case 'awaiting payment':
      case 'pending':
        return 'warning';
      case 'refunded':
        return 'error';
      case 'free':
        return 'info';
      default:
        return 'default';
    }
  };
  
  // Get order type icon
  const getOrderTypeIcon = (type) => {
    switch (type) {
      case 'Regular Vegetables':
        return <OrganicIcon />;
      case 'Expiring Soon':
        return <ExpiringSoonIcon />;
      case 'Surplus Food':
        return <DiscountIcon />;
      case 'Food Waste':
        return <CompostIcon />;
      default:
        return <InventoryIcon />;
    }
  };
  
  // Get customer type icon
  const getCustomerTypeIcon = (type) => {
    switch (type) {
      case 'hotel':
        return <StoreIcon />;
      case 'consumer':
        return <PersonIcon />;
      default:
        return <PersonIcon />;
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Add this function to generate and download a report
  const generateReport = () => {
    // Create CSV header
    let csvContent = "Order ID,Customer Name,Order Date,Status,Amount,Payment Status,Items,Seller\n";
    
    // Add data rows
    filteredOrders.forEach(order => {
      const row = [
        order.id,
        order.customer.name.replace(/,/g, ' '), // Remove commas to prevent CSV issues
        order.orderDate,
        order.status,
        order.amount,
        order.paymentStatus,
        order.items,
        order.sellerName.replace(/,/g, ' ') // Remove commas to prevent CSV issues
      ].join(',');
      
      csvContent += row + "\n";
    });
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a link element to download the CSV
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Set link properties
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-report-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    // Add link to document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4
      }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Order Monitoring
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage orders from hotels and consumers
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<ReceiptIcon />}
          sx={{ borderRadius: 2 }}
          onClick={generateReport}
        >
          Generate Report
        </Button>
      </Box>
      
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {orders.length}
              </Typography>
              <Box sx={{ 
                mt: 2, 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <ReceiptIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Last 30 days
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Hotel Orders
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {orders.filter(order => order.customer.type === 'hotel').length}
              </Typography>
              <Box sx={{ 
                mt: 2, 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <StoreIcon fontSize="small" sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  From verified hotels
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {formatCurrency(orders.reduce((total, order) => {
                  // Only include paid orders in revenue calculation
                  return order.paymentStatus === 'Paid' ? total + (Number(order.amount) || 0) : total;
                }, 0))}
              </Typography>
              <Box sx={{ 
                mt: 2, 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <PaidIcon fontSize="small" sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  From paid orders
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Sustainability Impact
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="success.dark">
                {orders.filter(order => ['Expiring Soon', 'Surplus Food', 'Food Waste'].includes(order.orderType)).length}
              </Typography>
              <Box sx={{ 
                mt: 2, 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <CompostIcon fontSize="small" sx={{ color: 'success.dark', mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Waste reduction orders
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tabs for order status */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: 3
            }
          }}
        >
          <Tab label={
            <Badge 
              badgeContent={orders.length} 
              color="primary"
              sx={{ '& .MuiBadge-badge': { right: -15, top: -2 } }}
            >
              <Box sx={{ px: 1 }}>All Orders</Box>
            </Badge>
          } />
          <Tab label={
            <Badge 
              badgeContent={orders.filter(order => order.status === 'Pending').length}
              color="warning"
              sx={{ '& .MuiBadge-badge': { right: -15, top: -2 } }}
            >
              <Box sx={{ px: 1 }}>Pending</Box>
            </Badge>
          } />
          <Tab label={
            <Badge 
              badgeContent={orders.filter(order => ['Processing', 'Shipped'].includes(order.status)).length}
              color="info"
              sx={{ '& .MuiBadge-badge': { right: -15, top: -2 } }}
            >
              <Box sx={{ px: 1 }}>In Progress</Box>
            </Badge>
          } />
          <Tab label={
            <Badge 
              badgeContent={orders.filter(order => order.status === 'Delivered').length}
              color="success"
              sx={{ '& .MuiBadge-badge': { right: -15, top: -2 } }}
            >
              <Box sx={{ px: 1 }}>Completed</Box>
            </Badge>
          } />
          <Tab label={
            <Badge 
              badgeContent={orders.filter(order => ['Cancelled', 'Returned'].includes(order.status)).length}
              color="error"
              sx={{ '& .MuiBadge-badge': { right: -15, top: -2 } }}
            >
              <Box sx={{ px: 1 }}>Cancelled/Returned</Box>
            </Badge>
          } />
        </Tabs>
      </Box>
      
      {/* Search and Filters */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search by order ID, customer, or seller..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  label="Status"
                >
                  <MenuItem value="All">All Statuses</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Processing">Processing</MenuItem>
                  <MenuItem value="Shipped">Shipped</MenuItem>
                  <MenuItem value="Delivered">Delivered</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                  <MenuItem value="Returned">Returned</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Order Type</InputLabel>
                <Select
                  value={orderTypeFilter}
                  onChange={handleOrderTypeChange}
                  label="Order Type"
                >
                  <MenuItem value="All">All Types</MenuItem>
                  <MenuItem value="Regular Vegetables">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <OrganicIcon fontSize="small" sx={{ mr: 1 }} />
                      Regular Vegetables
                    </Box>
                  </MenuItem>
                  <MenuItem value="Expiring Soon">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ExpiringSoonIcon fontSize="small" sx={{ mr: 1 }} />
                      Expiring Soon
                    </Box>
                  </MenuItem>
                  <MenuItem value="Surplus Food">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FoodBankIcon fontSize="small" sx={{ mr: 1 }} />
                      Surplus Food
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                  label="Date Range"
                >
                  <MenuItem value="All">All Time</MenuItem>
                  <MenuItem value="Today">Today</MenuItem>
                  <MenuItem value="This Week">This Week</MenuItem>
                  <MenuItem value="This Month">This Month</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                sx={{ borderRadius: 2, height: '100%' }}
                onClick={() => setMoreFiltersOpen(true)}
              >
                More Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Orders Table */}
      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'background.default' }}>
                  <TableRow>
                    <TableCell>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('id')}
                      >
                        Order ID
                        {sortField === 'id' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
                            <ArrowDownIcon fontSize="small" sx={{ ml: 0.5 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('orderDate')}
                      >
                        Date
                        {sortField === 'orderDate' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
                            <ArrowDownIcon fontSize="small" sx={{ ml: 0.5 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('amount')}
                      >
                        Amount
                        {sortField === 'amount' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
                            <ArrowDownIcon fontSize="small" sx={{ ml: 0.5 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">
                          No orders found matching your criteria
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((order) => (
                        <TableRow key={order.id} hover>
                          <TableCell>
                            <Typography variant="subtitle2" color="primary">
                              {order.id}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.items} item{order.items !== 1 ? 's' : ''}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ bgcolor: 'primary.main', width: 30, height: 30, mr: 1, fontSize: '0.8rem' }}>
                                {order.customer.avatar}
                              </Avatar>
                              <Box>
                                <Typography variant="body2">
                                  {order.customer.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {order.customer.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{order.orderDate}</TableCell>
                          <TableCell>
                            <Chip 
                              label={order.status} 
                              size="small"
                              color={getStatusColor(order.status)}
                            />
                          </TableCell>
                          <TableCell>{formatCurrency(order.amount)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={order.paymentStatus} 
                              size="small"
                              color={getPaymentStatusColor(order.paymentStatus)}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton 
                              size="small" 
                              onClick={() => handleOrderDetailsOpen(order)}
                              sx={{ mr: 1 }}
                            >
                              <PreviewIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small"
                              onClick={(e) => handleMenuOpen(e, order)}
                            >
                              <MoreIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              component="div"
              count={filteredOrders.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </>
        )}
      </Card>
      
      {/* Order Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 200, borderRadius: 2 }
        }}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          handleOrderDetailsOpen(selectedOrder);
        }}>
          <ListItemIcon>
            <PreviewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        
        <MenuItem 
          component={Link} 
          to={`/orders/${selectedOrder?.originalId || selectedOrder?.id}/verification`}
          onClick={handleMenuClose}
        >
          <ListItemIcon>
            <VerifiedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Verification</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={() => {
          handleMenuClose();
          handleUpdateStatus(selectedOrder?.originalId || selectedOrder?.id, 'processing');
        }}>
          <ListItemIcon>
            <ProcessingIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Processing</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          handleMenuClose();
          handleUpdateStatus(selectedOrder?.originalId || selectedOrder?.id, 'shipped');
        }}>
          <ListItemIcon>
            <ShippingIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Shipped</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          handleMenuClose();
          handleUpdateStatus(selectedOrder?.originalId || selectedOrder?.id, 'delivered');
        }}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Delivered</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          handleMenuClose();
          handleUpdateStatus(selectedOrder?.originalId || selectedOrder?.id, 'cancelled');
        }}>
          <ListItemIcon>
            <CancelIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Cancel Order</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Order Details Dialog */}
      <Dialog
        open={orderDetailsOpen && selectedOrder !== null}
        onClose={handleOrderDetailsClose}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Order {selectedOrder.id}
                </Typography>
                <Chip 
                  label={selectedOrder.status} 
                  size="small"
                  color={getStatusColor(selectedOrder.status)}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* Order Summary */}
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle1" gutterBottom>
                    Order Summary
                  </Typography>
                  
                  {/* Add order details rendering logic here */}
                </Grid>
                
                {/* Customer Information */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    Customer Information
                  </Typography>
                  <Card variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, mr: 2 }}>
                          {selectedOrder.customer.avatar}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {selectedOrder.customer.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedOrder.customer.email}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Shipping Address
                  </Typography>
                  <Card variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
                    <CardContent>
                      <Typography variant="body2">
                        {selectedOrder.shippingAddress}
                      </Typography>
                    </CardContent>
                  </Card>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Payment Information
                  </Typography>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Payment Method
                          </Typography>
                          <Typography variant="body1">
                            {/* Add payment method rendering logic here */}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Payment Status
                          </Typography>
                          <Chip 
                            label={selectedOrder.paymentStatus} 
                            size="small"
                            color={getPaymentStatusColor(selectedOrder.paymentStatus)}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleOrderDetailsClose}>Close</Button>
              <Button 
                variant="outlined" 
                startIcon={<ReceiptIcon />}
                sx={{ mr: 1 }}
              >
                Print Invoice
              </Button>
              <Button 
                variant="contained" 
                onClick={async () => {
                  // Determine next logical status based on current status
                  let nextStatus;
                  switch (selectedOrder.status.toLowerCase()) {
                    case 'pending':
                      nextStatus = 'processing';
                      break;
                    case 'processing':
                      nextStatus = 'shipped';
                      break;
                    case 'shipped':
                      nextStatus = 'delivered';
                      break;
                    default:
                      nextStatus = 'processing';
                  }
                  
                  await handleUpdateStatus(selectedOrder.originalId, nextStatus);
                  handleOrderDetailsClose();
                }}
                disabled={['Delivered', 'Cancelled', 'Returned'].includes(selectedOrder.status)}
              >
                {selectedOrder.status === 'Pending' ? 'Mark Processing' : 
                 selectedOrder.status === 'Processing' ? 'Mark Shipped' : 
                 selectedOrder.status === 'Shipped' ? 'Mark Delivered' : 'Update Status'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      {/* More Filters Dialog */}
      <Dialog
        open={moreFiltersOpen}
        onClose={() => setMoreFiltersOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Advanced Filters</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Price Range
              </Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={priceRange}
                  onChange={(e, newValue) => setPriceRange(newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={10000}
                  step={100}
                  marks={[
                    { value: 0, label: '₹0' },
                    { value: 5001, label: '₹5001' },
                    { value: 10000, label: '₹10000' }
                  ]}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Seller</InputLabel>
                <Select
                  value={sellerFilter}
                  onChange={(e) => setSellerFilter(e.target.value)}
                  label="Seller"
                >
                  <MenuItem value="All">All Sellers</MenuItem>
                  {[...new Set(orders.map(order => order.sellerName))].map(seller => (
                    <MenuItem key={seller} value={seller}>
                      {seller}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Item Count</InputLabel>
                <Select
                  value={itemCountFilter}
                  onChange={(e) => setItemCountFilter(e.target.value)}
                  label="Item Count"
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="1-3">1-3 items</MenuItem>
                  <MenuItem value="4-6">4-6 items</MenuItem>
                  <MenuItem value="7+">7+ items</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            // Reset the advanced filters
            setPriceRange([0, 10000]);
            setSellerFilter('All');
            setItemCountFilter('All');
            setMoreFiltersOpen(false);
          }}>
            Reset
          </Button>
          <Button 
            variant="contained" 
            onClick={() => setMoreFiltersOpen(false)}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderMonitoring; 