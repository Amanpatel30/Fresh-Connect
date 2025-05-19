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
  Tabs,
  Tab,
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
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
  Menu,
  ListItemIcon,
  ListItemText,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  PersonAdd as PersonAddIcon,
  Security as SecurityIcon,
  Block as BlockIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Restaurant as RestaurantIcon,
  Store as StoreIcon,
  ShoppingBasket as ShoppingBasketIcon,
  Verified as VerifiedIcon,
  LocalShipping as LocalShippingIcon,
  EmojiPeople as CustomerIcon
} from '@mui/icons-material';

// API base URL - adjust this to match your actual backend endpoint
const API_URL = '/api/users';

// Helper function to determine chip color based on user type
const getUserTypeColor = (userType) => {
  switch (userType) {
    case 'Admin':
      return 'primary';
    case 'Hotel':
      return 'secondary';
    case 'Vegetable Seller':
      return 'success';
    case 'Customer':
      return 'info';
    case 'Delivery':
      return 'warning';
    default:
      return 'default';
  }
};

// Helper function to get user type icon
const getUserTypeIcon = (userType) => {
  switch (userType) {
    case 'Admin':
      return <SecurityIcon />;
    case 'Hotel':
      return <RestaurantIcon />;
    case 'Vegetable Seller':
      return <StoreIcon />;
    case 'Customer':
      return <CustomerIcon />;
    case 'Delivery':
      return <LocalShippingIcon />;
    default:
      return <PersonIcon />;
  }
};

// User roles with permissions
const USER_ROLES = [
  { 
    value: 'Admin', 
    label: 'Administrator', 
    permissions: ['Full access', 'User management', 'Content management', 'Settings', 'Verification approval']
  },
  { 
    value: 'Support', 
    label: 'Support Staff', 
    permissions: ['User support', 'Content moderation', 'Limited analytics', 'Verification review']
  },
  { 
    value: 'Manager', 
    label: 'Hotel Manager', 
    permissions: ['Manage hotel profile', 'Add/edit menu items', 'List urgent sales', 'List free food']
  },
  { 
    value: 'Seller', 
    label: 'Vegetable Seller', 
    permissions: ['Manage inventory', 'List vegetables', 'Add urgent sales', 'View analytics']
  },
  { 
    value: 'Customer', 
    label: 'End Customer', 
    permissions: ['Browse products', 'Place orders', 'View order history', 'Submit reviews']
  }
];

// User types
const USER_TYPES = [
  { value: 'Admin', label: 'Admin Staff' },
  { value: 'Hotel', label: 'Hotel Owner' },
  { value: 'Vegetable Seller', label: 'Vegetable Seller' },
  { value: 'End User', label: 'End Customer' }
];

// Function to test API connection
const testUsersAPI = async () => {
  try {
    console.log('Testing API connection to:', API_URL);
    // Get all users
    const response = await fetch(API_URL);
    const responseText = await response.text();
    
    console.log('API test response:', response.status, responseText);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, text: ${responseText}`);
    }
    
    // Try to parse JSON only if we have content
    let data = [];
    if (responseText && responseText.trim()) {
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Error parsing JSON response:', e);
        return { success: false, error: 'Invalid JSON response' };
      }
    }
    
    console.log('Users API test successful, received', data.length, 'users');
    return { success: true, data };
  } catch (error) {
    console.error('Users API test error:', error);
    return { success: false, error: error.message };
  }
};

// Fallback users data in case API fails
const FALLBACK_USERS = [
  {
    id: 1,
    name: 'Raj Patel',
    email: 'raj.patel@freshconnect.com',
    avatar: '',
    role: 'Admin',
    userType: 'Admin',
    status: 'Active',
    lastLogin: '2023-05-19 14:30',
    dateJoined: '2022-03-10',
    verified: true,
    phone: '+91 9876543210',
    address: 'Mumbai, India'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    email: 'priya.sharma@tajhotels.com',
    avatar: '',
    role: 'Manager',
    userType: 'Hotel',
    status: 'Active',
    lastLogin: '2023-05-18 09:45',
    dateJoined: '2022-05-22',
    verified: true,
    phone: '+91 8765432109',
    address: 'Delhi, India'
  },
  {
    id: 3,
    name: 'Amita Desai',
    email: 'amita@organicveggies.com',
    avatar: '',
    role: 'Seller',
    userType: 'Vegetable Seller',
    status: 'Active',
    lastLogin: '2023-05-17 16:20',
    dateJoined: '2022-08-15',
    verified: true,
    phone: '+91 7654321098',
    address: 'Pune, India'
  },
  {
    id: 4,
    name: 'Vikram Singh',
    email: 'vikram@gmail.com',
    avatar: '',
    role: 'Customer',
    userType: 'Customer',
    status: 'Active',
    lastLogin: '2023-05-19 08:10',
    dateJoined: '2023-01-05',
    verified: false,
    phone: '+91 6543210987',
    address: 'Bangalore, India'
  },
  {
    id: 5,
    name: 'Neha Reddy',
    email: 'neha@marriott.com',
    avatar: '',
    role: 'Manager',
    userType: 'Hotel',
    status: 'Inactive',
    lastLogin: '2023-04-30 14:15',
    dateJoined: '2022-07-12',
    verified: true,
    phone: '+91 5432109876',
    address: 'Hyderabad, India'
  },
  {
    id: 6,
    name: 'Arjun Mehta',
    email: 'arjun@freshfarms.in',
    avatar: '',
    role: 'Seller',
    userType: 'Vegetable Seller',
    status: 'Suspended',
    lastLogin: '2023-02-28 10:30',
    dateJoined: '2022-06-18',
    verified: false,
    phone: '+91 4321098765',
    address: 'Chennai, India'
  }
];

// Helper function to map role to userType
const mapRoleToUserType = (role) => {
  // Log the actual role for debugging
  console.log('Mapping role:', role);
  
  // Convert to lowercase for case-insensitive matching
  const lowerRole = typeof role === 'string' ? role.toLowerCase() : '';
  
  switch (lowerRole) {
    case 'admin':
    case 'support':
      return 'Admin';
    case 'hotel':
    case 'manager':
      return 'Hotel';
    case 'seller':
      return 'Vegetable Seller';
    case 'user':
    case 'customer':
    case 'end user':
      return 'Customer';
    default:
      console.log('Unmapped role:', role);
      return 'Customer'; // Default fallback
  }
};

// Utility function to log API requests for debugging
const debugApiCall = async (url, method, data) => {
  console.group(`🔍 API Call Debug: ${method} ${url}`);
  console.log('Request method:', method);
  console.log('Request URL:', url);
  console.log('Request body:', data);
  console.groupEnd();
  
  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const responseText = await response.text();
    
    console.group(`📥 API Response Debug: ${method} ${url}`);
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
    console.log('Raw response:', responseText);
    
    let parsedResponse = null;
    if (responseText && responseText.trim()) {
      try {
        parsedResponse = JSON.parse(responseText);
        console.log('Parsed response:', parsedResponse);
      } catch (e) {
        console.warn('Could not parse response as JSON');
      }
    } else {
      console.log('Empty response body');
    }
    console.groupEnd();
    
    return {
      success: response.ok,
      status: response.status,
      text: responseText,
      data: parsedResponse,
    };
    
  } catch (error) {
    console.group(`❌ API Error Debug: ${method} ${url}`);
    console.error('Request failed:', error);
    console.groupEnd();
    return {
      success: false,
      error: error.message,
    };
  }
};

const UserManagement = () => {
  const location = useLocation();
  // Check if we're on the User Management page - match multiple possible paths
  const isUsersPage = location.pathname.includes('user') || 
                      location.pathname.includes('users') || 
                      location.pathname === '/user-management';
  
  // State
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiWorking, setApiWorking] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [roleFilter, setRoleFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    userType: '',
    status: 'Active',
    verified: false,
    address: ''
  });
  
  // Function to handle user verification
  const handleVerifyUser = async (userId) => {
    console.log(`Verifying user with ID: ${userId}`);
    if (!apiWorking) {
      console.log('API not working, cannot verify user');
      return;
    }

    try {
      // First, check if the user exists
      const user = users.find(u => u.id === userId);
      if (!user) {
        console.error(`User with ID ${userId} not found in state`);
        alert(`User with ID ${userId} not found`);
        return;
      }
      
      // Create verification data
      const updateData = {
        isVerified: true,
        verifiedAt: new Date().toISOString()
      };
      
      console.log('Attempting to verify user using direct update');
      const url = `${API_URL}/${userId}`;
      const result = await debugApiCall(url, 'PUT', updateData);
      
      if (result.success) {
        console.log('User verified successfully');
        
        // Update local state immediately for better UX
        setUsers(prevUsers => prevUsers.map(u => 
          u.id === userId ? { ...u, verified: true } : u
        ));
        
        // Show success message
        alert('User verified successfully');
        
        // Also refresh data to be safe
        await fetchUsers();
      } else {
        console.error('Verification failed:', result.error || `HTTP status: ${result.status}`);
        alert('Failed to verify user. See console for details.');
      }
    } catch (error) {
      console.error('Error in verification process:', error);
      alert(`Error verifying user: ${error.message}`);
    }
  };

  // Function to handle user verification revocation
  const handleRevokeVerification = async (userId) => {
    console.log(`Revoking verification for user with ID: ${userId}`);
    if (!apiWorking) {
      console.log('API not working, cannot revoke verification');
      return;
    }

    try {
      // Check if user exists
      const user = users.find(u => u.id === userId);
      if (!user) {
        console.error(`User with ID ${userId} not found in state`);
        alert(`User with ID ${userId} not found`);
        return;
      }

      // Prepare update data
      const updateData = {
        isVerified: false,
        verificationRejected: true,
        verificationNotes: 'Verification revoked by admin'
      };

      console.log('Revoking verification via direct update');
      const url = `${API_URL}/${userId}`;
      const result = await debugApiCall(url, 'PUT', updateData);
      
      if (result.success) {
        console.log('Verification revoked successfully');
        
        // Update local state immediately for better UX
        setUsers(prevUsers => prevUsers.map(u => 
          u.id === userId ? { ...u, verified: false } : u
        ));
        
        // Show success message
        alert('Verification revoked successfully');
        
        // Also refresh data to be safe
        await fetchUsers();
      } else {
        console.error('Revocation failed:', result.error || `HTTP status: ${result.status}`);
        alert('Failed to revoke verification. See console for details.');
      }
    } catch (error) {
      console.error('Error in revocation process:', error);
      alert(`Error revoking verification: ${error.message}`);
    }
  };
  
  // Only log API URL when on User Management page
  useEffect(() => {
    if (isUsersPage) {
      console.log('Using Users API URL:', API_URL);
    }
  }, [isUsersPage]);

  // Test API connection and fetch data on component mount
  useEffect(() => {
    const testAPI = async () => {
      console.log('Testing Users API connection...');
      const result = await testUsersAPI();
      setApiWorking(result.success);
      if (result.success) {
        console.log('API is working, fetching users data');
        fetchUsers();
      } else {
        console.log('API is not working, using fallback data');
        setUsers(FALLBACK_USERS);
        setFilteredUsers(FALLBACK_USERS);
        setLoading(false);
      }
    };
    
    testAPI();
  }, []);
  
  // Fetch users from API with improved status handling
  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log('Fetching users from:', API_URL);
      
      // Add cache-busting parameter to ensure fresh data
      const timestamp = new Date().getTime();
      const url = `${API_URL}?_t=${timestamp}`;
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      const responseText = await response.text();
      
      console.log('Fetch users response:', response.status, responseText.substring(0, 100) + '...');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, text: ${responseText}`);
      }
      
      // Try to parse JSON only if we have content
      let data = [];
      if (responseText && responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('Error parsing JSON:', e);
          throw new Error('Invalid JSON response from server');
        }
      }
      
      // Log raw status fields for debugging
      console.log('Raw status fields from API:');
      data.forEach(user => {
        console.log(`${user.name}: status=${user.status}, isActive=${user.isActive}`);
      });
      
      // Map API response to component state format with detailed logging
      const formattedUsers = data.map(user => {
        // Handle different verification field names in the database
        const isVerified = user.isVerified === true || user.verified === true;
        
        // Determine user status with thorough checks
        let status;
        
        // First, check if status field exists and is valid
        if (user.status && ['Active', 'Inactive', 'Suspended'].includes(user.status)) {
          status = user.status;
          console.log(`User ${user.name}: Using existing status field: ${status}`);
        } 
        // If no valid status, derive from isActive
        else if (typeof user.isActive === 'boolean') {
          status = user.isActive ? 'Active' : 'Inactive';
          console.log(`User ${user.name}: Derived status from isActive (${user.isActive}): ${status}`);
        } 
        // Default fallback
        else {
          status = 'Active'; // Default
          console.log(`User ${user.name}: No status info, using default: ${status}`);
        }
        
        return {
          id: user._id,
          name: user.name || 'Unknown User',
          email: user.email || 'No Email',
          avatar: user.avatar || '',
          role: user.role || 'user',
          userType: mapRoleToUserType(user.role || 'user'),
          status: status,
          lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A',
          dateJoined: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
          verified: isVerified,
          phone: user.phone || 'N/A',
          address: user.address || 'N/A',
          verificationNotes: user.verificationNotes || '',
          verificationRejected: user.verificationRejected || false,
          isPremium: user.isPremium || false
        };
      });
      
      const uniqueStatuses = [...new Set(formattedUsers.map(user => user.status))];
      console.log('User statuses after mapping:', uniqueStatuses);
      
      console.log('Setting formatted users to state:', formattedUsers.length);
      setUsers(formattedUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers(FALLBACK_USERS);
      setLoading(false);
      // Alert the user that we're using fallback data
      alert('Error connecting to the server. Using demo data.');
    }
  };

  // Function to refresh data
  const refreshData = async () => {
    console.log('Refreshing user data...');
    if (apiWorking) {
      await fetchUsers();
    } else {
      setUsers(FALLBACK_USERS);
    }
  };

  // Filter and sort users
  useEffect(() => {
    console.log('Filtering users:', users.length, 'users available');
    console.log('Current filters:', {
      searchQuery,
      tabValue,
      roleFilter,
      userTypeFilter,
      statusFilter,
      verifiedFilter,
      sortField,
      sortDirection
    });
    
    let result = [...users];
    
    // Debug: Log all user types before filtering
    console.log('All user types before filtering:', users.map(u => ({ name: u.name, role: u.role, userType: u.userType, verified: u.verified })));
    
    // Filter by search query
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        user => 
          (user.name && user.name.toLowerCase().includes(lowercaseQuery)) || 
          (user.email && user.email.toLowerCase().includes(lowercaseQuery))
      );
      console.log('After search filter:', result.length);
    }
    
    // Filter by role
    if (roleFilter !== 'all') {
      result = result.filter(user => {
        const userRole = typeof user.role === 'string' ? user.role.toLowerCase() : '';
        const filterRole = roleFilter.toLowerCase();
        return userRole === filterRole;
      });
      console.log('After role filter:', result.length);
    }
    
    // Filter by user type
    if (userTypeFilter !== 'all') {
      result = result.filter(user => user.userType === userTypeFilter);
      console.log('After userType filter:', result.length);
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      console.log('Filtering by status:', statusFilter);
      
      result = result.filter(user => {
        const userStatus = user.status;
        console.log(`User ${user.name} has status ${userStatus}, comparing with ${statusFilter}`);
        
        // Handle special case of undefined or missing status
        return userStatus === statusFilter;
      });
      
      console.log('After status filter:', result.length, result.map(u => ({name: u.name, status: u.status})));
    }
    
    // Filter by verification status
    if (verifiedFilter !== 'all') {
      result = result.filter(user => {
        console.log('User:', user.name, 'verified:', user.verified, 'filter:', verifiedFilter);
        return verifiedFilter === 'Verified' ? user.verified : !user.verified;
      });
      console.log('After verification filter:', result.length);
    }
    
    // Filter by tab
    if (tabValue === 1) { // Hotels tab
      result = result.filter(user => {
        // Include users with role 'hotel' OR role 'seller' with hotel-related properties
        return user.role === 'hotel' || 
          (user.role === 'seller' && (user.hotelName || user.hotelAddress || user.hotelDescription));
      });
      console.log('After tab 1 filter (Hotels):', result.length, result.map(u => ({ name: u.name, role: u.role })));
    } else if (tabValue === 2) { // Vegetable Seller tab
      result = result.filter(user => {
        // Include users with role 'seller' that don't have hotel-related properties
        return user.role === 'seller' && !(user.hotelName || user.hotelAddress || user.hotelDescription);
      });
      console.log('After tab 2 filter (Vegetable Sellers):', result.length, result.map(u => ({ name: u.name, role: u.role })));
    } else if (tabValue === 3) { // Customer tab
      result = result.filter(user => user.role === 'user' || user.role === 'customer');
      console.log('After tab 3 filter (Customers):', result.length, result.map(u => ({ name: u.name, role: u.role })));
    } else if (tabValue === 4) { // Suspended tab
      result = result.filter(user => user.status === 'Suspended');
      console.log('After tab 4 filter (Suspended):', result.length);
    }
    
    // Sort
    result.sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';
      
      // Handle date fields
      if (sortField === 'dateJoined' || sortField === 'lastLogin') {
        if (sortField === 'dateJoined') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        } else {
          // For lastLogin, handle 'N/A' case
          aValue = aValue === 'N/A' ? 0 : new Date(aValue).getTime();
          bValue = bValue === 'N/A' ? 0 : new Date(bValue).getTime();
        }
        
        if (sortDirection === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      }
      
      // For string fields
      if (sortDirection === 'asc') {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });
    
    console.log('Final filtered users:', result.length);
    setFilteredUsers(result);
  }, [users, searchQuery, tabValue, roleFilter, userTypeFilter, statusFilter, verifiedFilter, sortField, sortDirection]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };
  
  // Handle search
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Dialog handlers
  const handleOpenDialog = (mode, user = null) => {
    setDialogMode(mode);
    setSelectedUserId(user ? user.id : null);
    
    if (mode === 'add') {
      setFormData({
        name: '',
        email: '',
        role: 'Customer',
        userType: 'Customer',
        status: 'Active',
        password: '',
        confirmPassword: '',
        verified: false,
        phone: '',
        address: ''
      });
    } else if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        userType: user.userType,
        status: user.status,
        password: '',
        confirmPassword: '',
        verified: user.verified,
        phone: user.phone || '',
        address: user.address || ''
      });
    }
    
    setDialogOpen(true);
    setUserMenuAnchor(null);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    console.log('Input changed:', name, value);
    
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-set userType based on role
    if (name === 'role') {
      let userType = '';
      if (value === 'Admin' || value === 'Support') {
        userType = 'Admin';
      } else if (value === 'Manager') {
        userType = 'Hotel';
      } else if (value === 'Seller') {
        userType = 'Vegetable Seller';
      } else if (value === 'Customer') {
        userType = 'Customer';
      }
      
      console.log('Setting userType based on role:', userType);
      
      setFormData((prev) => ({
        ...prev,
        userType
      }));
    }
  };
  
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    
    console.log('Switch changed:', name, checked);
    
    setFormData((prev) => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleFormSubmit = async () => {
    if (!apiWorking) {
      console.log('API not working, cannot submit form');
      setDialogOpen(false);
      return;
    }
    
    try {
      console.log('Submitting form with data:', formData);
      
      // Validate form data
      if (!formData.name || !formData.email) {
        alert('Name and email are required fields');
        return;
      }
      
      if (dialogMode === 'add' && (!formData.password || formData.password !== formData.confirmPassword)) {
        alert('Please enter matching passwords');
        return;
      }
      
      // Make sure role is properly set
      if (!formData.role) {
        alert('User role is required');
        return;
      }
      
      // Create a clean object with only the required fields
      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone || '',
        address: formData.address || '',
        isActive: formData.status === 'Active',
        isVerified: formData.verified || false,
        isPremium: formData.isPremium || false
      };
      
      // Add password only for new users
      if (dialogMode === 'add' && formData.password) {
        userData.password = formData.password;
      }
      
      // Add ID for updates
      if (dialogMode === 'edit' && selectedUserId) {
        userData._id = selectedUserId;
      }
      
      // Add hotel/shop information based on role
      if (formData.role === 'hotel' || formData.role === 'seller') {
        if (formData.role === 'hotel') {
          userData.hotelName = formData.businessName || '';
          userData.hotelAddress = formData.businessAddress || '';
          userData.hotelDescription = formData.businessDescription || '';
        } else if (formData.role === 'seller') {
          userData.shopName = formData.businessName || '';
          userData.shopAddress = formData.businessAddress || '';
          userData.shopDescription = formData.businessDescription || '';
        }
      }
      
      const url = dialogMode === 'add' 
        ? API_URL 
        : `${API_URL}/${selectedUserId}`;
      
      const method = dialogMode === 'add' ? 'POST' : 'PUT';
      
      console.log(`Sending ${method} request to ${url}`);
      console.log('User data:', userData);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const responseText = await response.text();
      console.log('API response:', response.status, responseText);
      
      if (!response.ok) {
        const errorMsg = `HTTP error! status: ${response.status}, ${responseText}`;
        console.error(errorMsg);
        alert(`Error saving user: ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      console.log('Form submitted successfully');
      alert(dialogMode === 'add' ? 'User created successfully' : 'User updated successfully');
      setDialogOpen(false);
      await fetchUsers();
    } catch (error) {
      console.error('Error submitting form:', error);
      // Keep dialog open so user can try again
    }
  };
  
  // User action handlers
  const handleDeleteUser = async (userId) => {
    if (!apiWorking) {
      console.log('API not working, cannot delete user');
      return;
    }
    
    try {
      // Ask for confirmation
      if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        console.log('User deletion cancelled');
        return;
      }
      
      console.log('Deleting user:', userId);
      
      const user = users.find(u => u.id === userId);
      if (!user) {
        console.error('User not found for deletion:', userId);
        alert('Error: User not found');
        return;
      }
      
      console.log(`Attempting to delete user: ${user.name} (${user.email})`);
      
      // Send delete request to API
      const response = await fetch(`${API_URL}/${userId}`, {
        method: 'DELETE',
      });
      
      const responseText = await response.text();
      console.log('Delete response:', response.status, responseText);
      
      if (!response.ok) {
        const errorMsg = `HTTP error! status: ${response.status}, ${responseText}`;
        console.error(errorMsg);
        alert(`Error deleting user: ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      console.log('User deleted successfully');
      
      // Update local state instead of fetching again
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      
      // Also refresh data to be sure
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error.message}`);
    }
  };
  
  // ABSOLUTE BRUTE FORCE status update using our special endpoint
  const forceStatusUpdate = async (userId, newStatus) => {
    console.log(`🔨 FORCE UPDATE: User ${userId} to ${newStatus}`);
    
    // Close user menu
    setUserMenuAnchor(null);
    
    try {
      // Update UI immediately
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? {...user, status: newStatus, isActive: newStatus === 'Active'} : user
        )
      );
      
      // Call the force-status endpoint directly
      const response = await fetch(`${API_URL}/${userId}/force-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      // Log raw response for debugging
      const responseText = await response.text();
      console.log(`Force status update response (${response.status}):`, responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Force update result:', data.success ? 'SUCCESS' : 'FAILED');
      } catch (e) {
        console.error('Error parsing response:', e);
      }
      
      // Refresh data after a short delay
      setTimeout(() => fetchUsers(), 500);
      
      // Show a simple confirmation
      alert(`User status set to ${newStatus} ${data?.success ? 'successfully' : 'with potential issues'}`);
    } catch (error) {
      console.error('Force status update error:', error);
      fetchUsers(); // Revert changes on error
      alert(`Force status update error: ${error.message}`);
    }
  };
  
  // Use the force update function for our handlers
  const handleSuspend = (id) => forceStatusUpdate(id, 'Suspended');
  const handleActivate = (id) => forceStatusUpdate(id, 'Active');
  const handleDeactivate = (id) => forceStatusUpdate(id, 'Inactive');

  // User menu handlers
  const handleOpenUserMenu = (event, userId) => {
    // Set the selected user ID and anchor element for the menu
    console.log('Opening menu for user ID:', userId);
    setSelectedUserId(userId);
    setUserMenuAnchor(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    // Close the user menu
    setUserMenuAnchor(null);
  };

  // Filter handlers
  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value);
    setPage(0);
  };

  const handleUserTypeFilterChange = (event) => {
    setUserTypeFilter(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    const newStatus = event.target.value;
    console.log('Status filter changed to:', newStatus);
    setStatusFilter(newStatus);
    setPage(0);
  };

  const handleVerifiedFilterChange = (event) => {
    setVerifiedFilter(event.target.value);
    setPage(0);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
    setUserTypeFilter('all');
    setVerifiedFilter('all');
    setTabValue(0);
    setPage(0);
  };

  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  // Helper to get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Helper to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'warning';
      case 'Suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  // Helper to get role color
  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'primary';
      case 'Support':
        return 'secondary';
      case 'Manager':
        return 'info';
      case 'Seller':
        return 'success';
      case 'Customer':
        return 'default';
      default:
        return 'default';
    }
  };

  // Verification filter options
  const verifiedFilterOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'Verified', label: 'Verified' },
    { value: 'Unverified', label: 'Unverified' }
  ];

  // Status options for the dropdown
  const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'Active', label: 'Active', color: 'success' },
    { value: 'Inactive', label: 'Inactive', color: 'warning' },
    { value: 'Suspended', label: 'Suspended', color: 'error' }
  ];

  // Function to directly check verify API
  const testVerifyEndpoint = async () => {
    if (!selectedUserId) {
      alert('No user selected');
      return;
    }
    
    try {
      // Send a test request to the verify endpoint
      console.log(`Testing verify endpoint for user: ${selectedUserId}`);
      
      const testResponse = await fetch(`${API_URL}/${selectedUserId}/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const responseText = await testResponse.text();
      console.log('Verify endpoint test response:', testResponse.status, responseText);
      
      alert(`Verify endpoint test response: ${testResponse.status} ${responseText}`);
    } catch (error) {
      console.error('Error testing verify endpoint:', error);
      alert(`Error testing verify endpoint: ${error.message}`);
    }
    
    handleCloseUserMenu();
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
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage users, hotels, vegetable sellers and customers
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => handleOpenDialog('add')}
          sx={{ borderRadius: 2 }}
        >
          Add New User
        </Button>
      </Box>
      
      {/* Filters and Search */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={9}>
          <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
                <TextField
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={handleSearch}
                  variant="outlined"
                  size="small"
                  sx={{ 
                    width: { xs: '100%', sm: 240 },
                    mr: { sm: 2 },
                    mb: { xs: 2, sm: 0 }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                />
                
                <FormControl 
                  size="small" 
                  sx={{ 
                    width: { xs: '100%', sm: 150 }, 
                    mr: 2,
                    mb: { xs: 2, sm: 0 }
                  }}
                >
                  <InputLabel>User Type</InputLabel>
                  <Select
                    value={userTypeFilter}
                    label="User Type"
                    onChange={handleUserTypeFilterChange}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    {USER_TYPES.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {getUserTypeIcon(type.value)}
                          </ListItemIcon>
                          {type.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl 
                  size="small" 
                  sx={{ 
                    width: { xs: '100%', sm: 150 }, 
                    mr: 2,
                    mb: { xs: 2, sm: 0 }
                  }}
                >
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={handleStatusFilterChange}
                  >
                    {STATUS_OPTIONS.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.value !== 'all' && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Chip 
                              label={option.label} 
                              size="small" 
                              color={option.color} 
                              sx={{ mr: 1, minWidth: 80 }}
                            />
                          </Box>
                        )}
                        {option.value === 'all' && option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Box sx={{ ml: 'auto', display: 'flex' }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={clearFilters}
                    sx={{ mr: 1 }}
                  >
                    Clear
                  </Button>
                  
                  <Button 
                    variant="contained" 
                    size="small"
                    startIcon={showAdvancedFilters ? <ClearIcon /> : <FilterIcon />}
                    onClick={toggleAdvancedFilters}
                    color={showAdvancedFilters ? "secondary" : "primary"}
                  >
                    {showAdvancedFilters ? "Hide Filters" : "More Filters"}
                  </Button>
                </Box>
              </Box>
              
              {showAdvancedFilters && (
                <Box sx={{ pt: 2, pb: 1, borderTop: 1, borderColor: 'divider' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Role</InputLabel>
                        <Select
                          value={roleFilter}
                          label="Role"
                          onChange={handleRoleFilterChange}
                        >
                          <MenuItem value="all">All Roles</MenuItem>
                          {USER_ROLES.map(role => (
                            <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Verification</InputLabel>
                        <Select
                          value={verifiedFilter}
                          label="Verification"
                          onChange={handleVerifiedFilterChange}
                        >
                          {verifiedFilterOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {option.value === 'Verified' && <VerifiedIcon fontSize="small" color="primary" sx={{ mr: 1 }} />}
                                {option.value === 'Unverified' && <BlockIcon fontSize="small" color="action" sx={{ mr: 1 }} />}
                                {option.label}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', height: '100%', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                          {filteredUsers.length} users found
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {users.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Users
                </Typography>
              </Box>
              
              <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
              
              <Box>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {users.filter(user => user.verified).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Verified
                </Typography>
              </Box>
              
              <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
              
              <Box>
                <Typography variant="h6" fontWeight="bold" color="warning.main">
                  {users.filter(user => !user.verified).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tabs */}
      <Card sx={{ borderRadius: 3, mb: 4, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ 
            px: 2, 
            pt: 2,
            borderBottom: 1,
            borderColor: 'divider'
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            label="All Users" 
            icon={<PersonIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Hotels" 
            icon={<RestaurantIcon />} 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab 
            label="Vegetable Sellers" 
            icon={<StoreIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="End Customers" 
            icon={<CustomerIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Suspended" 
            icon={<BlockIcon />} 
            iconPosition="start"
          />
        </Tabs>
        
        {/* Users Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'background.default' }}>
                  <TableRow>
                    <TableCell>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('name')}
                      >
                        User
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
                            <ArrowDownIcon fontSize="small" sx={{ ml: 0.5 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('email')}
                      >
                        Email
                        {sortField === 'email' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
                            <ArrowDownIcon fontSize="small" sx={{ ml: 0.5 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('lastLogin')}
                      >
                        Last Login
                        {sortField === 'lastLogin' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
                            <ArrowDownIcon fontSize="small" sx={{ ml: 0.5 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('dateJoined')}
                      >
                        Joined
                        {sortField === 'dateJoined' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
                            <ArrowDownIcon fontSize="small" sx={{ ml: 0.5 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>Verification</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: user.avatar ? 'transparent' : 'primary.main',
                                mr: 2
                              }}
                              src={user.avatar}
                            >
                              {!user.avatar && getInitials(user.name)}
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {user.name}
                              {user.verified && (
                                <Tooltip title="Verified User">
                                  <VerifiedIcon 
                                    color="primary" 
                                    fontSize="small" 
                                    sx={{ ml: 0.5, verticalAlign: 'middle' }} 
                                  />
                                </Tooltip>
                              )}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            icon={getUserTypeIcon(user.userType)}
                            label={user.userType} 
                            size="small" 
                            color={getUserTypeColor(user.userType)} 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={user.role} 
                            size="small" 
                            color={getRoleColor(user.role)} 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={user.status} 
                            size="small" 
                            color={getStatusColor(user.status)} 
                          />
                        </TableCell>
                        <TableCell>{user.lastLogin}</TableCell>
                        <TableCell>{user.dateJoined}</TableCell>
                        <TableCell>
                          {user.verified ? (
                            <Chip 
                              icon={<VerifiedIcon />}
                              label="Verified" 
                              size="small" 
                              color="success" 
                            />
                          ) : (
                            <Chip 
                              label="Unverified" 
                              size="small" 
                              color="default" 
                            />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={(e) => handleOpenUserMenu(e, user.id)}>
                            <MoreIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">No users found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              component="div"
              count={filteredUsers.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </>
        )}
      </Card>
      
      {/* User menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleCloseUserMenu}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MenuItem onClick={() => {
          const user = users.find(u => u.id === selectedUserId);
          if (user) {
            handleOpenDialog('view', user);
            handleCloseUserMenu();
          }
        }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          const user = users.find(u => u.id === selectedUserId);
          if (user) {
            handleOpenDialog('edit', user);
            handleCloseUserMenu();
          }
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        <Divider />
        
        {/* Status change options - Don't use fragments */}
        {selectedUserId && (
          <MenuItem disabled sx={{ opacity: 0.7, '&.Mui-disabled': { color: 'text.secondary' } }}>
            <Typography variant="caption">Change Status</Typography>
          </MenuItem>
        )}
        
        {/* Activate button - only show for inactive/suspended users */}
        {selectedUserId && users.find(u => u.id === selectedUserId)?.status !== 'Active' && (
          <MenuItem onClick={() => handleActivate(selectedUserId)}>
            <ListItemIcon>
              <CheckIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>Activate</ListItemText>
          </MenuItem>
        )}
        
        {/* Deactivate button - only show for active users */}
        {selectedUserId && users.find(u => u.id === selectedUserId)?.status === 'Active' && (
          <MenuItem onClick={() => handleDeactivate(selectedUserId)}>
            <ListItemIcon>
              <BlockIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText>Deactivate</ListItemText>
          </MenuItem>
        )}
        
        {/* Suspend button - only show for non-suspended users */}
        {selectedUserId && users.find(u => u.id === selectedUserId)?.status !== 'Suspended' && (
          <MenuItem onClick={() => handleSuspend(selectedUserId)}>
            <ListItemIcon>
              <SecurityIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Suspend</ListItemText>
          </MenuItem>
        )}
        
        <Divider />
        
        {/* Verification options - Don't use fragments */}
        {selectedUserId && users.find(u => u.id === selectedUserId)?.verified && (
          <MenuItem onClick={() => {
            console.log('Clicked Revoke verification for user:', selectedUserId);
            handleRevokeVerification(selectedUserId);
            handleCloseUserMenu();
          }}>
            <ListItemIcon>
              <ClearIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Revoke Verification</ListItemText>
          </MenuItem>
        )}
        
        {selectedUserId && !users.find(u => u.id === selectedUserId)?.verified && (
          <MenuItem onClick={() => {
            console.log('Clicked Verify User for user:', selectedUserId);
            handleVerifyUser(selectedUserId);
            handleCloseUserMenu();
          }}>
            <ListItemIcon>
              <VerifiedIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>Verify User</ListItemText>
          </MenuItem>
        )}
        
        {selectedUserId && (
          <MenuItem onClick={testVerifyEndpoint}>
            <ListItemIcon>
              <CheckIcon fontSize="small" color="info" />
            </ListItemIcon>
            <ListItemText>Test Verify API</ListItemText>
          </MenuItem>
        )}
        
        <Divider />
        
        {selectedUserId && (
          <MenuItem onClick={() => {
            handleDeleteUser(selectedUserId);
            handleCloseUserMenu();
          }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
      
      {/* User Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New User' : 
           dialogMode === 'edit' ? 'Edit User' : 'User Details'}
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* View mode - show more details */}
            {dialogMode === 'view' && selectedUserId && (
              <>
                <Grid item xs={12} sx={{ textAlign: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mx: 'auto', 
                      bgcolor: users.find(u => u.id === selectedUserId)?.avatar ? 'transparent' : 'primary.main',
                      fontSize: 32
                    }}
                    src={users.find(u => u.id === selectedUserId)?.avatar}
                  >
                    {!users.find(u => u.id === selectedUserId)?.avatar && getInitials(users.find(u => u.id === selectedUserId)?.name)}
                  </Avatar>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {users.find(u => u.id === selectedUserId)?.name}
                    {users.find(u => u.id === selectedUserId)?.verified && (
                      <VerifiedIcon 
                        color="primary" 
                        fontSize="small" 
                        sx={{ ml: 0.5, verticalAlign: 'middle' }} 
                      />
                    )}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                    <Chip 
                      icon={getUserTypeIcon(users.find(u => u.id === selectedUserId)?.userType)}
                      label={users.find(u => u.id === selectedUserId)?.userType} 
                      size="small" 
                      color={getUserTypeColor(users.find(u => u.id === selectedUserId)?.userType)} 
                    />
                    <Chip 
                      label={users.find(u => u.id === selectedUserId)?.role} 
                      size="small" 
                      color={getRoleColor(users.find(u => u.id === selectedUserId)?.role)} 
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmailIcon color="action" sx={{ mr: 2 }} />
                    <Typography variant="body2">
                      {users.find(u => u.id === selectedUserId)?.email}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SecurityIcon color="action" sx={{ mr: 2 }} />
                    <Typography variant="body2">
                      Status: 
                      <Chip 
                        label={users.find(u => u.id === selectedUserId)?.status} 
                        size="small" 
                        color={getStatusColor(users.find(u => u.id === selectedUserId)?.status)} 
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Joined Date
                      </Typography>
                      <Typography variant="body2">
                        {users.find(u => u.id === selectedUserId)?.dateJoined}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Last Login
                      </Typography>
                      <Typography variant="body2">
                        {users.find(u => u.id === selectedUserId)?.lastLogin}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Verification Status
                  </Typography>
                  <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">
                        {users.find(u => u.id === selectedUserId)?.verified ? 'Verified Account' : 'Not Verified'}
                      </Typography>
                      <Chip 
                        icon={users.find(u => u.id === selectedUserId)?.verified ? <VerifiedIcon /> : <ClearIcon />}
                        label={users.find(u => u.id === selectedUserId)?.verified ? 'Verified' : 'Unverified'} 
                        size="small" 
                        color={users.find(u => u.id === selectedUserId)?.verified ? 'success' : 'default'} 
                      />
                    </Box>
                    {users.find(u => u.id === selectedUserId)?.userType === 'Vegetable Seller' && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {users.find(u => u.id === selectedUserId)?.verified ? 
                          'This seller is verified to provide quality vegetables to hotels.' : 
                          'This seller needs verification to get the quality badge.'}
                      </Typography>
                    )}
                    {users.find(u => u.id === selectedUserId)?.userType === 'Hotel' && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {users.find(u => u.id === selectedUserId)?.verified ? 
                          'This hotel is verified for using quality vegetables in their menu.' : 
                          'This hotel needs verification to display the quality badge.'}
                      </Typography>
                    )}
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Permissions
                  </Typography>
                  <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                    {USER_ROLES.find(r => r.value === users.find(u => u.id === selectedUserId)?.role)?.permissions.map((permission, index) => (
                      <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                        • {permission}
                      </Typography>
                    ))}
                  </Box>
                </Grid>
              </>
            )}
            
            {/* Add/Edit mode - show form */}
            {(dialogMode === 'add' || dialogMode === 'edit') && (
              <>
                <Grid item xs={12}>
                  <TextField
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>User Type</InputLabel>
                    <Select
                      name="userType"
                      value={formData.userType}
                      label="User Type"
                      onChange={handleInputChange}
                    >
                      <MenuItem value="Admin">Admin</MenuItem>
                      <MenuItem value="Vegetable Seller">Vegetable Seller</MenuItem>
                      <MenuItem value="Hotel">Hotel</MenuItem>
                      <MenuItem value="Customer">Customer</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      label="Role"
                      onChange={handleInputChange}
                    >
                      {USER_ROLES.map((role) => (
                        <MenuItem key={role.value} value={role.value}>
                          {role.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      label="Status"
                      onChange={handleInputChange}
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                      <MenuItem value="Suspended">Suspended</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.verified || false}
                        onChange={(e) => setFormData({...formData, verified: e.target.checked})}
                        name="verified"
                        color="primary"
                      />
                    }
                    label="Verified Account"
                  />
                </Grid>
                
                {dialogMode === 'add' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        fullWidth
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        fullWidth
                        required
                      />
                    </Grid>
                  </>
                )}
                
                {dialogMode === 'edit' && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Permissions
                    </Typography>
                    <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                      {USER_ROLES.find(r => r.value === formData.role)?.permissions.map((permission, index) => (
                        <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                          • {permission}
                        </Typography>
                      ))}
                    </Box>
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {dialogMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          
          {dialogMode !== 'view' && (
            <Button 
              variant="contained" 
              onClick={handleFormSubmit}
              disabled={
                !formData.name || 
                !formData.email || 
                (dialogMode === 'add' && (!formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword))
              }
            >
              {dialogMode === 'add' ? 'Add User' : 'Save Changes'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement; 