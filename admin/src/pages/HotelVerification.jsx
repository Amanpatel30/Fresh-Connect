import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
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
  Tabs,
  Tab,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Badge,
  Switch,
  FormControlLabel,
  Snackbar,
  Menu,
  MenuItem as MuiMenuItem,
  ListItemIcon as MuiListItemIcon,
  Stack,
  Rating,
  Checkbox
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  Hotel as HotelIcon,
  LocationOn as LocationIcon,
  AccessTime as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Stars as RatingIcon,
  Restaurant as RestaurantIcon,
  EcoOutlined as OrganicIcon,
  LocalOffer as OfferIcon,
  ShoppingCart as CartIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  VerifiedUser as VerifiedIcon,
  LocalShipping as ShippingIcon,
  RestaurantMenu as MenuIcon,
  FoodBank as FoodBankIcon,
  Recycling as CompostIcon,
  Close as CloseIcon,
  Star as StarIcon,
  Block as RejectIcon,
  Check as ApproveIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  List as ListIcon,
  VerifiedUser as InspectionIcon,
  EventNote as NotesIcon,
  Assignment as CertificateIcon
} from '@mui/icons-material';

// API URLs
const HOTELS_API_URL = 'http://localhost:5003/api/hotels';
const VERIFICATIONS_API_URL = 'http://localhost:5003/api/verifications';

// Function to test API connection
const testHotelsAPI = async () => {
  try {
    const response = await fetch(HOTELS_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    console.log('Hotels API test successful');
    return { success: true, data };
  } catch (error) {
    console.error('Hotels API test error:', error);
    return { success: false, error: error.message };
  }
};

// Sample data for restaurant verification
const FALLBACK_HOTELS = [
  {
    id: 1,
    name: 'Spice Garden Restaurant',
    location: 'Mumbai, Maharashtra',
    stars: 4.5,
    ownerName: 'Raj Patel',
    contactEmail: 'raj@spicegarden.com',
    contactPhone: '+91 9876543210',
    submittedDate: '2023-05-01',
    status: 'Pending',
    images: 8,
    facilities: ['AC', 'Parking', 'Outdoor Seating', 'Bar', 'Private Dining'],
    verifiedVegetableSupplier: false,
    foodWasteProgram: true,
    organicMenuItems: 12,
    totalMenuItems: 45,
    surplusFoodListings: 3,
    vegetableRequirements: ['Tomatoes', 'Onions', 'Bell Peppers', 'Leafy Greens', 'Okra'],
    monthlyVegetableBudget: '₹45,000',
    cuisineType: 'North Indian',
    notes: 'Interested in organic certification for their restaurant'
  },
  {
    id: 2,
    name: 'Coastal Flavors',
    location: 'Chennai, Tamil Nadu',
    stars: 4,
    ownerName: 'Priya Krishnan',
    contactEmail: 'priya@coastalflavors.com',
    contactPhone: '+91 8765432109',
    submittedDate: '2023-04-28',
    status: 'Approved',
    images: 12,
    facilities: ['Beachside', 'AC', 'Outdoor Seating', 'Live Music'],
    verifiedVegetableSupplier: true,
    foodWasteProgram: true,
    organicMenuItems: 18,
    totalMenuItems: 32,
    surplusFoodListings: 5,
    vegetableRequirements: ['Fresh Seafood', 'Coconut', 'Green Chilies', 'Curry Leaves', 'Tomatoes'],
    monthlyVegetableBudget: '₹62,500',
    cuisineType: 'South Indian',
    notes: 'Excellent track record with sustainable practices'
  },
  {
    id: 3,
    name: 'Mountain Dhaba',
    location: 'Shimla, Himachal Pradesh',
    stars: 3.5,
    ownerName: 'Vikram Singh',
    contactEmail: 'vikram@mountaindhaba.com',
    contactPhone: '+91 7654321098',
    submittedDate: '2023-05-02',
    status: 'Rejected',
    images: 5,
    facilities: ['Mountain View', 'Bonfire', 'Outdoor Seating'],
    verifiedVegetableSupplier: false,
    foodWasteProgram: false,
    organicMenuItems: 3,
    totalMenuItems: 20,
    surplusFoodListings: 0,
    vegetableRequirements: ['Potatoes', 'Onions', 'Mushrooms', 'Root Vegetables'],
    monthlyVegetableBudget: '₹25,000',
    cuisineType: 'Himachali',
    notes: 'Failed health inspection, needs to improve food storage practices'
  },
  {
    id: 4,
    name: 'Urban Bites',
    location: 'Bangalore, Karnataka',
    stars: 4,
    ownerName: 'Neha Sharma',
    contactEmail: 'neha@urbanbites.com',
    contactPhone: '+91 6543210987',
    submittedDate: '2023-04-25',
    status: 'Pending',
    images: 10,
    facilities: ['Rooftop', 'AC', 'Live Music', 'Free WiFi'],
    verifiedVegetableSupplier: false,
    foodWasteProgram: true,
    organicMenuItems: 8,
    totalMenuItems: 30,
    surplusFoodListings: 2,
    vegetableRequirements: ['Seasonal Vegetables', 'Microgreens', 'Exotic Vegetables', 'Leafy Greens'],
    monthlyVegetableBudget: '₹35,000',
    cuisineType: 'Fusion',
    notes: 'Interested in farm-to-table program'
  }
];

const HotelVerification = () => {
  const location = useLocation();
  const [apiWorking, setApiWorking] = useState(false);
  
  // State
  const [selectedTab, setSelectedTab] = useState(0);
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('All');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [verified, setVerified] = useState(false);
  const [foodWasteProgram, setFoodWasteProgram] = useState(false);
  const [inspectionDialogOpen, setInspectionDialogOpen] = useState(false);
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [addHotelDialogOpen, setAddHotelDialogOpen] = useState(false);
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [bulkActionMenuAnchorEl, setBulkActionMenuAnchorEl] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [newHotel, setNewHotel] = useState({
    name: '',
    city: '',
    state: '',
    country: 'India', // Default to India
    address: '',
    pincode: '',
    contact: '',
    email: '',
    description: '',
    pricePerNight: '',
    amenities: [],
    cuisineType: '',
    capacity: '',
    establishedYear: '',
    openingHours: '',
    closingHours: '',
    gstNumber: '',
    fssaiLicense: ''
  });

  // Form validation
  const [errors, setErrors] = useState({});
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [addressComponents, setAddressComponents] = useState({
    area: '',
    district: '',
    division: ''
  });
  
  // Validation functions
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  const validatePhone = (phone) => {
    const regex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
    return regex.test(phone);
  };
  
  const validatePincode = (pincode) => {
    const regex = /^[1-9][0-9]{5}$/;
    return regex.test(pincode);
  };
  
  const validateGST = (gst) => {
    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return regex.test(gst);
  };
  
  const validateFSSAI = (fssai) => {
    const regex = /^[1-9][0-9]{13}$/;
    return regex.test(fssai);
  };

  // Check if we're on the Hotel Verification page
  const isHotelVerificationPage = location.pathname === '/hotel-verification';
  
  // Only log API URL when on Hotel Verification page
  useEffect(() => {
    if (isHotelVerificationPage) {
      console.log('Using Hotels API URL:', HOTELS_API_URL);
    }
  }, [isHotelVerificationPage]);

  // Test API connection
  useEffect(() => {
    const testAPI = async () => {
      if (!isHotelVerificationPage) {
        return; // Skip API calls if not on Hotel Verification page
      }
      
      console.log('Testing Hotels API connection...');
      const result = await testHotelsAPI();
      setApiWorking(result.success);
    };
    
    testAPI();
  }, [isHotelVerificationPage]);

  // Fetch hotels data
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        
        if (!apiWorking) {
          setHotels(FALLBACK_HOTELS);
          setFilteredHotels(FALLBACK_HOTELS);
          setLoading(false);
          return;
        }
        
        // Fetch hotels from the API and also get verification status
        const hotelsResponse = await fetch(HOTELS_API_URL);
        
        if (!hotelsResponse.ok) {
          throw new Error(`Failed to fetch hotels: ${hotelsResponse.status}`);
        }
        
        const hotelsData = await hotelsResponse.json();
        
        // Fetch verification data for hotels
        const verificationsResponse = await fetch(`${VERIFICATIONS_API_URL}/all`);
        
        if (!verificationsResponse.ok) {
          throw new Error(`Failed to fetch verifications: ${verificationsResponse.status}`);
        }
        
        const verificationsData = await verificationsResponse.json();
        
        // Map verification data to hotels
        const hotelsWithVerification = hotelsData.map(hotel => {
          const hotelVerification = verificationsData.find(v => 
            v.type === 'hotel' && 
            v.userId && 
            v.userId._id === hotel._id
          );
          
          return {
            id: hotel._id,
            name: hotel.name,
            location: `${hotel.city}, ${hotel.state}`,
            stars: hotel.rating || 0,
            ownerName: 'Hotel Owner', // This should be fetched from user data if available
            contactEmail: hotel.email,
            contactPhone: hotel.contact,
            submittedDate: hotel.createdAt,
            status: hotelVerification ? hotelVerification.status : (hotel.isVerified ? 'Approved' : 'Pending'),
            images: hotel.images ? hotel.images.length : 0,
            facilities: hotel.amenities || [],
            verifiedVegetableSupplier: false, // These would be additional fields to add to your model
            foodWasteProgram: false,
            notes: hotelVerification ? hotelVerification.notes : ''
          };
        });
        
        setHotels(hotelsWithVerification);
        setFilteredHotels(hotelsWithVerification);
        
        // Calculate stats
        const stats = {
          total: hotelsWithVerification.length,
          pending: hotelsWithVerification.filter(h => h.status === 'Pending' || h.status === 'pending').length,
          approved: hotelsWithVerification.filter(h => h.status === 'Approved' || h.status === 'approved').length,
          rejected: hotelsWithVerification.filter(h => h.status === 'Rejected' || h.status === 'rejected').length
        };
        
        setStats(stats);
        
      } catch (error) {
        console.error('Error fetching hotels:', error);
        setHotels(FALLBACK_HOTELS);
        setFilteredHotels(FALLBACK_HOTELS);
        
        // Calculate stats from fallback data
        const stats = {
          total: FALLBACK_HOTELS.length,
          pending: FALLBACK_HOTELS.filter(h => h.status === 'Pending').length,
          approved: FALLBACK_HOTELS.filter(h => h.status === 'Approved').length,
          rejected: FALLBACK_HOTELS.filter(h => h.status === 'Rejected').length
        };
        
        setStats(stats);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHotels();
  }, [apiWorking]);
  
  // Filter hotels based on tab, search query, and status filter
  useEffect(() => {
    if (!hotels || hotels.length === 0) {
      setFilteredHotels([]);
      return;
    }
    
    let result = [...hotels];
    
    // Filter by tab
    if (selectedTab === 1) {
      result = result.filter(hotel => hotel.status === 'Pending' || hotel.status === 'pending');
    } else if (selectedTab === 2) {
      result = result.filter(hotel => hotel.status === 'Approved' || hotel.status === 'approved');
    } else if (selectedTab === 3) {
      result = result.filter(hotel => hotel.status === 'Rejected' || hotel.status === 'rejected');
    } else if (selectedTab === 4) {
      result = result.filter(hotel => hotel.verifiedVegetableSupplier === true);
    } else if (selectedTab === 5) {
      result = result.filter(hotel => hotel.foodWasteProgram === true);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        hotel => 
          (hotel.name && hotel.name.toLowerCase().includes(query)) || 
          (hotel.location && hotel.location.toLowerCase().includes(query)) ||
          (hotel.ownerName && hotel.ownerName.toLowerCase().includes(query)) ||
          (hotel.contactEmail && hotel.contactEmail.toLowerCase().includes(query))
      );
    }
    
    // Filter by status if the "All" tab is selected
    if (selectedTab === 0 && statusFilter !== 'All') {
      result = result.filter(hotel => 
        hotel.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Filter by date range if provided
    if (dateRangeFilter.startDate && dateRangeFilter.endDate) {
      const startDate = new Date(dateRangeFilter.startDate);
      const endDate = new Date(dateRangeFilter.endDate);
      
      result = result.filter(hotel => {
        const hotelDate = new Date(hotel.submittedDate);
        return hotelDate >= startDate && hotelDate <= endDate;
      });
    }
    
    // Sort results
      result.sort((a, b) => {
      const fieldA = (a[sortBy] || '').toString().toLowerCase();
      const fieldB = (b[sortBy] || '').toString().toLowerCase();
        
      if (sortOrder === 'asc') {
        return fieldA.localeCompare(fieldB);
        } else {
        return fieldB.localeCompare(fieldA);
        }
      });
    
    setFilteredHotels(result);
  }, [hotels, selectedTab, searchQuery, statusFilter, dateRangeFilter, sortBy, sortOrder]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
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
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const refreshHotelsData = async () => {
    try {
    setLoading(true);
    
      if (!apiWorking) {
        setSnackbarMessage('API not working, using sample data');
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }
      
      // Fetch hotels from the API and also get verification status
      const hotelsResponse = await fetch(HOTELS_API_URL);
      
      if (!hotelsResponse.ok) {
        throw new Error(`Failed to fetch hotels: ${hotelsResponse.status}`);
      }
      
        const hotelsData = await hotelsResponse.json();
        
      // Fetch verification data for hotels
      const verificationsResponse = await fetch(`${VERIFICATIONS_API_URL}/all`);
      
      if (!verificationsResponse.ok) {
        throw new Error(`Failed to fetch verifications: ${verificationsResponse.status}`);
      }
      
      const verificationsData = await verificationsResponse.json();
      
      // Map verification data to hotels
      const hotelsWithVerification = hotelsData.map(hotel => {
        const hotelVerification = verificationsData.find(v => 
          v.type === 'hotel' && 
          v.userId && 
          v.userId._id === hotel._id
        );
        
        return {
          id: hotel._id,
          name: hotel.name,
          location: `${hotel.city}, ${hotel.state}`,
          stars: hotel.rating || 0,
          ownerName: 'Hotel Owner', // This should be fetched from user data if available
          contactEmail: hotel.email,
          contactPhone: hotel.contact,
          submittedDate: hotel.createdAt,
          status: hotelVerification ? hotelVerification.status : (hotel.isVerified ? 'Approved' : 'Pending'),
          images: hotel.images ? hotel.images.length : 0,
          facilities: hotel.amenities || [],
          verifiedVegetableSupplier: false, // These would be additional fields to add to your model
          foodWasteProgram: false,
          notes: hotelVerification ? hotelVerification.notes : ''
        };
      });
      
      setHotels(hotelsWithVerification);
      
      // Apply filters and search
      let filtered = [...hotelsWithVerification];
      
      if (searchQuery) {
        filtered = filtered.filter(
          hotel => 
            hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hotel.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      if (statusFilter !== 'All') {
        filtered = filtered.filter(hotel => hotel.status === statusFilter);
      }
      
      setFilteredHotels(filtered);
      
      // Calculate stats
      const stats = {
        total: hotelsWithVerification.length,
        pending: hotelsWithVerification.filter(h => h.status === 'Pending' || h.status === 'pending').length,
        approved: hotelsWithVerification.filter(h => h.status === 'Approved' || h.status === 'approved').length,
        rejected: hotelsWithVerification.filter(h => h.status === 'Rejected' || h.status === 'rejected').length
      };
      
      setStats(stats);
      
      setSnackbarMessage('Hotels data refreshed successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error refreshing hotels:', error);
      setSnackbarMessage(`Error refreshing data: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };
  
  // Get status chip color
  const getStatusColor = (status) => {
    if (!status) return 'default';
    
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
    if (!status) return null;
    
    switch (status) {
      case 'Approved':
        return <ApprovedIcon fontSize="small" />;
      case 'Pending':
        return <PendingIcon fontSize="small" />;
      case 'Rejected':
        return <RejectedIcon fontSize="small" />;
      default:
        return null;
    }
  };
  
  // Render star rating
  const renderStarRating = (stars) => {
    if (stars === undefined || stars === null) return null;
    
    // Convert to number and ensure it's valid
    let starCount = 0;
    try {
      // Parse the number and cap it at 5 stars
      starCount = Math.min(Math.floor(Number(stars) || 0), 5);
    } catch (e) {
      console.error("Error parsing star rating:", e);
      starCount = 0;
    }
    
    // Return stars in a safer way
    return (
      <>
        {[...Array(starCount)].map((_, i) => (
          <StarIcon key={i} fontSize="small" sx={{ color: 'gold' }} />
        ))}
      </>
    );
  };

  // Handle view details
  const handleViewDetails = (hotel) => {
    setSelectedHotel(hotel);
    setVerificationStatus(hotel.status);
    setVerificationNotes(hotel.notes || '');
    setOpenDialog(true);
  };

  // Handle close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedHotel(null);
  };

  // Handle verification status change
  const handleVerificationStatusChange = (event) => {
    setVerificationStatus(event.target.value);
  };

  // Handle verification notes change
  const handleVerificationNotesChange = (event) => {
    setVerificationNotes(event.target.value);
  };

  // Handle save verification
  const handleSaveVerification = async () => {
    if (!selectedHotel) return;
    
    try {
      setLoading(true);
      
      if (!apiWorking) {
        // Handle without API
    const updatedHotels = hotels.map(hotel => {
      if (hotel.id === selectedHotel.id) {
        return {
          ...hotel,
          status: verificationStatus,
              notes: verificationNotes,
              verifiedVegetableSupplier: verified,
              foodWasteProgram: foodWasteProgram
        };
      }
      return hotel;
    });
    
    setHotels(updatedHotels);
        setFilteredHotels(updatedHotels.filter(hotel => {
          if (statusFilter !== 'All') {
            return hotel.status === statusFilter;
          }
          return true;
        }));
        
        setSnackbarMessage('Verification updated (sample data)');
        setSnackbarOpen(true);
        setOpenDialog(false);
        return;
      }
      
      // Create or update verification record
      const verification = {
        userId: selectedHotel.id,
        type: 'hotel',
        status: verificationStatus.toLowerCase(),
        notes: verificationNotes,
        reviewedAt: new Date().toISOString()
      };
      
      // Check if verification already exists
      const verificationsResponse = await fetch(`${VERIFICATIONS_API_URL}/all`);
      const verificationsData = await verificationsResponse.json();
      const existingVerification = verificationsData.find(v => 
        v.type === 'hotel' && 
        v.userId && 
        v.userId._id === selectedHotel.id
      );
      
      let response;
      
      if (existingVerification) {
        // Update existing verification
        response = await fetch(`${VERIFICATIONS_API_URL}/${existingVerification._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(verification)
        });
      } else {
        // Create new verification
        response = await fetch(VERIFICATIONS_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(verification)
        });
      }
      
      if (!response.ok) {
        throw new Error(`Failed to update verification: ${response.status}`);
      }
      
      // Update hotel isVerified field
      if (verificationStatus === 'Approved') {
        const hotelUpdateResponse = await fetch(`${HOTELS_API_URL}/${selectedHotel.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            isVerified: true
          })
        });
        
        if (!hotelUpdateResponse.ok) {
          throw new Error(`Failed to update hotel: ${hotelUpdateResponse.status}`);
        }
      }
      
      // Refresh data
      await refreshHotelsData();
      
      setSnackbarMessage('Verification updated successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating verification:', error);
      setSnackbarMessage(`Error updating verification: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
      setOpenDialog(false);
    }
  };

  // Handle approve hotel
  const handleApproveHotel = async (hotelId) => {
    try {
      setLoading(true);
      
      if (!apiWorking) {
        // Handle without API
    const updatedHotels = hotels.map(hotel => {
          if (hotel.id === hotelId) {
        return {
          ...hotel,
              status: 'Approved'
        };
      }
      return hotel;
    });
    
    setHotels(updatedHotels);
        setFilteredHotels(updatedHotels.filter(hotel => {
          if (statusFilter !== 'All') {
            return hotel.status === statusFilter;
          }
          return true;
        }));
        
        setSnackbarMessage('Restaurant approved (sample data)');
        setSnackbarOpen(true);
        return;
      }
      
      // Create verification record using the hotel endpoint instead
      const verification = {
        isVerified: true,
        status: 'approved',
        verifiedAt: new Date().toISOString()
      };
      
      // Update hotel directly since verifications endpoint might not be working
      const hotelUpdateResponse = await fetch(`${HOTELS_API_URL}/${hotelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(verification)
      });
      
      if (!hotelUpdateResponse.ok) {
        throw new Error(`Failed to approve restaurant: ${hotelUpdateResponse.status}`);
      }
      
      // Refresh data
      await refreshHotelsData();
      
      setSnackbarMessage('Restaurant approved successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error approving restaurant:', error);
      setSnackbarMessage(`Error approving restaurant: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle reject hotel
  const handleRejectHotel = async (hotelId) => {
    try {
      setLoading(true);
      
      if (!apiWorking) {
        // Handle without API
    const updatedHotels = hotels.map(hotel => {
          if (hotel.id === hotelId) {
        return {
          ...hotel,
              status: 'Rejected'
        };
      }
      return hotel;
    });
    
    setHotels(updatedHotels);
        setFilteredHotels(updatedHotels.filter(hotel => {
          if (statusFilter !== 'All') {
            return hotel.status === statusFilter;
          }
          return true;
        }));
        
        setSnackbarMessage('Restaurant rejected (sample data)');
        setSnackbarOpen(true);
        return;
      }
      
      // Update hotel directly with rejected status
      const verification = {
        isVerified: false,
        status: 'rejected',
        verifiedAt: new Date().toISOString()
      };
      
      // Update hotel directly
      const hotelUpdateResponse = await fetch(`${HOTELS_API_URL}/${hotelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(verification)
      });
      
      if (!hotelUpdateResponse.ok) {
        throw new Error(`Failed to reject restaurant: ${hotelUpdateResponse.status}`);
      }
      
      // Refresh data
      await refreshHotelsData();
      
      setSnackbarMessage('Restaurant rejected successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error rejecting restaurant:', error);
      setSnackbarMessage(`Error rejecting restaurant: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle open inspection dialog
  const handleOpenInspectionDialog = (hotel) => {
    setSelectedHotel(hotel);
    setInspectionDate(hotel.inspectionDate || '');
    setInspectionNotes('');
    setInspectionDialogOpen(true);
  };
  
  // Handle close inspection dialog
  const handleCloseInspectionDialog = () => {
    setInspectionDialogOpen(false);
  };
  
  // Handle schedule inspection
  const handleScheduleInspection = () => {
    const updatedHotels = hotels.map(hotel => 
      hotel.id === selectedHotel.id 
        ? { 
            ...hotel, 
            inspectionStatus: 'Scheduled',
            inspectionDate: inspectionDate,
            notes: hotel.notes + (hotel.notes ? '; ' : '') + 'Inspection scheduled for ' + inspectionDate + (inspectionNotes ? ': ' + inspectionNotes : '')
          } 
        : hotel
    );
    
    setHotels(updatedHotels);
    setInspectionDialogOpen(false);
  };
  
  // Handle complete inspection
  const handleCompleteInspection = (result) => {
    const updatedHotels = hotels.map(hotel => 
      hotel.id === selectedHotel.id 
        ? { 
            ...hotel, 
            inspectionStatus: result === 'pass' ? 'Completed' : 'Failed',
            notes: hotel.notes + (hotel.notes ? '; ' : '') + 
                  (result === 'pass' ? 'Inspection passed' : 'Inspection failed') + 
                  (inspectionNotes ? ': ' + inspectionNotes : '')
          } 
        : hotel
    );
    
    setHotels(updatedHotels);
    setInspectionDialogOpen(false);
  };

  // Handle view hotel details
  const handleViewHotel = (hotel) => {
    setSelectedHotel(hotel);
    setOpenDetailsDialog(true);
  };
  
  // Handle open menu
  const handleOpenMenu = (event, hotelId) => {
    setSelectedHotelId(hotelId);
    setAnchorEl(event.currentTarget);
  };
  
  // Handle close menu
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  // Handle new hotel dialog open
  const handleOpenAddHotelDialog = () => {
    setAddHotelDialogOpen(true);
  };
  
  // Handle new hotel dialog close
  const handleCloseAddHotelDialog = () => {
    setAddHotelDialogOpen(false);
    // Reset the form
    setNewHotel({
      name: '',
      city: '',
      state: '',
      country: 'India', // Default to India
      address: '',
      pincode: '',
      contact: '',
      email: '',
      description: '',
      pricePerNight: '',
      amenities: [],
      cuisineType: '',
      capacity: '',
      establishedYear: '',
      openingHours: '',
      closingHours: '',
      gstNumber: '',
      fssaiLicense: ''
    });
  };
  
  // Handle new hotel input change with validation
  const handleNewHotelChange = (e) => {
    const { name, value } = e.target;
    setNewHotel({
      ...newHotel,
      [name]: value
    });
    
    // Validate the field
    validateField(name, value);
  };
  
  // Validate a single field
  const validateField = (name, value) => {
    let fieldErrors = { ...errors };
    
    switch(name) {
      case 'name':
        fieldErrors.name = value.trim() === '' ? 'Restaurant name is required' : '';
        break;
      case 'email':
        fieldErrors.email = !validateEmail(value) ? 'Please enter a valid email address' : '';
        break;
      case 'contact':
        fieldErrors.contact = !validatePhone(value) ? 'Please enter a valid Indian phone number' : '';
        break;
      case 'pincode':
        fieldErrors.pincode = !validatePincode(value) ? 'Please enter a valid 6-digit pincode' : '';
        // If pincode is valid, fetch location data
        if (validatePincode(value)) {
          fetchLocationFromPincode(value);
        }
        break;
      case 'pricePerNight':
        fieldErrors.pricePerNight = value <= 0 ? 'Price must be greater than 0' : '';
        break;
      case 'gstNumber':
        fieldErrors.gstNumber = value && !validateGST(value) ? 'Please enter a valid GST number' : '';
        break;
      case 'fssaiLicense':
        fieldErrors.fssaiLicense = !validateFSSAI(value) ? 'Please enter a valid 14-digit FSSAI license number' : '';
        break;
      default:
        break;
    }
    
    setErrors(fieldErrors);
  };
  
  // Validate all fields
  const validateForm = () => {
    let formIsValid = true;
    let fieldErrors = {};
    
    // Name validation
    if (!newHotel.name.trim()) {
      fieldErrors.name = 'Restaurant name is required';
      formIsValid = false;
    }
    
    // Email validation
    if (!validateEmail(newHotel.email)) {
      fieldErrors.email = 'Please enter a valid email address';
      formIsValid = false;
    }
    
    // Phone validation
    if (!validatePhone(newHotel.contact)) {
      fieldErrors.contact = 'Please enter a valid Indian phone number';
      formIsValid = false;
    }
    
    // Address validation
    if (!newHotel.address.trim()) {
      fieldErrors.address = 'Address is required';
      formIsValid = false;
    }
    
    // City validation
    if (!newHotel.city.trim()) {
      fieldErrors.city = 'City is required';
      formIsValid = false;
    }
    
    // State validation
    if (!newHotel.state.trim()) {
      fieldErrors.state = 'State is required';
      formIsValid = false;
    }
    
    // Pincode validation
    if (!validatePincode(newHotel.pincode)) {
      fieldErrors.pincode = 'Please enter a valid 6-digit pincode';
      formIsValid = false;
    }
    
    // Cuisine type validation
    if (!newHotel.cuisineType.trim()) {
      fieldErrors.cuisineType = 'Cuisine type is required';
      formIsValid = false;
    }
    
    // FSSAI License validation
    if (!validateFSSAI(newHotel.fssaiLicense)) {
      fieldErrors.fssaiLicense = 'Please enter a valid 14-digit FSSAI license number';
      formIsValid = false;
    }
    
    // GST validation - optional but must be valid if provided
    if (newHotel.gstNumber && !validateGST(newHotel.gstNumber)) {
      fieldErrors.gstNumber = 'Please enter a valid GST number';
      formIsValid = false;
    }
    
    setErrors(fieldErrors);
    return formIsValid;
  };
  
  // Handle amenities change
  const handleAmenitiesChange = (e) => {
    // Split by comma and trim each value
    const amenities = e.target.value.split(',').map(item => item.trim()).filter(item => item !== '');
    setNewHotel({
      ...newHotel,
      amenities
    });
  };
  
  // Handle add new hotel submission with validation
  const handleAddHotel = async () => {
    // Validate form before submission
    if (!validateForm()) {
      setSnackbarMessage('Please fix the errors in the form');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      setLoading(true);
      
      if (!apiWorking) {
        // Handle without API
        const id = Date.now(); // Use timestamp as a unique ID
        const newHotelEntry = {
          id,
          name: newHotel.name,
          location: `${newHotel.city}, ${newHotel.state}`,
          stars: 0,
          ownerName: 'New Owner',
          contactEmail: newHotel.email,
          contactPhone: newHotel.contact,
          submittedDate: new Date().toISOString(),
          status: 'Pending',
          images: 0,
          facilities: newHotel.amenities,
          verifiedVegetableSupplier: false,
          foodWasteProgram: false,
          cuisineType: newHotel.cuisineType,
          capacity: newHotel.capacity,
          fssaiLicense: newHotel.fssaiLicense,
          gstNumber: newHotel.gstNumber,
          notes: ''
        };
        
        setHotels([...hotels, newHotelEntry]);
        setFilteredHotels([...filteredHotels, newHotelEntry]);
        
        setSnackbarMessage('New restaurant added (sample data)');
        setSnackbarOpen(true);
        setAddHotelDialogOpen(false);
        return;
      }
      
      // Create a new hotel via API
      const hotelData = {
        name: newHotel.name,
        address: newHotel.address,
        city: newHotel.city,
        state: newHotel.state,
        country: newHotel.country,
        pincode: newHotel.pincode,
        contact: newHotel.contact,
        email: newHotel.email,
        description: newHotel.description,
        pricePerNight: Number(newHotel.pricePerNight),
        amenities: newHotel.amenities,
        isVerified: false,
        rating: 0,
        // Additional restaurant fields
        cuisineType: newHotel.cuisineType,
        capacity: newHotel.capacity,
        establishedYear: newHotel.establishedYear,
        openingHours: newHotel.openingHours,
        closingHours: newHotel.closingHours,
        gstNumber: newHotel.gstNumber,
        fssaiLicense: newHotel.fssaiLicense
      };
      
      const response = await fetch(HOTELS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hotelData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create restaurant: ${response.status}`);
      }
      
      // Refresh data
      await refreshHotelsData();
      
      setSnackbarMessage('New restaurant created successfully');
      setSnackbarOpen(true);
      setAddHotelDialogOpen(false);
    } catch (error) {
      console.error('Error creating restaurant:', error);
      setSnackbarMessage(`Error creating restaurant: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  // Handle date range change
  const handleDateRangeChange = (field, value) => {
    setDateRangeFilter({
      ...dateRangeFilter,
      [field]: value
    });
  };
  
  // Handle checkbox selection for bulk actions
  const handleSelectHotel = (hotelId) => {
    setSelectedHotels(prev => {
      if (prev.includes(hotelId)) {
        return prev.filter(id => id !== hotelId);
      } else {
        return [...prev, hotelId];
      }
    });
  };
  
  // Handle select all hotels
  const handleSelectAllHotels = (event) => {
    if (event.target.checked) {
      const allIds = filteredHotels.map(hotel => hotel.id);
      setSelectedHotels(allIds);
    } else {
      setSelectedHotels([]);
    }
  };
  
  // Handle bulk action menu open
  const handleBulkActionMenuOpen = (event) => {
    setBulkActionMenuAnchorEl(event.currentTarget);
  };
  
  // Handle bulk action menu close
  const handleBulkActionMenuClose = () => {
    setBulkActionMenuAnchorEl(null);
  };
  
  // Handle bulk approve
  const handleBulkApprove = async () => {
    try {
      setLoading(true);
      
      if (!apiWorking) {
        // Handle without API
        const updatedHotels = hotels.map(hotel => {
          if (selectedHotels.includes(hotel.id)) {
            return {
              ...hotel,
              status: 'Approved'
            };
          }
          return hotel;
        });
    
    setHotels(updatedHotels);
        setFilteredHotels(updatedHotels.filter(hotel => {
          if (statusFilter !== 'All') {
            return hotel.status === statusFilter;
          }
          return true;
        }));
        
        setSnackbarMessage(`${selectedHotels.length} restaurants approved (sample data)`);
        setSnackbarOpen(true);
      } else {
        // Process through API
        const promises = selectedHotels.map(hotelId => {
          // Create verification data
          const verification = {
            isVerified: true,
            status: 'approved',
            verifiedAt: new Date().toISOString()
          };
          
          // Update hotel directly
          return fetch(`${HOTELS_API_URL}/${hotelId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(verification)
          }).then(response => {
            if (!response.ok) {
              throw new Error(`Failed to approve restaurant: ${response.status}`);
            }
          });
        });
        
        // Wait for all operations to complete
        await Promise.all(promises);
        
        // Refresh data
        await refreshHotelsData();
        
        setSnackbarMessage(`${selectedHotels.length} restaurants approved successfully`);
    setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error in bulk approve:', error);
      setSnackbarMessage(`Error in bulk approve: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
      setBulkActionMenuAnchorEl(null);
      setSelectedHotels([]);
    }
  };
  
  // Handle bulk reject
  const handleBulkReject = async () => {
    try {
      setLoading(true);
      
      if (!apiWorking) {
        // Handle without API
        const updatedHotels = hotels.map(hotel => {
          if (selectedHotels.includes(hotel.id)) {
            return {
              ...hotel,
              status: 'Rejected'
            };
          }
          return hotel;
        });
    
    setHotels(updatedHotels);
        setFilteredHotels(updatedHotels.filter(hotel => {
          if (statusFilter !== 'All') {
            return hotel.status === statusFilter;
          }
          return true;
        }));
        
        setSnackbarMessage(`${selectedHotels.length} restaurants rejected (sample data)`);
        setSnackbarOpen(true);
      } else {
        // Process through API
        const promises = selectedHotels.map(hotelId => {
          // Create verification data
          const verification = {
            isVerified: false,
            status: 'rejected',
            verifiedAt: new Date().toISOString()
          };
          
          // Update hotel directly
          return fetch(`${HOTELS_API_URL}/${hotelId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(verification)
          }).then(response => {
            if (!response.ok) {
              throw new Error(`Failed to reject restaurant: ${response.status}`);
            }
          });
        });
        
        // Wait for all operations to complete
        await Promise.all(promises);
        
        // Refresh data
        await refreshHotelsData();
        
        setSnackbarMessage(`${selectedHotels.length} restaurants rejected successfully`);
    setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error in bulk reject:', error);
      setSnackbarMessage(`Error in bulk reject: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
      setBulkActionMenuAnchorEl(null);
      setSelectedHotels([]);
    }
  };
  
  // Check if sorting by this field
  const isSortField = (field) => sortBy === field;
  
  // Get sort direction icon
  const getSortDirectionIcon = (field) => {
    if (!isSortField(field)) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // Handle toggle verified vegetable supplier
  const handleToggleVerifiedSupplier = async (hotelId) => {
    try {
      if (!apiWorking) {
        // Handle without API
        const updatedHotels = hotels.map(hotel => {
          if (hotel.id === hotelId) {
            return {
              ...hotel,
              verifiedVegetableSupplier: !hotel.verifiedVegetableSupplier
            };
          }
          return hotel;
        });
        
        setHotels(updatedHotels);
        setFilteredHotels(updatedHotels.filter(hotel => {
          if (statusFilter !== 'All') {
            return hotel.status === statusFilter;
          }
          return true;
        }));
        
        setSnackbarMessage('Vegetable supplier status updated (sample data)');
        setSnackbarOpen(true);
      } else {
        // Get current hotel data
        const hotel = hotels.find(h => h.id === hotelId);
        if (!hotel) return;
        
        const updatedStatus = !hotel.verifiedVegetableSupplier;
        
        // First fetch the current hotel data to avoid overwriting other fields
        let currentHotelResponse = await fetch(`${HOTELS_API_URL}/${hotelId}`);
        
        if (!currentHotelResponse.ok) {
          throw new Error(`Failed to fetch hotel: ${currentHotelResponse.status}`);
        }
        
        const currentHotelData = await currentHotelResponse.json();
        
        // Only update the verifiedVegetableSupplier field
        const updateData = {
          ...currentHotelData,
          verifiedVegetableSupplier: updatedStatus
        };
        
        const response = await fetch(`${HOTELS_API_URL}/${hotelId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update supplier status: ${response.status}`);
        }
        
        // Update local state immediately for better UX
        const updatedHotels = hotels.map(h => {
          if (h.id === hotelId) {
            return {
              ...h,
              verifiedVegetableSupplier: updatedStatus
            };
          }
          return h;
        });
        
        setHotels(updatedHotels);
        setFilteredHotels(updatedHotels.filter(hotel => {
          if (statusFilter !== 'All') {
            return hotel.status === statusFilter;
          }
          return true;
        }));
        
        setSnackbarMessage('Vegetable supplier status updated successfully');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error updating vegetable supplier status:', error);
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarOpen(true);
    }
  };
  
  // Handle toggle food waste program
  const handleToggleFoodWasteProgram = async (hotelId) => {
    try {
      if (!apiWorking) {
        // Handle without API
        const updatedHotels = hotels.map(hotel => {
          if (hotel.id === hotelId) {
            return {
              ...hotel,
              foodWasteProgram: !hotel.foodWasteProgram
            };
          }
          return hotel;
        });
        
        setHotels(updatedHotels);
        setFilteredHotels(updatedHotels.filter(hotel => {
          if (statusFilter !== 'All') {
            return hotel.status === statusFilter;
          }
          return true;
        }));
        
        setSnackbarMessage('Food waste program status updated (sample data)');
        setSnackbarOpen(true);
      } else {
        // Get current hotel data
        const hotel = hotels.find(h => h.id === hotelId);
        if (!hotel) return;
        
        const updatedStatus = !hotel.foodWasteProgram;
        
        // First fetch the current hotel data to avoid overwriting other fields
        let currentHotelResponse = await fetch(`${HOTELS_API_URL}/${hotelId}`);
        
        if (!currentHotelResponse.ok) {
          throw new Error(`Failed to fetch hotel: ${currentHotelResponse.status}`);
        }
        
        const currentHotelData = await currentHotelResponse.json();
        
        // Only update the foodWasteProgram field
        const updateData = {
          ...currentHotelData,
          foodWasteProgram: updatedStatus
        };
        
        const response = await fetch(`${HOTELS_API_URL}/${hotelId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update waste program status: ${response.status}`);
        }
        
        // Update local state immediately for better UX
        const updatedHotels = hotels.map(h => {
          if (h.id === hotelId) {
            return {
              ...h,
              foodWasteProgram: updatedStatus
            };
          }
          return h;
        });
        
        setHotels(updatedHotels);
        setFilteredHotels(updatedHotels.filter(hotel => {
          if (statusFilter !== 'All') {
            return hotel.status === statusFilter;
          }
          return true;
        }));
        
        setSnackbarMessage('Food waste program status updated successfully');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error updating food waste program status:', error);
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarOpen(true);
    }
  };

  // Fetch location details from pincode
  const fetchLocationFromPincode = async (pincode) => {
    try {
      setPincodeLoading(true);
      // Using India Post Pincode API
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }
      
      const data = await response.json();
      
      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const locationData = data[0].PostOffice[0];
        
        // Update form with fetched data
        setNewHotel(prev => ({
          ...prev,
          city: locationData.District || prev.city,
          state: locationData.State || prev.state,
          country: 'India'
        }));
        
        // Store additional address components
        setAddressComponents({
          area: locationData.Name || '',
          district: locationData.District || '',
          division: locationData.Division || ''
        });
        
        setSnackbarMessage('Location details fetched successfully');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('No location found for this pincode');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      setSnackbarMessage('Failed to fetch location details');
      setSnackbarOpen(true);
    } finally {
      setPincodeLoading(false);
    }
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
            Restaurant Verification
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and verify restaurant listings for vegetable sourcing and food waste programs
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<RestaurantIcon />}
          sx={{ borderRadius: 2 }}
          onClick={handleOpenAddHotelDialog}
        >
          Add New Restaurant
        </Button>
      </Box>
      
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Restaurants
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {stats.total}
              </Typography>
              <Box sx={{ 
                mt: 2, 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <RestaurantIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  All establishments
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
                Approved
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.approved}
              </Typography>
              <Box sx={{ 
                mt: 2, 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <ApprovedIcon fontSize="small" sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Verified restaurants
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Rejected
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.rejected}
              </Typography>
              <Box sx={{ 
                mt: 2, 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <RejectedIcon fontSize="small" sx={{ color: 'error.main', mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Failed verification
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Filters and Search */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            flexWrap: { xs: 'wrap', md: 'nowrap' }
          }}>
            <TextField
              placeholder="Search by name, location, or owner..."
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
            
            {selectedTab === 0 && (
              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: { xs: '100%', sm: 200 },
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
                  <MenuItem value="All">All Status</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            )}
            
            <TextField
              label="From Date"
              type="date"
              size="small"
              value={dateRangeFilter.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ 
                width: { xs: '100%', sm: 150 },
                mr: { md: 2 },
                mb: { xs: 2, md: 0 }
              }}
            />
            
            <TextField
              label="To Date"
              type="date"
              size="small"
              value={dateRangeFilter.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ 
                width: { xs: '100%', sm: 150 },
                mr: { md: 2 },
                mb: { xs: 2, md: 0 }
              }}
            />
            
            <Box sx={{ ml: { md: 'auto' }, display: 'flex' }}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                sx={{ mr: 1 }}
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                  setDateRangeFilter({
                    startDate: '',
                    endDate: ''
                  });
                  setSortBy('name');
                  setSortOrder('asc');
                }}
              >
                Clear
              </Button>
              
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={refreshHotelsData}
              >
                Refresh
              </Button>
            </Box>
          </Box>
          
          {/* Bulk actions and selections */}
          {selectedHotels.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <Chip 
                label={`${selectedHotels.length} selected`} 
                color="primary" 
                sx={{ mr: 2 }}
              />
              
              <Button
                variant="outlined"
                size="small"
                onClick={handleBulkActionMenuOpen}
              >
                Bulk Actions
              </Button>
              
              <Menu
                anchorEl={bulkActionMenuAnchorEl}
                open={Boolean(bulkActionMenuAnchorEl)}
                onClose={handleBulkActionMenuClose}
              >
                <MenuItem onClick={handleBulkApprove}>
                  <ListItemIcon>
                    <ApproveIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText>Approve Selected</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleBulkReject}>
                  <ListItemIcon>
                    <RejectIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Reject Selected</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                  setSelectedHotels([]);
                  setBulkActionMenuAnchorEl(null);
                }}>
                  <ListItemIcon>
                    <ClearIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Clear Selection</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Tabs and Table */}
      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={selectedTab}
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
          <Tab label="All Restaurants" />
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
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedHotels.length > 0 && selectedHotels.length < filteredHotels.length}
                        checked={filteredHotels.length > 0 && selectedHotels.length === filteredHotels.length}
                        onChange={handleSelectAllHotels}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box 
                        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => handleSortChange('name')}
                      >
                        Hotel Details {getSortDirectionIcon('name')}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box 
                        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => handleSortChange('location')}
                      >
                        Location {getSortDirectionIcon('location')}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box 
                        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => handleSortChange('ownerName')}
                      >
                        Owner {getSortDirectionIcon('ownerName')}
                      </Box>
                    </TableCell>
                    <TableCell>Vegetable Program</TableCell>
                    <TableCell>
                      <Box 
                        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => handleSortChange('status')}
                      >
                        Status {getSortDirectionIcon('status')}
                      </Box>
                    </TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHotels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">
                          No hotels found matching your criteria
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHotels
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((hotel) => (
                        <TableRow key={hotel.id} hover>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedHotels.includes(hotel.id)}
                              onChange={() => handleSelectHotel(hotel.id)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="medium">
                                {hotel.name}
                                {hotel.verifiedVegetableSupplier && (
                                  <Tooltip title="Verified Vegetable Supplier">
                                    <VerifiedIcon 
                                      fontSize="small" 
                                      color="primary" 
                                      sx={{ ml: 0.5, verticalAlign: 'middle' }} 
                                    />
                                  </Tooltip>
                                )}
                              </Typography>
                              <Box sx={{ mt: 0.5 }}>
                                {renderStarRating(hotel.stars)}
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                {hotel.cuisineType || 'Multiple Cuisines'} • {hotel.images} images
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocationIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="body2">{hotel.location}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{hotel.ownerName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {hotel.contactEmail}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <RestaurantIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  {hotel.organicMenuItems || 0}/{hotel.totalMenuItems || 0} organic items
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <FoodBankIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  {hotel.surplusFoodListings || 0} surplus listings
                                </Typography>
                              </Box>
                              <Box sx={{ mt: 1 }}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={hotel.verifiedVegetableSupplier || false}
                                      onChange={() => handleToggleVerifiedSupplier(hotel.id)}
                                      color="primary"
                                      size="small"
                                    />
                                  }
                                  label={
                                    <Typography variant="caption">
                                      Verified Supplier
                                    </Typography>
                                  }
                                  sx={{ mr: 0 }}
                                />
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={hotel.foodWasteProgram || false}
                                      onChange={() => handleToggleFoodWasteProgram(hotel.id)}
                                      color="success"
                                      size="small"
                                    />
                                  }
                                  label={
                                    <Typography variant="caption">
                                      Waste Program
                                    </Typography>
                                  }
                                  sx={{ mr: 0 }}
                                />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(hotel.status)}
                              label={hotel.status}
                              color={getStatusColor(hotel.status)}
                              size="small"
                            />
                            {hotel.foodWasteProgram && (
                              <Chip
                                icon={<CompostIcon fontSize="small" />}
                                label="Food Waste Program"
                                color="success"
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <Tooltip title="View Details">
                                <IconButton 
                                  size="small"
                                  onClick={() => handleViewHotel(hotel)}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {hotel.status === 'Pending' && (
                                <>
                                  <Tooltip title="Approve">
                                    <IconButton 
                                      size="small" 
                                      color="success"
                                      onClick={() => handleApproveHotel(hotel.id)}
                                    >
                                      <ApproveIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject">
                                    <IconButton 
                                      size="small" 
                                      color="error"
                                      onClick={() => handleRejectHotel(hotel.id)}
                                    >
                                      <RejectIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                              <Tooltip title="More Actions">
                                <IconButton 
                                  size="small"
                                  onClick={(event) => handleOpenMenu(event, hotel.id)}
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              component="div"
              count={filteredHotels.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </>
        )}
      </Card>

      {/* Inspection Dialog */}
      <Dialog open={inspectionDialogOpen} onClose={handleCloseInspectionDialog}>
        <DialogTitle>Schedule Hotel Inspection</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Inspection Date"
              type="date"
              fullWidth
              value={inspectionDate}
              onChange={(e) => setInspectionDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Inspection Notes"
              multiline
              rows={4}
              fullWidth
              value={inspectionNotes}
              onChange={(e) => setInspectionNotes(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInspectionDialog}>Cancel</Button>
          <Button onClick={handleScheduleInspection} color="primary">
            Schedule
          </Button>
          <Button onClick={() => handleCompleteInspection('pass')} color="success">
            Pass Inspection
          </Button>
          <Button onClick={() => handleCompleteInspection('fail')} color="error">
            Fail Inspection
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hotel Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedHotel?.name || 'Hotel Details'}
          <IconButton
            aria-label="close"
            onClick={() => setOpenDetailsDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedHotel && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Hotel Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{selectedHotel.location}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{selectedHotel.stars} Stars</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{selectedHotel.contactPhone}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{selectedHotel.contactEmail}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Sustainability Information
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>Verified Vegetable Supplier:</strong> {selectedHotel.verifiedVegetableSupplier ? 'Yes' : 'No'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>Food Waste Program:</strong> {selectedHotel.foodWasteProgram ? 'Yes' : 'No'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>Organic Menu Items:</strong> {selectedHotel.organicMenuItems}/{selectedHotel.totalMenuItems}
                  </Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>Surplus Food Listings:</strong> {selectedHotel.surplusFoodListings}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Facilities
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedHotel.facilities && selectedHotel.facilities.map((facility, index) => (
                    <Chip key={index} label={facility} size="small" color="primary" variant="outlined" />
                  ))}
                  {(!selectedHotel.facilities || selectedHotel.facilities.length === 0) && (
                    <Typography variant="body2" color="text.secondary">
                      No facilities listed
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Vegetable Requirements
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedHotel.vegetableRequirements && selectedHotel.vegetableRequirements.map((veg, index) => (
                    <Chip key={index} label={veg} size="small" color="success" variant="outlined" />
                  ))}
                  {(!selectedHotel.vegetableRequirements || selectedHotel.vegetableRequirements.length === 0) && (
                    <Typography variant="body2" color="text.secondary">
                      No vegetable requirements listed
                    </Typography>
                  )}
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Monthly Vegetable Budget:</strong> {selectedHotel.monthlyVegetableBudget}
                  </Typography>
                </Box>
              </Grid>
              {selectedHotel.notes && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Notes
                  </Typography>
                  <Typography variant="body2">
                    {selectedHotel.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
          {selectedHotel && selectedHotel.status === 'Pending' && (
            <>
              <Button 
                color="error" 
                onClick={() => handleRejectHotel(selectedHotel.id)}
                startIcon={<RejectIcon />}
              >
                Reject
              </Button>
              <Button 
                color="success" 
                variant="contained"
                onClick={() => handleApproveHotel(selectedHotel.id)}
                startIcon={<ApproveIcon />}
              >
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Add the Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setSnackbarOpen(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />

      {/* Add the action menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          const hotel = hotels.find(h => h.id === selectedHotelId);
          if (hotel) {
            handleViewHotel(hotel);
            handleCloseMenu();
          }
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        
        {selectedHotelId && hotels.find(h => h.id === selectedHotelId)?.status === 'Pending' && (
          <>
            <MenuItem onClick={() => handleApproveHotel(selectedHotelId)}>
              <ListItemIcon>
                <ApproveIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText>Approve Hotel</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleRejectHotel(selectedHotelId)}>
              <ListItemIcon>
                <RejectIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Reject Hotel</ListItemText>
            </MenuItem>
          </>
        )}
        
        <Divider />
        
        <MenuItem onClick={() => {
          const hotel = hotels.find(h => h.id === selectedHotelId);
          if (hotel) {
            setSelectedHotel(hotel);
            setInspectionDialogOpen(true);
            handleCloseMenu();
          }
        }}>
          <ListItemIcon>
            <InspectionIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Schedule Inspection</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add Hotel Dialog */}
      <Dialog
        open={addHotelDialogOpen}
        onClose={handleCloseAddHotelDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Add New Restaurant
          <IconButton
            aria-label="close"
            onClick={handleCloseAddHotelDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Restaurant Name"
                name="name"
                value={newHotel.name}
                onChange={handleNewHotelChange}
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Cuisine Type"
                name="cuisineType"
                value={newHotel.cuisineType}
                onChange={handleNewHotelChange}
                fullWidth
                required
                error={!!errors.cuisineType}
                helperText={errors.cuisineType}
                placeholder="North Indian, South Indian, Chinese, etc."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="FSSAI License Number"
                name="fssaiLicense"
                value={newHotel.fssaiLicense}
                onChange={handleNewHotelChange}
                fullWidth
                required
                error={!!errors.fssaiLicense}
                helperText={errors.fssaiLicense || "14-digit FSSAI license number"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="GST Number (Optional)"
                name="gstNumber"
                value={newHotel.gstNumber}
                onChange={handleNewHotelChange}
                fullWidth
                error={!!errors.gstNumber}
                helperText={errors.gstNumber}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Seating Capacity"
                name="capacity"
                type="number"
                value={newHotel.capacity}
                onChange={handleNewHotelChange}
                fullWidth
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Average Meal Price (₹)"
                name="pricePerNight"
                type="number"
                value={newHotel.pricePerNight}
                onChange={handleNewHotelChange}
                fullWidth
                required
                error={!!errors.pricePerNight}
                helperText={errors.pricePerNight}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Year Established"
                name="establishedYear"
                type="number"
                value={newHotel.establishedYear}
                onChange={handleNewHotelChange}
                fullWidth
                inputProps={{ min: 1900, max: new Date().getFullYear() }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Opening Time"
                  name="openingHours"
                  type="time"
                  value={newHotel.openingHours}
                  onChange={handleNewHotelChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Closing Time"
                  name="closingHours"
                  type="time"
                  value={newHotel.closingHours}
                  onChange={handleNewHotelChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={newHotel.description}
                onChange={handleNewHotelChange}
                multiline
                rows={3}
                fullWidth
                required
                error={!!errors.description}
                helperText={errors.description}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" gutterBottom>
                Location
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Address"
                name="address"
                value={newHotel.address}
                onChange={handleNewHotelChange}
                fullWidth
                required
                error={!!errors.address}
                helperText={errors.address}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="City"
                name="city"
                value={newHotel.city}
                onChange={handleNewHotelChange}
                fullWidth
                required
                error={!!errors.city}
                helperText={errors.city}
                disabled={pincodeLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="State"
                name="state"
                value={newHotel.state}
                onChange={handleNewHotelChange}
                fullWidth
                required
                error={!!errors.state}
                helperText={errors.state}
                disabled={pincodeLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Country"
                name="country"
                value={newHotel.country}
                onChange={handleNewHotelChange}
                fullWidth
                required
                error={!!errors.country}
                helperText={errors.country}
                disabled={true} // Always disabled as we only support India
              />
            </Grid>
            
            {addressComponents.area && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Address details from pincode: {addressComponents.area}, {addressComponents.district}, {addressComponents.division}
                </Typography>
              </Grid>
            )}
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Postal Code"
                name="pincode"
                value={newHotel.pincode}
                onChange={handleNewHotelChange}
                fullWidth
                required
                error={!!errors.pincode}
                helperText={errors.pincode || "6-digit pincode"}
                InputProps={{
                  endAdornment: pincodeLoading ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" gutterBottom>
                Contact Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Contact Phone"
                name="contact"
                value={newHotel.contact}
                onChange={handleNewHotelChange}
                fullWidth
                required
                error={!!errors.contact}
                helperText={errors.contact || "10-digit mobile number"}
                placeholder="+91 9876543210"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={newHotel.email}
                onChange={handleNewHotelChange}
                fullWidth
                required
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" gutterBottom>
                Amenities & Facilities
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Amenities (comma-separated)"
                name="amenities"
                value={newHotel.amenities.join(', ')}
                onChange={handleAmenitiesChange}
                placeholder="AC, Outdoor Seating, Parking, WiFi, Bar, Live Music"
                fullWidth
                helperText="Enter amenities separated by commas"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddHotelDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleAddHotel}
          >
            Add Restaurant
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HotelVerification; 