import React from 'react';
import { Container, Paper, Typography, Box, Button, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Test = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Urgent Sales Test Page
        </Typography>
        
        <Typography variant="body1" paragraph>
          We've created a simplified version of the Urgent Sales form that should work properly with the database. 
          The complex version was having validation issues, so this minimal version addresses those by:
        </Typography>
        
        <Box component="ul" sx={{ pl: 4 }}>
          <li>Using a simpler form structure</li>
          <li>Including all required MongoDB fields</li>
          <li>Using a hardcoded seller ID if token extraction fails</li>
          <li>Improved error handling and debugging</li>
          <li>Proper field type conversion</li>
        </Box>
        
        <Typography variant="body1" paragraph>
          Please try using this minimal version to add urgent sales. Once confirmed working, 
          we can integrate these fixes back into the main form.
        </Typography>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button 
            component={RouterLink} 
            to="/urgent-minimal" 
            variant="contained" 
            color="primary"
            size="large"
          >
            Try Minimal Version
          </Button>
        </Box>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Debug Instructions:
          </Typography>
          
          <Typography variant="body2" component="div">
            <ol>
              <li>Open browser console (F12) before submitting the form</li>
              <li>Fill out all required fields in the form</li>
              <li>Submit the form and observe console output</li>
              <li>If errors occur, check the specific error message</li>
              <li>For "seller ID" errors, replace the hardcoded ID in UrgentSalesMinimal.jsx with a valid ID from your database</li>
            </ol>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Test; 