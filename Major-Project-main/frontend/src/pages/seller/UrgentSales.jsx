import React, { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
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
  FormHelperText,
  LinearProgress,
  CardActions,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
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
import api from '../../services/api.jsx';
import ProductAutocomplete from '../../components/common/ProductAutocomplete';
import * as urgentSalesService from '../../services/urgentSaleService';
import { format, addDays, isAfter } from 'date-fns';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import StarIcon from '@mui/icons-material/Star';
import DialogContentText from '@mui/material/DialogContentText';
import PieChartIcon from '@mui/icons-material/PieChart';

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

// First, add these custom styles near the top of the file where other styles are defined
const customStyles = {
  input: {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#e0e0e0',
        borderRadius: 8,
      },
      '&:hover fieldset': {
        borderColor: '#9e9e9e',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#43A047',
      },
    },
    '& .MuiInputBase-input': {
      padding: '12px 14px',
    },
    '& .MuiInputLabel-root': {
      transform: 'translate(14px, 14px) scale(1)',
    },
    '& .MuiInputLabel-shrink': {
      transform: 'translate(14px, -6px) scale(0.75)',
    },
  },
  select: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 8,
      '& fieldset': {
        borderColor: '#e0e0e0',
      },
    },
    '& .MuiSelect-select': {
      padding: '12px 14px',
    },
  },
  formLabel: {
    fontWeight: 500,
    marginBottom: '6px',
    color: '#424242',
    display: 'block',
  },
  imageUpload: {
    width: '100%',
    height: '100%',
    minHeight: 200,
    borderRadius: 8,
    border: '2px dashed #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: '#43A047',
      backgroundColor: '#f1f8e9',
    },
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    minHeight: 200,
    borderRadius: 8,
    border: '1px solid #e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
    position: 'relative',
  },
  discountTag: {
    background: '#ff5252',
    color: 'white',
    fontWeight: 'bold',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '12px',
    position: 'absolute',
    right: 10,
    top: 10,
  }
};

const UrgentSales = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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
  const [confirmSellDialog, setConfirmSellDialog] = useState({ 
    open: false, 
    productId: null, 
    productName: '', 
    quantity: 1,
    maxQuantity: 1,
    error: ''
  });

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
    if (!newProduct.price || !newProduct.discountedPrice) return 0;
    
    const price = parseFloat(newProduct.price);
    const discountedPrice = parseFloat(newProduct.discountedPrice);
    
    if (isNaN(price) || isNaN(discountedPrice) || price <= 0) return 0;
    
    const discount = ((price - discountedPrice) / price) * 100;
      return Math.round(discount);
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

  // Add the missing handleImageClick function
  const handleImageClick = () => {
    // Trigger the file input's click event
    document.getElementById('product-image-upload').click();
  };

  // Rename handleImageUpload to handleImageChange to match the references in JSX
  const handleImageChange = async (e) => {
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
      setUploadProgress(0);
      
      // Create a preview immediately for better UX
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Simulate upload progress
      let progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 98) {
            clearInterval(progressInterval);
            return 98;
          }
          return prev + 10; // Faster progress simulation
        });
      }, 200);

      // In a real-world scenario, you would upload to a server and get a URL back
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Update form data with base64 encoded image
        setNewProduct(prev => ({
          ...prev,
          image: reader.result
        }));
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        setSnackbar({ open: true, message: 'Image uploaded successfully!', severity: 'success' });
      } catch (uploadError) {
        console.error('Error uploading to server:', uploadError);
        setSnackbar({ open: true, message: 'Failed to upload image to server', severity: 'error' });
        setFormErrors(prev => ({ ...prev, image: 'Failed to upload image' }));
      clearInterval(progressInterval);
      }
    } catch (error) {
      console.error('Error in image upload process:', error);
      setSnackbar({ open: true, message: 'Failed to process image', severity: 'error' });
    } finally {
      setUploadingImage(false);
    }
  };

  // Keep the original handleImageUpload function as is, but mark it as deprecated
  // This is to avoid breaking any existing code that might be using it
  const handleImageUpload = (e) => {
    // Call the renamed function
    handleImageChange(e);
  };

  // Enhanced add/update product function
  const handleAddProduct = async () => {
    // Validate form before proceeding
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please correct the errors in the form',
        severity: 'error'
      });
      return;
    }
    
    setSubmitting(true);
    setErrorMessage('');
    
    try {
      // Prepare date for submission
      let expiryDate = newProduct.expiryDate;
      if (typeof expiryDate === 'string' && expiryDate) {
        // Keep as is if it's already a string
      } else if (expiryDate instanceof Date) {
        expiryDate = expiryDate.toISOString();
      } else {
        // Default to 3 days from now
        expiryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      }
      
      // Validate and process price values
      const originalPrice = parseFloat(newProduct.price);
      console.log('Original price from form:', originalPrice);
      
      const discountedPrice = parseFloat(newProduct.discountedPrice || 0);
      console.log('Discounted price from form:', discountedPrice);
      
      // Calculate the discount percentage
      const discountPercentage = calculateDiscount();
      
      // Create the new product object with normalized data
      const productToSubmit = {
        name: newProduct.name,
        description: newProduct.description,
        category: newProduct.category,
        price: originalPrice,
        discountedPrice: discountedPrice,
        discount: discountPercentage,
        quantity: parseInt(newProduct.quantity),
        unit: newProduct.unit || 'kg',
        expiryDate: expiryDate,
        tags: newProduct.tags || [],
        featured: newProduct.featured || false,
        status: newProduct.status || 'active'
      };

      console.log('Product being submitted:', productToSubmit);
      
      // For products with images
      if (imagePreview) {
        productToSubmit.image = imagePreview;
        console.log('Image URL being submitted:', imagePreview.substring(0, 50) + '...');
      }
      
      let response;
      
      // Check if we're editing an existing product or creating a new one
      if (editMode && currentProductId) {
        console.log(`Updating urgent sale with ID: ${currentProductId}`);
        // Update existing product
        response = await urgentSalesService.updateUrgentSale(currentProductId, productToSubmit);
        console.log('API response from updateUrgentSale:', response);
      } else {
        // Create new product
        console.log('Creating new urgent sale');
        response = await urgentSalesService.createUrgentSale(productToSubmit);
        console.log('API response from createUrgentSale:', response);
      }
      
      // Process the response
      if (response && (response.data || response._id)) {
        // Refresh the product list to get updated data from the database
        fetchProducts();
        
        // Reset the form
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
        setOpenDialog(false);
        
        // Show success message
        setSnackbar({ 
          open: true, 
          message: editMode ? 'Product updated successfully' : 'Product added successfully',
          severity: 'success' 
        });
      } else {
        console.error('Failed to process product: Invalid response', response);
        setErrorMessage(`Failed to ${editMode ? 'update' : 'add'} product. Please try again.`);
      }
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'adding'} product:`, error);
      
      // Get more meaningful error message from response if available
      let errorMsg = `Failed to ${editMode ? 'update' : 'add'} product. Please try again.`;
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
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
      console.log(`Attempting to delete urgent sale with ID: ${confirmDeleteDialog.productId}`);
      const response = await urgentSalesService.deleteUrgentSale(confirmDeleteDialog.productId);
      console.log('Delete response:', response);
      
      // Update local state only after successful deletion
      setProducts(products.filter(product => product._id !== confirmDeleteDialog.productId));
      
      setSnackbar({ 
        open: true, 
        message: 'Product deleted successfully!', 
        severity: 'success' 
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      
      // Get more meaningful error message from response if available
      let errorMessage = 'Failed to delete product. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
      setConfirmDeleteDialog({ open: false, productId: null });
    }
  };

  // Add a separate function for confirming deletion
  const confirmDelete = async () => {
    // Don't pass the ID parameter so it will perform the actual deletion
    await handleDeleteProduct();
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

  // First, let's modify the fetchProducts function to properly categorize products based on status and quantity
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      console.log('Fetching urgent sales from database...');
      const response = await urgentSalesService.getUrgentSales();
      console.log('API Response:', response);
      
      // Process the response data
      let urgentSalesData = [];
      let statsData = null;
      
      // Extract data based on API response format
      if (response?.data?.urgentSales) {
        // Format: { data: { urgentSales: [...] } }
        urgentSalesData = response.data.urgentSales;
        statsData = response.data.stats;
      } else if (response?.urgentSales) {
        // Format: { urgentSales: [...] }
        urgentSalesData = response.urgentSales;
        statsData = response.stats;
      } else if (response?.data?.data?.urgentSales) {
        // Format: { data: { data: { urgentSales: [...] } } }
        urgentSalesData = response.data.data.urgentSales;
        statsData = response.data.data.stats;
      } else if (Array.isArray(response)) {
        // Format: Direct array
        urgentSalesData = response;
      } else if (Array.isArray(response?.data)) {
        // Format: { data: [...] }
        urgentSalesData = response.data;
      } else if (response?.data) {
        // Try to use data directly if it's an object
        urgentSalesData = response.data;
      } else {
        // Direct response
        urgentSalesData = response;
      }
      
      // Validate and clean the data to prevent rendering errors
      if (urgentSalesData && Array.isArray(urgentSalesData)) {
        // Filter out any null or undefined items
        urgentSalesData = urgentSalesData.filter(item => item);
        
        // Ensure each item has at least the minimal required properties
        urgentSalesData = urgentSalesData.map(item => ({
          _id: item._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
          name: item.name || 'Unnamed Product',
          description: item.description || 'No description available',
          price: item.price || 0,
          discountedPrice: item.discountedPrice || 0,
          discount: item.discount || 0,
          quantity: item.quantity || 0,
          unit: item.unit || 'units',
          category: item.category || 'Uncategorized',
          expiryDate: item.expiryDate || new Date(),
          image: item.image || 'https://placehold.co/600x400?text=No+Image',
          status: item.status || 'active',
          featured: item.featured || false,
          ...item // Keep all original properties
        }));
        
        // Mark products with zero quantity as sold if not already marked
        urgentSalesData = urgentSalesData.map(product => {
          // If quantity is zero but status is not 'sold', update it
          if (product.quantity <= 0 && product.status !== 'sold') {
            return { ...product, status: 'sold' };
          }
          return product;
        });
        
        console.log(`Loaded ${urgentSalesData.length} urgent sales from database`);
        setProducts(urgentSalesData);
      } else {
        console.warn('No valid urgent sales data found in response');
        setProducts([]);
        setSnackbar({
          open: true,
          message: 'No urgent sales found. Create your first listing!',
          severity: 'info'
        });
      }

      // Handle analytics data if available
      if (statsData) {
        console.log('Stats data available, updating analytics:', statsData);
        
        // Ensure average discount is rounded to 1 decimal place
        if (statsData.averageDiscount !== undefined) {
          statsData.averageDiscount = parseFloat(statsData.averageDiscount).toFixed(1);
        }
        
        setAnalyticsData(statsData);
      } else {
        // Try to extract stats from response
        const stats = response?.stats || response?.data?.stats || {};
        
        // Calculate analytics if not provided by API
        if (!stats.averageDiscount && Array.isArray(urgentSalesData) && urgentSalesData.length > 0) {
          const totalDiscount = urgentSalesData.reduce((sum, item) => sum + (parseFloat(item.discount) || 0), 0);
          const averageDiscount = urgentSalesData.length > 0 ? (totalDiscount / urgentSalesData.length).toFixed(1) : "0.0";
          
          const totalSales = urgentSalesData.reduce((sum, item) => sum + (parseInt(item.sales) || 0), 0);
          const totalRevenue = urgentSalesData.reduce((sum, item) => 
            sum + (parseFloat(item.discountedPrice) * (parseInt(item.sales) || 0)), 0).toFixed(0);
          
          const expiringSoon = urgentSalesData.filter(p => 
            getDaysUntilExpiry(p.expiryDate) <= 2 && getDaysUntilExpiry(p.expiryDate) >= 0).length;
          
          const calculatedStats = {
            totalSales,
            totalRevenue,
            averageDiscount,
            expiringSoon
          };
          
          console.log('Calculated analytics:', calculatedStats);
          setAnalyticsData(calculatedStats);
        } else {
          // Ensure average discount is rounded if it exists
          if (stats.averageDiscount !== undefined) {
            stats.averageDiscount = parseFloat(stats.averageDiscount).toFixed(1);
          }
          
          setAnalyticsData(stats);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // Display detailed error to user
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load products from database';
      setErrorMessage(errorMessage);
      
      setSnackbar({
        open: true,
        message: `Failed to load products: ${errorMessage}`,
        severity: 'error'
      });
      
      // Set empty products array instead of mock data
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect to fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Update the handleSellProduct function to properly mark products as sold when quantity reaches zero
  const handleSellProduct = async (id, name, availableQuantity) => {
    // If called directly from the product card, open the confirmation dialog
    if (id && name) {
      setConfirmSellDialog({ 
        open: true, 
        productId: id, 
        productName: name,
        quantity: 1,
        maxQuantity: availableQuantity || 1,
        error: ''
      });
      return;
    }
    
    // If called from the confirmation dialog (form submission)
    try {
      // Store these in local variables to avoid the lexical declaration issue
      const productId = confirmSellDialog.productId;
      const quantity = confirmSellDialog.quantity;
      const maxQty = confirmSellDialog.maxQuantity;
      
      // Validate quantity before submitting
      if (quantity > maxQty) {
        setConfirmSellDialog({
          ...confirmSellDialog,
          error: `Cannot sell more than available quantity (${maxQty})`
        });
        return;
      }
      
      setLoading(true);
      
      console.log(`Marking product ${productId} as sold, quantity: ${quantity}`);
      const response = await urgentSalesService.markAsSold(productId, quantity);
      console.log('Product sold response:', response);
      
      // Close dialog and show success message
      setConfirmSellDialog({ 
        open: false, 
        productId: null, 
        productName: '', 
        quantity: 1, 
        maxQuantity: 1,
        error: '' 
      });
      
      setSnackbar({ 
        open: true, 
        message: 'Product marked as sold successfully', 
        severity: 'success' 
      });
      
      // Update the products state immediately to reflect changes
      // This ensures zero-quantity products are instantly removed from active tabs
      setProducts(currentProducts => {
        return currentProducts.map(product => {
          if (product._id === productId) {
            // Calculate new quantity
            const newQuantity = Math.max(0, product.quantity - parseInt(quantity));
            
            // If quantity is now zero, also update status to 'sold'
            const newStatus = newQuantity <= 0 ? 'sold' : product.status;
            
            console.log(`Updated product ${product.name}: quantity ${product.quantity} -> ${newQuantity}, status: ${product.status} -> ${newStatus}`);
            
            // Return updated product
            return {
              ...product,
              quantity: newQuantity,
              status: newStatus,
              sales: (product.sales || 0) + parseInt(quantity)
            };
          }
          return product;
        });
      });
      
      // Also refresh from server to ensure everything is in sync
      setTimeout(() => {
        fetchProducts();
      }, 500);
    } catch (error) {
      console.error('Error marking product as sold:', error);
      setConfirmSellDialog({
        ...confirmSellDialog,
        error: error.message || 'Failed to mark product as sold'
      });
      setSnackbar({ 
        open: true, 
        message: `Failed to mark product as sold: ${error.message}`, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Update the quantity change handler for the sell dialog
  const handleSellQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value) || 1;
    const { maxQuantity } = confirmSellDialog;
    
    // Reset error if quantity is valid
    const error = newQuantity > maxQuantity 
      ? `Cannot sell more than available quantity (${maxQuantity})` 
      : '';
    
    setConfirmSellDialog({ 
      ...confirmSellDialog, 
      quantity: Math.max(1, newQuantity),
      error
    });
  };

  // Add a computed property for filtered products by tab
  const getActiveTabProducts = () => {
    if (!Array.isArray(filteredProducts)) return [];
    
    switch (tabValue) {
      case 0: // All active products
        return filteredProducts.filter(p => p.status === 'active' && p.quantity > 0);
      case 1: // Featured products
        return filteredProducts.filter(p => p.featured && p.status === 'active' && p.quantity > 0);
      case 2: // Expiring soon
        return filteredProducts.filter(p => 
          p.status === 'active' && 
          p.quantity > 0 && 
          getDaysUntilExpiry(p.expiryDate) <= 2 && 
          getDaysUntilExpiry(p.expiryDate) >= 0
        );
      case 3: // Inactive products
        return filteredProducts.filter(p => p.status === 'inactive' || p.quantity === 0);
      default:
        return filteredProducts;
    }
  };

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
              <Typography variant="h4" fontWeight="bold">{analyticsData.totalSales || 0}</Typography>
              {analyticsData.salesTrend ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {analyticsData.salesTrend > 0 ? (
                    <>
                      <TrendingUpIcon fontSize="small" sx={{ mr: 0.5, color: '#4caf50' }} />
                      <Typography variant="caption" sx={{ color: '#4caf50' }}>
                        +{analyticsData.salesTrend}% this week
                      </Typography>
                    </>
                  ) : (
                    <>
                      <TrendingUpIcon fontSize="small" sx={{ mr: 0.5, transform: 'rotate(180deg)', color: '#f44336' }} />
                      <Typography variant="caption" sx={{ color: '#f44336' }}>
                        {analyticsData.salesTrend}% this week
                      </Typography>
                    </>
                  )}
              </Box>
              ) : (
                <Typography variant="caption" color="text.secondary">No trend data available</Typography>
              )}
            </StatCard>
            <StatCard color="#388e3c" elevation={3}>
              <Typography variant="subtitle2">Revenue</Typography>
              <Typography variant="h4" fontWeight="bold">₹{analyticsData.totalRevenue || 0}</Typography>
              {analyticsData.revenueTrend ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {analyticsData.revenueTrend > 0 ? (
                    <>
                      <TrendingUpIcon fontSize="small" sx={{ mr: 0.5, color: '#4caf50' }} />
                      <Typography variant="caption" sx={{ color: '#4caf50' }}>
                        +{analyticsData.revenueTrend}% this week
                      </Typography>
                    </>
                  ) : (
                    <>
                      <TrendingUpIcon fontSize="small" sx={{ mr: 0.5, transform: 'rotate(180deg)', color: '#f44336' }} />
                      <Typography variant="caption" sx={{ color: '#f44336' }}>
                        {analyticsData.revenueTrend}% this week
                      </Typography>
                    </>
                  )}
              </Box>
              ) : (
                <Typography variant="caption" color="text.secondary">No trend data available</Typography>
              )}
            </StatCard>
            <StatCard color="#f57c00" elevation={3}>
              <Typography variant="subtitle2">Avg. Discount</Typography>
              <Typography variant="h4" fontWeight="bold">{parseFloat(analyticsData.averageDiscount || 0).toFixed(1)}%</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DiscountIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">Effective pricing</Typography>
              </Box>
            </StatCard>
            <StatCard color="#7b1fa2" elevation={3}>
              <Typography variant="subtitle2">Expiring Soon</Typography>
              <Typography variant="h4" fontWeight="bold">
                {analyticsData.expiringSoon || 
                 (Array.isArray(products) ? 
                  products.filter(p => getDaysUntilExpiry(p.expiryDate) <= 2 && getDaysUntilExpiry(p.expiryDate) >= 0).length : 0)}
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
                  <MenuItem key="expiryDate" value="expiryDate">Expiry Date</MenuItem>
                  <MenuItem key="discount" value="discount">Highest Discount</MenuItem>
                  <MenuItem key="price" value="price">Lowest Price</MenuItem>
                  <MenuItem key="popularity" value="popularity">Most Viewed</MenuItem>
                  <MenuItem key="sales" value="sales">Best Selling</MenuItem>
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
        
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', my: 5, py: 5 }}>
            <CircularProgress size={50} sx={{ mb: 3 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Loading your urgent sales data...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we connect to the database
            </Typography>
          </Box>
        ) : (
          <>
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorMessage}
                <Button
                  size="small"
                  onClick={() => fetchProducts()}
                  sx={{ ml: 2 }}
                >
                  Retry
                </Button>
              </Alert>
            )}
            
            {tabValue === 0 && (
              // All products tab content
              <Grid container spacing={3}>
                {filteredProducts && filteredProducts.filter(p => p.status === 'active' && p.quantity > 0).length > 0 ? (
                  filteredProducts
                    .filter(p => p.status === 'active' && p.quantity > 0)
                    .map((product, index) => (
                      <Grid item xs={12} sm={6} md={4} key={product._id || index}>
                        <Card 
                          sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            position: 'relative',
                            transition: 'transform 0.2s',
                            '&:hover': {
                              transform: 'scale(1.02)',
                              boxShadow: 6,
                            }
                          }}
                        >
                        <CardMedia
                          component="img"
                          height="200"
                            image={product?.image || 'https://placehold.co/600x400?text=No+Image'}
                            alt={product?.name || 'Product'}
                            sx={{ objectFit: 'cover' }}
                            onError={(e) => {
                              console.log('Image failed to load:', product?.image);
                              e.target.src = 'https://placehold.co/600x400?text=No+Image';
                            }}
                          />
                      <CardContent sx={{ flexGrow: 1 }}>
                            <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                              {product?.name || 'Unnamed Product'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {product?.description 
                                ? (product.description.length > 100 
                                    ? `${product.description.substring(0, 100)}...` 
                                    : product.description)
                                : 'No description available'}
                        </Typography>
                            
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body1" component="span" sx={{ textDecoration: 'line-through', color: 'text.secondary', mr: 1 }}>
                                ₹{product?.price ? parseFloat(product.price).toFixed(2) : "0.00"}
                          </Typography>
                          <Typography variant="h6" component="span" color="error" fontWeight="bold">
                                ₹{product?.discountedPrice ? parseFloat(product.discountedPrice).toFixed(2) : "0.00"}
                          </Typography>
                        </Box>
                            
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Chip 
                            label={`${product?.discount || 0}% OFF`} 
                            color="error" 
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                      <Typography variant="body2" color="text.secondary">
                              {product?.quantity || 0} {product?.unit || 'units'} available
                      </Typography>
                    </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip 
                              label={product?.category || 'Uncategorized'} 
                    color="primary" 
                              variant="outlined" 
                              size="small" 
                      />
                      <Chip
                              label={product?.expiryDate 
                                ? `Expires: ${format(new Date(product.expiryDate), 'MMM dd')}` 
                                : 'No expiry date'}
                              color={product?.expiryDate && isAfter(new Date(product.expiryDate), addDays(new Date(), 2)) 
                                ? 'success' 
                                : 'warning'} 
                              size="small"
                            />
                    </Box>
                    </CardContent>
                    <CardActions disableSpacing sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Box>
                        <Tooltip title="Edit">
                          <IconButton 
                            onClick={() => handleOpenDialog(product)}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            onClick={() => handleDeleteProduct(product?._id)}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Mark as Sold">
                          <IconButton 
                            onClick={() => handleSellProduct(product?._id, product?.name, product?.quantity)}
                            size="small"
                            color="success"
                            disabled={product?.quantity <= 0}
                          >
                            <ShoppingCartCheckoutIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      {product.featured && (
                        <Chip 
                          icon={<StarIcon />} 
                          label="Featured" 
                          size="small" 
                          color="primary"
                        />
                      )}
                    </CardActions>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 2, backgroundColor: '#f9f9f9' }}>
                      <Box 
                        component="img"
                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0yMCA4SDRWNkgxOEwxNiAxNVoiIGZpbGw9IiM5MEIwQzciLz48cGF0aCBkPSJNMjAgMTJINkgxOEwxNiAxMlY2SDIwVjEyWiIgZmlsbD0iIzkwQ0FGOSIvPjxwYXRoIGQ9Ik0xNy45OTkgMTkuMDFMNCAxOVYxNkgxOEwxNiAxNVoiIGZpbGw9IiM5MEIwQzciLz48cGF0aCBkPSJNMjAuMTYgMjJIMy44NEMyLjgyIDIyIDIgMjEuMTggMiAyMC4xNlY1Ljg0QzIgNC44MiAyLjgyIDQgMy44NCA0SDIwLjE2QzIxLjE4IDQgMjIgNC44MiAyMiA1Ljg0VjIwLjE2QzIyIDIxLjE4IDIxLjE4IDIyIDIwLjE2IDIyWiIgZmlsbD0iI0VDRUZGMSIvPjxwYXRoIGQ9Ik0yMC4xNiAyMkgzLjg0QzIuODIgMjIgMiAyMS4xOCAyIDIwLjE2VjZIMjJWMjAuMTZDMjIgMjEuMTggMjEuMTggMjIgMjAuMTYgMjJaIiBmaWxsPSIjQjBCRUM1Ii8+PHBhdGggZD0iTTIwLjE2IDYIMS44NEM4LjQ1IDYuMSAxNS41NSA2LjEgMjIuMTYgNkgyMC4xNloiIGZpbGw9IiNGNUY1RjUiLz48cGF0aCBkPSJNMjAgMTlMNCAxOVYxNkgxOEwxNiAxN0MxOCAxOC4xMSAxOC44OSAxOSAyMCAxOUoiIGZpbGw9IiM0MzQzNDMiLz48cGF0aCBkPSJNNyAxNUg2TDkgOUgxMEw3IDE1WiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0xMC4wMjkgMTVIOC45NzFMMTIuMDI5IDlIMTMuMDg2TDEwLjAyOSAxNVoiIGZpbGw9IiNGRkZGRkYiLz48cGF0aCBkPSJNMTYgMTVIMTVMMTggOUgxOUwxNiAxNVoiIGZpbGw9IiNGRkZGRkYiLz48L3N2Zz4K"
                        alt="No products found"
                        sx={{ width: 100, height: 100, opacity: 0.7, mb: 2 }}
                      />
                      <Typography variant="h6" gutterBottom color="text.secondary">
                        No urgent sales found in database
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        You haven't added any urgent sale products yet. Add your first listing to get started.
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="large"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                        sx={{ 
                          mt: 2,
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          background: 'linear-gradient(45deg, #2E7D32 30%, #43A047 90%)',
                          boxShadow: '0 3px 5px 2px rgba(46, 125, 50, .3)',
                        }}
                      >
                        Add Your First Listing
                      </Button>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
            
            {tabValue === 1 && (
              // Featured products tab content
              <Grid container spacing={3}>
                {getActiveTabProducts().length > 0 ? (
                  // Map featured products
                  getActiveTabProducts().map((product, index) => (
                    <Grid item xs={12} sm={6} md={4} key={product._id || index}>
                      <Card 
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          position: 'relative',
                          transition: 'transform 0.2s',
                          borderLeft: '4px solid #f57c00',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: 6,
                          }
                        }}
                      >
                      <CardMedia
                        component="img"
                        height="200"
                          image={product?.image || 'https://placehold.co/600x400?text=No+Image'}
                          alt={product?.name || 'Product'}
                          sx={{ objectFit: 'cover' }}
                          onError={(e) => {
                            console.log('Image failed to load:', product?.image);
                            e.target.src = 'https://placehold.co/600x400?text=No+Image';
                          }}
                        />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                          {product?.name || 'Unnamed Product'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {product?.description 
                            ? (product.description.length > 100 
                                ? `${product.description.substring(0, 100)}...` 
                                : product.description)
                            : 'No description available'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body1" component="span" sx={{ textDecoration: 'line-through', color: 'text.secondary', mr: 1 }}>
                            ₹{product?.price ? parseFloat(product.price).toFixed(2) : "0.00"}
                          </Typography>
                          <Typography variant="h6" component="span" color="error" fontWeight="bold">
                            ₹{product?.discountedPrice ? parseFloat(product.discountedPrice).toFixed(2) : "0.00"}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Chip 
                            label={`${product?.discount || 0}% OFF`} 
                            color="error" 
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {product?.quantity || 0} {product?.unit || 'units'} available
                          </Typography>
                        </Box>
                          
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip 
                            label={product?.category || 'Uncategorized'} 
                            color="primary" 
                            variant="outlined" 
                            size="small" 
                          />
                          <Chip
                            label={product?.expiryDate 
                              ? `Expires: ${format(new Date(product.expiryDate), 'MMM dd')}` 
                              : 'No expiry date'}
                            color={product?.expiryDate && isAfter(new Date(product.expiryDate), addDays(new Date(), 2)) 
                              ? 'success' 
                              : 'warning'} 
                            size="small"
                          />
                        </Box>
                      </CardContent>
                      <CardActions disableSpacing sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                        <Box>
                          <Tooltip title="Edit">
                            <IconButton 
                              onClick={() => handleOpenDialog(product)}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              onClick={() => handleDeleteProduct(product?._id)}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Mark as Sold">
                            <IconButton 
                              onClick={() => handleSellProduct(product?._id, product?.name, product?.quantity)}
                              size="small"
                              color="success"
                              disabled={product?.quantity <= 0}
                            >
                              <ShoppingCartCheckoutIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        {product.featured && (
                          <Chip 
                            icon={<StarIcon />} 
                            label="Featured" 
                            size="small" 
                            color="primary"
                          />
                        )}
                      </CardActions>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>No featured products found</Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        Add new products and mark them as featured to display them here.
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
              // Expiring soon tab content
              <Grid container spacing={3}>
                {getActiveTabProducts().length > 0 ? (
                  // Map expiring products
                  getActiveTabProducts().map((product, index) => (
                    <Grid item xs={12} sm={6} md={4} key={product._id || index}>
                      <Card 
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          position: 'relative',
                          transition: 'transform 0.2s',
                          borderLeft: '4px solid #ff9800',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: 6,
                          }
                        }}
                      >
                      <CardMedia
                        component="img"
                        height="200"
                          image={product?.image || 'https://placehold.co/600x400?text=No+Image'}
                          alt={product?.name || 'Product'}
                          sx={{ objectFit: 'cover' }}
                          onError={(e) => {
                            console.log('Image failed to load:', product?.image);
                            e.target.src = 'https://placehold.co/600x400?text=No+Image';
                          }}
                        />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                            {product?.name || 'Unnamed Product'}
                          </Typography>
                          <Chip
                            label={product?.expiryDate 
                              ? `Expires: ${format(new Date(product.expiryDate), 'MMM dd')}` 
                              : 'No expiry date'}
                            color="error" 
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {product?.description 
                            ? (product.description.length > 100 
                                ? `${product.description.substring(0, 100)}...` 
                                : product.description)
                            : 'No description available'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body1" component="span" sx={{ textDecoration: 'line-through', color: 'text.secondary', mr: 1 }}>
                            ₹{product?.price ? parseFloat(product.price).toFixed(2) : "0.00"}
                          </Typography>
                          <Typography variant="h6" component="span" color="error" fontWeight="bold">
                            ₹{product?.discountedPrice ? parseFloat(product.discountedPrice).toFixed(2) : "0.00"}
                          </Typography>
                          <Chip 
                            label={`${product?.discount || 0}% OFF`} 
                            color="error" 
                            size="small"
                            sx={{ ml: 1, fontWeight: 'bold' }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Chip 
                            label={product?.category || 'Uncategorized'} 
                            color="primary" 
                            variant="outlined" 
                            size="small" 
                          />
                          <Typography variant="body2" color="text.secondary">
                            {product?.quantity || 0} {product?.unit || 'units'} available
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions disableSpacing sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                        <Box>
                          <Tooltip title="Edit">
                            <IconButton 
                              onClick={() => handleOpenDialog(product)}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Discount More">
                            <IconButton 
                              onClick={() => handleOpenDialog(product)}
                              size="small"
                              color="warning"
                            >
                              <LocalOfferIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Box>
                          <Tooltip title="Mark as Sold">
                            <IconButton 
                              onClick={() => handleSellProduct(product?._id, product?.name, product?.quantity)}
                              size="small"
                              color="success"
                              disabled={product?.quantity <= 0}
                            >
                              <ShoppingCartCheckoutIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardActions>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>No products expiring soon</Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        Products with 2 days or less until expiry will appear here.
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
            
            {tabValue === 3 && (
              // Inactive products tab content
              <Grid container spacing={3}>
                {getActiveTabProducts().length > 0 ? (
                  // Map inactive products
                  getActiveTabProducts().map((product, index) => (
                    <Grid item xs={12} sm={6} md={4} key={product._id || index}>
                      <Card 
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          position: 'relative',
                          transition: 'transform 0.2s',
                          opacity: 0.7,
                          filter: 'grayscale(50%)',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: 6,
                            opacity: 0.9,
                            filter: 'grayscale(30%)',
                          }
                        }}
                      >
                      <CardMedia
                        component="img"
                        height="200"
                          image={product?.image || 'https://placehold.co/600x400?text=No+Image'}
                          alt={product?.name || 'Product'}
                          sx={{ objectFit: 'cover' }}
                          onError={(e) => {
                            console.log('Image failed to load:', product?.image);
                            e.target.src = 'https://placehold.co/600x400?text=No+Image';
                          }}
                        />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                            {product?.name || 'Unnamed Product'}
                          </Typography>
                          <Chip
                            label="Inactive"
                            color="default"
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {product?.description 
                            ? (product.description.length > 80 
                                ? `${product.description.substring(0, 80)}...` 
                                : product.description)
                            : 'No description available'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" component="span" sx={{ color: 'text.secondary', mr: 1 }}>
                            Original: ₹{product?.price ? parseFloat(product.price).toFixed(2) : "0.00"}
                          </Typography>
                          <Typography variant="body2" component="span" sx={{ color: 'text.secondary' }}>
                            Discounted: ₹{product?.discountedPrice ? parseFloat(product.discountedPrice).toFixed(2) : "0.00"}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Chip 
                            label={product?.category || 'Uncategorized'} 
                            variant="outlined" 
                            size="small" 
                            color="default"
                          />
                          <Typography variant="body2" color="text.secondary">
                            {product?.quantity || 0} {product?.unit || 'units'} in stock
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions disableSpacing sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                        <Box>
                          <Tooltip title="Edit">
                            <IconButton 
                              onClick={() => handleOpenDialog(product)}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Activate">
                            <IconButton 
                              onClick={() => toggleProductStatus(product?._id)}
                              size="small"
                              color="success"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Box>
                          <Tooltip title="Mark as Sold">
                            <IconButton 
                              onClick={() => handleSellProduct(product?._id, product?.name, product?.quantity)}
                              size="small"
                              color="success"
                              disabled={product?.quantity <= 0}
                            >
                              <ShoppingCartCheckoutIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardActions>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>No inactive products</Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        Products marked as inactive will appear here.
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
            
            {tabValue === 4 && (
              // Analytics tab content
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  {/* Sales Performance */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                        <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Sales Performance
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1">Total Sales</Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {analyticsData.totalSales || 0} orders
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1">Total Revenue</Typography>
                          <Typography variant="h6" fontWeight="bold" color="success.main">
                            ₹{analyticsData.totalRevenue ? analyticsData.totalRevenue.toLocaleString() : '0'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1">Average Discount</Typography>
                          <Typography variant="h6" fontWeight="bold" color="warning.main">
                            {analyticsData.averageDiscount || 0}%
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1">Expiring Products</Typography>
                          <Typography variant="h6" fontWeight="bold" color="error.main">
                            {analyticsData.expiringSoon || 
                             (Array.isArray(products) ? 
                              products.filter(p => getDaysUntilExpiry(p.expiryDate) <= 2 && getDaysUntilExpiry(p.expiryDate) >= 0).length : 0)}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  {/* Sales by Category */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                        <PieChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Sales by Category
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ height: 240, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {analyticsData.categorySales && analyticsData.categorySales.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analyticsData.categorySales}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {analyticsData.categorySales.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <Typography color="text.secondary">
                            No category data available yet. Add more sales to see insights.
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                  
                  {/* Sales Transactions */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                        <MonetizationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Recent Sales Transactions
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      
                      {Array.isArray(products) && products.filter(p => p.sales && p.sales > 0).length > 0 ? (
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Product</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell align="right">Price</TableCell>
                                <TableCell align="right">Discount</TableCell>
                                <TableCell align="right">Quantity Sold</TableCell>
                                <TableCell align="right">Revenue</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {products
                                .filter(p => p.sales && p.sales > 0)
                                .slice(0, 5)
                                .map((product) => (
                                  <TableRow key={product._id}>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.category}</TableCell>
                                    <TableCell align="right">₹{parseFloat(product.discountedPrice).toFixed(2)}</TableCell>
                                    <TableCell align="right">{product.discount}%</TableCell>
                                    <TableCell align="right">{product.sales}</TableCell>
                                    <TableCell align="right">
                                      ₹{(parseFloat(product.discountedPrice) * parseFloat(product.sales)).toFixed(2)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography color="text.secondary">
                            No sales transactions recorded yet. Use "Mark as Sold" to record sales.
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Dialog for adding/editing product */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }
          }}
        >
          <Box sx={{ 
            background: 'linear-gradient(45deg, #2E7D32 30%, #43A047 90%)',
            color: 'white',
            py: 2,
            px: 3,
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant="h5" fontWeight="bold">
              {editMode ? 'Edit Urgent Sale Listing' : 'Add New Urgent Sale Listing'}
            </Typography>
            <IconButton
              onClick={handleCloseDialog}
              sx={{ color: 'white' }}
            >
              <CancelIcon />
            </IconButton>
          </Box>
          
          <DialogContent sx={{ py: 3 }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            {/* Product Name */}
              <Grid item xs={12}>
              <Box>
                <Typography sx={customStyles.formLabel}>Product Name *</Typography>
                <TextField
                  name="name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  variant="outlined"
                  sx={customStyles.input}
                  InputProps={{
                    sx: { boxShadow: 'none' }
                  }}
                />
              </Box>
              </Grid>
              
            {/* Category */}
              <Grid item xs={12} sm={6}>
              <Box>
                <Typography sx={customStyles.formLabel}>Category *</Typography>
                <FormControl fullWidth error={!!formErrors.category} required sx={customStyles.select}>
                  <Select
                    name="category"
                    value={newProduct.category || ''}
                    onChange={handleInputChange}
                    displayEmpty
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    <MenuItem value="Fruits">Fruits</MenuItem>
                    <MenuItem value="Vegetables">Vegetables</MenuItem>
                    <MenuItem value="Dairy">Dairy</MenuItem>
                    <MenuItem value="Bakery">Bakery</MenuItem>
                    <MenuItem value="Meat">Meat</MenuItem>
                    <MenuItem value="Seafood">Seafood</MenuItem>
                    <MenuItem value="Snacks">Snacks</MenuItem>
                    <MenuItem value="Beverages">Beverages</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                  {formErrors.category && <FormHelperText>{formErrors.category}</FormHelperText>}
                </FormControl>
              </Box>
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={6}>
              <Box>
                <Typography sx={customStyles.formLabel}>Status</Typography>
                <FormControl fullWidth sx={customStyles.select}>
                  <Select
                    name="status"
                    value={newProduct.status}
                    onChange={handleInputChange}
                    displayEmpty
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
              
            {/* Price */}
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography sx={customStyles.formLabel}>Original Price (₹) *</Typography>
                <TextField
                  name="price"
                  type="number"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!!formErrors.price}
                  helperText={formErrors.price}
                  variant="outlined"
                  sx={customStyles.input}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Box>
            </Grid>
                    
            {/* Discounted Price */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ position: 'relative' }}>
                <Typography sx={customStyles.formLabel}>Discounted Price (₹) *</Typography>
                <TextField
                  name="discountedPrice"
                  type="number"
                  value={newProduct.discountedPrice}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!!formErrors.discountedPrice}
                  helperText={formErrors.discountedPrice}
                  variant="outlined"
                  sx={customStyles.input}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
                {calculateDiscount() > 0 && (
                  <Box sx={customStyles.discountTag}>
                    {calculateDiscount()}% OFF
                  </Box>
                )}
              </Box>
            </Grid>
                    
            {/* Quantity */}
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography sx={customStyles.formLabel}>Quantity *</Typography>
                <TextField
                  name="quantity"
                  type="number"
                  value={newProduct.quantity}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!!formErrors.quantity}
                  helperText={formErrors.quantity}
                  variant="outlined"
                  sx={customStyles.input}
                />
              </Box>
            </Grid>
                    
            {/* Unit */}
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography sx={customStyles.formLabel}>Unit *</Typography>
                <FormControl fullWidth error={!!formErrors.unit} sx={customStyles.select}>
                  <Select
                    name="unit"
                    value={newProduct.unit}
                    onChange={handleInputChange}
                    required
                    displayEmpty
                  >
                    <MenuItem value="kg">Kilograms (kg)</MenuItem>
                    <MenuItem value="g">Grams (g)</MenuItem>
                    <MenuItem value="liter">Liters</MenuItem>
                    <MenuItem value="ml">Milliliters (ml)</MenuItem>
                    <MenuItem value="piece">Pieces</MenuItem>
                    <MenuItem value="dozen">Dozen</MenuItem>
                    <MenuItem value="box">Box</MenuItem>
                    <MenuItem value="packet">Packet</MenuItem>
                  </Select>
                  {formErrors.unit && <FormHelperText>{formErrors.unit}</FormHelperText>}
                </FormControl>
              </Box>
            </Grid>
                    
            {/* Expiry Date */}
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography sx={customStyles.formLabel}>Expiry Date *</Typography>
                <TextField
                  name="expiryDate"
                  type="date"
                  value={newProduct.expiryDate ? new Date(newProduct.expiryDate).toISOString().split('T')[0] : ''}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!!formErrors.expiryDate}
                  helperText={formErrors.expiryDate}
                  variant="outlined"
                  sx={customStyles.input}
                />
              </Box>
            </Grid>
            
            {/* Featured */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: 2, 
                p: 2, 
                display: 'flex', 
                alignItems: 'center', 
                height: '100%',
                bgcolor: '#f9f9f9' 
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      name="featured"
                      checked={newProduct.featured}
                      onChange={handleInputChange}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={600} color="#424242">
                      Featured Product
                    </Typography>
                  }
                />
              </Box>
            </Grid>
              
            {/* Tags */}
            <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={availableTags}
                  value={newProduct.tags || []}
                  onChange={handleTagsChange}
                  renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const tagProps = getTagProps({ index });
                    // Fix the key warning by manually handling the key prop
                    const { key, ...otherProps } = tagProps;
                    return (
                      <Chip 
                        key={key}
                        variant="outlined"
                        label={option} 
                        size="small"
                        {...otherProps} 
                      />
                    );
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Tags (optional)"
                    error={!!formErrors.tags}
                    helperText={formErrors.tags}
                    InputProps={{
                      ...params.InputProps,
                      sx: { borderRadius: 2 }
                    }}
                  />
                )}
                />
              </Grid>
              
            {/* Description */}
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={newProduct.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
                required
                error={!!formErrors.description}
                helperText={formErrors.description}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>
            
            {/* Image Upload */}
            <Grid item xs={12}>
              <Typography sx={customStyles.formLabel}>Product Image *</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box 
                    component="label" 
                    htmlFor="product-image-upload"
                    sx={customStyles.imageUpload}
                    onClick={handleImageClick}
                  >
                    <input
                      type="file"
                      id="product-image-upload"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    <Box 
                      component="img" 
                      src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMzZGE1ZjQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS11cGxvYWQtY2xvdWQiPjxwYXRoIGQ9Ik03IDEwdjJhNiA2IDAgMCAwIDEyIDB2LTJtLTcgN3Y2bTAgMHY2bTAtNmg2TTU0YTQgNCAwIDEgMSA2IDZoLTJtNS03YTYuOTk5IDYuOTk5IDAgMCAwIDcgN2g4YTYgNiAwIDAgMCA1LjkxLTdaIi8+PC9zdmc+"
                      alt="Upload"
                      sx={{ width: 48, height: 48, mb: 2 }}
                    />
                    <Typography variant="body1" fontWeight={500} color="#3da5f4">
                      Drag and drop or click to upload
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      PNG, JPG, WEBP up to 5MB
                    </Typography>
                    {uploadingImage && (
                      <Box sx={{ width: '90%', mt: 2 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={uploadProgress} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: 'rgba(0,0,0,0.05)'
                          }} 
                        />
                        <Typography variant="caption" align="center" display="block" sx={{ mt: 1 }}>
                          {uploadProgress}% uploaded
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  {imagePreview ? (
                    <Box sx={customStyles.imagePreview}>
                      <Box 
                        component="img"
                        src={imagePreview}
                        alt="Product preview"
                        sx={{ 
                          width: '100%', 
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      />
                      <IconButton 
                        size="small"
                        color="error"
                        sx={{ 
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(255,255,255,0.9)',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,1)',
                            transform: 'scale(1.1)'
                          }
                        }}
                        onClick={() => {
                          setImagePreview('');
                          setNewProduct({ ...newProduct, image: '' });
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={customStyles.imagePreview}>
                      <Box sx={{ textAlign: 'center', p: 3 }}>
                        <Box 
                          component="img" 
                          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iNCIgZmlsbD0iI0YyRjRGNyIvPgo8cGF0aCBkPSJNMjkuNSAzNS4yNUMyOS41IDM2LjYzMDcgMjguMzgwNyAzNy43NSAyNyAzNy43NUMyNS42MTkzIDM3Ljc1IDI0LjUgMzYuNjMwNyAyNC41IDM1LjI1QzI0LjUgMzMuODY5MyAyNS42MTkzIDMyLjc1IDI3IDMyLjc1QzI4LjM4MDcgMzIuNzUgMjkuNSAzMy44NjkzIDI5LjUgMzUuMjVaIiBmaWxsPSIjQTNBM0EzIi8+CjxwYXRoIGQ9Ik01NCA1MS43NDk1TDQyLjUgNDAuMjVMNTMgNTAuNzVMNTQgNTEuNzQ5NVoiIGZpbGw9IiNBM0EzQTMiLz4KPHBhdGggZD0iTTIyLjUgNDIuNzVMMzEuNSA1MS43NUg0My41QzQxLjUgNDcuNSAzMy4yNSA0Ny43NSAyNy41IDQ3LjUgTDIyLjUgNDIuNzVaIiBmaWxsPSIjQTNBM0EzIi8+CjxwYXRoIGQ9Ik01Ni41IDI4Ljc1SDU0VjI1Ljc1SDUxVjI4Ljc1SDQ4LjVWMzEuNzVINDYuNVYzNC43NUg1MS41VjMxLjc1SDU2LjVaIiBmaWxsPSIjQTNBM0EzIi8+CjxyZWN0IHg9IjIwLjUiIHk9IjI0Ljc1IiB3aWR0aD0iMzkiIGhlaWdodD0iMzAiIHJ4PSIyIiBzdHJva2U9IiNBM0EzQTMiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K" 
                          alt="No image preview"
                          sx={{ width: 80, height: 80, mb: 2 }}
                        />
                        <Typography color="#424242" variant="body1" fontWeight={500}>
                          No image preview
                        </Typography>
                        <Typography color="#757575" variant="body2" sx={{ mt: 1 }}>
                          Your product image will appear here
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>
                {formErrors.image && (
                  <Grid item xs={12}>
                    <Typography color="error" variant="caption">
                      {formErrors.image}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
          </DialogContent>
          
          <DialogActions sx={{ 
            px: 3, 
            py: 2, 
            borderTop: '1px solid rgba(0,0,0,0.1)',
            justifyContent: 'space-between'
          }}>
            <Button 
              onClick={handleCloseDialog}
              variant="outlined"
              startIcon={<CancelIcon />}
              sx={{ 
                borderRadius: 2,
                px: 3
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddProduct} 
              variant="contained" 
              color="primary"
              disabled={submitting}
              startIcon={editMode ? <SaveIcon /> : <AddIcon />}
              sx={{ 
                minWidth: 150,
                background: 'linear-gradient(45deg, #2E7D32 30%, #43A047 90%)',
                boxShadow: '0 3px 5px 2px rgba(46, 125, 50, .3)',
                borderRadius: 2,
                px: 3,
                '&:hover': {
                  background: 'linear-gradient(45deg, #1b5e20 30%, #2E7D32 90%)',
                  boxShadow: '0 3px 8px 2px rgba(27, 94, 32, .4)',
                }
              }}
            >
            {submitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                editMode ? 'Update Product' : 'Add Product'
              )}
            </Button>
          </DialogActions>
        </Dialog>

      {/* Confirmation dialog for deletion */}
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
            onClick={confirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Sell Dialog */}
      <Dialog
        open={confirmSellDialog.open}
        onClose={() => setConfirmSellDialog({ ...confirmSellDialog, open: false })}
        aria-labelledby="sell-dialog-title"
      >
        <DialogTitle id="sell-dialog-title">
          Mark Product as Sold
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark "{confirmSellDialog.productName}" as sold? This will record a sales transaction with the current price.
          </DialogContentText>
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Available Quantity: {confirmSellDialog.maxQuantity}
            </Typography>
          </Box>
          <TextField
            margin="dense"
            label="Quantity to Sell"
            type="number"
            fullWidth
            value={confirmSellDialog.quantity}
            onChange={handleSellQuantityChange}
            InputProps={{
              inputProps: { 
                min: 1,
                max: confirmSellDialog.maxQuantity
              }
            }}
            error={!!confirmSellDialog.error}
            helperText={confirmSellDialog.error}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmSellDialog({ ...confirmSellDialog, open: false })} 
            color="primary"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleSellProduct()} 
            color="primary" 
            variant="contained"
            disabled={loading || !!confirmSellDialog.error || confirmSellDialog.quantity > confirmSellDialog.maxQuantity}
          >
            {loading ? <CircularProgress size={24} /> : 'Mark as Sold'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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
  );
};

export default UrgentSales;
