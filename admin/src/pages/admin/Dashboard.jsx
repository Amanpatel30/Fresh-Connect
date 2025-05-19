import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  CircularProgress, 
  Divider,
  Avatar,
  IconButton,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Stack,
  Tab,
  Tabs
} from '@mui/material';
import {
  PeopleOutline as UserIcon,
  ShoppingCartOutlined as ProductIcon,
  ReceiptOutlined as OrderIcon,
  MonetizationOnOutlined as SalesIcon,
  HotelOutlined as HotelIcon,
  AccountCircleOutlined as VerificationIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  MoreVert as MoreIcon,
  Verified as VerifiedIcon,
  WarningAmber as WarningIcon,
  CheckCircle as SuccessIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Chart components - comment out if not using chart libraries
// import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';

// Custom styled components
const StatCard = styled(Card)(({ theme, color }) => ({
  height: '100%',
  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
  borderRadius: 12,
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 20px 0 rgba(0, 0, 0, 0.08)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: 7,
    height: '100%',
    backgroundColor: color || theme.palette.primary.main
  }
}));

const StatCardIcon = styled(Avatar)(({ theme, bgcolor }) => ({
  width: 48,
  height: 48,
  backgroundColor: bgcolor || theme.palette.primary.light,
  color: '#fff',
  boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.15)',
}));

const PercentageChip = styled(Chip)(({ theme, trend }) => ({
  backgroundColor: trend === 'up' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
  color: trend === 'up' ? theme.palette.success.main : theme.palette.error.main,
  fontWeight: 'bold',
  border: 'none',
  '& .MuiChip-icon': {
    color: 'inherit'
  }
}));

// Retry mechanism for API calls
const fetchWithRetry = async (url, options = {}, retries = 3, delay = 1000) => {
  try {
    const response = await fetch(url, options);
    if (response.ok) return response;
    
    // If we have retries left and got an error response
    if (retries > 0) {
      console.log(`Retrying fetch to ${url}, ${retries} retries left`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 1.5);
    }
    return response; // Return the error response after retries are exhausted
  } catch (error) {
    if (retries > 0) {
      console.log(`Fetch error, retrying ${url}, ${retries} retries left:`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 1.5);
    }
    throw error;
  }
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching dashboard data from: /api/admin/dashboard');
      const response = await fetchWithRetry('/api/admin/dashboard');
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      }
      const data = await response.json();
      console.log('Dashboard data received:', data);
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
      
      // Only use fallback data if no data was fetched
      if (!dashboardData) {
        console.log('Using fallback data due to error');
        setDashboardData({
          totalUsers: 1248,
          totalProducts: 567,
          totalOrders: 896,
          totalSales: 142539.75,
          pendingVerifications: 8,
          pendingHotels: 5,
          recentOrders: [
            { _id: 'ORD67891', createdAt: new Date(), totalPrice: 429.99, status: 'Delivered', user: { name: 'John Doe' } },
            { _id: 'ORD67892', createdAt: new Date(), totalPrice: 129.50, status: 'Processing', user: { name: 'Alice Smith' } },
            { _id: 'ORD67893', createdAt: new Date(), totalPrice: 349.99, status: 'Pending', user: { name: 'Bob Johnson' } },
          ],
          salesData: [
            { name: 'Mon', value: 4200 },
            { name: 'Tue', value: 5800 },
            { name: 'Wed', value: 7200 },
            { name: 'Thu', value: 6100 },
            { name: 'Fri', value: 8700 },
            { name: 'Sat', value: 9100 },
            { name: 'Sun', value: 7800 },
          ]
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusChipColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'processing':
        return 'primary';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !dashboardData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with refresh button */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold">
        Admin Dashboard
      </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
          size="small"
        >
          Refresh Data
        </Button>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        {/* Total Users Card */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard color="#3f51b5">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <StatCardIcon bgcolor="#3f51b5">
                  <UserIcon />
                </StatCardIcon>
                <PercentageChip 
                  icon={<ArrowUpIcon fontSize="small" />} 
                  label="+12.5%" 
                  size="small" 
                  trend="up"
                />
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                {dashboardData.totalUsers.toLocaleString()}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                  Total Users
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <LinearProgress 
                  variant="determinate" 
                  value={75} 
                  sx={{ 
                    flexGrow: 1, 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: 'rgba(63, 81, 181, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#3f51b5'
                    }
                  }} 
                />
                <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                  75%
                </Typography>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>

        {/* Total Products Card */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard color="#4caf50">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <StatCardIcon bgcolor="#4caf50">
                  <ProductIcon />
                </StatCardIcon>
                <PercentageChip 
                  icon={<ArrowUpIcon fontSize="small" />} 
                  label="+8.2%" 
                  size="small" 
                  trend="up"
                />
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                {dashboardData.totalProducts.toLocaleString()}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                  Total Products
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <LinearProgress 
                  variant="determinate" 
                  value={65} 
                  sx={{ 
                    flexGrow: 1, 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#4caf50'
                    }
                  }} 
                />
                <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                  65%
                </Typography>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>

        {/* Total Orders Card */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard color="#ff9800">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <StatCardIcon bgcolor="#ff9800">
                  <OrderIcon />
                </StatCardIcon>
                <PercentageChip 
                  icon={<ArrowDownIcon fontSize="small" />} 
                  label="-2.8%" 
                  size="small" 
                  trend="down"
                />
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                {dashboardData.totalOrders.toLocaleString()}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                  Total Orders
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <LinearProgress 
                  variant="determinate" 
                  value={82} 
                  sx={{ 
                    flexGrow: 1, 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: 'rgba(255, 152, 0, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#ff9800'
                    }
                  }} 
                />
                <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                  82%
                </Typography>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>

        {/* Total Sales Card */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard color="#f44336">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <StatCardIcon bgcolor="#f44336">
                  <SalesIcon />
                </StatCardIcon>
                <PercentageChip 
                  icon={<ArrowUpIcon fontSize="small" />} 
                  label="+15.3%" 
                  size="small" 
                  trend="up"
                />
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                ${dashboardData.totalSales.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                  Total Sales
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <LinearProgress 
                  variant="determinate" 
                  value={90} 
                  sx={{ 
                    flexGrow: 1, 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: 'rgba(244, 67, 54, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#f44336'
                    }
                  }} 
                />
                <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                  90%
                </Typography>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Chart and Pending Actions */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            height: '100%', 
            boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)', 
            borderRadius: 3,
            overflow: 'hidden' 
          }}>
            <CardContent sx={{ p: 0, height: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange}
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{ px: 2 }}
                >
                  <Tab label="Weekly Sales" icon={<TimelineIcon />} iconPosition="start" />
                  <Tab label="Monthly" />
                  <Tab label="Yearly" />
                </Tabs>
              </Box>
              
              <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 'calc(100% - 48px)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">Sales Overview</Typography>
                  <IconButton size="small">
                    <MoreIcon />
                  </IconButton>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                  {/* Insert Chart Here - If not using chart libraries, use the following placeholder */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      width: '100%', 
                      height: 300, 
                      backgroundColor: 'rgba(0,0,0,0.02)', 
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 2
                    }}
                  >
                    <Box textAlign="center">
                      <TimelineIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                      <Typography variant="body2" color="textSecondary">
                        Chart would display here when using a chart library like recharts
                      </Typography>
                    </Box>
                  </Paper>
                  
                  {/* Uncomment to use actual chart when chart libraries are available
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.salesData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  */}
              </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            height: '100%', 
            boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)', 
            borderRadius: 3 
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Pending Actions
                </Typography>
                <Chip icon={<WarningIcon />} label="Action needed" size="small" color="warning" />
              </Box>
              
              <List sx={{ width: '100%' }}>
                <ListItem 
                  sx={{ 
                    mb: 2, 
                    backgroundColor: 'rgba(63, 81, 181, 0.05)', 
                    borderRadius: 2,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateX(5px)',
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'rgba(63, 81, 181, 0.8)' }}>
                      <VerificationIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Seller Verifications"
                    secondary={`${dashboardData.pendingVerifications} pending requests`}
                  />
                  <ListItemSecondaryAction>
                    <Button 
                      variant="contained" 
                      size="small" 
                      color="primary"
                      href="/admin/seller-verification"
                    >
                      Review
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem 
                  sx={{ 
                    mb: 2, 
                    backgroundColor: 'rgba(76, 175, 80, 0.05)', 
                    borderRadius: 2,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateX(5px)',
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'rgba(76, 175, 80, 0.8)' }}>
                      <HotelIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Hotel Verifications"
                    secondary={`${dashboardData.pendingHotels} pending approvals`}
                  />
                  <ListItemSecondaryAction>
                    <Button 
                      variant="contained" 
                      size="small" 
                      color="success"
                      href="/admin/hotel-verification"
                    >
                      Approve
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem 
                  sx={{ 
                    backgroundColor: 'rgba(244, 67, 54, 0.05)', 
                    borderRadius: 2,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateX(5px)',
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'rgba(244, 67, 54, 0.8)' }}>
                      <OrderIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Urgent Orders"
                    secondary="5 orders need attention"
                  />
                  <ListItemSecondaryAction>
                    <Button 
                      variant="contained" 
                      size="small" 
                      color="error"
                      href="/admin/orders"
                    >
                      Process
                </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Orders */}
      <Card 
        sx={{ 
          mt: 3, 
          boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)', 
          borderRadius: 3 
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">
          Recent Orders
        </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              href="/admin/orders"
              endIcon={<ArrowUpIcon sx={{ transform: 'rotate(45deg)' }} />}
            >
              View All
            </Button>
          </Box>
          
            {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
            <Stack spacing={2}>
              {dashboardData.recentOrders.map((order) => (
                <Paper 
                  key={order._id}
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.04)',
                    }
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Box display="flex" alignItems="center">
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            mr: 1, 
                            bgcolor: 'primary.main'
                          }}
                        >
                          {order.user.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {order.user.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            #{order._id.slice(-6)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="textSecondary">
                        Date
                    </Typography>
                    <Typography variant="body2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <Typography variant="body2" color="textSecondary">
                        Amount
                    </Typography>
                      <Typography variant="body2" fontWeight="bold">
                      ${order.totalPrice.toFixed(2)}
                    </Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <Chip 
                        label={order.status} 
                        color={getStatusChipColor(order.status)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={1} sx={{ textAlign: 'right' }}>
                      <IconButton size="small" color="primary">
                        <MoreIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Box 
              sx={{ 
                p: 4, 
                textAlign: 'center', 
                backgroundColor: 'rgba(0,0,0,0.02)', 
                borderRadius: 2 
              }}
            >
              <Typography variant="body1" color="textSecondary">
                No recent orders found.
              </Typography>
            </Box>
          )}
          </CardContent>
        </Card>
    </Box>
  );
};

export default Dashboard; 