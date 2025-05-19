import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  ImageList,
  ImageListItem,
  MobileStepper,
  InputAdornment,
  TablePagination,
  FormHelperText,
  Skeleton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, AccessTime as AccessTimeIcon, NoFood as NoFoodIcon, CloudUpload as CloudUploadIcon, KeyboardArrowLeft, KeyboardArrowRight, Search as SearchIcon, Preview as PreviewIcon, Visibility as VisibilityIcon, BrokenImage as BrokenImageIcon } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import * as leftoverFoodService from '../../services/leftoverFoodService.jsx';
import './LeftoverFood.css';
import { format } from 'date-fns';
import api from '../../services/api.jsx';
import { useUser } from '../../context/UserContext';
import { useTheme } from '@mui/material/styles';
import { uploadImage } from '../../lib/imageUpload.jsx';
import axios from 'axios';

// Updated image handling component that works with the hybrid storage approach
const ImageWithFallback = ({ src, alt, style, ...props }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  // Process the source URL to handle different storage strategies
  const processedSrc = useMemo(() => {
    if (!src) return '';
    
    // For already formed complete URLs, don't modify
    if (src.startsWith('http') && !src.includes('/api/products/image/')) {
      return src;
    }
    
    const baseUrl = import.meta.env.VITE_BASE_URL || 'http://https://fresh-connect-backend.onrender.com';
    
    // Extract the filename from the URL if it contains one
    if (src.includes('/api/products/image/')) {
      // Extract the filename part from the path
      const filename = src.split('/').pop();
      if (filename) {
        // Use the new file-based endpoint instead of ID-based
        return `${baseUrl}/api/products/image/file/${filename}`;
      }
    }
    
    // For local paths that need base URL
    if (!src.startsWith(baseUrl) && !src.startsWith('/api/')) {
      return `${baseUrl}${src.startsWith('/') ? '' : '/'}${src}`;
    }
    
    return src;
  }, [src]);

  useEffect(() => {
    // Reset states when src changes
    setError(false);
    setLoading(true);
  }, [src]);

  // If the image is from an API endpoint that requires auth, use this approach
  const fetchImage = useCallback(async () => {
    if (!processedSrc) return;
    
    try {
      // Only try to fetch if it's an API endpoint that might need auth
      if (processedSrc.includes('/api/')) {
        const response = await fetch(processedSrc, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load image: ${response.status}`);
        }
      }
    } catch (err) {
      console.error('Error fetching image:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [processedSrc, token]);

  useEffect(() => {
    fetchImage();
  }, [fetchImage]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {loading && (
        <Skeleton 
          variant="rectangular" 
          width="100%" 
          height="100%" 
          animation="wave" 
        />
      )}
      
      {error ? (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '100%', 
            height: '100%',
            bgcolor: 'grey.100',
            color: 'text.secondary'
          }}
        >
          <BrokenImageIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="caption">Image not available</Typography>
        </Box>
      ) : (
        <img
          src={processedSrc}
          alt={alt}
          style={{ 
            objectFit: 'cover',
            display: loading ? 'none' : 'block',
            ...style
          }}
          onError={() => {
            console.warn(`Failed to load image: ${processedSrc}`);
            setError(true);
            setLoading(false);
          }}
          onLoad={() => setLoading(false)}
          {...props}
        />
      )}
    </Box>
  );
};

const LeftoverFood = () => {
  const { user } = useUser();
  const theme = useTheme();
  
  // State for listings with pagination
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // State for form dialog
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    unit: 'portions',
    price: '',
    category: '',
    expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    dietaryInfo: [],
    images: [],
    status: 'available'
  });
  const [editingId, setEditingId] = useState(null);

  // State for delete dialog
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // State for image carousel
  const [activeStep, setActiveStep] = useState(0);

  // Add form validation state
  const [formErrors, setFormErrors] = useState({});

  // Fetch listings on component mount and when pagination changes
  useEffect(() => {
    fetchListings();
  }, [page, rowsPerPage, category, search]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please correct the errors in the form',
        severity: 'error',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare the data for submission
      const submissionData = {
        ...formData,
        // Ensure expiryTime is properly formatted
        expiryTime: formData.expiryTime instanceof Date 
          ? formData.expiryTime.toISOString() 
          : formData.expiryTime,
        // Ensure price is a number
        price: parseFloat(formData.price) || 0,
        // Ensure quantity is a number
        quantity: parseInt(formData.quantity) || 0,
        // Ensure images is an array
        images: Array.isArray(formData.images) ? formData.images : []
      };
      
      console.log('Submitting form data:', submissionData);
      console.log('Images being submitted:', submissionData.images);
      
      let response;
      if (editingId) {
        // Update existing listing
        console.log(`Updating listing with ID: ${editingId}`);
        response = await leftoverFoodService.updateListing(editingId, submissionData);
        console.log('Updated listing:', response);
        
        setSnackbar({
          open: true,
          message: 'Listing updated successfully',
          severity: 'success',
        });
      } else {
        // Create new listing
        console.log('Creating new listing');
        response = await leftoverFoodService.createListing(submissionData);
        console.log('New listing created:', response);
        
        setSnackbar({
          open: true,
          message: 'Listing created successfully',
          severity: 'success',
        });
      }
      
      // Refresh listings after successful operation
      await fetchListings();
      
      // Close the form dialog
      handleCloseForm();
    } catch (err) {
      console.error('Error submitting form:', err);
      
      // Show detailed error message
      let errorMessage = 'Failed to save listing';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    try {
      await leftoverFoodService.deleteListing(deleteId);
      
      // Refresh listings after deletion
      fetchListings();
      
      setSnackbar({
        open: true,
        message: 'Listing deleted successfully',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error deleting listing:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.response?.data?.message || err.message}`,
        severity: 'error',
      });
    }
    
    handleCloseDelete();
  };

  // Handle status change
  const handleStatusChange = async (id, status) => {
    try {
      await leftoverFoodService.updateListingStatus(id, status);
      
      // Refresh listings after status change
      fetchListings();
      
      setSnackbar({
        open: true,
        message: `Status updated to ${status}`,
        severity: 'success',
      });
    } catch (err) {
      console.error('Error updating status:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.response?.data?.message || err.message}`,
        severity: 'error',
      });
    }
  };

  // Dialog handlers
  const handleOpenForm = (listing = null) => {
    console.log('Opening form with listing:', listing);
    
    if (listing) {
      // Format the expiry time properly
      const expiryTime = listing.expiryTime ? new Date(listing.expiryTime) : new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      // Ensure images is an array
      const images = Array.isArray(listing.images) ? listing.images : [];
      console.log('Setting images for editing:', images);
      
      // Set form data for editing
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        quantity: listing.quantity || 1,
        unit: listing.unit || 'portions',
        expiryTime: expiryTime,
        price: listing.price !== undefined ? listing.price : 0,
        category: listing.category || 'meals',
        dietaryInfo: listing.dietaryInfo || [],
        images: images,
        status: listing.status || 'available'
      });
      
      console.log('Setting form data for editing:', {
        title: listing.title || '',
        description: listing.description || '',
        quantity: listing.quantity || 1,
        unit: listing.unit || 'portions',
        expiryTime: expiryTime,
        price: listing.price !== undefined ? listing.price : 0,
        category: listing.category || 'meals',
        dietaryInfo: listing.dietaryInfo || [],
        images: images,
        status: listing.status || 'available'
      });
      
      setEditingId(listing._id);
    } else {
      // Set default form data for new listing
      setFormData({
        title: '',
        description: '',
        quantity: 1,
        unit: 'portions',
        expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        price: 0,
        category: 'meals',
        dietaryInfo: [],
        images: [],
        status: 'available'
      });
      setEditingId(null);
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setFormData({
      title: '',
      description: '',
      quantity: '',
      unit: 'portions',
      price: '',
      category: '',
      expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      dietaryInfo: [],
      images: [],
      status: 'available'
    });
    setEditingId(null);
    setFormErrors({});
    setActiveStep(0);
  };

  const handleOpenDelete = (id) => {
    setDeleteId(id);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setDeleteId(null);
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Fetch listings from API
  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if token exists
      const authToken = localStorage.getItem('token');
      console.log('Authentication token available:', !!authToken);
      
      if (!authToken) {
        console.warn('No authentication token found. User might not be logged in.');
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }
      
      console.log('Fetching leftover food listings');
      console.log('Page:', page, 'Rows per page:', rowsPerPage, 'Category:', category, 'Search:', search);
      
      // Use the service to get listings with pagination
      const data = await leftoverFoodService.getMyListings(page + 1, rowsPerPage, category, search);
      console.log('Listings data received:', data);
      
      // Check if we're using fallback data
      if (data.message && data.message.includes('fallback data')) {
        setSnackbar({
          open: true,
          message: 'Unable to connect to server. Please check your connection.',
          severity: 'warning',
        });
      }
      
      if (!data || (Array.isArray(data.items) && data.items.length === 0)) {
        console.log('No listings found in the database');
        setListings([]);
        setTotalItems(0);
      } else {
        setListings(data.items || []);
        setTotalItems(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response && error.response.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (error.response && error.response.data && error.response.data.message) {
        setError(`Error: ${error.response.data.message}`);
      } else if (error.message === 'Network Error') {
        setError('Network error. Please check your connection and ensure the server is running.');
      } else {
        setError('Failed to load listings. Please try again.');
      }
      
      // Show error in snackbar too
      setSnackbar({
        open: true,
        message: `Error loading listings: ${error.message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, category, search]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Set loading state for image upload
    setLoading(true);
    
    try {
      console.log('Uploading image:', file.name);
      
      // Use the uploadImage utility function exactly as in the store-image project
      const imageUrl = await uploadImage(file);
      
      console.log('Image uploaded successfully, URL:', imageUrl);
      
      // Add the image URL to the form data
      setFormData(prev => {
        const newImages = [...(prev.images || []), imageUrl];
        console.log('Updated form images:', newImages);
        return {
          ...prev,
          images: newImages
        };
      });
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Image uploaded successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Show error message
      setSnackbar({
        open: true,
        message: `Error uploading image: ${error.message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Image carousel handlers
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Form field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user makes changes
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0); // Reset to first page when search changes
  };

  // Handle category filter
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(0); // Reset to first page when category changes
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    // Required fields validation
    if (!formData.title || formData.title.trim() === '') {
      errors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }
    
    if (!formData.description || formData.description.trim() === '') {
      errors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }
    
    // Quantity validation - ensure it's a positive integer
    if (!formData.quantity || formData.quantity === '') {
      errors.quantity = 'Quantity is required';
    } else if (isNaN(parseInt(formData.quantity))) {
      errors.quantity = 'Quantity must be a valid number';
    } else if (parseInt(formData.quantity) <= 0) {
      errors.quantity = 'Quantity must be greater than zero';
    } else if (parseInt(formData.quantity) > 1000) {
      errors.quantity = 'Quantity is too high';
    }
    
    if (!formData.unit || formData.unit === '') {
      errors.unit = 'Unit is required';
    }
    
    // Price validation - ensure it's a non-negative number
    if (!formData.price || formData.price === '') {
      errors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price))) {
      errors.price = 'Price must be a valid number';
    } else if (parseFloat(formData.price) < 0) {
      errors.price = 'Price cannot be negative';
    } else if (parseFloat(formData.price) > 50010) {
      errors.price = 'Price is too high';
    }
    
    if (!formData.category || formData.category === '') {
      errors.category = 'Category is required';
    }
    
    // Expiry time validation
    if (!formData.expiryTime) {
      errors.expiryTime = 'Expiry time is required';
    } else {
      const expiryTime = new Date(formData.expiryTime);
      const now = new Date();
      if (expiryTime <= now) {
        errors.expiryTime = 'Expiry time must be in the future';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  if (loading && listings.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'primary.main', mb: { xs: 2, md: 0 } }}>
            Leftover Food Listings
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              Add New Listing
            </Button>
          </Box>
        </Box>

        {/* Search and Filter */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search listings..."
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: '200px' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: '200px' } }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={handleCategoryChange}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="meals">Meals</MenuItem>
              <MenuItem value="desserts">Desserts</MenuItem>
              <MenuItem value="beverages">Beverages</MenuItem>
              <MenuItem value="snacks">Snacks</MenuItem>
              <MenuItem value="bakery">Bakery</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Error message */}
        {error && (
          <Box sx={{ mb: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={fetchListings}
              >
                Retry
              </Button>
            </Box>
          </Box>
        )}

        {/* Listings Grid */}
        <Grid container spacing={3}>
          {/* If no data */}
          {listings.length === 0 && !loading && (
            <Box sx={{ 
              width: '100%', 
              textAlign: 'center', 
              py: 8,
              color: 'text.secondary'
            }}>
              <NoFoodIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6">No food listings yet</Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Create your first leftover food listing by clicking the Add New Listing button
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenForm()}
                >
                  Add New Listing
                </Button>
              </Box>
            </Box>
          )}

          {listings.map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing._id}>
              <Card className="card-hover" sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ position: 'relative', height: 200 }}>
                  {listing.images && listing.images.length > 0 ? (
                    <ImageWithFallback
                      src={listing.images[0]}
                      alt={listing.title}
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.200' }}>
                      <Typography variant="body2" color="text.secondary">No image</Typography>
                    </Box>
                  )}
                  <Chip
                    label={listing.status}
                    color={
                      listing.status === 'available' ? 'success' :
                      listing.status === 'reserved' ? 'warning' :
                      listing.status === 'sold' ? 'error' : 'default'
                    }
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      textTransform: 'capitalize'
                    }}
                  />
                  <Chip
                    label={`₹${listing.price}`}
                    color="primary"
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      right: 16,
                    }}
                  />
                </Box>
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 600 }}>
                    {listing.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {listing.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Quantity:
                    </Typography>
                    <Chip 
                      label={`${listing.quantity} ${listing.unit}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTimeIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Expires: {format(new Date(listing.expiryTime), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {listing.dietaryInfo?.map((info) => (
                      <Chip
                        key={info}
                        label={info}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={listing.status}
                        onChange={(e) => handleStatusChange(listing._id, e.target.value)}
                        displayEmpty
                        size="small"
                      >
                        <MenuItem value="available">Available</MenuItem>
                        <MenuItem value="reserved">Reserved</MenuItem>
                        <MenuItem value="sold">Sold</MenuItem>
                      </Select>
                    </FormControl>
                    <Box>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenForm(listing)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDelete(listing._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Pagination */}
        {!loading && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <TablePagination
              rowsPerPageOptions={[6, 12, 24]}
              component="div"
              count={totalItems}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelDisplayedRows={({ from, to, count }) => {
                return `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`;
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Form Dialog */}
      <Dialog 
        open={openForm} 
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          {editingId ? 'Edit Food Listing' : 'Add New Food Listing'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {/* Title */}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  required
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                />
              </Grid>

              {/* Price and Category */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    inputProps: { min: 0, step: "0.01" } // Prevent negative values
                  }}
                  value={formData.price}
                  onChange={handleChange}
                  required
                  error={!!formErrors.price}
                  helperText={formErrors.price}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!formErrors.category}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category"
                  >
                    <MenuItem value="meals">Meals</MenuItem>
                    <MenuItem value="desserts">Desserts</MenuItem>
                    <MenuItem value="beverages">Beverages</MenuItem>
                    <MenuItem value="snacks">Snacks</MenuItem>
                    <MenuItem value="bakery">Bakery</MenuItem>
                  </Select>
                  {formErrors.category && (
                    <FormHelperText>{formErrors.category}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Quantity and Unit */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  InputProps={{
                    inputProps: { min: 1, step: 1 } // Prevent negative and zero values
                  }}
                  error={!!formErrors.quantity}
                  helperText={formErrors.quantity}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!formErrors.unit}>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    label="Unit"
                  >
                    <MenuItem value="portions">Portions</MenuItem>
                    <MenuItem value="pieces">Pieces</MenuItem>
                    <MenuItem value="plates">Plates</MenuItem>
                    <MenuItem value="boxes">Box</MenuItem>
                    <MenuItem value="kg">Kilograms</MenuItem>
                    <MenuItem value="g">Grams</MenuItem>
                    <MenuItem value="l">Liters</MenuItem>
                    <MenuItem value="ml">Milliliters</MenuItem>
                    <MenuItem value="pcs">Pieces</MenuItem>
                    <MenuItem value="pack">Pack</MenuItem>
                    <MenuItem value="slices">Slices</MenuItem>
                    <MenuItem value="bowls">Bowls</MenuItem>
                  </Select>
                  {formErrors.unit && (
                    <FormHelperText>{formErrors.unit}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Expiry Time */}
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Expiry Time"
                    value={formData.expiryTime}
                    onChange={(newValue) => {
                      setFormData(prev => ({
                        ...prev,
                        expiryTime: newValue
                      }));
                      // Clear error when user changes the value
                      if (formErrors.expiryTime) {
                        setFormErrors(prev => ({
                          ...prev,
                          expiryTime: undefined
                        }));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        required 
                        error={!!formErrors.expiryTime}
                        helperText={formErrors.expiryTime}
                      />
                    )}
                    minDateTime={new Date()} // Ensure date cannot be in the past
                    disablePast={true} // Additional protection against past dates
                  />
                </LocalizationProvider>
              </Grid>

              {/* Dietary Info */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Dietary Info</InputLabel>
                  <Select
                    multiple
                    name="dietaryInfo"
                    value={formData.dietaryInfo}
                    label="Dietary Info"
                    onChange={handleChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    <MenuItem value="Vegetarian">Vegetarian</MenuItem>
                    <MenuItem value="Vegan">Vegan</MenuItem>
                    <MenuItem value="Gluten-Free">Gluten-Free</MenuItem>
                    <MenuItem value="Dairy-Free">Dairy-Free</MenuItem>
                    <MenuItem value="Nut-Free">Nut-Free</MenuItem>
                    <MenuItem value="Low-Carb">Low-Carb</MenuItem>
                    <MenuItem value="Keto">Keto</MenuItem>
                    <MenuItem value="Halal">Halal</MenuItem>
                    <MenuItem value="Kosher">Kosher</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Images */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <PreviewIcon sx={{ mr: 1 }} /> Images
                </Typography>
                {/* Simple image management without preview */}
                <Box sx={{ 
                  mb: 2, 
                  p: 3, 
                  border: '1px dashed #ccc',
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary'
                }}>
                  {formData.images && formData.images.length > 0 ? (
                    <>
                      <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 2 }}>
                        {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} uploaded
                      </Typography>
                      
                      {/* List of image filenames */}
                      <Box sx={{ width: '100%', mb: 2 }}>
                        {formData.images.map((img, index) => {
                          // Extract filename from URL using proper URL parsing
                          let filename = '';
                          try {
                            const url = new URL(img);
                            filename = url.pathname.split('/').pop() || `Image ${index + 1}`;
                          } catch (e) {
                            filename = img.split('/').pop() || `Image ${index + 1}`;
                          }
                          
                          return (
                            <Box 
                              key={index}
                              sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 1,
                                borderBottom: '1px solid #eee'
                              }}
                            >
                              <Typography variant="caption" sx={{ maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {filename}
                              </Typography>
                              <Button 
                                size="small" 
                                color="error"
                                onClick={() => handleRemoveImage(index)}
                              >
                                Remove
                              </Button>
                            </Box>
                          );
                        })}
                      </Box>
                      
                      <Button 
                        size="small" 
                        color="error" 
                        variant="outlined"
                        onClick={() => setFormData(prev => ({...prev, images: []}))}
                      >
                        Clear all images
                      </Button>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No images uploaded yet
                    </Typography>
                  )}
                </Box>

                {/* Image Upload */}
                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 1 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mt: 1 }}
                    disabled={loading}
                  >
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageUpload}
                    />
                  </Button>
                  <Typography variant="caption" color="text.secondary" align="center">
                    Images smaller than 10MB will be stored in the database.
                    <br />
                    Larger images will be stored in the file system.
                  </Typography>
                  {loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      <Typography variant="caption">Uploading image...</Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (editingId ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog 
        open={openDelete} 
        onClose={handleCloseDelete}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>Delete Listing</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this food listing? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LeftoverFood; 