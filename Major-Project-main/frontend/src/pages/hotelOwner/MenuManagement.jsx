import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  Pagination,
  Skeleton,
  Stack,
  useMediaQuery,
  useTheme,
  InputAdornment,
  FormControlLabel,
  RadioGroup,
  Radio,
  Switch,
  FormHelperText,
  Zoom,
  Slide,
  FormGroup,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import CloseIcon from '@mui/icons-material/Close';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PreviewIcon from '@mui/icons-material/Preview';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import MenuIcon from '@mui/icons-material/Menu';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckIcon from '@mui/icons-material/Check';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { getMenuItems, getMenuItem, addMenuItem, updateMenuItem, deleteMenuItem, getMenuCategories } from '../../services/api.jsx';
import { uploadImage } from '../../lib/imageUpload.jsx';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

// Define a local placeholder image URL that won't fail 
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" text-anchor="middle" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';

// Default fallback image URL - using a data URI to prevent network errors
const DEFAULT_FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23f8d7da"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" text-anchor="middle" fill="%23721c24"%3EError Loading Image%3C/text%3E%3C/svg%3E';

// Enhanced Image component with proper loading and error handling
const ImageWithFallback = ({ src, alt, style, ...props }) => {
  const [hasError, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processedSrc, setProcessedSrc] = useState(src || PLACEHOLDER_IMAGE);
  
  // Process and validate the image source
  useEffect(() => {
    // If src is empty or invalid, use placeholder
    if (!src || typeof src !== 'string' || src.trim() === '') {
      setProcessedSrc(PLACEHOLDER_IMAGE);
      setLoading(false);
      return;
    }
    
    // Reset error state when src changes
    setError(false);
    setLoading(true);
    
    // If src is a data URI or valid URL, use it directly
    setProcessedSrc(src);
    
    // For data URIs, we can immediately stop loading since they're already loaded
    if (src.startsWith('data:')) {
      setLoading(false);
    }
  }, [src]);
  
  return (
    <Box sx={{ position: 'relative', ...style }}>
      {loading && (
        <Box sx={{ 
          position: 'absolute', 
          top: 0, left: 0, 
          width: '100%', height: '100%', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0,0,0,0.05)'
        }}>
          <CircularProgress size={30} />
        </Box>
      )}
      
      {hasError ? (
        <Box component="img" 
          src={DEFAULT_FALLBACK}
          alt={alt || "Failed to load image"}
          sx={{ 
            width: '100%',
            height: style?.height || 'auto',
            objectFit: 'cover',
            borderRadius: 1
          }}
          {...props}
        />
      ) : (
        <Box component="img"
          src={processedSrc}
          alt={alt || "Menu item"}
          sx={{ 
            width: '100%',
            height: style?.height || 'auto',
            objectFit: 'cover',
            borderRadius: 1,
            opacity: loading ? 0.5 : 1,
            transition: 'opacity 0.3s ease'
          }}
          onError={() => {
            console.error('Image failed to load:', processedSrc.substring(0, 50) + '...');
            setError(true);
            setLoading(false);
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', processedSrc.substring(0, 50) + '...');
            setLoading(false);
          }}
          {...props}
        />
      )}
    </Box>
  );
};

const MenuManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  // State for menu items
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(12);
  
  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
    preparationTime: 15,
    imageUrl: '',
    tempImagePreview: null
  });
  
  // Add form validation state
  const [formErrors, setFormErrors] = useState({});
  
  // State for categories
  const [categories, setCategories] = useState([]);
  
  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Add a new state for image upload
  const [imageUploading, setImageUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  
  // File input ref
  const fileInputRef = useRef(null);
  
  // Add new state for delete confirmation
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Fetch menu items on component mount
  useEffect(() => {
    console.log('Menu Management component mounted');
    fetchMenuItems();
    fetchCategories();
  }, [page]);
  
  // Fetch menu items from API
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      console.log('Fetching menu items...');
      const response = await getMenuItems(page, itemsPerPage);
      
      if (response.data) {
        console.log('Menu items fetched:', response.data);
        
        // Check if response.data is an array or has a specific structure
        const items = Array.isArray(response.data) ? response.data : 
                     (response.data.items || response.data.menuItems || []);
        
        setMenuItems(items);
        setFilteredItems(items);
        
        // Set total pages if pagination info is available
        if (response.data.totalPages) {
          setTotalPages(response.data.totalPages);
        } else if (response.data.total) {
          setTotalPages(Math.ceil(response.data.total / itemsPerPage));
        }
        
        console.log('Task completed: Fetched menu items successfully');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Failed to fetch menu items. Please try again.');
      setLoading(false);
      console.log('Task failed: Error fetching menu items');
    }
  };
  
  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      console.log('Fetching menu categories...');
      
      // Try both API endpoints to ensure we get categories
      try {
        const response = await getMenuCategories();
        
        if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
          const uniqueCategories = [...new Set(response.data)].sort();
          console.log('Categories fetched from API:', uniqueCategories);
          setCategories(uniqueCategories);
          console.log('Task completed: Fetched menu categories successfully');
          return;
        }
      } catch (primaryError) {
        console.warn('Primary categories endpoint failed:', primaryError);
      }
      
      // Fallback to hardcoded categories if API fails or returns empty array
      console.log('Using default categories list');
      setCategories([
        'Appetizer', 
        'Main Course', 
        'Dessert', 
        'Beverage', 
        'Special', 
        'Breakfast', 
        'Lunch', 
        'Dinner', 
        'Snacks',
        'Soup',
        'Salad',
        'Pasta',
        'Rice Dish',
        'Seafood',
        'Vegetarian',
        'Vegan',
        'Gluten-Free',
        'Street Food',
        'Pizza',
        'Burger',
        'Sandwich',
        'Fast Food',
        'Healthy Options',
        'Chef\'s Special'
      ]);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Use default categories if API fails
      setCategories([
        'Appetizer', 
        'Main Course', 
        'Dessert', 
        'Beverage', 
        'Special', 
        'Breakfast', 
        'Lunch', 
        'Dinner', 
        'Snacks',
        'Soup',
        'Salad',
        'Pasta',
        'Rice Dish',
        'Seafood',
        'Vegetarian',
        'Vegan',
        'Gluten-Free',
        'Street Food',
        'Pizza',
        'Burger',
        'Sandwich',
        'Fast Food',
        'Healthy Options',
        'Chef\'s Special'
      ]);
    }
  };
  
  // Open dialog for creating or editing an item
  const handleOpenDialog = (item = null) => {
    if (item) {
      // Edit mode
      setCurrentItem(item);
      
      // Log image URL for debugging
      console.log('Opening dialog with item image:', item.image);
      
      setFormData({
        name: item.name || '',
        description: item.description || '',
        price: item.price || '',
        category: item.category || '',
        isVegetarian: item.isVegetarian || false,
        isVegan: item.isVegan || false,
        isGlutenFree: item.isGlutenFree || false,
        isAvailable: item.isAvailable !== false, // default to true if undefined
        preparationTime: item.preparationTime || 15,
        imageUrl: item.image || '', // Use imageUrl property instead of image
        tempImagePreview: null // Ensure tempImagePreview is null for existing items
      });
      
      // Set image file to null since we're editing an existing item
      setImageFile(null);
      // Clear any form errors
      setFormErrors({});
    } else {
      // Create mode
      setCurrentItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isAvailable: true,
        preparationTime: 15,
        imageUrl: '', // Use imageUrl property instead of image
        tempImagePreview: null // Ensure tempImagePreview is explicitly set to null
      });
      
      // Set image file to null for new item
      setImageFile(null);
      // Clear any form errors
      setFormErrors({});
    }
    setDialogOpen(true);
  };
  
  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentItem(null);
  };

  // Handle form input changes with real-time validation
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    // Special handling for price field
    if (name === 'price') {
      // Only allow numbers and a single decimal point
      if (!/^(\d+)?(\.\d{0,2})?$/.test(value) && value !== '') {
        // If invalid input, don't update state
        return;
      }
      
      // If there are more than 2 decimal places, truncate
      if (value.includes('.') && value.split('.')[1].length > 2) {
        newValue = parseFloat(value).toFixed(2);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Perform real-time validation
    validateField(name, newValue);
  };

  // Validate a single field and update formErrors
  const validateField = (fieldName, value) => {
    let errors = { ...formErrors };
    
    switch (fieldName) {
      case 'name':
        if (!value || value.trim() === '') {
          errors.name = 'Item name is required';
        } else if (value.trim().length < 3) {
          errors.name = 'Item name must be at least 3 characters';
        } else if (value.length > 100) {
          errors.name = 'Item name cannot exceed 100 characters';
        } else if (!/^[a-zA-Z0-9\s&\-.'()]+$/.test(value)) {
          errors.name = 'Item name contains invalid characters';
        } else {
          delete errors.name;
        }
        break;
        
      case 'description':
        if (!value || value.trim() === '') {
          errors.description = 'Description is required';
        } else if (value.trim().length < 10) {
          errors.description = 'Description must be at least 10 characters';
        } else if (value.length > 1000) {
          errors.description = 'Description cannot exceed 1000 characters';
        } else {
          delete errors.description;
        }
        break;
        
      case 'price':
        if (!value) {
          errors.price = 'Price is required';
        } else if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          errors.price = 'Price must be a number with up to 2 decimal places';
        } else {
          const price = parseFloat(value);
          if (isNaN(price)) {
            errors.price = 'Price must be a number';
          } else if (price <= 0) {
            errors.price = 'Price must be greater than 0';
          } else if (price > 100000) {
            errors.price = 'Price is too high (max ₹100,000)';
          } else {
            delete errors.price;
          }
        }
        break;
        
      case 'category':
        if (!value || value.trim() === '') {
          errors.category = 'Category is required';
        } else if (value.trim().length < 2) {
          errors.category = 'Category name is too short';
        } else {
          delete errors.category;
        }
        break;
        
      case 'preparationTime':
        if (value) {
          const prepTime = parseInt(value);
          if (isNaN(prepTime)) {
            errors.preparationTime = 'Preparation time must be a number';
          } else if (prepTime <= 0) {
            errors.preparationTime = 'Preparation time must be greater than 0';
          } else if (prepTime > 240) {
            errors.preparationTime = 'Preparation time cannot exceed 240 minutes';
          } else if (!/^\d+$/.test(value)) {
            errors.preparationTime = 'Preparation time must be a whole number';
          } else {
            delete errors.preparationTime;
          }
        } else {
          delete errors.preparationTime;
        }
        break;
        
      case 'imageUrl':
        if (value) {
          if (typeof value === 'string' && value.length > 5 * 1024 * 1024) {
            errors.imageUrl = 'Image size is too large (max 5MB)';
          } else {
            delete errors.imageUrl;
          }
        } else {
          delete errors.imageUrl;
        }
        break;
        
      default:
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fix the validateForm function with better validation rules
  const validateForm = () => {
    const errors = {};
    // Use the same isAddingNewItem definition as in handleSaveItem
    const isAddingNewItem = !currentItem;
    
    // Name validation
    if (!formData.name || formData.name.trim().length < 3) {
      errors.name = "Name must be at least 3 characters long";
    } else if (formData.name.trim().length > 50) {
      errors.name = "Name must be less than 50 characters";
    } else if (!/^[a-zA-Z0-9\s,.'-]+$/.test(formData.name)) {
      errors.name = "Name contains invalid characters";
    }

    // Description validation
    if (!formData.description || formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters long";
    } else if (formData.description.trim().length > 500) {
      errors.description = "Description must be less than 500 characters";
    }

    // Price validation
    if (!formData.price) {
      errors.price = "Price is required";
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price.toString())) {
      errors.price = "Price must be a number with up to 2 decimal places";
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      errors.price = "Price must be greater than 0";
    }

    // Category validation
    if (!formData.category || formData.category.trim().length < 1) {
      errors.category = "Please select a category";
    }

    // Preparation time validation
    if (!formData.preparationTime) {
      errors.preparationTime = "Preparation time is required";
    } else if (!/^\d+$/.test(formData.preparationTime.toString())) {
      errors.preparationTime = "Preparation time must be a whole number";
    } else if (parseInt(formData.preparationTime) <= 0) {
      errors.preparationTime = "Preparation time must be greater than 0";
    }

    // Image validation
    if (isAddingNewItem && !formData.imageUrl && !formData.tempImagePreview) {
      errors.imageUrl = "Please select an image";
    } else if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      errors.imageUrl = "Image size must be less than 5MB";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save menu item (create or update)
  const handleSaveItem = async () => {
    console.log('Validating form...');
    // Define isAddingNewItem here instead of inside validateForm
    const isAddingNewItem = !currentItem;
    
    if (!validateForm()) {
      console.log('Form validation failed:', formErrors);
      enqueueSnackbar('Please fix the form errors before saving', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      console.log('Preparing to save menu item with data:', formData);
      let finalImageUrl = formData.imageUrl;

      // If we have a tempImagePreview but no imageUrl, use the tempImagePreview
      if (!finalImageUrl && formData.tempImagePreview) {
        finalImageUrl = formData.tempImagePreview;
        console.log('Using tempImagePreview as fallback');
      }

      // Upload image if a new file has been selected
      if (imageFile) {
        try {
          console.log('Uploading image file...');
          const uploadResult = await uploadImage(imageFile);
          
          // Handle different response formats
          if (typeof uploadResult === 'string') {
            finalImageUrl = uploadResult;
          } else if (uploadResult && typeof uploadResult === 'object' && uploadResult.url) {
            finalImageUrl = uploadResult.url;
          }
          
          console.log('Image upload successful. URL:', finalImageUrl);
        } catch (imageError) {
          console.error('Error uploading image:', imageError);
          // If upload failed but we have a tempImagePreview, use that
          if (formData.tempImagePreview) {
            finalImageUrl = formData.tempImagePreview;
            console.log('Using tempImagePreview after upload failure');
          }
          enqueueSnackbar('Error uploading image, but proceeding with save', { variant: 'warning' });
        }
      }

      const menuItemData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        preparationTime: parseInt(formData.preparationTime),
        isVegetarian: formData.isVegetarian,
        isVegan: formData.isVegan,
        isGlutenFree: formData.isGlutenFree,
        isAvailable: formData.isAvailable,
        // Use the image property for API compatibility
        image: finalImageUrl
      };

      console.log('Saving menu item with processed data:', menuItemData);

      if (isAddingNewItem) {
        console.log('Adding new menu item...');
        await addMenuItem(menuItemData);
        enqueueSnackbar('Menu item added successfully!', { variant: 'success' });
      } else {
        console.log('Updating existing menu item...');
        await updateMenuItem(currentItem._id, menuItemData);
        enqueueSnackbar('Menu item updated successfully!', { variant: 'success' });
      }

      fetchMenuItems();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving menu item:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save menu item. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to optimize large data URIs
  const optimizeDataURI = (dataURI, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      try {
        // Create an image element
        const img = new Image();
        
        img.onload = () => {
          try {
            // Create a canvas to resize the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set maximum dimensions
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            
            let { width, height } = img;
            
            // Calculate new dimensions while maintaining aspect ratio
            if (width > height) {
              if (width > MAX_WIDTH) {
                height = Math.round(height * (MAX_WIDTH / width));
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = Math.round(width * (MAX_HEIGHT / height));
                height = MAX_HEIGHT;
              }
            }
            
            // Set canvas dimensions and draw resized image
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            // Get optimized data URI with reduced quality
            const optimizedDataURI = canvas.toDataURL('image/jpeg', quality);
            
            console.log(`Optimized data URI from ${dataURI.length} to ${optimizedDataURI.length} bytes`);
            resolve(optimizedDataURI);
          } catch (err) {
            console.error('Error in canvas processing:', err);
            reject(err);
          }
        };
        
        img.onerror = (err) => {
          console.error('Error loading image for optimization:', err);
          reject(new Error('Failed to load image for optimization'));
        };
        
        // Start the process by setting the source
        img.src = dataURI;
      } catch (err) {
        console.error('Error in optimization setup:', err);
        reject(err);
      }
    });
  };

  // Open delete confirmation dialog
  const handleOpenDeleteConfirmation = (item) => {
    setItemToDelete(item);
    setDeleteConfirmationOpen(true);
  };
  
  // Close delete confirmation dialog
  const handleCloseDeleteConfirmation = () => {
    setDeleteConfirmationOpen(false);
    setItemToDelete(null);
  };
  
  // Confirm and execute deletion
  const handleConfirmDelete = async () => {
    if (!itemToDelete || !itemToDelete._id) {
      console.error('No item ID provided for deletion');
      setDeleteConfirmationOpen(false);
        return;
      }
      
    try {
      setLoading(true);
      console.log('Deleting menu item:', itemToDelete._id);
      
      const response = await deleteMenuItem(itemToDelete._id);
      
      if (response) {
        // Show success message
      enqueueSnackbar('Menu item deleted successfully', { variant: 'success' });
        
        // Remove the item from the local state
        setMenuItems(prev => prev.filter(item => item._id !== itemToDelete._id));
        setFilteredItems(prev => prev.filter(item => item._id !== itemToDelete._id));
        
        console.log('Menu item deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting menu item:', err);
      
      // Show error message
      enqueueSnackbar(`Failed to delete menu item: ${err.response?.data?.message || err.message || 'Unknown error'}`, { variant: 'error' });
    } finally {
      setLoading(false);
      setDeleteConfirmationOpen(false);
      setItemToDelete(null);
    }
  };

  // Handle page change for pagination
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Apply search filter on all menu items
    applyFiltersAndSort(value, filterCategory, sortBy, sortOrder);
  };
  
  // Handle category filter change
  const handleCategoryFilterChange = (e) => {
    const category = e.target.value;
    setFilterCategory(category);
    
    // Apply category filter on current items
    applyFiltersAndSort(searchTerm, category, sortBy, sortOrder);
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    
    // Apply sorting on current filtered items
    applyFiltersAndSort(searchTerm, filterCategory, value, sortOrder);
  };
  
  // Handle sort order change
  const handleSortOrderChange = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    
    // Apply new sort order on current filtered items
    applyFiltersAndSort(searchTerm, filterCategory, sortBy, newOrder);
  };
  
  // Central function to apply all filters and sort
  const applyFiltersAndSort = (search, category, sort, order) => {
    console.log(`Applying filters - Search: "${search}", Category: "${category}", Sort: ${sort}, Order: ${order}`);
    
    // Start with all menu items
    let filtered = [...menuItems];
    
    // Apply search filter if provided
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(item => 
        (item.name && item.name.toLowerCase().includes(searchLower)) || 
        (item.description && item.description.toLowerCase().includes(searchLower)) ||
        (item.category && item.category.toLowerCase().includes(searchLower)) ||
        (item.price && item.price.toString().includes(searchLower))
      );
    }
    
    // Apply category filter if not 'all'
    if (category && category !== 'all') {
      filtered = filtered.filter(item => item.category === category);
    }
    
    // Apply sorting
    if (sort) {
      filtered.sort((a, b) => {
        let valueA, valueB;
        
        // Get the values to compare based on sort field
        switch (sort) {
      case 'name':
            valueA = a.name || '';
            valueB = b.name || '';
            return order === 'asc' 
              ? valueA.localeCompare(valueB) 
              : valueB.localeCompare(valueA);
          
      case 'price':
            valueA = parseFloat(a.price) || 0;
            valueB = parseFloat(b.price) || 0;
            return order === 'asc' ? valueA - valueB : valueB - valueA;
          
      case 'category':
            valueA = a.category || '';
            valueB = b.category || '';
            return order === 'asc' 
              ? valueA.localeCompare(valueB) 
              : valueB.localeCompare(valueA);
            
          case 'createdAt':
            valueA = new Date(a.createdAt || 0);
            valueB = new Date(b.createdAt || 0);
            return order === 'asc' 
              ? valueA - valueB 
              : valueB - valueA;
            
      default:
            return 0;
        }
      });
    }
    
    // Update filtered items state
    setFilteredItems(filtered);
    console.log(`Applied filters resulted in ${filtered.length} items`);
  };
  
  // Handle image file selection with better validation and handling of URL objects
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      enqueueSnackbar('Invalid file type. Please select a JPEG, PNG, WebP, or GIF image.', { variant: 'error' });
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      enqueueSnackbar('Image file is too large. Maximum size is 5MB.', { variant: 'error' });
      return;
    }
    
    try {
      // Update UI to show upload in progress
      setImageUploading(true);
      setImageFile(file);
      
      // Show a preview immediately
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          tempImagePreview: event.target.result
        }));
      };
      reader.readAsDataURL(file);
      
      // Attempt to upload the image
      console.log('Uploading image file:', file.name, 'size:', Math.round(file.size / 1024), 'KB');
      
      const response = await uploadImage(file);
      console.log('Upload response:', response);
      
      // Extract the URL whether it's a string or an object with a url property
      let imageUrl;
      if (typeof response === 'string') {
        imageUrl = response;
      } else if (response && typeof response === 'object') {
        imageUrl = response.url || null;
      }
        
      if (imageUrl) {
        console.log('Image uploaded successfully:', imageUrl);
        
        // Update form with the final image URL
        setFormData(prev => ({
          ...prev,
          imageUrl: imageUrl,
          tempImagePreview: null // Clear preview as we have the real URL now
        }));
        
        // Show success notification
        enqueueSnackbar('Image uploaded successfully', { variant: 'success' });
      } else {
        throw new Error('No valid URL returned from image upload');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      
      // Keep the preview but show error
      enqueueSnackbar(`Failed to upload image: ${err.message || 'Unknown error'}`, { variant: 'error' });
      
      // Don't clear the temp preview so user can still see what they selected
    } finally {
      setImageUploading(false);
    }
  };
  
  // Trigger file input click
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Render menu item card
  const renderMenuItem = (item) => {
    // Get the image source with proper fallback
    const imageSrc = item.image || PLACEHOLDER_IMAGE;
    
    return (
      <Card 
        elevation={3} 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: 8
          },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Availability status indicator */}
        {!item.isAvailable && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: -50,
              transform: 'rotate(45deg)',
              bgcolor: 'error.main',
              color: 'white',
              width: 180,
              textAlign: 'center',
              py: 0.5,
              zIndex: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.25)'
            }}
          >
            <Typography variant="caption" fontWeight="bold">
              UNAVAILABLE
            </Typography>
          </Box>
        )}
        
        <Box sx={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
          <ImageWithFallback
            src={imageSrc}
            alt={item.name}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          />
          
          {/* Item badges */}
          <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 0.5 }}>
            {item.isVegetarian && (
              <Chip
                label="Veg"
                size="small"
                color="success" 
                sx={{ fontSize: '0.7rem', height: 24, fontWeight: 'bold' }}
              />
            )}
            {item.isVegan && (
              <Chip
                label="Vegan"
                size="small"
                color="info" 
                sx={{ fontSize: '0.7rem', height: 24, fontWeight: 'bold' }}
              />
            )}
            {item.isGlutenFree && (
              <Chip
                label="GF"
                size="small"
                color="warning" 
                sx={{ fontSize: '0.7rem', height: 24, fontWeight: 'bold' }}
              />
            )}
          </Box>
        </Box>
        
        <CardContent sx={{ flexGrow: 1, pt: 1.5, pb: 0.5 }}>
          <Typography variant="h6" component="h2" gutterBottom noWrap fontWeight="bold">
            {item.name}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ 
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: '40px'
          }}>
            {item.description}
          </Typography>
          
          <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
            ₹{parseFloat(item.price).toFixed(2)}
          </Typography>
            
          <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
            <Chip
              label={item.category} 
              size="small"
              variant="outlined"
              color="primary"
              sx={{ fontSize: '0.7rem' }} 
            />
            {item.preparationTime && (
              <Chip 
                icon={<AccessTimeIcon fontSize="small" />}
                label={`${item.preparationTime} min`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'space-between', p: 1, pt: 0 }}>
          <Box>
            {/* Item available indicator */}
            <Chip 
              label={item.isAvailable ? "Available" : "Unavailable"}
              size="small"
              color={item.isAvailable ? "success" : "default"}
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>
          <Box>
            <IconButton 
              size="small" 
              color="primary" 
              onClick={() => handleOpenDialog(item)}
              aria-label="Edit item"
              sx={{ 
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.1)' }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          
            <IconButton 
              size="small" 
              color="error" 
              onClick={() => handleOpenDeleteConfirmation(item)}
              aria-label="Delete item"
              sx={{ 
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.1)' }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardActions>
      </Card>
    );
  };

  // Render loading skeleton for menu items
  const renderSkeletons = () => {
    return Array(8).fill(0).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-${index}`}>
        <Card sx={{ height: '100%' }}>
          <Skeleton variant="rectangular" height={140} width="100%" animation="wave" />
          <CardContent>
            <Skeleton variant="text" width="80%" height={32} animation="wave" />
            <Skeleton variant="text" width="100%" height={20} animation="wave" />
            <Skeleton variant="text" width="100%" height={20} animation="wave" />
            <Skeleton variant="text" width="40%" height={32} animation="wave" />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Skeleton variant="rectangular" width={60} height={20} animation="wave" />
              <Skeleton variant="rectangular" width={60} height={20} animation="wave" />
            </Box>
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            <Skeleton variant="circular" width={30} height={30} animation="wave" />
            <Skeleton variant="circular" width={30} height={30} animation="wave" />
          </CardActions>
        </Card>
      </Grid>
    ));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center' }}>
        <RestaurantIcon sx={{ mr: 1.5, color: 'primary.main' }} />
        Menu Management
      </Typography>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mb: 3,
          backgroundImage: 'linear-gradient(to right, rgba(240,240,255,0.1), rgba(240,240,255,0.7))',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M20 0C9 0 0 9 0 20s9 20 20 20 20-9 20-20S31 0 20 0zm0 36c-8.8 0-16-7.2-16-16S11.2 4 20 4s16 7.2 16 16-7.2 16-16 16z" fill="%23f3f3f3" fill-opacity="0.4" fill-rule="evenodd"/%3E%3C/svg%3E")',
            opacity: 0.4,
            zIndex: 0,
          }
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
                  },
                  '&.Mui-focused fieldset': {
                    boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.2)',
                  },
                },
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={filterCategory}
                onChange={handleCategoryFilterChange}
                label="Category"
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                }
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category, index) => (
                  <MenuItem key={index} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="sort-label">Sort By</InputLabel>
              <Select
                labelId="sort-label"
                value={sortBy}
                onChange={handleSortChange}
                label="Sort By"
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon />
                  </InputAdornment>
                }
                endAdornment={
                  <IconButton
                    size="small"
                    onClick={handleSortOrderChange}
                    sx={{ 
                      mr: 2,
                      transform: `rotate(${sortOrder === 'desc' ? '180deg' : '0deg'})`,
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    <ArrowUpwardIcon />
                  </IconButton>
                }
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="category">Category</MenuItem>
                <MenuItem value="createdAt">Date Added</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ 
                width: { xs: '100%', md: 'auto' },
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'scale(1.03)',
                }
              }}
            >
              Add Item
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {filteredItems.length > 0 && (
        <Box sx={{ 
          backgroundColor: 'rgba(25, 118, 210, 0.05)',
          borderRadius: 1,
          p: 1,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
        }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Results:</strong> Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            {filterCategory !== 'all' && ` in category "${filterCategory}"`}
            {searchTerm && ` matching "${searchTerm}"`}
          </Typography>
        </Box>
      )}
      
      {/* Floating action button for mobile - visible on smaller screens */}
      {isMobile && (
        <Zoom in={true}>
          <Box
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => handleOpenDialog()}
              sx={{
                borderRadius: '50%',
                width: 56,
                height: 56,
                minWidth: 'unset',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              }}
            >
              <AddIcon />
            </Button>
          </Box>
        </Zoom>
      )}

      {/* Loading indicator */}
      {loading && (
        <Grid container spacing={3}>
          {renderSkeletons()}
        </Grid>
      )}
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* No items message */}
      {!loading && filteredItems.length === 0 ? (
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            p: 5,
            backgroundColor: 'rgba(0,0,0,0.02)',
            borderRadius: 2,
            border: '1px dashed rgba(0,0,0,0.1)',
            my: 4
          }}
        >
          <RestaurantIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.6 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchTerm || filterCategory !== 'all' 
            ? 'No menu items found for your search' 
            : 'No menu items found'}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            {searchTerm || filterCategory !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Start by adding your first menu item'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            }}
          >
            Add Menu Item
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredItems.map(item => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                {renderMenuItem(item)}
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? "small" : "medium"}
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  },
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* Dialog for creating/editing menu items */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          bgcolor: 'primary.light',
          color: 'white',
          fontWeight: 'bold'
        }}>
          {currentItem ? 'Edit Menu Item' : 'Add New Menu Item'}
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Item Name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                error={!!formErrors.name}
                helperText={formErrors.name}
                InputProps={{
                  endAdornment: formErrors.name ? (
                    <InputAdornment position="end">
                      <CloseIcon color="error" fontSize="small" />
                    </InputAdornment>
                  ) : (
                    formData.name && (
                      <InputAdornment position="end">
                        <CheckIcon color="success" fontSize="small" />
                      </InputAdornment>
                    )
                  )
                }}
              />
              
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                multiline
                rows={4}
                error={!!formErrors.description}
                helperText={formErrors.description}
                InputProps={{
                  endAdornment: formErrors.description ? (
                    <InputAdornment position="end">
                      <CloseIcon color="error" fontSize="small" />
                    </InputAdornment>
                  ) : (
                    formData.description && (
                      <InputAdornment position="end">
                        <CheckIcon color="success" fontSize="small" />
                      </InputAdornment>
                    )
                  )
                }}
              />
              
              <TextField
                name="price"
                label="Price (₹)"
                value={formData.price}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                type="text"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  inputProps: { 
                    pattern: "^\\d*(\\.\\d{0,2})?$",
                    inputMode: "decimal"
                  },
                  endAdornment: formErrors.price ? (
                    <InputAdornment position="end">
                      <CloseIcon color="error" fontSize="small" />
                    </InputAdornment>
                  ) : (
                    formData.price && (
                      <InputAdornment position="end">
                        <CheckIcon color="success" fontSize="small" />
                      </InputAdornment>
                    )
                  )
                }}
                error={!!formErrors.price}
                helperText={formErrors.price || "Enter a valid price (numbers only)"}
                onKeyPress={(e) => {
                  // Block non-numeric/decimal characters
                  const regex = /^[0-9.]*$/;
                  if (!regex.test(e.key)) {
                    e.preventDefault();
                  }
                  // Prevent multiple decimal points
                  if (e.key === '.' && formData.price.includes('.')) {
                    e.preventDefault();
                  }
                }}
              />
              
              <FormControl fullWidth margin="normal" required error={!!formErrors.category}>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  label="Category"
                  inputProps={{ 'aria-label': 'Select category' }}
                  error={!!formErrors.category}
                  endAdornment={
                    formErrors.category ? (
                      <CloseIcon color="error" fontSize="small" style={{ marginRight: 32 }} />
                    ) : (
                      formData.category && (
                        <CheckIcon color="success" fontSize="small" style={{ marginRight: 32 }} />
                      )
                    )
                  }
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  }}
                >
                  {categories.map((category, index) => (
                    <MenuItem key={`category-${index}-${category}`} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.category && (
                  <FormHelperText error>{formErrors.category}</FormHelperText>
                )}
              </FormControl>
                
              <TextField
                name="preparationTime"
                label="Preparation Time (minutes)"
                value={formData.preparationTime}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                type="number"
                InputProps={{
                  inputProps: { min: 0, step: 1 }, // Prevent negative values, allow only integers
                  endAdornment: formErrors.preparationTime ? (
                    <InputAdornment position="end">
                      <CloseIcon color="error" fontSize="small" />
                    </InputAdornment>
                  ) : (
                    formData.preparationTime && (
                      <InputAdornment position="end">
                        <CheckIcon color="success" fontSize="small" />
                      </InputAdornment>
                    )
                  )
                }}
                error={!!formErrors.preparationTime}
                helperText={formErrors.preparationTime}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Menu Item Image
              </Typography>
              
              <Box sx={{ border: '1px dashed rgba(0, 0, 0, 0.2)', p: 2, borderRadius: 1, mb: 2 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={imageUploading ? <CircularProgress size={16} /> : <AddPhotoAlternateIcon />}
                    onClick={handleBrowseClick}
                    sx={{ mr: 1 }}
                    disabled={imageUploading}
                  >
                    {imageUploading ? 'Uploading...' : 'Select Image'}
                  </Button>
                  
                  {(formData.imageUrl || formData.tempImagePreview) && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, imageUrl: '', tempImagePreview: null }));
                        // Reset the file input
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      disabled={imageUploading}
                    >
                      Remove Image
                    </Button>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageSelect}
                  />
                </Box>
                
                {/* Remove the image URL TextField and display just the status */}
                {formData.imageUrl && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Image uploaded successfully
                  </Alert>
                )}
                
                {formData.tempImagePreview && !formData.imageUrl && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Using preview image (server upload failed)
                  </Alert>
                )}
                
                {imageUploading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
                    <CircularProgress size={14} sx={{ mr: 1 }} />
                    <Typography variant="caption">
                      Uploading image to server...
                    </Typography>
                  </Box>
                )}
                
                {/* Image Preview */}
                {(formData.imageUrl || formData.tempImagePreview) ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Image Preview:
                    </Typography>
                    <Box 
                      sx={{ 
                        maxWidth: '100%', 
                        height: 200, 
                        overflow: 'hidden', 
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <ImageWithFallback
                        src={formData.imageUrl || formData.tempImagePreview}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 200,
                    color: 'text.secondary',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: 1
                  }}>
                    <VisibilityIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                    <Typography variant="body2">
                      No image selected
                    </Typography>
                    <Typography variant="caption" sx={{ mt: 1 }}>
                      Image is optional but recommended
                    </Typography>
                  </Box>
                )}
                
                {formErrors.imageUrl && (
                  <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                    {formErrors.imageUrl}
                  </Typography>
                )}
              </Box>

              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Dietary Options:
              </Typography>
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isVegetarian}
                      onChange={handleInputChange}
                      name="isVegetarian"
                      color="success"
                    />
                  }
                  label="Vegetarian"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isVegan}
                      onChange={handleInputChange}
                      name="isVegan"
                      color="success"
                    />
                  }
                  label="Vegan"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isGlutenFree}
                      onChange={handleInputChange}
                      name="isGlutenFree"
                      color="warning"
                    />
                  }
                  label="Gluten Free"
                />
              </FormGroup>
              
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isAvailable}
                      onChange={handleInputChange}
                      name="isAvailable"
                      color="primary"
                    />
                  }
                  label={
                    <Typography fontWeight="bold">
                      Item is Available
                    </Typography>
                  }
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ borderTop: '1px solid rgba(0,0,0,0.1)', p: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            color="inherit"
            sx={{
              transition: 'background-color 0.3s',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.05)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveItem} 
            variant="contained"
            color="primary"
            disabled={Object.keys(formErrors).length > 0 || !formData.name || !formData.description || !formData.price || !formData.category}
            sx={{
              backgroundImage: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              transition: 'transform 0.3s',
              '&:not(:disabled):hover': {
                transform: 'scale(1.05)',
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              currentItem ? 'Update' : 'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmationOpen}
        onClose={handleCloseDeleteConfirmation}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'error.light', 
          color: 'white',
          fontWeight: 'bold'
        }}>
          Delete Menu Item
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>
            Are you sure you want to delete the menu item <strong>"{itemToDelete?.name}"</strong>? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Button 
            onClick={handleCloseDeleteConfirmation} 
            color="primary"
            sx={{
              transition: 'background-color 0.3s',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.05)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'scale(1.05)',
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuManagement; 