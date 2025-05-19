import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, TextField, Container, Grid, Card, CardContent, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Divider, Chip, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, FormControl, InputLabel, Select, MenuItem, 
  FormControlLabel, Checkbox, CircularProgress, InputAdornment, Alert
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Remove as RemoveIcon,
  Add as AddIcon, 
  ShoppingCart as ShoppingCartIcon,
  LocalFireDepartment as FireIcon,
  CreditCard as CreditCardIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    // In a real app, this would be an API call to get cart items
    // Simulating data fetch
    setTimeout(() => {
      setCartItems([
        {
          id: 1,
          name: 'Fresh Tomatoes',
          price: 2.99,
          quantity: 2,
          seller: 'Green Farm',
          image: 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          isOrganic: true,
          isUrgent: false,
          available: 20,
        },
        {
          id: 2,
          name: 'Organic Potatoes',
          price: 3.99,
          quantity: 1,
          seller: 'Nature\'s Harvest',
          image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          isOrganic: true,
          isUrgent: false,
          available: 15,
        }
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discountAmount = subtotal * (discount / 100);
  const deliveryFee = subtotal > 50 ? 0 : 5.99;
  const total = subtotal - discountAmount + deliveryFee;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading your cart...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          <ShoppingCartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Your Shopping Cart
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review your items and proceed to checkout
        </Typography>
      </Box>

      {cartItems.length === 0 ? (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            py: 8 
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>Your cart is empty</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Looks like you haven't added any items to your cart yet.
          </Typography>
          <Button 
            component={Link} 
            to="/user/products" 
            variant="contained" 
            sx={{ mt: 2 }}
          >
            Browse Products
        </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="h6" gutterBottom>
            You have {cartItems.length} items in your cart
          </Typography>
              <Button 
            variant="contained" 
            color="primary" 
                size="large" 
            sx={{ mt: 2, mb: 4 }}
            onClick={() => setCheckoutModalVisible(true)}
              >
                Proceed to Checkout
              </Button>
        </Box>
      )}
    </Container>
  );
};

export default ShoppingCart; 