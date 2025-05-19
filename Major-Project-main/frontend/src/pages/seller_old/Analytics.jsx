import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  Tab, 
  Tabs, 
  Button, 
  Divider, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel,
  Stack,
  useTheme,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon,
  CalendarToday as CalendarTodayIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Star as StarIcon,
  FilterAlt as FilterAltIcon,
  ExpandMore as ExpandMoreIcon,
  InsertChart as InsertChartIcon,
  MapOutlined as MapOutlinedIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  DataSaverOff as DataSaverOffIcon
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { useThemeMode } from '../../context/ThemeContext';
// Import analytics service
import * as analyticsService from '../../services/analyticsService';
import * as dashboardService from '../../services/dashboardService';

// Hide the dashboard title in the header through CSS
// Add this style at the top of the file
const styles = {
  hideDuplicateTitle: {
    '& .dashboard-title': {
      display: 'none'
    }
  }
};

// Metric card component
const MetricCard = ({ title, value, change, icon, color, secondaryValue }) => {
  const { mode } = useThemeMode();
  const isPositive = change >= 0;
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        height: '100%',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        background: mode === 'dark' ? 'rgba(26, 32, 53, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(229, 231, 235, 0.8)'}`,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography color="text.secondary" variant="body2">
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 0.5, color: mode === 'dark' ? 'white' : 'inherit' }}>
            {value}
          </Typography>
          {secondaryValue && (
            <Typography variant="caption" color="text.secondary">
              {secondaryValue}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            background: `${color}20`,
            borderRadius: '50%',
            p: 1.2,
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
        {isPositive ? (
          <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
        ) : (
          <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
        )}
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500, 
            color: isPositive ? 'success.main' : 'error.main' 
          }}
        >
          {isPositive ? '+' : ''}{change}%
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1, fontSize: '0.8rem' }}>
          from last period
        </Typography>
      </Box>
    </Paper>
  );
};

const Analytics = () => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const [timeframe, setTimeframe] = useState('month');
  const [tabValue, setTabValue] = useState(0);
  const [chartType, setChartType] = useState('line');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for analytics data
  const [salesData, setSalesData] = useState([]);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    change: 0
  });
  const [productStats, setProductStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
    lowStockProducts: 0
  });
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customerData, setCustomerData] = useState([
    { name: 'New', value: 35 },
    { name: 'Returning', value: 65 },
  ]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch dashboard data
        const dashboardResponse = await dashboardService.getSellerDashboard();
        console.log('Dashboard data:', dashboardResponse);
        
        if (dashboardResponse && dashboardResponse.data) {
          const dashData = dashboardResponse.data;
          
          // Update order stats from dashboard data
          setOrderStats({
            totalOrders: dashData.orderStats?.totalOrders || 0,
            totalRevenue: dashData.orderStats?.totalRevenue || 0,
            averageOrderValue: dashData.orderStats?.totalOrders > 0 
              ? (dashData.orderStats.totalRevenue / dashData.orderStats.totalOrders).toFixed(2) 
              : 0,
            change: dashData.orderStats?.revenueChange || 0
          });
          
          // Update product stats
          setProductStats({
            totalProducts: dashData.productStats?.totalProducts || 0,
            activeProducts: dashData.productStats?.activeProducts || 0,
            outOfStockProducts: dashData.productStats?.outOfStockProducts || 0,
            lowStockProducts: dashData.productStats?.lowStockProducts || 0
          });
          
          // Get category data
          if (dashData.productStats?.productsByCategory) {
            setCategoryData(dashData.productStats.productsByCategory.map(cat => ({
              name: cat.name || 'Other',
              value: cat.count || 0
            })));
          } else {
            // Fallback category data
            setCategoryData([
              { name: 'Vegetables', value: 35 },
              { name: 'Fruits', value: 30 },
              { name: 'Dairy', value: 20 },
              { name: 'Herbs', value: 15 }
            ]);
          }
          
          // Get top products
          if (dashData.topSellingProducts && dashData.topSellingProducts.length > 0) {
            setTopProducts(dashData.topSellingProducts.map(product => ({
              name: product.name || 'Product',
              sales: product.salesCount || 0,
              revenue: product.price * (product.salesCount || 0)
            })));
          } else {
            // Fallback top products data
            setTopProducts([
              { name: 'Fresh Tomatoes', sales: 124, revenue: 9300 },
              { name: 'Organic Spinach', sales: 98, revenue: 7840 },
              { name: 'Bell Peppers', sales: 82, revenue: 6560 },
              { name: 'Sweet Potatoes', sales: 70, revenue: 5600 },
              { name: 'Carrots', sales: 65, revenue: 3900 }
            ]);
          }
        }
        
        try {
          // Fetch sales data with a timeout
          const salesPromise = dashboardService.getSalesData(timeframe);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Sales data request timed out')), 8000)
          );
          
          const salesResponse = await Promise.race([salesPromise, timeoutPromise]);
          console.log('Sales data:', salesResponse);
          
          if (salesResponse && salesResponse.data) {
            // Format the sales data for the chart
            const formattedSalesData = salesResponse.data.map(item => ({
              date: `Day ${item.day}`,
              revenue: item.amount,
              orders: Math.round(item.amount / 100), // Approximation for visualization
              profit: Math.round(item.amount * 0.7) // Approximation for visualization
            }));
            
            setSalesData(formattedSalesData);
          }
        } catch (salesError) {
          console.error('Error fetching sales data:', salesError);
          // Use fallback sales data
          setSalesData(generateFallbackSalesData(timeframe));
        }

        try {
          // Fetch additional analytics if available
          const analyticsResponse = await analyticsService.getProductPerformance();
          console.log('Product performance:', analyticsResponse);
          
          // If available, update with more accurate data
          if (analyticsResponse && analyticsResponse.productStats) {
            setProductStats(prev => ({
              ...prev,
              ...analyticsResponse.productStats
            }));
          }
          
          if (analyticsResponse && analyticsResponse.categoryDistribution) {
            setCategoryData(analyticsResponse.categoryDistribution.map(cat => ({
              name: cat._id || 'Other',
              value: cat.count || 1
            })));
          }
          
          if (analyticsResponse && analyticsResponse.topSellingProducts) {
            setTopProducts(analyticsResponse.topSellingProducts.map(product => ({
              name: product.name || 'Product',
              sales: product.totalSold || 0,
              revenue: product.totalRevenue || 0
            })));
          }
        } catch (analyticsError) {
          console.error('Error fetching product analytics:', analyticsError);
          // Already using dashboard data if analytics fail, no action needed
        }
        
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Using fallback display data.');
        
        // Use fallback data for everything if main dashboard data fails
        setSalesData(generateFallbackSalesData(timeframe));
        setOrderStats({
          totalOrders: 45,
          totalRevenue: 32500,
          averageOrderValue: 722.22,
          change: 12.5
        });
        setProductStats({
          totalProducts: 36,
          activeProducts: 30,
          outOfStockProducts: 2,
          lowStockProducts: 4
        });
        setCategoryData([
          { name: 'Vegetables', value: 35 },
          { name: 'Fruits', value: 30 },
          { name: 'Dairy', value: 20 },
          { name: 'Herbs', value: 15 }
        ]);
        setTopProducts([
          { name: 'Fresh Tomatoes', sales: 124, revenue: 9300 },
          { name: 'Organic Spinach', sales: 98, revenue: 7840 },
          { name: 'Bell Peppers', sales: 82, revenue: 6560 },
          { name: 'Sweet Potatoes', sales: 70, revenue: 5600 },
          { name: 'Carrots', sales: 65, revenue: 3900 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [timeframe]);

  // Generate fallback sales data
  const generateFallbackSalesData = (period) => {
    let days = 7;
    let dateFormat = 'Day';
    
    switch(period) {
      case 'day':
        days = 24; // Hours in a day
        dateFormat = 'Hour';
        break;
      case 'week':
        days = 7;
        dateFormat = 'Day';
        break;
      case 'month':
        days = 30;
        dateFormat = 'Day';
        break;
      case 'quarter':
        days = 12;
        dateFormat = 'Week';
        break;
      case 'year':
        days = 12;
        dateFormat = 'Month';
        break;
      default:
        days = 7;
    }
    
    // Month names for year view
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    return Array.from({ length: days }, (_, i) => {
      // Base revenue that varies by day of week
      const baseRevenue = 1000 + Math.floor(Math.random() * 4000);
      // More sales on weekends (assuming days 5-6 are weekends)
      const weekendMultiplier = period === 'week' && (i === 5 || i === 6) ? 1.5 : 1;
      // Seasonal variations for year view
      const seasonalMultiplier = period === 'year' ? (i >= 5 && i <= 8 ? 1.3 : 1) : 1;
      
      const revenue = Math.floor(baseRevenue * weekendMultiplier * seasonalMultiplier);
      const orders = Math.floor(revenue / (500 + Math.random() * 300));
      
      return {
        date: period === 'year' ? monthNames[i] : `${dateFormat} ${i + 1}`,
        revenue: revenue,
        orders: orders,
        profit: Math.floor(revenue * 0.7)
      };
    });
  };

  // Colors for charts
  const COLORS = ['#6366F1', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#EC4899'];

  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Format currency
  const formatCurrency = (value) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  return (
    <Box className="analytics-page-wrapper">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: mode === 'dark' ? 'white' : '#1e293b' }}>
          Analytics Dashboard
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="timeframe-select-label">Timeframe</InputLabel>
            <Select
              labelId="timeframe-select-label"
              id="timeframe-select"
              value={timeframe}
              label="Timeframe"
              onChange={handleTimeframeChange}
            >
              <MenuItem value="day">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            startIcon={<CalendarTodayIcon />}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
            }}
          >
            Custom Range
          </Button>
        </Stack>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Metric Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Total Revenue"
                value={formatCurrency(orderStats.totalRevenue)}
                change={parseFloat(orderStats.change) || 0}
                icon={<InsertChartIcon />}
                color="#6366F1"
                secondaryValue="Based on recent orders"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Total Orders"
                value={orderStats.totalOrders}
                change={8.3} // Could be calculated if you have historical data
                icon={<TrendingUpIcon />}
                color="#F59E0B"
                secondaryValue="Complete orders"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Avg. Order Value"
                value={formatCurrency(parseFloat(orderStats.averageOrderValue))}
                change={3.2} // Could be calculated if you have historical data
                icon={<DataSaverOffIcon />}
                color="#10B981"
                secondaryValue="Per order average"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Active Products"
                value={productStats.activeProducts}
                change={productStats.lowStockProducts > 0 ? -1 * (productStats.lowStockProducts / productStats.totalProducts * 100).toFixed(1) : 0}
                icon={<StarIcon />}
                color="#EF4444"
                secondaryValue={`${productStats.lowStockProducts} low stock`}
              />
            </Grid>
          </Grid>
          
          {/* Tab navigation for different analytics views */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  mx: 1,
                  '&:first-of-type': { ml: 0 },
                  color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                },
                '& .Mui-selected': {
                  color: mode === 'dark' ? 'white' : '#1e293b',
                  fontWeight: 600,
                },
              }}
            >
              <Tab label="Sales Overview" icon={<TrendingUpIcon />} iconPosition="start" />
              <Tab label="Product Performance" icon={<BarChartIcon />} iconPosition="start" />
              <Tab label="Customer Analytics" icon={<PersonIcon />} iconPosition="start" />
              <Tab label="Geographic Analysis" icon={<MapOutlinedIcon />} iconPosition="start" />
            </Tabs>
          </Box>
          
          {/* Sales Overview Tab Content */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              {/* Main Revenue Chart */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                    background: mode === 'dark' ? 'rgba(26, 32, 53, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(229, 231, 235, 0.8)'}`,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: mode === 'dark' ? 'white' : '#1e293b' }}>
                      Revenue Trends
                    </Typography>
                    
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant={chartType === 'line' ? 'contained' : 'outlined'}
                        onClick={() => setChartType('line')}
                        startIcon={<TimelineIcon fontSize="small" />}
                        sx={{ 
                          borderRadius: 1.5, 
                          textTransform: 'none',
                          py: 0.5,
                          px: 1.5
                        }}
                      >
                        Line
                      </Button>
                      <Button
                        size="small"
                        variant={chartType === 'bar' ? 'contained' : 'outlined'}
                        onClick={() => setChartType('bar')}
                        startIcon={<BarChartIcon fontSize="small" />}
                        sx={{ 
                          borderRadius: 1.5, 
                          textTransform: 'none',
                          py: 0.5,
                          px: 1.5
                        }}
                      >
                        Bar
                      </Button>
                    </Stack>
                  </Box>
                  
                  <Box sx={{ height: 370, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'line' ? (
                        <LineChart
                          data={salesData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                        >
                          <CartesianGrid 
                            strokeDasharray="3 3" 
                            vertical={false} 
                            stroke={mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} 
                          />
                          <XAxis 
                            dataKey="date" 
                            stroke={mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'} 
                          />
                          <YAxis 
                            stroke={mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
                            tickFormatter={(value) => `₹${value}`}
                          />
                          <RechartsTooltip 
                            formatter={(value, name) => {
                              if (name === 'revenue') return [`₹${value}`, 'Revenue'];
                              if (name === 'profit') return [`₹${value}`, 'Profit'];
                              return [value, name];
                            }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            name="Revenue" 
                            stroke="#6366F1" 
                            strokeWidth={3}
                            activeDot={{ r: 8 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="profit" 
                            name="Profit" 
                            stroke="#10B981" 
                            strokeWidth={3}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      ) : (
                        <BarChart
                          data={salesData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                        >
                          <CartesianGrid 
                            strokeDasharray="3 3" 
                            vertical={false} 
                            stroke={mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} 
                          />
                          <XAxis 
                            dataKey="date" 
                            stroke={mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'} 
                          />
                          <YAxis 
                            stroke={mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
                            tickFormatter={(value) => `₹${value}`}
                          />
                          <RechartsTooltip 
                            formatter={(value, name) => {
                              if (name === 'revenue') return [`₹${value}`, 'Revenue'];
                              if (name === 'profit') return [`₹${value}`, 'Profit'];
                              return [value, name];
                            }}
                          />
                          <Legend />
                          <Bar 
                            dataKey="revenue" 
                            name="Revenue" 
                            fill="#6366F1" 
                            radius={[4, 4, 0, 0]} 
                            barSize={20}
                          />
                          <Bar 
                            dataKey="profit" 
                            name="Profit" 
                            fill="#10B981" 
                            radius={[4, 4, 0, 0]} 
                            barSize={20}
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
              
              {/* Sales by Category Pie Chart */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    height: '100%',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                    background: mode === 'dark' ? 'rgba(26, 32, 53, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(229, 231, 235, 0.8)'}`,
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: mode === 'dark' ? 'white' : '#1e293b' }}>
                    Sales by Category
                  </Typography>
                  
                  <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <RechartsTooltip 
                          formatter={(value, name, props) => [`${value}%`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
              
              {/* Top Selling Products */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    height: '100%',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                    background: mode === 'dark' ? 'rgba(26, 32, 53, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(229, 231, 235, 0.8)'}`,
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: mode === 'dark' ? 'white' : '#1e293b' }}>
                    Top Selling Products
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    {topProducts.map((product, index) => (
                      <Box key={index} sx={{ mb: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body1" fontWeight={500} color={mode === 'dark' ? 'white' : '#1e293b'}>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="primary">
                            ₹{product.revenue}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box
                            sx={{
                              height: 8,
                              bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(229, 231, 235, 0.5)',
                              borderRadius: 4,
                              width: '80%',
                              overflow: 'hidden'
                            }}
                          >
                            <Box
                              sx={{
                                height: '100%',
                                width: `${(product.sales / Math.max(...topProducts.map(p => p.sales))) * 100}%`,
                                bgcolor: COLORS[index % COLORS.length],
                                borderRadius: 4
                              }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {product.sales} units
                          </Typography>
                        </Box>

                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Placeholder for the other tabs */}
          {tabValue === 1 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Product Performance Analytics</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                In-depth analytics for product performance will be displayed here.
              </Typography>
            </Box>
          )}
          
          {tabValue === 2 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Customer Analytics</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                Customer behavior and demographics analytics will be displayed here.
              </Typography>
            </Box>
          )}
          
          {tabValue === 3 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Geographic Analysis</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                Sales data by region and location will be displayed here.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Analytics; 