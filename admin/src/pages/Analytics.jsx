import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  IconButton,
  Avatar,
  Tabs,
  Tab,
  LinearProgress,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  MoreVert as MoreIcon,
  DateRange as DateRangeIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  PieChart as PieChartIcon,
  KeyboardArrowRight as ArrowRightIcon,
  Sort as SortIcon,
  ArrowDropDown as DropDownIcon,
  Refresh as RefreshIcon,
  Restaurant as RestaurantIcon,
  Spa as VegetableIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  LocalOffer as DiscountIcon
} from '@mui/icons-material';

// API base URL
const API_URL = 'http://localhost:5003/api/analytics'; // Updated to match the PORT in backend/.env

// API URLs for testing - Only log this when on the Analytics page
// This will be controlled by the isAnalyticsPage check

// Add fallback data
const FALLBACK_DATA = {
  buyerTypes: [
    { source: 'Hotels & Restaurants', percentage: 55, sales: 415620, color: 'primary.main' },
    { source: 'End Consumers', percentage: 23, sales: 173490, color: 'secondary.main' },
    { source: 'Food Processors', percentage: 12, sales: 90450, color: 'success.main' },
    { source: 'Retailers', percentage: 8, sales: 60320, color: 'info.main' },
    { source: 'Charity & Others', percentage: 2, sales: 15080, color: 'warning.main' }
  ],
  salesData: {
    today: 28450,
    yesterday: 26200,
    weekly: 182350,
    monthly: 745620,
    yearToDate: 3214850,
    percentChange: 8.6
  },
  ordersData: {
    today: 156,
    yesterday: 142,
    weekly: 984,
    monthly: 4152,
    yearToDate: 23648,
    percentChange: 9.9
  },
  engagementData: {
    avgOrderValue: 182.5,
    ordersPerBuyer: 3.7,
    cancellationRate: 4.8,
    topProducts: [
      { product: 'Organic Tomatoes', sales: 32450, percentChange: 15.3 },
      { product: 'Fresh Lettuce', sales: 28760, percentChange: 8.7 },
      { product: 'Bell Peppers', sales: 21540, percentChange: -2.1 },
      { product: 'Carrots', sales: 19870, percentChange: 12.4 },
      { product: 'Cucumbers', sales: 15230, percentChange: 6.2 }
    ]
  },
  productCategories: [
    { name: 'Leafy Greens', percentage: 34 },
    { name: 'Root Vegetables', percentage: 28 },
    { name: 'Fruits & Berries', percentage: 22 },
    { name: 'Herbs & Spices', percentage: 16 }
  ],
  transactionTypes: [
    { name: 'Regular Purchase', percentage: 68 },
    { name: 'Urgent Sale', percentage: 22 },
    { name: 'Food Waste Reduction', percentage: 7 },
    { name: 'Bulk Purchase', percentage: 3 }
  ],
  topLocations: [
    { region: 'North Region', sales: 285400, percentage: 38 },
    { region: 'South Region', sales: 225600, percentage: 30 },
    { region: 'East Region', sales: 150320, percentage: 20 },
    { region: 'West Region', sales: 75210, percentage: 10 },
    { region: 'Other Areas', sales: 15080, percentage: 2 }
  ],
  dailySales: [
    { date: '2023-05-14', sales: 25400 },
    { date: '2023-05-15', sales: 27800 },
    { date: '2023-05-16', sales: 32100 },
    { date: '2023-05-17', sales: 24500 },
    { date: '2023-05-18', sales: 29700 },
    { date: '2023-05-19', sales: 26200 },
    { date: '2023-05-20', sales: 28450 }
  ]
};

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

// Test API connection
const testAnalyticsAPI = async () => {
  try {
    console.log('Testing Analytics API connection to:', `${API_URL}/test`);
    const response = await fetchWithRetry(`${API_URL}/test`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Analytics API test successful, received data:', data);
    return true;
  } catch (error) {
    console.error('Analytics API test failed:', error);
    return false;
  }
};

const Analytics = () => {
  const location = useLocation();
  const [period, setPeriod] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [chartType, setChartType] = useState('line');
  const [analyticsData, setAnalyticsData] = useState({
    sales: {},
    orders: {},
    engagement: {},
    buyerTypes: [],
    marketplaceDemographics: {
      productCategories: [],
      transactionTypes: [],
      topLocations: []
    },
    dailySales: []
  });
  
  // Check if we're on the Analytics page
  const isAnalyticsPage = location.pathname.includes('/analytics') || location.pathname === '/dashboard';
  
  // Only log API URL when on Analytics page
  useEffect(() => {
    if (isAnalyticsPage) {
      console.log('Using API URL:', API_URL);
    }
  }, [isAnalyticsPage]);

  // Add a direct API test effect - only run when on the Analytics page
  useEffect(() => {
    if (isAnalyticsPage) {
      console.log('Running direct API test...');
      testAnalyticsAPI();
    }
  }, [isAnalyticsPage]);

  // Fetch analytics data from MongoDB - only when on the Analytics page
  useEffect(() => {
    const fetchData = async () => {
      if (!isAnalyticsPage) {
        return; // Skip API calls if not on Analytics page
      }
      
      setLoading(true);
      
      console.log('Attempting to fetch data from MongoDB...');
      
      // First test if API is working
      const apiWorking = await testAnalyticsAPI();
      console.log('API working:', apiWorking);
      
      try {
        // Using fetch API instead of axios
        let salesData, ordersData, engagementData, buyerTypes, productCategories, transactionTypes, topLocations, dailySales;
        
        try {
          // Fetch sales data
          console.log('Fetching sales data from:', `${API_URL}/salesData`);
          const salesResponse = await fetchWithRetry(`${API_URL}/salesData`);
          console.log('Sales response status:', salesResponse.status);
          
          if (salesResponse.ok) {
            salesData = await salesResponse.json();
            console.log('Sales data received:', salesData);
          } else {
            console.warn('Failed to fetch sales data, using fallback data');
            salesData = FALLBACK_DATA.salesData;
          }
        } catch (error) {
          console.error('Error fetching sales data:', error);
          salesData = FALLBACK_DATA.salesData;
        }
        
        try {
          // Fetch orders data
          const ordersResponse = await fetchWithRetry(`${API_URL}/ordersData`);
          if (ordersResponse.ok) {
            ordersData = await ordersResponse.json();
          } else {
            ordersData = FALLBACK_DATA.ordersData;
          }
        } catch (error) {
          console.error('Error fetching orders data:', error);
          ordersData = FALLBACK_DATA.ordersData;
        }
        
        try {
          // Fetch engagement data
          const engagementResponse = await fetchWithRetry(`${API_URL}/engagementData`);
          if (engagementResponse.ok) {
            engagementData = await engagementResponse.json();
          } else {
            engagementData = FALLBACK_DATA.engagementData;
          }
        } catch (error) {
          console.error('Error fetching engagement data:', error);
          engagementData = FALLBACK_DATA.engagementData;
        }
        
        try {
          // Fetch buyer types
          const buyerTypesResponse = await fetchWithRetry(`${API_URL}/buyerTypes`);
          if (buyerTypesResponse.ok) {
            buyerTypes = await buyerTypesResponse.json();
          } else {
            buyerTypes = FALLBACK_DATA.buyerTypes;
          }
        } catch (error) {
          console.error('Error fetching buyer types:', error);
          buyerTypes = FALLBACK_DATA.buyerTypes;
        }
        
        try {
          // Fetch product categories
          const productCategoriesResponse = await fetchWithRetry(`${API_URL}/productCategories`);
          if (productCategoriesResponse.ok) {
            productCategories = await productCategoriesResponse.json();
          } else {
            productCategories = FALLBACK_DATA.productCategories;
          }
        } catch (error) {
          console.error('Error fetching product categories:', error);
          productCategories = FALLBACK_DATA.productCategories;
        }
        
        try {
          // Fetch transaction types
          const transactionTypesResponse = await fetchWithRetry(`${API_URL}/transactionTypes`);
          if (transactionTypesResponse.ok) {
            transactionTypes = await transactionTypesResponse.json();
          } else {
            transactionTypes = FALLBACK_DATA.transactionTypes;
          }
        } catch (error) {
          console.error('Error fetching transaction types:', error);
          transactionTypes = FALLBACK_DATA.transactionTypes;
        }
        
        try {
          // Fetch top locations
          const topLocationsResponse = await fetchWithRetry(`${API_URL}/topLocations`);
          if (topLocationsResponse.ok) {
            topLocations = await topLocationsResponse.json();
          } else {
            topLocations = FALLBACK_DATA.topLocations;
          }
        } catch (error) {
          console.error('Error fetching top locations:', error);
          topLocations = FALLBACK_DATA.topLocations;
        }
        
        try {
          // Fetch daily sales
          const dailySalesResponse = await fetchWithRetry(`${API_URL}/dailySales`);
          if (dailySalesResponse.ok) {
            dailySales = await dailySalesResponse.json();
          } else {
            dailySales = FALLBACK_DATA.dailySales;
          }
        } catch (error) {
          console.error('Error fetching daily sales:', error);
          dailySales = FALLBACK_DATA.dailySales;
        }
        
        // Ensure arrays are properly initialized
        const validBuyerTypes = Array.isArray(buyerTypes) ? buyerTypes : FALLBACK_DATA.buyerTypes;
        const validProductCategories = Array.isArray(productCategories) ? productCategories : FALLBACK_DATA.productCategories;
        const validTransactionTypes = Array.isArray(transactionTypes) ? transactionTypes : FALLBACK_DATA.transactionTypes;
        const validTopLocations = Array.isArray(topLocations) ? topLocations : FALLBACK_DATA.topLocations;
        const validDailySales = Array.isArray(dailySales) ? dailySales : FALLBACK_DATA.dailySales;
        
        // Combine all data
        setAnalyticsData({
          sales: salesData || FALLBACK_DATA.salesData,
          orders: ordersData || FALLBACK_DATA.ordersData,
          engagement: engagementData || FALLBACK_DATA.engagementData,
          buyerTypes: validBuyerTypes,
          marketplaceDemographics: {
            productCategories: validProductCategories,
            transactionTypes: validTransactionTypes,
            topLocations: validTopLocations
          },
          dailySales: validDailySales
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        
        // Use fallback data if API calls fail
        setAnalyticsData({
          sales: FALLBACK_DATA.salesData,
          orders: FALLBACK_DATA.ordersData,
          engagement: FALLBACK_DATA.engagementData,
          buyerTypes: FALLBACK_DATA.buyerTypes,
          marketplaceDemographics: {
            productCategories: FALLBACK_DATA.productCategories,
            transactionTypes: FALLBACK_DATA.transactionTypes,
            topLocations: FALLBACK_DATA.topLocations
          },
          dailySales: FALLBACK_DATA.dailySales
        });
        
        setLoading(false);
      }
    };
    
    fetchData();
  }, [period, isAnalyticsPage]); // Add isAnalyticsPage as a dependency

  // Handle period change
  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle chart type change
  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0";
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount ? new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount) : "₹0";
  };

  // Refresh data
  const refreshData = async () => {
    setLoading(true);
    try {
      // Using fetch API instead of axios
      let salesData, ordersData, engagementData, buyerTypes, productCategories, transactionTypes, topLocations, dailySales;
      
      try {
        // Fetch sales data
        const salesResponse = await fetchWithRetry(`${API_URL}/salesData`);
        if (salesResponse.ok) {
          salesData = await salesResponse.json();
        } else {
          salesData = FALLBACK_DATA.salesData;
        }
      } catch (error) {
        console.error('Error fetching sales data:', error);
        salesData = FALLBACK_DATA.salesData;
      }
      
      try {
        // Fetch orders data
        const ordersResponse = await fetchWithRetry(`${API_URL}/ordersData`);
        if (ordersResponse.ok) {
          ordersData = await ordersResponse.json();
        } else {
          ordersData = FALLBACK_DATA.ordersData;
        }
      } catch (error) {
        console.error('Error fetching orders data:', error);
        ordersData = FALLBACK_DATA.ordersData;
      }
      
      try {
        // Fetch engagement data
        const engagementResponse = await fetchWithRetry(`${API_URL}/engagementData`);
        if (engagementResponse.ok) {
          engagementData = await engagementResponse.json();
        } else {
          engagementData = FALLBACK_DATA.engagementData;
        }
      } catch (error) {
        console.error('Error fetching engagement data:', error);
        engagementData = FALLBACK_DATA.engagementData;
      }
      
      try {
        // Fetch buyer types
        const buyerTypesResponse = await fetchWithRetry(`${API_URL}/buyerTypes`);
        if (buyerTypesResponse.ok) {
          buyerTypes = await buyerTypesResponse.json();
        } else {
          buyerTypes = FALLBACK_DATA.buyerTypes;
        }
      } catch (error) {
        console.error('Error fetching buyer types:', error);
        buyerTypes = FALLBACK_DATA.buyerTypes;
      }
      
      try {
        // Fetch product categories
        const productCategoriesResponse = await fetchWithRetry(`${API_URL}/productCategories`);
        if (productCategoriesResponse.ok) {
          productCategories = await productCategoriesResponse.json();
        } else {
          productCategories = FALLBACK_DATA.productCategories;
        }
      } catch (error) {
        console.error('Error fetching product categories:', error);
        productCategories = FALLBACK_DATA.productCategories;
      }
      
      try {
        // Fetch transaction types
        const transactionTypesResponse = await fetchWithRetry(`${API_URL}/transactionTypes`);
        if (transactionTypesResponse.ok) {
          transactionTypes = await transactionTypesResponse.json();
        } else {
          transactionTypes = FALLBACK_DATA.transactionTypes;
        }
      } catch (error) {
        console.error('Error fetching transaction types:', error);
        transactionTypes = FALLBACK_DATA.transactionTypes;
      }
      
      try {
        // Fetch top locations
        const topLocationsResponse = await fetchWithRetry(`${API_URL}/topLocations`);
        if (topLocationsResponse.ok) {
          topLocations = await topLocationsResponse.json();
        } else {
          topLocations = FALLBACK_DATA.topLocations;
        }
      } catch (error) {
        console.error('Error fetching top locations:', error);
        topLocations = FALLBACK_DATA.topLocations;
      }
      
      try {
        // Fetch daily sales
        const dailySalesResponse = await fetchWithRetry(`${API_URL}/dailySales`);
        if (dailySalesResponse.ok) {
          dailySales = await dailySalesResponse.json();
        } else {
          dailySales = FALLBACK_DATA.dailySales;
        }
      } catch (error) {
        console.error('Error fetching daily sales:', error);
        dailySales = FALLBACK_DATA.dailySales;
      }
      
      // Ensure arrays are properly initialized
      const validBuyerTypes = Array.isArray(buyerTypes) ? buyerTypes : FALLBACK_DATA.buyerTypes;
      const validProductCategories = Array.isArray(productCategories) ? productCategories : FALLBACK_DATA.productCategories;
      const validTransactionTypes = Array.isArray(transactionTypes) ? transactionTypes : FALLBACK_DATA.transactionTypes;
      const validTopLocations = Array.isArray(topLocations) ? topLocations : FALLBACK_DATA.topLocations;
      const validDailySales = Array.isArray(dailySales) ? dailySales : FALLBACK_DATA.dailySales;
      
      // Combine all data
      setAnalyticsData({
        sales: salesData || FALLBACK_DATA.salesData,
        orders: ordersData || FALLBACK_DATA.ordersData,
        engagement: engagementData || FALLBACK_DATA.engagementData,
        buyerTypes: validBuyerTypes,
        marketplaceDemographics: {
          productCategories: validProductCategories,
          transactionTypes: validTransactionTypes,
          topLocations: validTopLocations
        },
        dailySales: validDailySales
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error refreshing data:', error);
      
      // Use fallback data if API calls fail
      setAnalyticsData({
        sales: FALLBACK_DATA.salesData,
        orders: FALLBACK_DATA.ordersData,
        engagement: FALLBACK_DATA.engagementData,
        buyerTypes: FALLBACK_DATA.buyerTypes,
        marketplaceDemographics: {
          productCategories: FALLBACK_DATA.productCategories,
          transactionTypes: FALLBACK_DATA.transactionTypes,
          topLocations: FALLBACK_DATA.topLocations
        },
        dailySales: FALLBACK_DATA.dailySales
      });
      
      setLoading(false);
    }
  };

  // Render metrics cards
  const renderMetricsCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={4}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Total Sales
              </Typography>
              <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                <BarChartIcon fontSize="small" />
              </Avatar>
            </Box>
            
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              {formatCurrency(analyticsData.sales?.today)}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: analyticsData.sales?.percentChange >= 0 ? 'success.main' : 'error.main',
                mr: 2
              }}>
                {analyticsData.sales?.percentChange >= 0 ? (
                  <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDown fontSize="small" sx={{ mr: 0.5 }} />
                )}
                <Typography variant="body2" fontWeight="bold">
                  {Math.abs(analyticsData.sales?.percentChange || 0)}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                vs yesterday
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Yesterday
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatCurrency(analyticsData.sales?.yesterday)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                This Week
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatCurrency(analyticsData.sales?.weekly)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                This Month
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatCurrency(analyticsData.sales?.monthly)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Marketplace Activity
              </Typography>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
                <CartIcon fontSize="small" />
              </Avatar>
            </Box>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" fontWeight="bold">
                    {analyticsData.orders?.today || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Orders Today
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrency(analyticsData.engagement?.avgOrderValue)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Avg. Order
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" fontWeight="bold">
                    {analyticsData.engagement?.cancellationRate || 0}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Cancelation
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Top Products
            </Typography>
            
            {(analyticsData.engagement?.topProducts && Array.isArray(analyticsData.engagement.topProducts) 
              ? analyticsData.engagement.topProducts.slice(0, 3) 
              : []
            ).map((product, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: index < 2 ? 1.5 : 0 }}>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {product.product}
                </Typography>
                <Typography variant="body2" sx={{ mx: 2 }}>
                  {formatCurrency(product.sales)}
                </Typography>
                <Chip 
                  label={`${product.percentChange > 0 ? '+' : ''}${product.percentChange}%`}
                  size="small"
                  color={product.percentChange >= 0 ? 'success' : 'error'}
                  sx={{ minWidth: 60 }}
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Buyer Types
              </Typography>
              <Avatar sx={{ bgcolor: 'success.main', width: 36, height: 36 }}>
                <PieChartIcon fontSize="small" />
              </Avatar>
            </Box>
            
            {(analyticsData.buyerTypes && Array.isArray(analyticsData.buyerTypes) ? analyticsData.buyerTypes : [])
              .map((buyer, index) => (
              <Box key={index} sx={{ mb: index < analyticsData.buyerTypes?.length - 1 ? 2 : 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{buyer.source}</Typography>
                  <Typography variant="body2" fontWeight="medium">{buyer.percentage}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={buyer.percentage} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'background.default',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: buyer.color
                    }
                  }} 
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Render sales chart
  const renderSalesChart = () => (
    <Card sx={{ borderRadius: 3, mb: 4 }}>
      <CardHeader
        title="Sales Overview"
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mr: 2 }}>
              <IconButton 
                size="small" 
                color={chartType === 'line' ? 'primary' : 'default'} 
                onClick={() => handleChartTypeChange('line')}
              >
                <LineChartIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                color={chartType === 'bar' ? 'primary' : 'default'} 
                onClick={() => handleChartTypeChange('bar')}
                sx={{ mx: 1 }}
              >
                <BarChartIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                color={chartType === 'pie' ? 'primary' : 'default'} 
                onClick={() => handleChartTypeChange('pie')}
              >
                <PieChartIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={period}
                onChange={handlePeriodChange}
                displayEmpty
                variant="outlined"
                renderValue={(value) => {
                  const labels = {
                    '24hours': 'Last 24 Hours',
                    '7days': 'Last 7 Days',
                    '30days': 'Last 30 Days',
                    '90days': 'Last 90 Days'
                  };
                  return labels[value] || value;
                }}
                sx={{ 
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider'
                  }
                }}
              >
                <MenuItem value="24hours">Last 24 Hours</MenuItem>
                <MenuItem value="7days">Last 7 Days</MenuItem>
                <MenuItem value="30days">Last 30 Days</MenuItem>
                <MenuItem value="90days">Last 90 Days</MenuItem>
              </Select>
            </FormControl>
          </Box>
        }
      />
      
      <Divider />
      
      <Box sx={{ p: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          sx={{ mb: 2 }}
        >
          <Tab label="Sales Revenue" />
          <Tab label="Number of Orders" />
          <Tab label="Quantity Sold (kg)" />
        </Tabs>
        
        <Box sx={{ 
          height: 300, 
          width: '100%', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          borderRadius: 2
        }}>
          <Typography color="text.secondary">
            {chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart visualization would be displayed here
          </Typography>
        </Box>
      </Box>
    </Card>
  );

  // Render marketplace demographics
  const renderMarketplaceDemographics = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={4}>
        <Card sx={{ borderRadius: 3, height: '100%' }}>
          <CardHeader 
            title="Product Categories" 
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
          />
          <Divider />
          <CardContent>
            {(analyticsData.marketplaceDemographics.productCategories && 
              Array.isArray(analyticsData.marketplaceDemographics.productCategories) 
                ? analyticsData.marketplaceDemographics.productCategories 
                : []
            ).map((category, index) => (
              <Box key={index} sx={{ mb: index < analyticsData.marketplaceDemographics.productCategories?.length - 1 ? 2 : 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{category.name}</Typography>
                  <Typography variant="body2" fontWeight="medium">{category.percentage}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={category.percentage} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'background.default',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: index === 0 ? 'primary.main' : index === 1 ? 'secondary.main' : index === 2 ? 'info.main' : 'success.main'
                    }
                  }} 
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card sx={{ borderRadius: 3, height: '100%' }}>
          <CardHeader 
            title="Transaction Types" 
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
          />
          <Divider />
          <CardContent>
            {(analyticsData.marketplaceDemographics.transactionTypes && 
              Array.isArray(analyticsData.marketplaceDemographics.transactionTypes) 
                ? analyticsData.marketplaceDemographics.transactionTypes 
                : []
            ).map((type, index) => (
              <Box key={index} sx={{ mb: index < analyticsData.marketplaceDemographics.transactionTypes?.length - 1 ? 1 : 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{type.name}</Typography>
                  <Typography variant="body2" fontWeight="medium">{type.percentage}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={type.percentage} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'background.default',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: index === 0 ? 'primary.main' : 
                              index === 1 ? 'warning.main' : 
                              index === 2 ? 'success.main' : 'info.main'
                    }
                  }} 
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card sx={{ borderRadius: 3, height: '100%' }}>
          <CardHeader 
            title="Top Regions" 
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
            action={
              <IconButton size="small">
                <MoreIcon fontSize="small" />
              </IconButton>
            }
          />
          <Divider />
          <CardContent sx={{ px: 0 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Region</TableCell>
                    <TableCell align="right">Sales</TableCell>
                    <TableCell align="right">%</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(analyticsData.marketplaceDemographics.topLocations && 
                    Array.isArray(analyticsData.marketplaceDemographics.topLocations) 
                      ? analyticsData.marketplaceDemographics.topLocations 
                      : []
                  ).map((location, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{location.region}</TableCell>
                      <TableCell align="right">{formatCurrency(location.sales)}</TableCell>
                      <TableCell align="right">{location.percentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4
      }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Marketplace Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track sales, orders, and marketplace performance
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<DateRangeIcon />}
            sx={{ 
              mr: 2,
              borderRadius: 2
            }}
          >
            {period === '24hours' ? 'Last 24 Hours' : 
             period === '7days' ? 'Last 7 Days' : 
             period === '30days' ? 'Last 30 Days' : 'Last 90 Days'}
          </Button>
          
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={refreshData}
            sx={{ 
              borderRadius: 2
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {/* Main Content */}
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: 400
        }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Metrics Cards */}
          {renderMetricsCards()}
          
          {/* Sales Chart */}
          {renderSalesChart()}
          
          {/* Marketplace Demographics */}
          {renderMarketplaceDemographics()}
        </>
      )}
    </Box>
  );
};

export default Analytics; 