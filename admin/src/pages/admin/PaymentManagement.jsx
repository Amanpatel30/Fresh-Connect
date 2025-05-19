import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  TextField,
  MenuItem,
  IconButton,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaidIcon from '@mui/icons-material/Paid';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    completedPayments: 0,
    pendingAmount: 0,
    refundedAmount: 0
  });

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/payments');
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      const data = await response.json();
      setPayments(data);

      // Calculate summary data
      const totalRevenue = data
        .filter(payment => payment.status === 'completed')
        .reduce((sum, payment) => sum + payment.amount, 0);
      
      const pendingAmount = data
        .filter(payment => payment.status === 'pending')
        .reduce((sum, payment) => sum + payment.amount, 0);
      
      const refundedAmount = data
        .filter(payment => payment.status === 'refunded')
        .reduce((sum, payment) => sum + payment.amount, 0);

      setSummaryData({
        totalRevenue,
        completedPayments: data.filter(payment => payment.status === 'completed').length,
        pendingAmount,
        refundedAmount
      });
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleRefund = async (paymentId) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to process refund');
      }

      // Update the local state
      setPayments(payments.map(payment => 
        payment._id === paymentId ? { ...payment, status: 'refunded' } : payment
      ));

      if (selectedPayment && selectedPayment._id === paymentId) {
        setSelectedPayment({ ...selectedPayment, status: 'refunded' });
      }

      // Update summary data
      setSummaryData(prev => ({
        ...prev,
        totalRevenue: prev.totalRevenue - selectedPayment.amount,
        refundedAmount: prev.refundedAmount + selectedPayment.amount
      }));

    } catch (err) {
      console.error('Error processing refund:', err);
      setError(err.message);
    }
  };

  const handleManualCapture = async (paymentId) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to capture payment');
      }

      // Update the local state
      setPayments(payments.map(payment => 
        payment._id === paymentId ? { ...payment, status: 'completed' } : payment
      ));

      if (selectedPayment && selectedPayment._id === paymentId) {
        setSelectedPayment({ ...selectedPayment, status: 'completed' });
      }

      // Update summary data
      setSummaryData(prev => ({
        ...prev,
        totalRevenue: prev.totalRevenue + selectedPayment.amount,
        pendingAmount: prev.pendingAmount - selectedPayment.amount,
        completedPayments: prev.completedPayments + 1
      }));

    } catch (err) {
      console.error('Error capturing payment:', err);
      setError(err.message);
    }
  };

  const handleRefresh = () => {
    fetchPayments();
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleTypeFilterChange = (event) => {
    setTypeFilter(event.target.value);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = statusFilter === 'all' || payment.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'all' || payment.paymentMethod.toLowerCase() === typeFilter.toLowerCase();
    const matchesSearch = 
      searchTerm === '' ||
      payment._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.user && payment.user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Payment Management
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'background.paper', boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Total Revenue
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                ${summaryData.totalRevenue.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summaryData.completedPayments} completed payments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'background.paper', boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CreditCardIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Pending
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                ${summaryData.pendingAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Awaiting completion
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'background.paper', boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PaidIcon sx={{ color: 'info.main', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Refunded
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                ${summaryData.refundedAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total refunded amount
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'background.paper', boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalanceIcon sx={{ color: 'text.primary', mr: 1 }} />
                <Typography variant="h6" component="div">
                  All Transactions
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {payments.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total payments processed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              placeholder="Search by ID, order, or customer"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              label="Status"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              variant="outlined"
              size="small"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              label="Payment Method"
              value={typeFilter}
              onChange={handleTypeFilterChange}
              variant="outlined"
              size="small"
            >
              <MenuItem value="all">All Methods</MenuItem>
              <MenuItem value="creditcard">Credit Card</MenuItem>
              <MenuItem value="paypal">PayPal</MenuItem>
              <MenuItem value="banktransfer">Bank Transfer</MenuItem>
              <MenuItem value="wallet">Wallet</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              startIcon={<RefreshIcon />} 
              onClick={handleRefresh}
              variant="outlined"
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Payments Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : filteredPayments.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No payments found matching your criteria
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment._id} hover>
                  <TableCell>{payment._id.slice(-8).toUpperCase()}</TableCell>
                  <TableCell>{formatDate(payment.createdAt)}</TableCell>
                  <TableCell>{payment.orderId.slice(-6).toUpperCase()}</TableCell>
                  <TableCell>{payment.user?.name}</TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={payment.paymentMethod} 
                      size="small"
                      color={payment.paymentMethod === 'creditcard' ? 'primary' : payment.paymentMethod === 'paypal' ? 'info' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={payment.status} 
                      color={getStatusColor(payment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton 
                        onClick={() => handleViewPayment(payment)}
                        size="small"
                        color="primary"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Payment Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        {selectedPayment && (
          <>
            <DialogTitle>
              Payment Details - #{selectedPayment._id.slice(-8).toUpperCase()}
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" fontWeight="bold">Transaction Information</Typography>
                    <Typography>Date: {formatDate(selectedPayment.createdAt)}</Typography>
                    <Typography>Amount: ${selectedPayment.amount.toFixed(2)}</Typography>
                    <Typography>Status: 
                      <Chip 
                        label={selectedPayment.status} 
                        color={getStatusColor(selectedPayment.status)} 
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography>Payment Method: {selectedPayment.paymentMethod}</Typography>
                    {selectedPayment.transactionId && (
                      <Typography>Gateway Transaction ID: {selectedPayment.transactionId}</Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" fontWeight="bold">Customer Information</Typography>
                    <Typography>Name: {selectedPayment.user?.name}</Typography>
                    <Typography>Email: {selectedPayment.user?.email}</Typography>
                    <Typography>Phone: {selectedPayment.user?.phone}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">Order Information</Typography>
                <Typography>Order ID: {selectedPayment.orderId}</Typography>
                {selectedPayment.orderDetails && (
                  <>
                    <Typography>Items: {selectedPayment.orderDetails.itemCount}</Typography>
                    <Typography>Shipping Address: {selectedPayment.orderDetails.shippingAddress}</Typography>
                  </>
                )}
              </Box>

              {selectedPayment.billingAddress && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold">Billing Information</Typography>
                    <Typography>
                      {selectedPayment.billingAddress.street}, {selectedPayment.billingAddress.city}, {selectedPayment.billingAddress.state} {selectedPayment.billingAddress.zipCode}
                    </Typography>
                    {selectedPayment.billingAddress.country && (
                      <Typography>Country: {selectedPayment.billingAddress.country}</Typography>
                    )}
                  </Box>
                </>
              )}

              {selectedPayment.cardDetails && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold">Payment Details</Typography>
                    <Typography>Card Type: {selectedPayment.cardDetails.type}</Typography>
                    <Typography>Last 4 Digits: **** **** **** {selectedPayment.cardDetails.last4}</Typography>
                    <Typography>Expiry: {selectedPayment.cardDetails.expiryMonth}/{selectedPayment.cardDetails.expiryYear}</Typography>
                  </Box>
                </>
              )}

              {selectedPayment.notes && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold">Notes</Typography>
                    <Typography>{selectedPayment.notes}</Typography>
                  </Box>
                </>
              )}

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedPayment.status === 'completed' && (
                    <Button 
                      variant="outlined" 
                      color="error"
                      onClick={() => handleRefund(selectedPayment._id)}
                      disabled={selectedPayment.status === 'refunded'}
                    >
                      Issue Refund
                    </Button>
                  )}
                  {selectedPayment.status === 'pending' && (
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={() => handleManualCapture(selectedPayment._id)}
                    >
                      Manually Capture
                    </Button>
                  )}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default PaymentManagement; 