import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box, 
  CircularProgress, 
  Divider, 
  Button, 
  Chip,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { getSalesAnalytics, getCustomerAnalytics } from '../../services/api.jsx';

const AnalyticsComponent = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [customerData, setCustomerData] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if we have a token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found. Please log in again.');
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      console.log('Fetching analytics data with token:', token.substring(0, 15) + '...');
      
      // Fetch sales analytics
      const salesResponse = await getSalesAnalytics('week');
      if (salesResponse.data) {
        console.log('Sales analytics data received:', salesResponse.data);
        // Extract the actual data from the nested structure
        const actualSalesData = salesResponse.data.data || salesResponse.data;
        console.log('Extracted sales data:', actualSalesData);
        
        // Check if this is sample data
        if (actualSalesData.sampleDataUsed) {
          console.error('Sample data received instead of real database data');
          setError('No real data available in the database. Please add some data before viewing analytics.');
          setLoading(false);
          return;
        }
        
        setSalesData(actualSalesData);
      }
      
      // Fetch customer analytics
      const customerResponse = await getCustomerAnalytics();
      if (customerResponse.data) {
        console.log('Customer analytics data received:', customerResponse.data);
        // Extract the actual data from the nested structure
        const actualCustomerData = customerResponse.data.data || customerResponse.data;
        console.log('Extracted customer data:', actualCustomerData);
        
        // Check if this is sample data
        if (actualCustomerData.sampleDataUsed) {
          console.error('Sample customer data received instead of real database data');
          setError('No real customer data available in the database. Please add some data before viewing analytics.');
          setLoading(false);
          return;
        }
        
        setCustomerData(actualCustomerData);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      
      // Check if it's an authentication error
      if (error.response && error.response.status === 401) {
        setError('Authentication error. Please log in again.');
      } else {
        setError('Failed to fetch analytics data. Please ensure the backend server is running and database has real data.');
      }
      
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  // Colors for pie charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ mb: 2 }}
        action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  // Debug the data before rendering
  console.log('Rendering with salesData:', salesData);
  console.log('Rendering with customerData:', customerData);

  return (
    <Box sx={{ p: 2 }}>
      {(!salesData || !customerData) && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Some data is missing. The dashboard may not display correctly.
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Analytics Overview
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          size="small"
        >
          Refresh
        </Button>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 6
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    ₹{salesData?.data?.totalRevenue?.toLocaleString() || salesData?.totalRevenue?.toLocaleString() || '0'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +12.5% from last week
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ 
                  backgroundColor: 'primary.light', 
                  p: 1, 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AttachMoneyIcon sx={{ color: 'primary.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 6
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Orders
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {salesData?.data?.totalOrders || salesData?.totalOrders || '0'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +8.2% from last week
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ 
                  backgroundColor: 'warning.light', 
                  p: 1, 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShoppingCartIcon sx={{ color: 'warning.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 6
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    New Customers
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {customerData?.data?.newCustomers || customerData?.newCustomers || '0'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +5.3% from last week
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ 
                  backgroundColor: 'info.light', 
                  p: 1, 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PeopleIcon sx={{ color: 'info.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 6
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Avg. Order Value
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    ₹{salesData?.data?.averageOrderValue?.toFixed(2) || salesData?.averageOrderValue?.toFixed(2) || '0.00'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingDownIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="error.main">
                      -2.1% from last week
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ 
                  backgroundColor: 'success.light', 
                  p: 1, 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <RestaurantIcon sx={{ color: 'success.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Popular Menu Items</Typography>
                <Tooltip title="Top selling menu items based on order quantity">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {(salesData?.data?.popularItems?.length > 0 || salesData?.popularItems?.length > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={salesData?.data?.popularItems || salesData?.popularItems}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="value" name="Orders" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <Typography color="text.secondary">No menu data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Order Sources</Typography>
                <Tooltip title="Distribution of orders by source">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {(salesData?.data?.orderSources?.length > 0 || salesData?.orderSources?.length > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={salesData?.data?.orderSources || salesData?.orderSources}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(salesData?.data?.orderSources || salesData?.orderSources || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <Typography color="text.secondary">No order source data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsComponent; 