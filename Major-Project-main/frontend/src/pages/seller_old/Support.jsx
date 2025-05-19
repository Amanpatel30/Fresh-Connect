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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  alpha,
  Chip,
  Avatar,
  Badge,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search,
  ExpandMore,
  QuestionAnswer,
  Article,
  LiveHelp,
  ContactSupport,
  Email,
  Phone,
  WhatsApp,
  Headset,
  Info,
  Help,
  ArrowForward,
  Bookmark,
  BookmarkBorder,
  ChatBubbleOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Support = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // State for bookmarked articles
  const [bookmarkedArticles, setBookmarkedArticles] = useState(['faq-1', 'faq-3']);
  
  // Mock data - in a real app, this would come from an API
  const faqCategories = [
    {
      id: 'account',
      title: 'Account & Profile',
      icon: <Info />,
      faqs: [
        {
          id: 'faq-1',
          question: 'How do I update my profile information?',
          answer: 'You can update your profile information by navigating to the Profile section. Click on the Edit button to modify your details such as name, contact information, and business details. Remember to save your changes before leaving the page.'
        },
        {
          id: 'faq-2',
          question: 'How can I change my password?',
          answer: 'To change your password, go to Profile > Security. You\'ll need to enter your current password and then your new password twice to confirm. Make sure your new password is strong and secure.'
        },
        {
          id: 'faq-3',
          question: 'What should I do if I forget my password?',
          answer: 'If you forget your password, click on the "Forgot Password" link on the login page. You\'ll receive an email with instructions to reset your password. Make sure to check your spam folder if you don\'t see the email in your inbox.'
        }
      ]
    },
    {
      id: 'products',
      title: 'Products & Inventory',
      icon: <Article />,
      faqs: [
        {
          id: 'faq-4',
          question: 'How do I add a new product?',
          answer: 'To add a new product, go to the Products section and click on the "Add Product" button. Fill in all the required details such as name, description, price, and stock quantity. You can also add images and additional information like nutritional value.'
        },
        {
          id: 'faq-5',
          question: 'How can I update my product inventory?',
          answer: 'You can update your product inventory by going to the Products section. Find the product you want to update and click on the Edit button. From there, you can modify the stock quantity and other details.'
        },
        {
          id: 'faq-6',
          question: 'What are the requirements for product images?',
          answer: 'Product images should be clear, well-lit, and show the product accurately. The recommended image size is 1000x1000 pixels. You can upload up to 5 images per product in JPG, PNG, or WEBP format, with a maximum file size of 5MB each.'
        }
      ]
    },
    {
      id: 'orders',
      title: 'Orders & Shipping',
      icon: <QuestionAnswer />,
      faqs: [
        {
          id: 'faq-7',
          question: 'How do I process an order?',
          answer: 'To process an order, go to the Orders section and find the order you want to process. Click on the "Process" button to begin. You\'ll need to confirm the items, prepare them for shipping, and mark the order as "Processing" or "Shipped" depending on your workflow.'
        },
        {
          id: 'faq-8',
          question: 'What shipping options are available?',
          answer: 'We offer several shipping options including standard delivery (2-3 business days), express delivery (next day), and same-day delivery in select areas. You can choose the shipping method that works best for your business and customers.'
        },
        {
          id: 'faq-9',
          question: 'How do I handle order cancellations?',
          answer: 'If a customer requests an order cancellation, you can process it by going to the specific order and clicking on the "Cancel Order" button. You\'ll need to provide a reason for the cancellation. If the payment has already been processed, it will be refunded to the customer.'
        }
      ]
    },
    {
      id: 'payments',
      title: 'Payments & Finances',
      icon: <Help />,
      faqs: [
        {
          id: 'faq-10',
          question: 'How and when will I get paid?',
          answer: 'Payments are processed every Monday and Thursday. The funds will be transferred to your default payment method within 2-3 business days. You can view your payment history and upcoming payments in the Payments section.'
        },
        {
          id: 'faq-11',
          question: 'What are the transaction fees?',
          answer: 'The transaction fee for bank transfers is 0.5% of the transaction amount. UPI transfers do not have any fees. These fees are automatically deducted from your earnings before the payment is processed.'
        },
        {
          id: 'faq-12',
          question: 'How do I add or change my payment method?',
          answer: 'To add or change your payment method, go to Payments > Payment Methods. Click on "Add Method" to add a new payment method or select an existing one and click "Set as Default" to change your default payment method.'
        }
      ]
    }
  ];
  
  // Support channels
  const supportChannels = [
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      icon: <ChatBubbleOutline />,
      availability: 'Available 24/7',
      action: 'Start Chat',
      color: theme.palette.primary.main
    },
    {
      id: 'email',
      title: 'Email Support',
      description: 'Send us an email and we\'ll respond within 24 hours',
      icon: <Email />,
      availability: 'Response within 24 hours',
      action: 'Send Email',
      color: theme.palette.info.main
    },
    {
      id: 'phone',
      title: 'Phone Support',
      description: 'Call our dedicated seller support line',
      icon: <Phone />,
      availability: 'Mon-Fri, 9 AM - 6 PM',
      action: 'Call Now',
      color: theme.palette.success.main
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Support',
      description: 'Message us on WhatsApp for quick assistance',
      icon: <WhatsApp />,
      availability: 'Available 24/7',
      action: 'WhatsApp',
      color: '#25D366' // WhatsApp green
    }
  ];
  
  // Filter FAQs based on search term
  const filteredFaqs = faqCategories.flatMap(category => 
    category.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    ).map(faq => ({ ...faq, category: category.title }))
  );
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle bookmark toggle
  const handleToggleBookmark = (faqId) => {
    if (bookmarkedArticles.includes(faqId)) {
      setBookmarkedArticles(bookmarkedArticles.filter(id => id !== faqId));
    } else {
      setBookmarkedArticles([...bookmarkedArticles, faqId]);
    }
  };
  
  // Handle contact support
  const handleContactSupport = (channelId) => {
    // In a real app, you would implement the appropriate action for each channel
    switch (channelId) {
      case 'chat':
        console.log('Opening live chat');
        break;
      case 'email':
        window.location.href = 'mailto:support@freshconnect.com';
        break;
      case 'phone':
        window.location.href = 'tel:+918001234567';
        break;
      case 'whatsapp':
        window.open('https://wa.me/918001234567', '_blank');
        break;
      default:
        navigate('/seller/support/contact');
    }
  };
  
  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Help & Support
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Find answers to your questions or contact our support team
        </Typography>
      </Box>
      
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2, 
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
          mb: 4,
          p: { xs: 2, md: 4 },
          backgroundImage: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box mb={{ xs: 2, md: 0 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            How can we help you today?
          </Typography>
          <Typography variant="body1">
            Search our knowledge base or browse frequently asked questions
          </Typography>
        </Box>
        
        <TextField
          placeholder="Search for help..."
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: { xs: '100%', md: '400px' },
            bgcolor: 'background.paper',
            borderRadius: 1
          }}
        />
      </Paper>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Help Center" />
          <Tab label="Contact Support" />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Bookmarked
                {bookmarkedArticles.length > 0 && (
                  <Badge 
                    badgeContent={bookmarkedArticles.length} 
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            } 
          />
        </Tabs>
      </Box>
      
      {/* Help Center Tab */}
      {tabValue === 0 && (
        <Box>
          {searchTerm ? (
            // Search results
            <Box>
              <Typography variant="h6" gutterBottom>
                Search Results for "{searchTerm}"
              </Typography>
              
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <Accordion 
                    key={faq.id} 
                    elevation={0}
                    sx={{ 
                      mb: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      '&:before': { display: 'none' },
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{ 
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {faq.question}
                        </Typography>
                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                          <Chip 
                            label={faq.category} 
                            size="small" 
                            sx={{ mr: 1 }}
                          />
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleBookmark(faq.id);
                            }}
                          >
                            {bookmarkedArticles.includes(faq.id) ? (
                              <Bookmark fontSize="small" color="primary" />
                            ) : (
                              <BookmarkBorder fontSize="small" />
                            )}
                          </IconButton>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body1">
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    No results found for "{searchTerm}"
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try different keywords or contact our support team for assistance
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={() => setTabValue(1)}
                  >
                    Contact Support
                  </Button>
                </Paper>
              )}
            </Box>
          ) : (
            // FAQ categories
            <Grid container spacing={3}>
              {faqCategories.map((category) => (
                <Grid item xs={12} key={category.id}>
                  <Box mb={2} display="flex" alignItems="center">
                    <Box 
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        mr: 2
                      }}
                    >
                      {category.icon}
                    </Box>
                    <Typography variant="h6">
                      {category.title}
                    </Typography>
                  </Box>
                  
                  {category.faqs.map((faq) => (
                    <Accordion 
                      key={faq.id} 
                      elevation={0}
                      sx={{ 
                        mb: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        '&:before': { display: 'none' },
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        sx={{ 
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {faq.question}
                          </Typography>
                          <IconButton 
                            size="small" 
                            sx={{ ml: 'auto' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleBookmark(faq.id);
                            }}
                          >
                            {bookmarkedArticles.includes(faq.id) ? (
                              <Bookmark fontSize="small" color="primary" />
                            ) : (
                              <BookmarkBorder fontSize="small" />
                            )}
                          </IconButton>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body1">
                          {faq.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
      
      {/* Contact Support Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {supportChannels.map((channel) => (
            <Grid item xs={12} sm={6} md={3} key={channel.id}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: channel.color,
                    boxShadow: `0 4px 20px ${alpha(channel.color, 0.15)}`
                  }
                }}
              >
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: alpha(channel.color, 0.1),
                      color: channel.color,
                      mb: 2
                    }}
                  >
                    {channel.icon}
                  </Box>
                  
                  <Typography variant="h6" gutterBottom>
                    {channel.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {channel.description}
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: alpha(channel.color, 0.05),
                      borderRadius: 1,
                      p: 1,
                      mb: 2
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: channel.id === 'phone' ? theme.palette.warning.main : theme.palette.success.main,
                        mr: 1
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {channel.availability}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 'auto' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ 
                        borderColor: channel.color,
                        color: channel.color,
                        '&:hover': {
                          borderColor: channel.color,
                          bgcolor: alpha(channel.color, 0.05)
                        }
                      }}
                      endIcon={<ArrowForward />}
                      onClick={() => handleContactSupport(channel.id)}
                    >
                      {channel.action}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          
          <Grid item xs={12}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3,
                mt: 2,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.info.main, 0.05)
              }}
            >
              <Box display="flex" alignItems="flex-start">
                <Headset color="info" sx={{ mr: 2, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    Need more specialized assistance?
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Our dedicated seller support team is here to help you with any complex issues or questions you may have about your account, products, orders, or payments.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="info"
                    onClick={() => navigate('/seller/support/contact')}
                  >
                    Contact Dedicated Support
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Bookmarked Tab */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Your Bookmarked Articles
          </Typography>
          
          {bookmarkedArticles.length > 0 ? (
            faqCategories.flatMap(category => 
              category.faqs.filter(faq => bookmarkedArticles.includes(faq.id))
                .map(faq => (
                  <Accordion 
                    key={faq.id} 
                    elevation={0}
                    sx={{ 
                      mb: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      '&:before': { display: 'none' },
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{ 
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {faq.question}
                        </Typography>
                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                          <Chip 
                            label={category.title} 
                            size="small" 
                            sx={{ mr: 1 }}
                          />
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleBookmark(faq.id);
                            }}
                          >
                            <Bookmark fontSize="small" color="primary" />
                          </IconButton>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body1">
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))
            )
          ) : (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                textAlign: 'center',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2
              }}
            >
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                You haven't bookmarked any articles yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bookmark articles that you find helpful for quick access in the future
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => setTabValue(0)}
              >
                Browse Help Center
              </Button>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Support; 