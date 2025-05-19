import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Avatar,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Snackbar,
  Alert,
  InputAdornment,
  Tooltip,
  FormControlLabel,
  Switch,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  ArrowDropDown as ArrowDropDownIcon,
  DragIndicator as DragIndicatorIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowUpward as ArrowUpwardIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Mock data for categories
const mockCategories = [
  { 
    id: 1, 
    name: 'Vegetables', 
    image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7',
    slug: 'vegetables',
    description: 'Fresh vegetables from verified farmers',
    products: 156,
    featured: true,
    subcategories: [
      { id: 101, name: 'Leafy Greens', products: 25 },
      { id: 102, name: 'Root Vegetables', products: 32 },
      { id: 103, name: 'Gourds & Squashes', products: 18 },
      { id: 104, name: 'Exotic Vegetables', products: 21 }
    ]
  },
  { 
    id: 2, 
    name: 'Fruits', 
    image: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e',
    slug: 'fruits',
    description: 'Seasonal and exotic fruits collection',
    products: 132,
    featured: true,
    subcategories: [
      { id: 201, name: 'Citrus Fruits', products: 15 },
      { id: 202, name: 'Berries', products: 24 },
      { id: 203, name: 'Tropical Fruits', products: 18 },
      { id: 204, name: 'Stone Fruits', products: 12 }
    ]
  },
  { 
    id: 3, 
    name: 'Herbs & Spices', 
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352366',
    slug: 'herbs-spices',
    description: 'Fresh herbs and authentic spices',
    products: 87,
    featured: false,
    subcategories: [
      { id: 301, name: 'Fresh Herbs', products: 20 },
      { id: 302, name: 'Dried Herbs', products: 15 },
      { id: 303, name: 'Whole Spices', products: 25 },
      { id: 304, name: 'Ground Spices', products: 27 }
    ]
  },
  { 
    id: 4, 
    name: 'Organic Products', 
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2',
    slug: 'organic',
    description: 'Certified organic vegetables and fruits',
    products: 105,
    featured: true,
    subcategories: [
      { id: 401, name: 'Organic Vegetables', products: 40 },
      { id: 402, name: 'Organic Fruits', products: 35 },
      { id: 403, name: 'Organic Herbs', products: 20 },
      { id: 404, name: 'Organic Seeds & Nuts', products: 10 }
    ]
  },
  { 
    id: 5, 
    name: 'Specialty Items', 
    image: 'https://images.unsplash.com/photo-1584473457493-52c4ca1ac0c4',
    slug: 'specialty',
    description: 'Rare and specialty agricultural products',
    products: 52,
    featured: false,
    subcategories: [
      { id: 501, name: 'Heirloom Varieties', products: 18 },
      { id: 502, name: 'Microgreens', products: 12 },
      { id: 503, name: 'Edible Flowers', products: 8 },
      { id: 504, name: 'Rare Fruits', products: 14 }
    ]
  },
  { 
    id: 6, 
    name: 'Seasonal Specials', 
    image: 'https://images.unsplash.com/photo-1506365069540-904bcc762636',
    slug: 'seasonal',
    description: 'Fresh seasonal produce at their peak',
    products: 74,
    featured: true,
    subcategories: [
      { id: 601, name: 'Summer Harvest', products: 30 },
      { id: 602, name: 'Winter Produce', products: 25 },
      { id: 603, name: 'Spring Greens', products: 19 }
    ]
  }
];

const CategoryManagement = () => {
  const [categories, setCategories] = useState(mockCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  };

  // Handle menu open
  const handleMenuOpen = (event, category) => {
    setAnchorEl(event.currentTarget);
    setSelectedCategory(category);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle dialog open
  const handleDialogOpen = (type) => {
    setDialogType(type);
    setOpenDialog(true);
    handleMenuClose();
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Handle category expansion
  const handleExpandCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  // Handle category action (delete, feature, etc.)
  const handleCategoryAction = (action) => {
    let message = '';
    let severity = 'success';
    
    if (action === 'delete') {
      setCategories(categories.filter(cat => cat.id !== selectedCategory.id));
      message = `Category "${selectedCategory.name}" has been deleted`;
    } else if (action === 'feature') {
      setCategories(categories.map(cat => 
        cat.id === selectedCategory.id ? { ...cat, featured: !cat.featured } : cat
      ));
      message = selectedCategory.featured 
        ? `Category "${selectedCategory.name}" is no longer featured`
        : `Category "${selectedCategory.name}" is now featured`;
    }
    
    setSnackbar({ open: true, message, severity });
    handleDialogClose();
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle drag and drop
  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setCategories(items);
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <Box mb={4} display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
            Category Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Organize products with categories and subcategories
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Refresh'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleDialogOpen('add')}
            sx={{
              backgroundColor: '#22c55e',
              '&:hover': {
                backgroundColor: '#16a34a',
              },
            }}
          >
            Add Category
          </Button>
        </Box>
      </Box>

      {/* Search and Filter */}
      <motion.div variants={itemVariants}>
        <Box mb={4} display="flex" flexWrap="wrap" gap={2} alignItems="center" justifyContent="space-between">
          <TextField
            placeholder="Search categories..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Box display="flex" gap={2}>
            <Button 
              variant="outlined" 
              startIcon={<ArrowUpwardIcon />}
              size="small"
            >
              Sort
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<CategoryIcon />}
              size="small"
            >
              View As Grid
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Category List */}
      <motion.div variants={itemVariants}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="categories">
            {(provided) => (
              <Paper
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{ 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}
              >
                <List disablePadding>
                  {filteredCategories.map((category, index) => (
                    <Draggable key={category.id} draggableId={category.id.toString()} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <ListItem 
                            disablePadding 
                            sx={{ 
                              display: 'block',
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              '&:last-child': {
                                borderBottom: 'none'
                              }
                            }}
                          >
                            <Box 
                              display="flex" 
                              p={2} 
                              alignItems="center"
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                }
                              }}
                            >
                              <Box {...provided.dragHandleProps} sx={{ mr: 2, color: 'text.secondary' }}>
                                <DragIndicatorIcon />
                              </Box>
                              <ListItemAvatar>
                                <Avatar
                                  src={category.image}
                                  alt={category.name}
                                  variant="rounded"
                                  sx={{ width: 60, height: 60, borderRadius: 2 }}
                                >
                                  <CategoryIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <Box ml={2} flex={1}>
                                <Box display="flex" alignItems="center" mb={0.5}>
                                  <Typography variant="subtitle1" fontWeight="medium">
                                    {category.name}
                                  </Typography>
                                  {category.featured && (
                                    <Chip 
                                      label="Featured" 
                                      size="small"
                                      sx={{
                                        ml: 1,
                                        backgroundColor: '#4a90e220',
                                        color: '#4a90e2',
                                        fontWeight: 'medium'
                                      }}
                                    />
                                  )}
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                  {category.description}
                                </Typography>
                                <Box display="flex" alignItems="center" mt={1}>
                                  <Chip 
                                    label={`${category.products} Products`} 
                                    size="small"
                                    sx={{
                                      mr: 1,
                                      backgroundColor: '#22c55e20',
                                      color: '#22c55e',
                                      fontWeight: 'medium'
                                    }}
                                  />
                                  <Chip 
                                    label={`${category.subcategories.length} Subcategories`} 
                                    size="small"
                                    sx={{
                                      backgroundColor: '#f59e0b20',
                                      color: '#f59e0b',
                                      fontWeight: 'medium'
                                    }}
                                  />
                                </Box>
                              </Box>
                              <Box>
                                <IconButton 
                                  onClick={() => handleExpandCategory(category.id)}
                                  sx={{
                                    transform: expandedCategory === category.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s'
                                  }}
                                >
                                  <ExpandMoreIcon />
                                </IconButton>
                                <IconButton onClick={(event) => handleMenuOpen(event, category)}>
                                  <MoreVertIcon />
                                </IconButton>
                              </Box>
                            </Box>
                            
                            {expandedCategory === category.id && (
                              <Box 
                                sx={{ 
                                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                  p: 2,
                                  pl: 12
                                }}
                              >
                                <Typography variant="subtitle2" gutterBottom>
                                  Subcategories
                                </Typography>
                                <Grid container spacing={2}>
                                  {category.subcategories.map((subcat) => (
                                    <Grid item xs={12} sm={6} md={4} key={subcat.id}>
                                      <Paper 
                                        sx={{ 
                                          p: 1.5, 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          justifyContent: 'space-between',
                                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                        }}
                                      >
                                        <Box display="flex" alignItems="center">
                                          <CategoryIcon 
                                            fontSize="small" 
                                            sx={{ color: 'text.secondary', mr: 1 }} 
                                          />
                                          <Typography variant="body2">{subcat.name}</Typography>
                                        </Box>
                                        <Chip 
                                          label={`${subcat.products} Products`} 
                                          size="small"
                                          sx={{
                                            backgroundColor: '#22c55e10',
                                            color: '#22c55e',
                                            fontWeight: 'medium',
                                            fontSize: '0.7rem'
                                          }}
                                        />
                                      </Paper>
                                    </Grid>
                                  ))}
                                  <Grid item xs={12} sm={6} md={4}>
                                    <Paper 
                                      sx={{ 
                                        p: 1.5, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                        border: '1px dashed',
                                        borderColor: 'divider',
                                        cursor: 'pointer',
                                        '&:hover': {
                                          borderColor: 'primary.main',
                                          color: 'primary.main'
                                        }
                                      }}
                                    >
                                      <AddIcon fontSize="small" sx={{ mr: 1 }} />
                                      <Typography variant="body2">Add Subcategory</Typography>
                                    </Paper>
                                  </Grid>
                                </Grid>
                              </Box>
                            )}
                          </ListItem>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              </Paper>
            )}
          </Droppable>
        </DragDropContext>
      </motion.div>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleDialogOpen('edit')}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Category
        </MenuItem>
        <MenuItem onClick={() => handleDialogOpen('feature')}>
          {selectedCategory?.featured ? (
            <>
              <CloseIcon fontSize="small" sx={{ mr: 1 }} />
              Remove from Featured
            </>
          ) : (
            <>
              <AddIcon fontSize="small" sx={{ mr: 1 }} />
              Add to Featured
            </>
          )}
        </MenuItem>
        <MenuItem onClick={() => handleDialogOpen('subcategory')}>
          <CategoryIcon fontSize="small" sx={{ mr: 1 }} />
          Manage Subcategories
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDialogOpen('delete')} sx={{ color: '#ef4444' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Category
        </MenuItem>
      </Menu>

      {/* Category Action Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        {dialogType === 'add' && (
          <>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogContent>
              <Box component="form" sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label="Category Name"
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Slug"
                  margin="normal"
                  helperText="Used in URL, auto-generated from name if left empty"
                />
                <TextField
                  fullWidth
                  label="Description"
                  margin="normal"
                  multiline
                  rows={3}
                />
                <Box 
                  sx={{ 
                    border: '1px dashed', 
                    borderColor: 'divider', 
                    borderRadius: 1, 
                    p: 3, 
                    mt: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                    }
                  }}
                >
                  <ImageIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Click to upload category image
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Recommended size: 600x400px
                  </Typography>
                </Box>
                <FormControlLabel
                  control={<Switch />}
                  label="Featured Category"
                  sx={{ mt: 2 }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleDialogClose}
                startIcon={<SaveIcon />}
              >
                Save Category
              </Button>
            </DialogActions>
          </>
        )}
        
        {dialogType === 'edit' && selectedCategory && (
          <>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogContent>
              <Box component="form" sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label="Category Name"
                  margin="normal"
                  defaultValue={selectedCategory.name}
                  required
                />
                <TextField
                  fullWidth
                  label="Slug"
                  margin="normal"
                  defaultValue={selectedCategory.slug}
                  helperText="Used in URL, auto-generated from name if left empty"
                />
                <TextField
                  fullWidth
                  label="Description"
                  margin="normal"
                  multiline
                  rows={3}
                  defaultValue={selectedCategory.description}
                />
                <Box 
                  sx={{ 
                    border: '1px dashed', 
                    borderColor: 'divider', 
                    borderRadius: 1, 
                    p: 0, 
                    mt: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    height: 200,
                    backgroundImage: `url(${selectedCategory.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    '&:hover::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                    },
                    '&:hover .change-image': {
                      opacity: 1,
                    }
                  }}
                >
                  <Box 
                    className="change-image"
                    sx={{ 
                      position: 'absolute', 
                      top: '50%', 
                      left: '50%', 
                      transform: 'translate(-50%, -50%)',
                      opacity: 0,
                      transition: 'opacity 0.3s',
                      zIndex: 1,
                      color: 'white',
                      textAlign: 'center'
                    }}
                  >
                    <ImageIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2" gutterBottom>
                      Change Image
                    </Typography>
                  </Box>
                </Box>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={selectedCategory.featured} 
                    />
                  }
                  label="Featured Category"
                  sx={{ mt: 2 }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleDialogClose}
                startIcon={<SaveIcon />}
              >
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
        
        {dialogType === 'delete' && selectedCategory && (
          <>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogContent>
              <Alert severity="error" sx={{ mb: 2 }}>
                Warning: This action cannot be undone!
              </Alert>
              <Typography variant="body1">
                Are you sure you want to delete the category "{selectedCategory.name}"?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                This will also delete all {selectedCategory.subcategories.length} subcategories. Products in this category will need to be reassigned.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button 
                variant="contained" 
                color="error"
                onClick={() => handleCategoryAction('delete')}
              >
                Delete
              </Button>
            </DialogActions>
          </>
        )}
        
        {dialogType === 'feature' && selectedCategory && (
          <>
            <DialogTitle>
              {selectedCategory.featured ? 'Remove from Featured' : 'Add to Featured'}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                {selectedCategory.featured 
                  ? `Are you sure you want to remove "${selectedCategory.name}" from featured categories?`
                  : `Are you sure you want to add "${selectedCategory.name}" to featured categories?`
                }
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {selectedCategory.featured 
                  ? 'This category will no longer appear in featured sections of the website.'
                  : 'Featured categories are prominently displayed on the homepage and category listings.'
                }
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button 
                variant="contained" 
                color={selectedCategory.featured ? "warning" : "success"}
                onClick={() => handleCategoryAction('feature')}
              >
                {selectedCategory.featured ? 'Remove from Featured' : 'Add to Featured'}
              </Button>
            </DialogActions>
          </>
        )}
        
        {dialogType === 'subcategory' && selectedCategory && (
          <>
            <DialogTitle>Manage Subcategories</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Create and manage subcategories for "{selectedCategory.name}"
              </Typography>
              <List>
                {selectedCategory.subcategories.map((subcat) => (
                  <ListItem
                    key={subcat.id}
                    sx={{
                      backgroundColor: 'background.default',
                      mb: 1,
                      borderRadius: 1,
                    }}
                    secondaryAction={
                      <Box>
                        <IconButton size="small" sx={{ color: '#f59e0b' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ color: '#ef4444' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
    </Box>
                    }
                  >
                    <DragIndicatorIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText 
                      primary={subcat.name} 
                      secondary={`${subcat.products} Products`} 
                    />
                  </ListItem>
                ))}
              </List>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
              >
                Add Subcategory
              </Button>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Close</Button>
              <Button 
                variant="contained" 
                onClick={handleDialogClose}
                startIcon={<SaveIcon />}
              >
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default CategoryManagement; 