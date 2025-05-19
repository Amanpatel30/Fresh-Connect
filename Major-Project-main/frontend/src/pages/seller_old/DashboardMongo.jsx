import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  useTheme,
  CircularProgress
} from '@mui/material';
import { 
  MonetizationOnOutlined,
  ShoppingCartOutlined,
  AccountBalanceWalletOutlined,
  InventoryOutlined,
  TrendingUpOutlined
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useThemeMode } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import * as dashboardService from '../../services/dashboardService';

// StatCard component for the dashboard stats
const StatCard = ({ title, value, icon, color, isLoading }) => {
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
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(229, 231, 235, 0.8)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography color="text.secondary" variant="body2" sx={{ fontSize: '0.9rem' }}>
            {title}
          </Typography>
          {isLoading ? (
            <CircularProgress size={24} sx={{ mt: 1 }} />
          ) : (
            <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 0.5, fontSize: '1.8rem' }}>
              {value}
            </Typography>
          )}
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
        <TrendingUpOutlined sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
        <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
          +4.75%
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1, fontSize: '0.8rem' }}>
          from last week
        </Typography>
      </Box>
    </Paper>
  );
};

const DashboardMongo = () => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    monthlySales: 0,
    pendingOrders: 0,
    weeklySalesData: [
      { day: 'Sunday', amount: 0 },
      { day: 'Monday', amount: 0 },
      { day: 'Tuesday', amount: 0 },
      { day: 'Wednesday', amount: 0 },
      { day: 'Thursday', amount: 0 },
      { day: 'Friday', amount: 0 },
      { day: 'Saturday', amount: 0 },
    ],
    topSellingItems: [
      { name: '3 Days Ago Special', sales: 6, percentage: 100 },
      { name: '5 Days Ago Package', sales: 5, percentage: 83 },
      { name: '2 Days Ago Package', sales: 4, percentage: 67 },
      { name: 'Yesterday\'s Meal', sales: 3, percentage: 50 },
      { name: 'Today\'s Special', sales: 2, percentage: 33 },
    ]
  });

  useEffect(() => {
    if (user?.token) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch dashboard data from MongoDB
      const result = await dashboardService.getSellerDashboard();
      
      if (result && result.data) {
        const { productStats, orderStats } = result.data;
        
        // Process sales data for the chart
        const weeklySalesData = orderStats?.salesByDay?.map(item => ({
          day: item._id,
          amount: item.totalAmount
        })) || dashboardData.weeklySalesData;
        
        // Process top selling products
        const topSellingItems = productStats?.topSellingProducts?.map(product => ({
          name: product.name,
          sales: product.salesCount,
          percentage: product.salesCount > 0 ? 
            Math.round((product.salesCount / Math.max(...productStats.topSellingProducts.map(p => p.salesCount))) * 100) : 0
        })) || dashboardData.topSellingItems;
        
        setDashboardData({
          totalRevenue: orderStats?.totalRevenue || 0,
          totalOrders: orderStats?.totalOrders || 0,
          monthlySales: orderStats?.monthlySales || 0,
          pendingOrders: orderStats?.pendingOrders || 0,
          weeklySalesData,
          topSellingItems
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Keep using the default data if fetch fails
    } finally {
      setIsLoading(false);
    }
  };

  // Colors for the progress bars
  const colors = ['#6366F1', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

  return (
    <Box sx={{ p: 0 }}>
      <Typography variant="h5" sx={{ mb: 3.5, fontWeight: 600, color: '#1e293b' }}>
        Dashboard (MongoDB)
      </Typography>
      
      {/* Stats Grid */}
      <Grid container spacing={3.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`$${dashboardData.totalRevenue.toFixed(2)}`}
            icon={<MonetizationOnOutlined />}
            color="#6366F1"
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={dashboardData.totalOrders}
            icon={<ShoppingCartOutlined />}
            color="#F59E0B"
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Sales"
            value={`$${dashboardData.monthlySales.toFixed(2)}`}
            icon={<AccountBalanceWalletOutlined />}
            color="#10B981"
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Orders"
            value={dashboardData.pendingOrders}
            icon={<InventoryOutlined />}
            color="#EF4444"
            isLoading={isLoading}
          />
        </Grid>
      </Grid>
      
      {/* Charts Section */}
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
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(229, 231, 235, 0.8)',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1e293b' }}>Weekly Sales</Typography>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.weeklySalesData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
                    <YAxis 
                      tickFormatter={(value) => `$${value}`}
                    />
                    <RechartsTooltip 
                      formatter={(value) => [`$${value}`, 'Sales']}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="#6366F1" 
                      radius={[4, 4, 0, 0]} 
                      barSize={30}
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
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(229, 231, 235, 0.8)',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600, color: '#1e293b' }}>Top Selling Items</Typography>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[1, 2, 3, 4, 5].map((_, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Box sx={{ width: '70%', height: 20, bgcolor: 'rgba(229, 231, 235, 0.5)', borderRadius: 1 }} />
                      <Box sx={{ width: '20%', height: 20, bgcolor: 'rgba(229, 231, 235, 0.5)', borderRadius: 1 }} />
                    </Box>
                    <Box 
                      sx={{ 
                        height: 6, 
                        bgcolor: 'rgba(229, 231, 235, 0.5)',
                        borderRadius: 3,
                        mb: 0.5,
                        mt: 1
                      }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {dashboardData.topSellingItems.map((item, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body1" fontWeight={500} color="#1e293b">{item.name}</Typography>
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
                        bgcolor: 'rgba(229, 231, 235, 0.5)',
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
                      <TrendingUpOutlined sx={{ color: 'success.main', fontSize: 14, mr: 0.5 }} />
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
      </Grid>
    </Box>
  );
};

export default DashboardMongo; 