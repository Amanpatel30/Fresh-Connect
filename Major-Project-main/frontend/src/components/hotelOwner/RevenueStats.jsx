import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Button } from '@mui/material';
import { TrendingUpOutlined, TrendingDownOutlined, InfoOutlined } from '@mui/icons-material';
import { formatCurrency } from '../../utils/format';

const RevenueStats = ({ stats = {}, loading = false }) => {
  const [showQuery, setShowQuery] = useState(false);

  React.useEffect(() => {
    console.log('RevenueStats received:', stats);
  }, [stats]);

  const toggleQuery = () => {
    setShowQuery(!showQuery);
  };

  const getMongoDBInsertQuery = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Format dates for MongoDB
    const formatDate = (date) => {
      return date.toISOString();
    };
    
    return `
// MongoDB query to insert sample orders
db.orders.insertMany([
  {
    "items": [
      {
        "menuItemId": ObjectId("60d21b4667d0d8992e610c85"),
        "name": "Vegetable Platter",
        "price": 450,
        "quantity": 2
      },
      {
        "menuItemId": ObjectId("60d21b4667d0d8992e610c86"),
        "name": "Fresh Fruit Mix",
        "price": 350,
        "quantity": 1
      }
    ],
    "totalAmount": 1250,
    "status": "delivered",
    "paymentStatus": "paid",
    "paymentMethod": "online",
    "hotelId": ObjectId("${localStorage.getItem('userId') || '60d21b4667d0d8992e610c87'}"),
    "createdAt": new Date("${formatDate(yesterday)}"),
    "updatedAt": new Date("${formatDate(yesterday)}")
  },
  {
    "items": [
      {
        "menuItemId": ObjectId("60d21b4667d0d8992e610c88"),
        "name": "Homemade Pasta",
        "price": 550,
        "quantity": 1
      },
      {
        "menuItemId": ObjectId("60d21b4667d0d8992e610c89"),
        "name": "Vegan Burger Meal",
        "price": 650,
        "quantity": 2
      }
    ],
    "totalAmount": 1850,
    "status": "delivered",
    "paymentStatus": "paid",
    "paymentMethod": "online",
    "hotelId": ObjectId("${localStorage.getItem('userId') || '60d21b4667d0d8992e610c87'}"),
    "createdAt": new Date("${formatDate(today)}"),
    "updatedAt": new Date("${formatDate(today)}")
  },
  {
    "items": [
      {
        "menuItemId": ObjectId("60d21b4667d0d8992e610c90"),
        "name": "Gourmet Salad",
        "price": 400,
        "quantity": 3
      }
    ],
    "totalAmount": 1200,
    "status": "delivered",
    "paymentStatus": "paid",
    "paymentMethod": "cash",
    "hotelId": ObjectId("${localStorage.getItem('userId') || '60d21b4667d0d8992e610c87'}"),
    "createdAt": new Date("${formatDate(today)}"),
    "updatedAt": new Date("${formatDate(today)}")
  }
]);
    `;
  };

  // If loading, show loading state
  if (loading) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          borderRadius: 2, 
          height: '100%', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(229, 231, 235, 1)',
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Revenue Overview</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
          <CircularProgress size={40} />
        </Box>
      </Paper>
    );
  }

  // Check if we have valid revenue data
  const hasValidData = stats && 
    (stats.totalRevenue > 0 || 
     stats.todayRevenue > 0 || 
     stats.ordersCount > 0 || 
     stats.todayOrdersCount > 0);

  // If no valid data, show a message
  if (!hasValidData) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          borderRadius: 2, 
          height: '100%', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(229, 231, 235, 1)',
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Revenue Overview</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', flexDirection: 'column' }}>
          <InfoOutlined sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
            No revenue data available
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Complete some orders to see your revenue statistics
          </Typography>
          
          <Button 
            variant="outlined" 
            color="primary" 
            size="small" 
            onClick={toggleQuery}
            sx={{ mb: 2 }}
          >
            {showQuery ? 'Hide MongoDB Query' : 'Show MongoDB Query'}
          </Button>
          
          {showQuery && (
            <Box 
              sx={{ 
                width: '100%', 
                maxHeight: '200px', 
                overflow: 'auto', 
                bgcolor: 'rgba(0, 0, 0, 0.05)', 
                p: 2, 
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                whiteSpace: 'pre-wrap'
              }}
            >
              {getMongoDBInsertQuery()}
            </Box>
          )}
        </Box>
      </Paper>
    );
  }

  // Calculate percentage changes
  const revenueChange = stats.previousRevenue > 0 
    ? ((stats.totalRevenue - stats.previousRevenue) / stats.previousRevenue) * 100 
    : 0;
  
  const ordersChange = stats.previousOrdersCount > 0 
    ? ((stats.ordersCount - stats.previousOrdersCount) / stats.previousOrdersCount) * 100 
    : 0;

  // Determine if changes are positive or negative
  const isRevenueUp = revenueChange >= 0;
  const isOrdersUp = ordersChange >= 0;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        borderRadius: 2, 
        height: '100%', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(229, 231, 235, 1)',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Revenue Overview</Typography>
      
      <Grid container spacing={2}>
        {/* Total Revenue */}
        <Grid item xs={12} sm={6}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.1)' }}>
            <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
            <Typography variant="h5" sx={{ my: 1, fontWeight: 600 }}>
              {formatCurrency(stats.totalRevenue || 0)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isRevenueUp ? (
                <TrendingUpOutlined sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
              ) : (
                <TrendingDownOutlined sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
              )}
              <Typography 
                variant="caption" 
                sx={{ 
                  color: isRevenueUp ? 'success.main' : 'error.main',
                  fontWeight: 500
                }}
              >
                {isRevenueUp ? '+' : ''}{revenueChange.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                vs previous period
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        {/* Today's Revenue */}
        <Grid item xs={12} sm={6}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)' }}>
            <Typography variant="body2" color="text.secondary">Today's Revenue</Typography>
            <Typography variant="h5" sx={{ my: 1, fontWeight: 600 }}>
              {formatCurrency(stats.todayRevenue || 0)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                From {stats.todayOrdersCount || 0} orders today
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        {/* Total Orders */}
        <Grid item xs={12} sm={6}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.1)' }}>
            <Typography variant="body2" color="text.secondary">Total Orders</Typography>
            <Typography variant="h5" sx={{ my: 1, fontWeight: 600 }}>
              {stats.ordersCount || 0}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isOrdersUp ? (
                <TrendingUpOutlined sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
              ) : (
                <TrendingDownOutlined sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
              )}
              <Typography 
                variant="caption" 
                sx={{ 
                  color: isOrdersUp ? 'success.main' : 'error.main',
                  fontWeight: 500
                }}
              >
                {isOrdersUp ? '+' : ''}{ordersChange.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                vs previous period
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        {/* Average Order Value */}
        <Grid item xs={12} sm={6}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
            <Typography variant="body2" color="text.secondary">Average Order Value</Typography>
            <Typography variant="h5" sx={{ my: 1, fontWeight: 600 }}>
              {formatCurrency(stats.ordersCount > 0 ? stats.totalRevenue / stats.ordersCount : 0)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Based on {stats.ordersCount || 0} orders
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RevenueStats; 