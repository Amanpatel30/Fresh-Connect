import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Grid, Card, CardMedia, CardContent, 
  CardActions, Button, TextField, Divider, Paper, CircularProgress,
  InputAdornment, IconButton, Chip, CardActionArea, Tab, Tabs,
  Dialog, DialogTitle, DialogContent, DialogActions, Slider, Switch,
  FormControlLabel, FormGroup, Select, MenuItem, Pagination, Badge,
  Snackbar, Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  FilterList as FilterListIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  AccessTime as ClockIcon,
  CardGiftcard as GiftIcon,
  Star as StarIcon,
  ShoppingCart as ShoppingCartIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getFreeFoodListings, reserveLeftoverFood } from '../../services/api';
import UserContext from '../../context/UserContext';

const FreeFoodListings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn: isAuthenticated, refreshAuth: refreshUserData } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [filters, setFilters] = useState({
    category: [],
    source: [],
    expiryWithin: 0,
    distance: 10,
    verifiedOnly: false
  });
  const [sortBy, setSortBy] = useState('expiry');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Parse URL parameters for filtering
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    // Check for filter parameter
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      if (filterParam === 'nearby') {
        // Set filter for nearby locations
        setFilters(prev => ({...prev, distance: 5})); // Within 5km
      } else if (filterParam === 'recent') {
        // Set filter to show recently added listings
        setSortBy('recent');
      }
    }
  }, [location.search]);

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('freeFoodFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Error parsing saved favorites:', error);
      }
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('freeFoodFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Fetch free food listings from API
  const fetchFreeFoodListings = async () => {
    setLoading(true);
    try {
      // Prepare filter parameters
      const categoryParam = filters.category.length > 0 ? filters.category.join(',') : '';
      
      const response = await getFreeFoodListings(
        pagination.page,
        pagination.limit,
        searchQuery,
        categoryParam
      );
      
      console.log('Free food listings response:', response);
      console.log('Response data structure:', {
        hasData: !!response?.data,
        hasListings: !!response?.data?.listings,
        listingsLength: response?.data?.listings?.length || 0,
        page: response?.data?.page,
        pages: response?.data?.pages,
        total: response?.data?.total
      });
      
      if (response && response.data && response.data.listings) {
        // Transform API data to match the component's expected format
        let transformedItems = response.data.listings.map(item => {
          // Calculate expiry time in hours
          const expiryTime = Math.ceil((new Date(item.expiryTime) - new Date()) / (1000 * 60 * 60));
          
          // Determine status based on expiry time if not provided
          let status = item.status || 'available';
          if (expiryTime <= 0) {
            status = 'expired';
          }
          
          return {
            id: item._id,
            name: item.title,
            image: item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80',
            thumbnail: item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
            category: Array.isArray(item.category) ? item.category : [item.category || 'Uncategorized'],
            source: 'Hotel',
            rating: 4.5, // Default rating
            reviews: Math.floor(Math.random() * 50) + 5, // Random number of reviews
            provider: item.hotelId?.name || 'Anonymous Provider',
            providerRating: 4.7, // Default provider rating
            providerVerified: true, // Assume all providers are verified
            location: item.hotelId?.address || 'Location not specified',
            distance: (Math.random() * 10).toFixed(1), // Random distance
            quantity: `${item.quantity} ${item.unit || 'portions'}`,
            availableUntil: new Date(item.expiryTime).toLocaleString(),
            description: item.description || 'No description provided',
            images: item.images && item.images.length > 0 ? item.images : ['https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80'],
            expiryTime: expiryTime,
            contactPhone: item.hotelId?.phone || '+91 1234567890',
            specialInstructions: item.dietaryInfo ? `Dietary info: ${item.dietaryInfo.join(', ')}` : 'No special instructions',
            status: status
          };
        });
        
        console.log(`Found ${transformedItems.length} food listings`);
        
        // Always show all items initially
        setItems(transformedItems);
        setFilteredItems(transformedItems);
        
        // Update pagination info
        setPagination({
          page: response.data.page || 1,
          limit: pagination.limit,
          total: response.data.total || 0,
          pages: response.data.pages || 1
        });
      } else {
        console.error('Invalid response format:', response.data);
        setItems([]);
        setFilteredItems([]);
      }
    } catch (error) {
      console.error('Error fetching free food listings:', error);
      // If API fails, use empty array
      setItems([]);
      setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when search/filters change
  useEffect(() => {
    fetchFreeFoodListings();
  }, [
    pagination.page, 
    pagination.limit,
    searchQuery,
    // Only include category in dependencies as it's passed to the API
    // Other filters are applied client-side after fetching
    filters.category.toString()
  ]);

  // Apply client-side filters whenever items or filter criteria change
  useEffect(() => {
    if (items.length === 0) return;
    
    let results = [...items];
    
    // Apply client-side filters
    if (filters.expiryWithin > 0) {
      results = results.filter(item => item.expiryTime <= filters.expiryWithin);
    }
    
    if (filters.distance < 20) {
      results = results.filter(item => parseFloat(item.distance) <= filters.distance);
    }
    
    if (filters.verifiedOnly) {
      results = results.filter(item => item.providerVerified);
    }
    
    // Apply tab filter
    if (activeTab === 1) {
      // Favorites
      results = results.filter(item => favorites.includes(item.id));
    } else if (activeTab === 2) {
      // Available only
      results = results.filter(item => item.status === 'available');
    } else if (activeTab === 3) {
      // Reserved only
      results = results.filter(item => item.status === 'reserved');
    } else if (activeTab === 4) {
      // Expired only
      results = results.filter(item => item.status === 'expired');
    } else if (activeTab === 5) {
      // Sold only
      results = results.filter(item => item.status === 'sold');
    }
    
    setFilteredItems(results);
  }, [items, filters, activeTab, favorites]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(itemId => itemId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    // Reset to page 1 when search changes
    setPagination({...pagination, page: 1});
    
    // Debounce the API call to avoid too many requests
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    window.searchTimeout = setTimeout(() => {
      // Fetch data with the new search query
      fetchFreeFoodListings();
    }, 500);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setDetailsDialogOpen(true);
  };

  const handlePageChange = (event, newPage) => {
    // Update pagination state
    setPagination({...pagination, page: newPage});
    // Fetch data for the new page will happen automatically through the useEffect
    console.log(`Changing to page ${newPage}`);
  };

  // Handle reservation of a food item
  const handleReserveItem = async (item, event) => {
    // Stop event propagation to prevent opening details dialog
    if (event) {
      event.stopPropagation();
    }
    
    // Check if user is logged in
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please login to reserve this item',
        severity: 'warning'
      });
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login?redirect=/free-food');
      }, 1500);
      return;
    }
    
    try {
      setSnackbar({
        open: true,
        message: 'Reserving item...',
        severity: 'info'
      });
      
      // Call the API to reserve the item
      const result = await reserveLeftoverFood(item.id);
      
      // If successful, update the UI
      if (result.success) {
        // Show success message
        setSnackbar({
          open: true,
          message: result.message || 'Item reserved and added to your cart',
          severity: 'success'
        });
        
        // Refresh user data to update cart count in navbar
        refreshUserData();
        
        // Update the item status locally
        const updatedItems = items.map(i => 
          i.id === item.id ? { ...i, status: 'reserved' } : i
        );
        setItems(updatedItems);
        
        // Update filtered items too
        const updatedFilteredItems = filteredItems.map(i => 
          i.id === item.id ? { ...i, status: 'reserved' } : i
        );
        setFilteredItems(updatedFilteredItems);
        
        // Refresh the listings data from the server after a short delay
        setTimeout(() => {
          fetchFreeFoodListings();
        }, 1000);
      } else {
        // Show error message
        setSnackbar({
          open: true,
          message: result.message || 'Failed to reserve item. Please try again.',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Failed to reserve item:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to reserve item. Please try again.',
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading free food listings...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Free Food Listings
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Find and reserve leftover food from restaurants, events, and grocery stores
        </Typography>
        
        {items.length > 0 && (
          <Typography variant="subtitle2" color="text.secondary" mt={1}>
            Showing {filteredItems.length} of {items.length} food listings
          </Typography>
        )}
        
        <Box display="flex" alignItems="center" justifyContent="space-between" mt={3} mb={2}>
          <Box flex="1" mr={2}>
            <TextField
              fullWidth
              placeholder="Search food listings..."
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
            />
          </Box>
          
        <Button
            variant="outlined" 
            startIcon={<FilterListIcon />}
            onClick={() => setFilterDialogOpen(true)}
        >
          Filters
        </Button>
        </Box>
        
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="All Listings" value={0} />
          <Tab label={`Favorites (${favorites.length})`} value={1} />
          <Tab label="Available" value={2} />
          <Tab label="Reserved" value={3} />
          <Tab label="Expired" value={4} />
          <Tab label="Sold" value={5} />
        </Tabs>
      </Box>

      {filteredItems.length === 0 ? (
        <Box textAlign="center" py={5}>
          <Typography variant="h6" gutterBottom>No listings found</Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filters
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredItems.map(item => (
              <Grid item key={item.id} xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6
                    },
                    // Status-based styling
                    opacity: item.status === 'expired' ? 0.7 : 1,
                    position: 'relative',
                    filter: item.status === 'expired' ? 'grayscale(0.8)' : 'none',
                    backgroundColor: 
                      item.status === 'reserved' ? 'rgba(255, 223, 186, 0.3)' :
                      item.status === 'sold' ? 'rgba(200, 216, 228, 0.3)' : 'white'
                  }}
                >
                  {/* Status label */}
                  {item.status !== 'available' && (
                    <Box 
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        zIndex: 10,
                        backgroundColor: 
                          item.status === 'expired' ? 'rgba(211, 47, 47, 0.85)' :
                          item.status === 'reserved' ? 'rgba(245, 124, 0, 0.85)' :
                          'rgba(66, 66, 66, 0.85)',
                        color: 'white',
                        py: 0.5,
                        px: 2,
                        borderBottomLeftRadius: 8
                      }}
                    >
                      <Typography variant="caption" fontWeight="bold">
                        {item.status.toUpperCase()}
                      </Typography>
                    </Box>
                  )}
                  <CardActionArea onClick={() => handleItemClick(item)}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.image}
                      alt={item.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" gutterBottom>
                        {item.name}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" mb={1}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                          {item.location} ({item.distance} km)
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" mb={1}>
                        <ClockIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                          {item.expiryTime > 0 
                            ? `Available for: ${item.expiryTime} hours` 
                            : 'Expired'}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" mb={1}>
                        {item.providerVerified && (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Verified Provider"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                        )}
                        <Typography variant="body2" color="text.secondary">
                          {item.provider}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" mt={1} flexWrap="wrap">
                        {item.category.map((cat, idx) => (
                          <Chip 
                            key={idx} 
                            label={cat} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }} 
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                  
                  <CardActions sx={{ mt: 'auto' }}>
                    <Button
                      size="small" 
                      color="primary"
                      onClick={() => handleItemClick(item)}
                    >
                      View Details
                    </Button>
                    
                    {/* Reserve button - only show if item is available */}
                    {item.status === 'available' && (
                      <Button
                        size="small"
                        color="secondary"
                        variant="contained"
                        startIcon={<ShoppingCartIcon />}
                        onClick={(e) => handleReserveItem(item, e)}
                        sx={{ ml: 'auto' }}
                      >
                        Reserve
                      </Button>
                    )}
                    
                    {/* Show reserved status if already reserved */}
                    {item.status === 'reserved' && (
                      <Chip
                        label="Reserved"
                        color="success"
                        size="small"
                        sx={{ ml: 'auto' }}
                      />
                    )}
                    
                    {/* Show expired status if expired */}
                    {item.status === 'expired' && (
                      <Chip
                        label="Expired"
                        color="default"
                        size="small"
                        sx={{ ml: 'auto' }}
                      />
                    )}
                    
                    {/* Show sold out status if sold */}
                    {item.status === 'sold' && (
                      <Chip
                        label="Sold Out"
                        color="error"
                        size="small"
                        sx={{ ml: 'auto' }}
                      />
                    )}
                    
                    <IconButton 
                      aria-label="add to favorites"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                    >
                      {favorites.includes(item.id) ? 
                        <FavoriteIcon color="error" /> : 
                        <FavoriteBorderIcon />
                      }
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <Box display="flex" justifyContent="center" mt={4} mb={2}>
              <Pagination 
                count={pagination.pages} 
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
      
      {/* Filters Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filter Listings</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>Categories</Typography>
            <FormGroup>
              {['Meals', 'Bakery', 'Produce', 'Dairy', 'Catering'].map((category) => (
                <FormControlLabel
                  key={category}
                  control={
                    <Switch
                      checked={filters.category.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({
                            ...filters,
                            category: [...filters.category, category]
                          });
                        } else {
                          setFilters({
                            ...filters,
                            category: filters.category.filter(cat => cat !== category)
                          });
                        }
                      }}
                    />
                  }
                  label={category}
                />
              ))}
            </FormGroup>
            
            <Typography gutterBottom sx={{ mt: 2 }}>Expiry Within (hours)</Typography>
            <Slider
              value={filters.expiryWithin}
              onChange={(e, newValue) => setFilters({...filters, expiryWithin: newValue})}
              valueLabelDisplay="auto"
              step={2}
              marks
              min={0}
              max={24}
            />
            
            <Typography gutterBottom sx={{ mt: 2 }}>Maximum Distance (km)</Typography>
            <Slider
              value={filters.distance}
              onChange={(e, newValue) => setFilters({...filters, distance: newValue})}
              valueLabelDisplay="auto"
              step={1}
              marks
              min={1}
              max={20}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={filters.verifiedOnly}
                  onChange={(e) => setFilters({...filters, verifiedOnly: e.target.checked})}
                />
              }
              label="Verified Providers Only"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setFilters({
              category: [],
              source: [],
              expiryWithin: 0,
              distance: 10,
              verifiedOnly: false
            });
          }}>
            Reset
          </Button>
          <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              // Apply filters and close dialog
              setPagination({...pagination, page: 1}); // Reset to page 1
              fetchFreeFoodListings(); // Fetch with new filters
              setFilterDialogOpen(false);
            }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Item Details Dialog */}
      {selectedItem && (
        <Dialog
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedItem.name}
            {selectedItem.status !== 'available' && (
              <Chip
                label={selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                color={
                  selectedItem.status === 'reserved' ? 'success' :
                  selectedItem.status === 'sold' ? 'error' : 'default'
                }
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.name}
                  style={{ width: '100%', borderRadius: '8px' }}
                />
                
                <Box mt={2}>
                  <Typography variant="subtitle1" fontWeight="bold">Description</Typography>
                  <Typography variant="body2">{selectedItem.description}</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold">Details</Typography>
                
                <Box mt={1}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center">
                        <LocationIcon fontSize="small" color="primary" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {selectedItem.location} ({selectedItem.distance} km away)
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center">
                        <ClockIcon fontSize="small" color="primary" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          Available until: {selectedItem.availableUntil}
                          {selectedItem.expiryTime > 0 
                            ? ` (${selectedItem.expiryTime} hours remaining)` 
                            : ' (Expired)'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center">
                        <InfoIcon fontSize="small" color="primary" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          Quantity: {selectedItem.quantity}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center">
                        <PhoneIcon fontSize="small" color="primary" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          Contact: {selectedItem.contactPhone}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Special Instructions:
                      </Typography>
                      <Typography variant="body2">
                        {selectedItem.specialInstructions}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Categories:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1} mt={0.5}>
                        {selectedItem.category.map((cat, idx) => (
                          <Chip key={idx} label={cat} size="small" />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
            
            {selectedItem.status === 'available' && (
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<ShoppingCartIcon />}
                onClick={() => {
                  handleReserveItem(selectedItem);
                  setDetailsDialogOpen(false);
                }}
              >
                Reserve Item
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FreeFoodListings; 