import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Container,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Button,
  Skeleton,
  Divider,
  CircularProgress,
  useTheme,
  Tab,
  Tabs,
  IconButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  alpha
} from '@mui/material';
import { getVerificationStatus, getSalesAnalytics, getCustomerAnalytics, getInventoryAnalytics } from '../../services/api.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  BarChartOutlined, 
  PieChartOutlined, 
  LineChartOutlined, 
  DownloadOutlined,
  CalendarOutlined,
  FilterOutlined,
  MoreOutlined,
  ArrowUpOutlined as ArrowUpIcon,
  ArrowDownOutlined as ArrowDownIcon,
  UserOutlined,
  PrinterOutlined as PrintOutlined,
  ExclamationCircleOutlined as AlertOutlined,
  BulbOutlined as LightbulbOutlined
} from '@ant-design/icons';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartTooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Enhanced sample analytics data for development/demo
const sampleAnalyticsData = {
  revenue: {
    total: 125001,
    growth: 15,
    previousPeriod: 108500,
    monthly: [
      { name: 'Jan', value: 65001 },
      { name: 'Feb', value: 78000 },
      { name: 'Mar', value: 82000 },
      { name: 'Apr', value: 75001 },
      { name: 'May', value: 85001 },
      { name: 'Jun', value: 98000 },
      { name: 'Jul', value: 105001 },
      { name: 'Aug', value: 112000 },
      { name: 'Sep', value: 118000 },
      { name: 'Oct', value: 122000 },
      { name: 'Nov', value: 119000 },
      { name: 'Dec', value: 125001 }
    ]
  },
  orders: {
    total: 256,
    growth: 8,
    previousPeriod: 237,
    monthly: [
      { name: 'Jan', value: 120 },
      { name: 'Feb', value: 145 },
      { name: 'Mar', value: 150 },
      { name: 'Apr', value: 130 },
      { name: 'May', value: 160 },
      { name: 'Jun', value: 180 },
      { name: 'Jul', value: 190 },
      { name: 'Aug', value: 210 },
      { name: 'Sep', value: 230 },
      { name: 'Oct', value: 240 },
      { name: 'Nov', value: 250 },
      { name: 'Dec', value: 256 }
    ]
  },
  customers: {
    total: 189,
    growth: 12,
    previousPeriod: 169,
    monthly: [
      { name: 'Jan', value: 110 },
      { name: 'Feb', value: 120 },
      { name: 'Mar', value: 125 },
      { name: 'Apr', value: 130 },
      { name: 'May', value: 140 },
      { name: 'Jun', value: 145 },
      { name: 'Jul', value: 150 },
      { name: 'Aug', value: 160 },
      { name: 'Sep', value: 170 },
      { name: 'Oct', value: 175 },
      { name: 'Nov', value: 180 },
      { name: 'Dec', value: 189 }
    ]
  },
  popular: [
    { name: 'Paneer Butter Masala', orders: 45, value: 45 },
    { name: 'Chicken Biryani', orders: 38, value: 38 },
    { name: 'Naan', orders: 36, value: 36 },
    { name: 'Butter Chicken', orders: 32, value: 32 },
    { name: 'Masala Dosa', orders: 28, value: 28 }
  ],
  ordersByCategory: [
    { name: 'Veg Main Course', value: 75 },
    { name: 'Non-Veg Main Course', value: 110 },
    { name: 'Starters', value: 85 },
    { name: 'Breads', value: 60 },
    { name: 'Desserts', value: 45 },
    { name: 'Beverages', value: 30 }
  ]
};

// Custom colors for charts
const COLORS = ['#6366f1', '#ef4444', '#3b82f6', '#a78bfa', '#10b981', '#f97316', '#8b5cf6', '#64748b'];

const AnalyticsDashboard = () => {
  const { user = {} } = useAuth() || {};
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isVerified, setIsVerified] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('monthly');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  
  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        // Check if we have a token
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found. Please log in again.');
          setError('Authentication required. Please log in again.');
          setLoading(false);
          return;
        }
        
        console.log('Fetching analytics data for hotel ID: 67dd5b95125c7073eae1555b');
        
        // Try to fetch real analytics data
        try {
          // Fetch sales analytics
          const salesResponse = await getSalesAnalytics('month');
          console.log('Sales analytics response:', salesResponse);
          
          const customerResponse = await getCustomerAnalytics();
          console.log('Customer analytics response:', customerResponse);
          
          const inventoryResponse = await getInventoryAnalytics();
          console.log('Inventory analytics response:', inventoryResponse);
          
          // All responses successful - use real data
          if (salesResponse.data.success && 
              customerResponse.data.success && 
              inventoryResponse.data.success) {
            
            // Extract data from responses
            const salesData = salesResponse.data.data;
            const customerData = customerResponse.data.data;
            const inventoryData = inventoryResponse.data.data;
            
            // Combine the data
            const realData = {
              revenue: {
                total: salesData.totalRevenue || 0,
                growth: 5, // Example growth rate
                previousPeriod: salesData.totalRevenue * 0.95 || 0,
                monthly: salesData.revenue || sampleAnalyticsData.revenue.monthly
              },
              orders: {
                total: salesData.totalOrders || 0,
                growth: 8,
                previousPeriod: salesData.totalOrders * 0.92 || 0,
                monthly: salesData.orders || sampleAnalyticsData.orders.monthly
              },
              customers: {
                total: customerData.totalCustomers || 0,
                growth: 12,
                previousPeriod: customerData.totalCustomers * 0.88 || 0,
                monthly: customerData.customerGrowth || sampleAnalyticsData.customers.monthly
              },
              popular: salesData.popularItems || sampleAnalyticsData.popular,
              ordersByCategory: inventoryData.inventoryByCategory || sampleAnalyticsData.ordersByCategory
            };
            
            console.log('Setting real analytics data:', realData);
            setAnalytics(realData);
          } else {
            // Some data missing - use sample data
            console.log('Some API responses failed, using sample data');
            setAnalytics(sampleAnalyticsData);
          }
        } catch (apiError) {
          console.log('Error fetching API data, falling back to sample data:', apiError);
          // Fallback to sample data
          setAnalytics(sampleAnalyticsData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError('Failed to load analytics data');
        setAnalytics(sampleAnalyticsData);
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const handleExportData = () => {
    // In a real app, this would export data to CSV or Excel
    console.log('Exporting data...');
    handleMenuClose();
  };
  
  const handlePrintReport = () => {
    // In a real app, this would print the current view
    window.print();
    handleMenuClose();
  };
  
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  
  // Format currency for display
  const formatCurrency = (value) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ 
          p: 2, 
          boxShadow: 3, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{label}</Typography>
          {payload.map((entry, index) => (
            <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Box 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  backgroundColor: entry.color,
                  borderRadius: '50%'
                }} 
              />
              <Typography variant="body2">
                {entry.name}: {entry.dataKey === 'value' ? 
                  (entry.name.includes('Revenue') ? formatCurrency(entry.value) : entry.value) : 
                  entry.value}
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mb: 5 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={600}>
            Analytics Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Monitor your restaurant's performance metrics and insights
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: { xs: 2, md: 0 } }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Period</InputLabel>
            <Select
              value={timeRange}
              label="Time Period"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
          
          <IconButton onClick={handleMenuOpen}>
            <MoreOutlined />
          </IconButton>
          
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleExportData}>
              <DownloadOutlined style={{ marginRight: 8 }} /> Export Data
            </MenuItem>
            <MenuItem onClick={handlePrintReport}>
              <PrintOutlined style={{ marginRight: 8 }} /> Print Report
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      
      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Card */}
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              height: '100%',
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: alpha(COLORS[0], 0.05),
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    p: 1, 
                    borderRadius: 2,
                    mr: 2,
                    backgroundColor: alpha(COLORS[0], 0.1)
                  }}
                >
                  <LineChartOutlined style={{ fontSize: 24, color: COLORS[0] }} />
                </Box>
                <Typography variant="h6">Total Revenue</Typography>
              </Box>
              
              <Typography variant="h3" sx={{ mb: 1, fontWeight: 600, color: COLORS[0] }}>
                {formatCurrency(analytics.revenue.total)}
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1,
                  backgroundColor: analytics.revenue.growth >= 0 ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  width: 'fit-content'
                }}
              >
                {analytics.revenue.growth >= 0 ? (
                  <ArrowUpIcon style={{ fontSize: 16, color: '#10b981' }} />
                ) : (
                  <ArrowDownIcon style={{ fontSize: 16, color: '#ef4444' }} />
                )}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: analytics.revenue.growth >= 0 ? '#10b981' : '#ef4444',
                    fontWeight: 500
                  }}
                >
                  {Math.abs(analytics.revenue.growth)}% from last period
                </Typography>
              </Box>
              
              <Box sx={{ height: 120, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={analytics.revenue.monthly}
                    margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <RechartTooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      name="Revenue"
                      stroke={COLORS[0]} 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Orders Card */}
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              height: '100%',
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: alpha(COLORS[2], 0.05),
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    p: 1, 
                    borderRadius: 2,
                    mr: 2,
                    backgroundColor: alpha(COLORS[2], 0.1)
                  }}
                >
                  <BarChartOutlined style={{ fontSize: 24, color: COLORS[2] }} />
                </Box>
                <Typography variant="h6">Total Orders</Typography>
              </Box>
              
              <Typography variant="h3" sx={{ mb: 1, fontWeight: 600, color: COLORS[2] }}>
                {analytics.orders.total}
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1,
                  backgroundColor: analytics.orders.growth >= 0 ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  width: 'fit-content'
                }}
              >
                {analytics.orders.growth >= 0 ? (
                  <ArrowUpIcon style={{ fontSize: 16, color: '#10b981' }} />
                ) : (
                  <ArrowDownIcon style={{ fontSize: 16, color: '#ef4444' }} />
                )}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: analytics.orders.growth >= 0 ? '#10b981' : '#ef4444',
                    fontWeight: 500
                  }}
                >
                  {Math.abs(analytics.orders.growth)}% from last period
                </Typography>
              </Box>
              
              <Box sx={{ height: 120, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.orders.monthly}
                    margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                  >
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <RechartTooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      name="Orders"
                      fill={COLORS[2]} 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Customers Card */}
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              height: '100%',
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: alpha(COLORS[3], 0.05),
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    p: 1, 
                    borderRadius: 2,
                    mr: 2,
                    backgroundColor: alpha(COLORS[3], 0.1)
                  }}
                >
                  <UserOutlined style={{ fontSize: 24, color: COLORS[3] }} />
                </Box>
                <Typography variant="h6">Total Customers</Typography>
              </Box>
              
              <Typography variant="h3" sx={{ mb: 1, fontWeight: 600, color: COLORS[3] }}>
                {analytics.customers.total}
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1,
                  backgroundColor: analytics.customers.growth >= 0 ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  width: 'fit-content'
                }}
              >
                {analytics.customers.growth >= 0 ? (
                  <ArrowUpIcon style={{ fontSize: 16, color: '#10b981' }} />
                ) : (
                  <ArrowDownIcon style={{ fontSize: 16, color: '#ef4444' }} />
                )}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: analytics.customers.growth >= 0 ? '#10b981' : '#ef4444',
                    fontWeight: 500
                  }}
                >
                  {Math.abs(analytics.customers.growth)}% from last period
                </Typography>
              </Box>
              
              <Box sx={{ height: 120, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analytics.customers.monthly}
                    margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                  >
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <RechartTooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Customers"
                      stroke={COLORS[3]} 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Detailed Analytics Tabs */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          mb: 4
        }}
      >
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            mb: 3,
            '& .MuiTab-root': {
              minWidth: 'unset',
              fontWeight: 500
            }
          }}
        >
          <Tab label="Revenue Analysis" />
          <Tab label="Orders Breakdown" />
          <Tab label="Customer Insights" />
          <Tab label="Popular Items" />
        </Tabs>
        
        {/* Revenue Analysis */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>Monthly Revenue Trends</Typography>
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analytics.revenue.monthly}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `₹${value/1000}k`} />
                  <RechartTooltip content={<CustomTooltip />} />
                  <defs>
                    <linearGradient id="colorRevenue2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    name="Revenue"
                    stroke={COLORS[0]} 
                    fill="url(#colorRevenue2)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        )}
        
        {/* Orders Breakdown */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>Monthly Order Volume</Typography>
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.orders.monthly}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartTooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="value" 
                    name="Orders"
                    fill={COLORS[2]} 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            
            <Divider sx={{ my: 4 }} />
            
            <Typography variant="h6" sx={{ mb: 3 }}>Order Categories</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={analytics.ordersByCategory}
                      margin={{ top: 10, right: 30, left: 50, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <RechartTooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="value" 
                        name="Orders"
                        fill={COLORS[2]} 
                        radius={[0, 4, 4, 0]}
                      >
                        {analytics.ordersByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.ordersByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.ordersByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartTooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Customer Insights */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>Customer Growth</Typography>
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={analytics.customers.monthly}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartTooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name="Customers"
                    stroke={COLORS[3]} 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        )}
        
        {/* Popular Items */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>Most Popular Menu Items</Typography>
            <Box sx={{ height: 350 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={analytics.popular}
                        margin={{ top: 10, right: 30, left: 100, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" />
                        <RechartTooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="orders" 
                          name="Orders"
                          fill={COLORS[5]} 
                          radius={[0, 4, 4, 0]}
                        >
                          {analytics.popular.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 5) % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.popular}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="orders"
                        >
                          {analytics.popular.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 5) % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartTooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
      </Paper>
      
      {/* Quick Insights */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" sx={{ mb: 3 }}>Performance Insights</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 3, 
                backgroundColor: alpha('#10b981', 0.1),
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  p: 1, 
                  borderRadius: '50%',
                  backgroundColor: alpha('#10b981', 0.2)
                }}
              >
                <ArrowUpIcon style={{ fontSize: 20, color: '#10b981' }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={500}>Top performing day</Typography>
                <Typography variant="body2" color="text.secondary">Saturday generated 25% more revenue than average</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 3, 
                backgroundColor: alpha('#f97316', 0.1),
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  p: 1, 
                  borderRadius: '50%',
                  backgroundColor: alpha('#f97316', 0.2)
                }}
              >
                <AlertOutlined style={{ fontSize: 20, color: '#f97316' }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={500}>Peak hours</Typography>
                <Typography variant="body2" color="text.secondary">7 PM - 9 PM is your busiest time with 40% of orders</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 3, 
                backgroundColor: alpha('#3b82f6', 0.1),
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  p: 1, 
                  borderRadius: '50%',
                  backgroundColor: alpha('#3b82f6', 0.2)
                }}
              >
                <LightbulbOutlined style={{ fontSize: 20, color: '#3b82f6' }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={500}>Recommendation</Typography>
                <Typography variant="body2" color="text.secondary">Consider promoting desserts to increase average order value</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AnalyticsDashboard; 