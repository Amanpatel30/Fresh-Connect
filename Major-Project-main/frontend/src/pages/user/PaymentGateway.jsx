import React, { useState, useEffect } from 'react';
import {
  Card, Steps, Typography, Form, Input, Button, Radio, Space,
  Divider, Row, Col, List, Avatar, Tag, Checkbox, Alert,
  Descriptions, Spin, Result, Modal, Collapse, notification
} from 'antd';
import {
  CreditCardOutlined, BankOutlined, WalletOutlined,
  LockOutlined, CheckCircleOutlined, DollarOutlined,
  ShoppingCartOutlined, InfoCircleOutlined, UserOutlined,
  HomeOutlined, PhoneOutlined, EnvironmentOutlined,
  QuestionCircleOutlined, MailOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import { createOrder, createTestOrder } from '../../services/api';
import api, { getCurrentUser } from '../../services/api';
import * as cartService from '../../services/cartService';
import { createPaymentTransaction } from '../../services/paymentService';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Panel } = Collapse;

const PaymentGateway = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderDetails, setOrderDetails] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardForm] = Form.useForm();
  const [upiForm] = Form.useForm();
  const [netBankingForm] = Form.useForm();
  const [walletForm] = Form.useForm();
  const [codForm] = Form.useForm();
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [addressForm] = Form.useForm();
  const [nameValidation, setNameValidation] = useState({ validateStatus: '', help: '' });
  const [phoneValidation, setPhoneValidation] = useState({ validateStatus: '', help: '' });
  const [addressValidation, setAddressValidation] = useState({ validateStatus: '', help: '' });
  const [cityValidation, setCityValidation] = useState({ validateStatus: '', help: '' });
  const [stateValidation, setStateValidation] = useState({ validateStatus: '', help: '' });
  const [pincodeValidation, setPincodeValidation] = useState({ validateStatus: '', help: '' });

  useEffect(() => {
    // Load cart data from database or localStorage fallback
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get payment data from database first
        let cartData = null;
        try {
          console.log('Attempting to retrieve payment data from database');
          const paymentDataResponse = await cartService.getPaymentData();
          
          if (paymentDataResponse && paymentDataResponse.status === 'success' && 
              paymentDataResponse.data && paymentDataResponse.data.paymentData) {
            cartData = paymentDataResponse.data.paymentData;
            console.log('Successfully retrieved payment data from database:', cartData);
          } else {
            console.log('No valid payment data found in database response');
          }
        } catch (dbError) {
          console.error('Error retrieving payment data from database:', dbError);
          
          // Try localStorage fallback
          try {
            console.log('Trying localStorage fallback');
            const paymentDataString = localStorage.getItem('paymentData');
            
            if (paymentDataString) {
              cartData = JSON.parse(paymentDataString);
              console.log('Retrieved payment data from localStorage fallback:', cartData);
            } else {
              console.log('No payment data found in localStorage');
            }
          } catch (localStorageError) {
            console.error('Error retrieving from localStorage:', localStorageError);
          }
        }
        
        // If no cart data in database or localStorage, try to fetch directly from API
        if (!cartData || !cartData.items || cartData.items.length === 0) {
          console.log('No payment data found, fetching from API...');
          
          try {
            const cartResponse = await cartService.getCartItems();
            if (cartResponse && cartResponse.status === 'success' && cartResponse.data.items.length > 0) {
              const items = cartResponse.data.items;
              const subtotal = items.reduce((sum, item) => {
                const price = item.product.discountPrice || item.product.price;
                return sum + (price * item.quantity);
              }, 0);
              
              cartData = {
                items: items,
                totals: {
                  subtotal: subtotal,
                  discountAmount: 0,
                  shipping: 50,
                  total: subtotal + 50
                },
                couponDiscount: 0,
                shippingCost: 50
              };
              console.log('Created payment data from API cart:', cartData);
              
              // Save this data for later use
              try {
                const saveResponse = await cartService.savePaymentData(cartData);
                console.log('Auto-saved payment data:', saveResponse);
              } catch (saveError) {
                console.warn('Could not auto-save payment data:', saveError);
              }
            } else {
              console.warn('Failed to get cart items from API or cart is empty');
              // Show a user-friendly message
              message.warning('Your cart appears to be empty. Please add items to your cart before proceeding to payment.');
            }
          } catch (error) {
            console.error('Error fetching cart from API:', error);
            // Show a user-friendly message
            message.error('Failed to fetch your cart. Please try again or contact support.');
          }
        }
        
        // If we have cart data, use it
        if (cartData && cartData.items && cartData.items.length > 0) {
          // Transform cart data into order details
          const orderItems = cartData.items.map(item => ({
            id: item.product._id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.discountPrice || item.product.price,
            image: item.productImage || (item.product.images && item.product.images.length > 0 ? item.product.images[0].url : 'https://via.placeholder.com/80x80'),
            seller: item.product.seller || 'Unknown Seller'
          }));
          
          const mockOrderDetails = {
            items: orderItems,
            subtotal: cartData.totals.subtotal,
            deliveryFee: cartData.totals.shipping,
            tax: cartData.totals.subtotal * 0.10, // Assume 10% tax
            total: cartData.totals.total,
            discount: cartData.couponDiscount || 0
          };
          
          setOrderDetails(mockOrderDetails);
        } else {
          // Offer user to return to shopping
          message.warning('No items found in your cart. Please add items before checkout.');
          
          // Optional: redirect to products page after a delay
          setTimeout(() => {
            window.location.href = '/products';
          }, 3000);
        }

        // Load user addresses
        try {
          const addressResponse = await api.get('/user/addresses');
          if (addressResponse && addressResponse.data && addressResponse.data.status === 'success') {
            const addresses = addressResponse.data.data;
            setAddresses(addresses);
            setSelectedAddress(addresses.find(addr => addr.isDefault) || addresses[0]);
          } else {
            // Fallback to mock addresses
            const mockAddresses = [
              {
                id: 1,
                name: 'John Doe',
                phone: '+91 98765 43210',
                address: '123 Main St, Apartment 4B',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
                isDefault: true
              }
            ];
            setAddresses(mockAddresses);
            setSelectedAddress(mockAddresses[0]);
          }
        } catch (error) {
          console.error('Error fetching addresses:', error);
          // Fallback to mock addresses
          const mockAddresses = [
            {
              id: 1,
              name: 'John Doe',
              phone: '+91 98765 43210',
              address: '123 Main St, Apartment 4B',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001',
              isDefault: true
            }
          ];
          setAddresses(mockAddresses);
          setSelectedAddress(mockAddresses[0]);
        }

        // Load saved cards - only use mock data here since we don't store real cards
        const mockSavedCards = [
          {
            id: 1,
            cardNumber: '**** **** **** 1234',
            cardHolder: 'John Doe',
            expiryDate: '12/25',
            cardType: 'visa'
          },
          {
            id: 2,
            cardNumber: '**** **** **** 5678',
            cardHolder: 'John Doe',
            expiryDate: '09/24',
            cardType: 'mastercard'
          }
        ];
        setSavedCards(mockSavedCards);
        
        setLoading(false);
      } catch (error) {
        console.error('Error in payment gateway setup:', error);
        setLoading(false);
        message.error('Failed to load payment information. Please try again or contact support.');
      }
    };

    fetchData();
  }, []);

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setSelectedCard(null);
  };

  const handleCardSelect = (card) => {
    setSelectedCard(card);
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handlePayment = async () => {
    // Set processing immediately to prevent duplicate clicks
    setProcessingPayment(true);
    
    try {
      // Check if payment data exists
      if (!orderDetails || !selectedAddress) {
        message.error('Please complete all required fields before proceeding');
        setProcessingPayment(false);
            return;
      }

      console.log('Processing payment with method:', paymentMethod);
      
      // Get user information
      const user = getCurrentUser();
      if (!user && paymentMethod !== 'cod') {
        message.error('You must be logged in to make a payment');
        setProcessingPayment(false);
        return;
      }
      
      // Display spinner during processing with top-level message
      message.loading({ 
        content: 'Processing your payment...', 
        key: 'paymentProcessing', 
        duration: 0 
      });

      // Extract seller ID from order details or items
      let sellerId = orderDetails.sellerId || null;
      console.log('Initial sellerId from orderDetails:', sellerId || 'none');
      
      // If no sellerId yet, try to get it from first product
      if (!sellerId && orderDetails.items && orderDetails.items.length > 0) {
        const firstItem = orderDetails.items[0];
        console.log('Checking first item for seller information:', 
          firstItem.id || firstItem._id || 'unknown ID', 
          'isUrgent:', firstItem.product?.isUrgent || false);
        
        // Try different possible locations for seller information
        if (firstItem.product && firstItem.product.seller) {
          sellerId = firstItem.product.seller;
          console.log(`Found seller in item.product.seller: ${sellerId}`);
        } else if (firstItem.productSellerId) {
          sellerId = firstItem.productSellerId;
          console.log(`Found seller in item.productSellerId: ${sellerId}`);
        } else if (firstItem.seller) {
          sellerId = firstItem.seller;
          console.log(`Found seller in item.seller: ${sellerId}`);
        } else if (firstItem.product && firstItem.product.isUrgent) {
          // For urgent sale products, make a special attempt to fetch seller info
          console.log('Item is from urgent sale, making extra attempt to extract seller ID');
          try {
            // For UrgentSale products, the seller ID might be in different property
            if (firstItem.product._id) {
              const urgentSaleId = firstItem.product._id.toString();
              console.log(`Will attempt to fetch UrgentSale details for: ${urgentSaleId}`);
              
              // Log full item details for debugging
              console.log('Complete item details:', JSON.stringify(firstItem, null, 2));
            }
          } catch (err) {
            console.error('Error extracting seller ID from urgent sale product:', err);
          }
        }
        
        if (sellerId) {
          console.log(`Successfully extracted sellerId: ${sellerId}`);
        } else {
          console.warn('No seller ID found in any items. Order may not appear in seller panel.');
          console.log('First item details:', JSON.stringify(firstItem, null, 2).substring(0, 500));
        }
      }

      // Prepare order data with all necessary fields
      const orderData = {
        user: user?._id,
        seller: sellerId,
        
        // Order items
        items: orderDetails.items.map(item => {
          return {
            product: item.id || item._id,
            quantity: item.quantity,
            name: item.name,
            price: item.price,
            image: item.image
          };
        }),
        
        // Shipping details
        shippingAddress: {
          fullName: selectedAddress.name,
          address: selectedAddress.address,
          city: selectedAddress.city,
          postalCode: selectedAddress.pincode,
          state: selectedAddress.state,
          country: 'India',
          phone: selectedAddress.phone
        },
        
        // Payment details
        paymentMethod: paymentMethod,
        paymentInfo: {
          id: `PAYMENT${Date.now()}`,
          status: 'completed',
          method: paymentMethod,
          amount: orderDetails.total,
          currency: 'INR',
          paidAt: new Date().toISOString()
        },
        
        // Price breakdown
        itemsPrice: orderDetails.subtotal,
        taxPrice: orderDetails.tax,
        shippingPrice: orderDetails.deliveryFee,
        totalAmount: orderDetails.total,
        
        // Set as paid or pending based on payment method
        isPaid: paymentMethod !== 'cod',
        paidAt: paymentMethod !== 'cod' ? new Date().toISOString() : null,
        status: paymentMethod !== 'cod' ? 'processing' : 'pending'
      };

      // Create the order
      console.log('Submitting order to backend:', orderData);
      
      try {
        // Try to create a real order
        const response = await createOrder(orderData);
        
        if (response && response.data) {
          console.log('Order created successfully:', response.data);
          
          // Close the loading message
          message.destroy('paymentProcessing');
          
          // Create payment transaction record
          try {
            // Generate transaction ID
            const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
            
            // Prepare transaction data
            const transactionData = {
              user: user?._id,
              sellerId: sellerId,
              transactionId: transactionId,
              amount: orderDetails.total,
              fee: 0, // Can be calculated if needed
              netAmount: orderDetails.total,
              type: 'purchase',
              status: paymentMethod !== 'cod' ? 'completed' : 'pending',
              date: new Date().toISOString(),
              order: {
                orderId: response.data._id || response.data.data?._id,
                orderNumber: response.data.orderNumber || response.data.data?.orderNumber,
                totalAmount: orderDetails.total
              },
              paymentMethod: paymentMethod,
              paymentDetails: {
                // Include appropriate payment details based on method
                ...(paymentMethod === 'card' && { 
                  card: {
                    last4: '1234', // This would be the actual card info in real implementation
                    brand: 'visa'
                  }
                }),
                ...(paymentMethod === 'upi' && {
                  upi: { id: 'upi_reference' }
                }),
                ...(paymentMethod === 'wallet' && {
                  wallet: { provider: 'paytm' }
                })
              },
              description: `Payment for order ${response.data.orderNumber || response.data.data?.orderNumber}`,
              currency: 'INR'
            };
            
            console.log('Creating transaction record for payment:', transactionData);
            const txResponse = await createPaymentTransaction(transactionData);
            console.log('Payment transaction created:', txResponse);
          } catch (txError) {
            // Don't fail the order if transaction record creation fails
            console.error('Error creating payment transaction record:', txError);
          }
          
          // Clear the shopping cart
          await cartService.clearCart();
          
          // Clean up both database and localStorage data
          try {
            await api.delete('/user/session/payment-data');
            console.log('Payment data cleared from database');
          } catch (apiError) {
            console.warn('Could not clear payment data from API:', apiError);
          }
          
          // Always clear localStorage as a fallback
          try {
            localStorage.removeItem('paymentData');
            console.log('Payment data cleared from localStorage');
          } catch (localStorageError) {
            console.warn('Error clearing localStorage:', localStorageError);
          }
          
          // Save the order to localStorage to ensure it's available for viewing
          try {
            // Store order in localStorage for offline/fallback viewing
            const ordersFromStorage = JSON.parse(localStorage.getItem('orderHistory') || '[]');
            const orderToSave = {
              ...response.data.data || response.data,
              createdAt: new Date().toISOString()
            };
            ordersFromStorage.unshift(orderToSave); // Add to beginning of array
            localStorage.setItem('orderHistory', JSON.stringify(ordersFromStorage));
          } catch (storageError) {
            console.warn('Error saving order to localStorage:', storageError);
          }
          
          setPaymentComplete(true);
          
          // Check if this was an emergency order
          if (response.isEmergencyOrder) {
            // Display a special message for emergency orders
            notification.warning({
              message: 'Emergency Order Created',
              description: `Your order was created in emergency mode. Please save your order number: ${response.data.data?.orderNumber || response.data.orderNumber || 'Unknown'}`,
              duration: 0, // Don't auto-close
              placement: 'topRight'
            });
            message.success('Order processed in emergency mode. Please save your order number!');
          } else {
          message.success('Payment successful! Your order has been placed.');
          }
          
          // Redirect to confirmation page after 2 seconds
          setTimeout(() => {
            navigate('/profile?tab=orders');
          }, 2000);
          
          return;
        } else {
          throw new Error('Failed to create order - no data returned');
        }
      } catch (orderError) {
        // Close the loading message
        message.destroy('paymentProcessing');
        
        console.error('Error creating order through API:', orderError);
        // Log detailed error information to help diagnose the issue
        if (orderError.response) {
          console.error('Error response details:', {
            status: orderError.response.status,
            statusText: orderError.response.statusText,
            data: orderError.response.data
          });
        }
        
        // Display error to user
        notification.error({
          message: 'Order Creation Failed',
          description: 'There was a problem creating your order. Please try again or contact support.',
          duration: 0
        });
        
        // Re-enable the payment button so user can try again
        setProcessingPayment(false);
        return;
      }
    } catch (error) {
      // Close the loading message
      message.destroy('paymentProcessing');
      
      console.error('Unexpected error during payment:', error);
      
      // Show error to user
      notification.error({
        message: 'Payment Processing Error',
        description: 'An unexpected error occurred. Please try again or contact support.',
        duration: 0
      });
      
      // Re-enable the payment button
      setProcessingPayment(false);
    }
  };

  const handleCardPayment = async (values) => {
    console.log('Card payment values:', values);
    handlePayment();
  };

  const handleUpiPayment = async (values) => {
    console.log('UPI payment values:', values);
    handlePayment();
  };

  const handleNetBankingPayment = async (values) => {
    console.log('Net Banking payment values:', values);
    handlePayment();
  };

  const handleWalletPayment = async (values) => {
    console.log('Wallet payment values:', values);
    handlePayment();
  };

  const handleCodPayment = async (values) => {
    console.log('COD payment values:', values);
    handlePayment();
  };

  const handleOrderComplete = async () => {
    try {
      // Clear cart
      await cartService.clearCart();
      
      // Clean up both database and localStorage data
      try {
        await api.delete('/user/session/payment-data');
        console.log('Payment data cleared from database');
      } catch (apiError) {
        console.warn('Could not clear payment data from API:', apiError);
      }
      
      // Always clear localStorage as a fallback
      try {
        localStorage.removeItem('paymentData');
        console.log('Payment data cleared from localStorage');
      } catch (localStorageError) {
        console.warn('Error clearing localStorage:', localStorageError);
      }
      
      // Create mock order for testing/demo purposes
      try {
        // ... rest of the existing code
      } catch (error) {
        console.error('Error completing order:', error);
        // Still navigate to success page even if there's an error clearing data
        navigate('/order-success');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      // Still navigate to success page even if there's an error clearing data
      navigate('/order-success');
    }
  };

  // Add validation functions
  const validateName = (value) => {
    if (!value) {
      setNameValidation({ validateStatus: 'error', help: 'Please enter your name' });
      return false;
    } else if (value.length < 3) {
      setNameValidation({ validateStatus: 'error', help: 'Name must be at least 3 characters' });
      return false;
    } else if (!/^[A-Za-z\s]+$/.test(value)) {
      setNameValidation({ validateStatus: 'error', help: 'Name should only contain letters and spaces' });
      return false;
    } else {
      setNameValidation({ validateStatus: 'success', help: '' });
      return true;
    }
  };

  const validatePhone = (value) => {
    if (!value) {
      setPhoneValidation({ validateStatus: 'error', help: 'Please enter your phone number' });
      return false;
    } else if (!/^(\+\d{1,3}\s?)?(\d{10})$/.test(value.replace(/\s/g, ''))) {
      setPhoneValidation({ validateStatus: 'error', help: 'Please enter a valid phone number' });
      return false;
    } else {
      setPhoneValidation({ validateStatus: 'success', help: '' });
      return true;
    }
  };

  const validateAddress = (value) => {
    if (!value) {
      setAddressValidation({ validateStatus: 'error', help: 'Please enter your address' });
      return false;
    } else if (value.length < 5) {
      setAddressValidation({ validateStatus: 'error', help: 'Address must be at least 5 characters' });
      return false;
    } else {
      setAddressValidation({ validateStatus: 'success', help: '' });
      return true;
    }
  };

  const validateCity = (value) => {
    if (!value) {
      setCityValidation({ validateStatus: 'error', help: 'Please enter your city' });
      return false;
    } else if (value.length < 2) {
      setCityValidation({ validateStatus: 'error', help: 'City must be at least 2 characters' });
      return false;
    } else if (!/^[A-Za-z\s]+$/.test(value)) {
      setCityValidation({ validateStatus: 'error', help: 'City should only contain letters and spaces' });
      return false;
    } else {
      setCityValidation({ validateStatus: 'success', help: '' });
      return true;
    }
  };

  const validateState = (value) => {
    if (!value) {
      setStateValidation({ validateStatus: 'error', help: 'Please enter your state' });
      return false;
    } else if (value.length < 2) {
      setStateValidation({ validateStatus: 'error', help: 'State must be at least 2 characters' });
      return false;
    } else if (!/^[A-Za-z\s]+$/.test(value)) {
      setStateValidation({ validateStatus: 'error', help: 'State should only contain letters and spaces' });
      return false;
    } else {
      setStateValidation({ validateStatus: 'success', help: '' });
      return true;
    }
  };

  const validatePincode = (value) => {
    if (!value) {
      setPincodeValidation({ validateStatus: 'error', help: 'Please enter your pincode' });
      return false;
    } else if (!/^\d{6}$/.test(value)) {
      setPincodeValidation({ validateStatus: 'error', help: 'Pincode must be 6 digits' });
      return false;
    } else {
      setPincodeValidation({ validateStatus: 'success', help: '' });
      return true;
    }
  };

  // Reset all validations when modal opens/closes
  const resetValidations = () => {
    setNameValidation({ validateStatus: '', help: '' });
    setPhoneValidation({ validateStatus: '', help: '' });
    setAddressValidation({ validateStatus: '', help: '' });
    setCityValidation({ validateStatus: '', help: '' });
    setStateValidation({ validateStatus: '', help: '' });
    setPincodeValidation({ validateStatus: '', help: '' });
  };

  // Update handleAddAddress to validate all fields before submitting
  const handleAddAddress = async (values) => {
    // Update code to validate all fields
    const isNameValid = validateName(values.name);
    const isPhoneValid = validatePhone(values.phone);
    const isAddressValid = validateAddress(values.address);
    const isCityValid = validateCity(values.city);
    const isStateValid = validateState(values.state);
    const isPincodeValid = validatePincode(values.pincode);

    if (isNameValid && isPhoneValid && isAddressValid && isCityValid && isStateValid && isPincodeValid) {
      // Existing code to handle address submission
      try {
        // In a real app, this would be an API call
        const newAddress = {
          id: addresses.length + 1,
          ...values,
          isDefault: false
        };
        
        // Add the new address to the array
        const updatedAddresses = [...addresses, newAddress];
        setAddresses(updatedAddresses);
        
        // Select the new address automatically
        setSelectedAddress(newAddress);
        
        // Close the modal and reset form
        setAddressModalVisible(false);
        resetValidations();
        addressForm.resetFields();
        
        // Show success message
        message.success('New address added successfully');
      } catch (error) {
        console.error('Error adding address:', error);
        message.error('Failed to add new address');
      }
    }
  };

  const renderAddressSelection = () => (
    <div>
      <Title level={4}>Select Delivery Address</Title>
      <List
        dataSource={addresses}
        renderItem={(address) => (
          <List.Item
            onClick={() => handleAddressSelect(address)}
            className={`cursor-pointer border p-4 rounded mb-4 ${selectedAddress?.id === address.id ? 'border-primary bg-blue-50' : ''}`}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<HomeOutlined />} />}
              title={
                <Space>
                  <Text strong>{address.name}</Text>
                  {address.isDefault && <Tag color="blue">Default</Tag>}
                </Space>
              }
              description={
                <Space direction="vertical">
                  <Text><PhoneOutlined className="mr-2" />{address.phone}</Text>
                  <Text>
                    <EnvironmentOutlined className="mr-2" />
                    {address.address}, {address.city}, {address.state} - {address.pincode}
                  </Text>
                </Space>
              }
            />
            <Radio checked={selectedAddress?.id === address.id} />
          </List.Item>
        )}
      />
      <div className="flex justify-between mt-4">
        <Button onClick={() => {
          setAddressModalVisible(true);
          resetValidations();
          addressForm.resetFields();
        }}>Add New Address</Button>
        <Button type="primary" onClick={handleNext} disabled={!selectedAddress}>
          Deliver to this Address
        </Button>
      </div>
      
      {/* Address Modal */}
      <Modal
        title="Add New Address"
        open={addressModalVisible}
        onCancel={() => setAddressModalVisible(false)}
        footer={null}
      >
        <Form
          form={addressForm}
          layout="vertical"
          onFinish={handleAddAddress}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Full Name"
                validateStatus={nameValidation.validateStatus}
                help={nameValidation.help}
                rules={[{ required: true, message: 'Please enter your name' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="John Doe" 
                  onChange={(e) => validateName(e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="phone"
                label="Phone Number"
                validateStatus={phoneValidation.validateStatus}
                help={phoneValidation.help}
                rules={[{ required: true, message: 'Please enter your phone number' }]}
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  placeholder="+91 98765 43210" 
                  onChange={(e) => validatePhone(e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="address"
                label="Address"
                validateStatus={addressValidation.validateStatus}
                help={addressValidation.help}
                rules={[{ required: true, message: 'Please enter your address' }]}
              >
                <Input.TextArea 
                  placeholder="Street address, apartment, etc." 
                  rows={2} 
                  onChange={(e) => validateAddress(e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="city"
                label="City"
                validateStatus={cityValidation.validateStatus}
                help={cityValidation.help}
                rules={[{ required: true, message: 'Please enter city' }]}
              >
                <Input 
                  placeholder="Mumbai" 
                  onChange={(e) => validateCity(e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="state"
                label="State"
                validateStatus={stateValidation.validateStatus}
                help={stateValidation.help}
                rules={[{ required: true, message: 'Please enter state' }]}
              >
                <Input 
                  placeholder="Maharashtra" 
                  onChange={(e) => validateState(e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="pincode"
                label="Pincode"
                validateStatus={pincodeValidation.validateStatus}
                help={pincodeValidation.help}
                rules={[{ required: true, message: 'Please enter pincode' }]}
              >
                <Input 
                  placeholder="400001" 
                  onChange={(e) => validatePincode(e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <div className="flex justify-end space-x-4">
              <Button onClick={() => {
                setAddressModalVisible(false);
                resetValidations();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Add Address
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );

  const renderPaymentMethods = () => (
    <div>
      <Title level={4}>Select Payment Method</Title>
      <Radio.Group
        onChange={handlePaymentMethodChange}
        value={paymentMethod}
        className="w-full"
      >
        <Space direction="vertical" className="w-full">
          <Card className={`mb-4 ${paymentMethod === 'card' ? 'border-primary' : ''}`}>
            <Radio value="card">
              <Space>
                <CreditCardOutlined />
                <span>Credit / Debit Card</span>
              </Space>
            </Radio>
            {paymentMethod === 'card' && (
              <div className="mt-4 ml-6">
                {savedCards.length > 0 && (
                  <div className="mb-4">
                    <Text strong>Saved Cards</Text>
                    <List
                      dataSource={savedCards}
                      renderItem={(card) => (
                        <List.Item
                          onClick={() => handleCardSelect(card)}
                          className={`cursor-pointer border p-2 rounded mb-2 ${selectedCard?.id === card.id ? 'border-primary bg-blue-50' : ''}`}
                        >
                          <List.Item.Meta
                            avatar={<CreditCardOutlined />}
                            title={card.cardNumber}
                            description={`${card.cardHolder} | Expires: ${card.expiryDate}`}
                          />
                          <Radio checked={selectedCard?.id === card.id} />
                        </List.Item>
                      )}
                    />
                    <Divider>Or Use a New Card</Divider>
                  </div>
                )}
                <Form
                  form={cardForm}
                  layout="vertical"
                  onFinish={handleCardPayment}
                  disabled={selectedCard !== null}
                >
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        name="cardNumber"
                        label="Card Number"
                        rules={[
                          { required: true, message: 'Please enter card number' },
                          { pattern: /^[0-9]{13,19}$/, message: 'Invalid card number format' }
                        ]}
                      >
                        <Input
                          prefix={<CreditCardOutlined />}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="expiryDate"
                        label="Expiry Date (MM/YY)"
                        rules={[
                          { required: true, message: 'Please enter expiry date' },
                          { pattern: /^(0[1-9]|1[0-2])\/([0-9]{2})$/, message: 'Format: MM/YY' }
                        ]}
                      >
                        <Input placeholder="MM/YY" maxLength={5} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="cvv"
                        label="CVV"
                        rules={[
                          { required: true, message: 'Please enter CVV' },
                          { pattern: /^[0-9]{3,4}$/, message: 'Invalid CVV' }
                        ]}
                      >
                        <Input
                          prefix={<LockOutlined />}
                          placeholder="123"
                          maxLength={4}
                          type="password"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        name="cardHolder"
                        label="Card Holder Name"
                        rules={[{ required: true, message: 'Please enter card holder name' }]}
                      >
                        <Input
                          prefix={<UserOutlined />}
                          placeholder="John Doe"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </div>
            )}
          </Card>

          <Card className={`mb-4 ${paymentMethod === 'upi' ? 'border-primary' : ''}`}>
            <Radio value="upi">
              <Space>
                <BankOutlined />
                <span>UPI</span>
              </Space>
            </Radio>
            {paymentMethod === 'upi' && (
              <div className="mt-4 ml-6">
                <Form
                  form={upiForm}
                  layout="vertical"
                  onFinish={handleUpiPayment}
                >
                  <Form.Item
                    name="upiId"
                    label="UPI ID"
                    rules={[{ required: true, message: 'Please enter UPI ID' }]}
                  >
                    <Input placeholder="username@upi" />
                  </Form.Item>
                </Form>
              </div>
            )}
          </Card>

          <Card className={`mb-4 ${paymentMethod === 'netbanking' ? 'border-primary' : ''}`}>
            <Radio value="netbanking">
              <Space>
                <BankOutlined />
                <span>Net Banking</span>
              </Space>
            </Radio>
            {paymentMethod === 'netbanking' && (
              <div className="mt-4 ml-6">
                <Form
                  form={netBankingForm}
                  layout="vertical"
                  onFinish={handleNetBankingPayment}
                >
                  <Form.Item
                    name="bank"
                    label="Select Bank"
                    rules={[{ required: true, message: 'Please select a bank' }]}
                  >
                    <Radio.Group>
                      <Space direction="vertical">
                        <Radio value="sbi">State Bank of India</Radio>
                        <Radio value="hdfc">HDFC Bank</Radio>
                        <Radio value="icici">ICICI Bank</Radio>
                        <Radio value="axis">Axis Bank</Radio>
                        <Radio value="other">Other Banks</Radio>
                      </Space>
                    </Radio.Group>
                  </Form.Item>
                </Form>
              </div>
            )}
          </Card>

          <Card className={`mb-4 ${paymentMethod === 'wallet' ? 'border-primary' : ''}`}>
            <Radio value="wallet">
              <Space>
                <WalletOutlined />
                <span>Wallet</span>
              </Space>
            </Radio>
            {paymentMethod === 'wallet' && (
              <div className="mt-4 ml-6">
                <Form
                  form={walletForm}
                  layout="vertical"
                  onFinish={handleWalletPayment}
                >
                  <Form.Item
                    name="wallet"
                    label="Select Wallet"
                    rules={[{ required: true, message: 'Please select a wallet' }]}
                  >
                    <Radio.Group>
                      <Space direction="vertical">
                        <Radio value="paytm">Paytm</Radio>
                        <Radio value="phonepe">PhonePe</Radio>
                        <Radio value="amazonpay">Amazon Pay</Radio>
                        <Radio value="mobikwik">MobiKwik</Radio>
                      </Space>
                    </Radio.Group>
                  </Form.Item>
                </Form>
              </div>
            )}
          </Card>

          <Card className={`mb-4 ${paymentMethod === 'cod' ? 'border-primary' : ''}`}>
            <Radio value="cod">
              <Space>
                <DollarOutlined />
                <span>Cash on Delivery</span>
              </Space>
            </Radio>
            {paymentMethod === 'cod' && (
              <div className="mt-4 ml-6">
                <Alert
                  message="Additional charges may apply for Cash on Delivery"
                  type="info"
                  showIcon
                  className="mb-4"
                />
                <Form
                  form={codForm}
                  layout="vertical"
                  onFinish={handleCodPayment}
                >
                  <Form.Item
                    name="agreement"
                    valuePropName="checked"
                    rules={[
                      {
                        validator: (_, value) =>
                          value ? Promise.resolve() : Promise.reject(new Error('Please confirm the terms')),
                      },
                    ]}
                  >
                    <Checkbox>
                      I agree to pay the full amount at the time of delivery
                    </Checkbox>
                  </Form.Item>
                </Form>
              </div>
            )}
          </Card>
        </Space>
      </Radio.Group>

      <div className="flex justify-between mt-4">
        <Button onClick={handlePrev}>
          Back
        </Button>
        <Button
          type="primary"
          onClick={() => {
            switch (paymentMethod) {
              case 'card':
                if (selectedCard) {
                  handlePayment();
                } else {
                  cardForm.validateFields()
                    .then(() => cardForm.submit())
                    .catch(error => {
                      console.error('Validation failed:', error);
                      message.error('Please complete all required fields correctly');
                    });
                }
                break;
              case 'upi':
                upiForm.validateFields()
                  .then(() => upiForm.submit())
                  .catch(error => {
                    console.error('Validation failed:', error);
                    message.error('Please enter a valid UPI ID');
                  });
                break;
              case 'netbanking':
                netBankingForm.validateFields()
                  .then(() => netBankingForm.submit())
                  .catch(error => {
                    console.error('Validation failed:', error);
                    message.error('Please select a bank');
                  });
                break;
              case 'wallet':
                walletForm.validateFields()
                  .then(() => walletForm.submit())
                  .catch(error => {
                    console.error('Validation failed:', error);
                    message.error('Please select a wallet');
                  });
                break;
              case 'cod':
                codForm.validateFields()
                  .then(() => codForm.submit())
                  .catch(error => {
                    console.error('Validation failed:', error);
                    message.error('Please confirm the terms');
                  });
                break;
              default:
                break;
            }
          }}
          disabled={processingPayment}
          loading={processingPayment}
        >
          {processingPayment ? 'Processing...' : 'Pay Now'}
        </Button>
      </div>
    </div>
  );

  const renderOrderSummary = () => (
    <Card title="Order Summary" className="mb-4">
      <List
        dataSource={orderDetails.items}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={item.image} shape="square" />}
              title={item.name}
              description={`Qty: ${item.quantity} x ₹${item.price.toFixed(2)}`}
            />
            <div>₹{(item.quantity * item.price).toFixed(2)}</div>
          </List.Item>
        )}
      />
      <Divider />
      <div className="flex justify-between mb-2">
        <Text>Subtotal</Text>
        <Text>₹{orderDetails.subtotal.toFixed(2)}</Text>
      </div>
      <div className="flex justify-between mb-2">
        <Text>Delivery Fee</Text>
        <Text>₹{orderDetails.deliveryFee.toFixed(2)}</Text>
      </div>
      <div className="flex justify-between mb-2">
        <Text>Tax</Text>
        <Text>₹{orderDetails.tax.toFixed(2)}</Text>
      </div>
      {orderDetails.discount > 0 && (
        <div className="flex justify-between mb-2">
          <Text type="success">Discount</Text>
          <Text type="success">-₹{orderDetails.discount.toFixed(2)}</Text>
        </div>
      )}
      <Divider />
      <div className="flex justify-between">
        <Text strong>Total</Text>
        <Text strong>₹{orderDetails.total.toFixed(2)}</Text>
      </div>
    </Card>
  );

  const renderPaymentConfirmation = () => {
    if (paymentComplete) {
      return (
        <div className="text-center">
          <Result
            status="success"
            title="Payment Successful!"
            subTitle={`Your order has been placed. Order ID: ORD-${Date.now().toString().slice(-6)}`}
            extra={[
              <Button type="primary" key="console" onClick={handleOrderComplete}>
                View My Orders
              </Button>,
              <Button key="buy" onClick={() => navigate('/')}>Continue Shopping</Button>,
            ]}
          />
          
          <div className="bg-green-50 p-4 rounded-lg mb-4 mt-4">
            <div className="flex items-center justify-center mb-4">
              <CheckCircleOutlined className="text-green-500 text-3xl mr-2" />
              <Text strong className="text-green-600 text-lg">Transaction Completed</Text>
            </div>
            
            <Descriptions bordered layout="vertical" size="small" className="payment-success-details">
              <Descriptions.Item label="Transaction ID">{`PAYMENT${Date.now()}`}</Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {paymentMethod === 'card' && selectedCard 
                  ? `${selectedCard.cardType.toUpperCase()} Card ending with ${selectedCard.cardNumber.slice(-4)}`
                  : paymentMethod === 'card' 
                    ? 'Credit/Debit Card' 
                    : paymentMethod === 'upi' 
                      ? 'UPI' 
                      : paymentMethod === 'netbanking' 
                        ? 'Net Banking' 
                        : paymentMethod === 'wallet' 
                          ? 'Digital Wallet' 
                          : 'Cash on Delivery'}
              </Descriptions.Item>
              <Descriptions.Item label="Amount">{`₹${orderDetails.total.toFixed(2)}`}</Descriptions.Item>
              <Descriptions.Item label="Date & Time">{new Date().toLocaleString()}</Descriptions.Item>
            </Descriptions>
            
            <div className="mt-4">
              <Alert
                message="Payment Receipt"
                description="A copy of the payment receipt has been sent to your registered email address."
                type="info"
                showIcon
              />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="text-center">
          {paymentError && (
            <Alert
              message="Payment Failed"
              description={paymentError}
              type="error"
              showIcon
              className="mb-4"
            />
          )}
          <Button type="primary" onClick={handlePayment} loading={processingPayment}>
            Try Again
          </Button>
          <Button onClick={handlePrev} className="ml-4" disabled={processingPayment}>
            Change Payment Method
          </Button>
        </div>
      );
    }
  };

  const steps = [
    {
      title: 'Address',
      content: renderAddressSelection,
      icon: <HomeOutlined />
    },
    {
      title: 'Payment',
      content: renderPaymentMethods,
      icon: <CreditCardOutlined />
    },
    {
      title: 'Confirmation',
      content: renderPaymentConfirmation,
      icon: <CheckCircleOutlined />
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Loading payment details..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Title level={2}>Checkout</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card className="mb-6">
            <Steps current={currentStep}>
              {steps.map((step) => (
                <Step key={step.title} title={step.title} icon={step.icon} />
              ))}
            </Steps>
            <div className="mt-8">
              {steps[currentStep].content()}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          {orderDetails && (
            <>
              <div className="lg:hidden mb-4">
                <Button 
                  type="link" 
                  onClick={() => setShowOrderSummary(!showOrderSummary)}
                  block
                >
                  {showOrderSummary ? 'Hide Order Summary' : 'Show Order Summary'} (₹{orderDetails.total.toFixed(2)})
                </Button>
                {showOrderSummary && renderOrderSummary()}
              </div>
              <div className="hidden lg:block">
                {renderOrderSummary()}
              </div>
            </>
          )}

          <Card title="Delivery Address" className="mb-4">
            {selectedAddress ? (
              <Space direction="vertical">
                <Text strong>{selectedAddress.name}</Text>
                <Text>{selectedAddress.phone}</Text>
                <Text>
                  {selectedAddress.address}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                </Text>
              </Space>
            ) : (
              <Text type="secondary">No address selected</Text>
            )}
          </Card>

          <Collapse>
            <Panel header="Need Help?" key="1">
              <Space direction="vertical">
                <Text>
                  <QuestionCircleOutlined className="mr-2" />
                  Having trouble with your payment?
                </Text>
                <Text>
                  <PhoneOutlined className="mr-2" />
                  Call us at: +91 1800 123 4567
                </Text>
                <Text>
                  <MailOutlined className="mr-2" />
                  Email: support@example.com
                </Text>
              </Space>
            </Panel>
            <Panel header="Secure Payment" key="2">
              <Space direction="vertical">
                <Text>
                  <LockOutlined className="mr-2" />
                  All transactions are secure and encrypted
                </Text>
                <Text>
                  <InfoCircleOutlined className="mr-2" />
                  We do not store your card details
                </Text>
              </Space>
            </Panel>
          </Collapse>
        </Col>
      </Row>
    </div>
  );
};

export default PaymentGateway; 