import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Snackbar,
  InputAdornment,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  ArrowBack,
  DragIndicator,
  Save,
  Close
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import * as categoryService from '../../services/categoryService';
import * as productService from '../../services/productService';
import CircularProgress from '@mui/material/CircularProgress';

const ProductCategories = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State variables
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#4caf50');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [productCounts, setProductCounts] = useState({});
  const [error, setError] = useState(null);
  const [addingDefaultCategories, setAddingDefaultCategories] = useState(false);
  
  // Default categories with predefined colors
  const defaultCategories = [
    { name: 'Vegetables', color: '#4caf50' },
    { name: 'Fruits', color: '#ff9800' },
    { name: 'Herbs', color: '#8bc34a' },
    { name: 'Leafy Vegetables', color: '#2e7d32' },
    { name: 'Root Vegetables', color: '#795548' },
    { name: 'Fruit Vegetables', color: '#f44336' },
    { name: 'Exotic Vegetables', color: '#9c27b0' },
    { name: 'Organic Produce', color: '#2196f3' }
  ];
  
  // Fetch categories from the API
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Fetch product counts by category
  useEffect(() => {
    fetchProductCounts();
  }, [categories]);
  
  // Fetch categories from the API
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryService.getCategories();
      
      if (response && response.data) {
        setCategories(response.data);
      } else {
        throw new Error('No category data returned from server');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch product counts for each category
  const fetchProductCounts = async () => {
    if (categories.length === 0) return;
    
    try {
      // This is a placeholder - in a real app, you would fetch product counts by category
      // For now, we'll use the counts from our mock data
      const counts = {};
      categories.forEach(category => {
        counts[category.id] = category.count || 0;
      });
      setProductCounts(counts);
    } catch (error) {
      console.error('Error fetching product counts:', error);
    }
  };
  
  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle category drag and drop
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setCategories(items);
    
    try {
      // Send the updated order to the backend
      const categoryIds = items.map(item => item.id);
      await categoryService.updateCategoryOrder(categoryIds);
      
      setSnackbar({
        open: true,
        message: 'Category order updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating category order:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update category order on the server',
        severity: 'error'
      });
    }
  };
  
  // Open dialog to add new category
  const handleAddCategory = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryColor('#4caf50');
    setDialogOpen(true);
  };
  
  // Open dialog to edit category
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryColor(category.color);
    setDialogOpen(true);
  };
  
  // Open dialog to confirm category deletion
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };
  
  // Delete category
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    
    try {
      await categoryService.deleteCategory(categoryToDelete.id);
      
      setCategories(categories.filter(cat => cat.id !== categoryToDelete.id));
      setSnackbar({
        open: true,
        message: `Category "${categoryToDelete.name}" deleted successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete category. Please try again.',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };
  
  // Save category (create or update)
  const handleSaveCategory = async () => {
    // Validate input
    if (!newCategoryName.trim()) {
      setSnackbar({
        open: true,
        message: 'Category name cannot be empty',
        severity: 'error'
      });
      return;
    }
    
    try {
      let response;
      let message;
      
      if (editingCategory) {
        // Update existing category
        response = await categoryService.updateCategory(editingCategory.id, {
          name: newCategoryName,
          color: newCategoryColor
        });
        message = `Category "${newCategoryName}" updated successfully`;
        
        // Update categories state
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, name: newCategoryName, color: newCategoryColor } 
            : cat
        ));
      } else {
        // Create new category
        response = await categoryService.createCategory({
          name: newCategoryName,
          color: newCategoryColor
        });
        message = `Category "${newCategoryName}" created successfully`;
        
        // Update categories state with the new category
        if (response && response.data) {
          setCategories([...categories, response.data]);
        } else {
          // If the backend doesn't return the new category, create a temporary one
          const newCategory = {
            id: Date.now().toString(), // Temporary ID
            name: newCategoryName,
            color: newCategoryColor,
            count: 0
          };
          setCategories([...categories, newCategory]);
        }
      }
      
      // Show success message
      setSnackbar({
        open: true,
        message,
        severity: 'success'
      });
      
      // Close dialog
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save category. Please try again.',
        severity: 'error'
      });
    }
  };
  
  // Add default categories
  const handleAddDefaultCategories = async () => {
    setAddingDefaultCategories(true);
    
    try {
      // Get existing category names
      const existingCategoryNames = categories.map(cat => cat.name.toLowerCase());
      
      // Filter out categories that already exist
      const categoriesToAdd = defaultCategories.filter(
        cat => !existingCategoryNames.includes(cat.name.toLowerCase())
      );
      
      if (categoriesToAdd.length === 0) {
        setSnackbar({
          open: true,
          message: 'All default categories already exist',
          severity: 'info'
        });
        setAddingDefaultCategories(false);
        return;
      }
      
      // Add each category that doesn't exist
      const addPromises = categoriesToAdd.map(cat => 
        categoryService.createCategory({
          name: cat.name,
          color: cat.color
        })
      );
      
      // Wait for all categories to be added
      const results = await Promise.all(addPromises);
      
      // Add new categories to state
      const newCategories = results
        .filter(res => res && res.data)
        .map(res => res.data);
      
      setCategories([...categories, ...newCategories]);
      
      setSnackbar({
        open: true,
        message: `Added ${newCategories.length} default categories successfully`,
        severity: 'success'
      });
      
      // Refresh the categories list to get the latest data
      fetchCategories();
      
    } catch (error) {
      console.error('Error adding default categories:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add default categories. Please try again.',
        severity: 'error'
      });
    } finally {
      setAddingDefaultCategories(false);
    }
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Header and Back Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/seller/products')}
          sx={{ mr: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          Product Categories
        </Typography>
      </Box>
      
      {/* Error Alert */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Top Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Add />}
            onClick={handleAddDefaultCategories}
            sx={{ mr: 2 }}
            disabled={addingDefaultCategories}
          >
            {addingDefaultCategories ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Adding Default Categories...
              </>
            ) : (
              'Add Default Categories'
            )}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleAddCategory}
          >
            Add Category
          </Button>
        </Box>
      </Box>
      
      {/* Categories List */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${alpha(theme.palette.divider, 0.7)}` }}>
        {loading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <CircularProgress size={40} />
            <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
              Loading categories...
            </Typography>
          </Box>
        ) : filteredCategories.length === 0 ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No categories found
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {searchTerm ? `No categories matching "${searchTerm}"` : 'Start by adding your first category'}
            </Typography>
            {!searchTerm && (
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={handleAddCategory}
              >
                Add Category
              </Button>
            )}
          </Box>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="categories">
              {(provided) => (
                <List {...provided.droppableProps} ref={provided.innerRef} sx={{ p: 0 }}>
                  {filteredCategories.map((category, index) => (
                    <Draggable key={category.id} draggableId={category.id} index={index}>
                      {(provided, snapshot) => (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              borderBottom: index < filteredCategories.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.7)}` : 'none',
                              bgcolor: snapshot.isDragging ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                              },
                            }}
                          >
                            <Box {...provided.dragHandleProps} sx={{ mr: 2, cursor: 'grab' }}>
                              <DragIndicator color="action" />
                            </Box>
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: 8,
                                bgcolor: category.color,
                                mr: 2,
                              }}
                            />
                            <ListItemText
                              primary={category.name}
                              secondary={`${productCounts[category.id] || 0} products`}
                              primaryTypographyProps={{ fontWeight: 500 }}
                            />
                            <ListItemSecondaryAction>
                              <IconButton edge="end" onClick={() => handleEditCategory(category)}>
                                <Edit />
                              </IconButton>
                              <IconButton edge="end" onClick={() => handleDeleteClick(category)} sx={{ ml: 1 }}>
                                <Delete />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </Paper>
      
      {/* Category Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              sx={{ mb: 3 }}
              autoFocus
            />
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Category Color
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['#4caf50', '#ff9800', '#f44336', '#9c27b0', '#2196f3', '#8bc34a', '#795548', '#607d8b'].map((color) => (
                  <Box
                    key={color}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      bgcolor: color,
                      cursor: 'pointer',
                      border: newCategoryColor === color ? '3px solid #000' : 'none',
                      '&:hover': {
                        opacity: 0.8,
                      },
                    }}
                    onClick={() => setNewCategoryColor(color)}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveCategory} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete the category "{categoryToDelete?.name}"?
          </Typography>
          {categoryToDelete && productCounts[categoryToDelete.id] > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This category contains {productCounts[categoryToDelete.id]} products. 
              Deleting it will remove the category association from these products.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={5001} 
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductCategories; 