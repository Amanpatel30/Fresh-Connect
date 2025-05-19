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
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { getPurchaseHistory } from '../../services/api.jsx';

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Function to fetch purchase history
  const fetchPurchases = async () => {
    try {
      setLoading(true);
      console.log('Fetching purchase history...');
      
      const response = await getPurchaseHistory();
      console.log('Purchase history response:', response.data);
      
      if (response.data && Array.isArray(response.data.items)) {
        setPurchases(response.data.items);
      } else if (response.data && Array.isArray(response.data)) {
        setPurchases(response.data);
      } else {
        setPurchases([]);
        setSnackbar({
          open: true,
          message: 'No purchase history found in the database.',
          severity: 'info'
        });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error in fetchPurchases:', err);
      setError('Failed to load purchase history. Please ensure the backend server is running.');
      setSnackbar({
        open: true,
        message: 'Failed to load purchase history. Please ensure the backend server is running.',
        severity: 'error'
      });
      setLoading(false);
      setPurchases([]);
    }
  };

  // Load data on component mount
  useEffect(() => {
    console.log('PurchaseHistory component mounted');
    fetchPurchases();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Purchase History
      </Typography>
      
      {/* Debug buttons */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchPurchases}
        >
          Refresh Data
        </Button>
      </Box>
      
      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Purchase History Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : purchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="textSecondary">
                    No purchase history found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              purchases.map((purchase) => (
                <TableRow key={purchase._id} hover>
                  <TableCell>
                    {new Date(purchase.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{purchase.supplier}</TableCell>
                  <TableCell>{purchase.items?.length || 0} items</TableCell>
                  <TableCell>${purchase.totalAmount?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>{purchase.paymentMethod}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: '4px',
                        bgcolor: 
                          purchase.paymentStatus === 'Paid' ? '#e6f7e6' : 
                          purchase.paymentStatus === 'Pending' ? '#fff8e6' : '#ffe6e6',
                        color:
                          purchase.paymentStatus === 'Paid' ? 'green' : 
                          purchase.paymentStatus === 'Pending' ? 'orange' : 'red',
                        fontWeight: 'medium',
                        fontSize: '0.75rem'
                      }}
                    >
                      {purchase.paymentStatus}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PurchaseHistory; 