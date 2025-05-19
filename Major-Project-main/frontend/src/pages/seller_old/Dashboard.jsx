import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  useTheme,
  Button,
  Avatar,
  Divider,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Chip,
  Badge,
  Tooltip,
  CircularProgress,
  LinearProgress,
  Stack,
  useMediaQuery
} from '@mui/material';
import { 
  MonetizationOnOutlined,
  ShoppingCartOutlined,
  AccountBalanceWalletOutlined,
  InventoryOutlined,
  TrendingUpOutlined,
  ArrowUpward,
  ArrowDownward,
  MoreVert as MoreVertIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  DonutLarge as DonutLargeIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  ShoppingBasket as ShoppingBasketIcon,
  LocalShipping as LocalShippingIcon,
  AccessTime as AccessTimeIcon,
  NoteAdd as NoteAddIcon,
  Dashboard as DashboardIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
  ShoppingBag as ShoppingBagIcon,
  Inventory2 as InventoryIcon,
  AttachMoney as AttachMoneyIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { useThemeMode } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import * as dashboardService from '../../services/dashboardService';
import * as productService from '../../services/productService';
import * as orderService from '../../services/orderService';
import * as urgentSaleService from '../../services/urgentSaleService';

// StatCard component for the dashboard stats
const StatCard = ({ title, value, icon, color, change, isLoading }) => {
  const { mode } = useThemeMode();
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:960px)');
  const isPositiveChange = parseFloat(change) >= 0;
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        background: mode === 'dark' ? 'rgba(26, 32, 53, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(229, 231, 235, 0.8)'}`,
      }}
    >
      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={30} sx={{ mb: 2 }} />
          <Typography color="text.secondary" variant="body2">
            Loading...
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography color="text.secondary" variant="body2" sx={{ fontSize: '0.9rem' }}>
                {title}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 0.5, fontSize: '1.8rem' }}>
                {value}
              </Typography>
            </Box>
            <Box
              sx={{
                background: `${color}20`, // 20% opacity of the color
                borderRadius: '50%',
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color
              }}
            >
              {icon}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
            {isPositiveChange ? (
              <ArrowUpward sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
            ) : (
              <ArrowDownward sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
            )}
            <Typography 
              variant="body2" 
              sx={{ 
                color: isPositiveChange ? 'success.main' : 'error.main',
                fontWeight: 500  
              }}
            >
              {isPositiveChange ? '+' : ''}{change}%
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1, fontSize: '0.8rem' }}>
              from last week
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
};

// QuickAction component for dashboard actions
const QuickAction = ({ title, icon, color, onClick }) => {
  const { mode } = useThemeMode();
  const isMobile = useMediaQuery('(max-width:600px)');
  
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        cursor: 'pointer',
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        background: mode === 'dark' ? 'rgba(26, 32, 53, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(229, 231, 235, 0.8)'}`,
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        }
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          bgcolor: `${color}20`,
          color: color,
          borderRadius: '50%',
          width: 50,
          height: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.5,
        }}
      >
        {icon}
      </Box>
      <Typography variant="body2" fontWeight={500} color="text.primary">
        {title}
      </Typography>
    </Paper>
  );
};

// NotificationItem component for the notification center
const NotificationItem = ({ type, message, time }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'error':
        return <CancelIcon sx={{ color: 'error.main' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      default:
        return <NotificationsIcon sx={{ color: 'info.main' }} />;
    }
  };
  
  return (
    <ListItem alignItems="flex-start" sx={{ px: 2, py: 1.5 }}>
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'transparent' }}>
          {getIcon()}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={message}
        secondary={time}
        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
        secondaryTypographyProps={{ variant: 'caption' }}
      />
    </ListItem>
  );
};

// Product status card for inventory overview
const ProductStatusCard = ({ status, count, color, icon }) => {
  const { mode } = useThemeMode();
  
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
        borderRadius: 2,
        background: mode === 'dark' ? 'rgba(26, 32, 53, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(229, 231, 235, 0.8)'}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      <Box
        sx={{
          bgcolor: `${color}20`,
          color: color,
          borderRadius: '50%',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 2,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {status}
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          {count}
        </Typography>
      </Box>
    </Box>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:960px)');
  
  // Add new state variables for dashboard data
  const [salesData, setSalesData] = useState([]);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    processing: 0,
    weeklyChange: '0.0'
  });
  const [productStats, setProductStats] = useState({
    total: 0,
    active: 0,
    lowStock: 0,
    outOfStock: 0,
    weeklyChange: '0.0'
  });
  const [revenueStats, setRevenueStats] = useState({
    total: '₹0',
    thisWeek: '₹0',
    lastWeek: '₹0',
    weeklyChange: '0.0'
  });
  const [inventoryData, setInventoryData] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refresh data function
  const refreshData = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch main dashboard data
      const dashboardData = await dashboardService.getSellerDashboard();
      
      console.log("Dashboard API response:", dashboardData);
      
      if (dashboardData && dashboardData.data) {
        const data = dashboardData.data;
        console.log("Dashboard data structure:", data);
        
        // Update order stats
        setOrderStats({
          total: data.orderStats?.totalOrders || 0,
          completed: data.orderStats?.completedOrders || 0,
          pending: data.orderStats?.pendingOrders || 0,
          processing: data.orderStats?.processingOrders || 0,
          weeklyChange: data.orderStats?.weeklyChange || '0.0'
        });
        
        // Update product stats
        setProductStats({
          total: data.productStats?.totalProducts || 0,
          active: data.productStats?.activeProducts || 0,
          lowStock: data.productStats?.lowStockProducts || 0,
          outOfStock: data.productStats?.outOfStockProducts || 0,
          weeklyChange: data.productStats?.weeklyChange || '0.0'
        });
        
        // Fix for missing revenueStats
        // Check if we have orderStats with totalRevenue instead
        const hasOrderRevenue = data.orderStats && typeof data.orderStats.totalRevenue !== 'undefined';
        
        // Update revenue stats
        setRevenueStats({
          total: (data.revenueStats?.totalRevenue || (hasOrderRevenue ? data.orderStats.totalRevenue : 0)) || 0,
          thisMonth: data.revenueStats?.thisMonthRevenue || 0,
          lastMonth: data.revenueStats?.lastMonthRevenue || 0,
          pendingPayouts: data.revenueStats?.pendingPayouts || 0,
          monthlyChange: data.revenueStats?.monthlyChange || '0.0'
        });
        
        // Update inventory data
        if (data.inventoryData && data.inventoryData.categories) {
          setInventoryData(data.inventoryData.categories);
        }
        
        // Update top selling items
        if (data.topSellingProducts) {
          setTopSellingItems(data.topSellingProducts);
        }
        
        // Update recent orders
        if (data.recentOrders) {
          setRecentOrders(data.recentOrders);
        }
        
        // Update weekly sales data
        if (data.weeklySales) {
          setSalesData(data.weeklySales);
        }
        
        // Update notifications
        if (data.notifications) {
          setNotifications(data.notifications);
        }
        
        // Update error state
        setError(null);
      } else {
        throw new Error('Invalid response data format');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
      
      // Set default values for required data
      setOrderStats({
        total: 0,
        completed: 0, 
        pending: 0,
        processing: 0,
        weeklyChange: '0.0'
      });
      
      setProductStats({
        total: 0,
        active: 0,
        lowStock: 0,
        outOfStock: 0,
        weeklyChange: '0.0'
      });
      
      setRevenueStats({
        total: 0,
        thisMonth: 0,
        lastMonth: 0,
        pendingPayouts: 0,
        monthlyChange: '0.0'
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Helper function to format date relative to current time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  // Colors for the progress bars and charts
  const colors = ['#6366F1', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];
  const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6'];

  // Handle quick action clicks
  const handleQuickAction = (action) => {
    switch (action) {
      case 'add-product':
        navigate('/seller/products/add');
        break;
      case 'view-orders':
        navigate('/seller/orders');
        break;
      case 'urgent-sale':
        navigate('/seller/urgent-sales');
        break;
      case 'inventory':
        navigate('/seller/products');
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'success';
      case 'processing':
        return 'info';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingBagIcon sx={{ color: '#5c6bc0' }} />;
      case 'inventory':
        return <InventoryIcon sx={{ color: '#ffb74d' }} />;
      case 'payment':
        return <AttachMoneyIcon sx={{ color: '#66bb6a' }} />;
      case 'customer':
        return <PersonAddIcon sx={{ color: '#4fc3f7' }} />;
      default:
        return <NotificationsIcon sx={{ color: '#9575cd' }} />;
    }
  };

  return (
    <Box sx={{ p: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: mode === 'dark' ? 'white' : '#1e293b' }}>
          Seller Dashboard
        </Typography>
        
        <Button 
          startIcon={<RefreshIcon />} 
          onClick={refreshData}
          disabled={refreshing}
          variant="outlined"
          size="small"
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            px: 2
          }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </Box>
      
      {/* Stats Grid */}
      <Grid container spacing={3.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={revenueStats.total}
            icon={<MonetizationOnOutlined />}
            color="#6366F1"
            change={revenueStats.monthlyChange}
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={orderStats.total}
            icon={<ShoppingCartOutlined />}
            color="#F59E0B"
            change={orderStats.weeklyChange}
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Sales"
            value={revenueStats.thisWeek}
            icon={<AccountBalanceWalletOutlined />}
            color="#10B981"
            change={revenueStats.monthlyChange}
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Orders"
            value={orderStats.pending}
            icon={<InventoryOutlined />}
            color="#EF4444"
            change={orderStats.weeklyChange}
            isLoading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: mode === 'dark' ? 'white' : '#1e293b' }}>
        Quick Actions
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <QuickAction
            title="Add Product"
            icon={<AddIcon />}
            color="#6366F1"
            onClick={() => handleQuickAction('add-product')}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <QuickAction
            title="View Orders"
            icon={<ShoppingBasketIcon />}
            color="#F59E0B"
            onClick={() => handleQuickAction('view-orders')}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <QuickAction
            title="Create Urgent Sale"
            icon={<LocalShippingIcon />}
            color="#10B981"
            onClick={() => handleQuickAction('urgent-sale')}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <QuickAction
            title="Manage Inventory"
            icon={<InventoryOutlined />}
            color="#8B5CF6"
            onClick={() => handleQuickAction('inventory')}
          />
        </Grid>
      </Grid>
      
      {/* Main Dashboard Content */}
      <Grid container spacing={3.5}>
        {/* Weekly Sales Chart */}
        <Grid item xs={12} lg={8}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2.5, 
              borderRadius: 3, 
              height: '100%', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              background: mode === 'dark' ? 'rgba(26, 32, 53, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(229, 231, 235, 0.8)'}`,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: mode === 'dark' ? 'white' : '#1e293b' }}>
                Weekly Sales
              </Typography>
              
              <Stack direction="row" spacing={1}>
                <Chip 
                  label="This Week" 
                  color="primary" 
                  size="small" 
                  variant="filled" 
                  sx={{ borderRadius: 1 }} 
                />
                <Chip 
                  label="Last Week" 
                  size="small" 
                  variant="outlined" 
                  sx={{ borderRadius: 1 }} 
                />
              </Stack>
            </Box>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      vertical={false} 
                      stroke={mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                    />
                    <XAxis 
                      dataKey="day" 
                      stroke={mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
                    />
                    <YAxis 
                      tickFormatter={(value) => `₹${value}`}
                      stroke={mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
                    />
                    <RechartsTooltip 
                      formatter={(value) => [`₹${value}`, 'Sales']}
                      contentStyle={{ 
                        backgroundColor: mode === 'dark' ? '#1e293b' : 'white',
                        border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="sales" 
                      fill="#6366F1" 
                      radius={[4, 4, 0, 0]} 
                      barSize={30}
                      name="Sales Amount"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Top Selling Items */}
        <Grid item xs={12} lg={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2.5, 
              borderRadius: 3, 
              height: '100%', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              background: mode === 'dark' ? 'rgba(26, 32, 53, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(229, 231, 235, 0.8)'}`,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600, color: mode === 'dark' ? 'white' : '#1e293b' }}>
              Top Selling Items
            </Typography>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {topSellingItems.map((item, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography 
                        variant="body1" 
                        fontWeight={500} 
                        color={mode === 'dark' ? 'white' : '#1e293b'}
                        sx={{ maxWidth: '70%' }}
                      >
                        {item.name}
                      </Typography>
                      <Box 
                        component="span"
                        sx={{ 
                          backgroundColor: `${colors[index % colors.length]}15`,
                          color: colors[index % colors.length],
                          fontWeight: 500,
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}
                      >
                        {item.sales} sales
                      </Box>
                    </Box>
                    <Box 
                      sx={{ 
                        height: 6, 
                        bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(229, 231, 235, 0.5)',
                        borderRadius: 3,
                        mb: 0.5,
                        mt: 1,
                        overflow: 'hidden'
                      }}
                    >
                      <Box 
                        sx={{ 
                          height: '100%', 
                          width: `${item.percentage}%`, 
                          bgcolor: colors[index % colors.length],
                          borderRadius: 3
                        }} 
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <ArrowUpward sx={{ color: 'success.main', fontSize: 14, mr: 0.5 }} />
                      <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                        +{Math.floor(Math.random() * 10) + 1}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontSize: '0.7rem' }}>
                        from last week
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Orders */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 3, 
              height: '100%', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              background: mode === 'dark' ? 'rgba(26, 32, 53, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(229, 231, 235, 0.8)'}`,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ 
              p: 2.5, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}` 
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: mode === 'dark' ? 'white' : '#1e293b' }}>
                Recent Orders
              </Typography>
              
              <Button 
                variant="text" 
                size="small"
                sx={{ 
                  textTransform: 'none',
                  fontSize: '0.8rem'
                }}
                onClick={() => navigate('/seller/orders')}
              >
                View All
              </Button>
            </Box>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List sx={{ p: 0, flexGrow: 1, overflow: 'auto' }}>
                {recentOrders.map((order, index) => (
                  <React.Fragment key={order.id}>
                    <ListItem 
                      alignItems="flex-start" 
                      sx={{ 
                        px: 2.5, 
                        py: 2,
                        '&:hover': { 
                          bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' 
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'primary.main',
                            width: 40,
                            height: 40,
                            fontSize: '0.9rem'
                          }}
                        >
                          {order.customer.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              color: mode === 'dark' ? 'white' : 'inherit'
                            }}
                          >
                            {order.customer}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ mr: 1 }}
                              >
                                {order.id}
                              </Typography>
                              <Typography variant="caption" color="primary.main">
                                {order.amount}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  mr: 1
                                }}
                              >
                                <AccessTimeIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                                {order.date}
                              </Typography>
                              <Chip
                                label={order.status}
                                size="small"
                                color={getStatusColor(order.status)}
                                sx={{ 
                                  height: 20, 
                                  fontSize: '0.65rem', 
                                  '& .MuiChip-label': { px: 1 } 
                                }}
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentOrders.length - 1 && (
                      <Divider 
                        variant="inset" 
                        component="li" 
                        sx={{ 
                          borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                        }} 
                      />
                    )}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        
        {/* Notification Center */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 3, 
              height: '100%', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              background: mode === 'dark' ? 'rgba(26, 32, 53, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(229, 231, 235, 0.8)'}`,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ 
              p: 2.5, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}` 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Badge badgeContent={notifications.length} color="error" sx={{ mr: 1 }}>
                  <NotificationsIcon color="action" />
                </Badge>
                <Typography variant="h6" sx={{ fontWeight: 600, color: mode === 'dark' ? 'white' : '#1e293b' }}>
                  Notifications
                </Typography>
              </Box>
              
              <Button 
                variant="text" 
                size="small"
                sx={{ 
                  textTransform: 'none',
                  fontSize: '0.8rem'
                }}
              >
                Mark All Read
              </Button>
            </Box>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List sx={{ p: 0, flexGrow: 1, overflow: 'auto' }}>
                {notifications.map((notification, index) => (
                  <React.Fragment key={index}>
                    <NotificationItem 
                      type={notification.type} 
                      message={notification.message} 
                      time={notification.time} 
                    />
                    {index < notifications.length - 1 && (
                      <Divider 
                        variant="inset" 
                        component="li" 
                        sx={{ 
                          borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                        }} 
                      />
                    )}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        
        {/* Inventory Overview */}
        <Grid item xs={12} lg={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2.5, 
              borderRadius: 3, 
              height: '100%', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              background: mode === 'dark' ? 'rgba(26, 32, 53, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(229, 231, 235, 0.8)'}`,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600, color: mode === 'dark' ? 'white' : '#1e293b' }}>
              Inventory Overview
            </Typography>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <ProductStatusCard
                      status="In Stock Products"
                      count={productStats.active}
                      color="#10B981"
                      icon={<CheckCircleIcon />}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <ProductStatusCard
                      status="Low Stock Items"
                      count={productStats.lowStock}
                      color="#F59E0B"
                      icon={<WarningIcon />}
                    />
                  </Grid>
                </Grid>
                
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500, color: mode === 'dark' ? 'white' : '#1e293b' }}>
                  Inventory by Category
                </Typography>
                
                <Box sx={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={inventoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {inventoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value, name) => [`${value}%`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 