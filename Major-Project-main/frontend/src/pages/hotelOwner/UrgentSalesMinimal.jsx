import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  Box
} from '@mui/material';

// Super simple minimal version with just what's needed
const UrgentSalesMinimal = () => {
  // Simple state for form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountedPrice: '',
    quantity: '',
    category: 'Vegetables',
    unit: 'kg',
    expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    image: 'https://via.placeholder.com/300x200?text=Food+Image' // Default placeholder image
  });

  // State for feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  // Check login status on component mount
  useEffect(() => {
    const checkLoginStatus = () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to create urgent sales');
          return;
        }
        
        // Try to decode token
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        
        // Extract user info
        const userId = payload.id || payload._id || payload.userId || payload.user_id || payload.sub;
        const userName = payload.name || payload.username || 'Hotel Owner';
        
        if (userId) {
          setUserInfo({ id: userId, name: userName });
          console.log('Logged in as:', userName, 'ID:', userId);
        } else {
          setError('Your login token does not contain user information. Please log in again.');
        }
      } catch (e) {
        console.error('Error checking login status:', e);
        setError('Authentication error: ' + e.message);
      }
    };
    
    checkLoginStatus();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      setImagePreview(event.target.result);
      setFormData(prev => ({
        ...prev,
        image: event.target.result
      }));
    };
    
    reader.readAsDataURL(file);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Calculate discount percentage
      const price = parseFloat(formData.price);
      const discountedPrice = parseFloat(formData.discountedPrice);
      const discount = Math.round(((price - discountedPrice) / price) * 100);
      
      // Create submission object with EXACT field names and formats from the MongoDB data
      const submitData = {
        // Fields in exact format matching your MongoDB data (from MongoDB Compass screenshot)
        name: String(formData.name),
        description: String(formData.description),
        category: String(formData.category),
        price: Number(price),
        discountedPrice: Number(discountedPrice),
        discount: Number(discount),
        quantity: Number(parseInt(formData.quantity)),
        unit: String(formData.unit),
        expiryDate: new Date(formData.expiryDate).toISOString(),
        image: String(formData.image),
        featured: false,
        status: "active",
        views: 0,
        sales: 0,
        tags: [],
        images: []
      };
      
      // Extract the hotel owner's ID from token - DYNAMIC approach
      try {
        if (!token) {
          throw new Error('Authentication token is required');
        }
        
        // Decode JWT token to get user ID
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        
        // Check all possible ID field names in the token
        const userId = payload.id || payload._id || payload.userId || payload.user_id || payload.sub;
        
        if (!userId) {
          console.warn('Could not extract user ID from token. Token payload:', payload);
          throw new Error('Could not determine hotel owner ID from authentication token');
        }
        
        // Set seller to the hotel owner's ID
        console.log('Using dynamic hotel owner ID as seller:', userId);
        submitData.seller = userId;
      } catch (e) {
        console.error('Error extracting hotel owner ID from token:', e);
        setError('Authentication error: ' + e.message);
        setLoading(false);
        return; // Stop submission if we can't get the hotel owner ID
      }
      
      // Try each ID if needed in future requests
      console.log("Using seller ID:", submitData.seller);
      
      console.log('Final request details for debugging:');
      console.log('Request headers:', {
        'Content-Type': 'application/json',
        Authorization: token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : undefined
      });
      console.log('Request body with dynamic seller ID:', JSON.stringify(submitData));
      
      // Make direct API call
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/urgent-sales`;
      console.log('Sending request to:', apiUrl);
      
      try {
        // Use fetch with improved error handling
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : undefined
          },
          body: JSON.stringify(submitData)
        });
        
        // Log response details 
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries([...response.headers]));
        
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        // If we get a 400 error with validation, try with XMLHttpRequest as alternative
        if (response.status === 400) {
          console.log("Got 400 error, trying with XMLHttpRequest as alternative approach");
          
          return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', apiUrl, true);
            
            // Set headers
            xhr.setRequestHeader('Content-Type', 'application/json');
            if (token) {
              xhr.setRequestHeader('Authorization', token.startsWith('Bearer ') ? token : `Bearer ${token}`);
            }
            
            xhr.onload = function() {
              console.log("XHR Response:", xhr.status, xhr.responseText);
              
              if (xhr.status >= 200 && xhr.status < 300) {
                setSuccess(true);
                setFormData({
                  name: '',
                  description: '',
                  price: '',
                  discountedPrice: '',
                  quantity: '',
                  category: 'Vegetables',
                  unit: 'kg',
                  expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                  image: 'https://via.placeholder.com/300x200?text=Food+Image'
                });
                setImagePreview(null);
                resolve();
              } else {
                let errorMsg = xhr.responseText;
                try {
                  const errorData = JSON.parse(xhr.responseText);
                  errorMsg = errorData.message || errorData.error || xhr.responseText;
                } catch (e) {}
                
                reject(new Error(errorMsg || "Failed to create urgent sale"));
              }
            };
            
            xhr.onerror = function() {
              reject(new Error("Network error occurred"));
            };
            
            xhr.send(JSON.stringify(submitData));
          });
        }
        
        // Continue with normal fetch response handling if status wasn't 400
        if (response.ok) {
          setSuccess(true);
          setFormData({
            name: '',
            description: '',
            price: '',
            discountedPrice: '',
            quantity: '',
            category: 'Vegetables',
            unit: 'kg',
            expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
            image: 'https://via.placeholder.com/300x200?text=Food+Image'
          });
          setImagePreview(null);
        } else {
          // Extract detailed error information
          let errorMessage = `Server error (${response.status})`;
          
          // Try to parse JSON response for structured error
          try {
            const errorData = JSON.parse(responseText);
            if (errorData.message) {
              errorMessage = errorData.message;
            }
            
            // Check for validation errors
            if (errorData.errors) {
              const validationErrors = Object.entries(errorData.errors)
                .map(([field, error]) => `${field}: ${error.message || error}`)
                .join(', ');
              
              errorMessage = `Validation failed: ${validationErrors}`;
            }
          } catch (e) {
            // If not JSON, use text response
            errorMessage = responseText || errorMessage;
          }
          
          throw new Error(errorMessage);
        }
      } catch (err) {
        console.error('Error submitting form:', err);
        setError(err.message || 'Failed to create urgent sale');
      } finally {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Failed to create urgent sale');
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, my: 4 }}>
        <Typography variant="h5" gutterBottom>
          Create New Urgent Sale (Minimal Version)
        </Typography>
        
        {userInfo && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Logged in as: {userInfo.name} (ID: {userInfo.id})
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Urgent sale created successfully!
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
              />
              
              <TextField
                fullWidth
                required
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={4}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label="Original Price (₹)"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    margin="normal"
                    inputProps={{ min: 1, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label="Discounted Price (₹)"
                    name="discountedPrice"
                    value={formData.discountedPrice}
                    onChange={handleChange}
                    margin="normal"
                    inputProps={{ min: 0, step: 0.01 }}
                    error={formData.price && formData.discountedPrice && parseFloat(formData.discountedPrice) >= parseFloat(formData.price)}
                    helperText={formData.price && formData.discountedPrice && parseFloat(formData.discountedPrice) >= parseFloat(formData.price) ? "Discounted price must be less than original price" : ""}
                  />
                </Grid>
              </Grid>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label="Quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    margin="normal"
                    inputProps={{ min: 1, step: 1 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Unit</InputLabel>
                    <Select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      label="Unit"
                    >
                      <MenuItem value="kg">Kilogram (kg)</MenuItem>
                      <MenuItem value="g">Gram (g)</MenuItem>
                      <MenuItem value="l">Liter (l)</MenuItem>
                      <MenuItem value="ml">Milliliter (ml)</MenuItem>
                      <MenuItem value="piece">Piece</MenuItem>
                      <MenuItem value="box">Box</MenuItem>
                      <MenuItem value="packet">Packet</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                >
                  <MenuItem value="Food">Food</MenuItem>
                  <MenuItem value="Vegetables">Vegetables</MenuItem>
                  <MenuItem value="Fruits">Fruits</MenuItem>
                  <MenuItem value="Meat">Meat</MenuItem>
                  <MenuItem value="Dairy">Dairy</MenuItem>
                  <MenuItem value="Bakery">Bakery</MenuItem>
                  <MenuItem value="Beverages">Beverages</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                required
                type="datetime-local"
                label="Expiry Date & Time"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Product Image
              </Typography>
              
              <Box 
                sx={{ 
                  width: '100%', 
                  height: 200, 
                  border: '1px dashed grey', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                  overflow: 'hidden',
                  mb: 2
                }}
              >
                <img 
                  src={imagePreview || formData.image} 
                  alt="Product preview" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover'
                  }} 
                />
              </Box>
              
              <Button
                variant="outlined"
                component="label"
                fullWidth
              >
                Select Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
              
              <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                Note: Image upload is optional. A default image will be used if none is provided.
              </Typography>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading || 
                !formData.name || 
                !formData.description || 
                !formData.price || 
                !formData.discountedPrice || 
                !formData.quantity || 
                parseFloat(formData.discountedPrice) >= parseFloat(formData.price)}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Creating...' : 'Create Urgent Sale'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default UrgentSalesMinimal; 