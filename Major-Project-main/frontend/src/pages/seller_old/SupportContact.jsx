import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Divider,
  Paper,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Alert,
  Snackbar,
  useTheme,
  alpha,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack,
  Send,
  AttachFile,
  Email,
  Phone,
  WhatsApp,
  ChatBubbleOutline,
  CheckCircle,
  Info,
  History,
  AccessTime,
  Close,
  ArrowForward,
  LocationOn
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useThemeMode } from '../../context/ThemeContext';

const SupportContact = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  
  // State for form
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    message: '',
    attachments: []
  });
  
  // State for form errors
  const [formErrors, setFormErrors] = useState({});
  
  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // State for alert
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  
  // Mock data - in a real app, this would come from an API
  const categories = [
    { value: 'account', label: 'Account & Profile' },
    { value: 'products', label: 'Products & Inventory' },
    { value: 'orders', label: 'Orders & Shipping' },
    { value: 'payments', label: 'Payments & Finances' },
    { value: 'technical', label: 'Technical Issues' },
    { value: 'other', label: 'Other' }
  ];
  
  // Recent support tickets
  const recentTickets = [
    {
      id: 'TKT-001',
      subject: 'Payment not received for order #ORD-123',
      category: 'Payments & Finances',
      date: new Date(2023, 2, 10, 14, 30),
      status: 'Open',
      lastUpdate: new Date(2023, 2, 10, 15, 45),
      agentName: 'Priya Sharma'
    },
    {
      id: 'TKT-002',
      subject: 'How to update product inventory in bulk?',
      category: 'Products & Inventory',
      date: new Date(2023, 2, 5, 9, 15),
      status: 'Closed',
      lastUpdate: new Date(2023, 2, 7, 11, 30),
      agentName: 'Rahul Verma'
    },
    {
      id: 'TKT-003',
      subject: 'Unable to upload product images',
      category: 'Technical Issues',
      date: new Date(2023, 1, 28, 16, 45),
      status: 'Resolved',
      lastUpdate: new Date(2023, 2, 1, 10, 20),
      agentName: 'Amit Patel'
    }
  ];
  
  // Support channels
  const supportChannels = [
    {
      id: 'phone',
      title: 'Phone Support',
      value: '+91 800-123-4567',
      icon: <Phone />,
      color: theme.palette.success.main,
      action: 'Call',
      actionFn: () => window.location.href = 'tel:+918001234567'
    },
    {
      id: 'email',
      title: 'Email Support',
      value: 'seller-support@freshconnect.com',
      icon: <Email />,
      color: theme.palette.info.main,
      action: 'Email',
      actionFn: () => window.location.href = 'mailto:seller-support@freshconnect.com'
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Support',
      value: '+91 800-123-4567',
      icon: <WhatsApp />,
      color: '#25D366', // WhatsApp green
      action: 'WhatsApp',
      actionFn: () => window.open('https://wa.me/918001234567', '_blank')
    }
  ];
  
  const contactInfo = [
    {
      title: 'Email',
      value: 'support@freshconnect.com',
      icon: <Email />,
      color: '#4361ee'
    },
    {
      title: 'Phone',
      value: '+1 (555) 123-4567',
      icon: <Phone />,
      color: '#ff9e00'
    },
    {
      title: 'Address',
      value: '123 Market Street, San Francisco, CA 94103',
      icon: <LocationOn />,
      color: '#4cc9f0'
    }
  ];
  
  const issueTypes = [
    'Technical Issue',
    'Account Problem',
    'Payment Question',
    'Product Listing',
    'Order Processing',
    'Verification',
    'Other'
  ];
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 0) {
      setFormData({
        ...formData,
        attachments: [...formData.attachments, ...files]
      });
    }
  };
  
  // Remove attachment
  const handleRemoveAttachment = (index) => {
    const updatedAttachments = [...formData.attachments];
    updatedAttachments.splice(index, 1);
    
    setFormData({
      ...formData,
      attachments: updatedAttachments
    });
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    
    if (!formData.category) {
      errors.category = 'Please select a category';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.trim().length < 20) {
      errors.message = 'Message should be at least 20 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      setAlert({
        open: true,
        message: 'Your support request has been submitted successfully. Our team will get back to you soon.',
        severity: 'success'
      });
      
      // Reset form after success
      setFormData({
        subject: '',
        category: '',
        message: '',
        attachments: []
      });
      
      // Reset success state after a delay
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    }, 1500);
  };
  
  // Close alert
  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };
  
  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return {
          bg: theme.palette.info.lighter,
          color: theme.palette.info.dark
        };
      case 'Closed':
        return {
          bg: theme.palette.grey[200],
          color: theme.palette.grey[700]
        };
      case 'Resolved':
        return {
          bg: theme.palette.success.lighter,
          color: theme.palette.success.dark
        };
      default:
        return {
          bg: theme.palette.grey[200],
          color: theme.palette.grey[700]
        };
    }
  };
  
  return (
    <Box>
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
      
      <Box mb={4} display="flex" alignItems="center">
        <IconButton 
          onClick={() => navigate('/seller/support')}
          sx={{ mr: 2, bgcolor: 'background.paper' }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Contact Support
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              borderRadius: '16px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              height: '100%'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Contact Information
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {contactInfo.map((item, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      display: 'flex',
                      alignItems: 'flex-start'
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '12px', 
                        backgroundColor: `${item.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.color,
                        mr: 2,
                        flexShrink: 0
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.value}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Support Hours
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Monday - Friday: 9:00 AM - 6:00 PM
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Saturday: 10:00 AM - 4:00 PM
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card 
            sx={{ 
              borderRadius: '16px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              height: '100%'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Send a Message
              </Typography>
              
              <Box component="form" noValidate autoComplete="off">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      variant="outlined"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      variant="outlined"
                      margin="normal"
                      type="email"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="issue-type-label">Issue Type</InputLabel>
                      <Select
                        labelId="issue-type-label"
                        id="issue-type"
                        label="Issue Type"
                        defaultValue=""
                      >
                        {issueTypes.map((type, index) => (
                          <MenuItem key={index} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      variant="outlined"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      variant="outlined"
                      multiline
                      rows={6}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      size="large"
                      sx={{ 
                        borderRadius: '8px',
                        py: 1.5,
                        px: 4,
                        fontWeight: 600,
                        mt: 2
                      }}
                    >
                      Submit Request
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SupportContact; 