import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Container, Grid, Typography, TextField, Button, Divider,
  IconButton, useTheme, useMediaQuery, List, ListItem, ListItemText
} from '@mui/material';
import {
  Spa as LeafIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  KeyboardArrowRight as ArrowRightIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Quick Links
  const quickLinks = [
    { name: "Home", link: "/user" },
    { name: "Market", link: "/user/products" },
    { name: "Restaurants", link: "/user/restaurants" },
    { name: "Urgent Sales", link: "/user/urgent-sales" },
    { name: "Free Food", link: "/user/free-food" }
  ];

  // Account Links
  const accountLinks = [
    { name: "My Profile", link: "/user/profile" },
    { name: "My Orders", link: "/user/orders" },
    { name: "Wishlist", link: "/user/wishlist" },
    { name: "Shopping Cart", link: "/user/cart" }
  ];

  // Support Links
  const supportLinks = [
    { name: "Help Center", link: "/help" },
    { name: "Contact Us", link: "/contact" },
    { name: "Privacy Policy", link: "/privacy" },
    { name: "Terms of Service", link: "/terms" }
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.dark',
        color: 'white',
        pt: 8,
        pb: 4,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #4CAF50, #8BC34A, #CDDC39, #8BC34A, #4CAF50)',
          backgroundSize: '200% 100%',
          animation: 'gradient 15s ease infinite'
        },
        '@keyframes gradient': {
          '0%': {
            backgroundPosition: '0% 50%'
          },
          '50%': {
            backgroundPosition: '100% 50%'
          },
          '100%': {
            backgroundPosition: '0% 50%'
          }
        }
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand and description */}
          <Grid item xs={12} md={4} sx={{ mb: { xs: 4, md: 0 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                  boxShadow: '0 2px 12px rgba(76, 175, 80, 0.3)',
                  mr: 2,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <LeafIcon sx={{ color: '#fff', fontSize: 24 }} />
              </Box>
              <Typography variant="h5" fontWeight="bold" sx={{ 
                letterSpacing: 0.5,
                background: 'linear-gradient(90deg, #ffffff, #e0e0e0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Fresh Connect
              </Typography>
            </Box>

            <Typography variant="body1" color="grey.300" paragraph sx={{ maxWidth: 350 }}>
              Connecting farmers, restaurants, and consumers for fresher food and less waste. 
              Your sustainable food marketplace.
            </Typography>

            {/* Social Media Links */}
            <Box sx={{ display: 'flex', mt: 3, mb: 4 }}>
              {[FacebookIcon, TwitterIcon, InstagramIcon, LinkedInIcon].map((Icon, index) => (
                <IconButton 
                  key={index} 
                  sx={{ 
                    mr: 1, 
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      transform: 'translateY(-3px)'
                    }
                  }}
                >
                  <Icon />
                </IconButton>
              ))}
            </Box>

            <Typography variant="body2" color="grey.400">
              © {new Date().getFullYear()} Fresh Connect. All rights reserved.
            </Typography>
          </Grid>
          
          {/* Quick Links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ 
              color: 'white',
              position: 'relative',
              pb: 1,
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '40px',
                height: '2px',
                backgroundColor: 'primary.light'
              }
            }}>
              Quick Links
            </Typography>
            
            <List dense disablePadding>
              {quickLinks.map((link, index) => (
                <ListItem 
                  key={index} 
                  disableGutters 
                  sx={{ py: 0.5 }}
                >
                  <ArrowRightIcon fontSize="small" sx={{ color: 'primary.light', mr: 1 }} />
                  <ListItemText 
                    primary={
                      <Link to={link.link} style={{ textDecoration: 'none' }}>
                        <Typography 
                          variant="body2" 
                          color="grey.300"
                          sx={{ 
                            transition: 'color 0.2s ease, transform 0.2s ease',
                            '&:hover': {
                              color: 'white',
                              transform: 'translateX(3px)'
                            },
                            display: 'inline-block'
                          }}
                        >
                          {link.name}
                        </Typography>
                      </Link>
                    } 
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
          
          {/* Account Links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ 
              color: 'white',
              position: 'relative',
              pb: 1,
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '40px',
                height: '2px',
                backgroundColor: 'primary.light'
              }
            }}>
              Account
            </Typography>
            
            <List dense disablePadding>
              {accountLinks.map((link, index) => (
                <ListItem 
                  key={index} 
                  disableGutters 
                  sx={{ py: 0.5 }}
                >
                  <ArrowRightIcon fontSize="small" sx={{ color: 'primary.light', mr: 1 }} />
                  <ListItemText 
                    primary={
                      <Link to={link.link} style={{ textDecoration: 'none' }}>
                        <Typography 
                          variant="body2" 
                          color="grey.300"
                          sx={{ 
                            transition: 'color 0.2s ease, transform 0.2s ease',
                            '&:hover': {
                              color: 'white',
                              transform: 'translateX(3px)'
                            },
                            display: 'inline-block'
                          }}
                        >
                          {link.name}
                        </Typography>
                      </Link>
                    } 
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
          
          {/* Contact & Newsletter */}
          <Grid item xs={12} sm={4} md={4}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ 
              color: 'white',
              position: 'relative',
              pb: 1,
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '40px',
                height: '2px',
                backgroundColor: 'primary.light'
              }
            }}>
              Stay Updated
            </Typography>
            
            <Typography variant="body2" color="grey.300" paragraph>
              Subscribe to our newsletter for the latest updates and offers.
            </Typography>
            
            <Box sx={{ display: 'flex', mb: 3 }}>
              <TextField
                variant="outlined"
                placeholder="Your email"
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                  }
                }}
              />
              <Button 
                variant="contained" 
                color="primary"
                sx={{ 
                  ml: 1,
                  bgcolor: 'primary.light',
                  '&:hover': {
                    bgcolor: 'primary.main',
                  }
                }}
              >
                Subscribe
              </Button>
            </Box>
            
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ 
              color: 'white',
              position: 'relative',
              pb: 1,
              mt: 3,
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '40px',
                height: '2px',
                backgroundColor: 'primary.light'
              }
            }}>
              Contact Us
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <EmailIcon fontSize="small" sx={{ color: 'primary.light', mr: 1 }} />
              <Typography variant="body2" color="grey.300">
                support@freshconnect.com
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <PhoneIcon fontSize="small" sx={{ color: 'primary.light', mr: 1 }} />
              <Typography variant="body2" color="grey.300">
                +1 (555) 123-4567
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
              <LocationIcon fontSize="small" sx={{ color: 'primary.light', mr: 1, mt: 0.5 }} />
              <Typography variant="body2" color="grey.300">
                123 Green Street, Farmville, CA 94107
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        {/* Bottom Divider and Copyright on mobile */}
        {isMobile && (
          <>
            <Divider sx={{ my: 4, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            <Typography variant="body2" color="grey.400" textAlign="center">
              © {new Date().getFullYear()} Fresh Connect. All rights reserved.
            </Typography>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Footer; 