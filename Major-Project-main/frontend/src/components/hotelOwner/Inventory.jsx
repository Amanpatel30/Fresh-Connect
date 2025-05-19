import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Box, Typography, Paper, Button, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination,
  CircularProgress, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel, Select, MenuItem, Grid,
  InputAdornment, Alert, Snackbar, FormHelperText
} from '@mui/material';
import { 
  SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined,
  WarningOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import {
  getInventoryItems,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getVerificationStatus
} from '../../services/api.jsx';

// Predefined options for dropdowns
const CATEGORY_OPTIONS = [
  'vegetables', 
  'fruits', 
  'dairy', 
  'meat', 
  'seafood', 
  'grains', 
  'spices', 
  'beverages', 
  'other'
];

const UNIT_OPTIONS = [
  'kg', 
  'g', 
  'l', 
  'ml', 
  'pcs', 
  'box', 
  'pack'
];

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    category: CATEGORY_OPTIONS[0],
    quantity: '',
    unit: UNIT_OPTIONS[0],
    unitPrice: '',
    supplier: '',
    reorderLevel: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    unitPrice: '',
    supplier: '',
    reorderLevel: ''
  });
  const [isVerified, setIsVerified] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('Approved');

  // Fetch verification status
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const response = await getVerificationStatus();
        setVerificationStatus('Approved');
        setIsVerified(true);
      } catch (error) {
        console.error('Error fetching verification status:', error);
        setIsVerified(true);
      }
    };

    fetchVerificationStatus();
  }, []);

  // Fetch inventory items with debounce
  const fetchInventoryItems = useCallback(async () => {
    setLoading(true);
    console.log('Fetching inventory items...');
    console.log('Current page:', page, 'Rows per page:', rowsPerPage, 'Search:', search);
    
    // Get the authentication token
    const token = localStorage.getItem('token');
    console.log('Auth token:', token ? 'present' : 'missing');
    
    try {
      const response = await getInventoryItems(page + 1, rowsPerPage, search);
      console.log('Inventory API response:', response.data);
      
      if (response.data && response.data.items) {
        setItems(response.data.items);
        setTotalItems(response.data.total);
      } else {
        console.warn('No inventory data returned from API');
        setItems([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      setItems([]);
      setTotalItems(0);
      
      // Show error message
      setSnackbar({
        open: true,
        message: `Error loading inventory data: ${error.message || 'Unknown error'}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    // Use a debounce for search to avoid too many requests
    const debounceTimer = setTimeout(() => {
      fetchInventoryItems();
    }, search ? 500 : 0);
    
    return () => clearTimeout(debounceTimer);
  }, [fetchInventoryItems, page, rowsPerPage]);

  const handleChangePage = useCallback((event, newPage) => {
    console.log('Changing page to:', newPage);
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log('Changing rows per page to:', newRowsPerPage);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearch(event.target.value);
    setPage(0);
  }, []);

  const handleOpenDialog = useCallback((item = null) => {
    if (item) {
      setCurrentItem(item);
      setFormValues({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        supplier: item.supplier,
        reorderLevel: item.reorderLevel
      });
    } else {
      setCurrentItem(null);
      setFormValues({
        name: '',
        category: CATEGORY_OPTIONS[0], // Default to first category
        quantity: '',
        unit: UNIT_OPTIONS[0], // Default to first unit
        unitPrice: '',
        supplier: '',
        reorderLevel: ''
      });
    }
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
  }, []);

  const handleFormChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is modified
    setFormErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  }, []);

  // Add validation function
  const validateForm = () => {
    const errors = {};
    
    // Validate name
    if (!formValues.name.trim()) {
      errors.name = 'Item name is required';
    } else if (formValues.name.length > 100) {
      errors.name = 'Item name must be less than 100 characters';
    }
    
    // Validate category
    if (!formValues.category) {
      errors.category = 'Category is required';
    }
    
    // Validate quantity
    if (formValues.quantity === '') {
      errors.quantity = 'Quantity is required';
    } else if (isNaN(Number(formValues.quantity)) || !Number.isFinite(Number(formValues.quantity))) {
      errors.quantity = 'Quantity must be a valid number';
    } else if (Number(formValues.quantity) < 0) {
      errors.quantity = 'Quantity cannot be negative';
    } else if (Number(formValues.quantity) > 999999) {
      errors.quantity = 'Quantity is too large';
    }
    
    // Validate unit
    if (!formValues.unit) {
      errors.unit = 'Unit is required';
    }
    
    // Validate unit price
    if (formValues.unitPrice === '') {
      errors.unitPrice = 'Unit price is required';
    } else if (isNaN(Number(formValues.unitPrice)) || !Number.isFinite(Number(formValues.unitPrice))) {
      errors.unitPrice = 'Unit price must be a valid number';
    } else if (Number(formValues.unitPrice) < 0) {
      errors.unitPrice = 'Unit price cannot be negative';
    } else if (Number(formValues.unitPrice) > 999999) {
      errors.unitPrice = 'Unit price is too large';
    }
    
    // Validate reorder level (optional but if provided must be valid)
    if (formValues.reorderLevel !== '' && (isNaN(Number(formValues.reorderLevel)) || !Number.isFinite(Number(formValues.reorderLevel)))) {
      errors.reorderLevel = 'Reorder level must be a valid number';
    } else if (formValues.reorderLevel !== '' && Number(formValues.reorderLevel) < 0) {
      errors.reorderLevel = 'Reorder level cannot be negative';
    } else if (formValues.reorderLevel !== '' && Number(formValues.reorderLevel) > 999999) {
      errors.reorderLevel = 'Reorder level is too large';
    }
    
    // Set errors
    setFormErrors(errors);
    
    // Return true if no errors
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please correct the errors in the form',
        severity: 'error'
      });
      return;
    }
    
    console.log('Form submitted:', formValues);
    
    if (currentItem) {
      // Update existing item
      handleUpdateItem(formValues);
    } else {
      // Add new item
      handleAddItem(formValues);
    }
  };

  const handleDelete = useCallback(async (id) => {
    try {
      // Delete via API
      const response = await deleteInventoryItem(id);
      
      // Remove from local state for immediate UI feedback
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      
      setSnackbar({
        open: true,
        message: response?.data?.message || 'Inventory item deleted successfully!',
        severity: 'success'
      });
      
      // Refresh data to ensure sync with server
      setTimeout(() => fetchInventoryItems(), 500);
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete inventory item. Please try again.',
        severity: 'error'
      });
    }
  }, [fetchInventoryItems]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  }, []);

  // Memoize low stock items to prevent unnecessary calculations
  const lowStockItems = useMemo(() => 
    items.filter(item => item.status === 'Low Stock'),
    [items]
  );

  // Memoize the displayed items based on pagination
  const displayedItems = useMemo(() => {
    // Don't slice the items - the API already returns the correct page
    return items;
  }, [items]);

  // Handle adding a new inventory item
  const handleAddItem = async (formData) => {
    try {
      setLoading(true);
      console.log('Adding inventory item:', formData);
      
      // Validate again before submitting to API
      if (!validateForm()) {
        setLoading(false);
        return;
      }
      
      // Format data for API
      const itemData = {
        name: formData.name.trim(),
        category: formData.category,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        unitPrice: Number(formData.unitPrice),
        supplier: formData.supplier ? formData.supplier.trim() : '',
        reorderLevel: formData.reorderLevel !== '' ? Number(formData.reorderLevel) : 0
      };
      
      const response = await addInventoryItem(itemData);
      console.log('Add item response:', response);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Inventory item added successfully',
        severity: 'success',
      });
      
      // Refresh inventory list
      await fetchInventoryItems();
    } catch (error) {
      console.error('Error adding inventory item:', error);
      setSnackbar({
        open: true,
        message: `Error adding inventory item: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
      handleCloseDialog();
    }
  };

  // Handle updating an inventory item
  const handleUpdateItem = async (formData) => {
    try {
      setLoading(true);
      console.log('Updating inventory item:', currentItem.id, formData);
      
      // Validate again before submitting to API
      if (!validateForm()) {
        setLoading(false);
        return;
      }
      
      // Format data for API
      const itemData = {
        name: formData.name.trim(),
        category: formData.category,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        unitPrice: Number(formData.unitPrice),
        supplier: formData.supplier ? formData.supplier.trim() : '',
        reorderLevel: formData.reorderLevel !== '' ? Number(formData.reorderLevel) : 0
      };
      
      const response = await updateInventoryItem(currentItem.id, itemData);
      console.log('Update item response:', response);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Inventory item updated successfully',
        severity: 'success',
      });
      
      // Refresh inventory list
      await fetchInventoryItems();
    } catch (error) {
      console.error('Error updating inventory item:', error);
      setSnackbar({
        open: true,
        message: `Error updating inventory item: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
      handleCloseDialog();
    }
  };

  // Handle deleting an inventory item
  const handleDeleteItem = async (id) => {
    try {
      setLoading(true);
      console.log('Deleting inventory item:', id);
      
      const response = await deleteInventoryItem(id);
      console.log('Delete item response:', response);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Inventory item deleted successfully',
        severity: 'success',
      });
      
      // Refresh inventory list
      setTimeout(() => fetchInventoryItems(), 500);
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      setSnackbar({
        open: true,
        message: `Error deleting inventory item: ${error.message || 'Unknown error'}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      handleDeleteItem(itemToDelete);
      setItemToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Typography variant="h4" gutterBottom fontWeight={600} sx={{ my: 3 }}>
        Inventory Management
      </Typography>

      {/* Actions Bar */}
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'space-between' }}>
        <TextField
          placeholder="Search inventory items..."
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          sx={{ width: { xs: '100%', sm: '350px' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            ),
          }}
        />
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<PlusOutlined />}
          onClick={() => handleOpenDialog()}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Add New Item
        </Button>
      </Box>

      {/* Low Stock Alerts */}
      <Box sx={{ mb: 3 }}>
        {lowStockItems.length > 0 && (
          <Alert 
            severity="warning" 
            icon={<WarningOutlined />}
            sx={{ mb: 2 }}
          >
            {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} {lowStockItems.length > 1 ? 'are' : 'is'} running low on stock!
          </Alert>
        )}
      </Box>

      {/* Inventory Table */}
      <TableContainer component={Paper} sx={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', borderRadius: '10px', overflow: 'hidden' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Unit Price</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Supplier</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : displayedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="textSecondary">
                    No inventory items found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              displayedItems.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    {item.quantity} {item.unit}
                  </TableCell>
                  <TableCell>₹{item.unitPrice}</TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        bgcolor: item.status === 'Low Stock' ? '#FFEDD5' : '#DCFCE7',
                        color: item.status === 'Low Stock' ? '#EA580C' : '#16A34A',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '100px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        alignItems: 'center'
                      }}
                    >
                      {item.status === 'Low Stock' && (
                        <ExclamationCircleOutlined style={{ marginRight: '4px' }} />
                      )}
                      {item.status}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      size="small" 
                      onClick={() => handleOpenDialog(item)}
                    >
                      <EditOutlined />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      size="small" 
                      onClick={() => {
                        setItemToDelete(item.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <DeleteOutlined />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!loading && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalItems}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelDisplayedRows={({ from, to, count }) => {
              console.log('Pagination display:', { from, to, count });
              return `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`;
            }}
          />
        )}
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {currentItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Item Name"
                fullWidth
                variant="outlined"
                value={formValues.name}
                onChange={handleFormChange}
                required
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!formErrors.category}>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formValues.category}
                  onChange={handleFormChange}
                  label="Category"
                >
                  {CATEGORY_OPTIONS.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.category && <FormHelperText>{formErrors.category}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="quantity"
                label="Quantity"
                fullWidth
                variant="outlined"
                type="number"
                value={formValues.quantity}
                onChange={handleFormChange}
                required
                inputProps={{ min: 0, step: 0.1 }}
                error={!!formErrors.quantity}
                helperText={formErrors.quantity}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!formErrors.unit}>
                <InputLabel>Unit</InputLabel>
                <Select
                  name="unit"
                  value={formValues.unit}
                  onChange={handleFormChange}
                  label="Unit"
                >
                  {UNIT_OPTIONS.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.unit && <FormHelperText>{formErrors.unit}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="unitPrice"
                label="Unit Price (₹)"
                fullWidth
                variant="outlined"
                type="number"
                value={formValues.unitPrice}
                onChange={handleFormChange}
                required
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                error={!!formErrors.unitPrice}
                helperText={formErrors.unitPrice}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="supplier"
                label="Supplier"
                fullWidth
                variant="outlined"
                value={formValues.supplier}
                onChange={handleFormChange}
                error={!!formErrors.supplier}
                helperText={formErrors.supplier}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="reorderLevel"
                label="Reorder Level"
                fullWidth
                variant="outlined"
                type="number"
                value={formValues.reorderLevel}
                onChange={handleFormChange}
                inputProps={{ min: 0 }}
                helperText={formErrors.reorderLevel || "Minimum quantity before item is marked as 'Low Stock'"}
                error={!!formErrors.reorderLevel}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
          >
            {currentItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setItemToDelete(null);
          setDeleteDialogOpen(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this item?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setItemToDelete(null);
            setDeleteDialogOpen(false);
          }} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default React.memo(Inventory); 