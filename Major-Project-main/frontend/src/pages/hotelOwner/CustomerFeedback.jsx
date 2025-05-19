import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Rating,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Snackbar,
  Alert,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplyIcon from '@mui/icons-material/Reply';
import PersonIcon from '@mui/icons-material/Person';
import { format, parseISO, isValid } from 'date-fns';
import { getHotelFeedback, resolveFeedback, respondToFeedback, getFeedbackById } from '../../services/feedbackService';

const CustomerFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Define status filters for tabs
  const statusTabs = [
    { label: 'All Feedbacks', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Responded', value: 'responded' },
    { label: 'Resolved', value: 'resolved' }
  ];

  // Fetch feedbacks on component mount
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const data = await getHotelFeedback();
        setFeedbacks(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setSnackbar({
          open: true,
          message: 'Failed to load feedback. Please try again later.',
          severity: 'error'
        });
        setLoading(false);
      }
    };
    
    fetchFeedbacks();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle dialog open for responding to feedback
  const handleOpenResponseDialog = async (feedback) => {
    try {
      // If we need more detailed feedback info, fetch it
      if (feedback._id) {
        const response = await getFeedbackById(feedback._id);
        if (response) {
          setCurrentFeedback(response);
          setResponseText(response.reply || (response.response && response.response.text) || '');
          setOpenDialog(true);
          return;
        }
      }
      
      // If the API call fails or we don't need more detail
      setCurrentFeedback(feedback);
      setResponseText(feedback.reply || (feedback.response && feedback.response.text) || '');
      setOpenDialog(true);
    } catch (error) {
      console.error('Error fetching feedback details:', error);
      setCurrentFeedback(feedback);
      setResponseText(feedback.reply || (feedback.response && feedback.response.text) || '');
      setOpenDialog(true);
    }
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setResponseText('');
    setCurrentFeedback(null);
  };

  // Handle response submission
  const handleSubmitResponse = async () => {
    try {
      setLoading(true);
      console.log(`Responding to feedback ${currentFeedback._id}...`);
      
      const result = await respondToFeedback(currentFeedback._id, responseText);
      console.log('Response submission result:', result);
      
      // Update local state to reflect the change
      setFeedbacks(feedbacks.map(feedback => 
        feedback._id === currentFeedback._id 
          ? { 
              ...feedback, 
              status: 'responded', 
              reply: responseText,
              replyDate: new Date().toISOString()
            } 
          : feedback
      ));
      
      setSnackbar({
        open: true,
        message: 'Response submitted successfully',
        severity: 'success'
      });
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error submitting response:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.response?.data?.message || error.message);
      
      setSnackbar({
        open: true,
        message: 'Failed to submit response: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle marking feedback as resolved
  const handleResolveFeedback = async (id) => {
    try {
      setLoading(true);
      console.log(`Resolving feedback ${id}...`);
      
      const response = await resolveFeedback(id);
      console.log('Resolve feedback result:', response);
      
      // Update local state to reflect the change
      setFeedbacks(feedbacks.map(feedback => 
        feedback._id === id 
          ? { ...feedback, status: 'resolved' } 
          : feedback
      ));
      
      setSnackbar({
        open: true,
        message: 'Feedback marked as resolved',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error resolving feedback:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.response?.data?.message || error.message);
      
      setSnackbar({
        open: true,
        message: 'Failed to mark feedback as resolved: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Filter feedbacks based on tab and search term
  const filteredFeedbacks = feedbacks.filter(feedback => {
    // Filter by tab
    if (tabValue > 0) {
      // If not "All" tab, filter by status
      const expectedStatus = statusTabs[tabValue].value;
      if (feedback.status !== expectedStatus) {
        return false;
      }
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        feedback.comment?.toLowerCase().includes(searchLower) ||
        feedback.user?.name?.toLowerCase().includes(searchLower) ||
        feedback.user?.email?.toLowerCase().includes(searchLower) ||
        feedback.response?.text?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'responded': return 'info';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  // Helper function to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      return isValid(date) ? format(date, 'MMM dd, yyyy HH:mm') : 'Invalid date';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Customer Feedback
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="feedback tabs"
          >
            {statusTabs.map((tab, index) => (
              <Tab key={tab.value} label={tab.label} />
            ))}
          </Tabs>
        </Box>
        
        <Box display="flex" mb={3}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search feedbacks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        {loading && feedbacks.length === 0 ? (
          <Box display="flex" justifyContent="center" my={5}>
            <CircularProgress />
          </Box>
        ) : filteredFeedbacks.length === 0 ? (
          <Box textAlign="center" my={5}>
            <Typography variant="h6" color="textSecondary">
              No feedbacks found
            </Typography>
            {tabValue === 0 ? (
              <Typography variant="body1" color="textSecondary" mt={1}>
                When customers leave feedback, they will appear here
              </Typography>
            ) : (
              <Typography variant="body1" color="textSecondary" mt={1}>
                No {statusTabs[tabValue].value} feedbacks found
              </Typography>
            )}
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredFeedbacks.map((feedback) => (
              <Grid item xs={12} md={6} key={feedback.id || feedback._id}>
                <Card elevation={3}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                          {feedback.user?.name ? feedback.user.name.charAt(0) : <PersonIcon />}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1">
                            {feedback.user?.name || 'Anonymous'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {feedback.user?.email || 'No email'}
                          </Typography>

                        </Box>
                      </Box>
                      <Chip 
                        label={feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)} 
                        color={getStatusColor(feedback.status)}
                        size="small"
                      />
                    </Box>
                    
                    <Box mb={2}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Rating value={feedback.rating} readOnly precision={0.5} />
                        <Typography variant="body2" color="text.secondary" ml={1}>
                          ({feedback.rating}/5)
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {feedback.comment}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Submitted on {formatDate(feedback.createdAt)}
                      </Typography>
                    </Box>
                    
                    {(feedback.reply || feedback.response) && (
                      <Box mt={2} mb={1} p={1.5} bgcolor="grey.100" borderRadius={1}>
                        <Typography variant="subtitle2" color="primary">
                          Your Response:
                        </Typography>
                        <Typography variant="body2" mt={0.5}>
                          {feedback.reply || (feedback.response && feedback.response.text)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Responded on {formatDate(feedback.replyDate || (feedback.response && feedback.response.date))}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<ReplyIcon />}
                      onClick={() => handleOpenResponseDialog(feedback)}
                      disabled={feedback.status === 'resolved'}
                    >
                      {(feedback.reply || feedback.response) ? 'Edit Response' : 'Respond'}
                    </Button>
                    
                    {feedback.status !== 'resolved' && (
                      <Button
                        size="small"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleResolveFeedback(feedback._id)}
                      >
                        Mark as Resolved
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
      
      {/* Response Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Respond to Feedback
        </DialogTitle>
        <DialogContent>
          {currentFeedback && (
            <Box mt={2}>
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Customer Feedback:
                </Typography>
                <Box display="flex" alignItems="center" mt={1} mb={1}>
                  <Rating value={currentFeedback.rating} readOnly precision={0.5} />
                  <Typography variant="body2" color="text.secondary" ml={1}>
                    ({currentFeedback.rating}/5)
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {currentFeedback.comment}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <TextField
                fullWidth
                label="Your Response"
                multiline
                rows={4}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Type your response to the customer's feedback here..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitResponse}
            variant="contained"
            color="primary"
            disabled={loading || !responseText.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Response'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerFeedback; 