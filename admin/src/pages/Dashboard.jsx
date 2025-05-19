import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Button,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Divider,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon,
  MoreVert as MoreIcon,
  AutoGraph as GraphIcon,
  CalendarToday as CalendarIcon,
  Restaurant as RestaurantIcon,
  Store as StoreIcon,
  Spa as EcoIcon,
  LocalShipping as ShippingIcon,
  Verified as VerifiedIcon,
  LocalOffer as OfferIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Fastfood as FastfoodIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

// API URLs
const USERS_API_URL = 'http://https://fresh-connect-backend.onrender.com/api/users';
const URGENT_SALES_API_URL = 'http://https://fresh-connect-backend.onrender.com/api/listings/urgent';
const FREE_FOOD_API_URL = 'http://https://fresh-connect-backend.onrender.com/api/listings/free';
const VERIFICATION_API_URL = 'http://https://fresh-connect-backend.onrender.com/api/verifications';
const STATS_API_URL = 'http://https://fresh-connect-backend.onrender.com/api/admin/dashboard';

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

// Fallback Data
const FALLBACK_DATA = {
  verifiedSellers: 124,
  verifiedHotels: 87,
  urgentListings: 43,
  freeListings: 18,
  activities: [
    { 
      id: 1, 
      title: 'New Seller Verification', 
      startTime: '09:00', 
      endTime: '10:00',
      duration: '3 pending',
      color: '#d3e8b0' // Light green
    },
    { 
      id: 2, 
      title: 'Hotel Badge Approval', 
      startTime: '11:00', 
      endTime: '13:00',
      duration: '5 new',
      color: '#e8e8e8' // Light gray
    }
  ],
  messages: [
    {
      id: 1,
      sender: 'user',
      text: 'Need to approve the verification request for Green Farms vegetable seller.',
      time: '10:33 AM'
    },
    {
      id: 2,
      sender: 'assistant',
      text: 'Hotel Taj Palace has requested quality verification badge.',
      time: '10:32 AM'
    },
    {
      id: 3,
      sender: 'assistant',
      text: 'Welcome to FreshConnect Admin Dashboard. You have 8 pending tasks to review today.',
      time: ''
    }
  ],
  urgentSales: [
    {
      id: 1,
      name: 'Tomatoes (5kg)',
      seller: 'Green Farms',
      expiryDate: '2 days',
      discount: '40%',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Spinach (2kg)',
      seller: 'Organic Valley',
      expiryDate: '1 day',
      discount: '50%',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Potatoes (10kg)',
      seller: 'Farm Fresh',
      expiryDate: '3 days',
      discount: '30%',
      status: 'Pending'
    }
  ],
  freeFoodListings: [
    {
      id: 1,
      name: 'Vegetable Biryani',
      hotel: 'Spice Garden',
      quantity: '5 servings',
      postedTime: '30 min ago'
    },
    {
      id: 2,
      name: 'Mixed Vegetable Curry',
      hotel: 'Taj Palace',
      quantity: '3 servings',
      postedTime: '1 hour ago'
    }
  ],
  recentVerifications: [
    {
      id: 1,
      name: 'Green Valley Farms',
      type: 'Vegetable Seller',
      status: 'Verified',
      date: 'Today'
    },
    {
      id: 2,
      name: 'Royal Cuisine',
      type: 'Hotel',
      status: 'Pending',
      date: 'Yesterday'
    },
    {
      id: 3,
      name: 'Fresh Harvest',
      type: 'Vegetable Seller',
      status: 'Pending',
      date: 'Yesterday'
    }
  ]
};

// Function to test API connection
const testDashboardAPI = async () => {
  try {
    console.log('Testing API connection to:', STATS_API_URL);
    const response = await fetchWithRetry(STATS_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    console.log('Dashboard API test successful, received data:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Dashboard API test error:', error);
    return { success: false, error: error.message };
  }
};

const Dashboard = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [apiWorking, setApiWorking] = useState(false);
  const [greeting, setGreeting] = useState('Good morning');
  const [userName, setUserName] = useState('Admin');
  const [verifiedSellers, setVerifiedSellers] = useState(0);
  const [verifiedHotels, setVerifiedHotels] = useState(0);
  const [urgentListings, setUrgentListings] = useState(0);
  const [freeListings, setFreeListings] = useState(0);
  const [currentTime, setCurrentTime] = useState('');
  const [activities, setActivities] = useState([]);
  const [messages, setMessages] = useState([]);
  const [urgentSales, setUrgentSales] = useState([]);
  const [freeFoodListings, setFreeFoodListings] = useState([]);
  const [recentVerifications, setRecentVerifications] = useState([]);

  // Check if we're on the Dashboard page
  const isDashboardPage = location.pathname === '/' || location.pathname === '/dashboard';
  
  // Only log API URL when on Dashboard page
  useEffect(() => {
    if (isDashboardPage) {
      console.log('Using Dashboard API URL:', STATS_API_URL);
    }
  }, [isDashboardPage]);

  // Test API connection
  useEffect(() => {
    const testAPI = async () => {
      if (!isDashboardPage) {
        return; // Skip API calls if not on Dashboard page
      }
      
      console.log('Testing Dashboard API connection...');
      const result = await testDashboardAPI();
      setApiWorking(result.success);
    };
    
    testAPI();
  }, [isDashboardPage]);
  
  // Set greeting based on time of day
  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    
    if (hours < 12) {
      setGreeting('Good morning');
    } else if (hours < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
    
    // Set current time
    setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  // Current time indicator position (in percentage)
  const timePosition = 40; // This would be calculated based on current time

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isDashboardPage) {
        return; // Skip API calls if not on Dashboard page
      }
      
      setLoading(true);
      
      try {
        // Fetch stats data with retry
        console.log('Fetching stats data from:', STATS_API_URL);
        const statsResponse = await fetchWithRetry(STATS_API_URL);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log('Stats data received:', statsData);
          
          // Update stats
          setVerifiedSellers(statsData.verifiedSellers || FALLBACK_DATA.verifiedSellers);
          setVerifiedHotels(statsData.verifiedHotels || FALLBACK_DATA.verifiedHotels);
          setUrgentListings(statsData.urgentListingsCount || FALLBACK_DATA.urgentListings);
          setFreeListings(statsData.freeListingsCount || FALLBACK_DATA.freeListings);
          
          // Update admin info
          if (statsData.adminName) {
            setUserName(statsData.adminName);
          }
          
          // Update activities
          if (statsData.adminActivities && statsData.adminActivities.length > 0) {
            setActivities(statsData.adminActivities);
          } else {
            setActivities(FALLBACK_DATA.activities);
          }
          
          // Update messages
          if (statsData.adminMessages && statsData.adminMessages.length > 0) {
            setMessages(statsData.adminMessages);
          } else {
            setMessages(FALLBACK_DATA.messages);
          }
        } else {
          console.warn(`Stats API returned status ${statsResponse.status}, using fallback data`);
          // Use fallback data
          setVerifiedSellers(FALLBACK_DATA.verifiedSellers);
          setVerifiedHotels(FALLBACK_DATA.verifiedHotels);
          setUrgentListings(FALLBACK_DATA.urgentListings);
          setFreeListings(FALLBACK_DATA.freeListings);
          setActivities(FALLBACK_DATA.activities);
          setMessages(FALLBACK_DATA.messages);
        }
        
        // Fetch urgent sales data with retry
        console.log('Fetching urgent sales data from:', URGENT_SALES_API_URL);
        const urgentSalesResponse = await fetchWithRetry(URGENT_SALES_API_URL);
        if (urgentSalesResponse.ok) {
          const urgentSalesData = await urgentSalesResponse.json();
          if (urgentSalesData.length > 0) {
            // Format the data
            const formattedUrgentSales = urgentSalesData.map(item => ({
              id: item._id || item.id,
              name: item.name || item.productName,
              seller: item.sellerName || item.seller,
              expiryDate: item.expiryPeriod || '3 days',
              discount: item.discountPercentage ? `${item.discountPercentage}%` : '30%',
              status: item.status || 'Active'
            }));
            setUrgentSales(formattedUrgentSales);
          } else {
            setUrgentSales(FALLBACK_DATA.urgentSales);
          }
        } else {
          setUrgentSales(FALLBACK_DATA.urgentSales);
        }
        
        // Fetch free food listings
        const freeFoodResponse = await fetch(FREE_FOOD_API_URL);
        if (freeFoodResponse.ok) {
          const freeFoodData = await freeFoodResponse.json();
          if (freeFoodData.length > 0) {
            // Format the data
            const formattedFreeFoodListings = freeFoodData.map(item => ({
              id: item._id || item.id,
              name: item.foodName || item.name,
              hotel: item.hotelName || item.hotel,
              quantity: item.quantity || '3 servings',
              postedTime: item.postedTime || '1 hour ago'
            }));
            setFreeFoodListings(formattedFreeFoodListings);
          } else {
            setFreeFoodListings(FALLBACK_DATA.freeFoodListings);
          }
        } else {
          setFreeFoodListings(FALLBACK_DATA.freeFoodListings);
        }
        
        // Fetch recent verifications
        const verificationsResponse = await fetch(VERIFICATION_API_URL);
        if (verificationsResponse.ok) {
          const verificationsData = await verificationsResponse.json();
          if (verificationsData.length > 0) {
            // Format the data
            const formattedVerifications = verificationsData.map(item => ({
              id: item._id || item.id,
              name: item.entityName || item.name,
              type: item.entityType || item.type,
              status: item.status || 'Pending',
              date: item.verificationDate ? new Date(item.verificationDate).toLocaleDateString() : 'Today'
            }));
            setRecentVerifications(formattedVerifications);
          } else {
            setRecentVerifications(FALLBACK_DATA.recentVerifications);
          }
        } else {
          setRecentVerifications(FALLBACK_DATA.recentVerifications);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Use fallback data on error
        setVerifiedSellers(FALLBACK_DATA.verifiedSellers);
        setVerifiedHotels(FALLBACK_DATA.verifiedHotels);
        setUrgentListings(FALLBACK_DATA.urgentListings);
        setFreeListings(FALLBACK_DATA.freeListings);
        setActivities(FALLBACK_DATA.activities);
        setMessages(FALLBACK_DATA.messages);
        setUrgentSales(FALLBACK_DATA.urgentSales);
        setFreeFoodListings(FALLBACK_DATA.freeFoodListings);
        setRecentVerifications(FALLBACK_DATA.recentVerifications);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [isDashboardPage]);
  
  // Refresh dashboard data
  const refreshDashboardData = async () => {
    if (!isDashboardPage) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Implementation similar to fetchDashboardData
      const statsResponse = await fetch(STATS_API_URL);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        
        // Update stats
        setVerifiedSellers(statsData.verifiedSellers || FALLBACK_DATA.verifiedSellers);
        setVerifiedHotels(statsData.verifiedHotels || FALLBACK_DATA.verifiedHotels);
        setUrgentListings(statsData.urgentListingsCount || FALLBACK_DATA.urgentListings);
        setFreeListings(statsData.freeListingsCount || FALLBACK_DATA.freeListings);
        
        // Update admin info
        if (statsData.adminName) {
          setUserName(statsData.adminName);
        }
        
        // Update activities
        if (statsData.adminActivities && statsData.adminActivities.length > 0) {
          setActivities(statsData.adminActivities);
        } else {
          setActivities(FALLBACK_DATA.activities);
        }
        
        // Update messages
        if (statsData.adminMessages && statsData.adminMessages.length > 0) {
          setMessages(statsData.adminMessages);
        } else {
          setMessages(FALLBACK_DATA.messages);
        }
      }
      
      // Fetch other data as needed
      
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '01:00', '02:00'];

  return (
    <Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Greeting Section */}
          <Box mb={4}>
            <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
              {greeting}, {userName}!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Welcome to FreshConnect Admin Dashboard
            </Typography>
          </Box>

          {/* Stats Section */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                      <VerifiedIcon />
                    </Avatar>
                    <Typography variant="h6" color="text.secondary">
                      Verified Sellers
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div" fontWeight="bold">
                    {verifiedSellers}
                  </Typography>
                  <Chip 
                    label="+12 this month" 
                    size="small" 
                    color="success" 
                    sx={{ mt: 1, borderRadius: '12px' }} 
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                      <RestaurantIcon />
                    </Avatar>
                    <Typography variant="h6" color="text.secondary">
                      Verified Hotels
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div" fontWeight="bold">
                    {verifiedHotels}
                  </Typography>
                  <Chip 
                    label="+8 this month" 
                    size="small" 
                    color="primary" 
                    sx={{ mt: 1, borderRadius: '12px' }} 
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                      <ShippingIcon />
                    </Avatar>
                    <Typography variant="h6" color="text.secondary">
                      Urgent Listings
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div" fontWeight="bold">
                    {urgentListings}
                  </Typography>
                  <Chip 
                    label="+5 today" 
                    size="small" 
                    color="warning" 
                    sx={{ mt: 1, borderRadius: '12px' }} 
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'info.light', mr: 2 }}>
                      <EcoIcon />
                    </Avatar>
                    <Typography variant="h6" color="text.secondary">
                      Free Food Listings
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div" fontWeight="bold">
                    {freeListings}
                  </Typography>
                  <Chip 
                    label="+3 today" 
                    size="small" 
                    color="info" 
                    sx={{ mt: 1, borderRadius: '12px' }} 
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Main Content Section - First Row */}
          <Grid container spacing={3} mb={3}>
            {/* Left Column: Notifications */}
            <Grid item xs={12} md={5}>
              <Paper sx={{ 
                p: 3,
                borderRadius: 3,
                height: '100%',
                minHeight: 400
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <VerifiedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Verification Requests
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending approvals and notifications
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ 
                  backgroundColor: 'background.default', 
                  borderRadius: 3, 
                  p: 2, 
                  mb: 2,
                  maxHeight: 300,
                  overflowY: 'auto'
                }}>
                  {messages.map(message => (
                    <Box 
                      key={message.id}
                      sx={{ 
                        display: 'flex',
                        flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                        mb: 2
                      }}
                    >
                      {message.sender === 'assistant' && (
                        <Avatar sx={{ 
                          bgcolor: 'primary.main', 
                          width: 32, 
                          height: 32,
                          mr: 1
                        }}>
                          <VerifiedIcon fontSize="small" />
                        </Avatar>
                      )}
                      
                      <Box 
                        sx={{ 
                          maxWidth: '75%',
                          backgroundColor: message.sender === 'user' ? 'primary.main' : 'background.paper',
                          color: message.sender === 'user' ? 'white' : 'text.primary',
                          borderRadius: 3,
                          p: 2,
                          ml: message.sender === 'user' ? 1 : 0
                        }}
                      >
                        <Typography variant="body2">
                          {message.text}
                        </Typography>
                        {message.time && (
                          <Typography variant="caption" color={message.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary'} sx={{ display: 'block', textAlign: 'right', mt: 1 }}>
                            {message.time}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{ 
                      borderRadius: 3,
                      py: 1.5
                    }}
                  >
                    View All Verification Requests
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Right Column: Activity */}
            <Grid item xs={12} md={7}>
              <Paper sx={{ 
                p: 3,
                borderRadius: 3,
                height: '100%',
                minHeight: 400
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 3
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">
                      Admin Activity
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      Pending tasks for today
                    </Typography>
                  </Box>
                  <IconButton>
                    <CalendarIcon />
                  </IconButton>
                </Box>

                {/* Time slots */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  mb: 2,
                  px: 1
                }}>
                  {timeSlots.map(time => (
                    <Typography key={time} variant="body2" color="text.secondary">
                      {time}
                    </Typography>
                  ))}
                </Box>

                {/* Activity timeline */}
                <Box sx={{ 
                  position: 'relative',
                  mb: 2,
                  height: 250,
                  backgroundColor: 'background.default',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}>
                  {/* Current time indicator */}
                  <Box sx={{ 
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${timePosition}%`,
                    borderRight: '2px solid #6366F1',
                    zIndex: 2
                  }} />

                  {/* Current time marker */}
                  <Box sx={{ 
                    position: 'absolute',
                    left: `${timePosition}%`,
                    top: 0,
                    bottom: 0,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: '#6366F1',
                    transform: 'translateX(-50%)',
                    zIndex: 3
                  }} />

                  {/* Activities */}
                  {activities.map(activity => {
                    // Calculate position and width based on time
                    // This is simplified - would need actual calculation based on start/end times
                    const startPercent = activity.title === 'New Seller Verification' ? 20 : 50;
                    const width = activity.title === 'New Seller Verification' ? 20 : 35;
                    
                    return (
                      <Box 
                        key={activity.id}
                        sx={{
                          position: 'absolute',
                          left: `${startPercent}%`,
                          top: activity.title === 'New Seller Verification' ? 40 : 120,
                          width: `${width}%`,
                          bgcolor: activity.color,
                          borderRadius: 2,
                          p: 2,
                          zIndex: 1
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">
                            {activity.title}
                          </Typography>
                          <Chip 
                            label={activity.duration} 
                            size="small" 
                            sx={{ 
                              bgcolor: 'rgba(255,255,255,0.7)',
                              borderRadius: '12px',
                              height: 24
                            }} 
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<StoreIcon />}
                    sx={{ 
                      borderRadius: 3,
                      px: 3,
                      py: 1
                    }}
                  >
                    Manage Sellers
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<RestaurantIcon />}
                    sx={{ 
                      borderRadius: 3,
                      px: 3,
                      py: 1
                    }}
                  >
                    Manage Hotels
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<VerifiedIcon />}
                    sx={{ 
                      borderRadius: 3,
                      px: 3,
                      py: 1
                    }}
                  >
                    Verification Requests
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Second Row */}
          <Grid container spacing={3} mb={3}>
            {/* Urgent Sales Listings */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 3,
                borderRadius: 3,
                height: '100%'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <WarningIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Urgent Sales Listings
                    </Typography>
                  </Box>
                  <Button 
                    variant="text" 
                    color="primary"
                    endIcon={<MoreIcon />}
                  >
                    View All
                  </Button>
                </Box>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>Seller</TableCell>
                        <TableCell>Expiry</TableCell>
                        <TableCell>Discount</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {urgentSales.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.seller}</TableCell>
                          <TableCell>
                            <Chip 
                              label={item.expiryDate} 
                              size="small" 
                              color="warning" 
                              sx={{ borderRadius: '12px' }} 
                            />
                          </TableCell>
                          <TableCell>{item.discount}</TableCell>
                          <TableCell>
                            <Chip 
                              label={item.status} 
                              size="small" 
                              color={item.status === 'Active' ? 'success' : 'default'} 
                              sx={{ borderRadius: '12px' }} 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Free Food Listings */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 3,
                borderRadius: 3,
                height: '100%'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <FastfoodIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Free Food Listings
                    </Typography>
                  </Box>
                  <Button 
                    variant="text" 
                    color="primary"
                    endIcon={<MoreIcon />}
                  >
                    View All
                  </Button>
                </Box>
                
                <List>
                  {freeFoodListings.map((item) => (
                    <React.Fragment key={item.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'info.light' }}>
                            <RestaurantIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={item.name}
                          secondary={`${item.hotel} • ${item.quantity}`}
                        />
                        <ListItemSecondaryAction>
                          <Typography variant="caption" color="text.secondary">
                            {item.postedTime}
                          </Typography>
                          <IconButton edge="end" size="small">
                            <CheckCircleIcon color="success" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AddIcon />}
                    sx={{ 
                      borderRadius: 3,
                      px: 4
                    }}
                  >
                    Add New Listing
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Third Row */}
          <Grid container spacing={3}>
            {/* Recent Verifications */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ 
                p: 3,
                borderRadius: 3,
                height: '100%'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <VerifiedIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Recent Verifications
                  </Typography>
                </Box>
                
                <List>
                  {recentVerifications.map((item) => (
                    <React.Fragment key={item.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: item.type === 'Hotel' ? 'primary.light' : 'success.light' }}>
                            {item.type === 'Hotel' ? <RestaurantIcon /> : <EcoIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={item.name}
                          secondary={item.type}
                        />
                        <ListItemSecondaryAction>
                          <Chip 
                            label={item.status} 
                            size="small" 
                            color={item.status === 'Verified' ? 'success' : 'default'} 
                            sx={{ borderRadius: '12px', mr: 1 }} 
                          />
                          <Typography variant="caption" color="text.secondary">
                            {item.date}
                          </Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Platform Statistics */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ 
                p: 3,
                borderRadius: 3,
                height: '100%'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <TimelineIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Platform Statistics
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Total Users</Typography>
                    <Typography variant="body2" fontWeight="bold">2,543</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={75} 
                    sx={{ height: 8, borderRadius: 4, mb: 2 }} 
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Vegetable Sellers</Typography>
                    <Typography variant="body2" fontWeight="bold">342</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={60} 
                    color="success"
                    sx={{ height: 8, borderRadius: 4, mb: 2 }} 
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Hotel Partners</Typography>
                    <Typography variant="body2" fontWeight="bold">187</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={45} 
                    color="secondary"
                    sx={{ height: 8, borderRadius: 4, mb: 2 }} 
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">End Users</Typography>
                    <Typography variant="body2" fontWeight="bold">2,014</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={85} 
                    color="info"
                    sx={{ height: 8, borderRadius: 4 }} 
                  />
                </Box>
                
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<GraphIcon />}
                  fullWidth
                  sx={{ 
                    borderRadius: 3,
                    mt: 2
                  }}
                >
                  View Detailed Analytics
                </Button>
              </Paper>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ 
                p: 3,
                borderRadius: 3,
                height: '100%'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                    <SettingsIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Quick Actions
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<VerifiedIcon />}
                      fullWidth
                      sx={{ 
                        borderRadius: 3,
                        py: 1.5,
                        justifyContent: 'flex-start',
                        textAlign: 'left'
                      }}
                    >
                      Verify Seller
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<RestaurantIcon />}
                      fullWidth
                      sx={{ 
                        borderRadius: 3,
                        py: 1.5,
                        justifyContent: 'flex-start',
                        textAlign: 'left'
                      }}
                    >
                      Verify Hotel
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<WarningIcon />}
                      fullWidth
                      sx={{ 
                        borderRadius: 3,
                        py: 1.5,
                        justifyContent: 'flex-start',
                        textAlign: 'left'
                      }}
                    >
                      Urgent Sales
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      color="info"
                      startIcon={<FastfoodIcon />}
                      fullWidth
                      sx={{ 
                        borderRadius: 3,
                        py: 1.5,
                        justifyContent: 'flex-start',
                        textAlign: 'left'
                      }}
                    >
                      Free Food
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      color="success"
                      startIcon={<PeopleIcon />}
                      fullWidth
                      sx={{ 
                        borderRadius: 3,
                        py: 1.5,
                        justifyContent: 'flex-start',
                        textAlign: 'left'
                      }}
                    >
                      User Reports
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<TrendingUpIcon />}
                      fullWidth
                      sx={{ 
                        borderRadius: 3,
                        py: 1.5,
                        justifyContent: 'flex-start',
                        textAlign: 'left'
                      }}
                    >
                      Sales Analytics
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard; 