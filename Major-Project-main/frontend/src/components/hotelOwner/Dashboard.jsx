import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Divider, Chip, Tooltip, Button, IconButton } from '@mui/material';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  AppstoreOutlined, ShoppingCartOutlined, ShopOutlined, 
  UsergroupAddOutlined, ClockCircleOutlined,
  UserOutlined, StarOutlined, ReloadOutlined, DatabaseOutlined,
  CheckCircleOutlined, WarningOutlined
} from '@ant-design/icons';
import { 
  MonetizationOnOutlined,
  AccountBalanceWalletOutlined,
  InventoryOutlined,
  TrendingUpOutlined,
  AttachMoneyOutlined,
  BarChartOutlined,
  Refresh
} from '@mui/icons-material';
import WeeklySalesChart from './WeeklySalesChart';
import TopSellingItems from './TopSellingItems';
import RevenueStats from './RevenueStats';
import { getDashboardStats, getWeeklySalesData, getTopSellingItems } from '../../services/dashboardService.jsx';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';

// Define colors outside component to prevent recreating on each render
const COLORS = ['#6366f1', '#ef4444', '#3b82f6', '#f59e0b', '#10b981'];
const PIE_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#3b82f6', '#ef4444'];

const StatCard = ({ title, value, icon, color, percentChange = null }) => {
  const isPositive = percentChange === null || percentChange >= 0;
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(229, 231, 235, 1)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography color="text.secondary" variant="body2">
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 0.5 }}>
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
          }}
        >
          {icon}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
        {percentChange !== null && (
          <>
            {isPositive ? (
              <TrendingUpOutlined sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
            ) : (
              <TrendingDownOutlined sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
            )}
            <Typography 
              variant="body2" 
              color={isPositive ? 'success.main' : 'error.main'}
            >
              {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              vs previous period
            </Typography>
          </>
        )}
      </Box>
    </Paper>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [weeklySales, setWeeklySales] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate percentage changes
  const calculatePercentChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching dashboard data...');
      
      // Fetch dashboard stats
      const statsData = await getDashboardStats();
      console.log('Dashboard stats:', statsData);
      
      // Ensure we have a valid stats object
      if (statsData) {
        setStats(statsData);
        
        // Weekly sales data should be in the stats
        if (statsData.weeklySales && Array.isArray(statsData.weeklySales)) {
          console.log('Setting weekly sales data from stats:', statsData.weeklySales);
          setWeeklySales(statsData.weeklySales);
        } else {
          console.log('No weekly sales data in stats, setting empty array');
          setWeeklySales([]);
        }
        
        // Top selling items should be in the stats
        if (statsData.topSellingItems && Array.isArray(statsData.topSellingItems)) {
          console.log('Setting top selling items from stats:', statsData.topSellingItems);
          setTopSellingItems(statsData.topSellingItems);
        } else {
          console.log('No top selling items in stats, setting empty array');
          setTopSellingItems([]);
        }
      } else {
        console.error('Invalid stats data received');
        setError('Failed to fetch dashboard data. Invalid response received.');
        setWeeklySales([]);
        setTopSellingItems([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard data. Please try again later.');
      setLoading(false);
      setWeeklySales([]);
      setTopSellingItems([]);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleRefresh} 
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  // Calculate percentage changes
  const revenueChange = calculatePercentChange(
    stats?.totalRevenue || 0, 
    stats?.previousRevenue || 0
  );
  
  const ordersChange = calculatePercentChange(
    stats?.totalOrders || 0, 
    stats?.previousOrdersCount || 0
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Hotel Dashboard
        </Typography>
        <Tooltip title="Refresh data">
          <IconButton onClick={handleRefresh} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : <Refresh />}
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats?.totalRevenue || 0)}
            icon={<MonetizationOnOutlined sx={{ color: '#6366F1' }} />}
            color="#6366F1"
            percentChange={revenueChange}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={stats?.ordersCount?.toLocaleString() || '0'}
            icon={<ShoppingCartOutlined sx={{ color: '#F59E0B' }} />}
            color="#F59E0B"
            percentChange={ordersChange}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Sales"
            value={formatCurrency(stats?.monthlySales || 0)}
            icon={<AccountBalanceWalletOutlined sx={{ color: '#10B981' }} />}
            color="#10B981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Orders"
            value={stats?.pendingOrders?.toLocaleString() || '0'}
            icon={<InventoryOutlined sx={{ color: '#EF4444' }} />}
            color="#EF4444"
          />
        </Grid>
      </Grid>
      
      {/* Charts Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <WeeklySalesChart salesData={weeklySales} loading={loading} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TopSellingItems items={topSellingItems} loading={loading} />
        </Grid>
      </Grid>
      
      {/* Revenue Stats Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <RevenueStats 
            stats={{
              totalRevenue: stats?.totalRevenue || 0,
              todayRevenue: stats?.todayRevenue || 0,
              ordersCount: stats?.ordersCount || 0,
              todayOrdersCount: stats?.todayOrdersCount || 0,
              previousRevenue: stats?.previousRevenue || 0,
              previousOrdersCount: stats?.previousOrdersCount || 0
            }} 
            loading={loading} 
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default React.memo(Dashboard);
