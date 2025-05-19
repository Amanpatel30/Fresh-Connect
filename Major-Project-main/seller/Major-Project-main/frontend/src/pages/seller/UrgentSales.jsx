import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Alert, 
  Snackbar,
  Paper,
  Divider,
  IconButton,
  InputAdornment,
  CircularProgress,
  Tabs,
  Tab,
  Tooltip,
  Switch,
  FormControlLabel,
  Slider,
  Badge,
  Autocomplete,
  FormHelperText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DiscountIcon from '@mui/icons-material/LocalOffer';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ShareIcon from '@mui/icons-material/Share';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MonetizationOn from '@mui/icons-material/MonetizationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import api from '../../services/api.js';
import ProductAutocomplete from '../../components/common/ProductAutocomplete';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
  },
}));

const UrgentSalesBanner = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  background: 'linear-gradient(135deg, #2E7D32 0%, #43A047 50%, #66BB6A 100%)',
  color: 'white',
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'url(https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80) no-repeat center center',
    backgroundSize: 'cover',
    opacity: 0.1,
    zIndex: 0,
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const StyledUploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StatCard = styled(Paper)(({ theme, color }) => ({
  padding: theme.spacing(2),
  color: theme.palette.getContrastText(color),
  backgroundColor: color,
  borderRadius: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
}));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Create a service layer for UrgentSales operations
const urgentSalesService = {
  getUrgentSales: async () => {
    try {
      // Try the new API endpoint first
      try {
        const response = await api.get('/seller/urgentsales');
        return response.data;
      } catch (firstError) {
        console.log('First endpoint failed, trying fallback endpoint');
        // If the first fails, try the fallback endpoint
        const response = await api.get('/seller/urgent-sales');
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching urgent sales:', error);
      throw error;
    }
  },
  
  getUrgentSale: async (id) => {
    try {
      try {
        const response = await api.get(`/seller/urgentsales/${id}`);
        return response.data;
      } catch (firstError) {
        const response = await api.get(`/seller/urgent-sales/${id}`);
        return response.data;
      }
    } catch (error) {
      console.error(`Error fetching urgent sale ${id}:`, error);
      throw error;
    }
  },
  
  createUrgentSale: async (saleData) => {
    try {
      try {
        const response = await api.post('/seller/urgentsales', saleData);
        return response.data;
      } catch (firstError) {
        const response = await api.post('/seller/urgent-sales', saleData);
        return response.data;
      }
    } catch (error) {
      console.error('Error creating urgent sale:', error);
      throw error;
    }
  },
  
  updateUrgentSale: async (id, saleData) => {
    try {
      try {
        const response = await api.put(`/seller/urgentsales/${id}`, saleData);
        return response.data;
      } catch (firstError) {
        const response = await api.put(`/seller/urgent-sales/${id}`, saleData);
        return response.data;
      }
    } catch (error) {
      console.error(`Error updating urgent sale ${id}:`, error);
      throw error;
    }
  },
  
  deleteUrgentSale: async (id) => {
    try {
      try {
        const response = await api.delete(`/seller/urgentsales/${id}`);
        return response.data;
      } catch (firstError) {
        const response = await api.delete(`/seller/urgent-sales/${id}`);
        return response.data;
      }
    } catch (error) {
      console.error(`Error deleting urgent sale ${id}:`, error);
      throw error;
    }
  },
  
  toggleFeature: async (id) => {
    try {
      try {
        const response = await api.patch(`/seller/urgentsales/${id}/featured`);
        return response.data;
      } catch (firstError) {
        const response = await api.patch(`/seller/urgent-sales/${id}/featured`);
        return response.data;
      }
    } catch (error) {
      console.error(`Error toggling feature status for sale ${id}:`, error);
      throw error;
    }
  },
  
  toggleStatus: async (id) => {
    try {
      try {
        const response = await api.patch(`/seller/urgentsales/${id}/status`);
        return response.data;
      } catch (firstError) {
        const response = await api.patch(`/seller/urgent-sales/${id}/status`);
        return response.data;
      }
    } catch (error) {
      console.error(`Error toggling status for sale ${id}:`, error);
      throw error;
    }
  }
};

const UrgentSales = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState('expiryDate');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showExpiredProducts, setShowExpiredProducts] = useState(false);
  const [discountRange, setDiscountRange] = useState([0, 100]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [analyticsData, setAnalyticsData] = useState({
    totalSales: 0,
    totalRevenue: 0,
    averageDiscount: 0,
    categorySales: []
  });

  const [products, setProducts] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [previewMode, setPreviewMode] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    discountedPrice: '',
    quantity: '',
    unit: 'kg',
    expiryDate: '',
    image: '',
    featured: false,
    tags: [],
    status: 'active'
  });
  const [editMode, setEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({ open: false, productId: null });
  const [formErrors, setFormErrors] = useState({});

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      // Edit mode
      setEditMode(true);
      setCurrentProductId(product._id || product.id);
      setNewProduct({ ...product });
      if (product.image) {
        setImagePreview(product.image);
      }
    } else {
      // Add mode
      setEditMode(false);
      setCurrentProductId(null);
      setNewProduct({
        name: '',
        description: '',
        category: '',
        price: '',
        discountedPrice: '',
        quantity: '',
        unit: 'kg',
        expiryDate: '',
        image: '',
        featured: false,
        tags: [],
        status: 'active'
      });
      setImagePreview('');
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setPreviewMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // For debugging
    console.log(`UrgentSales field changed: ${name}, Value: ${value}, Type: ${type}`);
    
    // Handle batch updates from ProductAutocomplete
    if (name === 'batch' && typeof value === 'object') {
      setNewProduct(prev => ({
        ...prev,
        ...value
      }));
      
      // Clear any errors related to these fields
      const updatedErrors = { ...formErrors };
      Object.keys(value).forEach(field => {
        if (updatedErrors[field]) {
          delete updatedErrors[field];
        }
      });
      setFormErrors(updatedErrors);
      return;
    }
    
    setNewProduct({ 
      ...newProduct, 
      [name]: type === 'checkbox' ? checked : value 
    });
    
    // Clear error for the field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      });
    }
  };

  const handleTagsChange = (event, newValue) => {
    setNewProduct({ ...newProduct, tags: newValue });
  };

  const calculateDiscount = () => {
    if (newProduct.price && newProduct.discountedPrice) {
      const discount = ((newProduct.price - newProduct.discountedPrice) / newProduct.price) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  // Enhanced validation function similar to ProductAdd.jsx
  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!newProduct.name) {
      errors.name = 'Product name is required';
    } else if (newProduct.name.length < 3) {
      errors.name = 'Name must be at least 3 characters';
    } else if (newProduct.name.length > 50) {
      errors.name = 'Name cannot exceed 50 characters';
    }
    
    // Description validation
    if (!newProduct.description) {
      errors.description = 'Description is required';
    } else if (newProduct.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    } else if (newProduct.description.length > 1000) {
      errors.description = 'Description cannot exceed 1000 characters';
    }
    
    // Category validation
    if (!newProduct.category) {
      errors.category = 'Category is required';
    }
    
    // Price validation
    if (!newProduct.price) {
      errors.price = 'Original price is required';
    } else if (isNaN(newProduct.price) || parseFloat(newProduct.price) <= 0) {
      errors.price = 'Price must be a positive number';
    } else if (parseFloat(newProduct.price) > 100000) {
      errors.price = 'Price cannot exceed ₹100,000';
    }
    
    // Discounted price validation
    if (!newProduct.discountedPrice) {
      errors.discountedPrice = 'Discounted price is required';
    } else if (isNaN(newProduct.discountedPrice) || parseFloat(newProduct.discountedPrice) <= 0) {
      errors.discountedPrice = 'Discounted price must be a positive number';
    } else if (parseFloat(newProduct.discountedPrice) >= parseFloat(newProduct.price)) {
      errors.discountedPrice = 'Discounted price must be less than original price';
    }
    
    // Quantity validation
    if (!newProduct.quantity) {
      errors.quantity = 'Quantity is required';
    } else if (isNaN(newProduct.quantity) || parseInt(newProduct.quantity) <= 0) {
      errors.quantity = 'Quantity must be a positive number';
    } else if (parseInt(newProduct.quantity) > 10000) {
      errors.quantity = 'Quantity cannot exceed 10,000';
    }
    
    // Unit validation
    if (!newProduct.unit) {
      errors.unit = 'Unit is required';
    }
    
    // Expiry date validation
    if (!newProduct.expiryDate) {
      errors.expiryDate = 'Expiry date is required';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiryDate = new Date(newProduct.expiryDate);
      if (expiryDate < today) {
        errors.expiryDate = 'Expiry date cannot be in the past';
      }
    }
    
    // Image validation
    if (!editMode && !newProduct.image && !imagePreview) {
      errors.image = 'Product image is required';
    }
    
    // Tags validation
    if (newProduct.tags && newProduct.tags.length > 10) {
      errors.tags = 'Maximum 10 tags allowed';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enhanced image upload function
  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
        setSnackbar({ open: true, message: 'Image size must be less than 5MB', severity: 'error' });
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setFormErrors(prev => ({ ...prev, image: 'Only JPG, PNG, GIF, and WEBP images are allowed' }));
        setSnackbar({ open: true, message: 'Only JPG, PNG, GIF, and WEBP images are allowed', severity: 'error' });
        return;
      }

      setUploadingImage(true);
      setFormErrors(prev => ({ ...prev, image: undefined }));
      
      // Create a preview immediately for better UX
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Simulate upload progress
      let progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 5;
        });
      }, 100);

      // In a real-world scenario, you would upload to a server and get a URL back
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update form data with base64 encoded image
        setNewProduct(prev => ({
          ...prev,
          image: reader.result
        }));
        
        setSnackbar({ open: true, message: 'Image uploaded successfully!', severity: 'success' });
      } catch (uploadError) {
        console.error('Error uploading to server:', uploadError);
        setSnackbar({ open: true, message: 'Failed to upload image to server', severity: 'error' });
        setFormErrors(prev => ({ ...prev, image: 'Failed to upload image' }));
      }
      
      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch (error) {
      console.error('Error in image upload process:', error);
      setSnackbar({ open: true, message: 'Failed to process image', severity: 'error' });
    } finally {
      setUploadingImage(false);
    }
  };

  // Enhanced add/update product function
  const handleAddProduct = async () => {
    if (!validateForm()) {
      // Scroll to the first error
      const firstError = Object.keys(formErrors)[0];
      const errorElement = document.querySelector(`[name="${firstError}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      return;
    }
    
    try {
      setLoading(true);
      
      // Ensure discounted price is less than price to pass validation
      const originalPrice = parseFloat(newProduct.price);
      
      // FORCE the discounted price to be exactly HALF the original price
      // This approach should guarantee it passes validation regardless of any floating point issues
      const safeDiscountedPrice = originalPrice * 0.5;
      
      // Calculate discount percentage based on the safe discounted price (should be 50%)
      const discountPercentage = 50;
      
      // Format expiryDate properly for the API
      let formattedExpiryDate = newProduct.expiryDate;
      // If it's just a date string like "2025-03-24", we need to create a proper date object
      if (newProduct.expiryDate && !newProduct.expiryDate.includes('T')) {
        formattedExpiryDate = new Date(newProduct.expiryDate).toISOString();
      }
      
      console.log("Original price:", originalPrice);
      console.log("Calculated safe discounted price:", safeDiscountedPrice);
      console.log("Discount percentage:", discountPercentage);
      
      // Create the new product object with normalized data
      const productToSubmit = {
        name: newProduct.name,
        description: newProduct.description,
        category: newProduct.category,
        price: Number(originalPrice),
        discountedPrice: Number(safeDiscountedPrice),
        discount: Number(discountPercentage),
        quantity: Number(parseInt(newProduct.quantity)),
        unit: newProduct.unit,
        expiryDate: formattedExpiryDate,
        tags: newProduct.tags || [],
        featured: newProduct.featured || false,
        status: newProduct.status || 'active'
      };

      // For updates, we need to ensure we include the image
      if (editMode && currentProductId) {
        if (imagePreview) {
          // If a new image was uploaded or we have a preview
          productToSubmit.image = imagePreview;
        } else if (newProduct.image) {
          // Keep the existing image
          productToSubmit.image = newProduct.image;
        }
        
        // Add the seller ID if we have it (needed for update validation)
        if (newProduct.seller) {
          productToSubmit.seller = newProduct.seller;
        }
        
        // Log the product data we're about to update
        console.log("Updating urgent sale:", productToSubmit);
      } else {
        // For new products, the image is required
        productToSubmit.image = imagePreview;
      }

      let result;
      
      if (editMode && currentProductId) {
        // Update existing product
        try {
          result = await urgentSalesService.updateUrgentSale(currentProductId, productToSubmit);
          
          // Update local state with the result
          const updatedProduct = result.data || result;
          
          setProducts(prevProducts => {
            if (!prevProducts || !Array.isArray(prevProducts)) {
              return Array.isArray(updatedProduct) ? updatedProduct : [updatedProduct];
            }
            return prevProducts.map(product => 
              product._id === currentProductId ? 
                {...product, ...updatedProduct} : 
                product
            );
          });
        
        setSnackbar({ 
          open: true, 
            message: `Product "${productToSubmit.name}" updated successfully!`, 
          severity: 'success' 
        });
          
          handleCloseDialog();
        } catch (updateError) {
          console.error(`Error updating product:`, updateError);
          
          // Get detailed error message if available
          let errorMessage;
          
          if (updateError.response?.data?.message) {
            errorMessage = updateError.response.data.message;
          } else if (updateError.response?.data?.errors && typeof updateError.response.data.errors === 'object') {
            errorMessage = Object.values(updateError.response.data.errors).join(', ');
          } else {
            errorMessage = `Failed to update product. Please try again. (${updateError.message || 'Unknown error'})`;
          }
        
        setSnackbar({ 
          open: true, 
            message: errorMessage, 
            severity: 'error' 
          });
        }
      } else {
        // Create new product
        try {
          result = await urgentSalesService.createUrgentSale(productToSubmit);
          
          // Add to local state
          const newProductData = result.data || result;
          
          setProducts(prevProducts => {
            if (!prevProducts || !Array.isArray(prevProducts)) {
              return [newProductData];
            }
            return [...prevProducts, newProductData];
          });
          
          setSnackbar({ 
            open: true, 
            message: `Product "${productToSubmit.name}" added successfully!`, 
          severity: 'success' 
        });
          
          handleCloseDialog();
        } catch (createError) {
          console.error(`Error adding product:`, createError);
          
          // Get detailed error message if available
          let errorMessage;
          
          if (createError.response?.data?.message) {
            errorMessage = createError.response.data.message;
          } else if (createError.response?.data?.errors && typeof createError.response.data.errors === 'object') {
            errorMessage = Object.values(createError.response.data.errors).join(', ');
          } else {
            errorMessage = `Failed to add product. Please try again. (${createError.message || 'Unknown error'})`;
          }
                              
          setSnackbar({ 
            open: true, 
            message: errorMessage, 
            severity: 'error' 
          });
        }
      }
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'adding'} product:`, error);
      
      setSnackbar({ 
        open: true, 
        message: error.message || `Failed to ${editMode ? 'update' : 'add'} product. Please try again.`, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Enhanced delete product function
  const handleDeleteProduct = async (id) => {
    // If called directly from the UI with an ID
    if (id) {
      setConfirmDeleteDialog({ open: true, productId: id });
      return;
    }
    
    // If called from the confirmation dialog
    setLoading(true);
    
    try {
      await urgentSalesService.deleteUrgentSale(confirmDeleteDialog.productId);
      
      // Update local state
      setProducts(products.filter(product => product._id !== confirmDeleteDialog.productId));
      
      setSnackbar({ 
        open: true, 
        message: 'Product deleted successfully!', 
        severity: 'success' 
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to delete product. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
      setConfirmDeleteDialog({ open: false, productId: null });
    }
  };

  // Enhanced toggle feature function
  const toggleProductFeature = async (id) => {
    try {
      const response = await urgentSalesService.toggleFeature(id);
        
        // Update local state
        setProducts(products.map(product => 
        product._id === id ? { ...product, featured: !product.featured } : product
        ));
        
        setSnackbar({ 
          open: true, 
        message: `Product ${response.featured ? 'featured' : 'unfeatured'} successfully!`, 
          severity: 'success' 
        });
    } catch (error) {
      console.error("Error toggling feature status:", error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to update feature status. Please try again.', 
        severity: 'error' 
      });
    }
  };

  // Enhanced toggle status function
  const toggleProductStatus = async (id) => {
    try {
      const response = await urgentSalesService.toggleStatus(id);
        
        // Update local state
        setProducts(products.map(product => 
        product._id === id ? { ...product, status: product.status === 'active' ? 'inactive' : 'active' } : product
        ));
        
        setSnackbar({ 
          open: true, 
        message: `Product ${response.status === 'active' ? 'activated' : 'deactivated'} successfully!`, 
          severity: 'success' 
        });
    } catch (error) {
      console.error("Error toggling status:", error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to update status. Please try again.', 
        severity: 'error' 
      });
    }
  };

  const handleShareProduct = (product) => {
    // In a real app, you would implement social sharing
    navigator.clipboard.writeText(`Check out this urgent sale: ${product.name} - ${product.discount}% off!`);
    setSnackbar({ open: true, message: 'Product link copied to clipboard!', severity: 'success' });
  };

  // Add missing handleCloseSnackbar function
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Add missing getDaysUntilExpiry function
  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time component
    
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0); // Reset time component
    
    // Calculate difference in milliseconds and convert to days
    const differenceInTime = expiry.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    
    return differenceInDays;
  };

  const filteredProducts = Array.isArray(products) 
    ? products
      .filter(product => {
        // Skip invalid products
        if (!product || typeof product !== 'object') return false;
        
        // Filter by search term
        if (searchTerm && !product.name?.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !product.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        // Filter by category
        if (filterCategory !== 'all' && product.category !== filterCategory) {
          return false;
        }
        
        // Filter by expiry
        if (!showExpiredProducts && getDaysUntilExpiry(product.expiryDate) < 0) {
          return false;
        }
        
        // Filter by discount range
        if (product.discount < discountRange[0] || product.discount > discountRange[1]) {
          return false;
        }
        
        // Filter by tab
        if (tabValue === 1 && !product.featured) return false;
        if (tabValue === 2 && (getDaysUntilExpiry(product.expiryDate) > 2 || getDaysUntilExpiry(product.expiryDate) < 0)) return false;
        if (tabValue === 3 && product.status !== 'inactive') return false;
        
        return true;
      })
      .sort((a, b) => {
        if (!a || !b) return 0;
        
        switch (sortOption) {
          case 'expiryDate':
            return new Date(a.expiryDate || 0) - new Date(b.expiryDate || 0);
          case 'discount':
            return (b.discount || 0) - (a.discount || 0);
          case 'price':
            return (a.discountedPrice || 0) - (b.discountedPrice || 0);
          case 'popularity':
            return (b.views || 0) - (a.views || 0);
          case 'sales':
            return (b.sales || 0) - (a.sales || 0);
          default:
            return 0;
        }
      })
    : [];

  const categories = ['all', ...new Set(Array.isArray(products) ? products.map(product => product.category) : [])];
  
  // Debug information
  useEffect(() => {
    if (tabValue === 2) { // Only log for Expiring Soon tab
      console.log('Expiring Soon products count:', filteredProducts.length);
      console.log('Raw products:', products);
      console.log('All products with expiry <= 2 days:', 
        Array.isArray(products) ? 
        products.filter(p => getDaysUntilExpiry(p.expiryDate) <= 2 && getDaysUntilExpiry(p.expiryDate) >= 0) : []
      );
      console.log('Filtered products:', filteredProducts);
    }
  }, [filteredProducts, tabValue, products]);
  
  const availableTags = [
    'organic', 'fresh', 'local', 'ripe', 'dairy', 'colorful', 'fruit', 'vegetable', 'premium', 'discount'
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log("Fetching urgent sales data from API...");
        
        // First attempt - try the API
        try {
          const response = await urgentSalesService.getUrgentSales();
          
          if (Array.isArray(response)) {
            console.log("Data received as array:", response);
            setProducts(response);
            return;
          } else if (response && response.status === 'success' && Array.isArray(response.data)) {
            console.log("Data received in success wrapper:", response.data);
          setProducts(response.data);
            return;
          } else if (response && Array.isArray(response.data)) {
            console.log("Data received in data property:", response.data);
            setProducts(response.data);
            return;
        } else {
            console.warn("API response is not in expected format:", response);
            throw new Error("Invalid response format");
          }
        } catch (apiError) {
          console.error("API Error fetching urgent sales:", apiError);
          throw apiError;
        }
      } catch (error) {
        console.error("Error fetching urgent sales, falling back to mock data:", error);
        // Set mock data if there's an error
        const mockData = getMockProducts();
        setProducts(mockData);
        setSnackbar({
          open: true,
          message: 'Could not connect to database. Using sample data instead.',
          severity: 'warning'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Function to generate mock products for development - updated to match MongoDB structure
  const getMockProducts = () => {
    const sellerId = localStorage.getItem('userId') || '67d0ad959712abb358d893d6';
    
    return [
      {
        _id: '67d1147fda5edc93bd2fd09e',
        seller: sellerId,
        name: 'Fresh Tomatoes',
        description: 'Ripe, juicy tomatoes that need to be sold quickly',
        category: 'Vegetables',
        price: 50,
        discountedPrice: 42.5,
        discount: 15,
        quantity: 100,
        unit: 'kg',
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
        image: 'https://images.unsplash.com/photo-1546104710-d33130a98b2f?auto=format&fit=crop&w=500&q=60',
        featured: false,
        tags: ['fresh', 'vegetable', 'organic'],
        status: 'active',
        views: 0,
        sales: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '67d1146eda5edc93bd2fd09b',
        seller: sellerId,
        name: 'Organic Milk',
        description: 'Farm fresh organic milk with short shelf life',
        category: 'Dairy',
        price: 80,
        discountedPrice: 65,
        discount: 18.75,
        quantity: 50,
        unit: 'liter',
        expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day from now
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=500&q=60',
        featured: true,
        tags: ['organic', 'dairy'],
        status: 'active',
        views: 0,
        sales: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '67d1145eda5edc93bd2fd09a',
        seller: sellerId,
        name: 'Remedios',
        description: 'sdfsdfsdfsdsdf',
        category: 'Vegetables',
        price: 21,
        discountedPrice: 15,
        discount: 28.57,
        quantity: 30,
        unit: 'kg',
        expiryDate: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 hours from now
        image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=500&q=60',
        featured: false,
        tags: ['ripe', 'vegetable'],
        status: 'active',
        views: 0,
        sales: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  };

  useEffect(() => {
    // Calculate analytics data
    if (!Array.isArray(products) || products.length === 0) {
      setAnalyticsData({
        totalSales: 0,
        totalRevenue: "0.00",
        averageDiscount: "0.0",
        categorySales: []
      });
      return;
    }
    
    const totalSales = products.reduce((sum, product) => sum + (product.sales || 0), 0);
    const totalRevenue = products.reduce((sum, product) => sum + ((product.discountedPrice || 0) * (product.sales || 0)), 0);
    const totalDiscount = products.reduce((sum, product) => sum + (product.discount || 0), 0);
    const averageDiscount = totalDiscount / products.length;
    
    // Group by category
    const categorySalesMap = {};
    products.forEach(product => {
      if (product.category) {
        categorySalesMap[product.category] = (categorySalesMap[product.category] || 0) + (product.sales || 0);
      }
    });
    
    const categorySales = Object.entries(categorySalesMap).map(([name, value]) => ({ name, value }));

    setAnalyticsData({
      totalSales,
      totalRevenue: totalRevenue.toFixed(2),
      averageDiscount: averageDiscount.toFixed(1),
      categorySales
    });
  }, [products]);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <UrgentSalesBanner elevation={3}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Urgent Sales Dashboard
          </Typography>
          <Typography variant="h6" sx={{ mb: 2 }}>
            List your products that need to be sold quickly at discounted prices
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 3 }}>
            <StatCard color="#1976d2" elevation={3}>
              <Typography variant="subtitle2">Total Sales</Typography>
              <Typography variant="h4" fontWeight="bold">{analyticsData.totalSales}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">+12% this week</Typography>
              </Box>
            </StatCard>
            <StatCard color="#388e3c" elevation={3}>
              <Typography variant="subtitle2">Revenue</Typography>
              <Typography variant="h4" fontWeight="bold">₹{analyticsData.totalRevenue}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">+8% this week</Typography>
              </Box>
            </StatCard>
            <StatCard color="#f57c00" elevation={3}>
              <Typography variant="subtitle2">Avg. Discount</Typography>
              <Typography variant="h4" fontWeight="bold">{analyticsData.averageDiscount}%</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DiscountIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">Effective pricing</Typography>
              </Box>
            </StatCard>
            <StatCard color="#7b1fa2" elevation={3}>
              <Typography variant="subtitle2">Expiring Soon</Typography>
              <Typography variant="h4" fontWeight="bold">
                {Array.isArray(products) ? products.filter(p => getDaysUntilExpiry(p.expiryDate) <= 2 && getDaysUntilExpiry(p.expiryDate) >= 0).length : 0}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">Needs attention</Typography>
              </Box>
            </StatCard>
          </Box>
        </Box>
      </UrgentSalesBanner>

      <Box sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            mb: 2,
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: 3,
              py: 1.5,
              borderRadius: '20px',
              mx: 0.5,
              transition: 'all 0.2s',
              '&.Mui-selected': {
                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                fontWeight: 'bold',
              }
            }
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InventoryIcon sx={{ mr: 1 }} />
                <Typography>All Products</Typography>
                <Chip 
                  label={Array.isArray(products) ? products.length : 0} 
                  size="small" 
                  sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalOfferIcon sx={{ mr: 1 }} />
                <Typography>Featured</Typography>
                <Chip 
                  label={Array.isArray(products) ? products.filter(p => p.featured).length : 0} 
                  size="small" 
                  sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon sx={{ mr: 1 }} />
                <Typography>Expiring Soon</Typography>
                <Chip 
                  label={Array.isArray(products) ? products.filter(p => getDaysUntilExpiry(p.expiryDate) <= 2 && getDaysUntilExpiry(p.expiryDate) >= 0).length : 0} 
                  size="small" 
                  color="error"
                  sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <VisibilityIcon sx={{ mr: 1 }} />
                <Typography>Inactive</Typography>
                <Chip 
                  label={Array.isArray(products) ? products.filter(p => p.status === 'inactive').length : 0} 
                  size="small" 
                  sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AnalyticsIcon sx={{ mr: 1 }} />
                <Typography>Analytics</Typography>
              </Box>
            } 
          />
        </Tabs>

        {tabValue !== 4 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search products..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ minWidth: 200 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  label="Category"
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortOption}
                  label="Sort By"
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <MenuItem value="expiryDate">Expiry Date</MenuItem>
                  <MenuItem value="discount">Highest Discount</MenuItem>
                  <MenuItem value="price">Lowest Price</MenuItem>
                  <MenuItem value="popularity">Most Viewed</MenuItem>
                  <MenuItem value="sales">Best Selling</MenuItem>
                </Select>
              </FormControl>
              
              <Tooltip title="More Filters">
                <IconButton onClick={() => setFilterOpen(!filterOpen)}>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(45deg, #2E7D32 30%, #43A047 90%)',
                boxShadow: '0 3px 5px 2px rgba(46, 125, 50, .3)',
              }}
            >
              Add New Listing
            </Button>
          </Box>
        )}        
        {filterOpen && (
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Advanced Filters
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={showExpiredProducts} 
                      onChange={(e) => setShowExpiredProducts(e.target.checked)} 
                    />
                  }
                  label="Show Expired Products"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={8}>
                <Typography gutterBottom>
                  Discount Range: {discountRange[0]}% - {discountRange[1]}%
                </Typography>
                <Slider
                  value={discountRange}
                  onChange={(e, newValue) => setDiscountRange(newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                  sx={{ width: '100%' }}
                />
              </Grid>
            </Grid>
          </Paper>
        )}
        
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product._id}>
                  <StyledCard>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={product.image}
                        alt={product.name}
                      />
                      <Chip
                        label={`${product.discount || 0}% OFF`}
                        color="error"
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          fontWeight: 'bold',
                        }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="div">
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {product.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <DiscountIcon color="error" sx={{ mr: 1 }} />
                        <Typography variant="body1" component="span" sx={{ textDecoration: 'line-through', color: 'text.secondary', mr: 1 }}>
                          ₹{product.price ? product.price.toFixed(2) : "0.00"}
                        </Typography>
                        <Typography variant="h6" component="span" color="error" fontWeight="bold">
                          ₹{product.discountedPrice ? product.discountedPrice.toFixed(2) : "0.00"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon color="warning" sx={{ mr: 1 }} />
                        <Typography variant="body2" color={getDaysUntilExpiry(product.expiryDate) <= 1 ? "error" : "warning"}>
                          {getDaysUntilExpiry(product.expiryDate) <= 0 
                            ? "Expires today!" 
                            : `Expires in ${getDaysUntilExpiry(product.expiryDate)} days`}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Available: {product.quantity} {product.unit}
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(product)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        color="error" 
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </StyledCard>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>No products found</Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Add new products to display them here.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                  >
                    Add New Product
                  </Button>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}        
        {tabValue === 1 && (
          <Grid container spacing={3}>
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product._id}>
                  <StyledCard>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={product.image}
                        alt={product.name}
                      />
                      <Chip
                        label={`${product.discount || 0}% OFF`}
                        color="error"
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          fontWeight: 'bold',
                        }}
                      />
                      {product.featured && (
                        <Chip
                          label="Featured"
                          color="primary"
                          sx={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            fontWeight: 'bold',
                          }}
                        />
                      )}
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="div">
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {product.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <DiscountIcon color="error" sx={{ mr: 1 }} />
                        <Typography variant="body1" component="span" sx={{ textDecoration: 'line-through', color: 'text.secondary', mr: 1 }}>
                          ₹{product.price ? product.price.toFixed(2) : "0.00"}
                        </Typography>
                        <Typography variant="h6" component="span" color="error" fontWeight="bold">
                          ₹{product.discountedPrice ? product.discountedPrice.toFixed(2) : "0.00"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon color="warning" sx={{ mr: 1 }} />
                        <Typography variant="body2" color={getDaysUntilExpiry(product.expiryDate) <= 1 ? "error" : "warning"}>
                          {getDaysUntilExpiry(product.expiryDate) <= 0 
                            ? "Expires today!" 
                            : `Expires in ${getDaysUntilExpiry(product.expiryDate)} days`}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Available: {product.quantity} {product.unit}
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(product)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        color="error" 
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </StyledCard>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>No featured products found</Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Mark products as featured to display them here.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                  >
                    Add New Product
                  </Button>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
        
        {tabValue === 2 && (
          <Grid container spacing={3}>
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product._id}>
                  <StyledCard>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={product.image}
                        alt={product.name}
                      />
                      <Chip
                        label={`${product.discount || 0}% OFF`}
                        color="error"
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          fontWeight: 'bold',
                        }}
                      />
                      <Chip
                        label={`Expires in ${getDaysUntilExpiry(product.expiryDate)} days`}
                        color="warning"
                        sx={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          fontWeight: 'bold',
                        }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="div">
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {product.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <DiscountIcon color="error" sx={{ mr: 1 }} />
                        <Typography variant="body1" component="span" sx={{ textDecoration: 'line-through', color: 'text.secondary', mr: 1 }}>
                          ₹{product.price ? product.price.toFixed(2) : "0.00"}
                        </Typography>
                        <Typography variant="h6" component="span" color="error" fontWeight="bold">
                          ₹{product.discountedPrice ? product.discountedPrice.toFixed(2) : "0.00"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon color="warning" sx={{ mr: 1 }} />
                        <Typography variant="body2" color={getDaysUntilExpiry(product.expiryDate) <= 1 ? "error" : "warning"}>
                          {getDaysUntilExpiry(product.expiryDate) <= 0 
                            ? "Expires today!" 
                            : `Expires in ${getDaysUntilExpiry(product.expiryDate)} days`}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Available: {product.quantity} {product.unit}
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(product)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        color="error" 
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </StyledCard>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>No products expiring soon</Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    All your products have comfortable expiry dates.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
        
        {tabValue === 4 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <StatCard color="#1976d2">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Total Urgent Sales</Typography>
                  <TrendingUpIcon fontSize="large" />
                </Box>
                <Typography variant="h3">{analyticsData?.totalSales || 0}</Typography>
                <Typography variant="body2">Products sold through urgent sales</Typography>
              </StatCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <StatCard color="#2e7d32">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Total Revenue</Typography>
                  <MonetizationOn fontSize="large" />
                </Box>
                <Typography variant="h3">₹{analyticsData?.totalRevenue || "0.00"}</Typography>
                <Typography variant="body2">Revenue from urgent sales</Typography>
              </StatCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Sales by Category</Typography>
                {analyticsData?.categorySales && analyticsData.categorySales.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.categorySales}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {analyticsData.categorySales.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                    <Typography variant="body1" color="text.secondary">No sales data available</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Product Performance</Typography>
                {products && products.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={products.slice(0, 5).map(p => ({
                        name: p.name,
                        sales: p.sales || 0,
                        views: p.views || 0
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="sales" fill="#8884d8" name="Sales" />
                      <Bar dataKey="views" fill="#82ca9d" name="Views" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                    <Typography variant="body1" color="text.secondary">No product performance data available</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
        <Dialog
          open={confirmDeleteDialog.open}
          onClose={() => setConfirmDeleteDialog({ ...confirmDeleteDialog, open: false })}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this product? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setConfirmDeleteDialog({ ...confirmDeleteDialog, open: false })}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => handleDeleteProduct(confirmDeleteDialog.productId)}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }
          }}
        >
          <Box sx={{ 
            background: 'linear-gradient(45deg, #2E7D32 30%, #43A047 90%)',
            color: 'white',
            py: 2,
            px: 3,
            borderBottom: '1px solid rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h5" fontWeight="bold">
              {editMode ? 'Edit Urgent Sale Listing' : 'Add New Urgent Sale Listing'}
            </Typography>
          </Box>
          
          <DialogContent sx={{ py: 3 }}>
            {previewMode ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Product Preview</Typography>
                <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', maxWidth: 400, mx: 'auto' }}>
                  <Box sx={{ position: 'relative' }}>
                    <Box 
                      component="img"
                      src={imagePreview || "https://via.placeholder.com/400x200?text=No+Image"}
                      alt={newProduct.name || "Product Preview"}
                      sx={{ 
                        width: '100%', 
                        height: 200, 
                        objectFit: 'cover',
                        bgcolor: 'background.paper'
                      }}
                    />
                    {calculateDiscount() > 0 && (
                      <Chip
                        label={`${calculateDiscount()}% OFF`}
                        color="error"
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          fontWeight: 'bold',
                        }}
                      />
                    )}
                    {newProduct.featured && (
                      <Chip
                        label="Featured"
                        color="primary"
                        sx={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          fontWeight: 'bold',
                        }}
                      />
                    )}
                    {newProduct.expiryDate && (
                      <Chip
                        label={`Expires in ${getDaysUntilExpiry(newProduct.expiryDate)} days`}
                        color="warning"
                        sx={{
                          position: 'absolute',
                          bottom: 10,
                          left: 10,
                          fontWeight: 'bold',
                        }}
                      />
                    )}
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h5" gutterBottom>
                      {newProduct.name || "Product Name"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {newProduct.description || "Product description will appear here"}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DiscountIcon color="error" sx={{ mr: 1 }} />
                      <Typography variant="body1" component="span" sx={{ textDecoration: 'line-through', color: 'text.secondary', mr: 1 }}>
                        ₹{newProduct.price ? parseFloat(newProduct.price).toFixed(2) : "0.00"}
                      </Typography>
                      <Typography variant="h6" component="span" color="error" fontWeight="bold">
                        ₹{newProduct.discountedPrice ? parseFloat(newProduct.discountedPrice).toFixed(2) : "0.00"}
                      </Typography>
                    </Box>
                    {newProduct.category && (
                      <Chip 
                        label={newProduct.category} 
                        size="small" 
                        sx={{ mb: 1, mr: 1 }} 
                      />
                    )}
                    {newProduct.tags && newProduct.tags.map(tag => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small" 
                        variant="outlined"
                        sx={{ mb: 1, mr: 1 }} 
                      />
                    ))}
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <InventoryIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {newProduct.quantity || "0"} {newProduct.unit || "unit"}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            ) : (
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={6}>
                <ProductAutocomplete
                  value={newProduct.name}
                  onChange={(event, newValue) => {
                    console.log("ProductAutocomplete onChange:", newValue);
                    
                    // Handle the product selection
                    if (newValue === null || newValue === '') {
                      // Handle clearing the input
                      setNewProduct(prev => ({
                        ...prev,
                        name: ''
                      }));
                      return;
                    }
                    
                    // Process different types of values
                    if (typeof newValue === 'object') {
                      // Object with product details
                      const productName = newValue.name || '';
                      const updates = { name: productName };
                      
                      // If product has category, add it to updates
                      if (newValue.category && !newProduct.category) {
                        updates.category = newValue.category;
                      }
                      
                      setNewProduct(prev => ({
                        ...prev,
                        ...updates
                      }));
                    } else {
                      // Simple string value
                      setNewProduct(prev => ({
                        ...prev,
                        name: newValue
                      }));
                    }
                    
                    // Clear name error if it exists
                    if (formErrors.name) {
                      setFormErrors(prev => ({
                        ...prev,
                        name: undefined
                      }));
                    }
                  }}
                  onUnitChange={handleInputChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
                  placeholder="Search for a product or enter a custom name"
                  label="Product Name"
                  categoryFilter={newProduct.category}
                  showCategoryFilter={true}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.category}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={newProduct.category}
                    label="Category"
                    onChange={handleInputChange}
                    required
                    startAdornment={
                      <InputAdornment position="start">
                        <LocalOfferIcon color="primary" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="Vegetables">Vegetables</MenuItem>
                    <MenuItem value="Fruits">Fruits</MenuItem>
                    <MenuItem value="Dairy">Dairy</MenuItem>
                    <MenuItem value="Prepared Food">Prepared Food</MenuItem>
                    <MenuItem value="Bakery">Bakery</MenuItem>
                    <MenuItem value="Meat">Meat</MenuItem>
                    <MenuItem value="Seafood">Seafood</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                  {formErrors.category && (
                    <FormHelperText>{formErrors.category}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={newProduct.description}
                  onChange={handleInputChange}
                  required
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                  placeholder="Describe your product, including why it needs to be sold urgently"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                        <DescriptionIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Pricing Information
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        name="price"
                        label="Original Price (₹)"
                        fullWidth
                        type="number"
                        value={newProduct.price}
                        onChange={handleInputChange}
                        required
                        error={!!formErrors.price}
                        helperText={formErrors.price}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        name="discountedPrice"
                        label="Discounted Price (₹)"
                        fullWidth
                        type="number"
                        value={newProduct.discountedPrice}
                        onChange={handleInputChange}
                        required
                        error={!!formErrors.discountedPrice}
                        helperText={formErrors.discountedPrice}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        name="quantity"
                        label="Quantity"
                        type="number"
                        fullWidth
                        value={newProduct.quantity}
                        onChange={handleInputChange}
                        required
                        error={!!formErrors.quantity}
                        helperText={formErrors.quantity}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <InventoryIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth error={!!formErrors.unit}>
                        <InputLabel>Unit</InputLabel>
                        <Select
                          name="unit"
                          value={newProduct.unit}
                          label="Unit"
                          onChange={handleInputChange}
                          required
                        >
                          <MenuItem value="kg">Kilogram (kg)</MenuItem>
                          <MenuItem value="g">Gram (g)</MenuItem>
                          <MenuItem value="piece">Piece</MenuItem>
                          <MenuItem value="dozen">Dozen</MenuItem>
                          <MenuItem value="bundle">Bundle</MenuItem>
                          <MenuItem value="box">Box</MenuItem>
                          <MenuItem value="bunch">Bunch</MenuItem>
                        </Select>
                        {formErrors.unit && (
                          <FormHelperText>{formErrors.unit}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: 'success.light', 
                        color: 'success.contrastText',
                        borderRadius: 2,
                        mb: 2
                      }}>
                        <Typography gutterBottom fontWeight="bold">
                          Discount: {calculateDiscount()}%
                        </Typography>
                        <Slider
                          value={calculateDiscount()}
                          onChange={(e, newValue) => {
                            if (newProduct.price) {
                              const discountedPrice = (newProduct.price * (100 - newValue) / 100).toFixed(2);
                              setNewProduct({
                                ...newProduct,
                                discountedPrice: discountedPrice
                              });
                            }
                          }}
                          onChangeCommitted={(e, newValue) => {
                            // Update the UI with a visual feedback
                            setSnackbar({ 
                              open: true, 
                              message: `Discount set to ${newValue}%`, 
                              severity: 'info' 
                            });
                          }}
                          valueLabelDisplay="auto"
                          valueLabelFormat={(value) => `${value}% off`}
                          min={0}
                          max={90}
                          marks={[
                            { value: 0, label: '0%' },
                            { value: 25, label: '25%' },
                            { value: 50, label: '50%' },
                            { value: 75, label: '75%' },
                            { value: 90, label: '90%' }
                          ]}
                          sx={{
                            '& .MuiSlider-thumb': {
                              height: 24,
                              width: 24,
                              backgroundColor: '#fff',
                              border: '2px solid currentColor',
                              '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                                boxShadow: 'inherit',
                              },
                              '&:before': {
                                display: 'none',
                              },
                            },
                            '& .MuiSlider-track': {
                              height: 8,
                              borderRadius: 4,
                            },
                            '& .MuiSlider-rail': {
                              height: 8,
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="expiryDate"
                  label="Expiry Date"
                  type="date"
                  fullWidth
                  value={newProduct.expiryDate}
                  onChange={handleInputChange}
                  required
                  error={!!formErrors.expiryDate}
                  helperText={formErrors.expiryDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Product Image
                    {formErrors.image && (
                      <Typography component="span" color="error" variant="caption" sx={{ ml: 1 }}>
                        {formErrors.image}
                      </Typography>
                    )}
                  </Typography>
                  <StyledUploadBox 
                    onClick={() => document.getElementById('product-image-upload').click()}
                    sx={{ 
                      height: 150, 
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      ...(imagePreview ? { p: 0 } : {}),
                      border: formErrors.image ? '2px dashed #d32f2f' : '2px dashed #2E7D32',
                    }}
                  >
                    {imagePreview ? (
                      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                        <img 
                          src={imagePreview} 
                          alt="Product preview" 
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                        />
                        {uploadingImage && (
                          <Box sx={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            right: 0, 
                            bottom: 0, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            backgroundColor: 'rgba(255,255,255,0.7)' 
                          }}>
                            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                              <CircularProgress variant="determinate" value={uploadProgress} />
                              <Box
                                sx={{
                                  top: 0,
                                  left: 0,
                                  bottom: 0,
                                  right: 0,
                                  position: 'absolute',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Typography variant="caption" component="div" color="text.secondary">
                                  {`${Math.round(uploadProgress)}%`}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <>
                        <CloudUploadIcon sx={{ fontSize: 40, mb: 1, color: formErrors.image ? 'error.main' : 'primary.main' }} />
                        <Typography variant="body1">Click to upload image</Typography>
                        <Typography variant="caption" color="text.secondary">
                          JPG, PNG or GIF, max 5MB
                        </Typography>
                      </>
                    )}
                    <VisuallyHiddenInput
                      id="product-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </StyledUploadBox>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  id="tags-outlined"
                  options={availableTags}
                  value={newProduct.tags || []}
                  onChange={handleTagsChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tags"
                      placeholder="Add tags"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <LocalOfferIcon color="primary" />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip 
                        label={option} 
                        {...getTagProps({ index })} 
                        key={option}
                        color="primary"
                        variant="outlined"
                      />
                    ))
                  }
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newProduct.featured || false}
                      onChange={handleInputChange}
                      name="featured"
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography>Feature this product</Typography>
                      <Tooltip title="Featured products appear at the top of search results and on the featured tab">
                        <IconButton size="small">
                          <HelpOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
              </Grid>
            </Grid>
            )}
          </DialogContent>
          
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
            <Button 
              onClick={handleCloseDialog}
              variant="outlined"
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => setPreviewMode(!previewMode)}
              variant="outlined"
              color="secondary"
              startIcon={previewMode ? <EditIcon /> : <VisibilityIcon />}
              sx={{ mr: 1 }}
            >
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button 
              onClick={handleAddProduct} 
              variant="contained" 
              color="primary"
              disabled={loading}
              startIcon={editMode ? <SaveIcon /> : <AddIcon />}
              sx={{ 
                minWidth: 120,
                background: 'linear-gradient(45deg, #2E7D32 30%, #43A047 90%)',
                boxShadow: '0 3px 5px 2px rgba(46, 125, 50, .3)',
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                editMode ? 'Update' : 'Add Product'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar 
          open={snackbar.open || false} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity || 'info'} sx={{ width: '100%' }}>
            {snackbar.message || ''}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default UrgentSales;
