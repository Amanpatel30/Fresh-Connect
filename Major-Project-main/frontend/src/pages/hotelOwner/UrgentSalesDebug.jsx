import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  FormHelperText,
  CardActions,
  IconButton,
  Card,
  CardContent,
  Snackbar,
  Chip,
  Tooltip,
  MenuItem,
  Select,
  Container,
  DialogContentText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getMyUrgentSales, createUrgentSale, updateUrgentSaleWithProductHandling, deleteUrgentSale, hardDeleteUrgentSale, getVerificationStatus } from '../../services/api.jsx';
import { useNavigate } from 'react-router-dom';
import PreviewIcon from '@mui/icons-material/Preview';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { 
  uploadImage, 
  validateImage, 
  cleanBlobUrl 
} from '../../lib/imageUpload.jsx';
import { PhotoCamera } from '@mui/icons-material';

// Image component with fallback for error handling
const ImageWithFallback = ({ src, alt, style, ...props }) => {
  const [error, setError] = useState(false);
  
  // Process the src to handle different URL formats
  let processedSrc = src;
  
  // Ensure URLs are properly formatted
  if (src && !src.startsWith('blob:') && !src.startsWith('data:') && !src.startsWith('http')) {
    // If it's a relative path, assume it's from the backend API
    if (src.startsWith('/')) {
      processedSrc = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${src}`;
    } else {
      processedSrc = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/${src}`;
    }
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {error ? (
        <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          bgcolor: 'grey.200'
        }}>
          <Typography variant="body2" color="text.secondary">Image not available</Typography>
        </Box>
      ) : (
        <img
          src={processedSrc}
          alt={alt}
          style={{ 
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            ...style
          }}
          onError={() => setError(true)}
          {...props}
        />
      )}
    </Box>
  );
};

// Main component for Urgent Sales
const UrgentSalesDebug = () => {
  console.log('UrgentSalesDebug component rendering');
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [allSales, setAllSales] = useState([]);
  const navigate = useNavigate();
  
  // State for verification
  const [isVerified, setIsVerified] = useState(true); // Always set to true for development

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [dialogLoading, setDialogLoading] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
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
  
  // State for user info
  const [userInfo, setUserInfo] = useState(null);
  
  // Check login status on component mount
  useEffect(() => {
    const checkLoginStatus = () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('No authentication token found');
          return;
        }
        
        // Try to decode token
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        
        // Extract user info
        const userId = payload.id || payload._id || payload.userId || payload.user_id || payload.sub;
        const userName = payload.name || payload.username || 'Hotel Owner';
        
        if (userId) {
          setUserInfo({ id: userId, name: userName });
          console.log('Logged in as:', userName, 'ID:', userId);
        } else {
          console.warn('Token does not contain user ID');
        }
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    };
    
    checkLoginStatus();
  }, []);
  
  // Fetch verification status - modified to always set as verified during development
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        // During development, always set as verified regardless of API response
        setIsVerified(true);
      } catch (error) {
        console.error('Error fetching verification status:', error);
        // Still set as verified even if there's an error
        setIsVerified(true);
      }
    };

    fetchVerificationStatus();
  }, []);
  
  // Fetch real urgent sales data
  const fetchUrgentSales = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching urgent sales data...');
      const response = await getMyUrgentSales();
      
      if (!response || !Array.isArray(response)) {
        console.warn('Invalid response format received:', response);
        setError('Invalid response format from server');
        setSales([]);
        setAllSales([]);
        return;
      }
      
      console.log(`Successfully fetched ${response.length} urgent sales`);
      setSales(response);
      setAllSales(response);
    } catch (err) {
      console.error('Error fetching urgent sales:', err);
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to fetch urgent sales';
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = 'Please log in again to view your urgent sales';
            break;
          case 403:
            errorMessage = 'You do not have permission to view urgent sales';
            break;
          case 500:
            errorMessage = 'Server error: Unable to fetch urgent sales. Please try again later.';
            break;
          default:
            errorMessage = err.response.data?.message || err.message || errorMessage;
        }
      } else if (err.request) {
        errorMessage = 'Network error: Unable to connect to the server';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
      setSales([]);
      setAllSales([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    console.log('UrgentSalesDebug component mounted');
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
  
  // Handle create sale button click
  const handleCreateSale = async () => {
    try {
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
      
      // Reset form errors
      setFormErrors({});
      
      // Set dialog mode to create
      setDialogMode('create');
      
      // Open dialog
      setDialogOpen(true);
    } catch (err) {
      console.error('Error preparing to create sale:', err);
      setError('Failed to prepare sale creation. Please try again.');
    }
  };
  
  // Handle edit sale button click
  const handleEdit = (sale) => {
    console.log('Editing sale:', sale);
    
    // Debug the image URL
    console.log('Image URL in sale being edited:', sale.image);
    
    // Set form data
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
    
    // Set image preview for the edit dialog
    setImagePreview(sale.image);
    
    // Reset form errors
    setFormErrors({});
    
    // Set selected sale
    setSelectedSale(sale);
    
    // Set dialog mode to edit
    setDialogMode('edit');
    
    // Open dialog
    setDialogOpen(true);
  };
  
  // Handle delete sale button click
  const handleDelete = (sale) => {
    console.log('Deleting sale:', sale);
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
      // Set loading state
      setConfirmDialog(prev => ({ ...prev, loading: true }));
      
      // Permanently delete sale
      console.log(`Deleting sale with ID: ${confirmDialog.id}`);
      await hardDeleteUrgentSale(confirmDialog.id);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Urgent sale deleted successfully',
        severity: 'success'
      });
      
      // Close dialog
      setConfirmDialog({
        open: false,
        title: '',
        message: '',
        id: '',
        loading: false
      });
      
      // Refresh sales list
      fetchUrgentSales();
    } catch (error) {
      console.error('Error deleting sale:', error);
      
      // Show error message
      setSnackbar({
        open: true,
        message: `Failed to delete sale: ${error.message}`,
        severity: 'error'
      });
      
      // Close dialog
      setConfirmDialog(prev => ({ ...prev, loading: false }));
    }
  };
  
  // Handle form input change with immediate validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Immediately validate this field
    validateField(name, value);
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
        
      case 'category':
        if (!value) {
          error = 'Category is required';
        }
        break;
        
      case 'unit':
        if (!value) {
          error = 'Unit is required';
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

  // Handle image select with better error handling
  const handleImageSelect = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsUploading(true);
    
    try {
      console.log("Starting image upload process...");
      
      // Validate the file
      const validation = validateImage(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      // Compress and resize the image before upload to reduce lag
      const compressedImage = await compressImage(file);
      
      // Set both the formData image and imagePreview with the compressed image
      setFormData(prev => ({ ...prev, image: compressedImage }));
      setImagePreview(compressedImage);
      
      // Clear any image error
      if (formErrors.image) {
        setFormErrors(prev => ({
          ...prev,
          image: undefined
        }));
      }
      
      console.log("Image processed successfully");
    } catch (error) {
      console.error("Error during image selection/upload:", error);
      
      // Clear the file input
      e.target.value = '';
      
      // Show error message
      setSnackbar({ 
        open: true, 
        message: `Error: ${error.message || "Failed to upload image"}`, 
        severity: "error" 
      });
      
      // Set error in form errors
      setFormErrors(prev => ({
        ...prev,
        image: error.message || "Failed to upload image"
      }));
    } finally {
      setIsUploading(false);
    }
  };
  
  // Compress and resize image to reduce file size
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          
          // Determine new dimensions (max 800px width/height)
          let width = img.width;
          let height = img.height;
          const maxSize = 800;
          
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw resized image to canvas
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Get compressed image as data URL (JPEG, 80% quality)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          resolve(compressedDataUrl);
        };
        img.onerror = (error) => {
          reject(new Error("Failed to load image for compression"));
        };
      };
      reader.onerror = (error) => {
        reject(new Error("Failed to read file"));
      };
    });
  };
  
  // Comprehensive form validation
  const validateForm = () => {
    const errors = {};
    
    // Validate name
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }
    
    // Validate description
    if (!formData.description || !formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description should be at least 10 characters';
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
    
    // Validate category
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    
    // Validate unit
    if (!formData.unit) {
      errors.unit = 'Unit is required';
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
    
    // Log validation results
    console.log("Validation errors:", errors);
    console.log("Form data being validated:", formData);
    
    // Update form errors
    setFormErrors(errors);
    
    // Return true if there are no errors
    return Object.keys(errors).length === 0;
  };
  
  // Simplified form submission using direct API call
  const handleSubmit = async () => {
    try {
      // Clear previous error messages
      console.clear();
      console.log("========== SUBMITTING FORM ==========");
      
      // Set loading state
      setDialogLoading(true);
      
      // Basic validation first
      if (!validateForm()) {
        console.log('Form validation failed:', formErrors);
        
        // Show validation errors to user
        setSnackbar({
          open: true,
          message: 'Please fix all validation errors before submitting',
          severity: 'error'
        });
        setDialogLoading(false);
        return;
      }
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({
          open: true,
          message: 'Authentication required. Please log in again.',
          severity: 'error'
        });
        setDialogLoading(false);
        return;
      }
      
      console.log("Using submitDirectToMongoDB for reliable submission");
      
      // Use our direct API call function that works with MongoDB
      const result = await submitDirectToMongoDB(
        formData, 
        selectedSale, 
        dialogMode,
        token
      );
      
      // Handle result
      if (result.success) {
        setSnackbar({
          open: true,
          message: dialogMode === 'create' 
            ? 'Urgent sale created successfully!'
            : 'Urgent sale updated successfully!',
          severity: 'success'
        });
        
        // Close dialog and refresh data
        setDialogOpen(false);
        resetFormAndRefresh();
      } else {
        // Show error message from API
        setSnackbar({
          open: true,
          message: `Error: ${result.error}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      
      setSnackbar({
        open: true,
        message: `Error: ${error.message || 'Unknown error occurred'}`,
        severity: 'error'
      });
    } finally {
      setDialogLoading(false);
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
  
  // Add a direct API post function that works
  const submitDirectToMongoDB = async (formData, selectedSale, dialogMode, token) => {
    try {
      // Clear console for cleaner logging
      console.clear();
      console.log("🔍 SUBMITTING URGENT SALE DATA:");
      
      // Check required fields using exact backend field names
      if (!formData.name || !formData.description || !formData.originalPrice || 
          !formData.discountedPrice || !formData.stock || !formData.expiryDate) {
        console.log("FRONTEND VALIDATION FAILED: Missing required fields:", {
          name: formData.name ? "✓" : "✗",
          description: formData.description ? "✓" : "✗",
          originalPrice: formData.originalPrice ? "✓" : "✗",
          discountedPrice: formData.discountedPrice ? "✓" : "✗", 
          stock: formData.stock ? "✓" : "✗",
          expiryDate: formData.expiryDate ? "✓" : "✗"
        });
        
        return {
          success: false, 
          error: 'Please fill in all required fields'
        };
      }
      
      // Parse values - using exact field names from the backend
      const originalPrice = Number(parseFloat(formData.originalPrice));
      const discountedPrice = Number(parseFloat(formData.discountedPrice));
      const stock = Number(parseInt(formData.stock));
      
      // Calculate discount percentage
      const discountPercentage = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
      
      // Get user ID from token
      let sellerId = null;
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        sellerId = payload.id || payload._id || payload.userId || payload.user_id || payload.sub;
        console.log("Extracted seller ID:", sellerId);
      } catch (e) {
        console.error("Error extracting user ID from token:", e);
        return { success: false, error: 'Failed to authenticate user' };
      }
      
      // Create MongoDB schema object with EXACTLY the fields the schema expects
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category || "Vegetables",
        price: originalPrice,
        originalPrice: originalPrice,
        discountedPrice: discountedPrice,
        discount: discountPercentage,
        quantity: stock,
        stock: stock,
        unit: formData.unit || "kg",
        expiryDate: new Date(formData.expiryDate).toISOString(),
        image: formData.image || "https://via.placeholder.com/150",
        featured: false,
        status: "active", 
        views: 0,
        sales: 0,
        seller: sellerId,
        tags: [],
        images: []
      };
      
      console.log("DETAILED REQUEST INFO:");
      console.log("- Form data:", formData);
      console.log("- MongoDB payload:", JSON.stringify(productData, null, 2));
      
      // MONGODB VALIDATION CHECK
      console.log("MONGODB SCHEMA VALIDATION CHECK:");
      console.log("- Price field:", productData.price !== undefined ? "✓" : "✗");
      console.log("- Quantity field:", productData.quantity !== undefined ? "✓" : "✗");
      console.log("- Discount field:", productData.discount !== undefined ? "✓" : "✗");
      console.log("- Category field:", productData.category !== undefined ? "✓" : "✗");
      
      // Direct API call without any intermediate functions
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/urgent-sales`;
      const method = dialogMode === 'create' ? 'POST' : 'PUT';
      const endpoint = dialogMode === 'create' ? apiUrl : `${apiUrl}/${selectedSale?._id}`;
      
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      console.log("- API URL:", endpoint);
      console.log("- Method:", method);
      console.log("- Auth header:", authHeader ? "Present (hidden for security)" : "Missing");
      
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(productData)
      });
      
      // Get text response for debugging
      const responseText = await response.text();
      console.log(`API ${method} response status:`, response.status);
      console.log(`API ${method} response headers:`, Object.fromEntries([...response.headers]));
      console.log(`API ${method} response body:`, responseText);
      console.log("BACKEND VALIDATION CHECK: Is originalPrice defined?", productData.originalPrice !== undefined);
      console.log("BACKEND VALIDATION CHECK: Is stock defined?", productData.stock !== undefined);
      console.log("BACKEND VALIDATION CHECK: Field values:", {
        name: productData.name,
        description: productData.description,
        category: productData.category,
        price: productData.price,
        originalPrice: productData.originalPrice,
        discountedPrice: productData.discountedPrice,
        quantity: productData.quantity,
        stock: productData.stock,
        unit: productData.unit,
        expiryDate: productData.expiryDate
      });
      
      // Try to parse response as JSON for better error details
      let responseData = null;
      try {
        if (responseText) {
          responseData = JSON.parse(responseText);
          console.log("Parsed response data:", responseData);
          
          // Check for specific validation errors
          if (responseData.errors) {
            console.log("Validation errors from server:", responseData.errors);
            
            // Log missing fields if any
            const missingFields = Object.keys(responseData.errors)
              .filter(key => responseData.errors[key].kind === 'required')
              .map(key => key);
              
            if (missingFields.length > 0) {
              console.error("MISSING REQUIRED FIELDS:", missingFields);
            }
          }
        }
      } catch (e) {
        console.log("Response is not valid JSON:", e);
      }
      
      // Handle success/failure
      if (response.ok) {
        return { success: true };
      } else {
        let errorMsg = 'Failed to process request';
        
        // Try to get more specific error message
        if (responseData) {
          if (responseData.message) {
            errorMsg = responseData.message;
          } else if (responseData.error) {
            errorMsg = responseData.error;
          }
        } else {
          errorMsg = responseText || errorMsg;
        }
        
        console.error("API ERROR:", errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error("Direct API call error:", error);
      return { success: false, error: error.message };
    }
  };
  
  // Add a final special direct API posting function that bypasses any middleware/controller conversions
  const postDirectToMongoSchema = async () => {
    try {
      console.clear();
      console.log("🔍 SUBMITTING DIRECT MONGODB SCHEMA REQUEST");
      
      // Set loading state
      setDialogLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({
          open: true,
          message: 'Authentication required. Please log in again.',
          severity: 'error'
        });
        setDialogLoading(false);
        return;
      }
      
      // Validate form before submission
      if (!validateForm()) {
        console.log('Form validation failed:', formErrors);
        setSnackbar({
          open: true,
          message: 'Please fix all validation errors before submitting',
          severity: 'error'
        });
        setDialogLoading(false);
        return;
      }
      
      // Parse values
      const originalPrice = Number(parseFloat(formData.originalPrice));
      const discountedPrice = Number(parseFloat(formData.discountedPrice));
      const stock = Number(parseInt(formData.stock));
      const discountPercentage = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
      
      // Get user ID from token
      let sellerId = null;
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        sellerId = payload.id || payload._id || payload.userId || payload.user_id || payload.sub;
      } catch (e) {
        console.error("Error extracting user ID from token:", e);
        setDialogLoading(false);
        setSnackbar({
          open: true,
          message: 'Failed to authenticate user. Please log in again.',
          severity: 'error'
        });
        return;
      }
      
      // Create MongoDB-compatible object with all required fields properly named
      const directMongoObject = {
        // Common fields
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category || "Vegetables",
        
        // Fields needed by controller
        originalPrice: originalPrice,
        stock: stock,
        
        // Fields needed by MongoDB schema
        price: originalPrice,
        quantity: stock,
        
        // Other required fields
        discount: discountPercentage,
        discountedPrice: discountedPrice,
        unit: formData.unit || "kg",
        expiryDate: new Date(formData.expiryDate).toISOString(),
        image: formData.image || "https://via.placeholder.com/150",
        
        // Standard fields with default values
        featured: false,
        status: "active", 
        views: 0,
        sales: 0,
        seller: sellerId,
        
        // Required arrays (even if empty)
        tags: [],
        images: []
      };
      
      console.log("DIRECT MONGO SCHEMA REQUEST:", directMongoObject);
      
      // Direct API call 
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/urgent-sales`;
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      // Log the exact data being sent to MongoDB
      console.log("SENDING DIRECT FIELDS TO MONGODB:");
      console.log("- originalPrice:", directMongoObject.originalPrice);
      console.log("- stock:", directMongoObject.stock);
      console.log("- price:", directMongoObject.price);
      console.log("- quantity:", directMongoObject.quantity);
      console.log("- discount:", directMongoObject.discount);
      console.log("- category:", directMongoObject.category);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(directMongoObject)
      });
      
      // Handle response
      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Urgent sale created successfully!',
          severity: 'success'
        });
        setDialogOpen(false);
        resetFormAndRefresh();
      } else {
        const errorText = await response.text();
        let errorMessage = 'Failed to create urgent sale';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        console.error('API Error:', errorMessage);
        setSnackbar({
          open: true,
          message: `Error: ${errorMessage}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Direct post error:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message || 'Unknown error occurred'}`,
        severity: 'error'
      });
    } finally {
      setDialogLoading(false);
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ 
          mb: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2 
        }}>
          <Typography variant="h5" component="h1" fontWeight={600}>
            Urgent Sales Management
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={fetchUrgentSales}
              disabled={loading}
            >
              Refresh
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateSale}
              disabled={loading}
            >
              Create New Sale
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Display urgent sales */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">My Urgent Sales</h2>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : sales.length === 0 ? (
          <div className="text-center text-gray-500">No urgent sales found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sales.map((sale) => (
              <div key={sale._id} className="border rounded-lg p-4 shadow-sm">
                {/* Image Display */}
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <img
                    src={sale.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={sale.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                  {/* Discount Badge */}
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                    {calculateDiscount(sale.originalPrice, sale.discountedPrice)} OFF
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-2">{sale.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{sale.description}</p>
                
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Original Price:</span>
                    <span className="font-medium">₹{sale.originalPrice}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Discounted Price:</span>
                    <span className="font-medium text-green-600">₹{sale.discountedPrice}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Stock:</span>
                    <span className="font-medium">{sale.stock} {sale.unit}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Expires:</span>
                    <span className="font-medium">{new Date(sale.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(sale)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                  >
                    <EditIcon sx={{ fontSize: 18 }} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(sale)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center gap-1"
                  >
                    <DeleteIcon sx={{ fontSize: 18 }} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Sale Form Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Create New Urgent Sale' : 'Edit Urgent Sale'}
        </DialogTitle>
        
        {userInfo && (
          <Alert severity="info" sx={{ mx: 3, mt: 1, mb: 2 }}>
            Logged in as: {userInfo.name} (ID: {userInfo.id})
          </Alert>
        )}
        
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
              />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth margin="normal" error={!!formErrors.originalPrice}>
                    <InputLabel htmlFor="originalPrice" required>Original Price</InputLabel>
                    <OutlinedInput
                      id="originalPrice"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      startAdornment={<InputAdornment position="start">₹</InputAdornment>}
                      label="Original Price"
                      type="number"
                      inputProps={{ min: "0", step: "0.01" }}
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
                      onChange={handleInputChange}
                      startAdornment={<InputAdornment position="start">₹</InputAdornment>}
                      label="Discounted Price"
                      type="number"
                      inputProps={{ min: "0", step: "0.01" }}
                    />
                    {formErrors.discountedPrice && (
                      <FormHelperText>{formErrors.discountedPrice}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth margin="normal" error={!!formErrors.stock}>
                    <InputLabel htmlFor="stock" required>Stock</InputLabel>
                    <OutlinedInput
                      id="stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      label="Stock"
                      type="number"
                      inputProps={{ min: "1", step: "1" }}
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
            </Grid>
            
            <Grid item xs={12} md={5}>
              {/* Image Upload Section */}
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Product Image <span style={{ color: 'red' }}>*</span>
                </Typography>
                
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    mb: 3,
                    border: formErrors.image ? '1px solid #d32f2f' : 'none'
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
                          console.error("Error loading preview image:", e);
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" text-anchor="middle" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <Typography color="text.secondary">No image selected</Typography>
                    )}
                  </Box>
                  
                  {/* Current image URL display - for debugging */}
                  {(formData.image || imagePreview) && (
                    <TextField
                      fullWidth
                      label="Image URL"
                      value={formData.image || imagePreview || ''}
                      disabled
                      variant="outlined"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  )}
                  
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
          <Button onClick={() => setDialogOpen(false)} color="secondary">
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
          
          <Button
            onClick={postDirectToMongoSchema}
            color="success"
            variant="contained"
            disabled={dialogLoading}
            startIcon={dialogLoading ? <CircularProgress size={20} /> : null}
            sx={{ ml: 1 }}
          >
            Direct Save to MongoDB
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirmation Dialog with fixed message display */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleConfirmDialogClose}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose} disabled={confirmDialog.loading}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleConfirmDelete} 
            disabled={confirmDialog.loading}
            startIcon={confirmDialog.loading ? <CircularProgress size={20} /> : <DeleteIcon />}
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
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UrgentSalesDebug; 
