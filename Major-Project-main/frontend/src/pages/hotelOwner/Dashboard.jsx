import React from 'react';
import { Box, Typography, Grid, Paper, Avatar, Divider, Button, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  DashboardOutlined, 
  ShoppingOutlined, 
  DatabaseOutlined, 
  SafetyCertificateOutlined, 
  GiftOutlined, 
  FireOutlined, 
  MenuOutlined, 
  BarChartOutlined, 
  ShoppingCartOutlined,
  UserOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  BellOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import '../../components/hotelOwner/HotelOwner3D.css';

const Dashboard = () => {
  // Mock data
  const stats = [
    { id: 1, title: 'Total Orders', value: '124', icon: ShoppingCartOutlined, color: '#4a90e2' },
    { id: 2, title: 'Revenue', value: '₹8,540', icon: DollarOutlined, color: '#22c55e' },
    { id: 3, title: 'Pending Orders', value: '8', icon: ClockCircleOutlined, color: '#f59e0b' },
  ];

  const recentOrders = [
    { id: 1, customer: 'John Doe', items: 'Vegetables Assortment', total: '₹124.00', status: 'Delivered' },
    { id: 2, customer: 'Jane Smith', items: 'Organic Fruits', total: '₹85.50', status: 'Processing' },
    { id: 3, customer: 'Robert Johnson', items: 'Fresh Herbs', total: '₹32.75', status: 'Pending' },
  ];

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5, color: '#1a1a1a' }}>
            Hotel Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Here's your hotel overview.
          </Typography>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          color: 'text.secondary',
          fontSize: '14px'
        }}>
          <Typography variant="body2">Yerevan</Typography>
          <Divider orientation="vertical" flexItem sx={{ height: 20 }} />
          <Typography variant="body2">12:16:08</Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Stats Cards */}
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Grid item xs={12} md={4} key={stat.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {stat.title}
                  </Typography>
                  <Avatar
                    sx={{
                      bgcolor: `${stat.color}15`,
                      color: stat.color,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <IconComponent />
                  </Avatar>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                  {stat.value}
                </Typography>
              </Paper>
            </Grid>
          );
        })}

        {/* Recent Orders */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
              mt: 2,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                Recent Orders
              </Typography>
              <Button
                variant="text"
                sx={{ 
                  textTransform: 'none', 
                  color: '#4a90e2',
                  fontWeight: 500,
                  fontSize: '14px'
                }}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box>
              {recentOrders.map((order) => (
                <Box
                  key={order.id}
                  sx={{
                    py: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                      {order.customer}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.items}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                      {order.total}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          order.status === 'Delivered'
                            ? '#22c55e'
                            : order.status === 'Processing'
                            ? '#4a90e2'
                            : '#f59e0b',
                        fontWeight: 500,
                      }}
                    >
                      {order.status}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Tasks Component */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              mt: 2,
              background: 'linear-gradient(135deg, #ff5b5b 0%, #ff9f7f 100%)',
              boxShadow: '0 2px 10px rgba(255, 91, 91, 0.2)',
              color: 'white',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                boxShadow: '0 10px 20px rgba(255, 91, 91, 0.3)',
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Upcoming Tasks
              </Typography>
              <Button
                variant="contained"
                startIcon={<CalendarOutlined />}
                sx={{ 
                  textTransform: 'none',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              >
                Add Task
              </Button>
            </Box>
            <Divider sx={{ mb: 2, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
            
            <Grid container spacing={2}>
              {[
                { id: 1, title: 'Update menu items', status: 'Completed', progress: 100, dueDate: 'Mar 10' },
                { id: 2, title: 'Order fresh produce', status: 'In Progress', progress: 60, dueDate: 'Mar 12' },
              ].map((task) => (
                <Grid item xs={12} sm={6} key={task.id}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
                        bgcolor: 'rgba(255, 255, 255, 0.15)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {task.title}
                      </Typography>
                      {task.status === 'Completed' ? (
                        <CheckCircleOutlined style={{ color: '#ffffff' }} />
                      ) : (
                        <ClockCircleOutlined style={{ color: '#ffffff' }} />
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 'auto', pt: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {task.status}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          Due: {task.dueDate}
                        </Typography>
                      </Box>
                      
                      <LinearProgress 
                        variant="determinate" 
                        value={task.progress} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 'white',
                          }
                        }} 
                      />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 