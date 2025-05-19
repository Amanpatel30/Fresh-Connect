import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import AnalyticsComponent from '../../components/hotelOwner/AnalyticsComponent';

const AnalyticsDashboard = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
          Analytics Dashboard
        </Typography>
        <AnalyticsComponent />
      </Box>
    </Container>
  );
};

export default AnalyticsDashboard; 