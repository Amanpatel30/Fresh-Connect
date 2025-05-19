import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Stack,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Person,
  BarChart as BarChartIcon,
  ArticleOutlined,
  ShoppingBag,
  Refresh,
  DateRange,
  KeyboardArrowRight,
  Public,
  PhoneAndroid,
  Laptop,
  TabletMac,
  ShowChart,
  PieChart,
  DonutLarge,
  MoreVert,
  PersonOutlined,
  ShoppingCartOutlined,
  HotelOutlined,
  LocationOnOutlined,
  AccessTimeOutlined
} from '@mui/icons-material';

// Sample data for analytics dashboard
const VISITOR_DATA = [
  { date: 'May 20', visitors: 5200, newUsers: 1200, returningUsers: 4000, bounceRate: 35 },
  { date: 'May 19', visitors: 4800, newUsers: 1100, returningUsers: 3700, bounceRate: 32 },
  { date: 'May 18', visitors: 5100, newUsers: 1300, returningUsers: 3800, bounceRate: 34 },
  { date: 'May 17', visitors: 5500, newUsers: 1400, returningUsers: 4100, bounceRate: 36 },
  { date: 'May 16', visitors: 4900, newUsers: 1000, returningUsers: 3900, bounceRate: 33 },
  { date: 'May 15', visitors: 4700, newUsers: 950, returningUsers: 3750, bounceRate: 30 },
  { date: 'May 14', visitors: 4200, newUsers: 850, returningUsers: 3350, bounceRate: 31 }
];

const TOP_PRODUCTS = [
  { id: 1, name: 'Grand Plaza Hotel', bookings: 245, revenue: 78400, rating: 4.8 },
  { id: 2, name: 'Mountain View Resort', bookings: 198, revenue: 59400, rating: 4.7 },
  { id: 3, name: 'City Center Inn', bookings: 187, revenue: 42075, rating: 4.5 },
  { id: 4, name: 'Beachside Villa', bookings: 165, revenue: 49500, rating: 4.9 },
  { id: 5, name: 'Lakefront Cottage', bookings: 132, revenue: 33000, rating: 4.6 }
];

const TOP_LOCATIONS = [
  { id: 1, city: 'New York', bookings: 458, change: 12 },
  { id: 2, city: 'London', bookings: 412, change: 8 },
  { id: 3, city: 'Paris', bookings: 387, change: -3 },
  { id: 4, city: 'Tokyo', bookings: 356, change: 15 },
  { id: 5, city: 'Sydney', bookings: 298, change: 5 }
];

const TRAFFIC_SOURCES = [
  { source: 'Direct', visits: 1250, percentage: 25 },
  { source: 'Organic Search', visits: 1850, percentage: 37 },
  { source: 'Referral', visits: 950, percentage: 19 },
  { source: 'Social Media', visits: 650, percentage: 13 },
  { source: 'Email', visits: 300, percentage: 6 }
];

const DEVICE_USAGE = [
  { device: 'Desktop', percentage: 45 },
  { device: 'Mobile', percentage: 38 },
  { device: 'Tablet', percentage: 17 }
];

const CONVERSION_FUNNEL = [
  { stage: 'Visitors', count: 15001, percentage: 100 },
  { stage: 'Product Views', count: 9000, percentage: 60 },
  { stage: 'Add to Cart', count: 3600, percentage: 24 },
  { stage: 'Checkout', count: 2250, percentage: 15 },
  { stage: 'Purchases', count: 1500, percentage: 10 }
];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [chartType, setChartType] = useState('line');
  
  // Initialize data state
  const [visitorData, setVisitorData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topLocations, setTopLocations] = useState([]);
  const [trafficSources, setTrafficSources] = useState([]);
  const [deviceUsage, setDeviceUsage] = useState([]);
  const [conversionFunnel, setConversionFunnel] = useState([]);

  // Summary metrics
  const [summaryMetrics, setSummaryMetrics] = useState({
    totalVisitors: 0,
    totalBookings: 0,
    totalRevenue: 0,
    conversionRate: 0,
    visitorsChange: 0,
    bookingsChange: 0,
    revenueChange: 0,
    conversionChange: 0
  });

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      
      try {
        // In a real app, this would be API calls
        // For demo purposes, we're using setTimeout and sample data
        setTimeout(() => {
          // Set sample data
          setVisitorData(VISITOR_DATA);
          setTopProducts(TOP_PRODUCTS);
          setTopLocations(TOP_LOCATIONS);
          setTrafficSources(TRAFFIC_SOURCES);
          setDeviceUsage(DEVICE_USAGE);
          setConversionFunnel(CONVERSION_FUNNEL);
          
          // Calculate summary metrics
          const totalVisitors = VISITOR_DATA.reduce((sum, day) => sum + day.visitors, 0);
          const totalBookings = TOP_PRODUCTS.reduce((sum, product) => sum + product.bookings, 0);
          const totalRevenue = TOP_PRODUCTS.reduce((sum, product) => sum + product.revenue, 0);
          const conversionRate = (totalBookings / totalVisitors) * 100;
          
          setSummaryMetrics({
            totalVisitors,
            totalBookings,
            totalRevenue,
            conversionRate,
            visitorsChange: 8.5,
            bookingsChange: 12.3,
            revenueChange: 15.7,
            conversionChange: 3.2
          });
          
          setLoading(false);
        }, 1200);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [timeRange]);

  // Handle time range change
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  // Handle tab change for visitor insights
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle chart type change
  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Render summary cards
  const renderSummaryCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Total Visitors
                </Typography>
                <Typography variant="h4">
                  {summaryMetrics.totalVisitors.toLocaleString()}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.light', p: 1 }}>
                <PersonOutlined />
              </Avatar>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              {summaryMetrics.visitorsChange > 0 ? (
                <TrendingUp fontSize="small" color="success" />
              ) : (
                <TrendingDown fontSize="small" color="error" />
              )}
              <Typography variant="body2" color={summaryMetrics.visitorsChange > 0 ? 'success.main' : 'error.main'} sx={{ ml: 0.5 }}>
                {Math.abs(summaryMetrics.visitorsChange)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                vs. previous period
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Total Bookings
                </Typography>
                <Typography variant="h4">
                  {summaryMetrics.totalBookings.toLocaleString()}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'secondary.light', p: 1 }}>
                <ShoppingCartOutlined />
              </Avatar>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              {summaryMetrics.bookingsChange > 0 ? (
                <TrendingUp fontSize="small" color="success" />
              ) : (
                <TrendingDown fontSize="small" color="error" />
              )}
              <Typography variant="body2" color={summaryMetrics.bookingsChange > 0 ? 'success.main' : 'error.main'} sx={{ ml: 0.5 }}>
                {Math.abs(summaryMetrics.bookingsChange)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                vs. previous period
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(summaryMetrics.totalRevenue)}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'success.light', p: 1 }}>
                <BarChartIcon />
              </Avatar>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              {summaryMetrics.revenueChange > 0 ? (
                <TrendingUp fontSize="small" color="success" />
              ) : (
                <TrendingDown fontSize="small" color="error" />
              )}
              <Typography variant="body2" color={summaryMetrics.revenueChange > 0 ? 'success.main' : 'error.main'} sx={{ ml: 0.5 }}>
                {Math.abs(summaryMetrics.revenueChange)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                vs. previous period
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Conversion Rate
                </Typography>
                <Typography variant="h4">
                  {summaryMetrics.conversionRate.toFixed(1)}%
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'warning.light', p: 1 }}>
                <ShowChart />
              </Avatar>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              {summaryMetrics.conversionChange > 0 ? (
                <TrendingUp fontSize="small" color="success" />
              ) : (
                <TrendingDown fontSize="small" color="error" />
              )}
              <Typography variant="body2" color={summaryMetrics.conversionChange > 0 ? 'success.main' : 'error.main'} sx={{ ml: 0.5 }}>
                {Math.abs(summaryMetrics.conversionChange)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                vs. previous period
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Render visitor insights
  const renderVisitorInsights = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader
            title="Visitor Insights"
            action={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Stack direction="row" spacing={1} sx={{ mr: 2 }}>
                  <Tooltip title="Line Chart">
                    <IconButton 
                      size="small"
                      color={chartType === 'line' ? 'primary' : 'default'} 
                      onClick={() => handleChartTypeChange('line')}
                    >
                      <ShowChart />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Bar Chart">
                    <IconButton 
                      size="small"
                      color={chartType === 'bar' ? 'primary' : 'default'} 
                      onClick={() => handleChartTypeChange('bar')}
                    >
                      <BarChartIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={timeRange}
                    onChange={handleTimeRangeChange}
                    displayEmpty
                  >
                    <MenuItem value="day">Today</MenuItem>
                    <MenuItem value="week">This Week</MenuItem>
                    <MenuItem value="month">This Month</MenuItem>
                    <MenuItem value="year">This Year</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            }
          />
          <Divider />
          <Box sx={{ p: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="All Visitors" />
              <Tab label="New Users" />
              <Tab label="Returning Users" />
            </Tabs>
          </Box>
          <Box sx={{ height: 300, p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'action.hover' }}>
            <Typography variant="body1" color="text.secondary">
              {chartType === 'line' ? 'Line' : 'Bar'} Chart Visualization would appear here
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {tabValue === 0 ? 'All visitors' : tabValue === 1 ? 'New users' : 'Returning users'} over the selected time period
            </Typography>
          </Box>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardHeader
            title="Traffic Sources"
            action={
              <IconButton size="small">
                <MoreVert fontSize="small" />
              </IconButton>
            }
          />
          <Divider />
          <CardContent sx={{ flexGrow: 1 }}>
            {trafficSources.map((source) => (
              <Box key={source.source} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{source.source}</Typography>
                  <Typography variant="body2">{source.percentage}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={source.percentage} 
                  color={
                    source.source === 'Direct' ? 'primary' :
                    source.source === 'Organic Search' ? 'secondary' :
                    source.source === 'Referral' ? 'success' :
                    source.source === 'Social Media' ? 'info' : 'warning'
                  }
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
            ))}
          </CardContent>
          <Divider />
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              size="small" 
              endIcon={<KeyboardArrowRight />}
            >
              View Details
            </Button>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );

  // Render device usage and conversion funnel
  const renderDeviceAndConversion = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={5}>
        <Card>
          <CardHeader title="Device Usage" />
          <Divider />
          <List>
            {deviceUsage.map((item) => (
              <ListItem key={item.device}>
                <ListItemAvatar>
                  <Avatar 
                    sx={{ 
                      bgcolor: 
                        item.device === 'Desktop' ? 'primary.light' : 
                        item.device === 'Mobile' ? 'secondary.light' : 
                        'info.light' 
                    }}
                  >
                    {item.device === 'Desktop' ? <Laptop /> : item.device === 'Mobile' ? <PhoneAndroid /> : <TabletMac />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={item.device} 
                  secondary={
                    <LinearProgress 
                      variant="determinate" 
                      value={item.percentage} 
                      sx={{ height: 8, borderRadius: 1, mt: 1 }}
                      color={
                        item.device === 'Desktop' ? 'primary' : 
                        item.device === 'Mobile' ? 'secondary' : 
                        'info'
                      }
                    />
                  }
                />
                <ListItemSecondaryAction>
                  <Typography variant="body2">{item.percentage}%</Typography>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Divider />
          <Box sx={{ display: 'flex', p: 2, justifyContent: 'center' }}>
            <Box sx={{ height: 180, width: 180, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'action.hover', borderRadius: '50%' }}>
              <DonutLarge sx={{ fontSize: 40, opacity: 0.5 }} />
            </Box>
          </Box>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={7}>
        <Card>
          <CardHeader title="Conversion Funnel" />
          <Divider />
          <Box sx={{ p: 3 }}>
            {conversionFunnel.map((stage, index) => (
              <Box key={stage.stage} sx={{ mb: index !== conversionFunnel.length - 1 ? 2 : 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{stage.stage}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      {stage.count.toLocaleString()}
                    </Typography>
                    <Chip 
                      label={`${stage.percentage}%`} 
                      size="small" 
                      color={
                        index === 0 ? 'default' :
                        index === conversionFunnel.length - 1 ? 'success' :
                        'primary'
                      }
                      variant={index === 0 ? 'outlined' : 'filled'}
                    />
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={stage.percentage} 
                  color={
                    index === 0 ? 'primary' :
                    index === 1 ? 'secondary' :
                    index === 2 ? 'info' :
                    index === 3 ? 'warning' : 'success'
                  }
                  sx={{ height: 20, borderRadius: 1 }}
                />
                {index !== conversionFunnel.length - 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 0.5 }}>
                    <KeyboardArrowRight color="action" />
                  </Box>
                )}
              </Box>
            ))}
          </Box>
          <Divider />
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              size="small" 
              endIcon={<KeyboardArrowRight />}
            >
              View Detailed Analysis
            </Button>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );

  // Render top products and locations
  const renderTopProductsAndLocations = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader 
            title="Top Performing Products" 
            action={
              <IconButton size="small">
                <MoreVert fontSize="small" />
              </IconButton>
            }
          />
          <Divider />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Bookings</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Rating</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'primary.light', mr: 1, width: 32, height: 32 }}>
                          <HotelOutlined fontSize="small" />
                        </Avatar>
                        <Typography variant="body2">{product.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">{product.bookings}</TableCell>
                    <TableCell align="right">{formatCurrency(product.revenue)}</TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={product.rating.toFixed(1)} 
                        size="small" 
                        color={product.rating >= 4.5 ? 'success' : 'primary'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider />
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              size="small" 
              endIcon={<KeyboardArrowRight />}
            >
              View All Products
            </Button>
          </Box>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader 
            title="Top Locations" 
            action={
              <IconButton size="small">
                <MoreVert fontSize="small" />
              </IconButton>
            }
          />
          <Divider />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Location</TableCell>
                  <TableCell align="right">Bookings</TableCell>
                  <TableCell align="right">Change</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topLocations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'info.light', mr: 1, width: 32, height: 32 }}>
                          <LocationOnOutlined fontSize="small" />
                        </Avatar>
                        <Typography variant="body2">{location.city}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">{location.bookings}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {location.change > 0 ? (
                          <TrendingUp fontSize="small" color="success" sx={{ mr: 0.5 }} />
                        ) : (
                          <TrendingDown fontSize="small" color="error" sx={{ mr: 0.5 }} />
                        )}
                        <Typography
                          variant="body2"
                          color={location.change > 0 ? 'success.main' : 'error.main'}
                        >
                          {Math.abs(location.change)}%
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider />
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              size="small" 
              endIcon={<KeyboardArrowRight />}
            >
              View All Locations
            </Button>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Analytics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<DateRange />}
            sx={{ mr: 1 }}
            variant="outlined"
            size="small"
          >
            {timeRange === 'day' ? 'Today' : 
             timeRange === 'week' ? 'This Week' : 
             timeRange === 'month' ? 'This Month' : 'This Year'}
          </Button>
          <Button
            startIcon={<Refresh />}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
            variant="contained"
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary Cards */}
          {renderSummaryCards()}
          
          {/* Visitor Insights & Traffic Sources */}
          {renderVisitorInsights()}
          
          {/* Device Usage & Conversion Funnel */}
          {renderDeviceAndConversion()}
          
          {/* Top Products & Locations */}
          {renderTopProductsAndLocations()}
        </>
      )}
    </Box>
  );
};

export default Analytics; 