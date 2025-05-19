import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid,
  TextField,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Help as HelpIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Chat as ChatIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import { useThemeMode } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const SellerSupport = () => {
  const { mode } = useThemeMode();
  const navigate = useNavigate();

  const supportOptions = [
    {
      title: 'Help Center',
      description: 'Browse our knowledge base for answers to common questions',
      icon: <HelpIcon />,
      color: '#4361ee'
    },
    {
      title: 'Email Support',
      description: 'Send us an email and we\'ll get back to you within 24 hours',
      icon: <EmailIcon />,
      color: '#ff9e00'
    },
    {
      title: 'Phone Support',
      description: 'Call us directly for urgent matters',
      icon: <PhoneIcon />,
      color: '#4cc9f0'
    },
    {
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      icon: <ChatIcon />,
      color: '#f72585'
    }
  ];

  const faqItems = [
    {
      question: 'How do I add a new product?',
      answer: 'You can add a new product by navigating to Products > Add Product and filling out the product details form.'
    },
    {
      question: 'How do I process an order?',
      answer: 'To process an order, go to Orders > Pending Orders, select the order you want to process, and click on the "Process" button.'
    },
    {
      question: 'How do I update my profile information?',
      answer: 'You can update your profile information by going to Profile and editing your details.'
    },
    {
      question: 'How do I create an urgent sale?',
      answer: 'To create an urgent sale, navigate to Urgent Sales and click on the "Create New" button.'
    }
  ];

  const handleContactSubmit = () => {
    navigate('/seller/support/contact');
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Support</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {supportOptions.map((option, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                borderRadius: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2
                  }}
                >
                  <Box 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '12px', 
                      backgroundColor: `${option.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: option.color,
                      mr: 2
                    }}
                  >
                    {option.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {option.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {option.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              borderRadius: '16px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              height: '100%'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <ArticleIcon sx={{ mr: 1, color: '#4361ee' }} />
                Frequently Asked Questions
              </Typography>
              
              <List>
                {faqItems.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0, py: 2, display: 'block' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        {item.question}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.answer}
                      </Typography>
                    </ListItem>
                    {index < faqItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              borderRadius: '16px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              height: '100%'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Contact Us
              </Typography>
              
              <Box component="form" noValidate autoComplete="off">
                <TextField
                  fullWidth
                  label="Subject"
                  variant="outlined"
                  margin="normal"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Message"
                  variant="outlined"
                  multiline
                  rows={4}
                  margin="normal"
                  sx={{ mb: 2 }}
                />
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleContactSubmit}
                  sx={{ 
                    borderRadius: '8px',
                    py: 1.5,
                    px: 3,
                    fontWeight: 600
                  }}
                >
                  Send Message
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SellerSupport;