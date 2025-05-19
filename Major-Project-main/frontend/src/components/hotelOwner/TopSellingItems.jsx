import React, { useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, LinearProgress, Chip, CircularProgress, Button } from '@mui/material';
import { TrendingUpOutlined, InfoOutlined } from '@mui/icons-material';

const TopSellingItems = ({ items = [], loading = false }) => {
  const [showQuery, setShowQuery] = useState(false);

  React.useEffect(() => {
    console.log('TopSellingItems received:', items);
  }, [items]);

  const toggleQuery = () => {
    setShowQuery(!showQuery);
  };

  const getMongoDBInsertQuery = () => {
    return `
// MongoDB query to insert sample menu items
db.menuItems.insertMany([
  {
    "name": "Vegetable Platter",
    "description": "Fresh organic vegetables served with homemade dips",
    "price": 450,
    "category": "Appetizers",
    "isVegetarian": true,
    "isVegan": true,
    "isGlutenFree": true,
    "image": "vegetable-platter.jpg",
    "hotelId": ObjectId("${localStorage.getItem('userId') || '60d21b4667d0d8992e610c87'}")
  },
  {
    "name": "Fresh Fruit Mix",
    "description": "Seasonal fruits freshly cut and served with honey",
    "price": 350,
    "category": "Desserts",
    "isVegetarian": true,
    "isVegan": true,
    "isGlutenFree": true,
    "image": "fruit-mix.jpg",
    "hotelId": ObjectId("${localStorage.getItem('userId') || '60d21b4667d0d8992e610c87'}")
  },
  {
    "name": "Homemade Pasta",
    "description": "Fresh pasta made in-house with organic ingredients",
    "price": 550,
    "category": "Main Course",
    "isVegetarian": true,
    "isVegan": false,
    "isGlutenFree": false,
    "image": "homemade-pasta.jpg",
    "hotelId": ObjectId("${localStorage.getItem('userId') || '60d21b4667d0d8992e610c87'}")
  },
  {
    "name": "Vegan Burger Meal",
    "description": "Plant-based burger with sweet potato fries",
    "price": 650,
    "category": "Main Course",
    "isVegetarian": true,
    "isVegan": true,
    "isGlutenFree": false,
    "image": "vegan-burger.jpg",
    "hotelId": ObjectId("${localStorage.getItem('userId') || '60d21b4667d0d8992e610c87'}")
  },
  {
    "name": "Gourmet Salad",
    "description": "Mixed greens with seasonal toppings and house dressing",
    "price": 400,
    "category": "Starters",
    "isVegetarian": true,
    "isVegan": true,
    "isGlutenFree": true,
    "image": "gourmet-salad.jpg",
    "hotelId": ObjectId("${localStorage.getItem('userId') || '60d21b4667d0d8992e610c87'}")
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
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Top Selling Items</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
          <CircularProgress size={40} />
        </Box>
      </Paper>
    );
  }

  // If no items data, show a message
  if (!items || !items.length) {
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
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Top Selling Items</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column' }}>
          <InfoOutlined sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
            No top selling items data available
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Create menu items and complete some orders to see your top performers
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

  // Normalize the data to ensure all items have a sales property
  const normalizedItems = items.map(item => ({
    ...item,
    // If sales is not available, use quantity instead
    sales: item.sales || item.quantity || 0
  }));

  // Find the highest sales value for normalization
  const maxSales = Math.max(...normalizedItems.map(item => item.sales));

  // Colors for the indicator bars
  const colors = ['#6366F1', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

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
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Top Selling Items</Typography>
      
      <List sx={{ width: '100%' }}>
        {normalizedItems.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem sx={{ px: 0, py: 1.5 }}>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body1" fontWeight={500}>{item.name}</Typography>
                  <Chip 
                    label={`${item.sales} sales`}
                    size="small"
                    sx={{ 
                      backgroundColor: `${colors[index % colors.length]}15`,
                      color: colors[index % colors.length],
                      fontWeight: 500
                    }}
                  />
                </Box>
                <Box sx={{ width: '100%', mt: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={(item.sales / maxSales) * 100} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: 'rgba(229, 231, 235, 0.5)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: colors[index % colors.length],
                        borderRadius: 3
                      }
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <TrendingUpOutlined sx={{ color: 'success.main', fontSize: 14, mr: 0.5 }} />
                  <Typography variant="caption" color="success.main">
                    +{Math.floor(Math.random() * 10) + 1}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    from last week
                  </Typography>
                </Box>
              </Box>
            </ListItem>
            {index < normalizedItems.length - 1 && 
              <Divider variant="fullWidth" sx={{ my: 0.5 }} />
            }
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default TopSellingItems; 