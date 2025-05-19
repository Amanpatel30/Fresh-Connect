import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  Payment as PaymentIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import * as paymentService from '../../services/paymentService';
import { format } from 'date-fns';

// Add a formatter function at the top of the component
const formatCurrency = (amount) => {
  // Format the amount to 2 decimal places and handle floating point precision issues
  return Number(parseFloat(amount || 0).toFixed(2));
};

// Mock data generator function for testing when database is not available
const generateMockData = () => {
  return {
    summary: {
      totalEarnings: formatCurrency(788.52),
      pendingPayouts: formatCurrency(446.02),
      lastPayout: formatCurrency(59.73),
      transactionFees: formatCurrency(15.77)
    },
    transactions: [
      {
        id: '1',
        date: new Date('2024-02-28'),
        orderId: 'ORD001',
        amount: 150.50,
        status: 'completed',
        type: 'sale',
        customer: 'John Doe',
      },
      {
        id: '2',
        date: new Date('2024-02-27'),
        orderId: 'ORD002',
        amount: 280.00,
        status: 'pending',
        type: 'payout',
        customer: 'System',
      },
      {
        id: '3',
        date: new Date('2024-02-25'),
        orderId: 'ORD003',
        amount: 220.00,
        status: 'completed',
        type: 'sale',
        customer: 'Jane Smith',
      },
      {
        id: '4',
        date: new Date('2024-02-23'),
        orderId: 'ORD004',
        amount: 180.00,
        status: 'completed',
        type: 'sale',
        customer: 'Robert Johnson',
      },
      {
        id: '5',
        date: new Date('2024-02-20'),
        orderId: 'ORD005',
        amount: 350.00,
        status: 'pending',
        type: 'payout',
        customer: 'System',
      }
    ]
  };
};

const Payments = () => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentSummary, setPaymentSummary] = useState({
    totalEarnings: 0,
    pendingPayouts: 0,
    lastPayout: 0,
    transactionFees: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0
  });

  // Filter handlers
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    status: 'all',
    type: 'all',
    page: 1,
    limit: 10
  });

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    console.log(`Changing filter ${field} to:`, value);
    setFilters(prev => ({
      ...prev,
      [field]: value,
      // Reset page when changing filters
      ...(field !== 'page' ? { page: 1 } : {})
    }));
  };

  // Apply filters
  const applyFilters = async () => {
    console.log("APPLYING FILTERS:", JSON.stringify(filters));
    try {
      await fetchTransactionHistory(true);
      console.log("Filters applied successfully");
    } catch (err) {
      console.error("Error applying filters:", err);
      setError("Failed to apply filters. Please try again.");
    }
  };

  // Reset filters
  const resetFilters = () => {
    console.log("Resetting all filters");
    const resetFilterValues = {
      startDate: null,
      endDate: null,
      status: 'all',
      type: 'all',
      page: 1,
      limit: 10
    };
    
    // Update the state
    setFilters(resetFilterValues);
    
    // Apply reset filters directly
    setTimeout(() => {
      console.log("🔥 Applying reset filters directly");
      applyFiltersWithValues(resetFilterValues);
    }, 0);
  };

  // Fetch payment data when component mounts
  useEffect(() => {
    // Initial data fetch
    fetchPaymentsData();
  }, []);

  const fetchPaymentsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching payment data...");
      
      // Fetch payment summary
      const summaryData = await paymentService.getPaymentSummary();
      console.log("Payment summary data:", summaryData);
      
      // Fetch transaction history with larger limit to get all transactions for calculations
      const allTransactionsData = await paymentService.getTransactionHistory({
        page: 1,
        limit: 100, // Get more transactions to calculate proper totals
        status: 'all',
        type: 'all'
      });
      console.log("All transactions for calculations:", allTransactionsData);
      
      // Fetch filtered transaction history for display
      const transactionData = await fetchTransactionHistory(false);
      console.log("Transaction data for display:", transactionData);
      
      // Calculate totals from transaction data
      let totalEarnings = 0;
      let pendingPayouts = 0;
      let lastPayout = 0;
      let transactionFees = 0;
      
      // Use all transactions to calculate summary values
      const allTransactions = allTransactionsData?.transactions || [];
      
      if (allTransactions.length > 0) {
        // Calculate total earnings (sum of completed transactions)
        totalEarnings = allTransactions
          .filter(tx => tx.status === 'completed' && tx.type === 'sale')
          .reduce((sum, tx) => sum + (tx.amount || 0), 0);
        
        // Calculate pending payouts (sum of pending transactions)
        pendingPayouts = allTransactions
          .filter(tx => tx.status === 'pending')
          .reduce((sum, tx) => sum + (tx.amount || 0), 0);
        
        // Find last payout transaction (most recent payout)
        const payoutTransactions = allTransactions
          .filter(tx => tx.type === 'payout' && tx.status === 'completed')
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (payoutTransactions.length > 0) {
          lastPayout = payoutTransactions[0].amount || 0;
        }
        
        // Sum transaction fees (if available in the data)
        transactionFees = allTransactions
          .filter(tx => tx.status === 'completed')
          .reduce((sum, tx) => sum + (tx.fee || 0), 0);
        
        // If no fee field is available, estimate fees as 2% of completed sales
        if (transactionFees === 0) {
          transactionFees = Math.round(totalEarnings * 0.02);
        }
      }
      
      // Update state with calculated data
      setPaymentSummary({
        totalEarnings: formatCurrency(totalEarnings || summaryData?.totalEarnings || 0),
        pendingPayouts: formatCurrency(pendingPayouts || summaryData?.pendingPayments || 0),
        lastPayout: formatCurrency(lastPayout || summaryData?.lastPayoutAmount || 0),
        transactionFees: formatCurrency(transactionFees || summaryData?.monthlySummary?.fees || 0)
      });
      
      // Set transactions for display
      setTransactions(transactionData?.transactions || []);
      
    } catch (err) {
      console.error("Error fetching payment data:", err);
      setError("We're showing sample payment data as we couldn't connect to the payment server. The backend API endpoints may not be available yet.");
      
      // If there's an error, use mock data
      const mockData = generateMockData();
      setPaymentSummary(mockData.summary);
      setTransactions(mockData.transactions);
    } finally {
      setLoading(false);
    }
  };

  // Fetch transaction history with filters
  const fetchTransactionHistory = async (setLoadingState = true) => {
    if (setLoadingState) {
      setLoading(true);
    }
    
    try {
      console.log("⭐ Fetching transactions with filters:", JSON.stringify(filters));
      // Wait a small amount of time to ensure state is fully updated
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const transactionData = await paymentService.getTransactionHistory({...filters});
      console.log("⭐ Transaction data fetched:", transactionData);
      
      if (setLoadingState) {
        // Only use the transactions from the API response, don't mix with mock data
        setTransactions(transactionData?.transactions || []);
        // Update pagination info
        setPagination({
          page: transactionData?.page || 1,
          totalPages: transactionData?.pages || 1,
          totalCount: transactionData?.totalCount || 0
        });
      }
      
      return transactionData;
    } catch (err) {
      console.error("⚠️ Error fetching transaction history:", err);
      if (setLoadingState) {
        setError("Failed to load transaction history. Using sample data instead.");
        // In case of error, use mock data
        setTransactions(generateMockData().transactions);
        setPagination({
          page: 1,
          totalPages: 1,
          totalCount: generateMockData().transactions.length
        });
      }
      return { transactions: [] };
    } finally {
      if (setLoadingState) {
        setLoading(false);
      }
    }
  };

  // Add a function to handle page changes
  const handlePageChange = (newPage) => {
    console.log("Changing page to:", newPage);
    handleFilterChange('page', newPage);
    // Apply filter immediately with direct value
    setTimeout(() => {
      const updatedFilters = {...filters, page: newPage};
      console.log("🔥 Applying page change directly:", updatedFilters);
      applyFiltersWithValues(updatedFilters);
    }, 0);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  // Add a new function to apply filters with explicit values
  const applyFiltersWithValues = async (filterValues) => {
    console.log("🔥 APPLYING FILTERS WITH VALUES:", JSON.stringify(filterValues));
    try {
      // Use the passed filter values directly instead of the state
      await fetchTransactionHistoryWithValues(filterValues, true);
      console.log("Filters applied successfully");
    } catch (err) {
      console.error("Error applying filters:", err);
      setError("Failed to apply filters. Please try again.");
    }
  };

  // Add a version of fetchTransactionHistory that takes explicit filter values
  const fetchTransactionHistoryWithValues = async (filterValues, setLoadingState = true) => {
    if (setLoadingState) {
      setLoading(true);
    }
    
    try {
      console.log("🔥 Fetching transactions with explicit filters:", JSON.stringify(filterValues));
      
      const transactionData = await paymentService.getTransactionHistory(filterValues);
      console.log("🔥 Transaction data fetched with explicit filters:", transactionData);
      
      if (setLoadingState) {
        // Only use the transactions from the API response, don't mix with mock data
        setTransactions(transactionData?.transactions || []);
        // Update pagination info
        setPagination({
          page: transactionData?.page || 1,
          totalPages: transactionData?.pages || 1,
          totalCount: transactionData?.totalCount || 0
        });
      }
      
      return transactionData;
    } catch (err) {
      console.error("⚠️ Error fetching transaction history:", err);
      if (setLoadingState) {
        setError("Failed to load transaction history. Using sample data instead.");
        // In case of error, use mock data
        setTransactions(generateMockData().transactions);
        setPagination({
          page: 1,
          totalPages: 1,
          totalCount: generateMockData().transactions.length
        });
      }
      return { transactions: [] };
    } finally {
      if (setLoadingState) {
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Payments & Earnings</Typography>
        <Button 
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchPaymentsData}
          disabled={loading}
        >
          Refresh Data
        </Button>
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="primary" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Total Earnings
                </Typography>
              </Box>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h4">₹{paymentSummary.totalEarnings}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentIcon color="warning" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Pending Payouts
                </Typography>
              </Box>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h4">₹{paymentSummary.pendingPayouts}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance color="success" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Last Payout
                </Typography>
              </Box>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h4">₹{paymentSummary.lastPayout}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentIcon color="error" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Transaction Fees
                </Typography>
              </Box>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h4">₹{paymentSummary.transactionFees}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transaction History Section */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>Transaction History</Typography>
        
        {/* Filter controls */}
        <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(date) => {
                  handleFilterChange('startDate', date);
                  // Apply filter with direct value
                  setTimeout(() => {
                    const updatedFilters = {...filters, startDate: date, page: 1};
                    console.log("🔥 Applying date filter directly:", updatedFilters);
                    applyFiltersWithValues(updatedFilters);
                  }, 10);
                }}
                slotProps={{ 
                  textField: { 
                    fullWidth: true, 
                    size: 'small',
                    InputProps: {
                      endAdornment: filters.startDate ? (
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            handleFilterChange('startDate', null);
                            // Apply filter after clearing
                            setTimeout(() => {
                              const updatedFilters = {...filters, startDate: null, page: 1};
                              console.log("🔥 Clearing start date filter directly:", updatedFilters);
                              applyFiltersWithValues(updatedFilters);
                            }, 10);
                          }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      ) : null
                    }
                  } 
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(date) => {
                  handleFilterChange('endDate', date);
                  // Apply filter with direct value
                  setTimeout(() => {
                    const updatedFilters = {...filters, endDate: date, page: 1};
                    console.log("🔥 Applying date filter directly:", updatedFilters);
                    applyFiltersWithValues(updatedFilters);
                  }, 10);
                }}
                slotProps={{ 
                  textField: { 
                    fullWidth: true, 
                    size: 'small',
                    InputProps: {
                      endAdornment: filters.endDate ? (
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            handleFilterChange('endDate', null);
                            // Apply filter after clearing
                            setTimeout(() => {
                              const updatedFilters = {...filters, endDate: null, page: 1};
                              console.log("🔥 Clearing end date filter directly:", updatedFilters);
                              applyFiltersWithValues(updatedFilters);
                            }, 10);
                          }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      ) : null
                    }
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => {
                  const newStatus = e.target.value;
                  handleFilterChange('status', newStatus);
                  // Apply filter with the new value directly - don't rely on state update
                  setTimeout(() => {
                    const updatedFilters = {...filters, status: newStatus, page: 1};
                    console.log("🔥 Applying status filter directly:", updatedFilters);
                    applyFiltersWithValues(updatedFilters);
                  }, 0);
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={(e) => {
                  const newType = e.target.value;
                  handleFilterChange('type', newType);
                  // Apply filter with the new value directly - don't rely on state update
                  setTimeout(() => {
                    const updatedFilters = {...filters, type: newType, page: 1};
                    console.log("🔥 Applying type filter directly:", updatedFilters);
                    applyFiltersWithValues(updatedFilters);
                  }, 0);
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="sale">Sale</MenuItem>
                <MenuItem value="payout">Payout</MenuItem>
                <MenuItem value="refund">Refund</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2} sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => {
                console.log("Filter button clicked");
                // Use current filter state directly
                applyFiltersWithValues({...filters});
              }}
              disabled={loading}
              startIcon={<FilterListIcon />}
            >
              Filter
            </Button>
            <Button 
              variant="outlined" 
              onClick={resetFilters}
              disabled={loading}
            >
              Reset
            </Button>
          </Grid>
        </Grid>

        <TableContainer>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : transactions.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="textSecondary">No transactions found</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {transaction.date instanceof Date 
                        ? format(transaction.date, 'MMM dd, yyyy')
                        : typeof transaction.date === 'string'
                          ? format(new Date(transaction.date), 'MMM dd, yyyy')
                          : 'Invalid Date'}
                    </TableCell>
                    <TableCell>
                      {transaction.orderId && transaction.orderId !== 'N/A' 
                        ? transaction.orderId 
                        : transaction.type === 'payout' 
                          ? `PAY-${transaction.id?.substring(0, 6) || Math.floor(Math.random()*100000)}` 
                          : transaction.type === 'sale'
                            ? `ORD-${transaction.id?.substring(0, 6) || Math.floor(Math.random()*100000)}`
                            : `TX-${transaction.id?.substring(0, 6) || Math.floor(Math.random()*100000)}`
                      }
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} 
                        color={transaction.type === 'sale' ? 'primary' : 
                              transaction.type === 'payout' ? 'secondary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{transaction.customer}</TableCell>
                    <TableCell>₹{transaction.amount}</TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)} 
                        color={transaction.status === 'completed' ? 'success' : 
                              transaction.status === 'pending' ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* Pagination controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, alignItems: 'center' }}>
          <Typography variant="body2">
            Showing {transactions.length} of {pagination.totalCount} transactions
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              size="small"
              disabled={pagination.page <= 1 || loading}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              Page {pagination.page} of {pagination.totalPages}
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Payments; 