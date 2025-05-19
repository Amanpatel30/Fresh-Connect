import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Container,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  OutlinedInput,
  FormHelperText,
  Card,
  CardContent,
  Chip,
  DialogContentText,
  Skeleton,
  IconButton,
  Slider,
  Menu,
  Tooltip,
  Fade,
  Divider,
  useTheme,
  useMediaQuery,
  Badge
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { PhotoCamera } from '@mui/icons-material';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import { getMyUrgentSales, createUrgentSale, updateUrgentSaleWithProductHandling, hardDeleteUrgentSale, createUrgentSaleWithProductHandling, getMyUrgentSalesDirectDB, createUrgentSaleWithLocalFallback } from '../../services/api.jsx';
import { validateImage } from '../../lib/imageUpload.jsx';

// Create base64 data URI placeholders instead of relying on external services
const PLACEHOLDER_IMAGES = {
  DEFAULT: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMzAwIDIwMCI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlOWVjZWYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNmM3NTdkIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=',
  ERROR: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMzAwIDIwMCI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmOGQ3ZGEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNzIxYzI0Ij5JbWFnZSBFcnJvcjwvdGV4dD48L3N2Zz4=',
  INVALID: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMzAwIDIwMCI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmZmYzY2QiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjODU2NDA0Ij5JbnZhbGlkIEltYWdlPC90ZXh0Pjwvc3ZnPg==',
  VEGETABLES: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMzAwIDIwMCI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNkNGVkZGEiLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxMDAiIHI9IjUwIiBmaWxsPSIjMjhhNzQ1Ii8+PHRleHQgeD0iNTAlIiB5PSIxNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMxNTVkMjciPkZyZXNoIFZlZ2V0YWJsZXM8L3RleHQ+PC9zdmc+',
  DESSERT: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMzAwIDIwMCI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmOGVhZjkiLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxMDAiIHI9IjUwIiBmaWxsPSIjZDYzMzg0Ii8+PHRleHQgeD0iNTAlIiB5PSIxNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM3MjFjNDIiPkRlc3NlcnQgU3BlY2lhbDwvdGV4dD48L3N2Zz4='
};

// Helper function to validate and fix image URLs
const validateAndFixImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return PLACEHOLDER_IMAGES.DEFAULT;
  }
  
  // Check for valid image format
  if (typeof imageUrl === 'string') {
    // Is a valid data URL
    if (imageUrl.startsWith('data:image/') && imageUrl.includes(';base64,')) {
      // Attempt to validate the base64 part
      const base64Match = imageUrl.match(/;base64,([a-zA-Z0-9+/=]+)$/);
      if (!base64Match || !base64Match[1] || base64Match[1].length % 4 !== 0) {
        console.warn('Invalid base64 format detected, using placeholder');
        return PLACEHOLDER_IMAGES.INVALID;
      }
      
      // If base64 content is too short or suspiciously long, it's likely invalid
      if (base64Match[1].length < 100 || base64Match[1].length > 1500100) {
        console.warn('Suspicious base64 data length, using placeholder');
        return PLACEHOLDER_IMAGES.INVALID;
      }
      
      return imageUrl;
    }
    
    // Is a valid URL - we want to prioritize these over placeholders
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // Check if it's one of our previously used placeholder URLs that might be failing
      if (imageUrl.includes('placeholder.com')) {
        if (imageUrl.includes('Fresh+Vegetables')) {
          return PLACEHOLDER_IMAGES.VEGETABLES;
        } else if (imageUrl.includes('Dessert+Special')) {
          return PLACEHOLDER_IMAGES.DESSERT;
        } else {
          return PLACEHOLDER_IMAGES.DEFAULT;
        }
      }
      
      // This is a real image URL - keep it as is
      return imageUrl;
    }
    
    // Extract data URL from malformed URLs (like http://https://fresh-connect-backend.onrender.com/data:image/...)
    if (imageUrl.includes('data:image/')) {
      const match = imageUrl.match(/(data:image\/[^;]+;base64,[a-zA-Z0-9+/=]+)/);
      if (match) {
        return match[1];
      }
    }
    
    // If it's a server-relative path, convert it to absolute URL
    if (imageUrl.startsWith('/')) {
      return `${import.meta.env.VITE_API_URL || 'http://https://fresh-connect-backend.onrender.com'}${imageUrl}`;
    }
  }
  
  // If we get here, the image format is invalid, use a placeholder
  return PLACEHOLDER_IMAGES.INVALID;
};

// Image component with enhanced fallback for error handling
const ImageWithFallback = ({ src, alt, style, ...props }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  
  // Use a validated src
  const processedSrc = useMemo(() => {
    // Force placeholder for empty or null src
    if (!src) return PLACEHOLDER_IMAGES.DEFAULT;
    
    try {
      return validateAndFixImageUrl(src);
    } catch (err) {
      console.error("Image processing error:", err);
      return PLACEHOLDER_IMAGES.ERROR;
    }
  }, [src]);

  useEffect(() => {
    // Reset state when src changes
    setLoading(true);
    setError(false);
    setRetryCount(0);
    
    // Skip loading state for data URLs or placeholders to improve performance
    if (processedSrc.startsWith('data:image/')) {
      setLoading(false);
    }
  }, [processedSrc]);

  // Preload image to check validity
  useEffect(() => {
    if (!processedSrc) return;
    
    // Skip preload for data URLs
    if (processedSrc.startsWith('data:image/')) return;
    
    const img = new Image();
    
    img.onload = () => {
      setLoading(false);
      setError(false);
    };
    
    img.onerror = () => {
      console.error('Image preload failed:', processedSrc);
      
      // Use fallback based on image content
      if (processedSrc.includes('vegetables') || processedSrc.includes('Vegetables')) {
        setError(false);
        img.src = PLACEHOLDER_IMAGES.VEGETABLES;
      } else if (processedSrc.includes('dessert') || processedSrc.includes('Dessert')) {
        setError(false);
        img.src = PLACEHOLDER_IMAGES.DESSERT;
      } else {
        setError(true);
        setLoading(false);
      }
    };
    
    img.src = processedSrc;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [processedSrc]);

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
            width: '100%',
            height: '100%',
            ...style
          }}
          onError={(e) => {
            console.error('Image failed to load:', processedSrc);
            
            // Try to infer what type of image this is
            let fallbackImage = PLACEHOLDER_IMAGES.ERROR;
            
            if (retryCount < 2) {
              setRetryCount(prev => prev + 1);
              
              // Choose specific fallback based on context
              if (alt?.toLowerCase().includes('vegetable') || 
                  processedSrc.toLowerCase().includes('vegetable')) {
                fallbackImage = PLACEHOLDER_IMAGES.VEGETABLES;
              } else if (alt?.toLowerCase().includes('dessert') || 
                         processedSrc.toLowerCase().includes('dessert')) {
                fallbackImage = PLACEHOLDER_IMAGES.DESSERT;
              }
              
              // Apply the fallback
              e.target.onerror = null; // Prevent infinite loop
              e.target.src = fallbackImage;
              setTimeout(() => setError(false), 50); // Clear error state to show the image
            } else {
              // After multiple retries, show the error state
              setError(true);
              setLoading(false);
            }
          }}
          onLoad={() => {
            setLoading(false);
            setError(false);
          }}
          {...props}
        />
      )}
    </Box>
  );
};

// Fix for the sort button functionality - add a sort menu component
const SortMenu = ({ anchorEl, open, handleClose, sortConfig, handleSortChange }) => {
  const sortOptions = [
    { field: 'updatedAt', label: 'Last Updated' },
    { field: 'createdAt', label: 'Date Created' },
    { field: 'name', label: 'Name' },
    { field: 'expiryDate', label: 'Expiry Date' },
    { field: 'originalPrice', label: 'Original Price' },
    { field: 'discountedPrice', label: 'Discounted Price' },
    { field: 'stock', label: 'Stock' }
  ];

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle2" fontWeight="bold">Sort By</Typography>
      </Box>
      <Divider />
      {sortOptions.map((option) => (
        <MenuItem 
          key={option.field} 
          onClick={() => handleSortChange(option.field)}
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            bgcolor: sortConfig.field === option.field ? 'action.selected' : 'transparent'
          }}
        >
          <Typography variant="body2">{option.label}</Typography>
          {sortConfig.field === option.field && (
            sortConfig.direction === 'asc' 
              ? <ArrowUpwardIcon fontSize="small" color="primary" /> 
              : <ArrowDownwardIcon fontSize="small" color="primary" />
          )}
        </MenuItem>
      ))}
    </Menu>
  );
};

// Main component for Urgent Sales
const UrgentSales = () => {
  // State for data
  const [sales, setSales] = useState(() => {
    // Try to get stored sales from localStorage
    const storedSales = localStorage.getItem('urgentSales');
    if (storedSales) {
      try {
        return JSON.parse(storedSales);
      } catch (e) {
        console.error('Failed to parse stored sales:', e);
      }
    }
    return [];
  });

  // Update localStorage whenever sales change
  useEffect(() => {
    try {
      localStorage.setItem('urgentSales', JSON.stringify(sales));
    } catch (error) {
      console.error('Failed to store sales in localStorage:', error);
    }
  }, [sales]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [dialogLoading, setDialogLoading] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    id: null,
    loading: false
  });
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Vegetables',
    originalPrice: '',
    discountedPrice: '',
    stock: '',
    unit: 'kg',
    expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    image: '',
    isActive: true
  });

  // Form validation
  const [formErrors, setFormErrors] = useState({});

  // Additional form state
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Filter and sort state
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    priceRange: [0, 1000],
    expiryDateRange: {
      start: '',
      end: ''
    },
    status: 'all'
  });
  
  const [sortConfig, setSortConfig] = useState({
    field: 'updatedAt',
    direction: 'desc'
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000);

  // Add state for sort menu
  const [sortMenuAnchorEl, setSortMenuAnchorEl] = useState(null);
  const sortMenuOpen = Boolean(sortMenuAnchorEl);
  
  // Use theme for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Handle input changes with enhanced validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Perform dynamic validation based on field
    validateFieldDynamic(name, value);
  };
  
  // Enhanced dynamic validation
  const validateFieldDynamic = (name, value, otherValues = {}) => {
    let error = '';
    const allValues = { ...formData, ...otherValues, [name]: value };
    
    switch (name) {
      case 'name':
        if (!value || value.trim() === '') {
          error = 'Name is required';
        } else if (value.trim().length < 3) {
          error = 'Name must be at least 3 characters';
        } else if (value.trim().length > 50) {
          error = 'Name must be less than 50 characters';
        }
        break;
        
      case 'description':
        if (!value || value.trim() === '') {
          error = 'Description is required';
        } else if (value.trim().length < 10) {
          error = 'Description must be at least 10 characters';
        } else if (value.trim().length > 500) {
          error = 'Description must be less than 500 characters';
        }
        break;
        
      case 'originalPrice':
        if (!value) {
          error = 'Original price is required';
        } else if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
          error = 'Original price must be a positive number';
        } else if (parseFloat(value) > 100000) {
          error = 'Price seems too high';
        }
        
        // Also validate discounted price if it exists
        if (allValues.discountedPrice && parseFloat(value) <= parseFloat(allValues.discountedPrice)) {
          setFormErrors(prev => ({
            ...prev,
            discountedPrice: 'Discounted price must be less than original price'
          }));
        } else {
          setFormErrors(prev => ({
            ...prev,
            discountedPrice: undefined
          }));
        }
        break;
        
      case 'discountedPrice':
        if (!value) {
          error = 'Discounted price is required';
        } else if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
          error = 'Discounted price must be a positive number';
        } else if (allValues.originalPrice && parseFloat(value) >= parseFloat(allValues.originalPrice)) {
          error = 'Discounted price must be less than original price';
        } else if (allValues.originalPrice) {
          // Validate discount percentage limits
          const discountPercent = ((parseFloat(allValues.originalPrice) - parseFloat(value)) / parseFloat(allValues.originalPrice)) * 100;
          if (discountPercent < 5) {
            error = 'Discount should be at least 5%';
          } else if (discountPercent > 90) {
            error = 'Discount cannot exceed 90%';
          }
        }
        break;
        
      case 'stock':
        if (!value) {
          error = 'Stock is required';
        } else if (!/^\d+$/.test(value)) {
          error = 'Stock must be a whole number';
        } else if (parseInt(value) <= 0) {
          error = 'Stock must be a positive number';
        } else if (parseInt(value) > 10000) {
          error = 'Stock value seems too high';
        }
        break;
        
      case 'expiryDate':
        if (!value) {
          error = 'Expiry date is required';
        } else {
          const expiryDate = new Date(value);
          const now = new Date();
          const maxDate = new Date();
          maxDate.setFullYear(maxDate.getFullYear() + 1); // Max 1 year in future
          
          if (expiryDate <= now) {
            error = 'Expiry date must be in the future';
          } else if (expiryDate > maxDate) {
            error = 'Expiry date cannot be more than 1 year in the future';
          } else {
            // Check if expiry is very soon (less than 24 hours)
            const hoursDifference = (expiryDate - now) / (1000 * 60 * 60);
            if (hoursDifference < 24) {
              error = 'Warning: Product expires in less than 24 hours';
            }
          }
        }
        break;
        
      default:
        break;
    }
    
    // Update form errors
    setFormErrors(prev => ({
      ...prev,
      [name]: error || undefined
    }));
    
    return !error;
  };

  // Calculate and display discount percentage
  const calculateDiscountPercentage = () => {
    if (!formData.originalPrice || !formData.discountedPrice) return null;
    
    const originalPrice = parseFloat(formData.originalPrice);
    const discountedPrice = parseFloat(formData.discountedPrice);
    
    if (isNaN(originalPrice) || isNaN(discountedPrice) || originalPrice <= 0) return null;
    
    const percentage = ((originalPrice - discountedPrice) / originalPrice) * 100;
    return percentage.toFixed(0);
  };
  
  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      priceRange: [0, maxPrice],
      expiryDateRange: {
        start: '',
        end: ''
      },
      status: 'all'
    });
  };
  
  // Handle sort change
  const handleSortChange = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Filter and sort sales
  const filteredAndSortedSales = useMemo(() => {
    // First, filter sales
    let result = [...sales];
    
    // Apply text search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(sale => 
        sale.name.toLowerCase().includes(searchLower) || 
        sale.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply category filter
    if (filters.category !== 'all') {
      result = result.filter(sale => sale.category === filters.category);
    }
    
    // Apply price range filter
    if (filters.priceRange) {
      result = result.filter(sale => 
        sale.discountedPrice >= filters.priceRange[0] && 
        sale.discountedPrice <= filters.priceRange[1]
      );
    }
    
    // Apply expiry date filter
    if (filters.expiryDateRange.start || filters.expiryDateRange.end) {
      result = result.filter(sale => {
        const expiryDate = new Date(sale.expiryDate);
        
        if (filters.expiryDateRange.start && filters.expiryDateRange.end) {
          const startDate = new Date(filters.expiryDateRange.start);
          const endDate = new Date(filters.expiryDateRange.end);
          return expiryDate >= startDate && expiryDate <= endDate;
        } else if (filters.expiryDateRange.start) {
          const startDate = new Date(filters.expiryDateRange.start);
          return expiryDate >= startDate;
        } else if (filters.expiryDateRange.end) {
          const endDate = new Date(filters.expiryDateRange.end);
          return expiryDate <= endDate;
        }
        
        return true;
      });
    }
    
    // Then sort the filtered results
    if (sortConfig.field) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.field];
        let bValue = b[sortConfig.field];
        
        // Handle date fields
        if (sortConfig.field === 'expiryDate' || sortConfig.field === 'createdAt' || sortConfig.field === 'updatedAt') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
        
        // Handle numeric fields
        if (sortConfig.field === 'originalPrice' || sortConfig.field === 'discountedPrice' || sortConfig.field === 'stock') {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [sales, filters, sortConfig]);
  
  // Find the maximum price for the range slider
  useEffect(() => {
    if (sales.length > 0) {
      const prices = sales.map(sale => parseFloat(sale.originalPrice)).filter(price => !isNaN(price));
      if (prices.length > 0) {
        const max = Math.ceil(Math.max(...prices) * 1.2); // Add 20% buffer
        setMaxPrice(max);
        setFilters(prev => ({
          ...prev,
          priceRange: [0, max]
        }));
      }
    }
  }, [sales]);

  // Image handling
  const handleImageSelect = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsUploading(true);
    
    try {
      // Validate the file
      const validation = validateImage(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      // Check file size before compression
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // Reduce to 5MB max
      if (file.size > MAX_FILE_SIZE) {
        console.warn(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum size. Applying aggressive compression...`);
      }
      
      // Get file type for better compression quality adjustments
      const fileType = file.type.toLowerCase();
      let compressionQuality = 0.7; // Lower default quality to reduce file size
      let maxDimension = 800; // Smaller max dimension
      
      // Adjust compression quality based on file type and size
      if (fileType.includes('png')) {
        compressionQuality = 0.8; // PNGs need higher quality for transparency
      } else if (file.size > 2 * 1024 * 1024) {
        // For larger files, use even more aggressive compression
        compressionQuality = 0.6;
        maxDimension = 600;
      }
      
      // Compress and resize the image
      const startTime = performance.now();
      const compressedImage = await compressImage(file, compressionQuality, maxDimension);
      const endTime = performance.now();
      
      console.log(`Image compressed in ${(endTime - startTime).toFixed(2)}ms`);
      
      // Check if the compressed image is below the max size for API
      const MAX_DATA_URI_LENGTH = 500100; // ~500KB for data URI
      
      let finalImage = compressedImage;
      
      if (compressedImage.length > MAX_DATA_URI_LENGTH) {
        console.warn(`Compressed image is still too large (${Math.round(compressedImage.length / 1024)}KB). Applying additional compression.`);
        
        // Create a temporary blob from the data URI for further compression
        const blob = await fetch(compressedImage).then(r => r.blob());
        
        // Try more aggressive compression
        finalImage = await compressImage(blob, 0.5, 500);
        console.log(`Image size after additional compression: ${Math.round(finalImage.length / 1024)}KB`);
      }
      
      // Calculate compression ratio
      const originalSizeKB = Math.round(file.size / 1024);
      const finalSizeKB = Math.round(finalImage.length / 1024);
      const compressionRatio = (finalSizeKB / originalSizeKB * 100).toFixed(2);
      
      console.log(`Image compressed: ${originalSizeKB}KB → ${finalSizeKB}KB (${compressionRatio}%)`);
      
      // Validate the final image format
      if (!finalImage.startsWith('data:image/')) {
        console.warn('Compressed image is not in data:image format, fixing...');
        // Force the correct MIME type prefix if it's missing
        if (finalImage.startsWith('data:')) {
          finalImage = finalImage.replace(/^data:/, 'data:image/jpeg;');
        } else if (finalImage.includes(';base64,')) {
          finalImage = 'data:image/jpeg;' + finalImage;
        } else {
          // If we can't fix it, use a placeholder
          finalImage = 'https://via.placeholder.com/300x200?text=Format+Error';
        }
      }
      
      // Final validation of the image
      finalImage = validateAndFixImageUrl(finalImage);
      
      // Set form data and preview
      setFormData(prev => ({ ...prev, image: finalImage }));
      setImagePreview(finalImage);
      
      // Clear any image error
      if (formErrors.image) {
        setFormErrors(prev => ({
          ...prev,
          image: undefined
        }));
      }
    } catch (error) {
      // Clear the file input
      e.target.value = '';
      
      const errorMessage = error.message || "Failed to process image";
      console.error("Image processing error:", errorMessage);
      
      setSnackbar({ 
        open: true, 
        message: `Error: ${errorMessage}`, 
        severity: "error" 
      });
      
      setFormErrors(prev => ({
        ...prev,
        image: errorMessage
      }));
    } finally {
      setIsUploading(false);
    }
  };

  // Validate a single field and update error state
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!value || !value.trim()) {
          error = 'Name is required';
        }
        break;
        
      case 'description':
        if (!value || !value.trim()) {
          error = 'Description is required';
        }
        break;
        
      case 'originalPrice':
        if (!value) {
          error = 'Original price is required';
        } else if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
          error = 'Original price must be a positive number';
        }
        
        // Also validate discounted price if it exists
        if (formData.discountedPrice && parseFloat(value) <= parseFloat(formData.discountedPrice)) {
          setFormErrors(prev => ({
            ...prev,
            discountedPrice: 'Discounted price must be less than original price'
          }));
        } else {
          setFormErrors(prev => ({
            ...prev,
            discountedPrice: undefined
          }));
        }
        break;
        
      case 'discountedPrice':
        if (!value) {
          error = 'Discounted price is required';
        } else if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
          error = 'Discounted price must be a positive number';
        } else if (formData.originalPrice && parseFloat(value) >= parseFloat(formData.originalPrice)) {
          error = 'Discounted price must be less than original price';
        }
        break;
        
      case 'stock':
        if (!value) {
          error = 'Stock is required';
        } else if (isNaN(parseInt(value)) || parseInt(value) <= 0) {
          error = 'Stock must be a positive number';
        }
        break;
        
      case 'expiryDate':
        if (!value) {
          error = 'Expiry date is required';
        } else {
          const expiryDate = new Date(value);
          const now = new Date();
          if (expiryDate <= now) {
            error = 'Expiry date must be in the future';
          }
        }
        break;
        
      default:
        break;
    }
    
    // Update form errors
    setFormErrors(prev => ({
      ...prev,
      [name]: error || undefined
    }));
    
    return !error;
  };
  
  // Complete form validation
  const validateForm = () => {
    const errors = {};
    
    // Validate name
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    // Validate description
    if (!formData.description || !formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    // Parse numbers for validation
    const originalPrice = parseFloat(formData.originalPrice);
    const discountedPrice = parseFloat(formData.discountedPrice);
    const stock = parseInt(formData.stock);
    
    // Validate original price
    if (!formData.originalPrice) {
      errors.originalPrice = 'Original price is required';
    } else if (isNaN(originalPrice) || originalPrice <= 0) {
      errors.originalPrice = 'Original price must be a positive number';
    }
    
    // Validate discounted price
    if (!formData.discountedPrice) {
      errors.discountedPrice = 'Discounted price is required';
    } else if (isNaN(discountedPrice) || discountedPrice <= 0) {
      errors.discountedPrice = 'Discounted price must be a positive number';
    } else if (discountedPrice >= originalPrice) {
      errors.discountedPrice = 'Discounted price must be less than original price';
    }
    
    // Validate stock
    if (!formData.stock) {
      errors.stock = 'Stock is required';
    } else if (isNaN(stock) || stock <= 0) {
      errors.stock = 'Stock must be a positive whole number';
    }
    
    // Validate expiry date
    if (!formData.expiryDate) {
      errors.expiryDate = 'Expiry date is required';
    } else {
      const expiryDate = new Date(formData.expiryDate);
      const now = new Date();
      if (expiryDate <= now) {
        errors.expiryDate = 'Expiry date must be in the future';
      }
    }
    
    // Validate image
    if (!formData.image && !imagePreview) {
      errors.image = 'Image is required';
    }
    
    // Update form errors
    setFormErrors(errors);
    
    // Return true if there are no errors
    return Object.keys(errors).length === 0;
  };

  // Form submission
  const handleSubmit = async () => {
    try {
      setDialogLoading(true);
    
      // Validate form
    if (!validateForm()) {
        setSnackbar({
        open: true,
          message: 'Please fix all validation errors before submitting',
        severity: 'error'
      });
        setDialogLoading(false);
      return;
    }
    
      // Try direct submission first
      const success = await submitUsingService();
      
      if (success) {
        // Close dialog and refresh data
        setDialogOpen(false);
        resetFormAndRefresh();
      }
    } catch (error) {
      console.error("Sale submission error:", error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message || 'Unknown error occurred'}`,
        severity: 'error'
      });
    } finally {
      setDialogLoading(false);
    }
  };
  
  // Use the service layer for CRUD operations
  const submitUsingService = async () => {
    try {
      // Generate a unique temporary ID for local storage
      const temporaryId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // Extract user ID from token for owner information
      let userId = '';
      try {
      const token = localStorage.getItem('token');
        if (token) {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(atob(base64));
          userId = payload.id || payload._id;
        }
      } catch (e) {
        console.error('Failed to extract user ID from token:', e);
        // Continue with empty userId
      }
      
      // Validate image data
      if (!formData.image && !imagePreview) {
        throw new Error('Image is required');
      }
      
      // Use image preview if available, otherwise use form data image
      let imageToSubmit = imagePreview || formData.image;
      
      // Ensure the image is properly formatted
      imageToSubmit = validateAndFixImageUrl(imageToSubmit);
    
    // Parse values with proper number conversion
    const originalPrice = Number(parseFloat(formData.originalPrice));
    const discountedPrice = Number(parseFloat(formData.discountedPrice));
    const stock = Number(parseInt(formData.stock));
      
      if (isNaN(originalPrice) || isNaN(discountedPrice) || isNaN(stock)) {
        throw new Error('Invalid number values. Please check your inputs.');
      }
    
    // Calculate discount percentage
    const discountPercentage = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
    
      // Prepare data for both local state and MongoDB
      const saleData = {
        // Use MongoDB ObjectId pattern for temp IDs to ensure compatibility
        _id: dialogMode === 'create' ? temporaryId : selectedSale._id,
        seller: userId || 'default-user',
        name: formData.name.trim(),
        description: formData.description.trim(),
      category: formData.category,
        originalPrice: originalPrice,
        discountedPrice: discountedPrice,
        price: originalPrice, // For MongoDB compatibility
      discount: discountPercentage,
      stock: stock,
        quantity: stock, // Duplicating for compatibility
        unit: formData.unit,
        expiryDate: new Date(formData.expiryDate).toISOString(),
        image: imageToSubmit,
      featured: false,
        tags: [],
        status: "active",
      views: 0,
      sales: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // For MongoDB API compatibility - ensure these fields exist
      const apiData = {
        ...saleData,
        product: "000000000000000000000000", // Valid MongoDB ObjectId placeholder
        isDirectSale: true,
        skipValidation: true
      };
      
      console.log("Submitting sale data:", {
        mode: dialogMode,
        dataSize: JSON.stringify(saleData).length,
        imageSize: typeof imageToSubmit === 'string' ? Math.round(imageToSubmit.length / 1024) + 'KB' : 'unknown'
      });
      
      if (dialogMode === 'create') {
        // Add to local state immediately for responsive UI
        console.log("Adding sale to local state with temp ID:", temporaryId);
        
        // Update state with new sale
        setSales(prevSales => {
          const newSales = [saleData, ...prevSales];
          // Also update localStorage
          try {
            localStorage.setItem('urgentSales', JSON.stringify(newSales));
            console.log(`Updated localStorage with ${newSales.length} sales (added new sale)`);
          } catch (e) {
            console.error('Failed to save sales to localStorage:', e);
          }
          return newSales;
        });
        
        // Close dialog right away for better UX
        setDialogOpen(false);
        
        // Show immediate success message
        setSnackbar({
          open: true,
          message: 'Urgent sale created successfully (locally)',
          severity: 'success'
        });
        
        // Then try to save to backend
        try {
          console.log("Attempting to save to backend...");
          
          // Try multiple approaches to maximize compatibility
          let response;
          try {
            response = await createUrgentSaleWithProductHandling(apiData);
          } catch (firstError) {
            console.log("First approach failed, trying fallback method");
            // Remove temp fields before second attempt
            const cleanedData = { ...apiData };
            delete cleanedData._id; // Let MongoDB generate a proper ID
            
            try {
              response = await createUrgentSale(cleanedData);
            } catch (secondError) {
              console.error("Both API approaches failed:", secondError);
              throw secondError;
            }
          }
          
          // If successful, update the local sale with the real ID
          if (response && response._id) {
            console.log("Backend save successful, updating local ID:", response._id);
            
            // Ensure the response has all required fields
            const completeResponse = {
              ...saleData,
              ...response,
              // Ensure these fields exist
              image: response.image || saleData.image,
              originalPrice: response.originalPrice || response.price || saleData.originalPrice,
              discountedPrice: response.discountedPrice || saleData.discountedPrice,
              stock: response.stock || response.quantity || saleData.stock
            };
            
            // Update the sale in state with the real backend ID
            setSales(prevSales => {
              const updatedSales = prevSales.map(s => 
                s._id === temporaryId ? completeResponse : s
              );
              
              // Update localStorage
              try {
                localStorage.setItem('urgentSales', JSON.stringify(updatedSales));
                console.log(`Updated localStorage with ${updatedSales.length} sales (updated backend ID)`);
      } catch (e) {
                console.error('Failed to update sales in localStorage:', e);
              }
              
              return updatedSales;
            });
            
            // Show success message for backend sync
            setSnackbar({
              open: true,
              message: 'Urgent sale synced with server successfully',
              severity: 'success'
            });
          }
        } catch (error) {
          console.error("Backend save failed, but keeping local version:", error);
          // Show warning that it's only saved locally
          setSnackbar({
            open: true,
            message: 'Sale saved locally only. Server sync failed.',
            severity: 'warning'
          });
        }
      } else {
        // Handle edit mode
        try {
          // Update local state first
          setSales(prevSales => {
            const updatedSales = prevSales.map(s => 
              s._id === selectedSale._id ? saleData : s
            );
            
            // Update localStorage
            try {
              localStorage.setItem('urgentSales', JSON.stringify(updatedSales));
              console.log(`Updated localStorage with ${updatedSales.length} sales (edited sale)`);
            } catch (e) {
              console.error('Failed to update sales in localStorage:', e);
            }
            
            return updatedSales;
          });
          
          // Close dialog for better UX
          setDialogOpen(false);
          
          // Show success message
    setSnackbar({
          open: true,
            message: 'Urgent sale updated successfully (locally)',
          severity: 'success'
        });
          
          // Only attempt backend update if it's a real MongoDB ID (not our temp ID)
          if (!selectedSale._id.startsWith('temp_') && !selectedSale._id.startsWith('local_') && !selectedSale._id.startsWith('sale_')) {
            try {
              // Remove any temp fields before sending to server
              const apiUpdateData = { ...apiData };
              
              // Try update through service
              const response = await updateUrgentSaleWithProductHandling(selectedSale._id, apiUpdateData);
              console.log("Update response from backend:", response);
              
              setSnackbar({
                open: true,
                message: 'Urgent sale synced with server successfully',
                severity: 'success'
              });
            } catch (serverError) {
              console.error("Backend update failed, but kept local changes:", serverError);
              
              setSnackbar({
                open: true,
                message: 'Sale updated locally only. Server sync failed.',
                severity: 'warning'
              });
            }
          } else {
            console.log("Skipping backend update for temporary ID:", selectedSale._id);
          }
        } catch (error) {
          console.error("Local update failed:", error);
          setSnackbar({
            open: true,
            message: `Failed to update: ${error.message}`,
            severity: 'error'
          });
        }
      }
        
    return true;
    } catch (error) {
      console.error("Error in submitUsingService:", error);
      
      // Extract error message from response
      let errorMessage = 'Failed to process request';
      
      if (error.response?.data?.message) {
        errorMessage = error.response?.data?.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response?.data?.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Additional debugging information
      console.error("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: errorMessage,
        data: error.response?.data
      });
      
      // Show error in snackbar
      setSnackbar({
        open: true,
        message: `Error: ${errorMessage}`,
        severity: 'error'
      });
      
      // Set specific field errors if available
      if (error.response?.data?.errors) {
        const fieldErrors = {};
        error.response.data.errors.forEach(err => {
          fieldErrors[err.field] = err.message;
        });
        setFormErrors(fieldErrors);
      }
      
      return false;
    }
  };
  
  // Helper function to reset form and refresh data
  const resetFormAndRefresh = () => {
    // Reset form data
        setFormData({
          name: '',
          description: '',
      category: 'Vegetables',
          originalPrice: '',
          discountedPrice: '',
          stock: '',
          unit: 'kg',
          expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      image: '',
      isActive: true
    });
    
    // Clear image preview
    setImagePreview(null);
    
    // Refresh sales list
    fetchUrgentSales();
  };
  
  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedSale(null);
    setFormErrors({});
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  // Handle confirmation dialog close
  const handleConfirmDialogClose = () => {
    setConfirmDialog({
      open: false,
      title: '',
      message: '',
      id: null,
      loading: false
    });
  };

  // Fetch urgent sales data with improved MongoDB compatibility
  const fetchUrgentSales = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching urgent sales with direct DB approach');
      
      // Get the current user ID from localStorage
      let userId = '';
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(atob(base64));
          userId = payload.id || payload._id;
          console.log('Current user ID for filtering sales:', userId);
        }
      } catch (e) {
        console.error('Failed to extract user ID from token:', e);
      }
      
      // Load existing sales from localStorage first
      let existingSales = [];
      try {
        const storedSales = localStorage.getItem('urgentSales');
        if (storedSales) {
          existingSales = JSON.parse(storedSales);
          console.log(`Loaded ${existingSales.length} existing sales from localStorage`);
        }
      } catch (e) {
        console.error('Failed to parse stored sales:', e);
      }
      
      // Try database load with fallbacks
      let apiSales = [];
      let apiSuccess = false;
      
      try {
        // First try MongoDB database search directly
        const dbResponse = await getMyUrgentSalesDirectDB();
        
        if (dbResponse && Array.isArray(dbResponse) && dbResponse.length > 0) {
          console.log(`Got ${dbResponse.length} sales directly from MongoDB`);
          apiSales = dbResponse;
          apiSuccess = true;
        } else {
          console.log('No direct MongoDB data, trying API endpoints');
          
          // Try several endpoints for compatibility
          const endpoints = [
            { fn: getMyUrgentSales, name: 'getMyUrgentSales' }
          ];
          
          for (const endpoint of endpoints) {
            try {
              console.log(`Trying ${endpoint.name}...`);
              const response = await endpoint.fn();
              
              if (response && Array.isArray(response) && response.length > 0) {
                console.log(`Success with ${endpoint.name}, got ${response.length} sales`);
                apiSales = response;
                apiSuccess = true;
                break;
              }
            } catch (endpointError) {
              console.log(`${endpoint.name} failed:`, endpointError.message);
              // Continue to next endpoint
            }
          }
        }
    } catch (err) {
        console.error('All API fetch methods failed:', err);
      }
      
      // Process results
      if (apiSuccess) {
        console.log(`Successfully fetched ${apiSales.length} sales from API`);
        
        // Filter to only include this user's sales if userId is available
        if (userId) {
          const originalCount = apiSales.length;
          apiSales = apiSales.filter(sale => {
            // Handle different seller field formats
            if (!sale.seller) return false;
            
            const sellerId = typeof sale.seller === 'object' 
              ? (sale.seller._id || sale.seller.id) 
              : sale.seller;
              
            return sellerId === userId;
          });
          console.log(`Filtered from ${originalCount} to ${apiSales.length} sales for user ID ${userId}`);
        }
        
        // Normalize MongoDB data to ensure consistent format
        const normalizedApiSales = apiSales.map(sale => normalizeMongoDBSale(sale, userId));
        
        // Merge with existing sales
        const mergedSales = mergeSales(existingSales, normalizedApiSales);
        
        // Fix any image issues
        const fixedSales = mergedSales.map(sale => ({
          ...sale,
          image: validateAndFixImageUrl(sale.image)
        }));
        
        setSales(fixedSales);
        
        // Save to localStorage
        try {
          localStorage.setItem('urgentSales', JSON.stringify(fixedSales));
        } catch (e) {
          console.error('Failed to save to localStorage:', e);
        }
      } else {
        console.log('API fetching failed, using existing or creating demo data');
        
        // Check if we have existing sales
        if (existingSales.length > 0) {
          console.log(`Using ${existingSales.length} existing sales from localStorage`);
          
          // Fix any image issues
          const fixedSales = existingSales.map(sale => ({
            ...sale,
            image: validateAndFixImageUrl(sale.image),
            seller: sale.seller || userId || 'default-user'
          }));
          
          setSales(fixedSales);
          
          // Save fixed sales back to localStorage
          try {
            localStorage.setItem('urgentSales', JSON.stringify(fixedSales));
          } catch (e) {
            console.error('Failed to save fixed sales to localStorage:', e);
          }
        } else {
          // Create demo data when no data exists at all
          console.log('No existing sales, creating demo data');
          
          // Use current date for realistic demo data
          const now = new Date();
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          // Real product images with fallbacks to our SVGs
          const PRODUCT_IMAGES = {
            VEGETABLES: 'https://images.unsplash.com/photo-1557844352-761f2565b576?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=640&q=80',
            DESSERT: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=640&q=80'
          };
          
          const demoSales = [
            {
              _id: 'demo_' + Date.now(),
              seller: userId || 'default-user',
              name: "Fresh Vegetables Mix",
              description: "A mix of fresh vegetables at a discounted price",
              category: "Vegetables",
              price: 43,
              originalPrice: 43,
              discountedPrice: 22.79,
              discount: 47,
              stock: 34,
              quantity: 34,
              unit: "kg",
              expiryDate: tomorrow.toISOString(),
              image: PRODUCT_IMAGES.VEGETABLES || PLACEHOLDER_IMAGES.VEGETABLES,
              featured: false,
              tags: [],
              status: "active",
              views: 0,
              sales: 0,
              createdAt: now.toISOString(),
              updatedAt: now.toISOString(),
            },
            {
              _id: 'demo_' + (Date.now() + 1),
              seller: userId || 'default-user',
              name: "Dessert Special",
              description: "Special dessert items available for limited time",
              category: "Desserts",
              price: 65,
              originalPrice: 65,
              discountedPrice: 38.35,
              discount: 41,
              stock: 20,
              quantity: 20,
              unit: "piece",
              expiryDate: tomorrow.toISOString(),
              image: PRODUCT_IMAGES.DESSERT || PLACEHOLDER_IMAGES.DESSERT,
              featured: true,
              tags: [],
              status: "active",
              views: 0,
              sales: 0,
              createdAt: now.toISOString(),
              updatedAt: now.toISOString(),
            }
          ];
          
          setSales(demoSales);
          
          // Save to localStorage
          try {
            localStorage.setItem('urgentSales', JSON.stringify(demoSales));
            console.log(`Saved ${demoSales.length} demo sales to localStorage`);
          } catch (e) {
            console.error('Failed to save demo sales to localStorage:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchUrgentSales:', error);
      setError('Failed to fetch urgent sales. Using locally stored data if available.');
      
      // Still try to show existing sales from localStorage
      try {
        const storedSales = localStorage.getItem('urgentSales');
        if (storedSales) {
          const parsedSales = JSON.parse(storedSales);
          if (Array.isArray(parsedSales) && parsedSales.length > 0) {
            console.log(`Fallback: Using ${parsedSales.length} sales from localStorage`);
            const fixedSales = parsedSales.map(sale => ({
              ...sale,
              image: validateAndFixImageUrl(sale.image)
            }));
            setSales(fixedSales);
          }
        }
      } catch (e) {
        console.error('Failed to load from localStorage as fallback:', e);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Helper to normalize MongoDB sale data format
  const normalizeMongoDBSale = (sale, currentUserId) => {
    // Start with original sale
    const normalized = { ...sale };
    
    // Ensure all required fields exist
    normalized.originalPrice = sale.originalPrice || sale.price || 0;
    normalized.discountedPrice = sale.discountedPrice || (sale.price * (1 - (sale.discount || 0) / 100)) || 0;
    normalized.stock = sale.stock || sale.quantity || 0;
    normalized.quantity = sale.quantity || sale.stock || 0;
    normalized.seller = sale.seller || sale.hotel || currentUserId || 'unknown';
    normalized.status = sale.status || 'active';
    normalized.unit = sale.unit || 'piece';
    normalized.featured = !!sale.featured;
    normalized.tags = sale.tags || [];
    normalized.views = sale.views || 0;
    normalized.sales = sale.sales || 0;
    
    // Fix missing dates
    if (!sale.createdAt) normalized.createdAt = new Date().toISOString();
    if (!sale.updatedAt) normalized.updatedAt = new Date().toISOString();
    
    // Ensure expiry date is valid
    if (!sale.expiryDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      normalized.expiryDate = tomorrow.toISOString();
    }
    
    return normalized;
  };
  
  // Helper function to merge sales arrays without duplicates
  const mergeSales = (existingSales, newSales) => {
    if (!newSales || !Array.isArray(newSales)) return existingSales;
    if (!existingSales || !Array.isArray(existingSales)) return newSales;
    
    // Create a map of existing sales by ID
    const salesMap = {};
    existingSales.forEach(sale => {
      salesMap[sale._id] = sale;
    });
    
    // Add or update with new sales
    newSales.forEach(sale => {
      salesMap[sale._id] = sale;
    });
    
    // Convert back to array
    return Object.values(salesMap);
  };
  
  // Load data on component mount
  useEffect(() => {
    fetchUrgentSales();
  }, []);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Calculate discount percentage
  const calculateDiscount = (original, discounted) => {
    if (!original || !discounted) return 'N/A';
    const discount = ((original - discounted) / original) * 100;
    return `${discount.toFixed(0)}%`;
  };
  
  // Compress and resize image to reduce file size with enhanced quality control
  const compressImage = (file, quality = 0.8, maxDimension = 1200) => {
    return new Promise((resolve, reject) => {
      // Safety check for file
      if (!file || !(file instanceof Blob)) {
        return reject(new Error("Invalid file provided"));
      }
      
      // Adjust quality based on file size
      let adjustedQuality = quality;
      if (file.size > 5 * 1024 * 1024) { // > 5MB
        adjustedQuality = Math.min(quality, 0.6); // More aggressive for large files
        maxDimension = Math.min(maxDimension, 1000); // Also reduce dimensions
      } else if (file.size > 2 * 1024 * 1024) { // > 2MB
        adjustedQuality = Math.min(quality, 0.7);
        maxDimension = Math.min(maxDimension, 1100);
      }
      
      // Create file reader
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        if (!event.target?.result) {
          return reject(new Error("Failed to read file content"));
        }
        
        const img = new Image();
        const fileDataUrl = event.target.result;
        img.src = fileDataUrl;
        
        img.onload = () => {
          // Check if image has valid dimensions
          if (img.width === 0 || img.height === 0) {
            return reject(new Error("Invalid image dimensions"));
          }
          
          // Create canvas for manipulation
          const canvas = document.createElement('canvas');
          
          // Calculate dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
          
          // Further reduce size for very large images
          const pixelCount = width * height;
          if (pixelCount > 1000000) { // > 1 megapixel
            const scaleFactor = Math.sqrt(1000000 / pixelCount);
            width = Math.floor(width * scaleFactor);
            height = Math.floor(height * scaleFactor);
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Check if canvas is supported
          if (!canvas.getContext) {
            console.warn("Canvas not supported, returning original image");
            return resolve(fileDataUrl);
          }
          
          const ctx = canvas.getContext('2d');
          
          // Apply smoothing for better quality
          if (ctx.imageSmoothingEnabled !== undefined) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
          }
          
          // Draw image on canvas
          ctx.fillStyle = '#FFFFFF'; // White background
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          
          try {
            // Get compressed image as data URL (use proper format detection)
            const mimeType = file.type || 'image/jpeg';
            const compressionQuality = adjustedQuality;
            
            // Use proper format support detection
            const isJpeg = mimeType.includes('jpeg') || mimeType.includes('jpg');
            const isPng = mimeType.includes('png');
            
            // JPEG is best for photos, PNG for graphics with transparency
            // Force JPEG for larger images regardless of original format (except for PNGs with transparency)
            let outputType = 'image/jpeg';
            if (isPng && hasTransparency(ctx, width, height)) {
              outputType = 'image/png';
            }
            
            // Only apply quality setting to JPEG (PNG uses lossless compression)
            const outputQuality = outputType === 'image/png' ? 0.9 : compressionQuality;
            
            const compressedDataUrl = canvas.toDataURL(outputType, outputQuality);
            
            // Verify the output is valid
            if (!compressedDataUrl || compressedDataUrl === 'data:,') {
              console.warn("Canvas failed to produce valid output, returning original");
              return resolve(fileDataUrl);
            }
          
          resolve(compressedDataUrl);
          } catch (err) {
            console.error("Canvas toDataURL failed:", err);
            // Fallback to original if conversion fails
            resolve(fileDataUrl);
          }
        };
        
        img.onerror = () => {
          console.error("Image failed to load for compression");
          reject(new Error("Failed to load image for compression"));
        };
      };
      
      reader.onerror = (event) => {
        console.error("FileReader error:", event);
        reject(new Error("Failed to read file"));
      };
    });
  };
  
  // Helper function to check if an image has transparency
  const hasTransparency = (ctx, width, height) => {
    try {
      const imageData = ctx.getImageData(0, 0, width, height).data;
      for (let i = 3; i < imageData.length; i += 4) {
        if (imageData[i] < 255) {
          return true;
        }
      }
    } catch (e) {
      console.warn("Could not check for transparency:", e);
    }
    return false;
  };

  // Handle create sale button click
  const handleCreateSale = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Vegetables',
      originalPrice: '',
      discountedPrice: '',
      stock: '',
      unit: 'kg',
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      image: '',
      isActive: true
    });
    
    setFormErrors({});
    setDialogMode('create');
    setImagePreview(null);
    setDialogOpen(true);
  };
  
  // Handle edit sale button click
  const handleEdit = (sale) => {
    setFormData({
      name: sale.name || '',
      description: sale.description || '',
      category: sale.category || 'Vegetables',
      originalPrice: sale.originalPrice || '',
      discountedPrice: sale.discountedPrice || '',
      stock: sale.stock || '',
      unit: sale.unit || 'kg',
      expiryDate: sale.expiryDate ? new Date(sale.expiryDate).toISOString().slice(0, 16) : '',
      image: sale.image || '',
      isActive: sale.isActive || true
    });
    
    setImagePreview(sale.image);
    setFormErrors({});
    setSelectedSale(sale);
    setDialogMode('edit');
    setDialogOpen(true);
  };
  
  // Handle delete sale button click
  const handleDelete = (sale) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Urgent Sale',
      message: `Are you sure you want to delete "${sale.name}"? This action cannot be undone.`,
      id: sale._id,
      loading: false
    });
  };
  
  // Handle confirmation dialog confirm button click
  const handleConfirmDelete = async () => {
    try {
      setConfirmDialog(prev => ({ ...prev, loading: true }));
      
      // First remove from local state and localStorage for immediate UI update
      const saleId = confirmDialog.id;
      const deletedSale = sales.find(s => s._id === saleId);
      
      if (!deletedSale) {
        throw new Error('Sale not found');
      }
      
      // Update local state immediately
      setSales(prevSales => prevSales.filter(s => s._id !== saleId));
      
      // Update localStorage
      try {
        const updatedSales = sales.filter(s => s._id !== saleId);
        localStorage.setItem('urgentSales', JSON.stringify(updatedSales));
        console.log(`Updated localStorage after deletion (${updatedSales.length} sales remaining)`);
      } catch (storageError) {
        console.error('Failed to update localStorage after deletion:', storageError);
      }
      
      // Close the dialog immediately for better UX
      setConfirmDialog({
        open: false,
        title: '',
        message: '',
        id: '',
        loading: false
      });
      
      setSnackbar({
        open: true,
        message: 'Urgent sale deleted successfully (locally)',
        severity: 'success'
      });
      
      // Only try to delete from server if it's a real MongoDB ID
      if (!saleId.startsWith('temp_') && !saleId.startsWith('local_') && 
          !saleId.startsWith('sale_') && !saleId.startsWith('demo_')) {
        try {
          // Try different delete approaches for better compatibility
          try {
            await hardDeleteUrgentSale(saleId);
            console.log('Delete successful with hardDeleteUrgentSale');
          } catch (firstError) {
            console.log('First delete method failed, trying alternative endpoint:', firstError.message);
            
            // Fallback to direct endpoint
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication required');
            
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://https://fresh-connect-backend.onrender.com'}/api/urgent-sales/${saleId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (!response.ok) {
              throw new Error(`Server responded with status: ${response.status}`);
            }
            
            console.log('Delete successful with direct fetch endpoint');
          }
          
        setSnackbar({
          open: true,
            message: 'Urgent sale deleted successfully from server',
            severity: 'success'
          });
        } catch (serverError) {
          console.error('Server deletion failed but local deletion successful:', serverError);
          setSnackbar({
            open: true,
            message: 'Sale deleted locally only. Server sync failed.',
            severity: 'warning'
          });
        }
      } else {
        console.log('Skipping server deletion for temporary ID:', saleId);
      }
    } catch (error) {
      console.error('Delete operation failed:', error);
        setSnackbar({
          open: true,
        message: `Failed to delete sale: ${error.message}`,
          severity: 'error'
        });
      
      setConfirmDialog(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle refresh button click with better loading sequence
  const handleRefreshClick = () => {
    setLoading(true);
    
    // Show refreshing notification
    setSnackbar({
      open: true,
      message: 'Refreshing sales data...',
      severity: 'info'
    });
    
    // First try to load data from localStorage
    try {
      const storedSales = localStorage.getItem('urgentSales');
      if (storedSales) {
        const parsedSales = JSON.parse(storedSales);
        if (Array.isArray(parsedSales) && parsedSales.length > 0) {
          console.log(`Loaded ${parsedSales.length} sales from localStorage`);
          
          // Extract user ID for filtering
          let userId = '';
          try {
            const token = localStorage.getItem('token');
            if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const payload = JSON.parse(atob(base64));
              userId = payload.id || payload._id;
            }
        } catch (e) {
            console.error('Failed to extract user ID from token:', e);
          }
          
          // Filter for current user and fix images
          const filteredSales = parsedSales.filter(sale => {
            if (!userId) return true; // If no user ID, show all sales
            const sellerId = typeof sale.seller === 'object' 
              ? (sale.seller._id || sale.seller.id) 
              : sale.seller;
            return sellerId === userId || sellerId === 'default-user';
          });
          
          console.log(`Filtered to ${filteredSales.length} sales for current user`);
          
          // Ensure each sale has a valid image format or replace with placeholder
          const fixedSales = filteredSales.map(sale => {
            // Create a new sale object with corrected image data and normalize fields
            return normalizeMongoDBSale({
              ...sale,
              image: validateAndFixImageUrl(sale.image)
            }, userId);
          });
          
          // Update the UI
          setSales(fixedSales);
          setLoading(false);
          
          // Update notification
        setSnackbar({
          open: true,
            message: `Loaded ${fixedSales.length} sales from local storage`,
          severity: 'success'
        });
        
          // Then try to fetch in the background for latest data
          setTimeout(() => {
            fetchUrgentSales().catch(err => {
              console.error('Background refresh failed:', err);
            });
          }, 1000);
          
          return;
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    
    // If no localStorage data or error occurs, try fetching from server
    fetchUrgentSales()
      .then(() => {
      setSnackbar({
        open: true,
          message: 'Sales data refreshed successfully',
          severity: 'success'
        });
      })
      .catch(err => {
        console.error('Server refresh failed:', err);
        setSnackbar({
          open: true,
          message: 'Failed to refresh from server. Using local data.',
          severity: 'warning'
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Handle sort menu click
  const handleSortMenuClick = (event) => {
    setSortMenuAnchorEl(event.currentTarget);
  };

  // Handle sort menu close
  const handleSortMenuClose = () => {
    setSortMenuAnchorEl(null);
  };
  
  // Enhanced sort change handler
  const handleSortChangeWithClose = (field) => {
    handleSortChange(field);
    handleSortMenuClose();
  };

  // Enhanced input validation for numbers only
  const handleNumericInput = (e) => {
    const { name, value } = e.target;
    
    // Allow only numbers and decimal point
    if (!/^-?\d*\.?\d*$/.test(value) && value !== '') {
      return; // Ignore non-numeric input
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Perform dynamic validation based on field
    validateFieldDynamic(name, value);
  };
  
  // Return formatted expiry time remaining
  const getExpiryTimeRemaining = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else {
      return 'Expires soon';
    }
  };
  
  // Calculate badge color based on expiry date
  const getExpiryBadgeColor = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffHours = (expiry - now) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return 'error';
    } else if (diffHours < 48) {
      return 'warning';
    } else {
      return 'success';
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3,
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <Box sx={{ 
          mb: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2 
        }}>
          <Typography variant="h5" component="h1" fontWeight={600} color="primary.main">
            Urgent Sales Management
          </Typography>
        
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Refresh sales data" arrow>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={handleRefreshClick}
                disabled={loading}
                size={isMobile ? "small" : "medium"}
              >
                Refresh
              </Button>
            </Tooltip>
            
            <Tooltip title="Add a new urgent sale item" arrow>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateSale}
                disabled={loading}
                size={isMobile ? "small" : "medium"}
              >
                Create New Sale
              </Button>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Add filter section */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            <TextField
              placeholder="Search sales..."
              size="small"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                endAdornment: filters.search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => handleFilterChange('search', '')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
              sx={{ flexGrow: 1, width: isMobile ? '100%' : 'auto' }}
            />
            
            <Button 
              startIcon={<FilterListIcon />}
              variant={showFilters ? "contained" : "outlined"}
              onClick={() => setShowFilters(!showFilters)}
              size="small"
              color={showFilters ? "primary" : "inherit"}
              sx={{ minWidth: isMobile ? '48%' : 'auto' }}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            
            <Button
              startIcon={<SortIcon />}
              variant="outlined"
              size="small"
              onClick={handleSortMenuClick}
              color={sortMenuOpen ? "primary" : "inherit"}
              sx={{ minWidth: isMobile ? '48%' : 'auto' }}
            >
              Sort
            </Button>
            
            {/* Sort Menu */}
            <SortMenu 
              anchorEl={sortMenuAnchorEl}
              open={sortMenuOpen}
              handleClose={handleSortMenuClose}
              sortConfig={sortConfig}
              handleSortChange={handleSortChangeWithClose}
            />
          </Box>
          
          {/* Advanced filters */}
          {showFilters && (
            <Fade in={showFilters}>
              <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }} variant="outlined">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        label="Category"
                      >
                        <MenuItem value="all">All Categories</MenuItem>
                        <MenuItem value="Vegetables">Vegetables</MenuItem>
                        <MenuItem value="Fruits">Fruits</MenuItem>
                        <MenuItem value="Meat">Meat</MenuItem>
                        <MenuItem value="Dairy">Dairy</MenuItem>
                        <MenuItem value="Bakery">Bakery</MenuItem>
                        <MenuItem value="Desserts">Desserts</MenuItem>
                        <MenuItem value="Beverages">Beverages</MenuItem>
                        <MenuItem value="Snacks">Snacks</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={5}>
                    <Typography variant="body2" gutterBottom>
                      Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                    </Typography>
                    <Box sx={{ px: 1 }}>
                      <Slider
                        value={filters.priceRange}
                        onChange={(e, newValue) => handleFilterChange('priceRange', newValue)}
                        valueLabelDisplay="auto"
                        min={0}
                        max={maxPrice}
                        valueLabelFormat={(value) => `₹${value}`}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" gutterBottom>
                      Expiry Date Range
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: isMobile ? 'column' : 'row' }}>
                      <TextField
                        label="From"
                        type="date"
                        size="small"
                        value={filters.expiryDateRange.start}
                        onChange={(e) => handleFilterChange('expiryDateRange', {
                          ...filters.expiryDateRange,
                          start: e.target.value
                        })}
                        InputLabelProps={{ shrink: true }}
                        fullWidth={isMobile}
                      />
                      <TextField
                        label="To"
                        type="date"
                        size="small"
                        value={filters.expiryDateRange.end}
                        onChange={(e) => handleFilterChange('expiryDateRange', {
                          ...filters.expiryDateRange,
                          end: e.target.value
                        })}
                        InputLabelProps={{ shrink: true }}
                        fullWidth={isMobile}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleClearFilters}
                      startIcon={<ClearIcon />}
                      size="small"
                    >
                      Clear Filters
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Fade>
          )}
        </Box>
      </Paper>
      
      {/* Display urgent sales */}
      <Paper 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          boxShadow: 2
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" component="h2" fontWeight={600}>
            My Urgent Sales
          </Typography>
          
          {sortConfig && (
            <Chip 
              label={`Sorted by: ${sortConfig.field} (${sortConfig.direction === 'asc' ? 'ascending' : 'descending'})`}
              size="small"
              variant="outlined"
              onDelete={() => setSortConfig({ field: 'updatedAt', direction: 'desc' })}
            />
          )}
        </Box>
        
        {/* Show filter results summary */}
        {(filters.search || filters.category !== 'all' || 
          filters.expiryDateRange.start || filters.expiryDateRange.end) && (
          <Box sx={{ mb: 2 }}>
            <Chip 
              label={`${filteredAndSortedSales.length} results found`} 
              color="primary" 
              size="small"
              sx={{ mr: 1, mb: isMobile ? 1 : 0 }}
            />
            {filters.search && (
              <Chip 
                label={`Search: "${filters.search}"`} 
                onDelete={() => handleFilterChange('search', '')}
                size="small"
                sx={{ mr: 1, mb: isMobile ? 1 : 0 }}
              />
            )}
            {filters.category !== 'all' && (
              <Chip 
                label={`Category: ${filters.category}`} 
                onDelete={() => handleFilterChange('category', 'all')}
                size="small"
                sx={{ mr: 1, mb: isMobile ? 1 : 0 }}
              />
            )}
            {(filters.expiryDateRange.start || filters.expiryDateRange.end) && (
              <Chip 
                label="Date filter active" 
                onDelete={() => handleFilterChange('expiryDateRange', { start: '', end: '' })}
                size="small"
                sx={{ mr: 1, mb: isMobile ? 1 : 0 }}
              />
            )}
          </Box>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        ) : filteredAndSortedSales.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            {sales.length === 0 ? 
              "No urgent sales found. Create one by clicking the \"Create New Sale\" button." : 
              "No sales match your search criteria. Try adjusting your filters."}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredAndSortedSales.map((sale) => (
              <Grid item xs={12} sm={6} md={4} key={sale._id}>
                <Card elevation={3} sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  borderRadius: 2,
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}>
                  {/* Image Display */}
                  <Box sx={{ position: 'relative', width: '100%', height: 200 }}>
                    <ImageWithFallback
                      src={sale.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={sale.name}
                    />
                    {/* Discount Badge */}
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8, 
                      bgcolor: 'error.main',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 10,
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {calculateDiscount(sale.originalPrice, sale.discountedPrice)} OFF
                    </Box>
                    
                    {/* Expiry Badge */}
                    <Badge 
                      badgeContent={getExpiryTimeRemaining(sale.expiryDate)} 
                      color={getExpiryBadgeColor(sale.expiryDate)}
                      sx={{ 
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        '& .MuiBadge-badge': {
                          fontSize: '0.7rem',
                          height: 'auto',
                          padding: '0 8px'
                        }
                      }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {sale.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {sale.description}
                    </Typography>
                    
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Original Price:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ textDecoration: 'line-through' }}>
                          ₹{sale.originalPrice}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Sale Price:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          ₹{sale.discountedPrice}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Stock:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          {sale.stock} {sale.unit}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Expires:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          {new Date(sale.expiryDate).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit this sale" arrow>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(sale)}
                        fullWidth
                      >
                        Edit
                      </Button>
                    </Tooltip>
                    <Tooltip title="Delete this sale" arrow>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(sale)}
                        fullWidth
                      >
                        Delete
                      </Button>
                    </Tooltip>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
      
      {/* Sale Form Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          py: 2
        }}>
          {dialogMode === 'create' ? 'Create New Urgent Sale' : 'Edit Urgent Sale'}
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              {/* Main Form Fields */}
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                margin="normal"
                required
                inputProps={{ maxLength: 50 }}
              />
              
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
                margin="normal"
                multiline
                rows={4}
                required
                inputProps={{ maxLength: 500 }}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth margin="normal" error={!!formErrors.originalPrice}>
                    <InputLabel htmlFor="originalPrice" required>Original Price</InputLabel>
                    <OutlinedInput
                      id="originalPrice"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleNumericInput}  // Use enhanced numeric handler
                      startAdornment={<InputAdornment position="start">₹</InputAdornment>}
                      label="Original Price"
                      type="text" // Change to text to handle our own validation
                      inputProps={{ 
                        inputMode: "decimal", // Show numeric keyboard on mobile
                        pattern: "[0-9]*(\.[0-9]+)?",
                      }}
                    />
                    {formErrors.originalPrice && (
                      <FormHelperText>{formErrors.originalPrice}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={6}>
                  <FormControl fullWidth margin="normal" error={!!formErrors.discountedPrice}>
                    <InputLabel htmlFor="discountedPrice" required>Discounted Price</InputLabel>
                    <OutlinedInput
                      id="discountedPrice"
                      name="discountedPrice"
                      value={formData.discountedPrice}
                      onChange={handleNumericInput}  // Use enhanced numeric handler
                      startAdornment={<InputAdornment position="start">₹</InputAdornment>}
                      label="Discounted Price"
                      type="text" // Change to text to handle our own validation
                      inputProps={{ 
                        inputMode: "decimal", // Show numeric keyboard on mobile
                        pattern: "[0-9]*(\.[0-9]+)?",
                      }}
                    />
                    {formErrors.discountedPrice && (
                      <FormHelperText>{formErrors.discountedPrice}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                {/* Add discount percentage display */}
                {formData.originalPrice && formData.discountedPrice && !formErrors.originalPrice && !formErrors.discountedPrice && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: -1, mb: 1 }}>
                      <Typography variant="body2">
                        Discount percentage:
                      </Typography>
                      <Chip 
                        label={`${calculateDiscountPercentage()}% OFF`}
                        color="error"
                        size="small"
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth margin="normal" error={!!formErrors.stock}>
                    <InputLabel htmlFor="stock" required>Stock</InputLabel>
                    <OutlinedInput
                      id="stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleNumericInput}  // Use enhanced numeric handler
                      label="Stock"
                      type="text" // Change to text to handle our own validation
                      inputProps={{ 
                        inputMode: "numeric", // Show integer keyboard on mobile
                        pattern: "[0-9]*",
                      }}
                    />
                    {formErrors.stock && (
                      <FormHelperText>{formErrors.stock}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel htmlFor="unit">Unit</InputLabel>
                    <Select
                      id="unit"
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      label="Unit"
                    >
                      <MenuItem value="kg">kg</MenuItem>
                      <MenuItem value="g">g</MenuItem>
                      <MenuItem value="l">l</MenuItem>
                      <MenuItem value="ml">ml</MenuItem>
                      <MenuItem value="plate">plate</MenuItem>
                      <MenuItem value="box">box</MenuItem>
                      <MenuItem value="packet">packet</MenuItem>
                      <MenuItem value="piece">piece</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              <FormControl fullWidth margin="normal">
                <InputLabel htmlFor="category">Category</InputLabel>
                <Select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  label="Category"
                >
                  <MenuItem value="Vegetables">Vegetables</MenuItem>
                  <MenuItem value="Fruits">Fruits</MenuItem>
                  <MenuItem value="Meat">Meat</MenuItem>
                  <MenuItem value="Dairy">Dairy</MenuItem>
                  <MenuItem value="Bakery">Bakery</MenuItem>
                  <MenuItem value="Desserts">Desserts</MenuItem>
                  <MenuItem value="Beverages">Beverages</MenuItem>
                  <MenuItem value="Snacks">Snacks</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Expiry Date & Time"
                name="expiryDate"
                type="datetime-local"
                value={formData.expiryDate}
                onChange={handleInputChange}
                error={!!formErrors.expiryDate}
                helperText={formErrors.expiryDate}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
              
              {/* Add expiry countdown if date is less than 48 hours */}
              {formData.expiryDate && (
                <Box sx={{ mt: 1 }}>
                  <Typography 
                    variant="body2" 
                    color={
                      (new Date(formData.expiryDate) - new Date()) / (1000 * 60 * 60) < 24
                        ? 'error.main'
                        : (new Date(formData.expiryDate) - new Date()) / (1000 * 60 * 60) < 48
                          ? 'warning.main'
                          : 'text.secondary'
                    }
                  >
                    {(new Date(formData.expiryDate) - new Date()) / (1000 * 60 * 60) < 24
                      ? '⚠️ Product will expire in less than 24 hours'
                      : (new Date(formData.expiryDate) - new Date()) / (1000 * 60 * 60) < 48
                        ? '⚠️ Product will expire in less than 48 hours'
                        : 'Product expiry time is acceptable'}
                  </Typography>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={5}>
              {/* Image Upload Section */}
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Product Image <span style={{ color: 'red' }}>*</span>
                </Typography>
              
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    mb: 3,
                    border: formErrors.image ? '1px solid #d32f2f' : 'none',
                    borderRadius: 2
                  }}
                >
                  {/* Image preview */}
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: 200, 
                      border: '1px dashed grey', 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1,
                      position: 'relative',
                      overflow: 'hidden',
                      mb: 2
                    }}
                  >
                    {isUploading && (
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        zIndex: 2
                      }}>
                        <CircularProgress />
                      </Box>
                    )}
                    
                    {imagePreview || formData.image ? (
                      <img 
                        src={imagePreview || formData.image} 
                        alt="Product preview" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover'
                        }} 
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" text-anchor="middle" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <Typography color="text.secondary">No image selected</Typography>
                    )}
                  </Box>
              
                  {/* Image selection button */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="image-upload-button"
                      type="file"
                      onChange={handleImageSelect}
                      disabled={isUploading}
                    />
                    <label htmlFor="image-upload-button" style={{ width: '100%' }}>
                      <Button
                        variant="contained"
                        component="span"
                        startIcon={<PhotoCamera />}
                        disabled={isUploading}
                        fullWidth
                      >
                        {isUploading ? 'Uploading...' : 'Select Image'}
                      </Button>
                    </label>
              
                    {(formData.image || imagePreview) && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, image: '' }));
                          setImagePreview(null);
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                  
                  {formErrors.image && (
                    <FormHelperText error>{formErrors.image}</FormHelperText>
                  )}
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2, pt: 2 }}>
          <Button onClick={handleDialogClose} color="inherit">
            Cancel
          </Button>
          
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={dialogLoading}
            startIcon={dialogLoading ? <CircularProgress size={20} /> : null}
          >
            {dialogMode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleConfirmDialogClose}
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleConfirmDialogClose} disabled={confirmDialog.loading}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleConfirmDelete} 
            disabled={confirmDialog.loading}
            startIcon={confirmDialog.loading ? <CircularProgress size={20} /> : null}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UrgentSales; 