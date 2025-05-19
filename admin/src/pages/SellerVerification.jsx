import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Paper,
  Link,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  FormControlLabel,
  Switch,
  CardMedia,
  CardActions,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  RemoveRedEye as ViewIcon,
  VerifiedUser as VerifiedIcon,
  Block as BlockIcon,
  AccessTime as PendingIcon,
  ArrowDropDown as DropDownIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  Restaurant as RestaurantIcon,
  Store as StoreIcon,
  LocalShipping as ShippingIcon,
  EmojiPeople as CustomerIcon,
  Nature as EcoIcon,
  LocalOffer as OfferIcon,
  Spa as OrganicIcon,
  Visibility as InspectionIcon,
  Assignment as CertificateIcon,
  LocationOn as LocationIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Book as BookIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

// API URLs
const SELLERS_API_URL = '/api/admin/users?role=seller';
const SELLERS_STATS_API_URL = '/api/admin/users/stats';

// Local storage key for backup
const LOCAL_STORAGE_SELLERS_KEY = 'vegetable_sellers_data';
const LOCAL_STORAGE_TIMESTAMP_KEY = 'vegetable_sellers_timestamp';

// Function to test API connection
const testSellersAPI = async () => {
  try {
    const response = await fetch(SELLERS_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    console.log('Sellers API test successful, received data:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Sellers API test error:', error);
    return { success: false, error: error.message };
  }
};

// Document type labels
const DOCUMENT_TYPES = {
  businessCertificate: 'Business Certificate',
  taxIdentification: 'Tax Identification',
  identityProof: 'Identity Proof',
  addressProof: 'Address Proof',
  organicCertification: 'Organic Certification',
  pesticideUsageDeclaration: 'Pesticide Usage Declaration'
};

// Verification checklist items
const VERIFICATION_CHECKLIST = [
  { id: 1, title: 'Document Verification', description: 'Verify all submitted documents for authenticity' },
  { id: 2, title: 'Farm Inspection', description: 'Physical inspection of farm and growing conditions' },
  { id: 3, title: 'Produce Quality Check', description: 'Sample testing of vegetables for quality and safety' },
  { id: 4, title: 'Pesticide Residue Test', description: 'Laboratory testing for pesticide residue levels' },
  { id: 5, title: 'Farming Practices Review', description: 'Review of farming methods and sustainability practices' },
  { id: 6, title: 'Water Source Verification', description: 'Verification of water source quality used for irrigation' }
];

const SellerVerification = () => {
  const location = useLocation();
  const [apiWorking, setApiWorking] = useState(true);
  
  // Initialize with empty data instead of mock data
  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [farmingTypeFilter, setFarmingTypeFilter] = useState('all');
  const [inspectionStatusFilter, setInspectionStatusFilter] = useState('all');
  const [checklistItems, setChecklistItems] = useState([]);
  const [openChecklistDialog, setOpenChecklistDialog] = useState(false);
  const [openInspectionDialog, setOpenInspectionDialog] = useState(false);
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [isPremiumSeller, setIsPremiumSeller] = useState(false);
  const [certificationFilter, setCertificationFilter] = useState('all');
  const [productsDialogOpen, setProductsDialogOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  // Notification states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // Initialize stats with empty data
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    organic: 0,
    conventional: 0,
    mixed: 0,
    premium: 0
  });

  // State
  const [tabValue, setTabValue] = useState(0);

  // Check if we're on the Seller Verification page
  const isSellerVerificationPage = location.pathname === '/seller-verification';
  
  // Only log API URL when on Seller Verification page
  useEffect(() => {
    if (isSellerVerificationPage) {
      console.log('Using Sellers API URL:', SELLERS_API_URL);
    }
  }, [isSellerVerificationPage]);

  // Test API connection
  useEffect(() => {
    const testAPI = async () => {
      if (!isSellerVerificationPage) {
        return; // Skip API calls if not on Seller Verification page
      }
      
      console.log('Testing Sellers API connection...');
      const result = await testSellersAPI();
      setApiWorking(result.success);
    };
    
    testAPI();
  }, [isSellerVerificationPage]);

  // Function to save sellers to local storage as a backup
  const saveSellersToLocalStorage = (sellersData) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SELLERS_KEY, JSON.stringify(sellersData));
      localStorage.setItem(LOCAL_STORAGE_TIMESTAMP_KEY, Date.now().toString());
      console.log('Sellers data saved to local storage');
    } catch (error) {
      console.error('Error saving to local storage:', error);
    }
  };

  // Function to load sellers from local storage
  const loadSellersFromLocalStorage = () => {
    try {
      const sellersData = localStorage.getItem(LOCAL_STORAGE_SELLERS_KEY);
      if (sellersData) {
        return JSON.parse(sellersData);
      }
    } catch (error) {
      console.error('Error loading from local storage:', error);
    }
    return null;
  };

  // Load sellers data
  useEffect(() => {
    const fetchSellers = async () => {
      if (!isSellerVerificationPage) {
        return; // Skip API calls if not on Seller Verification page
      }
      
      setLoading(true);
      console.log('Fetching sellers from API...');
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        const response = await fetch(SELLERS_API_URL, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response:', data);
        
        // Extract sellers from the response (which might be wrapped in a data property)
        const sellersData = Array.isArray(data) ? data : (data.sellers || data.data || []);
        
        // Filter to ensure we only process seller records
        const onlySellers = sellersData.filter(user => user.role === 'seller');
        
        console.log('Sellers data from API:', onlySellers.length);
        
        // Format the data based on the actual MongoDB structure
        const formattedSellers = onlySellers.map(seller => ({
          id: seller._id,
          name: seller.name || seller.shopName || 'Unnamed Seller',
          ownerName: seller.name,
          contactEmail: seller.email,
          contactPhone: seller.phone,
          category: 'Vegetable Seller',
          location: seller.address || seller.shopAddress || 'Location not specified',
          farmSize: 'N/A',
          farmingType: 'Mixed',
          submittedDate: seller.createdAt ? new Date(seller.createdAt).toISOString().split('T')[0] : 'N/A',
          status: seller.isVerified ? 'Approved' : (seller.verificationRejected ? 'Rejected' : 'Pending'),
          documents: {
            businessCertificate: seller.documents?.gst?.status === 'approved',
            taxIdentification: seller.documents?.pan?.status === 'approved',
            identityProof: seller.documents?.fssai?.status === 'approved',
            addressProof: seller.documents?.shopLicense?.status === 'approved',
            organicCertification: false,
            pesticideUsageDeclaration: false
          },
          productsOffered: [],
          inspectionStatus: 'Not Scheduled',
          inspectionDate: '',
          notes: seller.verificationNotes || '',
          isPremium: false
        }));
        
        // Update state
        setSellers(formattedSellers);
        setFilteredSellers(formattedSellers);
        setTotalCount(formattedSellers.length);
        
        // Update stats
        const calculatedStats = calculateStatsFromSellers(formattedSellers);
        setStats(calculatedStats);
        
        setApiWorking(true);
      } catch (error) {
        console.error('Error fetching sellers:', error);
        setApiWorking(false);
        
        if (error.name === 'AbortError') {
          alert('Request timed out. Please try again.');
        } else {
          alert('Failed to fetch sellers. Please check your connection and try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchSellers();
    
    // Initialize checklist items
    setChecklistItems(
      VERIFICATION_CHECKLIST.map(item => ({
        ...item,
        completed: false,
        notes: ''
      }))
    );
  }, [isSellerVerificationPage]);

  // Filter sellers based on tab, search query, and filters
  useEffect(() => {
    if (!sellers || sellers.length === 0) {
      setFilteredSellers([]);
      return;
    }
    
    console.log('Filtering sellers, current tab:', tabValue);
    console.log('Total sellers before filtering:', sellers.length);
    
    let result = [...sellers];
    
    // Filter by tab
    if (tabValue === 1) {
      result = result.filter(seller => seller.status === 'Pending');
    } else if (tabValue === 2) {
      result = result.filter(seller => seller.status === 'Approved');
    } else if (tabValue === 3) {
      result = result.filter(seller => seller.status === 'Rejected');
    } else if (tabValue === 4) {
      result = result.filter(seller => seller.isPremium === true);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        seller => 
          (seller.name?.toLowerCase() || '').includes(query) || 
          (seller.ownerName?.toLowerCase() || '').includes(query) ||
          (seller.contactEmail?.toLowerCase() || '').includes(query) ||
          (seller.location?.toLowerCase() || '').includes(query)
      );
    }
    
    // Filter by status if the "All" tab is selected
    if (tabValue === 0 && statusFilter !== 'all') {
      result = result.filter(seller => seller.status === statusFilter);
    }
    
    // Filter by farming type
    if (farmingTypeFilter !== 'all') {
      result = result.filter(seller => seller.farmingType === farmingTypeFilter);
    }
    
    // Filter by inspection status
    if (inspectionStatusFilter !== 'all') {
      result = result.filter(seller => seller.inspectionStatus === inspectionStatusFilter);
    }
    
    // Filter by certification
    if (certificationFilter !== 'all') {
      result = result.filter(seller => {
        if (certificationFilter === 'Certified') {
          return seller.documents?.organicCertification === true;
        } else if (certificationFilter === 'Not Certified') {
          return seller.documents?.organicCertification === false;
        } else if (certificationFilter === 'Pending') {
          return seller.documents?.organicCertification === undefined;
        }
        return true;
      });
    }
    
    console.log('Filtered sellers:', result.length);
    setFilteredSellers(result);
    // Update total count for proper pagination
    setTotalCount(result.length);
  }, [sellers, tabValue, searchQuery, statusFilter, farmingTypeFilter, inspectionStatusFilter, certificationFilter]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };
  
  // Handle search query change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing rows per page
  };
  
  // Handle seller selection for verification
  const handleSellerSelect = (seller) => {
    setSelectedSeller(seller);
    setVerificationNotes(seller.notes || '');
    setOpenDialog(true);
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Handle verification notes change
  const handleNotesChange = (event) => {
    setVerificationNotes(event.target.value);
  };
  
  // Handle verification action (approve or reject)
  const handleVerificationAction = async (action) => {
    if (!selectedSeller) {
      return;
    }
    
    setLoading(true);
    
    try {
      const updatedStatus = action === 'approve' ? 'Approved' : 'Rejected';
      const isApproving = action === 'approve';
      
      // Create a copy of the current seller with updated status
      const updatedSeller = {
        ...selectedSeller,
        status: updatedStatus,
        notes: verificationNotes,
        isPremium: isPremiumSeller
      };
      
      // Update the main sellers array with the updated seller first (for immediate UI feedback)
      const updatedSellers = sellers.map(seller => 
        seller.id === selectedSeller.id ? updatedSeller : seller
      );
      
      // Save to state
      setSellers(updatedSellers);
      setFilteredSellers(updatedSellers);
      
      // Close dialog
      setOpenDialog(false);
      
      // Recalculate stats
      const updatedStats = calculateStatsFromSellers(updatedSellers);
      setStats(updatedStats);
      
      console.log('Updating seller status:', selectedSeller.id, 'to', updatedStatus);
      
      // Try to sync with the server
      try {
        // Correct API endpoint - use /api/admin/sellers/:id/verify instead of /api/admin/users/:id/verify
        const response = await fetch(`/api/admin/sellers/${selectedSeller.id}/verify`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          body: JSON.stringify({
            approved: isApproving,
            notes: verificationNotes,
            isPremium: isPremiumSeller
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('Server response:', responseData);
        
        // Show success notification
        showNotification(`Seller ${action === 'approve' ? 'approved' : 'rejected'} successfully!`, 'success');
        
        // Refresh data from server after 1 second to get the latest state
        setTimeout(() => refreshData(), 1000);
      } catch (error) {
        console.error('Error updating seller status on server:', error);
        showNotification(`Seller ${action === 'approve' ? 'approved' : 'rejected'} locally only. Server update failed: ${error.message}`, 'warning');
      }
    } catch (error) {
      console.error('Error in handleVerificationAction:', error);
      showNotification('An error occurred while processing your request.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };
  
  // Handle farming type filter change
  const handleFarmingTypeFilterChange = (event) => {
    setFarmingTypeFilter(event.target.value);
    setPage(0);
  };
  
  // Handle inspection status filter change
  const handleInspectionStatusFilterChange = (event) => {
    setInspectionStatusFilter(event.target.value);
    setPage(0);
  };
  
  // Handle checklist item toggle
  const handleChecklistItemToggle = (id) => {
    setChecklistItems(
      checklistItems.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };
  
  // Handle checklist item notes change
  const handleChecklistItemNotesChange = (id, notes) => {
    setChecklistItems(
      checklistItems.map(item =>
        item.id === id ? { ...item, notes } : item
      )
    );
  };
  
  // Handle open checklist dialog
  const handleOpenChecklistDialog = () => {
    setOpenChecklistDialog(true);
  };
  
  // Handle close checklist dialog
  const handleCloseChecklistDialog = () => {
    setOpenChecklistDialog(false);
  };
  
  // Handle open inspection dialog
  const handleOpenInspectionDialog = (seller) => {
    setSelectedSeller(seller);
    setInspectionDate(seller.inspectionDate || '');
    setInspectionNotes('');
    setOpenInspectionDialog(true);
  };
  
  // Handle close inspection dialog
  const handleCloseInspectionDialog = () => {
    setOpenInspectionDialog(false);
  };
  
  // Handle schedule inspection
  const handleScheduleInspection = () => {
    const updatedSellers = sellers.map(seller => 
      seller.id === selectedSeller.id 
        ? { 
            ...seller, 
            inspectionStatus: 'Scheduled',
            inspectionDate: inspectionDate,
            notes: seller.notes + (seller.notes ? '; ' : '') + 'Inspection scheduled for ' + inspectionDate + (inspectionNotes ? ': ' + inspectionNotes : '')
          } 
        : seller
    );
    
    setSellers(updatedSellers);
    setOpenInspectionDialog(false);
  };
  
  // Handle complete inspection
  const handleCompleteInspection = (result) => {
    const updatedSellers = sellers.map(seller => 
      seller.id === selectedSeller.id 
        ? { 
            ...seller, 
            inspectionStatus: result === 'pass' ? 'Completed' : 'Failed',
            notes: seller.notes + (seller.notes ? '; ' : '') + 
                  (result === 'pass' ? 'Inspection passed' : 'Inspection failed') + 
                  (inspectionNotes ? ': ' + inspectionNotes : '')
          } 
        : seller
    );
    
    setSellers(updatedSellers);
    setOpenInspectionDialog(false);
  };
  
  // Handle view products
  const handleViewProducts = (seller) => {
    // Set the selected seller
    setSelectedSeller(seller);
    
    // Open the products dialog
    setProductsDialogOpen(true);
  };
  
  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <VerifiedIcon fontSize="small" />;
      case 'Pending':
        return <PendingIcon fontSize="small" />;
      case 'Rejected':
        return <BlockIcon fontSize="small" />;
      default:
        return null;
    }
  };
  
  // Get farming type icon
  const getFarmingTypeIcon = (type) => {
    switch (type) {
      case 'Organic':
        return <OrganicIcon fontSize="small" />;
      case 'Conventional':
        return <StoreIcon fontSize="small" />;
      case 'Mixed':
        return <EcoIcon fontSize="small" />;
      default:
        return null;
    }
  };
  
  // Get inspection status color
  const getInspectionStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Scheduled':
        return 'info';
      case 'Not Scheduled':
        return 'warning';
      case 'Failed':
        return 'error';
      default:
        return 'default';
    }
  };

  // Handle certification filter change
  const handleCertificationFilterChange = (event) => {
    setCertificationFilter(event.target.value);
  };

  // Close products dialog
  const handleCloseProductsDialog = () => {
    setProductsDialogOpen(false);
  };

  // Calculate stats from sellers data
  const calculateStatsFromSellers = (sellersData) => {
    if (!sellersData || sellersData.length === 0) {
      console.log("No sellers data to calculate stats");
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        organic: 0,
        conventional: 0,
        mixed: 0,
        premium: 0
      };
    }
    
    console.log(`Calculating stats from ${sellersData.length} sellers`);
    
    const newStats = {
      total: sellersData.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      organic: 0,
      conventional: 0,
      mixed: 0,
      premium: 0
    };
    
    sellersData.forEach(seller => {
      // Count by status
      if (seller.status === 'Pending') newStats.pending++;
      else if (seller.status === 'Approved') newStats.approved++;
      else if (seller.status === 'Rejected') newStats.rejected++;
      
      // Count by farming type
      if (seller.farmingType === 'Organic') newStats.organic++;
      else if (seller.farmingType === 'Conventional') newStats.conventional++;
      else if (seller.farmingType === 'Mixed') newStats.mixed++;
      
      // Count premium sellers
      if (seller.isPremium) newStats.premium++;
    });
    
    console.log("Calculated stats:", newStats);
    return newStats;
  };

  // Ensure stats are updated in useEffect when component mounts
  useEffect(() => {
    if (sellers && sellers.length > 0) {
      console.log(`Updating stats from ${sellers.length} sellers`);
      const calculatedStats = calculateStatsFromSellers(sellers);
      setStats(calculatedStats);
      console.log("Updated stats:", calculatedStats);
    }
  }, [sellers]);

  // Refresh data function with improved error handling
  const refreshData = async () => {
    if (!isSellerVerificationPage) {
      return;
    }
    
    setLoading(true);
    console.log('Refreshing data from API...');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(SELLERS_API_URL, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API refresh response:', data);
      
      // Extract sellers from the response
      const sellersData = Array.isArray(data) ? data : (data.sellers || data.data || []);
      
      // Filter to ensure we only process seller records
      const onlySellers = sellersData.filter(user => user.role === 'seller');
      
      console.log('Sellers data from API refresh:', onlySellers.length);
      
      // Format the data based on the actual MongoDB structure
      const formattedSellers = onlySellers.map(seller => ({
        id: seller._id,
        name: seller.name || seller.shopName || 'Unnamed Seller',
        ownerName: seller.name,
        contactEmail: seller.email,
        contactPhone: seller.phone,
        category: 'Vegetable Seller',
        location: seller.address || seller.shopAddress || 'Location not specified',
        farmSize: 'N/A',
        farmingType: 'Mixed',
        submittedDate: seller.createdAt ? new Date(seller.createdAt).toISOString().split('T')[0] : 'N/A',
        status: seller.isVerified ? 'Approved' : (seller.verificationRejected ? 'Rejected' : 'Pending'),
        documents: {
          businessCertificate: seller.documents?.gst?.status === 'approved',
          taxIdentification: seller.documents?.pan?.status === 'approved',
          identityProof: seller.documents?.fssai?.status === 'approved',
          addressProof: seller.documents?.shopLicense?.status === 'approved',
          organicCertification: false,
          pesticideUsageDeclaration: false
        },
        productsOffered: [],
        inspectionStatus: 'Not Scheduled',
        inspectionDate: '',
        notes: seller.verificationNotes || '',
        isPremium: false
      }));
      
      // Update state
      setSellers(formattedSellers);
      setFilteredSellers(formattedSellers);
      setTotalCount(formattedSellers.length);
      
      // Update stats
      const calculatedStats = calculateStatsFromSellers(formattedSellers);
      setStats(calculatedStats);
      
      setApiWorking(true);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setApiWorking(false);
      
      // We do NOT reset the data on refresh errors
      // to preserve the current view
      
      if (error.name === 'AbortError') {
        showNotification('Request timed out. Please try again.', 'error');
      } else {
        showNotification('Failed to refresh data. Please check your connection and try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle notification display
  const showNotification = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Handle closing the notification
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

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
            Vegetable Seller Verification
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Verify sellers to ensure quality vegetables for hotel partners
          </Typography>
        </Box>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<CertificateIcon />}
            sx={{ borderRadius: 2, mr: 2 }}
            onClick={handleOpenChecklistDialog}
          >
            Verification Checklist
          </Button>
          
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{ borderRadius: 2 }}
          >
            Export List
          </Button>
        </Box>
      </Box>
      
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Vegetable Sellers
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {stats.total}
              </Typography>
              <Box sx={{ 
                mt: 2, 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <StoreIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  All applications
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Pending Verification
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.pending}
              </Typography>
              <Box sx={{ 
                mt: 2, 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <PendingIcon fontSize="small" sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Awaiting review
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Verified Sellers
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.approved}
              </Typography>
              <Box sx={{ 
                mt: 2, 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <VerifiedIcon fontSize="small" sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Quality assured
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Organic Farms
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {stats.organic}
              </Typography>
              <Box sx={{ 
                mt: 2, 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <OrganicIcon fontSize="small" sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Certified organic
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Backend server connection warning */}
      {!apiWorking && (
        <Card sx={{ borderRadius: 3, mb: 4, bgcolor: 'error.light' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WarningIcon color="error" sx={{ mr: 2 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" color="error">
                  Database Connection Error
                </Typography>
                <Typography variant="body2">
                  Cannot connect to the database. The API server is not responding. Please verify that your backend server 
                  is running at http://localhost:5001. This page only displays data directly from the MongoDB database.
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  setApiWorking(true); // Reset API status
                  refreshData(); // Try to refresh
                }}
              >
                Retry Connection
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
      
      {/* Filters and Search */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            flexWrap: { xs: 'wrap', md: 'nowrap' }
          }}>
            <TextField
              placeholder="Search by name, owner, location..."
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              sx={{ 
                minWidth: { xs: '100%', md: 300 },
                mr: { md: 2 },
                mb: { xs: 2, md: 0 }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
            
            {tabValue === 0 && (
              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: { xs: '100%', sm: 150 },
                  mr: { md: 2 },
                  mb: { xs: 2, md: 0 }
                }}
              >
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={handleStatusFilterChange}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            )}
            
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: { xs: '100%', sm: 150 },
                mr: { md: 2 },
                mb: { xs: 2, md: 0 }
              }}
            >
              <InputLabel>Farming Type</InputLabel>
              <Select
                value={farmingTypeFilter}
                label="Farming Type"
                onChange={handleFarmingTypeFilterChange}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="Organic">Organic</MenuItem>
                <MenuItem value="Conventional">Conventional</MenuItem>
                <MenuItem value="Mixed">Mixed</MenuItem>
                <MenuItem value="Hydroponic">Hydroponic</MenuItem>
                <MenuItem value="Permaculture">Permaculture</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: { xs: '100%', sm: 150 },
                mr: { md: 2 },
                mb: { xs: 2, md: 0 }
              }}
            >
              <InputLabel>Certification</InputLabel>
              <Select
                value={certificationFilter}
                label="Certification"
                onChange={handleCertificationFilterChange}
              >
                <MenuItem value="all">All Certifications</MenuItem>
                <MenuItem value="Not Certified">Not Certified</MenuItem>
                <MenuItem value="Pending">Pending Certification</MenuItem>
                <MenuItem value="Certified">Certified</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: { xs: '100%', sm: 150 },
                mr: { md: 2 },
                mb: { xs: 2, md: 0 }
              }}
            >
              <InputLabel>Inspection</InputLabel>
              <Select
                value={inspectionStatusFilter}
                label="Inspection"
                onChange={handleInspectionStatusFilterChange}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="Not Scheduled">Not Scheduled</MenuItem>
                <MenuItem value="Scheduled">Scheduled</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ ml: { md: 'auto' }, display: 'flex' }}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                sx={{ mr: 1 }}
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setFarmingTypeFilter('all');
                  setCertificationFilter('all');
                  setInspectionStatusFilter('all');
                }}
              >
                Clear
              </Button>
              
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={refreshData}
              >
                Refresh
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      {/* Tabs and Table */}
      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ 
            px: 2, 
            pt: 2, 
            borderBottom: 1, 
            borderColor: 'divider' 
          }}
        >
          <Tab label="All Sellers" />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="span">Pending</Typography>
                <Chip 
                  label={stats.pending} 
                  size="small" 
                  color="warning"
                  sx={{ ml: 1, height: 20 }}
                />
              </Box>
            }
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="span">Approved</Typography>
                <Chip 
                  label={stats.approved} 
                  size="small" 
                  color="success"
                  sx={{ ml: 1, height: 20 }}
                />
              </Box>
            }
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="span">Rejected</Typography>
                <Chip 
                  label={stats.rejected} 
                  size="small" 
                  color="error"
                  sx={{ ml: 1, height: 20 }}
                />
              </Box>
            }
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="span">Premium Sellers</Typography>
                <Chip 
                  label={stats.premium} 
                  size="small" 
                  color="primary"
                  sx={{ ml: 1, height: 20 }}
                />
              </Box>
            }
          />
        </Tabs>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'background.default' }}>
                  <TableRow>
                    <TableCell>Seller Details</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Submission Date</TableCell>
                    <TableCell>Document Status</TableCell>
                    <TableCell>Verification Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSellers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">
                          No sellers found matching your criteria
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSellers
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((seller) => (
                        <TableRow key={seller.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="medium">
                                {seller.name}
                                {seller.isPremium && (
                                  <Chip 
                                    label="Premium" 
                                    size="small" 
                                    color="primary"
                                    sx={{ ml: 1, height: 20 }}
                                  />
                                )}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {seller.ownerName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {seller.contactEmail}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{seller.category}</TableCell>
                          <TableCell>{seller.submittedDate}</TableCell>
                          <TableCell>
                            <Box>
                              {seller.documents && Object.entries(seller.documents).map(([key, value], index) => (
                                <Box key={key} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                  {value ? (
                                    <CheckIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                                  ) : (
                                    <ClearIcon fontSize="small" color="error" sx={{ mr: 1 }} />
                                  )}
                                  <Typography variant="caption">
                                    {DOCUMENT_TYPES[key]}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(seller.status)}
                              label={seller.status}
                              color={getStatusColor(seller.status)}
                              size="small"
                            />
                            {seller.notes && (
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                Note: {seller.notes}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<ViewIcon />}
                              onClick={() => handleSellerSelect(seller)}
                              sx={{ borderRadius: 2, mr: 1 }}
                            >
                              Verify
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              color="primary"
                              onClick={() => handleViewProducts(seller)}
                              sx={{ borderRadius: 2 }}
                            >
                              Products
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              component="div"
              count={filteredSellers.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
            />
          </>
        )}
      </Card>
      
      {/* Verification Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedSeller && (
          <>
            <DialogTitle>
              Seller Verification: {selectedSeller.name}
              {selectedSeller.isPremium && (
                <Chip 
                  label="Premium Seller" 
                  size="small" 
                  color="primary"
                  sx={{ ml: 1 }}
                />
              )}
            </DialogTitle>
            
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Business Details
                  </Typography>
                  
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            Business Name
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            {selectedSeller.name}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            Category
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            {selectedSeller.category}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            Owner Name
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            {selectedSeller.ownerName}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            Submission Date
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            {selectedSeller.submittedDate}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            Contact Email
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            {selectedSeller.contactEmail}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            Contact Phone
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            {selectedSeller.contactPhone}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            Farming Type
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            {selectedSeller.farmingType || "Not specified"}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            Certification Status
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            {selectedSeller.certificationStatus || "Not certified"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                  
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Verification Notes
                  </Typography>
                  
                  <TextField
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="Add verification notes here..."
                    value={verificationNotes}
                    onChange={handleNotesChange}
                    variant="outlined"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={isPremiumSeller}
                        onChange={(e) => setIsPremiumSeller(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Mark as Premium Seller"
                    sx={{ mt: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Document Verification
                  </Typography>
                  
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <List sx={{ py: 0 }}>
                      {Object.entries(selectedSeller.documents).map(([key, value], index) => (
                        <React.Fragment key={key}>
                          {index > 0 && <Divider />}
                          <Box sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {value ? (
                                  <Avatar sx={{ bgcolor: 'success.light', width: 32, height: 32, mr: 2 }}>
                                    <CheckIcon fontSize="small" />
                                  </Avatar>
                                ) : (
                                  <Avatar sx={{ bgcolor: 'error.light', width: 32, height: 32, mr: 2 }}>
                                    <ClearIcon fontSize="small" />
                                  </Avatar>
                                )}
                                
                                <Box>
                                  <Typography variant="subtitle2">
                                    {DOCUMENT_TYPES[key]}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {value ? 'Document Provided' : 'Document Missing'}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Button
                                variant="text"
                                size="small"
                                disabled={!value}
                              >
                                View Document
                              </Button>
                            </Box>
                          </Box>
                        </React.Fragment>
                      ))}
                    </List>
                  </Card>
                  
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Current Status
                  </Typography>
                  
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {getStatusIcon(selectedSeller.status)}
                      <Typography variant="body1" fontWeight="medium" sx={{ ml: 1 }}>
                        {selectedSeller.status}
                      </Typography>
                    </Box>
                    
                    {selectedSeller.notes && (
                      <Typography variant="body2" color="text.secondary">
                        Note: {selectedSeller.notes}
                      </Typography>
                    )}
                  </Box>
                  
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Inspection Schedule
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Inspection Date"
                          type="date"
                          fullWidth
                          InputLabelProps={{
                            shrink: true,
                          }}
                          value={inspectionDate || ''}
                          onChange={(e) => setInspectionDate(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Button 
                          variant="contained" 
                          color="primary"
                          fullWidth
                          disabled={!inspectionDate}
                          onClick={handleScheduleInspection}
                          sx={{ height: '56px' }}
                        >
                          Schedule Inspection
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button 
                onClick={handleCloseDialog}
                variant="outlined"
              >
                Cancel
              </Button>
              
              <Button
                onClick={() => handleVerificationAction('reject')}
                variant="contained"
                color="error"
                startIcon={<BlockIcon />}
              >
                Reject
              </Button>
              
              <Button
                onClick={() => handleVerificationAction('approve')}
                variant="contained"
                color="success"
                startIcon={<VerifiedIcon />}
              >
                Approve
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Products Dialog */}
      <Dialog
        open={productsDialogOpen}
        onClose={handleCloseProductsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedSeller ? `Products from ${selectedSeller.name}` : 'Products'}
          <IconButton
            aria-label="close"
            onClick={handleCloseProductsDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedSeller && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Seller Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{selectedSeller.location}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{selectedSeller.contactPhone}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{selectedSeller.contactEmail}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">Selling since: {selectedSeller.dateJoined}</Typography>
                    </Box>
                  </Grid>
                </Grid>
                {selectedSeller.certifications && selectedSeller.certifications.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Certifications:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedSeller.certifications.map((cert, index) => (
                        <Chip 
                          key={index} 
                          label={cert} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Products Offered
              </Typography>
              
              <Grid container spacing={2}>
                {selectedSeller.productsOffered && selectedSeller.productsOffered.map((product, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={`https://source.unsplash.com/random/300x200?vegetables,${product.replace(' ', ',')}`}
                        alt={product}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="div">
                          {product}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Organic {(product || '').toLowerCase()} grown using sustainable farming practices.
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small">View Details</Button>
                        <Button size="small" color="primary">Add to Order</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {(!selectedSeller.productsOffered || selectedSeller.productsOffered.length === 0) && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No products available for this seller.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProductsDialog}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<BookIcon />}
            onClick={handleCloseProductsDialog}
          >
            View All Catalog
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ 
            width: '100%',
            boxShadow: 3,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SellerVerification; 