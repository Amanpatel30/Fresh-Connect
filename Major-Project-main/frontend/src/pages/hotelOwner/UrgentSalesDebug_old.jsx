import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  FormHelperText,
  CardActions,
  IconButton,
  Card,
  CardContent,
  Snackbar,
  Chip,
  Tooltip,
  MenuItem,
  Select,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { getMyUrgentSales, createUrgentSale, updateUrgentSale, deleteUrgentSale, hardDeleteUrgentSale } from '../../services/api.jsx';
import { useNavigate } from 'react-router-dom';
import PreviewIcon from '@mui/icons-material/Preview';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import RefreshIcon from '@mui/icons-material/Refresh';

// Main component for Urgent Sales
const UrgentSalesDebug = () => {
  console.log('UrgentSalesDebug component rendering');
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [allSales, setAllSales] = useState([]);
  const navigate = useNavigate();
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [dialogLoading, setDialogLoading] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    id: null,
    loading: false
  });
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    originalPrice: '',
    discountedPrice: '',
    stock: '',
    unit: 'piece',
    expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    image: ''
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState({});

  // Fetch real urgent sales data
  const fetchUrgentSales = async () => {
    try {
      setLoading(true);
      console.log('Fetching urgent sales data from database...');
      
      // Use the getMyUrgentSales function from api.jsx which has proper authentication
      const timestamp = new Date().getTime();
      const response = await getMyUrgentSales(timestamp);
      
      console.log('Urgent sales response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Store all sales for reference
        setAllSales(response.data);
        
        // Filter out inactive sales and those with _hardDelete flag
        const fetchedSales = response.data.filter(sale => 
          !sale._hardDelete && sale.isActive === true
        );
        console.log(`Found ${fetchedSales.length} active urgent sales out of ${response.data.length} total`);
        
        // Store filtered sales in state
        setSales(fetchedSales);
      } else {
        setAllSales([]);
        setSales([]);
        console.log('No urgent sales found in the database.');
      }
    } catch (err) {
      console.error('Error fetching urgent sales:', err);
      setError(`Failed to fetch urgent sales: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    console.log('UrgentSalesDebug component mounted');
    fetchUrgentSales();
  }, []);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Calculate discount percentage
  const calculateDiscount = (original, discounted) => {
    if (!original || !discounted) return 'N/A';
    const discount = ((original - discounted) / original) * 100;
    return `${discount.toFixed(0)}%`;
  };
  
  // Handle create sale button click
  const handleCreateSale = async () => {
    try {
      // Reset form data
      setFormData({
        name: '',
        description: '',
        originalPrice: '',
        discountedPrice: '',
        stock: '',
        unit: 'piece',
        expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        image: ''
      });
      
      // Reset form errors
      setFormErrors({});
      
      // Set dialog mode to create
      setDialogMode('create');
      
      // Open dialog
      setDialogOpen(true);
    } catch (err) {
      console.error('Error preparing to create sale:', err);
      setError('Failed to prepare sale creation. Please try again.');
    }
  };
  
  // Handle edit sale button click
  const handleEdit = (sale) => {
    console.log('Editing sale:', sale);
    
    // Set form data
    setFormData({
      name: sale.name || '',
      description: sale.description || '',
      originalPrice: sale.originalPrice || '',
      discountedPrice: sale.discountedPrice || '',
      stock: sale.stock || '',
      unit: sale.unit || 'piece',
      expiryDate: sale.expiryDate ? new Date(sale.expiryDate).toISOString().slice(0, 16) : '',
      image: sale.image || ''
    });
    
    // Reset form errors
    setFormErrors({});
    
    // Set selected sale
    setSelectedSale(sale);
    
    // Set dialog mode to edit
    setDialogMode('edit');
    
    // Open dialog
    setDialogOpen(true);
  };
  
  // Handle delete sale button click
  const handleDelete = (sale) => {
    console.log('Deleting sale:', sale);
    
    // Open confirmation dialog
    setConfirmDialog({
      open: true,
      title: 'Delete Urgent Sale',
      message: `Are you sure you want to delete "${sale.name}"? This action cannot be undone.`,
      id: sale._id,
      loading: false
    });
  };
  
  // Handle confirmation dialog confirm button click
  const handleConfirmDelete = async () => {
    try {
      // Set loading state
      setConfirmDialog(prev => ({ ...prev, loading: true }));
      
      // Permanently delete sale
      console.log(`Deleting sale with ID: ${confirmDialog.id}`);
      await hardDeleteUrgentSale(confirmDialog.id);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Urgent sale deleted successfully',
        severity: 'success'
      });
      
      // Close dialog
      setConfirmDialog({
        open: false,
        title: '',
        message: '',
        id: '',
        loading: false
      });
      
      // Refresh sales list
      fetchUrgentSales();
    } catch (error) {
      console.error('Error deleting sale:', error);
      
      // Show error message
      setSnackbar({
        open: true,
        message: `Error deleting sale: ${error.message || 'Unknown error'}`,
        severity: 'error'
      });
      
      // Close dialog
      setConfirmDialog({
        open: false,
        title: '',
        message: '',
        id: '',
        loading: false
      });
    }
  };
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    // Check required fields
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.description) errors.description = 'Description is required';
    if (!formData.originalPrice) errors.originalPrice = 'Original price is required';
    if (!formData.discountedPrice) errors.discountedPrice = 'Discounted price is required';
    if (!formData.stock) errors.stock = 'Stock is required';
    if (!formData.expiryDate) errors.expiryDate = 'Expiry date is required';
    
    // Check if discounted price is less than original price
    if (formData.originalPrice && formData.discountedPrice) {
      const original = parseFloat(formData.originalPrice);
      const discounted = parseFloat(formData.discountedPrice);
      
      if (discounted >= original) {
        errors.discountedPrice = 'Discounted price must be less than original price';
      }
    }
    
    // Check if expiry date is in the future
    if (formData.expiryDate) {
      const expiryDate = new Date(formData.expiryDate);
      const now = new Date();
      
      if (expiryDate <= now) {
        errors.expiryDate = 'Expiry date must be in the future';
      }
    }
    
    // Set form errors
    setFormErrors(errors);
    
    // Return true if there are no errors
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submit
  const handleSubmit = async () => {
    try {
      // Validate form
      if (!validateForm()) {
        console.log('Form validation failed:', formErrors);
        return;
      }
      
      // Set loading state
      setDialogLoading(true);
      
      // Prepare sale data
      const saleData = {
        name: formData.name,
        description: formData.description,
        originalPrice: parseFloat(formData.originalPrice),
        discountedPrice: parseFloat(formData.discountedPrice),
        stock: parseInt(formData.stock),
        unit: formData.unit,
        expiryDate: new Date(formData.expiryDate).toISOString(),
        image: formData.image
      };
      
      if (dialogMode === 'create') {
        // Create new sale
        console.log('Creating new urgent sale:', saleData);
        await createUrgentSale(saleData);
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Urgent sale created successfully',
          severity: 'success'
        });
      } else {
        // Update existing sale
        console.log(`Updating urgent sale with ID: ${selectedSale._id}`, saleData);
        await updateUrgentSale(selectedSale._id, saleData);
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Urgent sale updated successfully',
          severity: 'success'
        });
      }
      
      // Close dialog
      setDialogOpen(false);
      
      // Reset form data
      setFormData({
        name: '',
        description: '',
        originalPrice: '',
        discountedPrice: '',
        stock: '',
        unit: 'piece',
        expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        image: ''
      });
      
      // Reset selected sale
      setSelectedSale(null);
      
      // Refresh sales data
      fetchUrgentSales();
    } catch (err) {
      console.error('Error saving urgent sale:', err);
      
      // Show error message
      setSnackbar({
        open: true,
        message: `Failed to save urgent sale: ${err.message}`,
        severity: 'error'
      });
    } finally {
      // Reset loading state
      setDialogLoading(false);
    }
  };
  
  // Handle dialog close
  const handleDialogClose = () => {
    // Close dialog
    setDialogOpen(false);
    
    // Reset selected sale
    setSelectedSale(null);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  // Handle confirmation dialog close
  const handleConfirmDialogClose = () => {
    setConfirmDialog({
      open: false,
      title: '',
      message: '',
      id: null,
      loading: false
    });
  };
  
  // Render sale card
  const renderSaleCard = (sale) => {
    const isExpired = new Date(sale.expiryDate) < new Date();
    
    return (
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
          transition: 'transform 0.3s, box-shadow 0.3s',
          borderRadius: 2,
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: 6
          }
        }}
      >
        {isExpired && (
          <Chip
            label="Expired"
            color="error"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 1,
              fontWeight: 'bold'
            }}
          />
        )}
        
        <Box sx={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
          <Box
            component="img"
            src={sale.image || 'https://via.placeholder.com/300x200?text=No+Image'}
            alt={sale.name}
            sx={{
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
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x200?text=Error+Loading+Image';
            }}
          />
          
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              p: 1.5
            }}
          >
            <Typography variant="h6" noWrap>
              {sale.name}
            </Typography>
          </Box>
        </Box>
        
        <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2, 
              height: 60, 
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {sale.description}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper sx={{ p: 1, bgcolor: 'grey.50', height: '100%' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Original Price:
                </Typography>
                <Typography variant="body1" sx={{ textDecoration: 'line-through', fontWeight: 'medium' }}>
                  ₹{sale.originalPrice?.toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6}>
              <Paper sx={{ p: 1, bgcolor: 'error.50', height: '100%' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Sale Price:
                </Typography>
                <Typography variant="h6" color="error" sx={{ fontWeight: 'bold' }}>
                  ₹{sale.discountedPrice?.toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6}>
              <Paper sx={{ p: 1, bgcolor: 'success.50', height: '100%' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Discount:
                </Typography>
                <Typography variant="body1" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {calculateDiscount(sale.originalPrice, sale.discountedPrice)}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6}>
              <Paper sx={{ p: 1, bgcolor: 'primary.50', height: '100%' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Stock:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {sale.stock} {sale.unit}s
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 1, bgcolor: isExpired ? 'error.50' : 'info.50' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Expires:
                </Typography>
                <Typography 
                  variant="body1" 
                  color={isExpired ? 'error' : 'text.primary'}
                  sx={{ fontWeight: 'medium' }}
                >
                  {formatDate(sale.expiryDate)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'space-between', p: 2, bgcolor: 'grey.50', borderTop: '1px solid #eee' }}>
          <Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => handleEdit(sale)}
              size="small"
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteForeverIcon />}
              onClick={() => handleDelete(sale)}
              size="small"
            >
              Delete
            </Button>
          </Box>
        </CardActions>
      </Card>
    );
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 4
      }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold',
          mb: { xs: 2, sm: 0 },
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center'
        }}>
          <LocalOfferIcon sx={{ mr: 1, fontSize: 32 }} />
          Urgent Sales Management
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateSale}
          sx={{ 
            borderRadius: 2,
            px: 3,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4
            }
          }}
        >
          Create New Sale
        </Button>
      </Box>
      
      <Paper sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: 2,
        boxShadow: 2,
        background: 'linear-gradient(to right, #f5f7fa, #e4e8eb)'
      }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ mb: { xs: 2, md: 0 } }}>
            <Typography variant="h6" gutterBottom>
              Active Urgent Sales: <Chip label={sales.length} color="primary" size="small" />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create and manage time-sensitive offers for your customers
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={fetchUrgentSales}
              disabled={loading}
            >
              Refresh
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateSale}
            >
              Create New Sale
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : sales.length === 0 ? (
        <Paper sx={{ 
          p: 6, 
          textAlign: 'center',
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: 'background.paper'
        }}>
          <Box sx={{ mb: 3 }}>
            <LocalOfferIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
          </Box>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No active urgent sales found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
            Create your first urgent sale to offer discounted items to your customers. Urgent sales are a great way to reduce waste and increase revenue.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateSale}
            size="large"
            sx={{ borderRadius: 2, px: 4 }}
          >
            Create New Sale
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {sales.map(sale => (
            <Grid item xs={12} sm={6} md={4} key={sale._id}>
              {renderSaleCard(sale)}
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', pb: 2 }}>
          {dialogMode === 'create' ? 'Create New Urgent Sale' : 'Edit Urgent Sale'}
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Form Section */}
            <Grid item xs={12} md={7}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Sale Details
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="name"
                    label="Sale Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    margin="normal"
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                  />
                </Grid>
                
                <Grid item xs={12}>
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
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    name="image"
                    label="Image URL"
                    value={formData.image}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    helperText="Enter a URL for the sale image (optional)"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" required error={!!formErrors.originalPrice}>
                    <InputLabel htmlFor="original-price">Original Price</InputLabel>
                    <OutlinedInput
                      id="original-price"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      startAdornment={<InputAdornment position="start">₹</InputAdornment>}
                      label="Original Price"
                      type="number"
                    />
                    {formErrors.originalPrice && (
                      <FormHelperText>{formErrors.originalPrice}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" required error={!!formErrors.discountedPrice}>
                    <InputLabel htmlFor="discounted-price">Discounted Price</InputLabel>
                    <OutlinedInput
                      id="discounted-price"
                      name="discountedPrice"
                      value={formData.discountedPrice}
                      onChange={handleInputChange}
                      startAdornment={<InputAdornment position="start">₹</InputAdornment>}
                      label="Discounted Price"
                      type="number"
                    />
                    {formErrors.discountedPrice && (
                      <FormHelperText>{formErrors.discountedPrice}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                {formData.originalPrice && formData.discountedPrice && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 1, bgcolor: 'success.light', color: 'success.contrastText' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        Discount: {calculateDiscount(formData.originalPrice, formData.discountedPrice)}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="stock"
                    label="Stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    margin="normal"
                    type="number"
                    error={!!formErrors.stock}
                    helperText={formErrors.stock}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="unit-label">Unit</InputLabel>
                    <Select
                      labelId="unit-label"
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      label="Unit"
                    >
                      <MenuItem value="piece">Piece</MenuItem>
                      <MenuItem value="kg">Kg</MenuItem>
                      <MenuItem value="gram">Gram</MenuItem>
                      <MenuItem value="liter">Liter</MenuItem>
                      <MenuItem value="ml">ml</MenuItem>
                      <MenuItem value="plate">Plate</MenuItem>
                      <MenuItem value="dozen">Dozen</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    name="expiryDate"
                    label="Expiry Date & Time"
                    type="datetime-local"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    error={!!formErrors.expiryDate}
                    helperText={formErrors.expiryDate}
                  />
                </Grid>
              </Grid>
            </Grid>
            
            {/* Preview Section */}
            <Grid item xs={12} md={5}>
              <Box sx={{ 
                border: '1px dashed #ccc', 
                borderRadius: 2, 
                p: 2, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <PreviewIcon sx={{ mr: 1 }} /> Preview
                </Typography>
                
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {!formData.name && !formData.description && !formData.originalPrice ? (
                    <Box sx={{ textAlign: 'center', color: 'text.secondary', p: 3 }}>
                      <VisibilityIcon sx={{ fontSize: 40, mb: 2, opacity: 0.5 }} />
                      <Typography variant="body1">
                        Fill in the form to see a preview of your urgent sale
                      </Typography>
                    </Box>
                  ) : (
                    <Card 
                      sx={{ 
                        width: '100%',
                        maxWidth: 350,
                        mx: 'auto',
                        boxShadow: 3,
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: 6
                        }
                      }}
                    >
                      {formData.expiryDate && new Date(formData.expiryDate) < new Date() && (
                        <Chip
                          label="Expired"
                          color="error"
                          sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            zIndex: 1
                          }}
                        />
                      )}
                      
                      <Box sx={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
                        <Box
                          component="img"
                          src={formData.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                          alt={formData.name || 'Urgent Sale Preview'}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=Error+Loading+Image';
                          }}
                        />
                        
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            bgcolor: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            p: 1
                          }}
                        >
                          <Typography variant="h6" noWrap>
                            {formData.name || 'Sale Name'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 60, overflow: 'hidden' }}>
                          {formData.description || 'Sale description will appear here...'}
                        </Typography>
                        
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Original Price:
                            </Typography>
                            <Typography variant="body1" sx={{ textDecoration: 'line-through' }}>
                              ₹{formData.originalPrice ? parseFloat(formData.originalPrice).toFixed(2) : '0.00'}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Sale Price:
                            </Typography>
                            <Typography variant="h6" color="error">
                              ₹{formData.discountedPrice ? parseFloat(formData.discountedPrice).toFixed(2) : '0.00'}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Discount:
                            </Typography>
                            <Typography variant="body1" color="success.main">
                              {formData.originalPrice && formData.discountedPrice 
                                ? calculateDiscount(formData.originalPrice, formData.discountedPrice) 
                                : '0%'}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Stock:
                            </Typography>
                            <Typography variant="body1">
                              {formData.stock || '0'} {formData.unit || 'piece'}{formData.stock !== '1' ? 's' : ''}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Expires:
                            </Typography>
                            <Typography 
                              variant="body1" 
                              color={formData.expiryDate && new Date(formData.expiryDate) < new Date() ? 'error' : 'text.primary'}
                            >
                              {formData.expiryDate ? formatDate(formData.expiryDate) : 'Not set'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  )}
                </Box>
                
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    This is how your urgent sale will appear to customers
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={handleDialogClose} color="inherit" startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={dialogLoading}
            startIcon={dialogLoading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {dialogLoading ? 'Saving...' : (dialogMode === 'create' ? 'Create Sale' : 'Update Sale')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleConfirmDialogClose}
      >
        <DialogTitle>
          {confirmDialog.title}
        </DialogTitle>
        
        <DialogContent>
          <Typography>
            {confirmDialog.message}
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleConfirmDialogClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={confirmDialog.loading}
            startIcon={confirmDialog.loading ? <CircularProgress size={20} /> : null}
          >
            {confirmDialog.loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UrgentSalesDebug; 