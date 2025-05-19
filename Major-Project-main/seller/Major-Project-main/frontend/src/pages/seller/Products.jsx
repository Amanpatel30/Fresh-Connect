import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  InputAdornment,
  Chip,
  Tooltip,
  CardActionArea,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Skeleton,
  Badge,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  Pagination,
  Collapse,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Info as InfoIcon,
  Lock as LockIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PieChart as PieChartIcon,
  ContentCopy as ContentCopyIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  CheckBox as CheckBoxIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from '../../components/common/ImageUpload';
import { 
  uploadImage, 
  validateImage, 
  createImagePreview, 
  storeImage, 
  getImageUrl,
  storeLocalImage 
} from '../../lib/imageUpload';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import * as productService from '../../services/productService';
import { useNavigate, useLocation } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { useSnackbar as useNotistackSnackbar } from 'notistack';

const Products = () => {
  const theme = useTheme();
  const { user } = useUser();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [errors, setErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    unit: 'kg',
    category: 'vegetables',
    description: '',
    image: '',
  });
  const [viewMode, setViewMode] = useState('grid');
  const navigate = useNavigate();
  const [shouldRefresh, setShouldRefresh] = useState(true);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
    lowStockProducts: 0,
    productsByCategory: []
  });
  const [showCategoryChart, setShowCategoryChart] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // Fetch categories from products
  useEffect(() => {
    if (products && products.length > 0) {
      const uniqueCategories = [...new Set(products.map(product => product?.category))].filter(Boolean);
      setCategories(uniqueCategories);
    }
  }, [products]);

  const fetchProducts = useCallback(async (skipNotification = false) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      // Build filters object
      const queryFilters = {
        ...filters,
        search: searchQuery,
        category: categoryFilter === 'all' ? '' : categoryFilter,
        page,
        limit: 12
      };
      
      // Call the product service
      const response = await productService.getSellerProducts(queryFilters);
      
      // Update state with the fetched products
      if (response && response.data) {
        setProducts(response.data);
        setTotalPages(response.pagination?.pages || 1);
        setShouldRefresh(false);
        
        // Update stats
        setStats({
          totalProducts: response.pagination?.total || response.data.length,
          activeProducts: response.data.filter(p => p.stock > 0).length,
          outOfStockProducts: response.data.filter(p => p.stock === 0).length,
          lowStockProducts: response.data.filter(p => p.stock > 0 && p.stock <= 10).length,
          productsByCategory: response.data.reduce((acc, product) => {
            if (product.category) {
              const existingCategory = acc.find(c => c.name === product.category);
              if (existingCategory) {
                existingCategory.count += 1;
              } else {
                acc.push({ name: product.category, count: 1 });
              }
            }
            return acc;
          }, [])
        });
      } else {
        setProducts([]);
      }
      
      // Show success message only if not skipped
      if (!skipNotification) {
        setSnackbar({
          open: true,
          message: `${response.results || 0} products loaded successfully`,
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // Check if it's an authentication error
      if (error.response && error.response.status === 401) {
        // This will be handled by the API interceptor
        console.log('Authentication error in fetchProducts');
      } else {
        // Show error message for other errors
        setSnackbar({
          open: true,
          message: `Error loading products: ${error.message || 'Unknown error'}`,
          severity: 'error'
        });
        setProducts([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, searchQuery, categoryFilter, page, navigate, filters]);

  useEffect(() => {
    // This effect will run when the component mounts and when the location changes
    // It will refresh the products when the user navigates to this page
    setShouldRefresh(true);
    console.log('Products component mounted or location changed, refreshing products');
    
    // Check if a product was just added from the ProductAdd page
    const productJustAdded = sessionStorage.getItem('productJustAdded');
    if (productJustAdded === 'true') {
      // Get the custom message if available, or use a default
      const message = sessionStorage.getItem('productAddedMessage') || 'Product added successfully!';
      
      // Show success message
      setSnackbar({
        open: true,
        message,
        severity: 'success'
      });
      
      // Clear the flags
      sessionStorage.removeItem('productJustAdded');
      sessionStorage.removeItem('productAddedMessage');
    }
    // Disable the initial load notification if this is a direct load/refresh
    // and not navigating from another page with a product added
    else if (!productJustAdded && performance.navigation && performance.navigation.type === 1) {
      // This is a page refresh, set a flag to skip the notification
      sessionStorage.setItem('skipInitialNotification', 'true');
    }
  }, [location.pathname]);

  // Add another useEffect to handle the page load notification behavior
  useEffect(() => {
    if (shouldRefresh) {
      const skipInitialNotification = sessionStorage.getItem('skipInitialNotification') === 'true';
      fetchProducts(skipInitialNotification);
      // Remove the flag after use
      if (skipInitialNotification) {
        sessionStorage.removeItem('skipInitialNotification');
      }
    }
  }, [fetchProducts, shouldRefresh]);

  useEffect(() => {
    const handleFocus = () => {
      setShouldRefresh(true);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const validateForm = () => {
    console.log('Running form validation...');
    console.log('Current form data:', formData);
    console.log('Image preview:', imagePreview);
    
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    // Check for image - either in formData.image or imagePreview must exist
    if (!formData.image && !imagePreview) {
      newErrors.image = 'Product image is required';
      console.log('Image validation failed: No image provided');
    } else {
      console.log('Image validation passed. Image source:', formData.image ? 'formData' : 'imagePreview');
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    if (!formData.stock) {
      newErrors.stock = 'Stock quantity is required';
    } else if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      newErrors.stock = 'Stock must be a non-negative number';
    }

    if (!formData.unit) {
      newErrors.unit = 'Unit is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpen = (product = null) => {
    setErrors({});
    setIsUploading(false);
    setUploadProgress(0);
    setImagePreview(null);
    setSelectedImage(null);
    
    if (product) {
      console.log('Opening form to edit product:', product);
      setEditProduct(product);
      setFormData({
        name: product.name || '',
        price: product.price || '',
        stock: product.stock || '',
        unit: product.unit || 'kg',
        category: product.category || 'vegetables',
        description: product.description || '',
        image: product.image || '',
      });
      
      // If product has an image, set the image preview
      if (product.image) {
        const imageUrl = getDisplayImageUrl(product.image);
        if (imageUrl) {
          console.log('Setting image preview for edit:', imageUrl);
          setImagePreview(imageUrl);
        }
      }
    } else {
      console.log('Opening form to add new product');
      // Reset form for new product
      setEditProduct(null);
      setFormData({
        name: '',
        price: '',
        stock: '',
        unit: 'kg',
        category: 'vegetables',
        description: '',
        image: '',
      });
    }
    
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditProduct(null);
    setSelectedImage(null);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: ''}));
    }
  };

  const handleImageSelect = async (file) => {
    console.log('Image select called with file:', file);
    
    // Reset image state if no file is provided
    if (!file) {
      setSelectedImage(null);
      setImagePreview(null);
      setFormData(prev => ({ ...prev, image: '' }));
    setErrors(prev => ({ ...prev, image: '' }));
      return;
    }
    
    // Validate the image
    const validation = validateImage(file);
    if (!validation.valid) {
      console.error('Image validation failed:', validation.error);
      setErrors(prev => ({ ...prev, image: validation.error }));
      setSnackbar({
        open: true,
        message: validation.error,
        severity: 'error'
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setErrors(prev => ({ ...prev, image: '' }));
    
    try {
      // First create a preview for immediate display
      const preview = await createImagePreview(file);
      console.log('Preview created successfully');
      setImagePreview(preview);
      
      // Then store the image and get the URL
      const imageUrl = await uploadImage(file, (progress) => {
        setUploadProgress(progress);
        console.log(`Upload progress: ${progress}%`);
      });
      
      console.log('Image stored locally:', imageUrl);
      
      // Update the form data with the image URL
      setFormData(prev => ({
        ...prev,
        image: imageUrl
      }));
      
      // Store reference to the file
      setSelectedImage(file);
      
      setSnackbar({
        open: true,
        message: 'Image added successfully (stored locally)',
        severity: 'success'
      });
    } catch (error) {
      console.error('Image processing error:', error);
      setErrors(prev => ({ ...prev, image: error.message || 'Failed to process image' }));
      setSnackbar({
        open: true,
        message: error.message || 'Failed to process image',
        severity: 'error'
      });
      // Reset image state on error
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const getDisplayImageUrl = (imageUrl) => {
    // Return placeholder if no image URL
    if (!imageUrl || imageUrl === '') {
      return null;
    }
    
    console.log('Getting display URL for:', imageUrl);
    
    // Handle local image URLs
    if (imageUrl.startsWith('local://')) {
      const localUrl = getImageUrl(imageUrl);
      if (localUrl) {
        return localUrl;
      } else {
        console.error('Failed to resolve local image:', imageUrl);
        return null;
      }
    }
    
    // Return remote URLs as is
    return imageUrl;
  };

  const handleRemoveImage = () => {
    console.log('Remove image called');
    setSelectedImage(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: '' }));
    setErrors(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Prepare the product data
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10)
      };
      
      let result;
        
        if (editProduct) {
          // Update existing product
        result = await productService.updateProduct(editProduct._id, productData);
        
        // Update the products list
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product._id === editProduct._id ? result.data : product
          )
        );
        
          setSnackbar({
            open: true,
            message: 'Product updated successfully',
            severity: 'success'
          });
        } else {
          // Create new product
        result = await productService.createProduct(productData);
        
        // Add the new product to the list
        setProducts(prevProducts => [result.data, ...prevProducts]);
        
      setSnackbar({
        open: true,
          message: 'Product created successfully',
        severity: 'success'
      });
      }
      
      // Close the dialog and reset form
      handleClose();
      
      // Refresh the product list after a short delay
      setTimeout(() => {
        fetchProducts(true); // Skip notification when refreshing
      }, 500);
    } catch (error) {
      console.error('Error saving product:', error);
      setSnackbar({
        open: true,
        message: `Error saving product: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteConfirm = (product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
      setIsLoading(true);
      
    try {
      // Call the delete product API
      await productService.deleteProduct(productToDelete._id);
      
      // Remove the product from the list
      setProducts(prevProducts => 
        prevProducts.filter(product => product._id !== productToDelete._id)
      );
      
      // Show success message
      setSnackbar({ 
        open: true, 
        message: 'Product deleted successfully',
        severity: 'success' 
      });
      
      // Close the confirmation dialog
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
      
      // Refresh the product list
      fetchProducts(true); // Skip notification when refreshing
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbar({ 
        open: true, 
        message: `Error deleting product: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        severity: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products
    .filter((product) => {
      // Apply search filter
      const nameMatch = product?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply category filter
      const categoryMatch = categoryFilter === 'all' || product?.category === categoryFilter;
      
      // Apply stock status filter
      let stockMatch = true;
      if (stockStatusFilter === 'in-stock') {
        stockMatch = product?.stock > 5;
      } else if (stockStatusFilter === 'low-stock') {
        stockMatch = product?.stock > 0 && product?.stock <= 5;
      } else if (stockStatusFilter === 'out-of-stock') {
        stockMatch = product?.stock === 0;
      }
      
      return nameMatch && categoryMatch && stockMatch;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      switch (sortBy) {
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        case 'stock':
          return (b.stock || 0) - (a.stock || 0);
        case 'stock-asc':
          return (a.stock || 0) - (b.stock || 0);
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });

  const getLowStockCount = () => {
    return products.filter(product => product.stock > 0 && product.stock <= 5).length;
  };

  const getOutOfStockCount = () => {
    return products.filter(product => product.stock === 0).length;
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1);
  };

  const handleSearchChange = (event) => {
    setFilters(prev => ({
      ...prev,
      search: event.target.value
    }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setStockStatusFilter('all');
    setSortBy('name');
    setFilters({
      status: '',
      category: '',
      search: ''
    });
    setPage(1);
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setIsEditing(true);
      setCurrentProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        unit: product.unit,
        category: product.category,
        status: product.status
      });
      setImagePreview(product.images?.map(img => `/uploads/${img}`) || []);
    } else {
      setIsEditing(false);
      setCurrentProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        unit: 'kg',
        category: 'vegetables',
        status: 'active'
      });
      setImagePreview([]);
      setImageFiles([]);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (event) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setImageFiles(filesArray);
      
      const previewsArray = filesArray.map(file => URL.createObjectURL(file));
      setImagePreview(previewsArray);
    }
  };

  const handleSubmitDialog = async () => {
    try {
      setIsLoading(true);
      
      // Validate form
      if (!formData.name || !formData.price || !formData.stock) {
        setSnackbar({
          open: true,
          message: 'Please fill all required fields',
          severity: 'error'
        });
        setIsLoading(false);
        return;
      }
      
      // Prepare the product data with proper type conversion
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10)
      };
      
      let response;
      
      if (isEditing) {
        // Update existing product
        response = await productService.updateProduct(currentProduct._id, productData);
        
        // Update the local products list to reflect changes immediately
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product._id === currentProduct._id ? response.data : product
          )
        );
        
        setSnackbar({
          open: true,
          message: 'Product updated successfully',
          severity: 'success'
        });
      } else {
        // Create new product
        response = await productService.createProduct(productData);
        
        // Add the new product to the list
        setProducts(prevProducts => [response.data, ...prevProducts]);
        
        setSnackbar({
          open: true,
          message: 'Product created successfully',
          severity: 'success'
        });
      }
      
      // Upload images if any
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach(file => {
          formData.append('images', file);
        });
        
        await productService.uploadProductImages(response.data._id, formData);
      }
      
      handleCloseDialog();
      
      // Refresh product list without showing the notification
      const shouldShowNotification = false;
      await fetchProducts(shouldShowNotification);
    } catch (error) {
      console.error('Error saving product:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save product: ' + (error.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Generate data for category chart
  const getCategoryChartData = () => {
    if (!products || products.length === 0) return [];
    
    const categoryMap = {};
    products.forEach(product => {
      const category = product.category || 'Uncategorized';
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });
    
    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  // Colors for category chart
  const CATEGORY_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d'];

  // For bulk actions
  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(product => product._id));
    }
  };

  const handleBulkDelete = () => {
    setBulkActionOpen(true);
  };

  const handleConfirmBulkDelete = async () => {
    try {
      setIsLoading(true);
      // Make API call to delete multiple products
      await Promise.all(selectedProducts.map(id => 
        axios.delete(`${API_BASE_URL}/seller/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ));
      
      // Update UI after deletion
      setProducts(prev => prev.filter(product => !selectedProducts.includes(product._id)));
      setSnackbar({ open: true, message: `${selectedProducts.length} products deleted successfully`, severity: 'success' });
      setSelectedProducts([]);
      setBulkActionOpen(false);
      // Refresh stats
      fetchProducts(true); // Skip notification when refreshing after deletion
    } catch (error) {
      console.error('Error deleting products:', error);
      setSnackbar({ open: true, message: 'Failed to delete products', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateProduct = async (productId) => {
    try {
      setIsLoading(true);
      // Get the product to duplicate
      const productToDuplicate = products.find(product => product._id === productId);
      if (!productToDuplicate) return;
      
      // Create a new product with the same details but a modified name
      const newProductData = {
        ...productToDuplicate,
        name: `${productToDuplicate.name} (Copy)`,
        _id: undefined, // Remove the ID so a new one is generated
        createdAt: undefined,
        updatedAt: undefined
      };
      
      // Make API call to create the new product using productService
      const response = await productService.createProduct(newProductData);
      
      // Update UI after duplication
      setProducts(prev => [...prev, response.data]);
      setSnackbar({ open: true, message: 'Product duplicated successfully', severity: 'success' });
      // Refresh stats and products
      fetchProducts(true); // Skip notification when refreshing after duplication
    } catch (error) {
      console.error('Error duplicating product:', error);
      setSnackbar({ open: true, message: 'Failed to duplicate product: ' + (error.message || 'Unknown error'), severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = (product) => {
    // Redirect to ProductAdd page with product ID
    navigate(`/seller/products/add?id=${product._id}`);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  // Handle quick view
  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  };

  // First, add a new function to the component to handle image errors consistently
  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/400x300/e0e7ff/3b82f6?text=No+Image';
    e.target.style.objectFit = 'cover';
  };

  // Add this function for handling the total products fallback
  const getTotalProductsCount = () => {
    if (stats.totalProducts > 0) {
      return stats.totalProducts;
    } else if (products && products.length > 0) {
      return products.length; // Fallback to length of products array
    }
    return 0;
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ p: 3 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#2c3e50' }}>
            Products
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your product inventory, prices, and details
          </Typography>
        </Box>

          {/* Stats Section */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: '#f0f7ff',
                  border: '1px solid #e0e7ff',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  },
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                  Total Products
                </Typography>
                <Typography variant="h4" sx={{ my: 1, fontWeight: 700, color: '#2c3e50' }}>
                  {isLoading ? <Skeleton width={60} /> : getTotalProductsCount()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.totalProducts > 0 ? 'Active in your inventory' : 'Add your first product'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: '#fff8e6',
                  border: '1px solid #ffecc7',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  },
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                  Low Stock
                </Typography>
                <Typography variant="h4" sx={{ my: 1, fontWeight: 700, color: '#ffa000' }}>
                  {isLoading ? <Skeleton width={60} /> : getLowStockCount()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Products with less than 5 units
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: '#ffeeee',
                  border: '1px solid #ffcccc',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  },
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                  Out of Stock
                </Typography>
                <Typography variant="h4" sx={{ my: 1, fontWeight: 700, color: '#d32f2f' }}>
                  {isLoading ? <Skeleton width={60} /> : getOutOfStockCount()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Products to restock soon
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: '#e6f7ec',
                  border: '1px solid #c7e6d2',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  },
                }}
              >
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/seller/products/add')}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    textTransform: 'none',
                    boxShadow: 'none',
                    bgcolor: '#10b981',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#059669',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                    },
                  }}
                >
                  Add New Product
                </Button>
              </Paper>
            </Grid>
          </Grid>

          {/* Category Chart Section */}
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              borderRadius: 3,
              border: '1px solid #e0e7ff',
              overflow: 'hidden',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            <Box 
              sx={{ 
                p: 2, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#f8fafc' }
              }}
              onClick={() => setShowCategoryChart(!showCategoryChart)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PieChartIcon sx={{ mr: 1, color: '#3b82f6' }} />
                <Typography variant="h6" fontWeight={600} color="#2c3e50">
                  Product Categories Overview
                </Typography>
              </Box>
              <IconButton size="small">
                {showCategoryChart ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={showCategoryChart}>
              <Box sx={{ p: 2, height: 300 }}>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : products.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No products available to show category distribution
                    </Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/seller/products/add')}
                      sx={{ 
                        mt: 2,
                        bgcolor: '#10b981',
                        '&:hover': {
                          bgcolor: '#059669',
                        },
                      }}
                    >
                      Add Your First Product
                    </Button>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getCategoryChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getCategoryChartData().map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </Collapse>
          </Paper>

        {/* Actions Section */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 3,
            border: '1px solid #e0e7ff',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Stock Status</InputLabel>
                <Select
                  value={stockStatusFilter}
                  label="Stock Status"
                  onChange={(e) => setStockStatusFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="in-stock">In Stock</MenuItem>
                  <MenuItem value="low-stock">Low Stock</MenuItem>
                  <MenuItem value="out-of-stock">Out of Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="name">Name (A-Z)</MenuItem>
                  <MenuItem value="price">Price (Low to High)</MenuItem>
                  <MenuItem value="price-desc">Price (High to Low)</MenuItem>
                  <MenuItem value="stock">Stock (High to Low)</MenuItem>
                  <MenuItem value="stock-asc">Stock (Low to High)</MenuItem>
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={1.5}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                aria-label="view mode"
                fullWidth
                sx={{ 
                  height: '100%',
                  '& .MuiToggleButton-root': {
                    border: '1px solid #e0e7ff',
                    borderRadius: '8px !important',
                    py: 1,
                  },
                  '& .MuiToggleButton-root.Mui-selected': {
                    bgcolor: '#3b82f6',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#2563eb',
                    }
                  }
                }}
              >
                <ToggleButton value="grid" aria-label="grid view">
                  <GridViewIcon />
                </ToggleButton>
                <ToggleButton value="list" aria-label="list view">
                  <ViewListIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={6} sm={1.5}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleResetFilters}
                sx={{ 
                  borderRadius: 2,
                  height: '100%',
                  borderColor: '#e0e7ff',
                  color: '#3b82f6',
                  '&:hover': {
                    borderColor: '#3b82f6',
                    bgcolor: 'rgba(59, 130, 246, 0.04)'
                  }
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
          
          {/* Applied filters */}
          {(searchQuery || categoryFilter !== 'all' || stockStatusFilter !== 'all') && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {searchQuery && (
                <Chip 
                  label={`Search: ${searchQuery}`} 
                  onDelete={() => setSearchQuery('')}
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{ borderRadius: 2 }}
                />
              )}
              {categoryFilter !== 'all' && (
                <Chip 
                  label={`Category: ${categoryFilter}`}
                  onDelete={() => setCategoryFilter('all')}
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{ borderRadius: 2 }}
                />
              )}
              {stockStatusFilter !== 'all' && (
                <Chip 
                  label={`Status: ${stockStatusFilter.replace('-', ' ')}`}
                  onDelete={() => setStockStatusFilter('all')}
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{ borderRadius: 2 }}
                />
              )}
            </Box>
          )}
        </Paper>

        {/* Products List with Bulk Selection */}
        <Box sx={{ mt: 4 }}>
          {/* Bulk Actions Bar */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mb: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderRadius: 3,
              border: '1px solid #e0e7ff'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                checkedIcon={<CheckBoxIcon fontSize="small" />}
                checked={products.length > 0 && selectedProducts.length === products.length}
                indeterminate={selectedProducts.length > 0 && selectedProducts.length < products.length}
                onChange={handleSelectAll}
                sx={{
                  color: '#94a3b8',
                  '&.Mui-checked': {
                    color: '#3b82f6',
                  },
                }}
              />
              <Typography variant="body2" color="#64748b">
                {selectedProducts.length > 0 
                  ? `${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''} selected` 
                  : 'Select all products'}
              </Typography>
            </Box>
            
            {selectedProducts.length > 0 && (
              <Box>
                <Button 
                  startIcon={<DeleteIcon />} 
                  onClick={handleBulkDelete}
                  sx={{ 
                    color: '#ef4444',
                    mr: 1,
                    '&:hover': {
                      bgcolor: 'rgba(239, 68, 68, 0.04)'
                    }
                  }}
                >
                  Delete Selected
                </Button>
              </Box>
            )}
          </Paper>
        
          {/* Products List/Grid */}
          <Grid container spacing={2}>
            {isLoading && products.length === 0 ? (
              viewMode === 'grid' ? (
                <Grid container spacing={3}>
                  {Array.from(new Array(6)).map((_, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card elevation={0} sx={{ 
                        borderRadius: 3, 
                        border: '1px solid #e0e7ff', 
                        overflow: 'hidden',
                        minHeight: 450,
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <Box sx={{ position: 'relative', height: 220, width: '100%' }}>
                          <Skeleton 
                            animation="wave" 
                            variant="rectangular" 
                            sx={{ 
                              bgcolor: 'rgba(59, 130, 246, 0.05)',
                              height: '100%',
                              width: '100%',
                              position: 'absolute',
                              top: 0,
                              left: 0
                            }} 
                          />
                        </Box>
                        <CardContent sx={{ 
                          p: 2.5, 
                          flexGrow: 1, 
                          display: 'flex', 
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}>
                          <Box>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                              <Skeleton animation="wave" height={24} width={80} sx={{ borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.05)' }} />
                              <Skeleton animation="wave" height={24} width={80} sx={{ borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.05)' }} />
                            </Box>
                            <Skeleton animation="wave" height={28} width="80%" sx={{ mb: 0.5, bgcolor: 'rgba(59, 130, 246, 0.05)' }} />
                            <Skeleton animation="wave" height={28} width="60%" sx={{ mb: 1.5, bgcolor: 'rgba(59, 130, 246, 0.05)' }} />
                            <Skeleton animation="wave" height={20} width="90%" sx={{ mb: 0.5, bgcolor: 'rgba(59, 130, 246, 0.05)' }} />
                            <Skeleton animation="wave" height={20} width="70%" sx={{ mb: 2, bgcolor: 'rgba(59, 130, 246, 0.05)' }} />
                          </Box>
                          
                          <Box>
                            <Divider sx={{ my: 1.5 }} />
                            <Skeleton animation="wave" height={30} width="40%" sx={{ mb: 0.5, bgcolor: 'rgba(59, 130, 246, 0.05)' }} />
                            <Skeleton animation="wave" height={20} width="60%" sx={{ mb: 0.5, bgcolor: 'rgba(59, 130, 246, 0.05)' }} />
                            <Skeleton animation="wave" height={16} width="50%" sx={{ mb: 0.5, bgcolor: 'rgba(59, 130, 246, 0.05)' }} />
                            <Skeleton animation="wave" height={18} width="30%" sx={{ borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.05)' }} />
                          </Box>
                        </CardContent>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          p: 2,
                          pt: 1.5,
                          pb: 1.5,
                          borderTop: '1px solid #e0e7ff',
                          bgcolor: '#fbfcfe',
                          height: 50,
                        }}>
                          {Array.from(new Array(4)).map((_, i) => (
                            <Skeleton 
                              key={i} 
                              animation="wave" 
                              variant="circular" 
                              width={32} 
                              height={32} 
                              sx={{ bgcolor: 'rgba(59, 130, 246, 0.05)' }} 
                            />
                          ))}
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                // New list view skeleton
                <Grid container spacing={2}>
                  {Array.from(new Array(4)).map((_, index) => (
                    <Grid item xs={12} key={index}>
                      <Card elevation={0} sx={{ 
                        display: 'flex', 
                        height: 200,
                        borderRadius: 3,
                        border: '1px solid #e0e7ff',
                        overflow: 'hidden'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                          <Skeleton 
                            animation="wave" 
                            variant="circular" 
                            width={20} 
                            height={20} 
                            sx={{ bgcolor: 'rgba(59, 130, 246, 0.05)' }} 
                          />
                        </Box>
                        
                        <Box sx={{ 
                          position: 'relative', 
                          minWidth: 180,
                          width: 180,
                          height: '100%',
                        }}>
                          <Skeleton 
                            animation="wave" 
                            variant="rectangular" 
                            sx={{ 
                              bgcolor: 'rgba(59, 130, 246, 0.05)',
                              height: '100%',
                              width: '100%'
                            }} 
                          />
                        </Box>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          width: '100%',
                          p: 2.5,
                        }}>
                          <Box sx={{ mb: 1.5 }}>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                              <Skeleton animation="wave" height={24} width={80} sx={{ borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.05)' }} />
                              <Skeleton animation="wave" height={24} width={80} sx={{ borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.05)' }} />
                            </Box>
                            <Skeleton animation="wave" height={28} width="60%" sx={{ mb: 1, bgcolor: 'rgba(59, 130, 246, 0.05)' }} />
                            <Skeleton animation="wave" height={20} width="80%" sx={{ mb: 1, bgcolor: 'rgba(59, 130, 246, 0.05)' }} />
                            <Skeleton animation="wave" height={20} width="70%" sx={{ mb: 1, bgcolor: 'rgba(59, 130, 246, 0.05)' }} />
                          </Box>
                          
                          <Divider sx={{ my: 1 }} />
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Skeleton animation="wave" height={30} width={100} sx={{ mb: 0.5, bgcolor: 'rgba(59, 130, 246, 0.05)' }} />
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Skeleton animation="wave" height={20} width={80} sx={{ bgcolor: 'rgba(59, 130, 246, 0.05)' }} />
                                <Skeleton animation="wave" height={18} width={60} sx={{ borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.05)' }} />
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          ml: 'auto',
                          p: 1.5,
                          gap: 0.75,
                          borderLeft: '1px solid #e0e7ff',
                          bgcolor: '#fbfcfe',
                          height: '100%',
                          minWidth: 60,
                        }}>
                          {Array.from(new Array(4)).map((_, i) => (
                            <Skeleton 
                              key={i} 
                              animation="wave" 
                              variant="circular" 
                              width={32} 
                              height={32} 
                              sx={{ bgcolor: 'rgba(59, 130, 246, 0.05)' }} 
                            />
                          ))}
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )
            ) : filteredProducts.length === 0 ? (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  width: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  borderRadius: 3,
                  border: '1px solid #e0e7ff'
                }}
              >
                <InventoryIcon sx={{ fontSize: 60, color: '#e0e7ff', mb: 2 }} />
                <Typography variant="h6" color="#64748b" gutterBottom>
                  No products found
                </Typography>
                <Typography variant="body2" color="#94a3b8" align="center" sx={{ mb: 3, maxWidth: 500 }}>
                  {searchQuery ? 
                    `No products match your search for "${searchQuery}". Try adjusting your search terms.` : 
                    'You have no products that match the selected filters. Try clearing the filters or add a new product.'}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/seller/products/add')}
                  sx={{
                    bgcolor: '#3b82f6',
                    borderRadius: 2,
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#2563eb',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                    }
                  }}
                >
                  Add Product
                </Button>
              </Paper>
            ) : viewMode === 'grid' ? (
              filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product._id}>
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card 
                      elevation={0} 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        height: '100%',
                        minHeight: 450, // Increase minimum height for better consistency
                        borderRadius: 3,
                        border: '1px solid #e0e7ff',
                        position: 'relative',
                        overflow: 'hidden', // Change to hidden to prevent content overflow
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.08)'
                        }
                      }}
                    >
                      {/* Add checkbox for bulk selection */}
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        left: 8, 
                        zIndex: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '50%'
                      }}>
                        <Checkbox
                          icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                          checkedIcon={<CheckBoxIcon fontSize="small" />}
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => handleSelectProduct(product._id)}
                          size="small"
                          sx={{
                            color: '#94a3b8',
                            '&.Mui-checked': {
                              color: '#3b82f6',
                            },
                          }}
                        />
                      </Box>
                      
                      {/* Add status badges */}
                      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {product.stock === 0 && (
                          <Chip
                            label="Out of Stock"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444',
                              fontWeight: 500,
                              fontSize: '0.7rem',
                              borderRadius: 2,
                            }}
                          />
                        )}
                        {product.stock > 0 && product.stock <= 10 && (
                          <Chip
                            label="Low Stock"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(245, 158, 11, 0.1)',
                              color: '#d97706',
                              fontWeight: 500,
                              fontSize: '0.7rem',
                              borderRadius: 2,
                            }}
                          />
                        )}
                      </Box>
                      
                      {/* CardMedia and CardContent with fixed heights */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Box sx={{ position: 'relative', height: 220, width: '100%' }}>
                          <CardMedia
                            component="img"
                            height="220"
                            image={getDisplayImageUrl(product?.image)}
                            alt={product?.name || 'Product Image'}
                            sx={{
                              objectFit: 'cover',
                              borderBottom: '1px solid #e0e7ff',
                              bgcolor: '#f8fafc',
                              width: '100%',
                              position: 'absolute',
                              top: 0,
                              left: 0
                            }}
                            onError={handleImageError}
                          />
                        </Box>
                        <CardContent sx={{ 
                          p: 2.5, 
                          flexGrow: 1, 
                          display: 'flex', 
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}>
                          <Box>
                            <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
                              <Chip
                                label={product?.category}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ borderRadius: 2, height: 24 }}
                              />
                              <Chip
                                label={product?.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                size="small"
                                color={product?.stock > 0 ? 'success' : 'error'}
                                variant="outlined"
                                sx={{ borderRadius: 2, height: 24 }}
                              />
                            </Stack>
                            <Typography 
                              variant="h6" 
                              fontWeight={600} 
                              color="#2c3e50"
                              sx={{ 
                                mb: 1,
                                height: 56, // Fixed height for product name
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: 1.4,
                              }}
                            >
                              {product?.name}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="#64748b" 
                              sx={{
                                mb: 2,
                                height: 40, // Fixed height for description
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {product?.description || 'No description available'}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Divider sx={{ my: 1.5 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="h6" color="#3b82f6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  ₹{product?.price}/{product?.unit}
                                </Typography>
                                <Typography variant="body2" color="#64748b" sx={{ mb: 0.5 }}>
                                  Stock: {product?.stock} {product?.unit}
                                </Typography>
                                <Typography variant="caption" color="#64748b" sx={{ display: 'block', mb: 0.5 }}>
                                  Updated: {new Date(product?.updatedAt || product?.createdAt).toLocaleDateString()}
                                </Typography>
                                <Chip 
                                  label={`ID: ${product?._id?.substring(0, 6)}...`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ borderRadius: 2, height: 18, fontSize: '0.6rem' }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Box>
                      
                      {/* Action buttons at bottom with fixed height */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        p: 2,
                        pt: 1.5,
                        pb: 1.5,
                        borderTop: '1px solid #e0e7ff',
                        bgcolor: '#fbfcfe',
                        height: 50,
                      }}>
                        <Tooltip title="Quick View" placement="top" arrow>
                          <IconButton 
                            size="small" 
                            onClick={() => handleQuickView(product)}
                            sx={{ 
                              color: '#64748b',
                              '&:hover': {
                                bgcolor: 'rgba(100, 116, 139, 0.04)',
                                color: '#3b82f6'
                              }
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit in Full Editor" placement="top" arrow>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEdit(product)}
                            sx={{ 
                              color: '#3b82f6',
                              '&:hover': {
                                bgcolor: 'rgba(59, 130, 246, 0.04)'
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Duplicate Product" placement="top" arrow>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDuplicateProduct(product._id)}
                            sx={{ 
                              color: '#8b5cf6',
                              '&:hover': {
                                bgcolor: 'rgba(139, 92, 246, 0.04)'
                              }
                            }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Product" placement="top" arrow>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteConfirm(product)}
                            sx={{ 
                              color: '#ef4444',
                              '&:hover': {
                                bgcolor: 'rgba(239, 68, 68, 0.04)'
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
              ))
            ) : (
              filteredProducts.map((product) => (
                <Grid item xs={12} key={product._id}>
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.99 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card elevation={0} sx={{ 
                      display: 'flex', 
                      height: 200, // Consistent height
                      borderRadius: 3,
                      border: '1px solid #e0e7ff',
                      position: 'relative',
                      overflow: 'hidden', // Change to hidden
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.08)'
                      }
                    }}>
                      {/* Add checkbox for bulk selection */}
                      <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                        <Checkbox
                          icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                          checkedIcon={<CheckBoxIcon fontSize="small" />}
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => handleSelectProduct(product._id)}
                          size="small"
                          sx={{
                            color: '#94a3b8',
                            '&.Mui-checked': {
                              color: '#3b82f6',
                            },
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ 
                        position: 'relative', 
                        minWidth: 180,
                        width: 180,
                        height: '100%',
                        overflow: 'hidden',
                        borderRight: '1px solid #e0e7ff',
                      }}>
                        <CardMedia
                          component="img"
                          sx={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            bgcolor: '#f8fafc',
                          }}
                          image={getDisplayImageUrl(product?.image)}
                          alt={product?.name || 'Product Image'}
                          onError={handleImageError}
                        />
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        width: '100%',
                        overflow: 'hidden',
                        position: 'relative',
                      }}>
                        <CardContent sx={{ 
                          flex: '1 0 auto', 
                          p: 2.5, 
                          overflow: 'hidden',
                        }}>
                          <Box sx={{ mb: 1.5 }}>
                            <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                              <Chip 
                                label={product?.category}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ borderRadius: 2, height: 24 }}
                              />
                              <Chip
                                label={product?.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                size="small"
                                color={product?.stock > 0 ? 'success' : 'error'}
                                variant="outlined"
                                sx={{ borderRadius: 2, height: 24 }}
                              />
                            </Stack>
                            <Typography variant="h6" fontWeight={600} color="#2c3e50" sx={{ 
                              mb: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {product?.name}
                            </Typography>
                            <Typography variant="body2" color="#64748b" sx={{
                              mb: 1,
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              height: 40,
                            }}>
                              {product?.description || 'No description available'}
                            </Typography>
                          </Box>
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="h6" color="#3b82f6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                ₹{product?.price}/{product?.unit}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Typography variant="body2" color="#64748b" sx={{ mr: 1 }}>
                                  Stock: {product?.stock} {product?.unit}
                                </Typography>
                                <Chip 
                                  label={`ID: ${product?._id?.substring(0, 6)}...`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ borderRadius: 2, height: 18, fontSize: '0.6rem' }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Box>
                      
                      {/* Status badges with consistent positioning */}
                      <Box sx={{ position: 'absolute', top: 12, right: 68, zIndex: 2, display: 'flex', gap: 0.5 }}>
                        {product.stock === 0 && (
                          <Chip
                            label="Out of Stock"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444',
                              fontWeight: 500,
                              fontSize: '0.7rem',
                              borderRadius: 2,
                              height: 24,
                            }}
                          />
                        )}
                        {product.stock > 0 && product.stock <= 10 && (
                          <Chip
                            label="Low Stock"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(245, 158, 11, 0.1)',
                              color: '#d97706',
                              fontWeight: 500,
                              fontSize: '0.7rem',
                              borderRadius: 2,
                              height: 24,
                            }}
                          />
                        )}
                      </Box>
                      
                      {/* Action buttons with consistent sizing and spacing */}
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        ml: 'auto',
                        p: 1.5,
                        gap: 0.75,
                        borderLeft: '1px solid #e0e7ff',
                        bgcolor: '#fbfcfe',
                        height: '100%',
                        minWidth: 60,
                      }}>
                        <Tooltip title="Quick View" placement="left" arrow>
                          <IconButton 
                            size="small" 
                            onClick={() => handleQuickView(product)}
                            sx={{ 
                              color: '#64748b',
                              '&:hover': {
                                bgcolor: 'rgba(100, 116, 139, 0.04)',
                                color: '#3b82f6'
                              }
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit in Full Editor" placement="left" arrow>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEdit(product)}
                            sx={{ 
                              color: '#3b82f6', 
                              '&:hover': { 
                                bgcolor: 'rgba(59, 130, 246, 0.04)' 
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Duplicate Product" placement="left" arrow>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDuplicateProduct(product._id)}
                            sx={{ 
                              color: '#8b5cf6',
                              '&:hover': {
                                bgcolor: 'rgba(139, 92, 246, 0.04)'
                              }
                            }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Product" placement="left" arrow>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteConfirm(product)}
                            sx={{ 
                              color: '#ef4444', 
                              '&:hover': { 
                                bgcolor: 'rgba(239, 68, 68, 0.04)' 
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
              ))
            )}
          </Grid>
        </Box>

        {/* Pagination */}
        {!isLoading && filteredProducts.length > 0 && totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 2,
                },
                '& .Mui-selected': {
                  fontWeight: 'bold',
                  bgcolor: 'rgba(59, 130, 246, 0.1)',
                }
              }}
            />
          </Box>
        )}

        {/* Add/Edit Product Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDialog}
          aria-labelledby="product-dialog-title"
          fullWidth
          maxWidth="md"
          PaperProps={{
            elevation: 0,
            sx: {
              borderRadius: 3,
              border: '1px solid #e0e7ff',
              overflow: 'hidden'
            }
          }}
        >
          <Box sx={{ 
            bgcolor: '#3b82f6', 
            py: 2, 
            px: 3,
            color: 'white'
          }}>
            <Typography id="product-dialog-title" variant="h6" fontWeight={600}>
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </Typography>
          </Box>
          <DialogContent sx={{ py: 3 }}>
              <Box component="form" id="product-form" onSubmit={handleSubmitDialog} noValidate sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Product Name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    disabled={isLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight={500} color="#2c3e50">
                        Product Image{' '}
                        <Typography component="span" variant="caption" color="#64748b">
                          (Required)
                        </Typography>
                      </Typography>
                      
                      <Paper
                        elevation={0}
                        sx={{
                          border: errors.image ? '1px dashed #ef4444' : '1px dashed #e0e7ff',
                          borderRadius: 3,
                          bgcolor: 'background.paper',
                          position: 'relative',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            borderColor: '#3b82f6',
                          }
                        }}
                      >
                        <ImageUpload
                          onImageSelect={handleImageChange}
                          defaultImage={imagePreview}
                          isUploading={isUploading}
                          uploadProgress={uploadProgress}
                          error={!!errors.image}
                          helperText={errors.image}
                          onRemoveImage={handleRemoveImage}
                        />
                      </Paper>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleFormChange}
                    error={!!errors.price}
                    helperText={errors.price}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: <span style={{ marginRight: 8 }}>₹</span>
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Stock"
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleFormChange}
                    error={!!errors.stock}
                    helperText={errors.stock}
                    disabled={isLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.unit} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                    <InputLabel>Unit</InputLabel>
                    <Select
                      name="unit"
                      value={formData.unit}
                      label="Unit"
                      onChange={handleFormChange}
                      disabled={isLoading}
                    >
                      <MenuItem value="kg">Kilogram (kg)</MenuItem>
                      <MenuItem value="g">Gram (g)</MenuItem>
                      <MenuItem value="piece">Piece</MenuItem>
                      <MenuItem value="dozen">Dozen</MenuItem>
                      <MenuItem value="bundle">Bundle</MenuItem>
                      <MenuItem value="box">Box</MenuItem>
                    </Select>
                    {errors.unit && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                        {errors.unit}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.category} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      label="Category"
                      onChange={handleFormChange}
                      disabled={isLoading}
                    >
                      <MenuItem value="vegetables">Vegetables</MenuItem>
                      <MenuItem value="fruits">Fruits</MenuItem>
                      <MenuItem value="herbs">Herbs</MenuItem>
                      <MenuItem value="organic">Organic</MenuItem>
                      <MenuItem value="custom" sx={{ color: '#3b82f6', fontWeight: 600 }}>
                        + Add New Category
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    error={!!errors.description}
                    helperText={errors.description}
                    disabled={isLoading}
                    multiline
                    rows={3}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                {isEditing && (
                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      bgcolor: 'rgba(59, 130, 246, 0.05)',
                      borderRadius: 3
                    }}>
                      <Typography variant="subtitle2" gutterBottom fontWeight={600} color="#3b82f6">
                        Product Details
                      </Typography>
                      <Typography variant="body2" color="#64748b" paragraph>
                        ID: {currentProduct?._id}
                      </Typography>
                      <Typography variant="body2" color="#64748b" paragraph>
                        Created: {new Date(currentProduct?.createdAt).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="#64748b" paragraph>
                        Last Updated: {new Date(currentProduct?.updatedAt).toLocaleString()}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #fee2e2' }}>
            <Button 
              onClick={handleCloseDialog} 
              disabled={isLoading}
              sx={{ 
                color: '#64748b',
                '&:hover': {
                  bgcolor: 'rgba(100, 116, 139, 0.04)'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              form="product-form"
              type="submit"
              variant="contained"
              color="primary" 
              disabled={isLoading}
              sx={{
                bgcolor: '#3b82f6',
                borderRadius: 2,
                boxShadow: 'none',
                px: 3,
                '&:hover': {
                  bgcolor: '#2563eb',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                }
              }}
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                  Saving...
                </Box>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          aria-labelledby="delete-confirmation-dialog"
          aria-describedby="delete-confirmation-description"
          PaperProps={{
            elevation: 0,
            sx: {
              borderRadius: 3,
              border: '1px solid #fee2e2'
            }
          }}
        >
          <Box sx={{ 
            bgcolor: '#fee2e2', 
            py: 2, 
            px: 3,
            color: '#b91c1c'
          }}>
            <Typography id="delete-confirmation-dialog" variant="h6" fontWeight={600}>
              Delete Product
            </Typography>
          </Box>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DeleteIcon sx={{ color: '#ef4444', mr: 2, fontSize: 28 }} />
              <Typography variant="h6" color="#2c3e50" fontWeight={600}>
                {productToDelete?.name}
              </Typography>
            </Box>
            <Typography variant="body1" color="#64748b">
              Are you sure you want to delete this product? This action cannot be undone.
            </Typography>
            {productToDelete?.stock > 0 && (
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: '#fff9ec', 
                borderRadius: 2,
                border: '1px solid #fef3c7'
              }}>
                <Typography variant="body2" color="#92400e">
                  Warning: This product has {productToDelete.stock} {productToDelete.unit} in stock.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #fee2e2' }}>
            <Button 
              onClick={() => setDeleteConfirmOpen(false)} 
              sx={{ 
                color: '#64748b',
                '&:hover': {
                  bgcolor: 'rgba(100, 116, 139, 0.04)'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete} 
              variant="contained"
              color="error"
              sx={{
                bgcolor: '#ef4444',
                borderRadius: 2,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#dc2626',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                }
              }}
            >
              Delete Product
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Delete Confirmation Dialog */}
        <Dialog
          open={bulkActionOpen}
          onClose={() => setBulkActionOpen(false)}
          aria-labelledby="bulk-delete-confirmation-dialog"
          PaperProps={{
            elevation: 0,
            sx: {
              borderRadius: 3,
              border: '1px solid #fee2e2'
            }
          }}
        >
          <Box sx={{ 
            bgcolor: '#fee2e2', 
            py: 2, 
            px: 3,
            color: '#b91c1c'
          }}>
            <Typography id="bulk-delete-confirmation-dialog" variant="h6" fontWeight={600}>
              Delete Multiple Products
            </Typography>
          </Box>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DeleteIcon sx={{ color: '#ef4444', mr: 2, fontSize: 28 }} />
              <Typography variant="h6" color="#2c3e50" fontWeight={600}>
                {selectedProducts.length} Products Selected
              </Typography>
            </Box>
            <Typography variant="body1" color="#64748b">
              Are you sure you want to delete {selectedProducts.length} products? This action cannot be undone.
            </Typography>
            
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: '#fff9ec', 
              borderRadius: 2,
              border: '1px solid #fef3c7'
            }}>
              <Typography variant="body2" color="#92400e">
                Warning: Some of these products may have stock and active listings.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #fee2e2' }}>
            <Button 
              onClick={() => setBulkActionOpen(false)}
              sx={{ 
                color: '#64748b',
                '&:hover': {
                  bgcolor: 'rgba(100, 116, 139, 0.04)'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmBulkDelete}
              variant="contained"
              color="error"
              sx={{
                bgcolor: '#ef4444',
                borderRadius: 2,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#dc2626',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                }
              }}
            >
              Delete {selectedProducts.length} Products
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ 
            '& .MuiPaper-root': {
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }
          }}
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

        {/* Quick View Dialog */}
        <Dialog
          open={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
          aria-labelledby="quick-view-dialog"
          maxWidth="md"
          fullWidth
          PaperProps={{
            elevation: 0,
            sx: {
              borderRadius: 3,
              border: '1px solid #e0e7ff',
              overflow: 'hidden'
            }
          }}
        >
          <Box sx={{ 
            bgcolor: '#3b82f6', 
            py: 2, 
            px: 3,
            color: 'white'
          }}>
            <Typography id="quick-view-dialog" variant="h6" fontWeight={600}>
              Product Details
            </Typography>
          </Box>
          <DialogContent sx={{ p: 0 }}>
            {quickViewProduct && (
              <Box>
                <Grid container>
                  <Grid item xs={12} md={5} sx={{ position: 'relative' }}>
                    <Box 
                      sx={{ 
                        position: 'relative',
                        width: '100%', 
                        paddingTop: '100%', // Square aspect ratio (1:1)
                        bgcolor: '#f8fafc',
                        overflow: 'hidden'
                      }}
                    >
                      <Box 
                        component="img"
                        src={getDisplayImageUrl(quickViewProduct?.image)}
                        alt={quickViewProduct?.name}
                        onError={handleImageError}
                        sx={{ 
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRight: {xs: 'none', md: '1px solid #e0e7ff'},
                          borderBottom: {xs: '1px solid #e0e7ff', md: 'none'},
                        }}
                      />
                    </Box>
                    {/* Add status badges */}
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 12, 
                      right: 12, 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: 0.5 
                    }}>
                      {quickViewProduct.stock === 0 && (
                        <Chip
                          label="Out of Stock"
                          size="small"
                          sx={{
                            bgcolor: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            fontWeight: 500,
                            fontSize: '0.7rem',
                            borderRadius: 2,
                            height: 24,
                          }}
                        />
                      )}
                      {quickViewProduct.stock > 0 && quickViewProduct.stock <= 10 && (
                        <Chip
                          label="Low Stock"
                          size="small"
                          sx={{
                            bgcolor: 'rgba(245, 158, 11, 0.1)',
                            color: '#d97706',
                            fontWeight: 500,
                            fontSize: '0.7rem',
                            borderRadius: 2,
                            height: 24,
                          }}
                        />
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <Box sx={{ p: 3 }}>
                      <Box sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                          <Chip 
                            label={quickViewProduct?.category}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ borderRadius: 2, height: 24 }}
                          />
                          <Chip
                            label={quickViewProduct?.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            size="small"
                            color={quickViewProduct?.stock > 0 ? 'success' : 'error'}
                            variant="outlined"
                            sx={{ borderRadius: 2, height: 24 }}
                          />
                        </Stack>
                        
                        <Typography 
                          variant="h5" 
                          gutterBottom 
                          fontWeight={600} 
                          color="#2c3e50"
                          sx={{
                            mt: 1,
                            mb: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {quickViewProduct?.name}
                        </Typography>
                        
                        <Typography variant="h4" color="#3b82f6" sx={{ fontWeight: 600, my: 2 }}>
                          ₹{quickViewProduct?.price}/{quickViewProduct?.unit}
                        </Typography>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1, 
                          mb: 2, 
                          p: 2, 
                          bgcolor: 'rgba(59, 130, 246, 0.05)',
                          borderRadius: 2
                        }}>
                          <InventoryIcon sx={{ color: '#3b82f6' }} />
                          <Typography variant="body1" color="#64748b">
                            <Typography component="span" fontWeight={600} color="#2c3e50">
                              {quickViewProduct?.stock}
                            </Typography> {quickViewProduct?.unit} in stock
                          </Typography>
                        </Box>
                        
                        <Typography variant="subtitle1" fontWeight={600} color="#2c3e50" gutterBottom>
                          Description
                        </Typography>
                        <Typography variant="body2" color="#64748b" paragraph>
                          {quickViewProduct?.description || 'No description available'}
                        </Typography>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Typography variant="subtitle1" fontWeight={600} color="#2c3e50" gutterBottom>
                          Product Details
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="#64748b">
                              <strong>ID:</strong> {quickViewProduct?._id}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="#64748b">
                              <strong>Category:</strong> {quickViewProduct?.category}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="#64748b">
                              <strong>Unit:</strong> {quickViewProduct?.unit}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="#64748b">
                              <strong>Created:</strong> {new Date(quickViewProduct?.createdAt).toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="#64748b">
                              <strong>Last Updated:</strong> {new Date(quickViewProduct?.updatedAt).toLocaleString()}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e7ff' }}>
            <Button 
              onClick={() => setQuickViewOpen(false)}
              sx={{ 
                color: '#64748b',
                '&:hover': {
                  bgcolor: 'rgba(100, 116, 139, 0.04)'
                }
              }}
            >
              Close
            </Button>
            <Button 
              variant="contained"
              onClick={() => {
                setQuickViewOpen(false);
                handleEdit(quickViewProduct);
              }}
              sx={{
                bgcolor: '#3b82f6',
                borderRadius: 2,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#2563eb',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                }
              }}
            >
              Edit in Full Editor
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Products; 
