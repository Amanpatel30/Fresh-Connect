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
  TablePagination,
  Chip,
  TextField,
  MenuItem,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  FilterList as FilterIcon, 
  Search as SearchIcon,
  Info as InfoIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { 
  getPaymentTransactions, 
  getPaymentTransaction,
  getPaymentSummary,
  getMockPaymentTransactions,
  getMockPaymentSummary
} from '../../services/paymentTransactionService';

const PaymentsHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    startDate: null,
    endDate: null
  });
  const [showFilters, setShowFilters] = useState(false);
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    pendingPayments: 0
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, [page, rowsPerPage, filters, sortField, sortDirection]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        sort: sortField,
        order: sortDirection,
        ...filters
      };
      
      const response = await getPaymentTransactions(params);
      setTransactions(response.data || []);
      setTotalCount(response.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching payment transactions:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load payment transactions',
        severity: 'error'
      });
      setTransactions([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await getPaymentSummary();
      setSummary(response.data || { totalEarnings: 0, pendingPayments: 0 });
    } catch (error) {
      console.error('Error fetching payment summary:', error);
      // Set default values if API fails
      setSummary({ totalEarnings: 0, pendingPayments: 0 });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0);
  };

  const handleDateChange = (name, date) => {
    setFilters(prev => ({
      ...prev,
      [name]: date
    }));
    setPage(0);
  };

  const handleResetFilters = () => {
    setFilters({
      status: '',
      type: '',
      startDate: null,
      endDate: null
    });
    setPage(0);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewDetails = async (id) => {
    try {
      setDetailsLoading(true);
      const response = await getPaymentTransaction(id);
      setSelectedTransaction(response.data);
      setDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load transaction details',
        severity: 'error'
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedTransaction(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  const getTypeLabel = (type) => {
    switch (type) {
      case 'payout':
        return 'Payout';
      case 'refund':
        return 'Refund';
      case 'adjustment':
        return 'Adjustment';
      case 'fee':
        return 'Fee';
      default:
        return type;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <ArrowUpwardIcon fontSize="small" /> 
      : <ArrowDownwardIcon fontSize="small" />;
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Payment History
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Earnings
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(summary.totalEarnings)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Pending Payments
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(summary.pendingPayments)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<FilterIcon />}
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </Box>
      
      {showFilters && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="payout">Payout</MenuItem>
                <MenuItem value="refund">Refund</MenuItem>
                <MenuItem value="adjustment">Adjustment</MenuItem>
                <MenuItem value="fee">Fee</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={filters.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="flex-end">
              <Button onClick={handleResetFilters}>Reset Filters</Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
              </Box>
        ) : transactions.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No payment transactions found.
            </Typography>
            </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      onClick={() => handleSort('createdAt')}
                      sx={{ cursor: 'pointer' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Date {renderSortIcon('createdAt')}
                      </Box>
                    </TableCell>
                    <TableCell>Order</TableCell>
                    <TableCell 
                      onClick={() => handleSort('amount')}
                      sx={{ cursor: 'pointer' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Amount {renderSortIcon('amount')}
                      </Box>
                    </TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                            <TableCell>
                        {transaction.order ? transaction.order.orderNumber : '-'}
                            </TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                            <TableCell>
                        <Chip 
                          label={getTypeLabel(transaction.type)} 
                          size="small"
                        />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={transaction.status}
                          color={getStatusColor(transaction.status)} 
                                size="small"
                              />
                            </TableCell>
                      <TableCell align="right">
                                <IconButton
                                  size="small"
                          onClick={() => handleViewDetails(transaction._id)}
                          aria-label="view details"
                        >
                          <InfoIcon fontSize="small" />
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
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
          </Paper>

      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent dividers>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : selectedTransaction && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Transaction ID
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedTransaction._id}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(selectedTransaction.createdAt)}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatCurrency(selectedTransaction.amount)}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <Chip 
                    label={selectedTransaction.status} 
                    color={getStatusColor(selectedTransaction.status)} 
                    size="small"
                  />
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Type
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {getTypeLabel(selectedTransaction.type)}
              </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                {selectedTransaction.order && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary">
                      Order Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedTransaction.order.orderNumber}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary">
                      Order Amount
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatCurrency(selectedTransaction.order.totalAmount)}
                    </Typography>
                    
                    {selectedTransaction.order.items && (
                      <>
                  <Typography variant="subtitle2" color="text.secondary">
                          Items
                  </Typography>
                        <Typography variant="body1" component="div" gutterBottom>
                          <ul style={{ paddingLeft: '1rem', margin: '0.5rem 0' }}>
                            {selectedTransaction.order.items.map((item, index) => (
                              <li key={index}>
                                {item.product.name} x {item.quantity}
                              </li>
                            ))}
                          </ul>
                  </Typography>
                      </>
                    )}
                  </>
                )}
                
                {selectedTransaction.paymentMethod && (
                  <>
                  <Typography variant="subtitle2" color="text.secondary">
                      Payment Method
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                      {selectedTransaction.paymentMethod.name} ({selectedTransaction.paymentMethod.type})
                  </Typography>
                    
                    {selectedTransaction.paymentMethod.type === 'bank' && (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Account: {selectedTransaction.paymentMethod.accountNumber}
                  </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          IFSC: {selectedTransaction.paymentMethod.ifsc}
                  </Typography>
                      </>
                    )}
                    
                    {selectedTransaction.paymentMethod.type === 'upi' && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        UPI ID: {selectedTransaction.paymentMethod.upiId}
                  </Typography>
                    )}
                    
                    {selectedTransaction.paymentMethod.type === 'wallet' && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Wallet ID: {selectedTransaction.paymentMethod.walletId}
                  </Typography>
                    )}
                  </>
                )}
                </Grid>
                
              {selectedTransaction.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedTransaction.description}
                  </Typography>
                </Grid>
              )}
                  </Grid>
                )}
            </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
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

export default PaymentsHistory; 