import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Rating,
  Avatar,
  Paper,
  LinearProgress,
  FormControl,
  Select,
  MenuItem,
  Divider,
  IconButton,
  Badge,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { ThumbUp, Refresh } from '@mui/icons-material';
import * as reviewService from '../../services/reviewService';

const Reviews = () => {
  const [filter, setFilter] = useState('All Reviews');
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {};
      
      // Convert filter value to API parameter
      if (filter !== 'All Reviews') {
        filters.rating = parseInt(filter.split(' ')[0]);
      }
      
      const response = await reviewService.getSellerReviews(filters);
      
      // Debug the full response structure
      console.log('API Reviews Response Data:', response.data);
      
      if (response && response.data && response.data.reviews) {
        // Extract the reviews array from the response.data object
        setReviews(response.data.reviews);
        console.log('Reviews loaded successfully:', response.data.reviews.length);
      } else {
        console.warn('Empty or invalid response format from reviews API');
        setReviews([]);
        setError('No reviews found or empty response from server');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      if (error.response && error.response.status === 404) {
        setError('The reviews endpoint was not found. Please verify your API routes are set up correctly.');
      } else if (error.response && error.response.status === 500) {
        setError('Server error. The database connection may be unavailable. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        setError('The connection timed out. Please check your network and server status.');
      } else {
        setError('Failed to load reviews. Please check your connection and try again.');
      }
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await reviewService.getReviewStats();
      
      // Debug the stats response structure
      console.log('API Stats Response Data:', response.data);
      
      if (response && response.data && response.data.ratingStats) {
        // Map the backend structure to match the component's expected format
        const statsData = {
          average: response.data.ratingStats.averageRating || 0,
          total: response.data.ratingStats.totalReviews || 0,
          distribution: {
            5: response.data.ratingStats.rating5 || 0,
            4: response.data.ratingStats.rating4 || 0,
            3: response.data.ratingStats.rating3 || 0,
            2: response.data.ratingStats.rating2 || 0,
            1: response.data.ratingStats.rating1 || 0,
          },
          responseRate: response.data.responseRate || 0,
          monthlyData: response.data.monthlyData || [],
          unrespondedCount: response.data.unrespondedCount || 0
        };
        
        setStats(statsData);
        console.log('Review stats loaded successfully');
      } else {
        console.warn('Empty or invalid response format from stats API');
      }
    } catch (error) {
      console.error('Error fetching review statistics:', error);
      // Don't set error state here to not override the main error message
    }
  };

  // Update when filter changes
  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleRetry = () => {
    fetchReviews();
    fetchStats();
  };

  // Fallback to empty data if API fails
  const safeStats = {
    average: stats?.average || 0,
    total: stats?.total || 0,
    distribution: stats?.distribution || {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
  };

  return (
    <Box sx={{ p: 0 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Reviews & Ratings
      </Typography>
      
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(229, 231, 235, 1)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Left side - Average rating */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: { xs: 'center', md: 'flex-start' },
            minWidth: { md: '200px' }
          }}>
            <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
              {safeStats.average.toFixed(1)}
            </Typography>
            <Box sx={{ display: 'flex', my: 1 }}>
              <Rating 
                value={safeStats.average} 
                precision={0.5} 
                readOnly 
                sx={{ color: '#f59e0b' }} 
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Based on {safeStats.total} reviews
            </Typography>
          </Box>
          
          {/* Right side - Rating bars */}
          <Box sx={{ flexGrow: 1 }}>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ minWidth: '40px', color: '#64748b' }}>
                  {rating} ★
                </Typography>
                <Box sx={{ flexGrow: 1, mx: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={safeStats.total > 0 ? (safeStats.distribution[rating] / safeStats.total) * 100 : 0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#e2e8f0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: rating >= 4 ? '#10b981' : rating === 3 ? '#f59e0b' : '#ef4444',
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>
                <Typography sx={{ minWidth: '30px', textAlign: 'right', color: '#64748b' }}>
                  {safeStats.distribution[rating]}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
      
      {/* Filter section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Filter Reviews
          </Typography>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <Select
              value={filter}
              onChange={handleFilterChange}
              sx={{ 
                borderRadius: 2,
                backgroundColor: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e2e8f0'
                }
              }}
            >
              <MenuItem value="All Reviews">All Reviews</MenuItem>
              <MenuItem value="5 Stars">5 Stars</MenuItem>
              <MenuItem value="4 Stars">4 Stars</MenuItem>
              <MenuItem value="3 Stars">3 Stars</MenuItem>
              <MenuItem value="2 Stars">2 Stars</MenuItem>
              <MenuItem value="1 Star">1 Star</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Button 
          startIcon={<Refresh />} 
          variant="outlined" 
          onClick={handleRetry}
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          Refresh
        </Button>
      </Box>
      
      {/* Error message */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              RETRY
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {/* Loading indicator */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : reviews.length === 0 ? (
        <Paper
          elevation={0}
          sx={{ 
            p: 4, 
            mb: 3,
            borderRadius: 2,
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(229, 231, 235, 1)',
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No reviews found for the selected filter.
          </Typography>
          {filter !== 'All Reviews' && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try selecting "All Reviews" to see all your reviews.
            </Typography>
          )}
        </Paper>
      ) : (
        /* Reviews list */
        reviews.map((review) => (
          <Paper
            key={review._id || review.id}
            elevation={0}
            sx={{ 
              mb: 3,
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(229, 231, 235, 1)',
            }}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    src={review.user?.avatar || review.customer?.avatar}
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: '#6366f1',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    {(review.user?.name || review.customer?.name || 'User').charAt(0)}
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {review.user?.name || review.customer?.name || 'User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {review.date ? new Date(review.date).toLocaleDateString() : 'Unknown date'}
                    </Typography>
                  </Box>
                </Box>
                <Rating value={review.rating || 0} readOnly size="small" sx={{ color: '#f59e0b' }} />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                {review.product && (
                  <Chip 
                    label={typeof review.product === 'string' ? review.product : review.product.name} 
                    size="small" 
                    sx={{ 
                      bgcolor: '#f1f5f9', 
                      color: '#64748b',
                      fontWeight: 500,
                      borderRadius: '6px',
                      height: '24px'
                    }} 
                  />
                )}
                {review.helpful > 0 && (
                  <Box 
                    component="span" 
                    sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center',
                      ml: 2,
                      color: '#64748b',
                      fontSize: '0.875rem'
                    }}
                  >
                    <ThumbUp sx={{ fontSize: '16px', mr: 0.5 }} />
                    {review.helpful} Helpful
                  </Box>
                )}
              </Box>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                {review.comment || review.text}
              </Typography>
              
              {review.reply && (
                <Box 
                  sx={{ 
                    bgcolor: '#f1f5f9', 
                    p: 2, 
                    borderRadius: 2,
                    mt: 2 
                  }}
                >
                  <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                    Your Response
                  </Typography>
                  <Typography variant="body2">
                    {review.reply}
                  </Typography>
                </Box>
              )}
              
              {review.response && (
                <Box 
                  sx={{ 
                    bgcolor: '#f1f5f9', 
                    p: 2, 
                    borderRadius: 2,
                    mt: 2 
                  }}
                >
                  <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                    Your Response
                  </Typography>
                  <Typography variant="body2">
                    {typeof review.response === 'string' ? review.response : review.response.text}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default Reviews; 