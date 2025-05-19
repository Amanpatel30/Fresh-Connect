import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { 
  DownloadOutlined, 
  PrintOutlined, 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  FilterList as FilterIcon,
  FileDownload as ExportIcon,
  DateRange as DateRangeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Sample data for report demonstration
const SAMPLE_SALES_DATA = [
  { id: 1, date: '2023-05-20', orderCount: 120, revenue: 15600.50, category: 'Hotels', avgOrderValue: 130.00 },
  { id: 2, date: '2023-05-19', orderCount: 98, revenue: 12450.75, category: 'Hotels', avgOrderValue: 127.05 },
  { id: 3, date: '2023-05-18', orderCount: 115, revenue: 14280.25, category: 'Hotels', avgOrderValue: 124.18 },
  { id: 4, date: '2023-05-17', orderCount: 145, revenue: 18250.00, category: 'Hotels', avgOrderValue: 125.86 },
  { id: 5, date: '2023-05-16', orderCount: 135, revenue: 17125.50, category: 'Hotels', avgOrderValue: 126.86 },
  { id: 6, date: '2023-05-15', orderCount: 112, revenue: 14335.60, category: 'Hotels', avgOrderValue: 128.00 },
  { id: 7, date: '2023-05-14', orderCount: 85, revenue: 10625.75, category: 'Hotels', avgOrderValue: 125.01 },
  { id: 8, date: '2023-05-13', orderCount: 95, revenue: 12350.25, category: 'Hotels', avgOrderValue: 130.00 },
  { id: 9, date: '2023-05-12', orderCount: 110, revenue: 13750.00, category: 'Hotels', avgOrderValue: 125.00 },
  { id: 10, date: '2023-05-11', orderCount: 125, revenue: 15625.00, category: 'Hotels', avgOrderValue: 125.00 },
];

const SAMPLE_USER_DATA = [
  { id: 1, date: '2023-05-20', newUsers: 450, activeUsers: 2800, conversionRate: 4.2 },
  { id: 2, date: '2023-05-19', newUsers: 410, activeUsers: 2750, conversionRate: 3.9 },
  { id: 3, date: '2023-05-18', newUsers: 380, activeUsers: 2600, conversionRate: 4.1 },
  { id: 4, date: '2023-05-17', newUsers: 425, activeUsers: 2900, conversionRate: 4.5 },
  { id: 5, date: '2023-05-16', newUsers: 390, activeUsers: 2650, conversionRate: 4.3 },
  { id: 6, date: '2023-05-15', newUsers: 360, activeUsers: 2500, conversionRate: 3.8 },
  { id: 7, date: '2023-05-14', newUsers: 310, activeUsers: 2400, conversionRate: 3.5 },
  { id: 8, date: '2023-05-13', newUsers: 350, activeUsers: 2550, conversionRate: 4.0 },
  { id: 9, date: '2023-05-12', newUsers: 400, activeUsers: 2700, conversionRate: 4.2 },
  { id: 10, date: '2023-05-11', newUsers: 420, activeUsers: 2800, conversionRate: 4.4 },
];

const SAMPLE_PRODUCT_DATA = [
  { id: 1, name: 'Grand Plaza Hotel', orders: 250, revenue: 45001.00, category: 'Luxury Hotel' },
  { id: 2, name: 'Mountain View Resort', orders: 180, revenue: 32400.00, category: 'Resort' },
  { id: 3, name: 'City Center Inn', orders: 210, revenue: 27300.00, category: 'Budget Hotel' },
  { id: 4, name: 'Beachside Villa', orders: 120, revenue: 30000.00, category: 'Villa' },
  { id: 5, name: 'Lakefront Cottage', orders: 95, revenue: 21850.00, category: 'Cottage' },
  { id: 6, name: 'Historic Mansion', orders: 75, revenue: 18750.00, category: 'Specialty' },
  { id: 7, name: 'Downtown Apartment', orders: 220, revenue: 33000.00, category: 'Apartment' },
  { id: 8, name: 'Luxury Penthouse', orders: 60, revenue: 24000.00, category: 'Luxury Apartment' },
  { id: 9, name: 'Riverside Cabin', orders: 85, revenue: 17000.00, category: 'Cabin' },
  { id: 10, name: 'Family Resort Suite', orders: 150, revenue: 30000.00, category: 'Resort' },
];

const ReportGeneration = () => {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('week');
  const [startDate, setStartDate] = useState(getDateString(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));
  const [endDate, setEndDate] = useState(getDateString(new Date()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [category, setCategory] = useState('all');
  const [chartView, setChartView] = useState('bar');
  
  // Sample report data based on the report type
  const [reportData, setReportData] = useState([]);

  // Helper function to format date as YYYY-MM-DD
  function getDateString(date) {
    return date.toISOString().split('T')[0];
  }

  // Fetch report data
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real application, this would be API calls with filters
        // For demo, using setTimeout to simulate API calls
        setTimeout(() => {
          if (reportType === 'sales') {
            setReportData(SAMPLE_SALES_DATA);
          } else if (reportType === 'users') {
            setReportData(SAMPLE_USER_DATA);
          } else if (reportType === 'products') {
            setReportData(SAMPLE_PRODUCT_DATA);
          }
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [reportType, dateRange, startDate, endDate, category]);

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle report type change
  const handleReportTypeChange = (event) => {
    setReportType(event.target.value);
    setPage(0);
  };

  // Handle date range change
  const handleDateRangeChange = (event) => {
    const range = event.target.value;
    setDateRange(range);
    
    const today = new Date();
    let start = new Date();
    
    if (range === 'today') {
      start = new Date(today);
    } else if (range === 'week') {
      start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === 'month') {
      start = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    } else if (range === 'quarter') {
      start = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
    } else if (range === 'year') {
      start = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    }
    
    setStartDate(getDateString(start));
    setEndDate(getDateString(today));
  };

  // Handle start date change
  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  // Handle end date change
  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  // Handle page change for table pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change for table pagination
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle category filter change
  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  // Handle chart view change
  const handleChartViewChange = (view) => {
    setChartView(view);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Render filter panel
  const renderFilterPanel = () => (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              onChange={handleReportTypeChange}
              label="Report Type"
            >
              <MenuItem value="sales">Sales Report</MenuItem>
              <MenuItem value="users">User Analytics</MenuItem>
              <MenuItem value="products">Product Performance</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              onChange={handleDateRangeChange}
              label="Date Range"
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="quarter">Last 90 Days</MenuItem>
              <MenuItem value="year">Last 365 Days</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {dateRange === 'custom' && (
          <>
            <Grid item xs={12} md={3}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                fullWidth
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                fullWidth
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </>
        )}
        {reportType === 'products' && (
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={handleCategoryChange}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="hotel">Hotels</MenuItem>
                <MenuItem value="resort">Resorts</MenuItem>
                <MenuItem value="apartment">Apartments</MenuItem>
                <MenuItem value="villa">Villas</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
        <Grid item xs={12} md={dateRange === 'custom' ? 12 : 3} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
          <Stack direction="row" spacing={1}>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 800);
              }}
            >
              Refresh
            </Button>
            <Button 
              variant="contained" 
              startIcon={<ExportIcon />}
            >
              Export
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );

  // Render report summary cards
  const renderSummaryCards = () => {
    if (reportType === 'sales') {
      // Calculate totals for sales report
      const totalOrders = reportData.reduce((sum, item) => sum + item.orderCount, 0);
      const totalRevenue = reportData.reduce((sum, item) => sum + item.revenue, 0);
      const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
      
      return (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Orders
                </Typography>
                <Typography variant="h4" component="div">
                  {totalOrders.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  For the selected period
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h4" component="div">
                  {formatCurrency(totalRevenue)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  For the selected period
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Average Order Value
                </Typography>
                <Typography variant="h4" component="div">
                  {formatCurrency(avgOrderValue)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  For the selected period
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Daily Average Revenue
                </Typography>
                <Typography variant="h4" component="div">
                  {formatCurrency(totalRevenue / reportData.length)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  For the selected period
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    } else if (reportType === 'users') {
      // Calculate totals for user report
      const totalNewUsers = reportData.reduce((sum, item) => sum + item.newUsers, 0);
      const avgActiveUsers = reportData.reduce((sum, item) => sum + item.activeUsers, 0) / reportData.length;
      const avgConversionRate = reportData.reduce((sum, item) => sum + item.conversionRate, 0) / reportData.length;
      
      return (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total New Users
                </Typography>
                <Typography variant="h4" component="div">
                  {totalNewUsers.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  For the selected period
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Average Active Users
                </Typography>
                <Typography variant="h4" component="div">
                  {avgActiveUsers.toFixed(0).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Daily average for the period
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Average Conversion Rate
                </Typography>
                <Typography variant="h4" component="div">
                  {avgConversionRate.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  For the selected period
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    } else if (reportType === 'products') {
      // Calculate totals for product report
      const totalProducts = reportData.length;
      const totalOrders = reportData.reduce((sum, item) => sum + item.orders, 0);
      const totalRevenue = reportData.reduce((sum, item) => sum + item.revenue, 0);
      const avgRevenuePerProduct = totalRevenue / totalProducts;
      
      return (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Products
                </Typography>
                <Typography variant="h4" component="div">
                  {totalProducts.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  In the selected category
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Orders
                </Typography>
                <Typography variant="h4" component="div">
                  {totalOrders.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  For the selected period
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h4" component="div">
                  {formatCurrency(totalRevenue)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  For the selected period
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Avg. Revenue Per Product
                </Typography>
                <Typography variant="h4" component="div">
                  {formatCurrency(avgRevenuePerProduct)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  For the selected period
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }
    
    return null;
  };

  // Render data visualization section
  const renderDataVisualization = () => (
    <Card sx={{ mb: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="data visualization tabs"
        >
          <Tab label="Chart" />
          <Tab label="Table" />
        </Tabs>
      </Box>
      
      {tabValue === 0 && (
        <>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Bar Chart">
                <IconButton 
                  color={chartView === 'bar' ? 'primary' : 'default'} 
                  onClick={() => handleChartViewChange('bar')}
                >
                  <BarChartIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Line Chart">
                <IconButton 
                  color={chartView === 'line' ? 'primary' : 'default'} 
                  onClick={() => handleChartViewChange('line')}
                >
                  <LineChartIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Pie Chart">
                <IconButton 
                  color={chartView === 'pie' ? 'primary' : 'default'} 
                  onClick={() => handleChartViewChange('pie')}
                >
                  <PieChartIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
          
          <Box sx={{ height: 300, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'action.hover' }}>
            <Typography variant="body1" color="text.secondary">
              {chartView.charAt(0).toUpperCase() + chartView.slice(1)} Chart Visualization would appear here
            </Typography>
          </Box>
        </>
      )}
      
      {tabValue === 1 && renderDataTable()}
    </Card>
  );

  // Render data table based on report type
  const renderDataTable = () => {
    if (reportType === 'sales') {
      return (
        <Box>
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Orders</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Avg. Order Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell align="right">{row.orderCount}</TableCell>
                      <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell align="right">{formatCurrency(row.avgOrderValue)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={reportData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      );
    } else if (reportType === 'users') {
      return (
        <Box>
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">New Users</TableCell>
                  <TableCell align="right">Active Users</TableCell>
                  <TableCell align="right">Conversion Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell align="right">{row.newUsers}</TableCell>
                      <TableCell align="right">{row.activeUsers}</TableCell>
                      <TableCell align="right">{row.conversionRate}%</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={reportData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      );
    } else if (reportType === 'products') {
      return (
        <Box>
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Orders</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell align="right">{row.orders}</TableCell>
                      <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={reportData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      );
    }
    
    return null;
  };

  // Render saved reports section
  const renderSavedReports = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Saved Reports
        </Typography>
        <List dense>
          <ListItem button>
            <ListItemText 
              primary="Monthly Sales Summary" 
              secondary="Sales Report • Last updated: May 1, 2023"
            />
          </ListItem>
          <Divider component="li" />
          <ListItem button>
            <ListItemText 
              primary="User Growth Analysis" 
              secondary="User Analytics • Last updated: Apr 15, 2023"
            />
          </ListItem>
          <Divider component="li" />
          <ListItem button>
            <ListItemText 
              primary="Top Performing Products" 
              secondary="Product Performance • Last updated: Apr 10, 2023"
            />
          </ListItem>
          <Divider component="li" />
          <ListItem button>
            <ListItemText 
              primary="Q1 Financial Summary" 
              secondary="Sales Report • Last updated: Apr 1, 2023"
            />
          </ListItem>
        </List>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button variant="outlined" size="small">View All Saved Reports</Button>
        </Box>
      </CardContent>
    </Card>
  );

  // Render export options
  const renderExportOptions = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Export Options
        </Typography>
        <Stack spacing={2}>
          <Button variant="outlined" startIcon={<DownloadOutlined />} fullWidth>
            Export as PDF
          </Button>
          <Button variant="outlined" startIcon={<DownloadOutlined />} fullWidth>
            Export as Excel
          </Button>
          <Button variant="outlined" startIcon={<DownloadOutlined />} fullWidth>
            Export as CSV
          </Button>
          <Button variant="outlined" startIcon={<PrintOutlined />} fullWidth>
            Print Report
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Report Generation
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Filter Panel */}
      {renderFilterPanel()}
      
      {/* Main Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
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
            
            <Box sx={{ mt: 3 }}>
              {/* Export Options */}
              {renderExportOptions()}
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ReportGeneration; 