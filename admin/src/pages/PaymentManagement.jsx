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
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Avatar,
  List,
  ListItem
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Visibility as VisibilityIcon,
  Receipt as ReceiptIcon,
  LocalOffer as DiscountIcon,
  Restaurant as RestaurantIcon,
  Spa as VegetableIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  MoreVert as MoreIcon,
  AttachMoney as MoneyIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';

// API base URL
const API_URL = 'http://localhost:3000/payments';

// Function to test API connection
const testPaymentsAPI = async () => {
  try {
    // Get all payments
    const response = await fetch(`${API_URL}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    console.log('Payments API test successful');
    return { success: true, data };
  } catch (error) {
    console.error('Payments API test error:', error);
    return { success: false, error: error.message };
  }
};

// Replace the SAMPLE_PAYMENTS with a FALLBACK_PAYMENTS constant
const FALLBACK_PAYMENTS = [
  // Keep your existing sample payments data here
];

const PaymentManagement = () => {
  const location = useLocation();
  // State
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiWorking, setApiWorking] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    transactionType: '',
    minAmount: '',
    maxAmount: '',
    dateRange: ''
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  // Check if we're on the Payments page
  const isPaymentsPage = location.pathname.includes('/payments') || location.pathname.includes('/payment');
  
  // Only log API URL when on Payments page
  useEffect(() => {
    if (isPaymentsPage) {
      console.log('Using Payments API URL:', API_URL);
    }
  }, [isPaymentsPage]);

  // Test API connection
  useEffect(() => {
    const testAPI = async () => {
      if (!isPaymentsPage) {
        return; // Skip API calls if not on Payments page
      }
      
      console.log('Testing Payments API connection...');
      const result = await testPaymentsAPI();
      setApiWorking(result.success);
    };
    
    testAPI();
  }, [isPaymentsPage]);
  
  // Load payments data
  useEffect(() => {
    const fetchPayments = async () => {
      if (!isPaymentsPage) {
        return; // Skip API calls if not on Payments page
      }
      
      setLoading(true);
      
      try {
        // Fetch payments from API
        const response = await fetch(API_URL);
        let paymentsData;
        
        if (response.ok) {
          paymentsData = await response.json();
          console.log('Payments data fetched successfully:', paymentsData);
        } else {
          console.error('Error fetching payments:', response.status);
          paymentsData = FALLBACK_PAYMENTS;
        }
        
        // Format the data as needed
        const formattedPayments = paymentsData.map(payment => {
          return {
            id: payment._id || payment.id,
            transactionId: payment.transactionId || `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            date: payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : payment.date,
            time: payment.createdAt ? new Date(payment.createdAt).toLocaleTimeString() : payment.time,
            amount: payment.amount || 0,
            status: payment.status || 'Pending',
            paymentMethod: payment.paymentMethod || 'Card',
            transactionType: payment.transactionType || 'Payment',
            customer: {
              name: payment.customerName || (payment.customer ? payment.customer.name : 'Unknown'),
              email: payment.customerEmail || (payment.customer ? payment.customer.email : ''),
              type: payment.customerType || (payment.customer ? payment.customer.type : 'Customer')
            },
            order: {
              id: payment.orderId || (payment.order ? payment.order.id : ''),
              items: payment.items || (payment.order ? payment.order.items || [] : [])
            },
            seller: {
              name: payment.sellerName || (payment.seller ? payment.seller.name : 'Unknown'),
              type: payment.sellerType || (payment.seller ? payment.seller.type : 'Vegetable Seller')
            }
          };
        });
        
        setPayments(formattedPayments);
        setFilteredPayments(formattedPayments);
      } catch (error) {
        console.error('Error fetching payments data:', error);
        setPayments(FALLBACK_PAYMENTS);
        setFilteredPayments(FALLBACK_PAYMENTS);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayments();
  }, [isPaymentsPage]);
  
  // Refresh data function
  const refreshData = async () => {
    if (!isPaymentsPage) {
      return; // Skip API calls if not on Payments page
    }
    
    setLoading(true);
    
    try {
      // Fetch payments from API
      const response = await fetch(API_URL);
      let paymentsData;
      
      if (response.ok) {
        paymentsData = await response.json();
        console.log('Payments data refreshed successfully:', paymentsData);
      } else {
        console.error('Error refreshing payments:', response.status);
        paymentsData = FALLBACK_PAYMENTS;
      }
      
      // Format the data as needed
      const formattedPayments = paymentsData.map(payment => {
        return {
          id: payment._id || payment.id,
          transactionId: payment.transactionId || `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          date: payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : payment.date,
          time: payment.createdAt ? new Date(payment.createdAt).toLocaleTimeString() : payment.time,
          amount: payment.amount || 0,
          status: payment.status || 'Pending',
          paymentMethod: payment.paymentMethod || 'Card',
          transactionType: payment.transactionType || 'Payment',
          customer: {
            name: payment.customerName || (payment.customer ? payment.customer.name : 'Unknown'),
            email: payment.customerEmail || (payment.customer ? payment.customer.email : ''),
            type: payment.customerType || (payment.customer ? payment.customer.type : 'Customer')
          },
          order: {
            id: payment.orderId || (payment.order ? payment.order.id : ''),
            items: payment.items || (payment.order ? payment.order.items || [] : [])
          },
          seller: {
            name: payment.sellerName || (payment.seller ? payment.seller.name : 'Unknown'),
            type: payment.sellerType || (payment.seller ? payment.seller.type : 'Vegetable Seller')
          }
        };
      });
      
      setPayments(formattedPayments);
      setFilteredPayments(formattedPayments);
    } catch (error) {
      console.error('Error refreshing payments data:', error);
      setPayments(FALLBACK_PAYMENTS);
      setFilteredPayments(FALLBACK_PAYMENTS);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
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
  
  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle search
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };
  
  // Handle filter dialog
  const handleFilterDialogOpen = () => {
    setFilterDialogOpen(true);
  };
  
  const handleFilterDialogClose = () => {
    setFilterDialogOpen(false);
  };
  
  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value
    });
  };
  
  const handleClearFilters = () => {
    setFilters({
      status: '',
      paymentMethod: '',
      transactionType: '',
      minAmount: '',
      maxAmount: '',
      dateRange: ''
    });
    setSearchQuery('');
    setPage(0);
  };
  
  // Handle payment details
  const handleViewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setDetailsDialogOpen(true);
  };
  
  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
  };
  
  // Helper to get status chip color
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Processing':
        return 'warning';
      case 'Refunded':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Helper to get transaction type icon
  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case 'Regular Purchase':
        return <CartIcon fontSize="small" />;
      case 'Urgent Sale':
        return <DiscountIcon fontSize="small" />;
      case 'Food Waste Reduction':
        return <RestaurantIcon fontSize="small" />;
      case 'Bulk Purchase':
        return <VegetableIcon fontSize="small" />;
      default:
        return <ReceiptIcon fontSize="small" />;
    }
  };
  
  // Helper to get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'Credit Card':
        return <MoneyIcon fontSize="small" />;
      case 'Bank Transfer':
        return <BankIcon fontSize="small" />;
      case 'Wallet':
        return <PersonIcon fontSize="small" />;
      default:
        return <ReceiptIcon fontSize="small" />;
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };
  
  // Apply filters when they change
  useEffect(() => {
    if (!payments.length) return;
    
    let filtered = [...payments];
    
    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(payment => 
        payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(payment => payment.status.toLowerCase() === filters.status.toLowerCase());
    }
    
    if (filters.paymentMethod) {
      filtered = filtered.filter(payment => payment.paymentMethod === filters.paymentMethod);
    }
    
    if (filters.transactionType) {
      filtered = filtered.filter(payment => payment.transactionType === filters.transactionType);
    }
    
    if (filters.minAmount) {
      filtered = filtered.filter(payment => payment.amount >= Number(filters.minAmount));
    }
    
    if (filters.maxAmount) {
      filtered = filtered.filter(payment => payment.amount <= Number(filters.maxAmount));
    }
    
    if (filters.dateRange) {
      const now = new Date();
      let startDate;
      
      if (filters.dateRange === 'last7days') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (filters.dateRange === 'last30days') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (filters.dateRange === 'custom' && filters.customStartDate && filters.customEndDate) {
        startDate = new Date(filters.customStartDate);
        const endDate = new Date(filters.customEndDate);
        filtered = filtered.filter(payment => {
          const paymentDate = new Date(payment.date);
          return paymentDate >= startDate && paymentDate <= endDate;
        });
      }
      
      if (startDate && filters.dateRange !== 'custom') {
        filtered = filtered.filter(payment => {
          const paymentDate = new Date(payment.date);
          return paymentDate >= startDate;
        });
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      if (sortField === 'date') {
        valueA = new Date(a.date).getTime();
        valueB = new Date(b.date).getTime();
      } else if (sortField === 'amount') {
        valueA = a.amount;
        valueB = b.amount;
      } else {
        valueA = a[sortField] || '';
        valueB = b[sortField] || '';
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredPayments(filtered);
  }, [payments, filters, searchQuery, sortField, sortDirection]);
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Payment Management
        </Typography>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Transactions
              </Typography>
              <Typography variant="h4">
                {payments.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last 30 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4">
                {formatCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0))}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last 30 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Platform Commission
              </Typography>
              <Typography variant="h4">
                {formatCurrency(payments.reduce((sum, payment) => sum + payment.commission, 0))}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last 30 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Food Waste Reduced
              </Typography>
              <Typography variant="h4">
                {payments.filter(payment => payment.transactionType === 'Food Waste Reduction').length}
              </Typography>
              <Typography variant="body2" color="success.main">
                Transactions preventing waste
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Filter and Search */}
      <Card sx={{ mb: 3, p: 2 }}>
        <CardContent sx={{ p: 1 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
            <TextField
              placeholder="Search transactions..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <Button 
              variant="outlined" 
              startIcon={<FilterIcon />}
              onClick={handleFilterDialogOpen}
            >
              Filters
            </Button>
            
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={refreshData}
            >
              Refresh
            </Button>
            
            {Object.values(filters).some(f => f !== '') && (
              <Button 
                variant="text"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
      
      {/* Tabs and Transactions Table */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="All Transactions" />
          <Tab label="Hotel Purchases" />
          <Tab label="End User Purchases" />
          <Tab label="Urgent & Waste Reduction" />
          <Tab label="Refunds" />
        </Tabs>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  onClick={() => handleSort('id')}
                  sx={{ cursor: 'pointer' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Transaction ID
                    {sortField === 'id' && (
                      sortDirection === 'asc' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('date')}
                  sx={{ cursor: 'pointer' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Date
                    {sortField === 'date' && (
                      sortDirection === 'asc' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>Buyer</TableCell>
                <TableCell>Seller</TableCell>
                <TableCell>Type</TableCell>
                <TableCell 
                  onClick={() => handleSort('amount')}
                  sx={{ cursor: 'pointer' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Amount
                    {sortField === 'amount' && (
                      sortDirection === 'asc' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((payment) => (
                    <TableRow key={payment.id} hover>
                      <TableCell>{payment.id}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              width: 24, 
                              height: 24, 
                              mr: 1,
                              bgcolor: payment.customer.type === 'Hotel' ? 'primary.main' : 'secondary.main'
                            }}
                          >
                            {payment.customer.type === 'Hotel' ? 
                              <RestaurantIcon fontSize="small" /> : 
                              <PersonIcon fontSize="small" />
                            }
                          </Avatar>
                          <Typography variant="body2">{payment.customer.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              width: 24, 
                              height: 24, 
                              mr: 1,
                              bgcolor: payment.seller.type.includes('Verified') ? 'success.main' : 'info.main'
                            }}
                          >
                            {payment.seller.type.includes('Seller') ? 
                              <VegetableIcon fontSize="small" /> : 
                              <RestaurantIcon fontSize="small" />
                            }
                          </Avatar>
                          <Typography variant="body2">{payment.seller.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getTransactionTypeIcon(payment.transactionType)}
                          label={payment.transactionType}
                          size="small"
                          sx={{ 
                            bgcolor: payment.transactionType.includes('Waste') || payment.transactionType.includes('Urgent') 
                              ? 'success.light' 
                              : 'default'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status}
                          color={getStatusChipColor(payment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small"
                          onClick={() => handleViewPaymentDetails(payment)}
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPayments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={handleFilterDialogClose}>
        <DialogTitle>Filter Transactions</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Processing">Processing</MenuItem>
                  <MenuItem value="Refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  name="paymentMethod"
                  value={filters.paymentMethod}
                  onChange={handleFilterChange}
                  label="Payment Method"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Credit Card">Credit Card</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="Wallet">Wallet</MenuItem>
                  <MenuItem value="Free">Free</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  name="transactionType"
                  value={filters.transactionType}
                  onChange={handleFilterChange}
                  label="Transaction Type"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Regular Purchase">Regular Purchase</MenuItem>
                  <MenuItem value="Urgent Sale">Urgent Sale</MenuItem>
                  <MenuItem value="Food Waste Reduction">Food Waste Reduction</MenuItem>
                  <MenuItem value="Bulk Purchase">Bulk Purchase</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Amount Range</InputLabel>
                <Select
                  name="minAmount"
                  value={filters.minAmount}
                  onChange={handleFilterChange}
                  label="Min Amount"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="0">0</MenuItem>
                  <MenuItem value="1000">1000</MenuItem>
                  <MenuItem value="5001">5001</MenuItem>
                  <MenuItem value="10000">10000</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Max Amount</InputLabel>
                <Select
                  name="maxAmount"
                  value={filters.maxAmount}
                  onChange={handleFilterChange}
                  label="Max Amount"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="1000">1000</MenuItem>
                  <MenuItem value="5001">5001</MenuItem>
                  <MenuItem value="10000">10000</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  name="dateRange"
                  value={filters.dateRange}
                  onChange={handleFilterChange}
                  label="Date Range"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="last30days">Last 30 days</MenuItem>
                  <MenuItem value="last7days">Last 7 days</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {filters.dateRange === 'custom' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Start Date</InputLabel>
                  <TextField
                    name="customStartDate"
                    type="date"
                    value={filters.customStartDate}
                    onChange={handleFilterChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </FormControl>
              </Grid>
            )}
            
            {filters.dateRange === 'custom' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>End Date</InputLabel>
                  <TextField
                    name="customEndDate"
                    type="date"
                    value={filters.customEndDate}
                    onChange={handleFilterChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearFilters}>Clear All</Button>
          <Button onClick={handleFilterDialogClose}>Cancel</Button>
          <Button onClick={handleFilterDialogClose} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>
      
      {/* Payment Details Dialog */}
      {selectedPayment && (
        <Dialog
          open={detailsDialogOpen}
          onClose={handleCloseDetailsDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Transaction Details - {selectedPayment.id}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Transaction Information
                </Typography>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <List>
                    <ListItem>
                      <Typography variant="subtitle2" sx={{ width: 150 }}>Date:</Typography>
                      <Typography variant="body2">{selectedPayment.date}</Typography>
                    </ListItem>
                    <ListItem>
                      <Typography variant="subtitle2" sx={{ width: 150 }}>Amount:</Typography>
                      <Typography variant="body2">{formatCurrency(selectedPayment.amount)}</Typography>
                    </ListItem>
                    <ListItem>
                      <Typography variant="subtitle2" sx={{ width: 150 }}>Status:</Typography>
                      <Chip
                        label={selectedPayment.status}
                        color={getStatusChipColor(selectedPayment.status)}
                        size="small"
                      />
                    </ListItem>
                    <ListItem>
                      <Typography variant="subtitle2" sx={{ width: 150 }}>Type:</Typography>
                      <Chip
                        icon={getTransactionTypeIcon(selectedPayment.transactionType)}
                        label={selectedPayment.transactionType}
                        size="small"
                      />
                    </ListItem>
                    <ListItem>
                      <Typography variant="subtitle2" sx={{ width: 150 }}>Payment Method:</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getPaymentMethodIcon(selectedPayment.paymentMethod)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {selectedPayment.paymentMethod}
                        </Typography>
                      </Box>
                    </ListItem>
                    <ListItem>
                      <Typography variant="subtitle2" sx={{ width: 150 }}>Commission:</Typography>
                      <Typography variant="body2">{formatCurrency(selectedPayment.commission)}</Typography>
                    </ListItem>
                    {selectedPayment.notes && (
                      <ListItem>
                        <Typography variant="subtitle2" sx={{ width: 150 }}>Notes:</Typography>
                        <Typography variant="body2">{selectedPayment.notes}</Typography>
                      </ListItem>
                    )}
                  </List>
                </Card>
                
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Buyer Information
                </Typography>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: selectedPayment.customer.type === 'Hotel' ? 'primary.main' : 'secondary.main',
                          mr: 2
                        }}
                      >
                        {selectedPayment.customer.type === 'Hotel' ? 
                          <RestaurantIcon /> : 
                          <PersonIcon />
                        }
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{selectedPayment.customer.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {selectedPayment.customer.type}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2">
                      ID: {selectedPayment.customer.id}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Seller Information
                </Typography>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: selectedPayment.seller.type.includes('Verified') ? 'success.main' : 'info.main',
                          mr: 2
                        }}
                      >
                        {selectedPayment.seller.type.includes('Seller') ? 
                          <VegetableIcon /> : 
                          <RestaurantIcon />
                        }
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{selectedPayment.seller.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {selectedPayment.seller.type}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2">
                      ID: {selectedPayment.seller.id}
                    </Typography>
                  </CardContent>
                </Card>
                
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Items Purchased
                </Typography>
                <Card variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell align="right">Price (₹)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPayment.order.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell align="right">{item.price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={2} align="right" sx={{ fontWeight: 'bold' }}>
                          Total:
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {selectedPayment.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      {selectedPayment.commission > 0 && (
                        <TableRow>
                          <TableCell colSpan={2} align="right">
                            Platform Fee:
                          </TableCell>
                          <TableCell align="right">
                            {selectedPayment.commission.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetailsDialog}>Close</Button>
            <Button 
              variant="outlined" 
              color="primary"
              startIcon={<ReceiptIcon />}
            >
              Print Receipt
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default PaymentManagement;
