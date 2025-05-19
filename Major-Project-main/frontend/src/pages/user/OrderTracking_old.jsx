import React, { useState, useEffect } from 'react';
import { 
  Box, Card, Typography, Divider, Stack, Grid, 
  Button, Chip, Stepper, Step, StepLabel, CircularProgress, Alert, 
  Modal, TextField, Rating, Avatar, List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import { 
  ShoppingCart, CheckCircle, DirectionsCar, 
  Home, AccessTime, Phone, 
  LocationOn, Person, Message,
  Error, Star, FiberManualRecord
} from '@mui/icons-material';
import { useParams, Link } from 'react-router-dom';

const OrderTracking = () => {
  const { orderId } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    // Simulating API call to fetch order details
    setTimeout(() => {
      // Mock order data
      const mockOrder = {
        id: orderId || 'ORD-1234',
        status: 'shipped',
        placedAt: '2023-06-15T14:30:00',
        estimatedDelivery: '2023-06-17T18:00:00',
        items: [
          {
            id: 1,
            name: 'Fresh Tomatoes',
            quantity: 2,
            price: 40.00,
            image: 'https://via.placeholder.com/80x80',
            seller: 'Fresh Veggies Store'
          },
          {
            id: 2,
            name: 'Organic Potatoes',
            quantity: 3,
            price: 35.00,
            image: 'https://via.placeholder.com/80x80',
            seller: 'Organic Farms'
          }
        ],
        totalAmount: 185.00,
        paymentMethod: 'Credit Card',
        deliveryAddress: {
          name: 'John Doe',
          phone: '+91 98765 43210',
          address: '123 Main St, Apartment 4B',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        timeline: [
          {
            status: 'ordered',
            time: '2023-06-15T14:30:00',
            description: 'Order placed successfully'
          },
          {
            status: 'confirmed',
            time: '2023-06-15T14:45:00',
            description: 'Order confirmed by seller'
          },
          {
            status: 'processing',
            time: '2023-06-15T16:30:00',
            description: 'Order is being processed'
          },
          {
            status: 'shipped',
            time: '2023-06-16T10:15:00',
            description: 'Order has been shipped'
          }
        ],
        deliveryPartner: {
          name: 'Express Delivery',
          trackingId: 'TRK-5678',
          phone: '+91 98765 12345'
        }
      };

      setOrder(mockOrder);
      setLoading(false);
    }, 1500);
  }, [orderId]);

  const getStatusStep = (status) => {
    const statusMap = {
      'ordered': 0,
      'confirmed': 1,
      'processing': 2,
      'shipped': 3,
      'delivered': 4,
      'cancelled': -1
    };
    return statusMap[status] || 0;
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      'ordered': { color: 'default', icon: <ShoppingCart /> },
      'confirmed': { color: 'processing', icon: <CheckCircle /> },
      'processing': { color: 'processing', icon: <AccessTime /> },
      'shipped': { color: 'blue', icon: <DirectionsCar /> },
      'delivered': { color: 'success', icon: <Home /> },
      'cancelled': { color: 'error', icon: <Error /> }
    };

    const config = statusConfig[status] || statusConfig.ordered;
    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={config.color}
        icon={config.icon}
      />
    );
  };

  const handleContactDelivery = () => {
    setContactModalVisible(true);
  };

  const handleSubmitContact = (values) => {
    console.log('Contact message:', values);
    setContactModalVisible(false);
    setForm({});
  };

  const handleReviewOrder = () => {
    setReviewModalVisible(true);
  };

  const handleSubmitReview = (values) => {
    console.log('Review submitted:', values);
    setReviewModalVisible(false);
    setForm({});
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress size={24} />
      </div>
    );
  }

  if (!order) {
    return (
      <Alert
        severity="error"
        sx={{ mb: 4 }}
      >
        Sorry, we couldn't find the order you're looking for.
      </Alert>
    );
  }

  const currentStep = getStatusStep(order.status);
  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Typography variant="h3">Track Your Order</Typography>
            <Typography variant="body1">Order ID: {order.id}</Typography>
          </div>
          <div>
            {getStatusTag(order.status)}
          </div>
        </div>

        {isCancelled ? (
          <Alert
            severity="error"
            sx={{ mb: 4 }}
          >
            This order has been cancelled. If you have any questions, please contact customer support.
          </Alert>
        ) : (
          <Stepper activeStep={currentStep} className="mb-6">
            <Step>
              <StepLabel>Ordered</StepLabel>
            </Step>
            <Step>
              <StepLabel>Confirmed</StepLabel>
            </Step>
            <Step>
              <StepLabel>Processing</StepLabel>
            </Step>
            <Step>
              <StepLabel>Shipped</StepLabel>
            </Step>
            <Step>
              <StepLabel>Delivered</StepLabel>
            </Step>
          </Stepper>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card title="Estimated Delivery" variant="outlined">
              <Typography variant="h6" component="h2" gutterBottom>
                Estimated Delivery
              </Typography>
              <Typography variant="body1" component="p">
                {new Date(order.estimatedDelivery).toLocaleDateString()}
                <br />
                {new Date(order.estimatedDelivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
              {order.status === 'shipped' && (
                <Button 
                  variant="contained" 
                  onClick={handleContactDelivery}
                  sx={{ mt: 2 }}
                >
                  Contact Delivery Partner
                </Button>
              )}
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card title="Delivery Address" variant="outlined">
              <Typography variant="h6" component="h2" gutterBottom>
                Delivery Address
              </Typography>
              <Typography variant="body1" component="p">
                <Person className="mr-2" />
                {order.deliveryAddress.name}
              </Typography>
              <Typography variant="body1" component="p">
                <Phone className="mr-2" />
                {order.deliveryAddress.phone}
              </Typography>
              <Typography variant="body1" component="p">
                <LocationOn className="mr-2" />
                {order.deliveryAddress.address}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card title="Order Summary" variant="outlined">
              <Typography variant="h6" component="h2" gutterBottom>
                Order Summary
              </Typography>
              <Typography variant="body1" component="p">
                Total Items: {order.items.length}
              </Typography>
              <Typography variant="body1" component="p">
                Order Date: {new Date(order.placedAt).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" component="p">
                Total Amount: ₹{order.totalAmount.toFixed(2)}
              </Typography>
              <Typography variant="body1" component="p">
                Payment Method: {order.paymentMethod}
              </Typography>
              {isDelivered && !order.reviewed && (
                <Button 
                  variant="contained" 
                  startIcon={<Star />}
                  onClick={handleReviewOrder}
                  sx={{ mt: 2 }}
                >
                  Review Order
                </Button>
              )}
            </Card>
          </Grid>
        </Grid>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card title="Order Items" variant="outlined">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center mb-4 p-2 border-b">
                <Avatar
                  src={item.image}
                  alt={item.name}
                  sx={{ width: 80, height: 80, mr: 2 }}
                />
                <div className="flex-grow">
                  <Typography variant="h6" component="h3">
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Qty: {item.quantity}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" className="ml-4">
                    Price: ₹{item.price.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Seller: {item.seller}
                  </Typography>
                </div>
                <Typography variant="h6" component="h3">
                  ₹{(item.quantity * item.price).toFixed(2)}
                </Typography>
              </div>
            ))}
            <div className="flex justify-end mt-4">
              <Typography variant="h6" component="h3">
                Total: ₹{order.totalAmount.toFixed(2)}
              </Typography>
            </div>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card title="Tracking History" variant="outlined">
            <Typography variant="h6" component="h2" gutterBottom sx={{ p: 2 }}>
              Tracking History
            </Typography>
            <List>
              {order.timeline.map((event, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <FiberManualRecord color={index === order.timeline.length - 1 ? 'primary' : 'disabled'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6" component="h3">
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="textSecondary">
                          {new Date(event.time).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {event.description}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>

      {order.deliveryPartner && order.status === 'shipped' && (
        <Card title="Delivery Information" variant="outlined">
          <Typography variant="h6" component="h2" gutterBottom>
            Delivery Information
          </Typography>
          <Typography variant="body1" component="p">
            Delivery Partner: {order.deliveryPartner.name}
          </Typography>
          <Typography variant="body1" component="p">
            Tracking ID: {order.deliveryPartner.trackingId}
          </Typography>
          <Typography variant="body1" component="p">
            Contact: {order.deliveryPartner.phone}
          </Typography>
        </Card>
      )}

      <div className="flex justify-between mt-6">
        <Button>
          <Link to="/profile?tab=orders">Back to Orders</Link>
        </Button>
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <Button variant="contained" color="error">
            Report an Issue
          </Button>
        )}
      </div>

      <Modal
        open={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4
        }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Contact Delivery Partner
          </Typography>
          <Box component="form" onSubmit={(e) => {
            e.preventDefault();
            handleSubmitContact(form);
          }}>
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={4}
              value={form.message || ''}
              onChange={(e) => setForm({...form, message: e.target.value})}
              placeholder="Enter your message for the delivery partner"
              required
              margin="normal"
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Send Message
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4
        }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Review Your Order
          </Typography>
          <Box component="form" onSubmit={(e) => {
            e.preventDefault();
            handleSubmitReview(form);
          }}>
            <Box sx={{ mb: 2 }}>
              <Typography component="legend">Rating</Typography>
              <Rating
                name="rating"
                value={form.rating || 0}
                onChange={(event, newValue) => {
                  setForm({...form, rating: newValue});
                }}
                required
              />
            </Box>
            <TextField
              fullWidth
              label="Comment"
              multiline
              rows={4}
              value={form.comment || ''}
              onChange={(e) => setForm({...form, comment: e.target.value})}
              placeholder="Share your experience with this order"
              required
              margin="normal"
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Submit Review
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default OrderTracking; 