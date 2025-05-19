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

  const fetchCartItems = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await cartService.getCartItems();
      
      if (response && response.status === 'success') {
        let items = response.data.items || [];
        
        // Debug log cart items to see if images are coming through
        console.log(`Received ${items.length} cart items from API`);
        
        // Filter out items with null product to avoid errors
        const validItems = items.filter(item => item && item.product);
        
        if (validItems.length < items.length) {
          console.warn(`Filtered out ${items.length - validItems.length} invalid cart items with null products`);
        }
        
        // Safely log the valid items
        if (validItems.length > 0) {
          validItems.forEach((item, index) => {
            console.log(`Cart item ${index + 1}:`, {
              productId: item.product?._id,
              name: item.product?.name || 'Unknown Product',
              hasProductImage: !!item.productImage,
              hasProductImageInItem: item.productImage ? 'Yes' : 'No',
              imagePreview: item.productImage ? 
                item.productImage.substring(0, 30) + '...' : 'No direct image',
              hasImageInProduct: item.product?.image ? 'Yes' : 'No'
            });
          });
        } else {
          console.log('No valid cart items found');
        }
        
        setCartItems(validItems);
        
        // Reset coupon and shipping when cart changes
        setDiscount(0);
        setCouponMessage({ text: '', type: '' });
        setCouponCode('');
      } else {
        throw new Error(response?.message || 'Failed to fetch cart items');
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      
      // Try to retry up to 2 times if it's a server error
      if (retryCount < 2 && err.status === 500) {
        console.log(`Retrying cart fetch (attempt ${retryCount + 1})...`);
        // Wait 1 second before retrying
        setTimeout(() => {
          fetchCartItems(retryCount + 1);
        }, 1000);
        return;
      }
      
      // Provide a friendlier error message
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        'Failed to load your cart. Please try again later.';
      
      setError(errorMessage);
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
        setCartItems(cartItems.filter(item => item.product && item.product._id === productId));
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
    const item = cartItems.find(item => item.product && item.product._id === productId);
    if (!item) {
      console.error(`Item with product ID ${productId} not found in cart`);
      message.error('Cannot update item - not found in cart');
      return;
    }
    
    if (item && item.product && newQuantity > item.product.stock) {
      message.warning(`Only ${item.product.stock} items available in stock`);
      return;
    }
    
    try {
      const response = await cartService.updateCartItem(productId, newQuantity);
      
      if (response && response.status === 'success') {
        // Update local state without refetching
        setCartItems(cartItems.map(item => 
          (item.product && item.product._id === productId)
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
  const proceedToPayment = async () => {
    try {
      message.success('Preparing payment...');
      setCheckoutModalVisible(false);
      
      // Get a lightweight version of cart data from the server
      let paymentData;
      
      try {
        console.log('Trying to get lightweight cart data...');
        const response = await cartService.getLightweightCartData();
        
        if (response && response.status === 'success' && response.data) {
          console.log('Successfully received lightweight cart data');
          paymentData = response.data;
        } else {
          throw new Error('Failed to get lightweight cart data');
        }
      } catch (lightweightError) {
        console.error('Error getting lightweight cart data:', lightweightError);
        console.log('Falling back to calculating cart data locally');
        
        // Fallback to calculating locally
        const totals = calculateTotals();
        
        // Pass cart data to payment page via state
        paymentData = {
          items: cartItems,
          totals: totals,
          couponDiscount: discount,
          shippingCost: shippingCost
        };
      }
      
      console.log('Saving payment data:', paymentData);
      
      // Save payment data (service will handle DB vs localStorage)
      const response = await cartService.savePaymentData(paymentData);
      
      if (response && response.status === 'success') {
        console.log('Payment data saved successfully');
        message.success('Redirecting to payment...');
        // Redirect to payment page
        window.location.href = '/payment';
      } else {
        throw new Error('Failed to save payment data');
      }
    } catch (error) {
      console.error('Error in payment process:', error);
      message.error('Failed to proceed to payment. Please try again.');
    }
  };

  // Calculate cart totals
  const calculateTotals = () => {
    if (!cartItems.length) return { subtotal: 0, discountAmount: 0, shipping: 0, total: 0 };
    
    const subtotal = cartItems.reduce((sum, item) => {
      if (!item.product) return sum;
      const price = item.product.discountPrice || item.product.price || 0;
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
            {cartItems.map((item, index) => {
              // Skip rendering if product is null
              if (!item || !item.product) {
                console.warn('Skipping cart item with null product');
                return null;
              }
              
              return (
                <div 
                  key={item.product._id || `item-${index}`} 
                  className="cart-item" 
                  style={{ '--item-index': index }}
                >
                  {/* Product Image */}
                  <div className="cart-item-image">
                    <img 
                      src={
                        // Try multiple sources for the image
                        (item.productImage) || // First try the stored image in cart
                        (item.product.image && item.product.image.url) || // Then product.image.url
                        (typeof item.product.image === 'string' ? item.product.image : null) || // If image is a string
                        (item.product.images && item.product.images.length > 0 ? 
                          (item.product.images[0].url || item.product.images[0]) : null) || // Images array
                        `${import.meta.env.VITE_API_URL || 'http://https://fresh-connect-backend.onrender.com'}/api/products/image/${item.product._id}` // API fallback
                      }
                      alt={item.product.name || 'Product'}
                      onLoad={() => console.log(`Image loaded successfully for product ${item.product._id} from cart`)}
                      onError={(e) => {
                        console.log(`Image load error for cart item ${item.product._id}`);
                        console.log(`Image sources tried: 
                          productImage: ${item.productImage ? 'Available' : 'Not available'}
                          product.image.url: ${item.product.image && item.product.image.url ? 'Available' : 'Not available'}
                          product.image string: ${typeof item.product.image === 'string' ? 'Available' : 'Not available'}
                          product.images[0]: ${item.product.images && item.product.images.length > 0 ? 'Available' : 'Not available'}
                        `);
                        
                        e.target.onerror = null; // Prevent infinite callbacks
                        
                        // Use category-specific placeholders if possible
                        const category = item.productCategory || item.product.category;
                        if (category) {
                          const categoryLower = category.toLowerCase();
                          if (categoryLower.includes('vegetable') || categoryLower === 'vegetables') {
                            e.target.src = 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80';
                          } else if (categoryLower.includes('fruit') || categoryLower === 'fruits') {
                            e.target.src = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80';
                          } else if (categoryLower.includes('herb') || categoryLower === 'herbs') {
                            e.target.src = 'https://images.unsplash.com/photo-1556646781-a84ff68f54ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80';
                          } else {
                            e.target.src = 'https://via.placeholder.com/400x400?text=Product+Image';
                          }
                        } else {
                          e.target.src = 'https://via.placeholder.com/400x400?text=Product+Image';
                        }
                      }}
                    />
                    {/* Show discount badge if applicable */}
                    {item.product.discountPrice && item.product.price && item.product.discountPrice < item.product.price && (
                      <div className="cart-item-discount-badge">
                        {Math.round(((item.product.price - item.product.discountPrice) / item.product.price) * 100)}% OFF
                      </div>
                    )}
                  </div>
                  
                  <div className="cart-item-details">
                    <div>
                      <h3 className="cart-item-name">{item.product.name || 'Unknown Product'}</h3>
                      <p className="cart-item-seller">Seller: {item.product.seller?.name || item.productSeller || "Unknown"}</p>
                      
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
                          title="Decrease quantity"
                        >
                          <MinusOutlined />
                        </button>
                        <input 
                          className="quantity-input"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value > 0 && value <= (item.productStock || item.product.stock || 99)) {
                              handleUpdateQuantity(item.product._id, value);
                            }
                          }}
                          type="number"
                          min="1"
                          max={item.productStock || item.product.stock || 99}
                        />
                        <button 
                          className="quantity-btn"
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                          disabled={item.quantity >= (item.productStock || item.product.stock || 99)}
                          title="Increase quantity"
                        >
                          <PlusOutlined />
                        </button>
                      </div>
                      
                      {/* Stock information */}
                      <div className="stock-info">
                        {(item.productStock || item.product.stock) <= 5 ? (
                          <span className="low-stock-warning">
                            Only {item.productStock || item.product.stock} left in stock
                          </span>
                        ) : (
                          <span className="in-stock">
                            In Stock: {item.productStock || item.product.stock}
                          </span>
                        )}
                      </div>
                      
                      <button 
                        className="remove-item"
                        onClick={() => handleRemoveItem(item.product._id)}
                        title="Remove from cart"
                      >
                        <DeleteOutlined /> Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="cart-item-price">
                    {item.product.discountPrice ? (
                      <>
                        <span className="original-price">₹{formatCurrency(item.product.price || 0)}</span>
                        <span className="current-price">₹{formatCurrency(item.product.discountPrice || 0)}</span>
                      </>
                    ) : (
                      <span className="current-price">₹{formatCurrency(item.product.price || 0)}</span>
                    )}
                    
                    <span className="item-total-price">
                      Total: ₹{formatCurrency(((item.product.discountPrice || item.product.price || 0) * item.quantity))}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Order Summary */}
          <div className="cart-summary">
            <h2 className="summary-header">Order Summary</h2>
            
            <div className="summary-section">
              <div className="summary-row">
                <span className="summary-label">Subtotal ({totalItems} items)</span>
                <span className="summary-value">₹{formatCurrency(subtotal)}</span>
              </div>
              
              {discount > 0 && (
                <div className="summary-row discount-row">
                  <span className="summary-label">
                    <span className="discount-badge">{discount}% OFF</span>
                    Discount
                  </span>
                  <span className="summary-value discount">-₹{formatCurrency(discountAmount)}</span>
                </div>
              )}
              
              <div className="summary-row">
                <span className="summary-label">Shipping</span>
                <span className="summary-value">
                  {shipping === 0 && subtotal > 0 ? (
                    <span className="free-shipping">Free</span>
                  ) : (
                    `₹${formatCurrency(shipping)}`
                  )}
                </span>
              </div>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-row total">
              <span className="summary-label">Total</span>
              <span className="summary-value grand-total">₹{formatCurrency(total)}</span>
            </div>
            
            {subtotal > 0 && subtotal < freeShippingThreshold && (
              <div className="free-shipping-progress">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${(subtotal / freeShippingThreshold) * 100}%` 
                  }}
                ></div>
                <div className="shipping-message">
                  <span className="shipping-icon">🚚</span>
                  Add ₹{formatCurrency(freeShippingThreshold - subtotal)} more to qualify for free shipping
                </div>
              </div>
            )}
            
            {/* Checkout and Continue Shopping Buttons */}
            <div className="summary-buttons">
              <button 
                className="checkout-button"
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </button>
              
              {/* Coupon Input */}
              <div className="coupon-section">
                <div className="coupon-header">
                  <h3>Have a Promo Code?</h3>
                  {couponMessage.text && (
                    <p className={`coupon-message ${couponMessage.type}`}>
                      {couponMessage.type === 'success' && <CheckCircleOutlined />} {couponMessage.text}
                    </p>
                  )}
                </div>
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
              </div>
              
              {/* Shipping Calculation */}
              <div className="shipping-calc-section">
                <h3>Estimate Shipping</h3>
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
              
              <Link to="/products" className="continue-shopping">
                <LeftOutlined /> Continue Shopping
              </Link>
            </div>
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