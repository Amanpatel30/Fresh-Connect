import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  VerifiedUser as VerifiedIcon,
  Pending as PendingIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

const OrderVerification = () => {
  const { orderId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationData, setVerificationData] = useState(null);

  useEffect(() => {
    const fetchVerificationData = async () => {
      try {
        const response = await fetch(`http://localhost:5003/api/verifications/orders/${orderId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch verification data');
        }
        const data = await response.json();
        setVerificationData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationData();
  }, [orderId]);

  const getVerificationStatus = (verification) => {
    if (!verification) return { status: 'Not Available', color: 'default', icon: <ErrorIcon /> };
    
    switch (verification.status) {
      case 'approved':
        return { status: 'Verified', color: 'success', icon: <VerifiedIcon /> };
      case 'pending':
        return { status: 'Pending', color: 'warning', icon: <PendingIcon /> };
      case 'rejected':
        return { status: 'Rejected', color: 'error', icon: <ErrorIcon /> };
      default:
        return { status: 'Unknown', color: 'default', icon: <ErrorIcon /> };
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  const sellerStatus = getVerificationStatus(verificationData?.sellerVerification);
  const hotelStatus = getVerificationStatus(verificationData?.hotelVerification);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Order Verification Status
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Order ID: {orderId}
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Seller Verification
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                icon={sellerStatus.icon}
                label={sellerStatus.status}
                color={sellerStatus.color}
                variant="outlined"
              />
            </Box>
            {verificationData?.sellerVerification && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Verified On: {new Date(verificationData.sellerVerification.reviewedAt).toLocaleDateString()}
                </Typography>
                {verificationData.sellerVerification.notes && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Notes: {verificationData.sellerVerification.notes}
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Hotel Verification
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                icon={hotelStatus.icon}
                label={hotelStatus.status}
                color={hotelStatus.color}
                variant="outlined"
              />
            </Box>
            {verificationData?.hotelVerification && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Verified On: {new Date(verificationData.hotelVerification.reviewedAt).toLocaleDateString()}
                </Typography>
                {verificationData.hotelVerification.notes && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Notes: {verificationData.hotelVerification.notes}
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderVerification; 