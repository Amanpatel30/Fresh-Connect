import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  IconButton,
  Avatar,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  CalendarToday,
  SaveAlt,
  GetApp,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  PieChart as PieChartIcon,
  TableChart as TableIcon,
  Delete as DeleteIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// API URLs
const REPORTS_API_URL = 'http://localhost:5001/api/reports';
const SALES_API_URL = 'http://localhost:5001/api/reports/sales';
const USERS_API_URL = 'http://localhost:5001/api/reports/users';
const PRODUCTS_API_URL = 'http://localhost:5001/api/reports/products';

// Function to test API connection
const testReportsAPI = async () => {
  try {
    const response = await fetch(REPORTS_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    console.log('Reports API test successful');
    return { success: true, data };
  } catch (error) {
    console.error('Reports API test error:', error);
    return { success: false, error: error.message };
  }
};

// Sample data
const FALLBACK_REPORTS = [
  { id: 1, name: 'Monthly Sales Overview', createdAt: '2023-05-10', category: 'sales' },
  { id: 2, name: 'User Activity Summary', createdAt: '2023-05-05', category: 'user' },
  { id: 3, name: 'Product Performance Q2', createdAt: '2023-04-28', category: 'product' },
  { id: 4, name: 'Regional Sales Comparison', createdAt: '2023-04-22', category: 'sales' },
  { id: 5, name: 'User Retention Analysis', createdAt: '2023-04-15', category: 'user' }
];

const FALLBACK_SALES_DATA = [
  { date: '2023-05-01', revenue: 12500, orders: 165, avgOrderValue: 75.76 },
  { date: '2023-05-02', revenue: 14200, orders: 187, avgOrderValue: 75.94 },
  { date: '2023-05-03', revenue: 16800, orders: 221, avgOrderValue: 76.02 },
  { date: '2023-05-04', revenue: 15500, orders: 198, avgOrderValue: 78.28 },
  { date: '2023-05-05', revenue: 18900, orders: 241, avgOrderValue: 78.42 },
  { date: '2023-05-06', revenue: 21500, orders: 276, avgOrderValue: 77.90 },
  { date: '2023-05-07', revenue: 23100, orders: 292, avgOrderValue: 79.11 }
];

const FALLBACK_USER_DATA = [
  { date: '2023-05-01', newUsers: 145, activeUsers: 1876, churnRate: 2.1 },
  { date: '2023-05-02', newUsers: 156, activeUsers: 1912, churnRate: 2.3 },
  { date: '2023-05-03', newUsers: 183, activeUsers: 2045, churnRate: 1.8 },
  { date: '2023-05-04', newUsers: 176, activeUsers: 2154, churnRate: 1.9 },
  { date: '2023-05-05', newUsers: 201, activeUsers: 2265, churnRate: 1.7 },
  { date: '2023-05-06', newUsers: 214, activeUsers: 2387, churnRate: 1.5 },
  { date: '2023-05-07', newUsers: 198, activeUsers: 2435, churnRate: 1.6 }
];

const FALLBACK_PRODUCT_DATA = [
  { id: 'P001', name: 'Premium Plan', totalSales: 367, revenue: 36700, refunds: 12 },
  { id: 'P002', name: 'Basic Plan', totalSales: 982, revenue: 49100, refunds: 23 },
  { id: 'P003', name: 'Enterprise Plan', totalSales: 143, revenue: 71500, refunds: 5 },
  { id: 'P004', name: 'Add-on: API Access', totalSales: 276, revenue: 8280, refunds: 9 },
  { id: 'P005', name: 'Add-on: Extra Storage', totalSales: 321, revenue: 6420, refunds: 14 }
];

const ReportGeneration = () => {
  const location = useLocation();
  const [apiWorking, setApiWorking] = useState(false);
  
  // State
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('7days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [viewType, setViewType] = useState('chart');
  const [savedReports, setSavedReports] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [chartType, setChartType] = useState('line');

  // Check if we're on the Report Generation page
  const isReportPage = location.pathname === '/report-generation';
  
  // Only log API URL when on Report Generation page
  useEffect(() => {
    if (isReportPage) {
      console.log('Using Reports API URL:', REPORTS_API_URL);
    }
  }, [isReportPage]);

  // Test API connection
  useEffect(() => {
    const testAPI = async () => {
      if (!isReportPage) {
        return; // Skip API calls if not on Report Generation page
      }
      
      console.log('Testing Reports API connection...');
      const result = await testReportsAPI();
      setApiWorking(result.success);
    };
    
    testAPI();
  }, [isReportPage]);

  // Format date for display (YYYY-MM-DD)
  const formatDate = (date) => {
    return date ? date.split('T')[0] : '';
  };

  // Load saved reports
  useEffect(() => {
    const fetchSavedReports = async () => {
      if (!isReportPage) {
        return; // Skip API calls if not on Report Generation page
      }
      
      try {
        const response = await fetch(REPORTS_API_URL);
        if (response.ok) {
          const data = await response.json();
          // Format data if needed
          const formattedReports = data.map(report => ({
            id: report._id || report.id,
            name: report.name || report.title,
            createdAt: formatDate(report.createdAt),
            category: report.category || report.type || 'sales'
          }));
          setSavedReports(formattedReports);
        } else {
          // Use fallback data
          setSavedReports(FALLBACK_REPORTS);
        }
      } catch (error) {
        console.error('Error fetching saved reports:', error);
        // Use fallback data
        setSavedReports(FALLBACK_REPORTS);
      }
    };
    
    fetchSavedReports();
  }, [isReportPage]);

  // Load report data based on type and date range
  useEffect(() => {
    const fetchReportData = async () => {
      if (!isReportPage) {
        return; // Skip API calls if not on Report Generation page
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Set the correct API URL based on report type
        let apiUrl = '';
        switch (reportType) {
          case 'sales':
            apiUrl = SALES_API_URL;
            break;
          case 'user':
            apiUrl = USERS_API_URL;
            break;
          case 'product':
            apiUrl = PRODUCTS_API_URL;
            break;
          default:
            apiUrl = SALES_API_URL;
        }
        
        // Add date range parameters
        apiUrl += `?startDate=${startDate}&endDate=${endDate}`;
        
        const response = await fetch(apiUrl);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data && data.length > 0) {
            // Format data if needed
            let formattedData = [];
            
            if (reportType === 'sales') {
              formattedData = data.map(item => ({
                date: formatDate(item.date),
                revenue: item.revenue || 0,
                orders: item.orders || 0,
                avgOrderValue: item.avgOrderValue || (item.revenue / item.orders) || 0
              }));
            } else if (reportType === 'user') {
              formattedData = data.map(item => ({
                date: formatDate(item.date),
                newUsers: item.newUsers || 0,
                activeUsers: item.activeUsers || 0,
                churnRate: item.churnRate || 0
              }));
            } else if (reportType === 'product') {
              formattedData = data.map(item => ({
                id: item.productId || item.id,
                name: item.productName || item.name,
                totalSales: item.totalSales || 0,
                revenue: item.revenue || 0,
                refunds: item.refunds || 0
              }));
            }
            
            setReportData(formattedData);
          } else {
            // Use fallback data based on report type
            switch (reportType) {
              case 'sales':
                setReportData(FALLBACK_SALES_DATA);
                break;
              case 'user':
                setReportData(FALLBACK_USER_DATA);
                break;
              case 'product':
                setReportData(FALLBACK_PRODUCT_DATA);
                break;
              default:
                setReportData([]);
            }
          }
        } else {
          // Use fallback data based on report type
          switch (reportType) {
            case 'sales':
              setReportData(FALLBACK_SALES_DATA);
              break;
            case 'user':
              setReportData(FALLBACK_USER_DATA);
              break;
            case 'product':
              setReportData(FALLBACK_PRODUCT_DATA);
              break;
            default:
              setReportData([]);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch report data:', err);
        setError('Failed to fetch report data. Please try again.');
        
        // Use fallback data based on report type
        switch (reportType) {
          case 'sales':
            setReportData(FALLBACK_SALES_DATA);
            break;
          case 'user':
            setReportData(FALLBACK_USER_DATA);
            break;
          case 'product':
            setReportData(FALLBACK_PRODUCT_DATA);
            break;
          default:
            setReportData([]);
        }
        
        setLoading(false);
      }
    };
    
    // Set default dates if not already set
    if (!startDate || !endDate) {
      const today = new Date();
      let start = new Date();
      
      if (dateRange === '7days') {
        start.setDate(today.getDate() - 7);
      } else if (dateRange === '30days') {
        start.setMonth(today.getMonth() - 1);
      } else if (dateRange === '90days') {
        start.setMonth(today.getMonth() - 3);
      }
      
      setStartDate(formatDate(start.toISOString()));
      setEndDate(formatDate(today.toISOString()));
    } else {
      fetchReportData();
    }
  }, [isReportPage, reportType, dateRange, startDate, endDate]);

  // Handle report type change
  const handleReportTypeChange = (event) => {
    setReportType(event.target.value);
  };

  // Handle date range change
  const handleDateRangeChange = (event) => {
    setDateRange(event.target.value);
    
    // Set start and end dates based on selected range
    const today = new Date();
    let start = new Date();
    
    if (event.target.value === '7days') {
      start.setDate(today.getDate() - 7);
    } else if (event.target.value === '30days') {
      start.setMonth(today.getMonth() - 1);
    } else if (event.target.value === '90days') {
      start.setMonth(today.getMonth() - 3);
    } else if (event.target.value === 'custom') {
      // Keep custom date range if already set, otherwise default to last 7 days
      if (!startDate) {
        start.setDate(today.getDate() - 7);
        setStartDate(formatDate(start.toISOString()));
      }
      if (!endDate) {
        setEndDate(formatDate(today.toISOString()));
      }
      return;
    }
    
    setStartDate(formatDate(start.toISOString()));
    setEndDate(formatDate(today.toISOString()));
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle chart type change
  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  // Save current report
  const handleSaveReport = async () => {
    if (!isReportPage) {
      return; // Skip API calls if not on Report Generation page
    }
    
    const newReport = {
      name: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${new Date().toLocaleDateString()}`,
      createdAt: formatDate(new Date().toISOString()),
      category: reportType,
      startDate: startDate,
      endDate: endDate,
      data: reportData
    };
    
    try {
      const response = await fetch(REPORTS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReport),
      });
      
      if (response.ok) {
        const savedReport = await response.json();
        const formattedReport = {
          id: savedReport._id || savedReport.id,
          name: savedReport.name,
          createdAt: formatDate(savedReport.createdAt),
          category: savedReport.category
        };
        
        setSavedReports([formattedReport, ...savedReports]);
      } else {
        // Fallback: add report to local state only
        setSavedReports([{
          id: savedReports.length + 1,
          ...newReport
        }, ...savedReports]);
      }
    } catch (error) {
      console.error('Error saving report:', error);
      // Fallback: add report to local state only
      setSavedReports([{
        id: savedReports.length + 1,
        ...newReport
      }, ...savedReports]);
    }
  };

  // Delete saved report
  const handleDeleteReport = async (id) => {
    if (!isReportPage) {
      return; // Skip API calls if not on Report Generation page
    }
    
    try {
      const response = await fetch(`${REPORTS_API_URL}/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSavedReports(savedReports.filter(report => report.id !== id));
      } else {
        // Fallback: remove from local state only
        setSavedReports(savedReports.filter(report => report.id !== id));
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      // Fallback: remove from local state only
      setSavedReports(savedReports.filter(report => report.id !== id));
    }
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Refresh data
  const refreshData = async () => {
    if (!isReportPage) {
      return; // Skip API calls if not on Report Generation page
    }
    
    setLoading(true);
    
    try {
      // Set the correct API URL based on report type
      let apiUrl = '';
      switch (reportType) {
        case 'sales':
          apiUrl = SALES_API_URL;
          break;
        case 'user':
          apiUrl = USERS_API_URL;
          break;
        case 'product':
          apiUrl = PRODUCTS_API_URL;
          break;
        default:
          apiUrl = SALES_API_URL;
      }
      
      // Add date range parameters
      apiUrl += `?startDate=${startDate}&endDate=${endDate}`;
      
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data && data.length > 0) {
          // Format data if needed
          let formattedData = [];
          
          if (reportType === 'sales') {
            formattedData = data.map(item => ({
              date: formatDate(item.date),
              revenue: item.revenue || 0,
              orders: item.orders || 0,
              avgOrderValue: item.avgOrderValue || (item.revenue / item.orders) || 0
            }));
          } else if (reportType === 'user') {
            formattedData = data.map(item => ({
              date: formatDate(item.date),
              newUsers: item.newUsers || 0,
              activeUsers: item.activeUsers || 0,
              churnRate: item.churnRate || 0
            }));
          } else if (reportType === 'product') {
            formattedData = data.map(item => ({
              id: item.productId || item.id,
              name: item.productName || item.name,
              totalSales: item.totalSales || 0,
              revenue: item.revenue || 0,
              refunds: item.refunds || 0
            }));
          }
          
          setReportData(formattedData);
        }
      }
    } catch (err) {
      console.error('Failed to refresh report data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Render summary cards based on report type
  const renderSummaryCards = () => {
    if (reportType === 'sales') {
      // Calculate totals
      const totalRevenue = reportData.reduce((sum, day) => sum + day.revenue, 0);
      const totalOrders = reportData.reduce((sum, day) => sum + day.orders, 0);
      const avgOrderValue = totalRevenue / totalOrders || 0;
      
      return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>$</Avatar>
                  <Typography variant="h6" fontWeight="medium">Total Revenue</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  ${formatNumber(totalRevenue)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  From {startDate} to {endDate}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>#</Avatar>
                  <Typography variant="h6" fontWeight="medium">Total Orders</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {formatNumber(totalOrders)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  From {startDate} to {endDate}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>Avg</Avatar>
                  <Typography variant="h6" fontWeight="medium">Avg Order Value</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  ${avgOrderValue.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  From {startDate} to {endDate}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    } else if (reportType === 'user') {
      // Calculate totals
      const totalNewUsers = reportData.reduce((sum, day) => sum + day.newUsers, 0);
      const avgActiveUsers = Math.round(
        reportData.reduce((sum, day) => sum + day.activeUsers, 0) / reportData.length
      );
      const avgChurnRate = 
        reportData.reduce((sum, day) => sum + day.churnRate, 0) / reportData.length;
      
      return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>New</Avatar>
                  <Typography variant="h6" fontWeight="medium">New Users</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {formatNumber(totalNewUsers)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  From {startDate} to {endDate}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>Act</Avatar>
                  <Typography variant="h6" fontWeight="medium">Avg Active Users</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {formatNumber(avgActiveUsers)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  From {startDate} to {endDate}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>Ch</Avatar>
                  <Typography variant="h6" fontWeight="medium">Avg Churn Rate</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {avgChurnRate.toFixed(2)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  From {startDate} to {endDate}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    } else if (reportType === 'product') {
      // Calculate totals
      const totalSales = reportData.reduce((sum, product) => sum + product.totalSales, 0);
      const totalRevenue = reportData.reduce((sum, product) => sum + product.revenue, 0);
      const totalRefunds = reportData.reduce((sum, product) => sum + product.refunds, 0);
      
      return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>S</Avatar>
                  <Typography variant="h6" fontWeight="medium">Total Sales</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {formatNumber(totalSales)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Across all products
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>$</Avatar>
                  <Typography variant="h6" fontWeight="medium">Total Revenue</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  ${formatNumber(totalRevenue)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Across all products
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>R</Avatar>
                  <Typography variant="h6" fontWeight="medium">Total Refunds</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {formatNumber(totalRefunds)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Across all products
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }
    
    return null;
  };

  // Render data visualization
  const renderDataVisualization = () => {
    if (viewType === 'chart') {
      return (
        <Card sx={{ borderRadius: 3, mb: 4 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              {reportType === 'sales' ? 'Sales Trend' : 
               reportType === 'user' ? 'User Activity' : 'Product Performance'}
            </Typography>
            
            <Box>
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
          </Box>
          
          <Divider />
          
          <Box sx={{ 
            height: 300, 
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            borderRadius: '0 0 16px 16px'
          }}>
            <Typography color="text.secondary">
              {chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart visualization would be displayed here
            </Typography>
          </Box>
        </Card>
      );
    } else {
      return (
        <Card sx={{ borderRadius: 3, mb: 4, overflow: 'hidden' }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              {reportType === 'sales' ? 'Sales Data' : 
               reportType === 'user' ? 'User Data' : 'Product Data'}
            </Typography>
            
            <Button
              variant="text"
              size="small"
              startIcon={<GetApp />}
              onClick={() => {}}
            >
              Export
            </Button>
          </Box>
          
          <Divider />
          
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  {reportType === 'sales' && (
                    <>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">Orders</TableCell>
                      <TableCell align="right">Avg Order Value</TableCell>
                    </>
                  )}
                  
                  {reportType === 'user' && (
                    <>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">New Users</TableCell>
                      <TableCell align="right">Active Users</TableCell>
                      <TableCell align="right">Churn Rate (%)</TableCell>
                    </>
                  )}
                  
                  {reportType === 'product' && (
                    <>
                      <TableCell>Product ID</TableCell>
                      <TableCell>Product Name</TableCell>
                      <TableCell align="right">Total Sales</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">Refunds</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {reportType === 'sales' && reportData.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{row.date}</TableCell>
                    <TableCell align="right">${formatNumber(row.revenue)}</TableCell>
                    <TableCell align="right">{formatNumber(row.orders)}</TableCell>
                    <TableCell align="right">${row.avgOrderValue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                
                {reportType === 'user' && reportData.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{row.date}</TableCell>
                    <TableCell align="right">{formatNumber(row.newUsers)}</TableCell>
                    <TableCell align="right">{formatNumber(row.activeUsers)}</TableCell>
                    <TableCell align="right">{row.churnRate.toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
                
                {reportType === 'product' && reportData.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{formatNumber(row.totalSales)}</TableCell>
                    <TableCell align="right">${formatNumber(row.revenue)}</TableCell>
                    <TableCell align="right">{formatNumber(row.refunds)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      );
    }
  };

  // Render saved reports section
  const renderSavedReports = () => (
    <Card sx={{ borderRadius: 3 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Saved Reports
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Quick access to your saved reports
        </Typography>
      </Box>
      
      <Divider />
      
      <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
        {savedReports.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No saved reports</Typography>
          </Box>
        ) : (
          savedReports.map((report) => (
            <Box key={report.id} sx={{ p: 2, '&:not(:last-child)': { borderBottom: 1, borderColor: 'divider' } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {report.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                      {report.createdAt}
                    </Typography>
                    <Chip 
                      label={report.category} 
                      size="small" 
                      color={
                        report.category === 'sales' ? 'primary' : 
                        report.category === 'user' ? 'secondary' : 'success'
                      }
                      sx={{ height: 20, fontSize: '0.625rem' }}
                    />
                  </Box>
                </Box>
                
                <Box>
                  <IconButton size="small" sx={{ mr: 1 }}>
                    <ShareIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteReport(report.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Card>
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
            Report Generation
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and analyze detailed reports
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<BookmarkIcon />}
            onClick={handleSaveReport}
            sx={{ 
              mr: 2,
              borderRadius: 2
            }}
          >
            Save Report
          </Button>
          
          <Button
            variant="contained"
            startIcon={<GetApp />}
            sx={{ 
              borderRadius: 2
            }}
          >
            Export
          </Button>
        </Box>
      </Box>
      
      {/* Filter Panel */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={9}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Report Filters
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Report Type</InputLabel>
                    <Select
                      value={reportType}
                      label="Report Type"
                      onChange={handleReportTypeChange}
                    >
                      <MenuItem value="sales">Sales Report</MenuItem>
                      <MenuItem value="user">User Report</MenuItem>
                      <MenuItem value="product">Product Report</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Date Range</InputLabel>
                    <Select
                      value={dateRange}
                      label="Date Range"
                      onChange={handleDateRangeChange}
                    >
                      <MenuItem value="7days">Last 7 Days</MenuItem>
                      <MenuItem value="30days">Last 30 Days</MenuItem>
                      <MenuItem value="90days">Last 90 Days</MenuItem>
                      <MenuItem value="custom">Custom Range</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Start Date"
                    type="date"
                    size="small"
                    fullWidth
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    disabled={dateRange !== 'custom'}
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <TextField
                    label="End Date"
                    type="date"
                    size="small"
                    fullWidth
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    disabled={dateRange !== 'custom'}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button 
                  variant="text" 
                  size="small" 
                  sx={{ mr: 1 }}
                  onClick={() => {
                    setReportType('sales');
                    setDateRange('7days');
                    handleDateRangeChange({ target: { value: '7days' } });
                  }}
                >
                  Reset
                </Button>
                
                <Button 
                  variant="contained" 
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={refreshData}
                >
                  Generate Report
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                View Options
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  bgcolor: 'background.default', 
                  borderRadius: 3, 
                  p: 0.5 
                }}>
                  <Button
                    variant={viewType === 'chart' ? 'contained' : 'text'}
                    size="small"
                    onClick={() => setViewType('chart')}
                    sx={{ 
                      borderRadius: 2,
                      minWidth: 100 
                    }}
                  >
                    Chart
                  </Button>
                  <Button
                    variant={viewType === 'table' ? 'contained' : 'text'}
                    size="small"
                    onClick={() => setViewType('table')}
                    sx={{ 
                      borderRadius: 2,
                      minWidth: 100 
                    }}
                  >
                    Table
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
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
      ) : error ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: 400
        }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={9}>
            {/* Summary Cards */}
            {renderSummaryCards()}
            
            {/* Data Visualization */}
            {renderDataVisualization()}
          </Grid>
          
          <Grid item xs={12} md={3}>
            {/* Saved Reports */}
            {renderSavedReports()}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ReportGeneration; 