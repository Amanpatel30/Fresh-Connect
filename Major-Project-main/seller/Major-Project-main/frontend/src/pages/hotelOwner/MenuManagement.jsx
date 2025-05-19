import React, { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: 'Vegetable Biryani',
      description: 'Fragrant basmati rice cooked with mixed vegetables and aromatic spices',
      price: 250,
      category: 'Main Course',
      image: 'https://source.unsplash.com/random/300x200/?biryani',
      isVegetarian: true,
      isAvailable: true
    },
    {
      id: 2,
      name: 'Paneer Butter Masala',
      description: 'Cottage cheese cubes in a rich tomato and butter gravy',
      price: 220,
      category: 'Main Course',
      image: 'https://source.unsplash.com/random/300x200/?paneer',
      isVegetarian: true,
      isAvailable: true
    },
    {
      id: 3,
      name: 'Masala Dosa',
      description: 'Crispy rice crepe filled with spiced potato filling',
      price: 120,
      category: 'Breakfast',
      image: 'https://source.unsplash.com/random/300x200/?dosa',
      isVegetarian: true,
      isAvailable: true
    },
    {
      id: 4,
      name: 'Chocolate Brownie',
      description: 'Rich chocolate brownie served with vanilla ice cream',
      price: 180,
      category: 'Dessert',
      image: 'https://source.unsplash.com/random/300x200/?brownie',
      isVegetarian: true,
      isAvailable: true
    }
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [loading, setLoading] = useState(false);

  const categories = ['Breakfast', 'Appetizer', 'Main Course', 'Dessert', 'Beverage'];

  const handleOpenDialog = (item = null) => {
    if (item) {
      setCurrentItem(item);
    } else {
      setCurrentItem({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        isVegetarian: true,
        isAvailable: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentItem({
      ...currentItem,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSaveItem = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (currentItem.id) {
        // Update existing item
        setMenuItems(menuItems.map(item => 
          item.id === currentItem.id ? currentItem : item
        ));
        setSnackbar({
          open: true,
          message: 'Menu item updated successfully!',
          severity: 'success'
        });
      } else {
        // Add new item
        const newItem = {
          ...currentItem,
          id: Date.now()
        };
        setMenuItems([...menuItems, newItem]);
        setSnackbar({
          open: true,
          message: 'Menu item added successfully!',
          severity: 'success'
        });
      }
      setLoading(false);
      handleCloseDialog();
    }, 1000);
  };

  const handleDeleteItem = (id) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setMenuItems(menuItems.filter(item => item.id !== id));
      setSnackbar({
        open: true,
        message: 'Menu item deleted successfully!',
        severity: 'success'
      });
      setLoading(false);
    }, 1000);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const filteredItems = menuItems
    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(item => filterCategory ? item.category === filterCategory : true)
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        return a.price - b.price;
      } else {
        return a.category.localeCompare(b.category);
      }
    });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Menu Management
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Filter by Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Filter by Category"
                startAdornment={<FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
                startAdornment={<SortIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="category">Category</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ height: '56px' }}
            >
              Add Item
            </Button>
          </Grid>
        </Grid>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={item.image}
                    alt={item.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" component="div" noWrap>
                        {item.name}
                      </Typography>
                      <Chip 
                        label={`₹${item.price}`} 
                        color="primary" 
                        size="small" 
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {item.description.length > 80 
                        ? `${item.description.substring(0, 80)}...` 
                        : item.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      <Chip 
                        label={item.category} 
                        size="small" 
                        color="secondary" 
                        variant="outlined"
                      />
                      <Chip 
                        label={item.isVegetarian ? "Veg" : "Non-Veg"} 
                        size="small"
                        color={item.isVegetarian ? "success" : "error"}
                        variant="outlined"
                      />
                      <Chip 
                        label={item.isAvailable ? "Available" : "Unavailable"} 
                        size="small"
                        color={item.isAvailable ? "info" : "default"}
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpenDialog(item)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteItem(item.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="h6" color="text.secondary">
                  No menu items found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Try adjusting your search or filters, or add a new menu item
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentItem?.id ? 'Edit Menu Item' : 'Add New Menu Item'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Item Name"
                name="name"
                value={currentItem?.name || ''}
                onChange={handleInputChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={currentItem?.description || ''}
                onChange={handleInputChange}
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price (₹)"
                name="price"
                type="number"
                value={currentItem?.price || ''}
                onChange={handleInputChange}
                required
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={currentItem?.category || ''}
                  onChange={handleInputChange}
                  label="Category"
                  required
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                name="image"
                value={currentItem?.image || ''}
                onChange={handleInputChange}
                margin="normal"
                helperText="Enter a URL for the item image"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Type</InputLabel>
                <Select
                  name="isVegetarian"
                  value={currentItem?.isVegetarian}
                  onChange={handleInputChange}
                  label="Type"
                >
                  <MenuItem value={true}>Vegetarian</MenuItem>
                  <MenuItem value={false}>Non-Vegetarian</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Availability</InputLabel>
                <Select
                  name="isAvailable"
                  value={currentItem?.isAvailable}
                  onChange={handleInputChange}
                  label="Availability"
                >
                  <MenuItem value={true}>Available</MenuItem>
                  <MenuItem value={false}>Unavailable</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveItem} 
            color="primary" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      )}
    </Box>
  );
};

export default MenuManagement; 