import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Card, CardContent, CardMedia, CardActions,
  Grid, Chip, Slider, Checkbox, FormControlLabel, FormGroup, Select, MenuItem,
  InputLabel, FormControl, Pagination, CircularProgress, Divider, Accordion,
  AccordionSummary, AccordionDetails, InputAdornment, Container
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ShoppingCart as ShoppingCartIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  LocalFireDepartment as FireIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

const ProductSearch = () => {
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

  useEffect(() => {
    // In a real app, this would be an API call with all the filter parameters
    // Simulating data fetch
    setLoading(true);
    setTimeout(() => {
      // Create predefined products with matching names and images - all with consistent size parameters
      const productData = [
        {
          id: 1,
          name: "Organic Tomatoes",
          category: "Vegetables",
          price: 3.99,
          image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Green Farm",
          sellerType: "Verified",
          rating: "4.7",
          isOrganic: true,
          isFresh: true,
          stock: 25,
          urgentSale: false,
          discountPercentage: 0
        },
        {
          id: 2,
          name: "Fresh Potatoes",
          category: "Vegetables",
          price: 2.49,
          image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Local Harvest",
          sellerType: "Standard",
          rating: "4.3",
          isOrganic: false,
          isFresh: true,
          stock: 40,
          urgentSale: false,
          discountPercentage: 0
        },
        {
          id: 3,
          name: "Red Apples",
          category: "Fruits",
          price: 4.99,
          image: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Orchard Fresh",
          sellerType: "Verified",
          rating: "4.8",
          isOrganic: true,
          isFresh: true,
          stock: 30,
          urgentSale: false,
          discountPercentage: 0
        },
        {
          id: 4,
          name: "Yellow Bananas",
          category: "Fruits",
          price: 2.99,
          image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Tropical Goods",
          sellerType: "Standard",
          rating: "4.5",
          isOrganic: false,
          isFresh: true,
          stock: 15,
          urgentSale: true,
          discountPercentage: 20
        },
        {
          id: 5,
          name: "Fresh Spinach",
          category: "Vegetables",
          price: 3.49,
          image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Green Leaf",
          sellerType: "Verified",
          rating: "4.6",
          isOrganic: true,
          isFresh: true,
          stock: 20,
          urgentSale: false,
          discountPercentage: 0
        },
        {
          id: 6,
          name: "Organic Carrots",
          category: "Vegetables",
          price: 2.79,
          image: "https://images.unsplash.com/photo-1447175008436-054170c2e979?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Root Crops",
          sellerType: "Standard",
          rating: "4.4",
          isOrganic: true,
          isFresh: true,
          stock: 35,
          urgentSale: false,
          discountPercentage: 0
        },
        {
          id: 7,
          name: "Organic Milk",
          category: "Dairy",
          price: 5.99,
          image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Dairy Delights",
          sellerType: "Verified",
          rating: "4.9",
          isOrganic: true,
          isFresh: true,
          stock: 10,
          urgentSale: true,
          discountPercentage: 15
        },
        {
          id: 8,
          name: "Fresh Strawberries",
          category: "Fruits",
          price: 6.99,
          image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Berry Farm",
          sellerType: "Standard",
          rating: "4.7",
          isOrganic: false,
          isFresh: true,
          stock: 12,
          urgentSale: true,
          discountPercentage: 25
        },
        {
          id: 9,
          name: "Brown Rice",
          category: "Grains",
          price: 8.49,
          image: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Grain House",
          sellerType: "Verified",
          rating: "4.5",
          isOrganic: true,
          isFresh: false,
          stock: 50,
          urgentSale: false,
          discountPercentage: 0
        },
        {
          id: 10,
          name: "Organic Honey",
          category: "Dairy",
          price: 12.99,
          image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Sweet Bee",
          sellerType: "Verified",
          rating: "4.9",
          isOrganic: true,
          isFresh: false,
          stock: 8,
          urgentSale: false,
          discountPercentage: 0
        },
        {
          id: 11,
          name: "Ripe Avocados",
          category: "Fruits",
          price: 7.99,
          image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Green Picks",
          sellerType: "Standard",
          rating: "4.6",
          isOrganic: false,
          isFresh: true,
          stock: 15,
          urgentSale: true,
          discountPercentage: 10
        },
        {
          id: 12,
          name: "Artisan Cheese",
          category: "Dairy",
          price: 9.99,
          image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Cheese Craft",
          sellerType: "Verified",
          rating: "4.8",
          isOrganic: true,
          isFresh: true,
          stock: 20,
          urgentSale: false,
          discountPercentage: 0
        },
        {
          id: 13,
          name: "Fresh Broccoli",
          category: "Vegetables",
          price: 3.29,
          image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Garden Fresh",
          sellerType: "Standard",
          rating: "4.3",
          isOrganic: false,
          isFresh: true,
          stock: 25,
          urgentSale: false,
          discountPercentage: 0
        },
        {
          id: 14,
          name: "Whole Wheat Flour",
          category: "Grains",
          price: 4.49,
          image: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Mill House",
          sellerType: "Verified",
          rating: "4.4",
          isOrganic: true,
          isFresh: false,
          stock: 40,
          urgentSale: false,
          discountPercentage: 0
        },
        {
          id: 15,
          name: "Fresh Blueberries",
          category: "Fruits",
          price: 7.99,
          image: "https://images.unsplash.com/photo-1502741224143-90386d7f8c82?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Berry Patch",
          sellerType: "Standard",
          rating: "4.7",
          isOrganic: false,
          isFresh: true,
          stock: 15,
          urgentSale: true,
          discountPercentage: 15
        },
        {
          id: 16,
          name: "Organic Quinoa",
          category: "Grains",
          price: 9.99,
          image: "https://images.unsplash.com/photo-1612257587812-fee89a6a3c4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Grain Basics",
          sellerType: "Verified",
          rating: "4.6",
          isOrganic: true,
          isFresh: false,
          stock: 30,
          urgentSale: false,
          discountPercentage: 0
        },
        {
          id: 17,
          name: "Bell Peppers",
          category: "Vegetables",
          price: 4.29,
          image: "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Garden Fresh",
          sellerType: "Standard",
          rating: "4.4",
          isOrganic: false,
          isFresh: true,
          stock: 20,
          urgentSale: false,
          discountPercentage: 0
        },
        {
          id: 18,
          name: "Fresh Cherries",
          category: "Fruits",
          price: 8.99,
          image: "https://images.unsplash.com/photo-1528821128474-25c5b5c8834c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Orchard Fresh",
          sellerType: "Verified",
          rating: "4.8",
          isOrganic: true,
          isFresh: true,
          stock: 10,
          urgentSale: true,
          discountPercentage: 20
        },
        {
          id: 19,
          name: "Organic Oats",
          category: "Grains",
          price: 5.49,
          image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Morning Harvest",
          sellerType: "Verified",
          rating: "4.5",
          isOrganic: true,
          isFresh: false,
          stock: 35,
          urgentSale: false,
          discountPercentage: 0
        },
        {
          id: 20,
          name: "Greek Yogurt",
          category: "Dairy",
          price: 6.49,
          image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Creamy Delights",
          sellerType: "Standard",
          rating: "4.6",
          isOrganic: false,
          isFresh: true,
          stock: 18,
          urgentSale: false,
          discountPercentage: 0
        },
        {
          id: 21,
          name: "Fresh Kale",
          category: "Vegetables",
          price: 3.79,
          image: "https://images.unsplash.com/photo-1515543904379-3d757abe62ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Green Leaf",
          sellerType: "Verified",
          rating: "4.3",
          isOrganic: true,
          isFresh: true,
          stock: 22,
          urgentSale: false,
          discountPercentage: 0
        },
        {
          id: 22,
          name: "Organic Almonds",
          category: "Grains",
          price: 11.99,
          image: "https://images.unsplash.com/photo-1501430654243-c934cec2e1c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Nut House",
          sellerType: "Verified",
          rating: "4.7",
          isOrganic: true,
          isFresh: false,
          stock: 25,
          urgentSale: false,
          discountPercentage: 0
        },
        {
          id: 23,
          name: "Fresh Cucumbers",
          category: "Vegetables",
          price: 2.49,
          image: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Garden Fresh",
          sellerType: "Standard",
          rating: "4.2",
          isOrganic: false,
          isFresh: true,
          stock: 30,
          urgentSale: true,
          discountPercentage: 10
        },
        {
          id: 24,
          name: "Red Grapes",
          category: "Fruits",
          price: 5.99,
          image: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
          seller: "Vineyard Fresh",
          sellerType: "Verified",
          rating: "4.7",
          isOrganic: true,
          isFresh: true,
          stock: 15,
          urgentSale: false,
          discountPercentage: 0
        }
      ];
      
      setProducts(productData);
      setFilteredProducts(productData);
      setLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, searchTerm, products]);

  const applyFilters = () => {
    let filtered = [...products];

    // Apply search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.seller.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(product => filters.category.includes(product.category));
    }

    // Apply price range filter
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Apply organic filter
    if (filters.isOrganic) {
      filtered = filtered.filter(product => product.isOrganic);
    }

    // Apply fresh filter
    if (filters.isFresh) {
      filtered = filtered.filter(product => product.isFresh);
    }

    // Apply seller type filter
    if (filters.sellerType.length > 0) {
      filtered = filtered.filter(product => filters.sellerType.includes(product.sellerType));
    }

    // Apply rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(product => parseFloat(product.rating) >= filters.rating);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Default is relevance, no need to sort
        break;
    }

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

  const renderProductCard = (product) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {product.urgentSale && (
          <Chip
            label="URGENT SALE"
            color="error"
            icon={<FireIcon />}
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
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
        <CardMedia
          component="img"
          height="200"
          image={product.image}
          alt={product.name}
          sx={{ 
            objectFit: 'cover',
            backgroundColor: '#f5f5f5' // Light gray background as fallback if image fails
          }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="h6" component="div" sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: '1.2em',
              height: '2.4em'
            }}>
              {product.name}
            </Typography>
            <Box display="flex" alignItems="center">
              <StarIcon sx={{ color: 'gold', fontSize: '1.1rem', mr: 0.5 }} />
              <Typography variant="body2">{product.rating}</Typography>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {product.category}
          </Typography>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
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
              <Typography variant="body1" fontWeight="bold">
                ₹{product.price.toFixed(2)}
              </Typography>
            )}
          </Box>
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Seller: {product.seller}
            </Typography>
                {product.sellerType === 'Verified' && (
              <Chip label="Verified" color="primary" size="small" />
            )}
          </Box>
          
          <Typography variant="body2" color="text.secondary" mt={1}>
            Stock: {product.stock}
          </Typography>
        </CardContent>
        <CardActions>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<ShoppingCartIcon />}
            fullWidth
          >
            Add to Cart
          </Button>
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
          <TextField
            fullWidth
            placeholder="Search for products, categories, or sellers"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button 
                    variant="contained" 
                    onClick={() => applyFilters()}
                    startIcon={<SearchIcon />}
                  >
                    Search
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Filters
              <FilterIcon sx={{ ml: 1, verticalAlign: 'middle' }} />
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Categories</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  {['Vegetables', 'Fruits', 'Dairy', 'Grains'].map((category) => (
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
                      label={category}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded>
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

            <Accordion defaultExpanded>
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

            <Accordion defaultExpanded>
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

            <Accordion defaultExpanded>
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

            <Accordion defaultExpanded>
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
          </Box>
        </Grid>

        <Grid item xs={12} md={9}>
          <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1">
              {filteredProducts.length} products found
            </Typography>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                label="Sort By"
              >
                <MenuItem value="relevance">Relevance</MenuItem>
                <MenuItem value="price-asc">Price: Low to High</MenuItem>
                <MenuItem value="price-desc">Price: High to Low</MenuItem>
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="rating">Customer Rating</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {filteredProducts.length === 0 ? (
            <Box textAlign="center" py={5}>
              <Typography variant="h6" gutterBottom>No products found</Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your search or filter criteria
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {currentProducts.map(renderProductCard)}
              </Grid>
              
              <Box mt={4} display="flex" justifyContent="center">
                <Pagination
                  count={Math.ceil(filteredProducts.length / itemsPerPage)}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductSearch; 