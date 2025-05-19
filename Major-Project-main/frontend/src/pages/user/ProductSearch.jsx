import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Typography, TextField, Button, Card, CardContent, CardMedia, CardActions,
  Grid, Chip, Slider, Checkbox, FormControlLabel, FormGroup, Select, MenuItem,
  InputLabel, FormControl, Pagination, CircularProgress, Divider, Accordion,
  AccordionSummary, AccordionDetails, InputAdornment, Container, IconButton, Collapse,
  Tooltip, Snackbar, Alert, styled
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ShoppingCart as ShoppingCartIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  LocalFireDepartment as FireIcon,
  ExpandMore as ExpandMoreIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import wishlistService from '../../services/wishlistService';
import * as cartService from '../../services/cartService';
import { getImage } from '../../services/api';

// Define styled component for pulse animation
const PulseChip = styled(Chip)(({ theme }) => ({
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.4)'
    },
    '70%': {
      boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)'
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)'
    }
  },
  animation: 'pulse 2s infinite',
  fontWeight: 'bold'
}));

const ProductSearch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: [],
    priceRange: [0, 1000],
    isOrganic: false,
    isFresh: false,
    sellerType: [],
    rating: 0,
    sortBy: 'relevance',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [filterOpen, setFilterOpen] = useState(true); // State for filter visibility
  const [expandedAccordion, setExpandedAccordion] = useState(null); // Track which accordion is expanded
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [wishlistItems, setWishlistItems] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [addingToCart, setAddingToCart] = useState({}); // Track which products are being added to cart
  const [productImages, setProductImages] = useState({}); // Track loaded product images

  // Parse URL parameters and apply filters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    // Parse and apply category filter
    const category = searchParams.get('category');
    if (category) {
      setFilters(prev => ({
        ...prev,
        category: [category]
      }));
    }
    
    // Parse and apply organic filter
    const organic = searchParams.get('organic');
    if (organic === 'true') {
      setFilters(prev => ({
        ...prev,
        isOrganic: true
      }));
    }
    
    // Parse and apply featured filter
    const featured = searchParams.get('featured');
    if (featured === 'true') {
      // Apply featured filter logic here
      // This might require additional API parameters or filtering
    }
    
    // Parse and apply sort parameter
    const sort = searchParams.get('sort');
    if (sort) {
      setFilters(prev => ({
        ...prev,
        sortBy: sort
      }));
    }
    
  }, [location.search]);

  useEffect(() => {
    // Fetch products from the API
    fetchProducts();
    // Fetch wishlist items
    fetchWishlistItems();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL || 'http://https://fresh-connect-backend.onrender.com'}/api/products`);
      
      let productData = [];
      if (response.data?.products) {
        productData = response.data.products;
      } else if (response.data?.data) {
        productData = response.data.data;
      } else if (Array.isArray(response.data)) {
        productData = response.data;
      }
      
      console.log('Fetched products:', productData.length);
      setProducts(productData);
      setFilteredProducts(productData);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to mock data if API fails
      const mockProducts = getMockProducts();
      console.log('Using mock products:', mockProducts.length);
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlistItems = async () => {
    try {
      const response = await wishlistService.getWishlistItems();
      console.log('Wishlist response:', response);
      if (response && response.data && response.data.wishlist) {
        // Create a map of productId -> true for easy lookup
        const wishlistMap = {};
        response.data.wishlist.forEach(item => {
          // Check if item.product exists before accessing its _id
          if (item.product) {
            wishlistMap[item.product._id] = true;
          }
        });
        setWishlistItems(wishlistMap);
        console.log('Wishlist map:', wishlistMap);
      }
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
    }
  };

  // Fallback mock data function
  const getMockProducts = () => {
    return [
        {
          id: 1,
          name: "Organic Tomatoes",
          category: "Vegetables",
          price: 3.99,
        image: {
          url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80"
        },
          seller: "Green Farm",
          sellerType: "Verified",
          rating: "4.7",
          isOrganic: true,
          isFresh: true,
          stock: 25,
          urgentSale: false,
          discountPercentage: 0
        },
      // ... other mock products
    ];
  };

  useEffect(() => {
    applyFilters();
  }, [filters, searchTerm, products]);

  const applyFilters = () => {
    let filtered = [...products];
    console.log('Applying filters to', filtered.length, 'products with filters:', filters);

    // Apply search term
    if (searchTerm && searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product => {
        // Check if product name exists and includes search term
        const nameMatch = product?.name?.toLowerCase().includes(search);
        
        // Check if category exists and includes search term
        const categoryMatch = product?.category?.toLowerCase().includes(search);
        
        // Check seller - could be string or object with name property
        let sellerMatch = false;
        if (product?.seller) {
          if (typeof product.seller === 'string') {
            sellerMatch = product.seller.toLowerCase().includes(search);
          } else if (product.seller.name) {
            sellerMatch = product.seller.name.toLowerCase().includes(search);
          }
        }
        
        return nameMatch || categoryMatch || sellerMatch;
      });
      console.log('After search filter:', filtered.length, 'products');
    }

    // Apply category filter
    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.category) return false;
        return filters.category.includes(product.category);
      });
      console.log('After category filter:', filtered.length, 'products');
    }

    // Apply price range filter - ensure we have valid price values
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price) || 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });
    console.log('After price filter:', filtered.length, 'products');

    // Apply organic filter
    if (filters.isOrganic) {
      filtered = filtered.filter(product => Boolean(product.isOrganic));
      console.log('After organic filter:', filtered.length, 'products');
    }

    // Apply fresh filter
    if (filters.isFresh) {
      filtered = filtered.filter(product => Boolean(product.isFresh));
      console.log('After fresh filter:', filtered.length, 'products');
    }

    // Apply seller type filter
    if (filters.sellerType && filters.sellerType.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.sellerType) return false;
        return filters.sellerType.includes(product.sellerType);
      });
      console.log('After seller type filter:', filtered.length, 'products');
    }

    // Apply rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(product => {
        const rating = parseFloat(product.rating) || 0;
        return rating >= filters.rating;
      });
      console.log('After rating filter:', filtered.length, 'products');
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
        break;
      default:
        // Default is relevance, no need to sort
        break;
    }
    console.log('After sorting:', filtered.length, 'products');

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page after filtering
  };

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };

  // Get current products
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle filter visibility
  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
    // Close all accordions when main filter is closed
    if (filterOpen) {
      setExpandedAccordion(null);
    }
  };

  // Handle accordion expansion
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : null);
  };

  // Get image URL based on the hybrid storage approach
  const getImageUrl = (product) => {
    if (!product) return '';
    
    // If product has image object with url property (new hybrid storage)
    if (product.image && product.image.url) {
      return product.image.url;
    }
    
    // If product has direct image URL (old approach)
    if (typeof product.image === 'string') {
      return product.image;
    }
    
    // If product has image ID, construct URL to fetch from API
    if (product._id) {
      return `${import.meta.env.VITE_BASE_URL || 'http://https://fresh-connect-backend.onrender.com'}/api/products/image/${product._id}`;
    }
    
    // Fallback to placeholder
    return 'https://via.placeholder.com/500x500?text=No+Image';
  };

  const handleAddToCart = async (productId, product) => {
    try {
      console.log('Adding product to cart, ID:', productId);
      
      // Get authentication status before making the request
      const token = localStorage.getItem('token');
      console.log('Authentication token exists:', !!token);
      if (token) {
        console.log('Token preview:', token.substring(0, 15) + '...');
      }
      
      // Set loading state for this specific product
      setAddingToCart(prev => ({ ...prev, [productId]: true }));
      
      // Get current image from our loaded images or from product
      const productImage = productImages[productId] || 
                         (product.image && product.image.url) ||
                         (typeof product.image === 'string' ? product.image : null) ||
                         (product.images && product.images.length > 0 ? product.images[0].url : null);
      
      console.log('Cart: Product image being used:', productImage ? productImage.substring(0, 50) + '...' : 'No image');
      console.log('Cart: Image source type:', 
        productImages[productId] ? 'From loaded images cache' : 
        (product.image && product.image.url) ? 'From product.image.url' :
        (typeof product.image === 'string') ? 'From product.image string' :
        (product.images && product.images.length > 0) ? 'From product.images array' : 'No image source found');
      
      // Create a cart item object with all required fields
      const cartItem = {
        productId: productId,
        name: product.name,
        price: product.price,
        restaurantId: product.seller?._id || product.sellerId || product.restaurantId || 'default-restaurant',
        quantity: 1,
        category: product.category,
        discountPrice: product.discountPrice,
        seller: product.seller,
        stock: product.stock,
        image: productImage,
        productImage: productImage
      };
      
      console.log('Product data for cart (full):', cartItem);
      console.log('Image data being sent to cart API:', {
        image: productImage ? 'Image present' : 'No image',
        productImage: productImage ? 'Image present' : 'No image',
        imagePreview: productImage ? productImage.substring(0, 30) + '...' : 'None'
      });
      
      // Call the API to add to cart with detailed logging and product details
      console.log('Making cart API request to add product');
      const response = await cartService.addToCart(cartItem);
      console.log('Cart API response:', response);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Product added to cart successfully',
        severity: 'success'
      });
      
      console.log('Successfully added to cart');
    } catch (error) {
      console.error('Error adding product to cart:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Show appropriate error message
      let errorMessage = 'Failed to add product to cart';
      
      if (error.response?.status === 401) {
        errorMessage = 'Please log in to add items to your cart';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      // Clear loading state
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const handleAddToWishlist = async (product) => {
    try {
      const productId = product._id || product.id;
      console.log('Adding to wishlist, product ID:', productId);
      
      // Get authentication status before making the request
      const token = localStorage.getItem('token');
      console.log('Authentication token exists:', !!token);
      if (token) {
        console.log('Token preview:', token.substring(0, 15) + '...');
      }
      
      // Get current image from our loaded images or from product
      const productImage = productImages[productId] || 
                         (product.image && product.image.url) ||
                         (typeof product.image === 'string' ? product.image : null);
      
      console.log('Product image value being used:', productImage);
      console.log('Product image source:', 
        productImages[productId] ? 'from loaded images' : 
        (product.image && product.image.url) ? 'from product.image.url' :
        (typeof product.image === 'string') ? 'from product.image string' : 'not found');
      
      // Create a product object with all the data we have
      const productData = {
        name: product.name,
        category: product.category,
        price: product.price,
        discountPrice: product.discountPrice,
        seller: product.seller,
        // Use our loaded image or image information from the product, providing multiple ways for backend to extract it
        image: productImage,
        productImage: productImage // Add explicitly named field for backend storage
      };
      
      console.log('Product data for wishlist:', {
        ...productData,
        image: productImage ? 'image data present' : 'no image',
        imagePreview: productImage ? productImage.substring(0, 30) + '...' : 'none'
      });
      
      // Make the API request with detailed logging
      console.log('Making wishlist API request to:', '/api/wishlist');
      const response = await wishlistService.addToWishlist(productId, productData);
      console.log('Wishlist API response:', response);
      
      // Update local state
      setWishlistItems(prev => ({
        ...prev,
        [productId]: true
      }));
      
      setNotification({
        open: true,
        message: 'Product added to wishlist!',
        severity: 'success'
      });
      
      console.log('Successfully added to wishlist');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Check if it's an authentication error
      const errorMessage = error.response?.status === 401
        ? 'Please log in to add items to your wishlist'
        : error.response?.data?.message || 'Failed to add to wishlist. Please try again.';
        
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleRemoveFromWishlist = async (product) => {
    try {
      const productId = product._id || product.id;
      console.log('Removing from wishlist, product ID:', productId);
      
      // Get authentication status before making the request
      const token = localStorage.getItem('token');
      console.log('Authentication token exists:', !!token);
      if (token) {
        console.log('Token preview:', token.substring(0, 15) + '...');
      }
      
      // Make the API request with detailed logging
      console.log('Making wishlist removal API request to:', `/api/wishlist/${productId}`);
      const response = await wishlistService.removeFromWishlist(productId);
      console.log('Wishlist removal API response:', response);
      
      // Update local state
      const updatedWishlist = { ...wishlistItems };
      delete updatedWishlist[productId];
      setWishlistItems(updatedWishlist);
      
      setNotification({
        open: true,
        message: 'Product removed from wishlist!',
        severity: 'success'
      });
      
      console.log('Successfully removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Check if it's an authentication error
      const errorMessage = error.response?.status === 401
        ? 'Please log in to manage your wishlist'
        : error.response?.data?.message || 'Failed to remove from wishlist. Please try again.';
        
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Function to load product images
  const loadProductImages = async (products) => {
    const imageUrls = {};
    
    if (products && products.length > 0) {
      // Process products in parallel, but limit to 5 concurrent requests
      const chunks = [];
      const chunkSize = 5;
      
      for (let i = 0; i < products.length; i += chunkSize) {
        chunks.push(products.slice(i, i + chunkSize));
      }
      
      for (const chunk of chunks) {
        await Promise.all(chunk.map(async (product) => {
          if (product && (product._id || product.id)) {
            const productId = product._id || product.id;
            try {
              // First check if product already has an image URL directly
              if (product.image && product.image.url) {
                imageUrls[productId] = product.image.url;
                return;
              }
              
              if (typeof product.image === 'string') {
                imageUrls[productId] = product.image;
                return;
              }
              
              // Then try to get image from API
              const imageUrl = await getImage(productId);
              if (imageUrl) {
                imageUrls[productId] = imageUrl;
              } else {
                // If API fails, use a category-based placeholder or general placeholder
                let fallbackImage = 'https://via.placeholder.com/400x400?text=Product+Image';
                
                // Use category-specific placeholders if category exists
                if (product.category) {
                  const category = product.category.toLowerCase();
                  if (category.includes('vegetable') || category === 'vegetables') {
                    fallbackImage = 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80';
                  } else if (category.includes('fruit') || category === 'fruits') {
                    fallbackImage = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80';
                  } else if (category.includes('herb') || category === 'herbs') {
                    fallbackImage = 'https://images.unsplash.com/photo-1556646781-a84ff68f54ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80';
                  }
                }
                
                imageUrls[productId] = fallbackImage;
              }
            } catch (error) {
              console.error(`Failed to load image for product ${productId}:`, error);
              // Set a default placeholder on error
              imageUrls[productId] = 'https://via.placeholder.com/400x400?text=Image+Unavailable';
            }
          }
        }));
      }
    }
    
    setProductImages(prev => ({...prev, ...imageUrls}));
  };
  
  // Load images when products change
  useEffect(() => {
    if (products.length > 0) {
      loadProductImages(products);
    }
    
    // Cleanup function to revoke object URLs on unmount
    return () => {
      Object.values(productImages).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [products]);

  const renderProductCard = (product) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={product._id || product.id}>
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
        }
      }}>
        {product.urgentSale && (
          <PulseChip
            label="URGENT SALE"
            color="error"
            icon={<FireIcon />}
            size="small"
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              zIndex: 1,
            }}
          />
        )}
        {product.isOrganic && (
          <Chip
            label="Organic"
            color="success"
            size="small"
            sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
          />
        )}
        <Link 
          to={`/products/${product._id || product.id}`} 
          style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flexGrow: 1 }}
        >
          <div className="product-card-image-container">
            {addingToCart[product._id || product.id] ? (
              <div className="product-card-loader">
                <CircularProgress size={24} />
              </div>
            ) : (
              <>
                <img
                  src={
                    productImages[product._id || product.id] || 
                    (product.image && product.image.url) ||
                    (typeof product.image === 'string' ? product.image : '/placeholder-image.png')
                  }
                  alt={product.name}
                  className="product-card-image"
                  onError={(e) => {
                    console.log(`Image load error for product ${product._id || product.id}`);
                    e.target.onerror = null;
                    
                    // Use category-specific placeholders if possible
                    if (product.category) {
                      const category = product.category.toLowerCase();
                      if (category.includes('vegetable') || category === 'vegetables') {
                        e.target.src = 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80';
                      } else if (category.includes('fruit') || category === 'fruits') {
                        e.target.src = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80';
                      } else if (category.includes('herb') || category === 'herbs') {
                        e.target.src = 'https://images.unsplash.com/photo-1556646781-a84ff68f54ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80';
                      } else {
                        e.target.src = 'https://via.placeholder.com/400x400?text=Product+Image';
                      }
                    } else {
                      e.target.src = 'https://via.placeholder.com/400x400?text=Product+Image';
                    }
                  }}
                />
                {product.discountPercentage > 0 && product.price && (
                  <div className="product-discount-badge">
                    {Math.round(((product.price * (1 - product.discountPercentage / 100)) - product.price) / product.price * 100)}% OFF
                  </div>
                )}
              </>
            )}
          </div>
          <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
            {/* Category */}
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                display: 'inline-block', 
                bgcolor: 'grey.100', 
                px: 1, 
                py: 0.5, 
                borderRadius: 1,
                mb: 1.5,
                textTransform: 'capitalize'
              }}
            >
              {product.category}
            </Typography>
            
            {/* Product Name - Fixed Height with Ellipsis */}
            <Typography 
              variant="h6" 
              component="h3" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.3,
                height: '2.6em',
                mb: 1
              }}
              title={product.name} // Shows full name on hover
            >
              {product.name}
            </Typography>
            
            {/* Rating */}
            <Box display="flex" alignItems="center" mb={1.5}>
              <StarIcon sx={{ color: 'gold', fontSize: '1.1rem', mr: 0.5 }} />
              <Typography variant="body2" fontWeight={500}>
                {product.rating || '0'}
              </Typography>
            </Box>
            
            {/* Price */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              {product.discountPercentage > 0 ? (
                <Box>
                  <Typography variant="body1" fontWeight="bold" color="error">
                    ₹{(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                    ₹{product.price.toFixed(2)}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body1" fontWeight="bold" color="primary.main" fontSize="1.1rem">
                  ₹{product.price?.toFixed(2)}
                  {product.unit && <Typography component="span" variant="caption" color="text.secondary" ml={0.5}>/{product.unit}</Typography>}
                </Typography>
              )}
            </Box>
            
            {/* Seller Info */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ 
                maxWidth: '70%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }} title={product.seller?.name || 'Unknown'}>
                Seller: {product.seller?.name || product.seller || 'Unknown'}
              </Typography>
              {product.sellerType === 'Verified' && (
                <Chip label="Verified" color="primary" size="small" />
              )}
            </Box>
            
            {/* Stock */}
            {product.stock !== undefined && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                Stock: {product.stock} {product.unit || 'items'}
              </Typography>
            )}
          </CardContent>
        </Link>
        <CardActions sx={{ p: 2, pt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<ShoppingCartIcon />}
            fullWidth
            sx={{
              borderRadius: 2,
              py: 1.5,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              height: '42px',
              mr: 1,
              flexGrow: 1,
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              minWidth: '120px',
              fontSize: '0.9rem',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleAddToCart(product._id || product.id, product);
            }}
            disabled={addingToCart[product._id || product.id]}
          >
            {addingToCart[product._id || product.id] ? 'Adding...' : 'Add to Cart'}
          </Button>
          <Tooltip title={wishlistItems[product._id || product.id] ? "Remove from Wishlist" : "Add to Wishlist"}>
            <IconButton 
              color={wishlistItems[product._id || product.id] ? "error" : "default"}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (wishlistItems[product._id || product.id]) {
                  handleRemoveFromWishlist(product);
                } else {
                  handleAddToWishlist(product);
                }
              }}
              sx={{ 
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                '&:hover': {
                  transform: 'scale(1.1)',
                  backgroundColor: wishlistItems[product._id || product.id] ? 'rgba(244, 67, 54, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                }
              }}
            >
              {wishlistItems[product._id || product.id] ? 
                <FavoriteIcon /> : 
                <FavoriteBorderIcon />
              }
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </Grid>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading products...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Browse Products
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find fresh vegetables, fruits, and more from verified sellers
        </Typography>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} mt={2}>
          <form onSubmit={(e) => {
            e.preventDefault();
            applyFilters();
          }} style={{ width: '100%' }}>
            <TextField
              fullWidth
              placeholder="Search for products, categories, or sellers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                // Prevent form submission on Enter key press inside the field
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applyFilters();
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button 
                      variant="contained" 
                      onClick={() => applyFilters()}
                      startIcon={<SearchIcon />}
                      type="button"
                    >
                      Search
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </form>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Box 
            sx={{ 
              position: { md: 'sticky' }, 
              top: { md: '24px' },
              maxHeight: { md: 'calc(100vh - 100px)' },
              overflowY: { md: 'auto' },
              pr: { md: 1 },
              mb: { xs: 3, md: 0 }
            }}
          >
            <Box mb={3}>
              <Box display="flex" alignItems="center" justifyContent="space-between" onClick={toggleFilter} sx={{ cursor: 'pointer', mb: 2 }}>
                <Typography variant="h6">
                  Filters
                  <FilterIcon sx={{ ml: 1, verticalAlign: 'middle' }} />
                </Typography>
                <IconButton size="small">
                  <KeyboardArrowDownIcon sx={{ transform: filterOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Collapse in={filterOpen}>
                <Accordion 
                  expanded={expandedAccordion === 'category'} 
                  onChange={handleAccordionChange('category')}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Categories</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <FormGroup>
                      {['vegetables', 'fruits', 'herbs', 'organic'].map((category) => (
                        <FormControlLabel
                          key={category}
                          control={
                            <Checkbox
                              checked={filters.category.includes(category)}
                              onChange={(e) => {
                                const newCategories = e.target.checked
                                  ? [...filters.category, category]
                                  : filters.category.filter(c => c !== category);
                                
                                handleFilterChange('category', newCategories);
                              }}
                            />
                          }
                          label={category.charAt(0).toUpperCase() + category.slice(1)}
                        />
                      ))}
                    </FormGroup>
                  </AccordionDetails>
                </Accordion>

                <Accordion 
                  expanded={expandedAccordion === 'price'} 
                  onChange={handleAccordionChange('price')}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Price Range</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box px={2}>
                      <Slider
                        value={filters.priceRange}
                        onChange={(_, newValue) => handleFilterChange('priceRange', newValue)}
                        valueLabelDisplay="auto"
                        min={0}
                        max={1000}
                        step={10}
                      />
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          ₹{filters.priceRange[0]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ₹{filters.priceRange[1]}
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion 
                  expanded={expandedAccordion === 'productType'} 
                  onChange={handleAccordionChange('productType')}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Product Type</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={filters.isOrganic}
                            onChange={(e) => handleFilterChange('isOrganic', e.target.checked)}
                          />
                        }
                        label="Organic Products"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={filters.isFresh}
                            onChange={(e) => handleFilterChange('isFresh', e.target.checked)}
                          />
                        }
                        label="Fresh Products"
                      />
                    </FormGroup>
                  </AccordionDetails>
                </Accordion>

                <Accordion 
                  expanded={expandedAccordion === 'sellerType'} 
                  onChange={handleAccordionChange('sellerType')}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Seller Type</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <FormGroup>
                      {['Verified', 'Standard'].map((type) => (
                        <FormControlLabel
                          key={type}
                          control={
                            <Checkbox
                              checked={filters.sellerType.includes(type)}
                              onChange={(e) => {
                                const newTypes = e.target.checked
                                  ? [...filters.sellerType, type]
                                  : filters.sellerType.filter(t => t !== type);
                                
                                handleFilterChange('sellerType', newTypes);
                              }}
                            />
                          }
                          label={type}
                        />
                      ))}
                    </FormGroup>
                  </AccordionDetails>
                </Accordion>

                <Accordion 
                  expanded={expandedAccordion === 'rating'} 
                  onChange={handleAccordionChange('rating')}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Rating</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <FormControl fullWidth>
                      <Select
                        value={filters.rating}
                        onChange={(e) => handleFilterChange('rating', e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value={0}>All Ratings</MenuItem>
                        <MenuItem value={4}>4★ & above</MenuItem>
                        <MenuItem value={3}>3★ & above</MenuItem>
                        <MenuItem value={2}>2★ & above</MenuItem>
                        <MenuItem value={1}>1★ & above</MenuItem>
                      </Select>
                    </FormControl>
                  </AccordionDetails>
                </Accordion>

                <Accordion 
                  expanded={expandedAccordion === 'sortBy'} 
                  onChange={handleAccordionChange('sortBy')}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Sort By</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <FormControl fullWidth>
                      <Select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      >
                        <MenuItem value="relevance">Relevance</MenuItem>
                        <MenuItem value="price-asc">Price: Low to High</MenuItem>
                        <MenuItem value="price-desc">Price: High to Low</MenuItem>
                        <MenuItem value="newest">Newest First</MenuItem>
                        <MenuItem value="rating">Customer Rating</MenuItem>
                      </Select>
                    </FormControl>
                  </AccordionDetails>
                </Accordion>

                <Box mt={3}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth
                    onClick={() => {
                      setFilters({
                        category: [],
                        priceRange: [0, 1000],
                        isOrganic: false,
                        isFresh: false,
                        sellerType: [],
                        rating: 0,
                        sortBy: 'relevance',
                      });
                      setSearchTerm('');
                    }}
                  >
                    Clear All Filters
                  </Button>
                </Box>
              </Collapse>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={9}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="body1" fontWeight={500}>
              {filteredProducts.length} products found
            </Typography>
            <FormControl size="small" sx={{ width: 200 }}>
              <Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                displayEmpty
                variant="outlined"
              >
                <MenuItem value="relevance">Sort by Relevance</MenuItem>
                <MenuItem value="price-asc">Price: Low to High</MenuItem>
                <MenuItem value="price-desc">Price: High to Low</MenuItem>
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="newest">Newest Arrivals</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {filteredProducts.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {currentProducts.map(product => renderProductCard(product))}
              </Grid>
              
              <Box display="flex" justifyContent="center" mt={4} mb={2}>
                <Pagination
                  count={Math.ceil(filteredProducts.length / itemsPerPage)}
                  page={currentPage}
                  onChange={handlePageChange}
                  size="large"
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            </>
          ) : (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              py={8}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 1
              }}
            >
              <Typography variant="h6" color="text.secondary" mb={2}>
                No products match your search criteria
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setSearchTerm('');
                  setFilters({
                    category: [],
                    priceRange: [0, 1000],
                    isOrganic: false,
                    isFresh: false,
                    sellerType: [],
                    rating: 0,
                    sortBy: 'relevance',
                  });
                }}
              >
                Reset Filters
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>

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

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductSearch; 