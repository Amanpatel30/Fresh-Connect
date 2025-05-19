import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Grid, Card, CardMedia, CardContent, 
  CardActions, Button, TextField, Divider, Paper, CircularProgress,
  InputAdornment, IconButton, Chip, CardActionArea, Tab, Tabs,
  Dialog, DialogTitle, DialogContent, DialogActions, Slider, Switch,
  FormControlLabel, FormGroup, Select, MenuItem, Pagination, Badge
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

const FreeFoodListings = () => {
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

  useEffect(() => {
    // Simulating API call to fetch free food items
    setTimeout(() => {
      const mockItems = [
        {
          id: 1,
          name: 'Leftover Wedding Catering',
          image: 'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
          category: ['Catering', 'Mixed Food'],
          source: 'Hotel',
          rating: 4.5,
          reviews: 28,
          provider: 'Grand Plaza Hotel',
          providerRating: 4.7,
          providerVerified: true,
          location: 'Mumbai, Maharashtra',
          distance: 2.5,
          quantity: 'Food for ~50 people',
          availableUntil: '2023-09-25 20:00',
          description: 'Variety of dishes from a wedding function. Includes vegetable biryani, paneer dishes, mixed vegetables, and desserts. Must pick up within 2 hours. First come, first served.',
          images: [
            'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
          ],
          expiryTime: 2,
          contactPhone: '+91 2234567890',
          specialInstructions: 'Bring your own containers. Please only take what you need.'
        },
        {
          id: 2,
          name: 'Fruit and Vegetable Box',
          image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
          category: ['Produce'],
          source: 'Grocery',
          rating: 4.8,
          reviews: 42,
          provider: 'FreshMart',
          providerRating: 4.6,
          providerVerified: true,
          location: 'Delhi, NCR',
          distance: 3.7,
          quantity: '10 boxes available',
          availableUntil: '2023-09-25 18:00',
          description: 'Surplus fruits and vegetables from our morning delivery. Each box contains assorted seasonal produce that is still fresh but didn\'t meet our display standards. Great for cooking!',
          images: [
            'https://images.unsplash.com/photo-1518843875459-f738682238a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1557844681-3fbf4fbf9d9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1557800636-894a64c1696f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
          ],
          expiryTime: 12,
          contactPhone: '+91 9876543210',
          specialInstructions: 'Please register at the customer service desk to receive your box.'
        },
        // ... (add more mock items as needed)
      ];

      setItems(mockItems);
      setFilteredItems(mockItems);
      setLoading(false);
    }, 1500);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 0) {
      setFilteredItems(items);
    } else if (newValue === 1) {
      setFilteredItems(items.filter(item => favorites.includes(item.id)));
    }
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
    
    if (query.trim() === '') {
      // If search is empty, respect the tab selection
      if (activeTab === 0) {
        setFilteredItems(items);
      } else {
        setFilteredItems(items.filter(item => favorites.includes(item.id)));
      }
    } else {
      // Filter based on search query and respect tab selection
      let filtered = items.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) || 
        item.provider.toLowerCase().includes(query.toLowerCase()) ||
        item.category.some(cat => cat.toLowerCase().includes(query.toLowerCase()))
      );
      
      if (activeTab === 1) {
        filtered = filtered.filter(item => favorites.includes(item.id));
      }
      
      setFilteredItems(filtered);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setDetailsDialogOpen(true);
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
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Free Food Listings
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Find and reserve leftover food from restaurants, events, and grocery stores
        </Typography>
        
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
          <Tab label="All Listings" />
          <Tab label={`Favorites (${favorites.length})`} />
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
                  }
                }}
              >
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
                        Available for: {item.expiryTime} hours
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
                
                <CardActions>
          <Button
                    size="small" 
                    color="primary"
                    onClick={() => handleItemClick(item)}
                  >
                    View Details
          </Button>
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
          {/* Filter controls here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              // Apply filters logic
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
          <DialogTitle>{selectedItem.name}</DialogTitle>
          <DialogContent>
            {/* Item details here */}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<ShoppingCartIcon />}
            >
              Reserve
              </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default FreeFoodListings; 