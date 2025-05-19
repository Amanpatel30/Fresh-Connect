import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Typography, Button, Input, Spin, Tag, message, Alert, InputNumber, Modal
} from 'antd';
import { 
  ShoppingCartOutlined, DeleteOutlined, PlusOutlined, MinusOutlined,
  CheckCircleOutlined, LeftOutlined, RightOutlined
} from '@ant-design/icons';
import { useUser } from '../../context/UserContext';
import CartHeader from '../../components/user/CartHeader';
import * as cartService from '../../services/cartService';
import './ShoppingCart.css';

const { Text, Title } = Typography;

const ShoppingCart = () => {
  const { user } = useUser();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState({ text: '', type: '' });
  const [discount, setDiscount] = useState(0);
  const [zipCode, setZipCode] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(50);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);

  // Fetch cart data
  useEffect(() => {
    fetchCartItems();
  }, [user]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await cartService.getCartItems();
      
      if (response && response.status === 'success') {
        setCartItems(response.data.items || []);
        
        // Reset coupon and shipping when cart changes
        setDiscount(0);
        setCouponMessage({ text: '', type: '' });
        setCouponCode('');
      } else {
        throw new Error(response?.message || 'Failed to fetch cart items');
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load your cart. Please try again later.');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const handleRemoveItem = async (productId) => {
    try {
      const response = await cartService.removeFromCart(productId);
      
      if (response && response.status === 'success') {
        message.success('Item removed from cart');
        // Remove item from local state without refetching
        setCartItems(cartItems.filter(item => item.product._id !== productId));
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (err) {
      console.error('Error removing item:', err);
      message.error('Failed to remove item from cart');
    }
  };

  // Update item quantity
  const handleUpdateQuantity = async (productId, newQuantity) => {
    // Don't allow quantities less than 1
    if (newQuantity < 1) return;
    
    // Don't allow quantities more than stock
    const item = cartItems.find(item => item.product._id === productId);
    if (item && newQuantity > item.product.stock) {
      message.warning(`Only ${item.product.stock} items available in stock`);
      return;
    }
    
    try {
      const response = await cartService.updateCartItemQuantity(productId, newQuantity);
      
      if (response && response.status === 'success') {
        // Update local state without refetching
        setCartItems(cartItems.map(item => 
          item.product._id === productId 
            ? { ...item, quantity: newQuantity } 
            : item
        ));
      } else {
        throw new Error('Failed to update quantity');
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      message.error('Failed to update quantity');
    }
  };

  // Apply coupon code
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage({ text: 'Please enter a coupon code', type: 'error' });
      return;
    }
    
    try {
      const response = await cartService.applyCoupon(couponCode);
      
      if (response && response.status === 'success') {
        setDiscount(response.data.discount || 0);
        setCouponMessage({ 
          text: response.data.message || 'Coupon applied successfully', 
          type: 'success' 
        });
      } else {
        throw new Error('Failed to apply coupon');
      }
    } catch (err) {
      console.error('Error applying coupon:', err);
      setCouponMessage({ text: 'Invalid coupon code', type: 'error' });
      setDiscount(0);
    }
  };

  // Calculate shipping
  const handleCalculateShipping = async () => {
    if (!zipCode.trim() || zipCode.length < 5) {
      message.warning('Please enter a valid zip code');
      return;
    }
    
    try {
      const response = await cartService.calculateShipping(zipCode);
      
      if (response && response.status === 'success') {
        setShippingCost(response.data.shippingCost || 0);
        setFreeShippingThreshold(response.data.freeShippingThreshold || 50);
        message.success('Shipping calculated');
      } else {
        throw new Error('Failed to calculate shipping');
      }
    } catch (err) {
      console.error('Error calculating shipping:', err);
      message.error('Failed to calculate shipping');
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    setCheckoutModalVisible(true);
  };

  // Proceed to payment
  const proceedToPayment = () => {
    message.success('Redirecting to payment...');
    setCheckoutModalVisible(false);
    // Redirect to payment page would go here
    window.location.href = '/payment';
  };

  // Calculate cart totals
  const calculateTotals = () => {
    if (!cartItems.length) return { subtotal: 0, discountAmount: 0, shipping: 0, total: 0 };
    
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + (price * item.quantity);
    }, 0);
    
    const discountAmount = (subtotal * discount) / 100;
    
    // Free shipping if subtotal is above threshold
    const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
    
    return {
      subtotal,
      discountAmount,
      shipping,
      total: subtotal - discountAmount + shipping
    };
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toFixed(2);
  };

  // Render empty cart state
  const renderEmptyCart = () => (
    <div className="empty-cart">
      <ShoppingCartOutlined className="empty-cart-icon" />
      <Title level={4} className="empty-cart-title">Your cart is empty</Title>
      <Text className="empty-cart-text">
        Looks like you haven't added any items to your cart yet.
        Browse our products to find what you need.
      </Text>
      <Button 
        type="primary" 
        size="large"
        className="browse-button"
        href="/products"
      >
        Browse Products
      </Button>
    </div>
  );

  // Get total number of items in cart
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading-container">
          <Spin size="large" />
          <Text className="loading-text">Loading your cart...</Text>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="cart-container">
        <Alert 
          message="Error Loading Cart" 
          description={error}
          type="error" 
          showIcon 
          action={
            <Button onClick={fetchCartItems} type="primary">
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  // Calculate totals for rendering
  const { subtotal, discountAmount, shipping, total } = calculateTotals();
  const totalItems = getTotalItems();

  return (
    <div className="cart-container">
      <CartHeader itemCount={totalItems} />

      {cartItems.length === 0 ? (
        renderEmptyCart()
      ) : (
        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items">
            {cartItems.map((item, index) => (
              <div 
                key={item.product._id} 
                className="cart-item" 
                style={{ '--item-index': index }}
              >
                <img 
                  src={item.product.images[0]?.url || "https://via.placeholder.com/150"} 
                  alt={item.product.name}
                  className="cart-item-image"
                />
                
                <div className="cart-item-details">
                  <div>
                    <h3 className="cart-item-name">{item.product.name}</h3>
                    <p className="cart-item-seller">Seller: {item.product.seller?.name || "Unknown"}</p>
                    
                    {item.product.isOrganic && (
                      <span className="cart-item-badge">Organic</span>
                    )}
                    
                    {item.product.isUrgent && (
                      <span className="cart-item-badge urgent">Urgent Sale</span>
                    )}
                  </div>
                  
                  <div className="cart-item-actions">
                    <div className="cart-item-quantity">
                      <button 
                        className="quantity-btn"
                        onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <MinusOutlined />
                      </button>
                      <input 
                        className="quantity-input"
                        value={item.quantity}
                        readOnly
                      />
                      <button 
                        className="quantity-btn"
                        onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        <PlusOutlined />
                      </button>
                    </div>
                    
                    <button 
                      className="remove-item"
                      onClick={() => handleRemoveItem(item.product._id)}
                    >
                      <DeleteOutlined /> Remove
                    </button>
                  </div>
                </div>
                
                <div className="cart-item-price">
                  {item.product.discountPrice ? (
                    <>
                      <span className="original-price">₹{formatCurrency(item.product.price)}</span>
                      <span className="current-price">₹{formatCurrency(item.product.discountPrice)}</span>
                    </>
                  ) : (
                    <span className="current-price">₹{formatCurrency(item.product.price)}</span>
                  )}
                  
                  <span className="item-total-price">
                    Total: ₹{formatCurrency((item.product.discountPrice || item.product.price) * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="cart-summary">
            <h2 className="summary-header">Order Summary</h2>
            
            <div className="summary-row">
              <span className="summary-label">Subtotal ({totalItems} items)</span>
              <span className="summary-value">₹{formatCurrency(subtotal)}</span>
            </div>
            
            {discount > 0 && (
              <div className="summary-row">
                <span className="summary-label">Discount ({discount}%)</span>
                <span className="summary-value discount">-₹{formatCurrency(discountAmount)}</span>
              </div>
            )}
            
            <div className="summary-row">
              <span className="summary-label">Shipping</span>
              <span className="summary-value">
                {shipping === 0 && subtotal > 0 ? 'Free' : `₹{formatCurrency(shipping)}`}
              </span>
            </div>
            
            <div className="summary-row total">
              <span className="summary-label">Total</span>
              <span className="summary-value">₹{formatCurrency(total)}</span>
            </div>
            
            {subtotal > 0 && subtotal < freeShippingThreshold && (
              <div className="summary-note">
                Add ₹{formatCurrency(freeShippingThreshold - subtotal)} more to qualify for free shipping.
              </div>
            )}
            
            {/* Coupon Input */}
            <div className="coupon-form">
              <h3 className="coupon-header">Promo Code</h3>
              <div className="coupon-input">
                <input
                  className="coupon-field"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                />
                <button 
                  className="apply-button"
                  onClick={handleApplyCoupon}
                >
                  Apply
                </button>
              </div>
              
              {couponMessage.text && (
                <p className={`coupon-message ${couponMessage.type}`}>
                  {couponMessage.type === 'success' && <CheckCircleOutlined />} {couponMessage.text}
                </p>
              )}
            </div>
            
            {/* Shipping Calculation */}
            <div className="coupon-form">
              <h3 className="coupon-header">Calculate Shipping</h3>
              <div className="coupon-input">
                <input
                  className="coupon-field"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Enter ZIP code"
                />
                <button 
                  className="apply-button"
                  onClick={handleCalculateShipping}
                >
                  Calculate
                </button>
              </div>
            </div>
            
            {/* Checkout Button */}
            <button 
              className="checkout-button"
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
            >
              <ShoppingCartOutlined /> Proceed to Checkout
            </button>
            
            <Link to="/products" className="continue-shopping">
              <LeftOutlined /> Continue Shopping
            </Link>
          </div>
        </div>
      )}
      
      {/* Checkout Confirmation Modal */}
      <Modal
        title="Confirm Checkout"
        open={checkoutModalVisible}
        onCancel={() => setCheckoutModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setCheckoutModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={proceedToPayment}
          >
            Proceed to Payment
          </Button>
        ]}
      >
        <div>
          <p>Please confirm your order details:</p>
          <ul style={{ padding: '16px 0' }}>
            {cartItems.map(item => (
              <li key={item.product._id}>
                {item.product.name} x {item.quantity} - ₹{formatCurrency((item.product.discountPrice || item.product.price) * item.quantity)}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '8px', fontWeight: 'bold' }}>
            Total Amount: ₹{formatCurrency(total)}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ShoppingCart; 