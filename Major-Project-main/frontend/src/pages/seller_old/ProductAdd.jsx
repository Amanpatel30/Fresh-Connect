import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Divider,
  Paper,
  IconButton,
  Chip,
  Stack,
  Alert,
  Snackbar,
  InputAdornment,
  useTheme,
  CircularProgress,
  Collapse,
  Rating,
  CardMedia,
  CardActions,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  CloudUpload, 
  Delete, 
  Add, 
  Save, 
  ArrowBack,
  CheckCircleOutline,
  Edit,
  Visibility,
  VisibilityOff,
  ShoppingCart
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api.jsx';
import * as productService from '../../services/productService';
import * as categoryService from '../../services/categoryService';
import ProductAutocomplete from '../../components/common/ProductAutocomplete';

const ProductAdd = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // References
  const previewRef = React.useRef(null);
  
  // State to track if we're editing an existing product
  const [isEditing, setIsEditing] = useState(false);
  const [productId, setProductId] = useState(null);
  
  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  
  // Categories state
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  // Toggle preview with scroll effect
  const togglePreview = () => {
    const newPreviewState = !showPreview;
    setShowPreview(newPreviewState);
    
    // If opening preview, scroll to it after a small delay to allow for render
    if (newPreviewState && previewRef.current) {
      setTimeout(() => {
        previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  };
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    unit: 'kg',
    image: '',
    additionalImages: [],
    tags: [],
    organic: false,
    harvestDate: '',
    expiryDate: '',
    nutritionalInfo: ''
  });
  
  // Form validation state
  const [errors, setErrors] = useState({});
  
  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Function to fetch categories
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await categoryService.getCategories();
      
      if (response && response.data) {
        // Extract category names from the response
        const categoryNames = response.data.map(category => category.name);
        setCategories(categoryNames);
      } else {
        // Fallback to default categories if API fails
        setCategories([
          'Vegetables',
          'Fruits',
          'Herbs',
          'Leafy Vegetables',
          'Root Vegetables',
          'Fruit Vegetables',
          'Exotic Vegetables',
          'Organic Produce'
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to default categories if API fails
      setCategories([
        'Vegetables',
        'Fruits',
        'Herbs',
        'Leafy Vegetables',
        'Root Vegetables',
        'Fruit Vegetables',
        'Exotic Vegetables',
        'Organic Produce'
      ]);
      
      setSnackbar({
        open: true,
        message: 'Failed to load categories. Using default categories instead.',
        severity: 'warning'
      });
    } finally {
      setCategoriesLoading(false);
    }
  };
  
  // Log formData changes
  useEffect(() => {
    // Only log significant changes to reduce console noise
    if (formData.name || formData.category) {
      console.log("FormData updated:", formData);
      console.log("Product name type:", typeof formData.name);
      console.log("Product name value:", formData.name);
    }
    
    // Clear name error when product name changes
    if (errors.name && formData.name) {
      setErrors(prev => ({
        ...prev,
        name: null
      }));
    }
  }, [formData, errors.name]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [previewImages, setPreviewImages] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Effect to check for product ID in URL and load product data
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    
    if (id) {
      setIsEditing(true);
      setProductId(id);
      fetchProductData(id);
    }
  }, [location]);
  
  // Function to fetch product data for editing
  const fetchProductData = async (id) => {
    setLoading(true);
    try {
      const response = await productService.getProduct(id);
      
      console.log('Product data from API:', response);
      console.log('Product data structure:', response.data);
      
      if (response && response.data) {
        const product = response.data;
        
        // Log specific fields to debug
        console.log('Additional Info Received:', {
          tags: product.tags,
          harvestDate: product.harvestDate,
          expiryDate: product.expiryDate,
          nutritionalInfo: product.nutritionalInfo,
          organic: product.organic
        });
        
        // Enhanced date handling - handle multiple date formats more robustly
        let harvestDate = '';
        let expiryDate = '';
        
        // Handle different date formats that might come from API
        if (product.harvestDate) {
          try {
            // Try to create a valid date object first to validate
            const dateObj = new Date(product.harvestDate);
            if (!isNaN(dateObj.getTime())) {
              harvestDate = dateObj.toISOString().split('T')[0];
              console.log('Parsed harvestDate:', harvestDate);
            } else {
              console.error('Invalid harvest date format from API:', product.harvestDate);
            }
          } catch (err) {
            console.error('Error parsing harvest date:', err);
          }
        }
        
        if (product.expiryDate) {
          try {
            // Try to create a valid date object first to validate
            const dateObj = new Date(product.expiryDate);
            if (!isNaN(dateObj.getTime())) {
              expiryDate = dateObj.toISOString().split('T')[0];
              console.log('Parsed expiryDate:', expiryDate);
            } else {
              console.error('Invalid expiry date format from API:', product.expiryDate);
            }
          } catch (err) {
            console.error('Error parsing expiry date:', err);
          }
        }
        
        // Update form data with product details
        setFormData({
          name: product.name || '',  // Always store as string
          description: product.description || '',
          price: product.price || '',
          stock: product.stock || '',
          category: product.category || '',
          unit: product.unit || 'kg',
          image: product.image || '',
          additionalImages: product.additionalImages || [],
          tags: Array.isArray(product.tags) ? product.tags : [],
          organic: Boolean(product.organic),
          harvestDate: harvestDate,
          expiryDate: expiryDate,
          nutritionalInfo: product.nutritionalInfo || ''
        });
        
        // Set preview images if available
        if (product.image) {
          const mainPreview = {
            preview: product.image,
            isExisting: true
          };
          
          const additionalPreviews = (product.additionalImages || []).map(img => ({
            preview: img,
            isExisting: true
          }));
          
          setPreviewImages([mainPreview, ...additionalPreviews]);
        }
        
        setSnackbar({
          open: true,
          message: 'Product loaded successfully for editing',
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      console.error('Error details:', error.response?.data);
      
      setSnackbar({
        open: true,
        message: `Error loading product: ${error.message || 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Units
  const units = ['kg', 'g', 'lb', 'oz', 'bunch', 'piece'];
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // For debugging
    console.log(`Field changed: ${name}, Value: ${value}, Type: ${type}`);
    
    // Handle batch updates from ProductAutocomplete
    if (name === 'batch' && typeof value === 'object') {
      setFormData(prev => ({
        ...prev,
        ...value
      }));
      
      // Clear any errors for updated fields
      const updatedErrors = { ...errors };
      Object.keys(value).forEach(field => {
        if (updatedErrors[field]) {
          updatedErrors[field] = null;
        }
      });
      setErrors(updatedErrors);
      return;
    }
    
    // Update form data
    const updatedData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };
    
    setFormData(updatedData);
    
    // Perform field-specific validation
    const fieldErrors = {};
    
    switch (name) {
      case 'name':
        const productName = typeof value === 'object' ? (value?.name || value?.inputValue || '') : (value || '');
        if (!productName.trim()) {
          fieldErrors.name = 'Product name is required';
        } else if (productName.trim().length < 3) {
          fieldErrors.name = 'Product name must be at least 3 characters';
        } else if (productName.trim().length > 50) {
          fieldErrors.name = 'Product name cannot exceed 50 characters';
        }
        // Explicitly set to null if validation passes
        else if (errors.name) {
          fieldErrors.name = null;
        }
        break;
        
      case 'description':
        if (!value.trim()) {
          fieldErrors.description = 'Description is required';
        } else if (value.trim().length < 10) {
          fieldErrors.description = 'Description must be at least 10 characters';
        } else if (value.trim().length > 1000) {
          fieldErrors.description = 'Description cannot exceed 1000 characters';
        }
        // Explicitly set to null if validation passes
        else if (errors.description) {
          fieldErrors.description = null;
        }
        break;
        
      case 'price':
        if (!value) {
          fieldErrors.price = 'Price is required';
        } else if (isNaN(value)) {
          fieldErrors.price = 'Price must be a number';
        } else if (parseFloat(value) <= 0) {
          fieldErrors.price = 'Price must be greater than zero';
        } else if (parseFloat(value) > 100000) {
          fieldErrors.price = 'Price cannot exceed ₹100,000';
        }
        // Explicitly set to null if validation passes
        else if (errors.price) {
          fieldErrors.price = null;
        }
        break;
        
      case 'stock':
        if (!value) {
          fieldErrors.stock = 'Stock quantity is required';
        } else if (isNaN(value)) {
          fieldErrors.stock = 'Stock must be a number';
        } else if (parseInt(value) < 0) {
          fieldErrors.stock = 'Stock cannot be negative';
        } else if (parseInt(value) > 10000) {
          fieldErrors.stock = 'Stock cannot exceed 10,000 units';
        }
        // Explicitly set to null if validation passes
        else if (errors.stock) {
          fieldErrors.stock = null;
        }
        break;
        
      case 'category':
        if (!value) {
          fieldErrors.category = 'Category is required';
        } else if (categories.length > 0 && !categories.includes(value)) {
          fieldErrors.category = 'Please select a valid category';
        }
        // Explicitly set to null if validation passes
        else if (errors.category) {
          fieldErrors.category = null;
        }
        break;
        
      case 'unit':
        if (!value) {
          fieldErrors.unit = 'Unit is required';
        } else if (!units.includes(value)) {
          fieldErrors.unit = 'Please select a valid unit';
        }
        // Explicitly set to null if validation passes
        else if (errors.unit) {
          fieldErrors.unit = null;
        }
        break;
        
      case 'harvestDate':
      case 'expiryDate':
        // Validate dates together when either changes
        if (updatedData.harvestDate && updatedData.expiryDate) {
          const harvestDate = new Date(updatedData.harvestDate);
          const expiryDate = new Date(updatedData.expiryDate);
          const today = new Date();
          
          // Remove time part for date comparison
          today.setHours(0, 0, 0, 0);
          
          if (name === 'harvestDate') {
            if (harvestDate > today) {
              fieldErrors.harvestDate = 'Harvest date cannot be in the future';
            } 
            // Explicitly set to null if validation passes
            else if (errors.harvestDate) {
              fieldErrors.harvestDate = null;
            }
            
            // Re-check expiry date validation if harvest date changes
            if (updatedData.expiryDate && expiryDate < harvestDate) {
              fieldErrors.expiryDate = 'Expiry date cannot be before harvest date';
            } else if (errors.expiryDate && errors.expiryDate === 'Expiry date cannot be before harvest date') {
              fieldErrors.expiryDate = null;
            }
          }
          
          if (name === 'expiryDate') {
            if (expiryDate < today) {
              fieldErrors.expiryDate = 'Expiry date cannot be in the past';
            } else if (updatedData.harvestDate && expiryDate < harvestDate) {
              fieldErrors.expiryDate = 'Expiry date cannot be before harvest date';
            }
            // Explicitly set to null if validation passes
            else if (errors.expiryDate) {
              fieldErrors.expiryDate = null;
            }
          }
        } else {
          // Clear date error if one of the dates is removed
          if (name === 'harvestDate' && !value && errors.harvestDate) {
            fieldErrors.harvestDate = null;
          }
          if (name === 'expiryDate' && !value && errors.expiryDate) {
            fieldErrors.expiryDate = null;
          }
        }
        break;
        
      case 'nutritionalInfo':
        if (value && value.trim().length > 500) {
          fieldErrors.nutritionalInfo = 'Nutritional information cannot exceed 500 characters';
        }
        // Explicitly set to null if validation passes
        else if (errors.nutritionalInfo) {
          fieldErrors.nutritionalInfo = null;
        }
        break;
        
      default:
        // For any other fields, clear their errors if they exist
        if (errors[name]) {
          fieldErrors[name] = null;
        }
    }
    
    // Update errors state with new validation
    setErrors(prev => ({
      ...prev,
      ...fieldErrors
    }));
  };
  
  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Clear any previous errors
    setErrors({
      ...errors,
      images: null
    });
    
    // Validate file types
    const invalidTypeFiles = files.filter(file => 
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    );
    
    if (invalidTypeFiles.length > 0) {
      setErrors({
        ...errors,
        images: 'Only JPG, PNG, and WEBP formats are allowed'
      });
      return;
    }
    
    // Validate file sizes (max 5MB per file)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    
    if (oversizedFiles.length > 0) {
      setErrors({
        ...errors,
        images: `Image size cannot exceed 5MB (${oversizedFiles.map(f => f.name).join(', ')})`
      });
      return;
    }
    
    // Validate maximum number of images (main + additional)
    const MAX_IMAGES = 6;
    if (previewImages.length + files.length > MAX_IMAGES) {
      setErrors({
        ...errors,
        images: `Maximum ${MAX_IMAGES} images allowed`
      });
      return;
    }
    
    // Create preview URLs and prepare for form data
    const newPreviewImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setPreviewImages([...previewImages, ...newPreviewImages]);
    
    // Convert images to base64 for API submission
    const processImages = async () => {
      try {
        const imagePromises = newPreviewImages.map(item => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(item.file);
          });
        });
        
        const base64Images = await Promise.all(imagePromises);
        
        // Check if any of the base64 strings are not valid
        const invalidImages = base64Images.filter(img => !img || typeof img !== 'string' || !img.startsWith('data:image'));
        if (invalidImages.length > 0) {
          console.error('Invalid base64 image data detected:', invalidImages);
          throw new Error('Invalid image data detected');
        }
        
        console.log('Base64 images processed:', base64Images.length);
        
        // Always set the first image as the main image if no main image exists
        let mainImage = formData.image;
        let additionalImages = [...(formData.additionalImages || [])];
        
        if (base64Images.length > 0) {
          // If no main image exists yet, set the first uploaded image as main
          if (!mainImage || mainImage.length < 100) {
            mainImage = base64Images[0];
            // The rest go to additional images
            additionalImages = [...additionalImages, ...base64Images.slice(1)];
          } else {
            // If main image already exists, all new images go to additional
            additionalImages = [...additionalImages, ...base64Images];
          }
        }
        
        // Debug logs
        console.log('Main image type:', typeof mainImage);
        console.log('Main image length:', mainImage ? mainImage.length : 0);
        console.log('Additional images count:', additionalImages.length);
        
        // Update form data with the processed images
        setFormData({
          ...formData,
          image: mainImage, // String value for main image
          additionalImages: additionalImages // Array of strings for additional images
        });
        
        console.log('Images successfully processed and added to form data');
      } catch (error) {
        console.error('Error processing images:', error);
        setErrors({
          ...errors,
          images: 'Error processing images. Please try again.'
        });
      }
    };
    
    processImages();
  };
  
  // Remove image
  const handleRemoveImage = (index) => {
    // Create a copy of the preview images array and remove the image at the specified index
    const updatedPreviewImages = [...previewImages];
    updatedPreviewImages.splice(index, 1);
    setPreviewImages(updatedPreviewImages);
    
    // Update the form data based on the remaining images
    if (updatedPreviewImages.length === 0) {
      // If no images remain, clear the image fields
      setFormData({
        ...formData,
        image: '',
        additionalImages: []
      });
      
      // If not editing mode, show validation error for missing image
      if (!isEditing) {
        setErrors(prev => ({
          ...prev,
          images: 'At least one image is required'
        }));
      }
    } else {
      // Clear any image errors since we have at least one image
      setErrors(prev => ({
        ...prev,
        images: null
      }));
      
      // Convert remaining preview images to base64 for form data
      const processRemainingImages = async () => {
        const imagePromises = updatedPreviewImages.map(item => {
          if (item.file) {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(item.file);
            });
          } else {
            // If it's already a base64 string (from previous uploads)
            return Promise.resolve(item.preview);
          }
        });
        
        const base64Images = await Promise.all(imagePromises);
        
        // If removing the main image (index 0), we need to promote the next image to be the main
        if (index === 0) {
          setFormData({
            ...formData,
            image: base64Images[0], // New main image is the first remaining image
            additionalImages: base64Images.slice(1) // Rest go to additional images
          });
        } else {
          // If removing an additional image, main image stays the same
          setFormData({
            ...formData,
            image: formData.image, // Keep the main image
            additionalImages: base64Images.slice(1) // Update additional images
          });
        }
      };
      
      processRemainingImages();
    }
  };
  
  // Add tag
  const handleAddTag = () => {
    const tag = newTag.trim();
    // Clear any previous tag errors
    setErrors(prev => ({ ...prev, tags: null }));
    
    // Validate the tag
    if (!tag) {
      return; // Don't add empty tags
    }
    
    if (tag.length > 20) {
      setErrors(prev => ({ ...prev, tags: 'Tag cannot exceed 20 characters' }));
      return;
    }
    
    if (formData.tags.includes(tag)) {
      setErrors(prev => ({ ...prev, tags: 'This tag already exists' }));
      return;
    }
    
    if (formData.tags.length >= 10) {
      setErrors(prev => ({ ...prev, tags: 'Maximum 10 tags allowed' }));
      return;
    }
    
    // Add valid tag
    setFormData({
      ...formData,
      tags: [...formData.tags, tag]
    });
    setNewTag('');
  };
  
  // Remove tag
  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };
  
  // Validate form
  const validateForm = (dataToValidate) => {
    console.log('Validating form data:', dataToValidate);
    const extractedName = typeof dataToValidate.name === 'object' 
      ? (dataToValidate.name?.name || dataToValidate.name?.inputValue || '')
      : (dataToValidate.name || '');
      
    console.log('Extracted product name for validation:', extractedName);
    
    const newErrors = {};
    
    // Required fields validation
    if (!extractedName.trim()) {
      newErrors.name = 'Product name is required';
    } else if (extractedName.length > 100) {
      newErrors.name = 'Product name cannot exceed 100 characters';
    }
    
    if (!dataToValidate.description || !dataToValidate.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (dataToValidate.description.length > 2000) {
      newErrors.description = 'Description cannot exceed 2000 characters';
    }
    
    if (!dataToValidate.price) {
      newErrors.price = 'Price is required';
    } else {
      const price = parseFloat(dataToValidate.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = 'Price must be a positive number';
      } else if (price > 10000) {
        newErrors.price = 'Price cannot exceed 10,000';
      }
    }
    
    if (!dataToValidate.stock && dataToValidate.stock !== 0) {
      newErrors.stock = 'Stock quantity is required';
    } else {
      const stock = parseInt(dataToValidate.stock, 10);
      if (isNaN(stock) || stock < 0) {
        newErrors.stock = 'Stock must be a non-negative number';
      } else if (stock > 10000) {
        newErrors.stock = 'Stock cannot exceed 10,000 units';
      }
    }
    
    if (!dataToValidate.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!dataToValidate.unit) {
      newErrors.unit = 'Unit is required';
    }
    
    // Image validation
    if (!dataToValidate.image) {
      newErrors.image = 'Main product image is required';
    } else if (typeof dataToValidate.image !== 'string') {
      newErrors.image = 'Invalid image format';
    } else if (dataToValidate.image.length < 100) {
      newErrors.image = 'Invalid image data';
    }
    
    // Additional validations for optional fields
    if (dataToValidate.tags && dataToValidate.tags.length > 10) {
      newErrors.tags = 'Maximum 10 tags are allowed';
    }
    
    // Date validations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dataToValidate.harvestDate) {
      const harvestDate = new Date(dataToValidate.harvestDate);
      if (harvestDate > today) {
        newErrors.harvestDate = 'Harvest date cannot be in the future';
      }
      
      if (dataToValidate.expiryDate) {
        const expiryDate = new Date(dataToValidate.expiryDate);
        if (expiryDate < harvestDate) {
          newErrors.expiryDate = 'Expiry date cannot be before harvest date';
        }
      }
    }
    
    if (dataToValidate.expiryDate) {
      const expiryDate = new Date(dataToValidate.expiryDate);
      if (expiryDate < today) {
        newErrors.expiryDate = 'Expiry date cannot be in the past';
      }
    }
    
    if (dataToValidate.nutritionalInfo && dataToValidate.nutritionalInfo.length > 500) {
      newErrors.nutritionalInfo = 'Nutritional information cannot exceed 500 characters';
    }
    
    console.log('Validation errors:', newErrors);
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Force form data normalization before validation
    const productName = typeof formData.name === 'object' 
      ? (formData.name?.name || formData.name?.inputValue || '')
      : (formData.name || '');
      
    // Set normalized name before validation
    let updatedFormData = {
      ...formData,
      name: productName
    };
    
    // Check for common vegetables and set category if empty
    const commonVegetables = ['Tomato', 'Potato', 'Onion', 'Carrot', 'Cucumber', 'Cabbage'];
    if (!formData.category && commonVegetables.includes(productName)) {
      updatedFormData = {
        ...updatedFormData,
        category: "Vegetables"
      };
    }
    
    // Update the form state with normalized data
    setFormData(updatedFormData);
    
    // Run validation with the normalized data
    const isValid = validateForm(updatedFormData);
    if (!isValid) return;
    
    setLoading(true);
    
    try {
      // Use the updated form data for submission
      const productData = {
        ...updatedFormData,
        price: parseFloat(updatedFormData.price || 0),
        stock: parseInt(updatedFormData.stock || 0, 10),
      };
      
      // Final validation for image data
      if (!productData.image || typeof productData.image !== 'string' || productData.image.length < 100) {
        console.error('Invalid image data detected before submission:', {
          exists: !!productData.image,
          type: typeof productData.image,
          length: productData.image ? productData.image.length : 0
        });
        
        throw new Error('Invalid image data. Please upload a valid image.');
      }
      
      console.log('Image validation passed. Image data length:', productData.image.length);
      
      // Ensure dates are in a consistent format for the API
      if (productData.harvestDate) {
        // Use ISO format for consistency
        const harvestDate = new Date(productData.harvestDate);
        if (!isNaN(harvestDate.getTime())) {
          productData.harvestDate = harvestDate.toISOString();
        }
      }
      
      if (productData.expiryDate) {
        // Use ISO format for consistency
        const expiryDate = new Date(productData.expiryDate);
        if (!isNaN(expiryDate.getTime())) {
          productData.expiryDate = expiryDate.toISOString();
        }
      }
      
      console.log(`${isEditing ? 'Updating' : 'Creating'} product data:`, productData);
      
      let result;
      
      if (isEditing && productId) {
        // Update existing product
        result = await productService.updateProduct(productId, productData);
        console.log('Update API response:', result);
        
        if (result.success || result.status === 'success') {
          setSuccess(true);
          // Store a flag in sessionStorage to indicate a product was just updated
          sessionStorage.setItem('productJustAdded', 'true');
          sessionStorage.setItem('productAddedMessage', `Product "${productName}" updated successfully!`);
          
          setSnackbar({
            open: true,
            message: `Product "${productName}" updated successfully!`,
            severity: 'success'
          });
          
          // Redirect after a short delay to allow the success message to be seen
          setTimeout(() => {
            navigate('/seller/products');
          }, 1500);
        } else {
          throw new Error('Failed to update product');
        }
      } else {
        // Create new product
        result = await productService.createProduct(productData);
        console.log('Create API response:', result);
        
        if (result.success || result.status === 'success') {
          setSuccess(true);
          // Store a flag in sessionStorage to indicate a product was just added
          sessionStorage.setItem('productJustAdded', 'true');
          sessionStorage.setItem('productAddedMessage', `Product "${productName}" added successfully!`);
          
          setSnackbar({
            open: true,
            message: `Product "${productName}" added successfully!`,
            severity: 'success'
          });
          
          // Redirect after a short delay to allow the success message to be seen
          setTimeout(() => {
            navigate('/seller/products');
          }, 1500);
        } else {
          throw new Error('Failed to add product');
        }
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} product:`, error);
      setErrors({
        submit: error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} product. Please try again.`
      });
      
      setSnackbar({
        open: true,
        message: `Error: ${error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} product.`}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Check if there are any validation errors
  const hasValidationErrors = () => {
    // Filter out the 'submit' error as it's not a validation error
    const validationErrors = { ...errors };
    delete validationErrors.submit;
    
    // Check if any validation errors exist
    return Object.values(validationErrors).some(error => error !== null && error !== undefined);
  };

  return (
    <Box>
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isEditing 
              ? 'Update your product information and inventory details' 
              : 'Add a new product to your inventory with detailed information'}
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={showPreview}
                onChange={togglePreview}
                color="primary"
              />
            }
            label={showPreview ? "Hide Preview" : "Show Preview"}
          />
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/seller/products')}
          >
            Back to Products
          </Button>
        </Stack>
      </Box>

      {loading && !formData.name && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {(!loading || formData.name) && (
        <form onSubmit={handleSubmit}>
          <Box p={3}>
            {/* Product Preview */}
            <Collapse in={showPreview}>
              <Card 
                ref={previewRef}
                elevation={3} 
                sx={{ 
                  mb: 4, 
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.primary.main}`,
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                <Box 
                  sx={{
                    position: 'absolute',
                    top: -15,
                    left: 20,
                    bgcolor: theme.palette.background.paper,
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.primary.main}`,
                    color: theme.palette.primary.main
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    Customer View Preview
                  </Typography>
                </Box>
                <CardContent>
                  <Grid container spacing={3}>
                    {/* Product Images */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ position: 'relative', height: 350, mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                        {previewImages.length > 0 ? (
                          <img 
                            src={previewImages[0].preview} 
                            alt={formData.name || 'Product'} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        ) : (
                          <Box 
                            sx={{ 
                              width: '100%', 
                              height: '100%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              bgcolor: 'rgba(0, 0, 0, 0.05)',
                              color: 'text.secondary'
                            }}
                          >
                            <Typography variant="body1">No Image Uploaded</Typography>
                          </Box>
                        )}
                      </Box>
                      
                      {/* Additional Images */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {previewImages.slice(1).map((image, index) => (
                          <Box 
                            key={index} 
                            sx={{ 
                              width: 60, 
                              height: 60, 
                              borderRadius: 1, 
                              overflow: 'hidden',
                              border: `1px solid ${theme.palette.divider}`
                            }}
                          >
                            <img 
                              src={image.preview} 
                              alt={`Preview ${index + 1}`} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                    
                    {/* Product Details */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="h4" gutterBottom>
                        {formData.name || 'Product Name'}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Rating value={4.5} precision={0.5} readOnly />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          (25 reviews)
                        </Typography>
                      </Box>
                      
                      <Typography variant="h5" color="primary" gutterBottom>
                        ₹{formData.price || '0.00'} / {formData.unit || 'kg'}
                      </Typography>
                      
                      <Box sx={{ my: 2 }}>
                        <Chip 
                          label={formData.category || 'Category'} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                          sx={{ mr: 1 }} 
                        />
                        {formData.organic && (
                          <Chip 
                            label="Organic" 
                            size="small" 
                            color="success" 
                            sx={{ mr: 1 }} 
                          />
                        )}
                        {formData.tags.map((tag, index) => (
                          <Chip 
                            key={index} 
                            label={tag} 
                            size="small" 
                            sx={{ mr: 1, mb: 1 }} 
                          />
                        ))}
                      </Box>
                      
                      <Typography variant="body1" paragraph>
                        {formData.description || 'No description provided.'}
                      </Typography>
                      
                      {formData.nutritionalInfo && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Nutritional Information:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formData.nutritionalInfo}
                          </Typography>
                        </Box>
                      )}
                      
                      {formData.harvestDate && (
                        <Box sx={{ display: 'flex', mb: 1 }}>
                          <Typography variant="body2" sx={{ mr: 1, fontWeight: 'bold' }}>
                            Harvest Date:
                          </Typography>
                          <Typography variant="body2">
                            {new Date(formData.harvestDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                      
                      {formData.expiryDate && (
                        <Box sx={{ display: 'flex', mb: 2 }}>
                          <Typography variant="body2" sx={{ mr: 1, fontWeight: 'bold' }}>
                            Expiry Date:
                          </Typography>
                          <Typography variant="body2">
                            {new Date(formData.expiryDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
                        <Typography variant="body2" sx={{ mr: 2 }}>
                          Availability: <span style={{ color: parseInt(formData.stock) > 0 ? theme.palette.success.main : theme.palette.error.main, fontWeight: 'bold' }}>
                            {parseInt(formData.stock) > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </Typography>
                        {parseInt(formData.stock) > 0 && (
                          <Typography variant="body2" color="text.secondary">
                            {formData.stock} {parseInt(formData.stock) === 1 ? 'unit' : 'units'} available
                          </Typography>
                        )}
                      </Box>
                      
                      <Button 
                        variant="contained" 
                        startIcon={<ShoppingCart />} 
                        sx={{ mt: 3 }}
                        fullWidth
                        disabled={parseInt(formData.stock) <= 0}
                      >
                        Add to Cart
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Collapse>
            
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12} md={8}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    borderRadius: 2, 
                    border: `1px solid ${theme.palette.divider}`,
                    height: '100%'
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" mb={2} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      Basic Information
                      <Button 
                        size="small" 
                        startIcon={showPreview ? <VisibilityOff /> : <Visibility />}
                        onClick={togglePreview}
                      >
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                      </Button>
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <ProductAutocomplete
                          value={formData.name}
                          onChange={(event, newValue) => {
                            console.log("ProductAutocomplete onChange:", newValue);
                            
                            // Clear previous name errors first to provide clean validation
                            setErrors(prev => ({
                              ...prev,
                              name: null
                            }));
                            
                            // Handle the product selection
                            if (newValue === null || newValue === '') {
                              // Handle clearing the input
                              setFormData(prev => ({
                                ...prev,
                                name: ''
                              }));
                              
                              // Show required error if field is cleared
                              setErrors(prev => ({
                                ...prev,
                                name: 'Product name is required'
                              }));
                              return;
                            }
                            
                            // Process different types of values
                            let productName = '';
                            let category = '';
                            
                            if (typeof newValue === 'object') {
                              // Object with product details
                              productName = newValue.name || '';
                              category = newValue.category || '';
                            } else {
                              // Simple string value
                              productName = newValue;
                            }
                            
                            // Validate the product name
                            if (!productName.trim()) {
                              setErrors(prev => ({
                                ...prev,
                                name: 'Product name is required'
                              }));
                              return;
                            }
                            
                            if (productName.trim().length < 3) {
                              setErrors(prev => ({
                                ...prev,
                                name: 'Product name must be at least 3 characters'
                              }));
                              return;
                            }
                            
                            if (productName.trim().length > 50) {
                              setErrors(prev => ({
                                ...prev,
                                name: 'Product name cannot exceed 50 characters'
                              }));
                              return;
                            }
                            
                            // Update form data with validated values
                            const updates = { name: productName };
                            
                            // If product has category, add it to updates
                            if (category && !formData.category) {
                              updates.category = category;
                            }
                            
                            setFormData(prev => ({
                              ...prev,
                              ...updates
                            }));
                          }}
                          onUnitChange={handleChange}
                          error={!!errors.name}
                          helperText={errors.name}
                          required
                          placeholder="Search for a product or enter a custom name"
                          categoryFilter={formData.category}
                          showCategoryFilter={true}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          error={!!errors.description}
                          helperText={errors.description}
                          multiline
                          rows={4}
                          placeholder="Describe your product in detail including quality, source, etc."
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Price"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          error={!!errors.price}
                          helperText={errors.price}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          placeholder="0.00"
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!errors.unit}>
                          <InputLabel>Unit</InputLabel>
                          <Select
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            label="Unit"
                          >
                            {units.map(unit => (
                              <MenuItem key={unit} value={unit}>
                                {unit}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.unit && <FormHelperText>{errors.unit}</FormHelperText>}
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Stock Quantity"
                          name="stock"
                          value={formData.stock}
                          onChange={handleChange}
                          error={!!errors.stock}
                          helperText={errors.stock}
                          type="number"
                          placeholder="0"
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!errors.category}>
                          <InputLabel>Category</InputLabel>
                          <Select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            label="Category"
                            disabled={categoriesLoading}
                          >
                            {categoriesLoading ? (
                              <MenuItem disabled>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <CircularProgress size={20} sx={{ mr: 1 }} />
                                  Loading categories...
                                </Box>
                              </MenuItem>
                            ) : categories.length === 0 ? (
                              <MenuItem disabled>No categories available</MenuItem>
                            ) : (
                              categories.map(category => (
                                <MenuItem key={category} value={category}>
                                  {category}
                                </MenuItem>
                              ))
                            )}
                          </Select>
                          {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                          {!errors.category && (
                            <FormHelperText>
                              <Button 
                                size="small" 
                                onClick={() => navigate('/seller/products/categories')}
                                sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
                              >
                                Manage categories
                              </Button>
                            </FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Images */}
              <Grid item xs={12} md={4}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    borderRadius: 2, 
                    border: `1px solid ${theme.palette.divider}`,
                    height: '100%'
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" mb={2} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      Product Images
                      <Button 
                        size="small" 
                        startIcon={showPreview ? <VisibilityOff /> : <Visibility />}
                        onClick={togglePreview}
                      >
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                      </Button>
                    </Typography>
                    
                    <Box 
                      sx={{ 
                        border: `2px dashed ${theme.palette.primary.main}`,
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        bgcolor: theme.palette.primary.lighter,
                        mb: 2
                      }}
                    >
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="image-upload"
                        type="file"
                        multiple
                        onChange={handleImageUpload}
                      />
                      <label htmlFor="image-upload">
                        <Button
                          component="span"
                          variant="outlined"
                          startIcon={<CloudUpload />}
                          sx={{ mb: 2 }}
                        >
                          Upload Images
                        </Button>
                      </label>
                      <Typography variant="body2" color="text.secondary">
                        Drag and drop or click to upload
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Supported formats: JPG, PNG, WEBP
                      </Typography>
                      
                      {errors.images && (
                        <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                          {errors.images}
                        </Typography>
                      )}
                    </Box>
                    
                    {previewImages.length > 0 && (
                      <Grid container spacing={1}>
                        {previewImages.map((image, index) => (
                          <Grid item xs={4} key={index}>
                            <Box
                              sx={{
                                position: 'relative',
                                height: 80,
                                borderRadius: 1,
                                overflow: 'hidden',
                              }}
                            >
                              <img
                                src={image.preview}
                                alt={`Preview ${index}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                              <IconButton
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  right: 0,
                                  bgcolor: 'rgba(0,0,0,0.5)',
                                  color: 'white',
                                  '&:hover': {
                                    bgcolor: 'rgba(0,0,0,0.7)',
                                  },
                                }}
                                onClick={() => handleRemoveImage(index)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Additional Information */}
              <Grid item xs={12}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    borderRadius: 2, 
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" mb={2} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      Additional Information
                      <Button 
                        size="small" 
                        startIcon={showPreview ? <VisibilityOff /> : <Visibility />}
                        onClick={togglePreview}
                      >
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                      </Button>
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box mb={2}>
                          <Typography variant="subtitle2" mb={1}>
                            Tags
                          </Typography>
                          <Box display="flex" alignItems="center" mb={1}>
                            <TextField
                              size="small"
                              value={newTag}
                              onChange={(e) => {
                                const value = e.target.value;
                                setNewTag(value);
                                
                                // Provide real-time validation feedback for tags
                                if (value.trim().length > 20) {
                                  setErrors(prev => ({ 
                                    ...prev, 
                                    tags: 'Tag cannot exceed 20 characters' 
                                  }));
                                } else if (formData.tags.includes(value.trim()) && value.trim()) {
                                  setErrors(prev => ({ 
                                    ...prev, 
                                    tags: 'This tag already exists' 
                                  }));
                                } else {
                                  setErrors(prev => ({ 
                                    ...prev, 
                                    tags: null 
                                  }));
                                }
                              }}
                              placeholder="Add a tag"
                              sx={{ mr: 1 }}
                              error={!!errors.tags}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddTag();
                                }
                              }}
                            />
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={handleAddTag}
                              startIcon={<Add />}
                              disabled={!!errors.tags || !newTag.trim()}
                            >
                              Add
                            </Button>
                          </Box>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {formData.tags.map((tag, index) => (
                              <Chip
                                key={index}
                                label={tag}
                                onDelete={() => handleRemoveTag(tag)}
                                sx={{ m: 0.5 }}
                              />
                            ))}
                          </Stack>
                          {errors.tags && (
                            <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                              {errors.tags}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.organic}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  organic: e.target.checked
                                });
                              }}
                              color="success"
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body1" mr={1}>Organic Product</Typography>
                              {formData.organic && (
                                <Chip 
                                  label="Organic" 
                                  size="small" 
                                  color="success" 
                                  sx={{ ml: 1 }} 
                                />
                              )}
                            </Box>
                          }
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Harvest Date"
                          name="harvestDate"
                          type="date"
                          value={formData.harvestDate}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                          error={!!errors.harvestDate}
                          helperText={errors.harvestDate || (isEditing ? "Harvest date cannot be changed after product creation" : "When was this product harvested?")}
                          InputProps={{
                            readOnly: isEditing, // Make harvest date read-only when editing
                            disabled: isEditing, // Also visually disable the field
                            sx: isEditing ? {
                              backgroundColor: theme.palette.action.disabledBackground,
                              "& .MuiInputBase-input.Mui-disabled": {
                                WebkitTextFillColor: theme.palette.text.secondary,
                              }
                            } : {}
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Expiry Date"
                          name="expiryDate"
                          type="date"
                          value={formData.expiryDate}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                          error={!!errors.expiryDate}
                          helperText={errors.expiryDate || "When will this product expire?"}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Nutritional Information"
                          name="nutritionalInfo"
                          value={formData.nutritionalInfo}
                          onChange={handleChange}
                          multiline
                          rows={3}
                          placeholder="Enter nutritional details like calories, vitamins, etc."
                          error={!!errors.nutritionalInfo}
                          helperText={errors.nutritionalInfo}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {errors.submit && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {errors.submit}
              </Alert>
            )}
            
            <Box mt={4} display="flex" justifyContent="space-between" flexWrap="wrap">
              <Button
                variant="outlined"
                color="secondary"
                startIcon={showPreview ? <VisibilityOff /> : <Visibility />}
                onClick={togglePreview}
                sx={{ mb: { xs: 2, sm: 0 } }}
              >
                {showPreview ? 'Hide Preview' : 'Show Customer Preview'}
              </Button>
              
              <Box display="flex">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/seller/products')}
                  sx={{ mr: 2 }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={loading ? null : (isEditing ? <Edit /> : <Save />)}
                  disabled={loading || hasValidationErrors()}
                  sx={{
                    px: 4,
                    position: 'relative'
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress
                        size={24}
                        sx={{
                          position: 'absolute',
                          left: '50%',
                          marginLeft: '-12px',
                        }}
                      />
                      Processing...
                    </>
                  ) : (
                    isEditing ? 'Update Product' : 'Save Product'
                  )}
                </Button>
              </Box>
            </Box>
          </Box>
        </form>
      )}
    </Box>
  );
};

export default ProductAdd; 