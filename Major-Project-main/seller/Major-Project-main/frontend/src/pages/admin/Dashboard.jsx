import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardHeader, 
  IconButton, 
  Button, 
  Avatar, 
  Divider, 
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Person as PersonIcon, 
  Storefront as StorefrontIcon, 
  LocalShipping as LocalShippingIcon, 
  AttachMoney as AttachMoneyIcon, 
  Restaurant as RestaurantIcon,
  Payment as PaymentIcon,
  Report as ReportIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data for dashboard
const overviewData = [
  { title: 'Total Users', value: 2845, icon: PersonIcon, color: '#4a90e2', increase: 12 },
  { title: 'Sellers', value: 126, icon: StorefrontIcon, color: '#22c55e', increase: 8 },
  { title: 'Restaurants', value: 83, icon: RestaurantIcon, color: '#f59e0b', increase: 5 },
  { title: 'Total Orders', value: 1254, icon: LocalShippingIcon, color: '#9333ea', increase: 16 }
];

const revenueData = [
  { name: 'Jan', revenue: 8000 },
  { name: 'Feb', revenue: 10000 },
  { name: 'Mar', revenue: 9000 },
  { name: 'Apr', revenue: 12000 },
  { name: 'May', revenue: 15003 },
  { name: 'Jun', revenue: 18000 },
  { name: 'Jul', revenue: 20000 },
];

const userGrowthData = [
  { name: 'Jan', customers: 2000, sellers: 80, restaurants: 50 },
  { name: 'Feb', customers: 2200, sellers: 90, restaurants: 55 },
  { name: 'Mar', customers: 2500, sellers: 95, restaurants: 60 },
  { name: 'Apr', customers: 2700, sellers: 100, restaurants: 65 },
  { name: 'May', customers: 3000, sellers: 110, restaurants: 70 },
  { name: 'Jun', customers: 3200, sellers: 120, restaurants: 75 },
  { name: 'Jul', customers: 3500, sellers: 130, restaurants: 85 },
];

const pieChartData = [
  { name: 'Vegetables', value: 65 },
  { name: 'Fruits', value: 25 },
  { name: 'Herbs', value: 10 },
];

const COLORS = ['#22c55e', '#f59e0b', '#4a90e2'];

const recentActivities = [
  { id: 1, user: 'Amit Singh', action: 'registered as a new vegetable seller', time: '35 minutes ago', avatar: 'AS' },
  { id: 2, user: 'Taj Restaurant', action: 'was verified successfully', time: '2 hours ago', avatar: 'TR' },
  { id: 3, user: 'Ravi Kumar', action: 'submitted documents for verification', time: '4 hours ago', avatar: 'RK' },
  { id: 4, user: 'Green Farms', action: 'posted 5 new organic products', time: '5 hours ago', avatar: 'GF' },
  { id: 5, user: 'Mehra Hotel', action: 'received verification badge', time: '1 day ago', avatar: 'MH' },
];

const pendingVerifications = [
  { id: 1, name: 'Organic Valley', type: 'Seller', documents: 3, waitingTime: '2 days' },
  { id: 2, name: 'Spice Garden Restaurant', type: 'Restaurant', documents: 4, waitingTime: '1 day' },
  { id: 3, name: 'Farm Fresh Co.', type: 'Seller', documents: 3, waitingTime: '3 days' },
  { id: 4, name: 'Veg Delight', type: 'Restaurant', documents: 4, waitingTime: '2 days' },
];

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('weekly');
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="admin-dashboard"
    >
      {/* Header Section */}
      <Box mb={4} display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Overview of your e-commerce platform
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#22c55e',
              '&:hover': {
                backgroundColor: '#16a34a',
              },
            }}
          >
            Generate Report
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} mb={4}>
        {overviewData.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div variants={itemVariants}>
              <Card 
                sx={{ 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  borderRadius: '12px',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  },
                  height: '100%'
                }}
              >
                <CardContent sx={{ padding: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar
                      sx={{
                        backgroundColor: item.color + '20',
                        color: item.color,
                        width: 48,
                        height: 48
                      }}
                    >
                      <item.icon />
                    </Avatar>
                    <Box ml={2}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {item.title}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {item.value}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Chip
                      icon={<TrendingUpIcon fontSize="small" />}
                      label={`+${item.increase}% this month`}
                      size="small"
                      sx={{
                        backgroundColor: '#22c55e20',
                        color: '#22c55e',
                        fontWeight: 'medium'
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <motion.div variants={itemVariants}>
            <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '12px', height: '100%' }}>
              <CardHeader
                title="Revenue Overview"
                action={
                  <>
                    <Button
                      id="time-range-button"
                      aria-controls={open ? 'time-range-menu' : undefined}
                      aria-haspopup="true"
                      aria-expanded={open ? 'true' : undefined}
                      onClick={handleClick}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      {timeRange === 'weekly' ? 'This Week' : timeRange === 'monthly' ? 'This Month' : 'This Year'}
                    </Button>
                    <Menu
                      id="time-range-menu"
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleClose}
                      MenuListProps={{
                        'aria-labelledby': 'time-range-button',
                      }}
                    >
                      <MenuItem onClick={() => { setTimeRange('weekly'); handleClose(); }}>This Week</MenuItem>
                      <MenuItem onClick={() => { setTimeRange('monthly'); handleClose(); }}>This Month</MenuItem>
                      <MenuItem onClick={() => { setTimeRange('yearly'); handleClose(); }}>This Year</MenuItem>
                    </Menu>
                  </>
                }
              />
              <CardContent>
                <Box height="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={revenueData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#22c55e"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <motion.div variants={itemVariants}>
            <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '12px', height: '100%' }}>
              <CardHeader
                title="Product Categories"
                subheader="Distribution by percentage"
              />
              <CardContent>
                <Box height="300px" display="flex" justifyContent="center" alignItems="center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* User Growth Chart */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <motion.div variants={itemVariants}>
            <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
              <CardHeader
                title="User Growth"
                subheader="Number of users by category"
              />
              <CardContent>
                <Box height="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={userGrowthData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="customers" name="Customers" fill="#4a90e2" />
                      <Bar dataKey="sellers" name="Sellers" fill="#22c55e" />
                      <Bar dataKey="restaurants" name="Restaurants" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Recent Activities and Pending Verifications */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '12px', height: '100%' }}>
              <CardHeader
                title="Recent Activities"
                action={
                  <IconButton aria-label="more">
                    <MoreVertIcon />
                  </IconButton>
                }
              />
              <CardContent sx={{ padding: 0 }}>
                <List>
                  {recentActivities.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem alignItems="flex-start" sx={{ px: 3 }}>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: index % 2 === 0 ? '#22c55e20' : '#4a90e220',
                              color: index % 2 === 0 ? '#22c55e' : '#4a90e2',
                            }}
                          >
                            {activity.avatar}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" fontWeight="medium">
                              {activity.user}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {activity.action}
                              </Typography>
                              <Typography component="span" variant="caption" color="text.secondary" display="block">
                                {activity.time}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < recentActivities.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
                <Box display="flex" justifyContent="center" py={1}>
                  <Button color="primary">View All Activities</Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '12px', height: '100%' }}>
              <CardHeader
                title="Pending Verifications"
                action={
                  <Tooltip title="These verification requests require your attention">
                    <IconButton>
                      <WarningIcon sx={{ color: '#f59e0b' }} />
                    </IconButton>
                  </Tooltip>
                }
              />
              <CardContent>
                <Box mb={2}>
                  <Chip
                    icon={<WarningIcon fontSize="small" />}
                    label="Requires Attention"
                    sx={{
                      backgroundColor: '#f59e0b20',
                      color: '#f59e0b',
                      fontWeight: 'medium'
                    }}
                  />
                </Box>
                
                {pendingVerifications.map((verification) => (
                  <Paper
                    key={verification.id}
                    sx={{
                      p: 2,
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      borderRadius: '8px',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {verification.name}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={verification.type}
                          size="small"
                          sx={{
                            backgroundColor: verification.type === 'Seller' ? '#22c55e20' : '#9333ea20',
                            color: verification.type === 'Seller' ? '#22c55e' : '#9333ea',
                            fontSize: '0.75rem',
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {verification.documents} documents • Waiting {verification.waitingTime}
                        </Typography>
                      </Box>
                    </Box>
                    <Button 
                      variant="outlined" 
                      size="small"
                      startIcon={<VerifiedIcon fontSize="small" />}
                      sx={{
                        borderColor: '#22c55e',
                        color: '#22c55e',
                        '&:hover': {
                          borderColor: '#16a34a',
                          backgroundColor: '#22c55e10',
                        },
                      }}
                    >
                      Review
                    </Button>
                  </Paper>
                ))}
                
                <Box display="flex" justifyContent="center">
                  <Button 
                    color="primary"
                    endIcon={<StorefrontIcon />}
                    sx={{ mr: 1 }}
                  >
                    All Sellers
                  </Button>
                  <Button 
                    color="primary"
                    endIcon={<RestaurantIcon />}
                  >
                    All Restaurants
                  </Button>
    </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <motion.div variants={itemVariants}>
            <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
              <CardHeader
                title="Quick Actions"
                subheader="Frequently used admin functions"
              />
              <CardContent>
                <Grid container spacing={2}>
                  {[
                    { icon: <PersonIcon />, label: "Manage Users", color: "#4a90e2" },
                    { icon: <StorefrontIcon />, label: "Verify Sellers", color: "#22c55e" },
                    { icon: <RestaurantIcon />, label: "Verify Restaurants", color: "#f59e0b" },
                    { icon: <AttachMoneyIcon />, label: "Review Payments", color: "#9333ea" },
                    { icon: <LocalShippingIcon />, label: "Track Orders", color: "#ef4444" },
                    { icon: <ReportIcon />, label: "Generate Reports", color: "#64748b" }
                  ].map((action, index) => (
                    <Grid item xs={6} sm={4} md={2} key={index}>
                      <Paper
                        sx={{
                          p: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          height: '100%',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            mb: 1,
                            bgcolor: `${action.color}20`,
                            color: action.color,
                          }}
                        >
                          {action.icon}
                        </Avatar>
                        <Typography variant="body2" fontWeight="medium">
                          {action.label}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default Dashboard; 