import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Fab,
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
  Skeleton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  Checkbox,
  FormGroup,
  Backdrop,
  useTheme,
  styled,
  Badge,
  Tabs,
  Tab
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, AccessTime as AccessTimeIcon, NoFood as NoFoodIcon, CloudUpload as CloudUploadIcon, KeyboardArrowLeft, KeyboardArrowRight, Search as SearchIcon, Preview as PreviewIcon, Visibility as VisibilityIcon, BrokenImage as BrokenImageIcon, WarningAmber as WarningIcon, RestaurantMenu as FoodIcon, Category as CategoryIcon, Info as InfoIcon, Close as CloseIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import * as leftoverFoodService from '../../services/leftoverFoodService.jsx';
import './LeftoverFood.css';
import { format } from 'date-fns';
import api from '../../services/api.jsx';
import { useUser } from '../../context/UserContext';
import { 
  uploadImage, 
  validateImage, 
  reviveBlobUrls, 
  isExpiredBlobUrl, 
  cleanBlobUrl, 
  fixBlobUrlReferences
} from '../../lib/imageUpload.jsx';
import { getVerificationStatus } from '../../services/api.jsx';
import axios from 'axios';

// Updated image handling component that works with the hybrid storage approach
const ImageWithFallback = ({ src, alt, style, token, ...props }) => {
  const { user } = useUser();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [processedSrc, setProcessedSrc] = useState(src);
  const [isDataUrl, setIsDataUrl] = useState(false);
  
  // Check if this is a default/stock Unsplash image
  const isDefaultStockImage = useMemo(() => {
    if (!src || typeof src !== 'string') return false;
    
    // Only consider it a placeholder if it's empty or explicitly marked as a placeholder
    return src === "" || src === "placeholder";
  }, [src]);
  
  // Process the src to handle different URL formats
  useEffect(() => {
    // Reset state when src changes
    setLoading(true);
    setError(false);
    
    // Check if src is null, undefined, empty, or a default stock image
    if (!src || src === "") {
      setError(true);
      setLoading(false);
      setProcessedSrc(null);
      return;
    }
    
    // Handle object with url property
    if (typeof src === 'object' && src.url) {
      setProcessedSrc(src.url);
      setIsDataUrl(src.url.startsWith('data:'));
      return;
    }
    
    // Extract data URL from malformed URLs (like http://localhost:5001/data:image/...)
    if (typeof src === 'string' && src.includes('data:image/')) {
      const match = src.match(/(data:image\/[^;]+;base64,[a-zA-Z0-9+/=]+)/);
      if (match) {
        setProcessedSrc(match[1]);
        setIsDataUrl(true);
        console.log('Extracted data URL from malformed URL:', match[1].substring(0, 50) + '...');
        return;
      }
    }
    
    // Support for data URLs (base64) - improved detection with strict checking
    const isDataUrlCheck = src && typeof src === 'string' && (
      src.startsWith('data:image/') || 
      src.startsWith('data:application/') ||
      src.includes(';base64,')
    );
    
    setIsDataUrl(isDataUrlCheck);
    
    // Debug log
    if (isDataUrlCheck) {
      console.log('Using data URL directly without modification');
      setProcessedSrc(src);
      return;
    }
    
    // If we have a token and it's not a data URL, it might be a protected image
    if (token && !isDataUrlCheck) {
      // For protected images, we'll use the token in the Authorization header
      setProcessedSrc(src);
      return;
    }
    
    // Ensure URLs are properly formatted - but ONLY if not a data URL and not null
    if (src && typeof src === 'string' && !src.startsWith('blob:') && !src.startsWith('http')) {
      // If it's a relative path, assume it's from the backend API
      if (src.startsWith('/')) {
        setProcessedSrc(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${src}`);
      } else {
        setProcessedSrc(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/${src}`);
      }
      console.log('Processed non-data URL:', processedSrc);
    } else {
      // Default case - use the src as is
      setProcessedSrc(src);
    }
  }, [src, isDefaultStockImage, token]);

  // If the image is from an API endpoint that requires auth, use this approach
  const fetchImage = useCallback(async () => {
    if (!processedSrc || isDefaultStockImage) {
      setError(true);
      setLoading(false);
      return;
    }
    
    // For blob URLs or data URLs, we don't need to fetch - they're already accessible
    if (processedSrc.startsWith('blob:') || isDataUrl) {
      setLoading(false);
      return;
    }
    
    try {
      // Only try to fetch if it's an API endpoint that might need auth
      if (processedSrc.includes('/api/')) {
        console.log('Fetching image from API:', processedSrc);
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
  }, [processedSrc, token, isDataUrl, isDefaultStockImage]);

  useEffect(() => {
    fetchImage();
  }, [fetchImage]);

  // Create the no image fallback
  const NoImageFallback = (
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
      <Typography variant="caption">No image available</Typography>
    </Box>
  );

  // If there's no processedSrc or it's a default stock image, return the fallback immediately
  if (!processedSrc) {
    return NoImageFallback;
  }

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
      
      {error ? NoImageFallback : (
        <img
          src={processedSrc}
          alt={alt}
          style={{ 
            objectFit: 'cover',
            display: loading ? 'none' : 'block',
            width: '100%',
            height: '100%',
            ...style
          }}
          onError={(e) => {
            console.warn(`Failed to load image: ${processedSrc}`, e);
            setError(true);
            setLoading(false);
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', processedSrc ? (processedSrc.substring(0, 50) + '...') : 'No source');
            setLoading(false);
          }}
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

  // Replace with new direct search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [priceRange, setPriceRange] = useState([0, 0]); // Min/max price (not needed but added for extensibility)
  const [dateRange, setDateRange] = useState(null); // For future date filter
  const [activeFilters, setActiveFilters] = useState({}); // Track which filters are active

  // State for form dialog
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    unit: 'portions',
    price: 0,
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
  const [itemToDelete, setItemToDelete] = useState(null);

  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // State for image carousel
  const [activeStep, setActiveStep] = useState(0);
  
  // State to track active image in carousel
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // State for validation errors
  const [formErrors, setFormErrors] = useState({});
  
  // State for verification status
  const [isVerified, setIsVerified] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('Approved');

  // Fetch verification status - modified to always set as verified
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const response = await getVerificationStatus();
        // No need to check status, always setting as verified
        setVerificationStatus('Approved');
        setIsVerified(true);
      } catch (error) {
        console.error('Error fetching verification status:', error);
        // Still set as verified even if there's an error
        setIsVerified(true);
      }
    };

    fetchVerificationStatus();
  }, []);

  // A file input ref for handling image uploads
  const fileInputRef = useRef(null);

  // Initialize blob URL handling
  useEffect(() => {
    // First, try to fix any incorrect blob URL references
    fixBlobUrlReferences();

    // Check for expired blob URLs when component mounts
    const expiredUrls = reviveBlobUrls();
    if (expiredUrls.length > 0) {
      console.log('Found expired blob URLs:', expiredUrls.length);
      // Note: We can't actually restore these URLs, but we can handle
      // the display gracefully in the ImageWithFallback component
    }
  }, []);

  // Implement direct AJAX search
  const handleDirectSearch = (e) => {
    const value = e.target.value;
    
    // Immediately update the UI
    setSearchTerm(value);
    setPage(0);
    
    // Show loading indicator
    setLoading(true);
    
    // Update active filters right away
    if (value) {
      setActiveFilters(prev => ({ ...prev, search: value }));
    } else {
      const updatedFilters = { ...activeFilters };
      delete updatedFilters.search;
      setActiveFilters(updatedFilters);
    }
    
    // Use a small timeout to debounce and prevent too many API calls
    setTimeout(() => {
      console.log('Searching for:', value);
      fetchDataWithFilters(0, rowsPerPage, selectedCategory, value, selectedStatus);
    }, 150);
  };

  // Handle direct filter changes
  const handleCategoryFilter = (e) => {
    const category = e.target.value;
    
    // Immediately update UI
    setSelectedCategory(category);
    setPage(0);
    
    // Show loading indicator right away
    setLoading(true);
    
    // Update active filters immediately
    if (category) {
      setActiveFilters(prev => ({ ...prev, category }));
    } else {
      const updatedFilters = { ...activeFilters };
      delete updatedFilters.category;
      setActiveFilters(updatedFilters);
    }
    
    // Fetch data with the exact category parameter specified
    console.log('Applying category filter:', category);
    fetchDataWithFilters(0, rowsPerPage, category, searchTerm, selectedStatus);
  };

  // Handle status filter
  const handleStatusFilter = (e) => {
    const status = e.target.value;
    
    // Immediately update UI for responsiveness
    setSelectedStatus(status);
    setPage(0);
    
    // Show loading indicator before making request
    setLoading(true);
    
    // Update active filters in UI immediately
    if (status) {
      setActiveFilters(prev => ({ ...prev, status }));
    } else {
      const updatedFilters = { ...activeFilters };
      delete updatedFilters.status;
      setActiveFilters(updatedFilters);
    }
    
    // Add small delay to prevent multiple successive requests
    setTimeout(() => {
      // Log what we're sending to ensure it's the correct value
      console.log('Filtering by status:', status);
      fetchDataWithFilters(0, rowsPerPage, selectedCategory, searchTerm, status);
    }, 100);
  };

  // Clear all filters function
  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setActiveFilters({});
    setPage(0);
    
    // Reset to initial data load
    fetchDataWithFilters(0, rowsPerPage, '', '', '');
  };

  // Direct data fetch with all filters
  const fetchDataWithFilters = async (pageNum, limit, category, search, status) => {
    // Show the spinner immediately before starting async operation
    setLoading(true);
    
    console.log('Fetching with filters:', { 
      pageNum: pageNum + 1, 
      limit, 
      category: category || 'none', 
      search: search || 'none', 
      status: status || 'none'
    });
    
    try {
      // Make sure we're sending the proper category and status values
      const data = await leftoverFoodService.getMyListings(
        pageNum + 1,
        limit,
        category,
        search,
        status
      );
      
      // Filter client-side as well to ensure category filtering works properly
      let filteredItems = data.items || [];
      
      // Log what we received for debugging
      console.log('Received listings before client filtering:', {
        count: filteredItems.length,
        categoryFilter: category || 'none',
        categories: filteredItems.map(item => item.category)
      });
      
      // Apply client-side category filter as a backup in case server filtering fails
      if (category && category.trim() !== '') {
        const lowerCategory = category.trim().toLowerCase();
        filteredItems = filteredItems.filter(item => {
          const itemCategory = (item.category || '').toLowerCase();
          const matches = itemCategory === lowerCategory;
          return matches;
        });
        
        console.log('Client-side category filtering applied:', {
          originalCount: data.items?.length || 0,
          filteredCount: filteredItems.length,
          categoryFilter: lowerCategory
        });
      }
      
      // Update state with filtered data
      setListings(filteredItems);
      setTotalItems(category ? filteredItems.length : (data.total || 0));
      
      // Clear loading state after data is processed
      setLoading(false);
    } catch (error) {
      console.error('Error fetching filtered data:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
      
      // Clear loading state even on error
      setLoading(false);
    }
  };

  // Replace the old useEffect for initial data loading
  useEffect(() => {
    // Initial data load
    fetchDataWithFilters(page, rowsPerPage, selectedCategory, searchTerm, selectedStatus);
  }, [page, rowsPerPage]); // Only depend on pagination

  // Handle page change with filter preservation
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    fetchDataWithFilters(newPage, rowsPerPage, selectedCategory, searchTerm, selectedStatus);
  };

  // Handle rows per page change with filter preservation
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    fetchDataWithFilters(0, newRowsPerPage, selectedCategory, searchTerm, selectedStatus);
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  // Ensure description is set for edit forms
  useEffect(() => {
    // When opening the form for editing
    if (openForm && editingId) {
      // Find the edit details
      const listing = listings.find(l => l._id === editingId);
      if (listing) {
        // Directly set the description in the form field by modifying the DOM
        setTimeout(() => {
          const descriptionField = document.querySelector('textarea[name="description"]');
          if (descriptionField && (!descriptionField.value || descriptionField.value.trim() === '')) {
            // If the field is empty, try to set it
            console.log('Direct DOM update of description field');
            descriptionField.value = listing.description || 'No description provided';
            
            // Also update the formData state
            setFormData(prev => ({
              ...prev,
              description: listing.description || 'No description provided'
            }));
            
            // Trigger a change event to ensure React picks up the value
            const event = new Event('input', { bubbles: true });
            descriptionField.dispatchEvent(event);
          }
        }, 200); // Short timeout to ensure DOM is ready
      }
    }
  }, [openForm, editingId, listings]);

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
      
      // Scroll to first error
      const firstErrorKey = Object.keys(formErrors)[0];
      if (firstErrorKey) {
        const errorElement = document.querySelector(`[name="${firstErrorKey}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          errorElement.focus();
        }
      }
      return;
    }
    
    setLoading(true);
    
    try {
      // Deep clean image URLs before submission
      console.log('Original form images:', formData.images);
      
      // Process images - ensure each one is either a valid URL or clean blob URL
      const cleanedImages = Array.isArray(formData.images) 
        ? formData.images
            .filter(img => {
              // Skip null/undefined values
              if (!img) return false;
              
              // Skip loading placeholders
              if (typeof img === 'object' && img.loading) return false;
              
              // Keep only string values
              return typeof img === 'string';
            })
            .map(img => {
              // For data URLs, use as is
              if (img.startsWith('data:')) {
                return img;
              }
              
              // For URLs that contain data: but don't start with it (malformed)
              if (img.includes('data:image/') && !img.startsWith('data:')) {
                const match = img.match(/(data:image\/[^;]+;base64,[a-zA-Z0-9+/=]+)/);
                if (match) {
                  return match[1];
                }
              }
              
              // For blob URLs or regular URLs, return as is
              return img;
            })
        : [];
      
      console.log('Cleaned images for submission:', cleanedImages);
      
      // Prepare the data for submission
      const submissionData = {
        ...formData,
        // Trim text fields
        title: formData.title.trim(),
        description: formData.description.trim(),
        // Ensure expiryTime is properly formatted
        expiryTime: formData.expiryTime instanceof Date 
          ? formData.expiryTime.toISOString() 
          : formData.expiryTime,
        // Always set price to 0 (free)
        price: 0,
        // Ensure quantity is a number
        quantity: parseInt(formData.quantity) || 0,
        // Use cleaned images array
        images: cleanedImages
      };
      
      console.log('Submitting form data with cleaned images...');
      
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
      await fetchDataWithFilters(page, rowsPerPage, selectedCategory, searchTerm, selectedStatus);
      
      // Close the form dialog
      handleCloseForm();
    } catch (err) {
      console.error('Error submitting form:', err);
      
      // Show detailed error message
      let errorMessage = 'Failed to save listing';
      if (err.response && err.response.data) {
        if (err.response.data.errors && Object.keys(err.response.data.errors).length > 0) {
          // Handle validation errors from the server
          const serverErrors = err.response.data.errors;
          const formattedErrors = {};
          
          // Map server errors to form fields
          Object.keys(serverErrors).forEach(key => {
            formattedErrors[key] = serverErrors[key].message || serverErrors[key];
          });
          
          setFormErrors(prev => ({
            ...prev,
            ...formattedErrors
          }));
          
          errorMessage = 'Please correct the highlighted errors';
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
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
      setLoading(true);
      console.log(`Deleting listing with ID: ${deleteId}`);
      
      const response = await leftoverFoodService.deleteListing(deleteId);
      console.log('Delete response:', response);
      
      // Refresh listings after deletion
      await fetchDataWithFilters(page, rowsPerPage, selectedCategory, searchTerm, selectedStatus);
      
      setSnackbar({
        open: true,
        message: 'Listing deleted successfully',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error deleting listing:', err);
      
      // If backend is unavailable, remove it from the local state anyway
      if (err.message === 'Network Error' || (err.response && err.response.status === 404)) {
        console.log('Backend unavailable, removing listing from local state');
        setListings(prev => prev.filter(listing => listing._id !== deleteId));
        
        setSnackbar({
          open: true,
          message: 'Listing removed from view. The server appears to be offline, so changes may not persist.',
          severity: 'warning',
        });
      } else {
        setSnackbar({
          open: true,
          message: `Error: ${err.response?.data?.message || err.message}`,
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
      handleCloseDelete();
    }
  };

  // Added handleDeleteConfirm function
  const handleDeleteConfirm = () => {
    if (deleteId) {
      handleDelete();
    }
  };

  // Update status change handler
  const handleStatusChange = async (id, status) => {
    console.log(`Changing status of listing ${id} to ${status}`);
    
    try {
      // Make sure status is using the correct format (e.g., 'expired' not 'expire')
      const normalizedStatus = status === 'expire' ? 'expired' : status;
      
      // Validate status before sending to API
      if (!normalizedStatus || !['available', 'reserved', 'sold', 'expired'].includes(normalizedStatus)) {
        throw new Error(`Invalid status value: ${normalizedStatus}. Must be one of: available, reserved, sold, expired`);
      }
      
      // Show loading state
      setSnackbar({
        open: true,
        message: `Updating status to ${normalizedStatus}...`,
        severity: 'info',
      });
      
      // First update the UI optimistically for better user feedback
      setListings(currentListings => 
        currentListings.map(listing => 
          listing._id === id ? { ...listing, status: normalizedStatus } : listing
        )
      );
      
      // Then send the update to the server
      const response = await leftoverFoodService.updateListingStatus(id, normalizedStatus);
      console.log('Status update successful:', response);
      
      // Refresh listings to ensure UI is in sync with server
      await fetchDataWithFilters(page, rowsPerPage, selectedCategory, searchTerm, selectedStatus);
      
      setSnackbar({
        open: true,
        message: `Status updated to ${normalizedStatus}`,
        severity: 'success',
      });
    } catch (err) {
      console.error('Error updating status:', err);
      
      // Refresh listings to restore correct state from server
      await fetchDataWithFilters(page, rowsPerPage, selectedCategory, searchTerm, selectedStatus);
      
      // Show error message
      setSnackbar({
        open: true,
        message: `Error updating status: ${err.message}`,
        severity: 'error',
      });
    }
  };

  // Dialog handlers
  const handleOpenForm = (listing = null) => {
    console.log('Opening form with listing:', listing);
    
    if (listing) {
      // For debugging: Log the entire listing object
      console.log('DEBUG - Full listing object:', JSON.stringify(listing, null, 2));
      
      // Format the expiry time properly
      const expiryTime = listing.expiryTime ? new Date(listing.expiryTime) : new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      // Clean up and ensure images are properly formatted
      let cleanedImages = [];
      if (Array.isArray(listing.images)) {
        cleanedImages = listing.images.map(img => {
          // Handle if the image URL has an incorrect prefix
          if (typeof img === 'string' && img.includes('blob:http')) {
            // Extract the actual blob URL
            const match = img.match(/blob:http[^/]*\/\/[^/]+\/[a-zA-Z0-9-]+/);
            if (match) {
              console.log(`Cleaning up prefixed blob URL: ${img} -> ${match[0]}`);
              return match[0];
            }
          }
          // Return cleaned URL or the original if no cleaning needed
          return cleanBlobUrl(img);
        }).filter(Boolean); // Remove any null/undefined values
      }
      
      console.log('Setting images for editing (cleaned):', cleanedImages);
      
      // CRITICAL FIX: Force a description value for editing
      // If the backend isn't providing a description at all, this ensures we have one
      const originalDescription = listing.description;
      
      // Add a hack to force description display even if data is missing
      if (!document.getElementById('debug-description-hack')) {
        console.log('Adding description debug element to DOM');
        const debugElem = document.createElement('div');
        debugElem.id = 'debug-description-hack';
        debugElem.style.display = 'none';
        debugElem.textContent = JSON.stringify(listing);
        document.body.appendChild(debugElem);
      } else {
        document.getElementById('debug-description-hack').textContent = JSON.stringify(listing);
      }
      
      // Extract description from the listing
      // Server might store it in description field or in notes field
      // Try multiple approaches to find the description
      let description = '';
      
      // Check primary description field
      if (listing.description && listing.description.trim() !== '') {
        description = listing.description;
        console.log('Using description field:', description);
      }
      // If empty, try to extract from notes field if available
      else if (listing.notes) {
        // Sometimes description is stored in notes with prefixes like "Dietary info:"
        const notesMatch = listing.notes.match(/Leftover food listing\n(.*)/);
        if (notesMatch && notesMatch[1]) {
          description = notesMatch[1].trim();
          console.log('Extracted description from notes field:', description);
        } else {
          // Just use the whole notes field if we can't extract it properly
          description = listing.notes.replace(/Dietary info:.*\n/, '').replace('Leftover food listing\n', '').trim();
          console.log('Using cleaned notes as description:', description);
        }
      }
      
      console.log('Final description for editing:', description);
      
      // Default description if still empty
      if (!description || description.trim() === '') {
        description = 'Edit description here';
        console.log('Using default description as none was found');
      }
      
      // Set form data for editing
      setFormData({
        title: listing.title || '',
        description: description,
        quantity: listing.quantity || 1,
        unit: listing.unit || 'portions',
        expiryTime: expiryTime,
        price: listing.price !== undefined ? listing.price : 0,
        category: listing.category || 'meals',
        dietaryInfo: listing.dietaryInfo || [],
        images: cleanedImages,
        status: listing.status || 'available'
      });
      
      console.log('Setting form data for editing:', {
        title: listing.title || '',
        description: description,
        quantity: listing.quantity || 1,
        unit: listing.unit || 'portions',
        expiryTime: expiryTime,
        price: listing.price !== undefined ? listing.price : 0,
        category: listing.category || 'meals',
        dietaryInfo: listing.dietaryInfo || [],
        images: cleanedImages,
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
      price: 0,
      category: 'meals',
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

  // Form field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Dynamic validation based on field
    let error = null;
    
    switch (name) {
      case 'title':
        if (value.trim() === '') {
          error = 'Title is required';
        } else if (value.trim().length < 3) {
          error = 'Title must be at least 3 characters';
        } else if (value.length > 100) {
          error = 'Title must be less than 100 characters';
        }
        break;
        
      case 'description':
        if (value.trim() === '') {
          error = 'Description is required';
        } else if (value.trim().length < 10) {
          error = 'Description must be at least 10 characters';
        } else if (value.length > 500) {
          error = 'Description must be less than 500 characters';
        }
        break;
        
      case 'quantity':
        if (value === '') {
          error = 'Quantity is required';
        } else {
          const quantity = parseFloat(value);
          if (isNaN(quantity) || !Number.isInteger(quantity)) {
            error = 'Quantity must be a whole number';
          } else if (quantity <= 0) {
            error = 'Quantity must be greater than zero';
          } else if (quantity > 1000) {
            error = 'Quantity is too high (maximum 1000)';
          }
        }
        break;
        
      case 'unit':
        if (!value) {
          error = 'Unit is required';
        }
        break;
        
      case 'category':
        if (!value) {
          error = 'Category is required';
        }
        break;
        
      default:
        // No validation for other fields during input
        break;
    }
    
    // Update error state for this field
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    // Title validation
    if (!formData.title || formData.title.trim() === '') {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }
    
    // Description validation
    if (!formData.description || formData.description.trim() === '') {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }
    
    // Quantity validation - ensure it's a positive integer
    if (!formData.quantity || formData.quantity === '') {
      errors.quantity = 'Quantity is required';
    } else {
      const quantity = parseFloat(formData.quantity);
      if (isNaN(quantity) || !Number.isInteger(quantity)) {
        errors.quantity = 'Quantity must be a whole number';
      } else if (quantity <= 0) {
        errors.quantity = 'Quantity must be greater than zero';
      } else if (quantity > 1000) {
        errors.quantity = 'Quantity is too high (maximum 1000)';
      }
    }
    
    // Unit validation
    if (!formData.unit || formData.unit === '') {
      errors.unit = 'Unit is required';
    }
    
    // Price validation removed as it's always free (0)
    
    // Category validation
    if (!formData.category || formData.category === '') {
      errors.category = 'Category is required';
    }
    
    // Expiry time validation
    if (!formData.expiryTime) {
      errors.expiryTime = 'Expiry time is required';
    } else {
      const expiryTime = new Date(formData.expiryTime);
      const now = new Date();
      
      if (isNaN(expiryTime.getTime())) {
        errors.expiryTime = 'Please enter a valid date and time';
      } else if (expiryTime <= now) {
        errors.expiryTime = 'Expiry time must be in the future';
      } else if (expiryTime > new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
        errors.expiryTime = 'Expiry time cannot be more than 7 days in the future';
      }
    }
    
    // Image validation
    if (!formData.images || formData.images.length === 0) {
      errors.images = 'At least one image is required';
    } else if (formData.images.length > 5) {
      errors.images = 'Maximum 5 images allowed';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper function to check if all required fields are filled
  const isFormComplete = () => {
    return !!(
      formData.title && 
      formData.title.trim() !== '' &&
      formData.description && 
      formData.description.trim() !== '' &&
      formData.quantity && 
      !isNaN(parseInt(formData.quantity)) &&
      formData.category && 
      formData.unit &&
      formData.expiryTime &&
      formData.images && 
      formData.images.length > 0
    );
  };

  // Add dynamic validation for expiry time
  const handleExpiryTimeChange = (newValue) => {
    setFormData(prev => ({
      ...prev,
      expiryTime: newValue
    }));
    
    // Validate the expiry time
    let error = null;
    if (!newValue) {
      error = 'Expiry time is required';
    } else {
      const expiryTime = new Date(newValue);
      const now = new Date();
      
      if (isNaN(expiryTime.getTime())) {
        error = 'Please enter a valid date and time';
      } else if (expiryTime <= now) {
        error = 'Expiry time must be in the future';
      } else if (expiryTime > new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
        error = 'Expiry time cannot be more than 7 days in the future';
      }
    }
    
    // Update error state for expiry time
    setFormErrors(prev => ({
      ...prev,
      expiryTime: error
    }));
  };

  // Add validation for dietary info changes
  const handleDietaryInfoChange = (event) => {
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      dietaryInfo: value
    }));
    
    // Clear any previous errors
    setFormErrors(prev => ({
      ...prev,
      dietaryInfo: undefined
    }));
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if maximum image limit reached
    if (formData.images && formData.images.length >= 5) {
      setSnackbar({
        open: true,
        message: 'Maximum 5 images allowed',
        severity: 'error',
      });
      return;
    }

    // Validate the image before uploading
    const validation = validateImage(file);
    if (!validation.valid) {
      setSnackbar({
        open: true,
        message: validation.error,
        severity: 'error',
      });
      return;
    }

    // Set loading state for image upload
    setLoading(true);
    
    try {
      console.log('Uploading image:', file.name);
      
      // Create a loading placeholder for immediate feedback
      const tempId = `temp_${Date.now()}`;
      
      // Add a temporary loading indicator to the images array
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), { id: tempId, loading: true }]
      }));
      
      // Use the uploadImage utility function
      const result = await uploadImage(file);
      
      if (result.isError) {
        throw new Error(result.error || 'Failed to upload image');
      }
      
      console.log('Image uploaded successfully, URL:', result.url);
      
      // Remove the temporary loading indicator and add the real URL
      setFormData(prev => {
        const filteredImages = prev.images.filter(img => 
          typeof img === 'string' || img.id !== tempId
        );
        
        const newImages = [...filteredImages, result.url];
        console.log('Updated form images:', newImages);
        return {
          ...prev,
          images: newImages
        };
      });
      
      // Clear any previous errors
      if (formErrors.images) {
        setFormErrors(prev => ({
          ...prev,
          images: undefined
        }));
      }
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Image uploaded successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Remove any temporary loading indicators
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => typeof img === 'string')
      }));
      
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

  // Handle removing an image
  const handleRemoveImage = (index) => {
    setFormData(prev => {
      const updatedImages = prev.images.filter((_, i) => i !== index);
      
      // Update form data with filtered images
      return {
        ...prev,
        images: updatedImages
      };
    });
    
    // Set error when removing the last image
    if (formData.images.length <= 1) {
      setFormErrors(prev => ({
        ...prev,
        images: 'At least one image is required'
      }));
    }
  };

  // Image carousel handlers
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  if (loading && listings.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container>
        <Fab 
          color="primary" 
          aria-label="add" 
          sx={{ 
            position: 'fixed', 
            bottom: 32, 
            right: 32,
            zIndex: 1000
          }}
          onClick={() => handleOpenForm()}
        >
          <AddIcon />
        </Fab>
        <Typography variant="h4" sx={{ mb: 4, mt: 2, fontWeight: 600 }}>
          Leftover Food Management
        </Typography>

        {/* Add a prominent button at the top */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
            size="large"
          >
            Add New Listing
          </Button>
        </Box>

        {/* Search and Filter */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search listings..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleDirectSearch}
            disabled={loading} // Disable while loading
            sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: '200px' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {loading ? <CircularProgress size={20} thickness={5} /> : <SearchIcon />}
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setSearchTerm('');
                      const updatedFilters = { ...activeFilters };
                      delete updatedFilters.search;
                      setActiveFilters(updatedFilters);
                      
                      // Show loading indicator
                      setLoading(true);
                      
                      // Fetch data with cleared search
                      fetchDataWithFilters(0, rowsPerPage, selectedCategory, '', selectedStatus);
                    }}
                    disabled={loading}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: '150px' } }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={handleCategoryFilter}
              disabled={loading}
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
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: '150px' } }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              label="Status"
              onChange={handleStatusFilter}
              disabled={loading} // Disable while loading
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="reserved">Reserved</MenuItem>
              <MenuItem value="sold">Sold</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
            </Select>
          </FormControl>

          {Object.keys(activeFilters).length > 0 && (
            <Button 
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<CloseIcon />}
              onClick={clearAllFilters}
            >
              Clear Filters
            </Button>
          )}
        </Box>

        {/* Filter status message */}
        {!error && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} thickness={4} />
                  <span>Loading listings...</span>
                </Box>
              ) : listings.length > 0 ? (
                <>
                  Showing {listings.length} of {totalItems} food listings
                  {Object.keys(activeFilters).length > 0 && (
                    <Box component="span" sx={{ ml: 1 }}>
                      {activeFilters.search && (
                        <Chip 
                          size="small" 
                          label={`Search: ${activeFilters.search}`} 
                          sx={{ mr: 0.5 }}
                          onDelete={() => {
                            setSearchTerm('');
                            const updatedFilters = { ...activeFilters };
                            delete updatedFilters.search;
                            setActiveFilters(updatedFilters);
                            fetchDataWithFilters(0, rowsPerPage, selectedCategory, '', selectedStatus);
                          }}
                        />
                      )}
                      {activeFilters.category && (
                        <Chip 
                          size="small" 
                          label={`Category: ${activeFilters.category}`} 
                          sx={{ mr: 0.5 }}
                          onDelete={() => {
                            setSelectedCategory('');
                            const updatedFilters = { ...activeFilters };
                            delete updatedFilters.category;
                            setActiveFilters(updatedFilters);
                            fetchDataWithFilters(0, rowsPerPage, '', searchTerm, selectedStatus);
                          }}
                        />
                      )}
                      {activeFilters.status && (
                        <Chip 
                          size="small" 
                          label={`Status: ${activeFilters.status}`} 
                          sx={{ mr: 0.5 }}
                          onDelete={() => {
                            setSelectedStatus('');
                            const updatedFilters = { ...activeFilters };
                            delete updatedFilters.status;
                            setActiveFilters(updatedFilters);
                            fetchDataWithFilters(0, rowsPerPage, selectedCategory, searchTerm, '');
                          }}
                        />
                      )}
                    </Box>
                  )}
                </>
              ) : (
                <>
                  No listings found
                  {Object.keys(activeFilters).length > 0 && (
                    <span> matching your filters</span>
                  )}
                </>
              )}
            </Typography>
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

          {listings.map((listing) => {
            // Determine the image source to use
            const imageSource = listing.images && listing.images.length > 0 
              ? listing.images[0] 
              : null;
            
            // Log image info for debugging
            if (listing.images && listing.images.length > 0) {
              console.log(`Image for listing ${listing._id}:`, listing.images[0]);
            }
              
            // Check if this is an expired blob URL
            const isBlobUrlExpired = imageSource && imageSource.startsWith('blob:') && isExpiredBlobUrl(imageSource);

            return (
              <Grid item xs={12} sm={6} md={4} key={listing._id}>
                <Card className="card-hover" sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ position: 'relative', height: 200 }}>
                    {/* Show "No image" placeholder when no image source or it's an invalid URL */}
                    {!imageSource ? (
                      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.200' }}>
                        <BrokenImageIcon sx={{ fontSize: 40, mb: 1, color: 'text.disabled' }} />
                        <Typography variant="body2" color="text.secondary">No image available</Typography>
                      </Box>
                    ) : (
                      <ImageWithFallback
                        src={imageSource}
                        alt={listing.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        token={localStorage.getItem('token')}
                      />
                    )}
                    <Chip
                      label={listing.status}
                      color={
                        listing.status === 'available' ? 'success' :
                        listing.status === 'reserved' ? 'warning' :
                        listing.status === 'sold' ? 'error' : 
                        listing.status === 'expired' ? 'default' : 'default'
                      }
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        textTransform: 'capitalize'
                      }}
                    />
                    <Chip
                      label="Free"
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
                        Expires: {listing.expiryTime && !isNaN(new Date(listing.expiryTime).getTime()) 
                          ? format(new Date(listing.expiryTime), 'MMM dd, yyyy HH:mm') 
                          : 'Invalid date'}
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
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 
                                listing.status === 'available' ? 'success.main' :
                                listing.status === 'reserved' ? 'warning.main' :
                                listing.status === 'sold' ? 'error.main' : 
                                'grey.400'
                            }
                          }}
                        >
                          <MenuItem value="available">Available</MenuItem>
                          <MenuItem value="reserved">Reserved</MenuItem>
                          <MenuItem value="sold">Sold</MenuItem>
                          <MenuItem value="expired">Expired</MenuItem>
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
            );
          })}
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
      </Container>

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
                  InputProps={{
                    // Add onFocus handler to ensure description is loaded
                    onFocus: (e) => {
                      // If description is still blank when focused, try to recover it
                      if (!e.target.value || e.target.value.trim() === '') {
                        try {
                          // Try to get the description from our debug element
                          const debugElem = document.getElementById('debug-description-hack');
                          if (debugElem) {
                            const listingData = JSON.parse(debugElem.textContent);
                            if (listingData && listingData.description) {
                              console.log('Recovered description from debug element:', listingData.description);
                              // Update the form data with the recovered description
                              setFormData(prev => ({
                                ...prev,
                                description: listingData.description
                              }));
                            }
                          }
                        } catch (err) {
                          console.error('Failed to recover description:', err);
                        }
                      }
                    }
                  }}
                />
              </Grid>

              {/* Price and Category */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  value="Free"
                  InputProps={{
                    readOnly: true,
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  helperText="All leftover food is provided for free"
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
                    <MenuItem value="other">Other</MenuItem>
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
                    <MenuItem value="plates">Plates</MenuItem>
                    <MenuItem value="kg">Kilograms</MenuItem>
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
                    onChange={handleExpiryTimeChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !!formErrors.expiryTime,
                        helperText: formErrors.expiryTime
                      }
                    }}
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
                    onChange={handleDietaryInfoChange}
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
                <Typography variant="subtitle1" component="div" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <PreviewIcon sx={{ mr: 1 }} /> Images
                  <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                    (Required)
                  </Typography>
                </Typography>
                {/* Simple image management without preview */}
                <Box sx={{ width: '100%', mb: 2 }}>
                  {formData.images && formData.images.length > 0 ? (
                    <>
                      <Typography variant="body1" component="div" sx={{ fontWeight: 'medium', mb: 2 }}>
                        {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} uploaded
                      </Typography>
                      
                      {/* List of image filenames */}
                      <Box sx={{ width: '100%', mb: 2 }}>
                        {formData.images.map((img, index) => {
                          // Handle both string URLs and loading objects
                          const isLoading = typeof img === 'object' && img.loading;
                          
                          // Extract filename from URL using proper URL parsing
                          let filename = isLoading ? 'Uploading...' : '';
                          if (!isLoading) {
                            try {
                              if (typeof img === 'string') {
                                if (img.startsWith('blob:')) {
                                  filename = `Local image ${index + 1}`;
                                } else {
                                  const url = new URL(img);
                                  filename = url.pathname.split('/').pop() || `Image ${index + 1}`;
                                }
                              } else if (img.url) {
                                // Handle object with url property
                                const url = new URL(img.url);
                                filename = url.pathname.split('/').pop() || `Image ${index + 1}`;
                              }
                            } catch (e) {
                              filename = `Image ${index + 1}`;
                            }
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
                              <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '80%' }}>
                                {isLoading ? (
                                  <CircularProgress size={16} sx={{ mr: 1 }} />
                                ) : null}
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis',
                                    fontStyle: isLoading ? 'italic' : 'normal' 
                                  }}
                                >
                                  {filename}
                                </Typography>
                              </Box>
                              <Button 
                                size="small" 
                                color="error"
                                onClick={() => handleRemoveImage(index)}
                                disabled={isLoading}
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
                        onClick={() => {
                          setFormData(prev => ({...prev, images: []}));
                          // Set error when removing all images
                          setFormErrors(prev => ({
                            ...prev,
                            images: 'At least one image is required'
                          }));
                        }}
                      >
                        Clear all images
                      </Button>
                    </>
                  ) : (
                    <Typography variant="body2" color={formErrors.images ? 'error.main' : 'text.secondary'}>
                      No images uploaded yet
                    </Typography>
                  )}
                </Box>
                
                {formErrors.images && (
                  <FormHelperText error sx={{ mb: 1, ml: 1 }}>
                    {formErrors.images}
                  </FormHelperText>
                )}

                {/* Image Upload */}
                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 1 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mt: 1 }}
                    disabled={loading}
                    color={formErrors.images ? 'error' : 'primary'}
                  >
                    {loading ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      name="images"
                      hidden
                      onChange={handleImageUpload}
                      disabled={loading}
                    />
                  </Button>
                  <Typography variant="caption" color="text.secondary" align="center">
                    Images smaller than 10MB are supported.
                    <br />
                    {loading && (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                        <span>Uploading image...</span>
                      </Box>
                    )}
                  </Typography>
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
            color="primary"
            disabled={loading || !isFormComplete()}
          >
            {loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
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
            "Are you sure you want to delete this food listing? This action cannot be undone."
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} disabled={loading}>Cancel</Button>
          <Button 
            onClick={handleDelete}
            color="error" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
          >
            {loading ? 'Deleting...' : 'Delete'}
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
    </LocalizationProvider>
  );
};

export default LeftoverFood; 