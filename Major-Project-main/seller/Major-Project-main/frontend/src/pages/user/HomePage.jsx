import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Container, Grid, Card, CardMedia, CardContent, 
  CardActions, Button, TextField, Divider, Paper, CircularProgress,
  InputAdornment, IconButton, Chip, CardActionArea
} from '@mui/material';
import { 
  Search as SearchIcon, 
  ShoppingCart as ShoppingCartOutlinedIcon,
  LocalFireDepartment as FireIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  LocalOffer as LocalOfferIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [urgentSales, setUrgentSales] = useState([]);
  const [freeFoodListings, setFreeFoodListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In a real app, these would be separate API calls
    // Simulating data fetch for now
    setTimeout(() => {
      setFeaturedProducts([
        { id: 1, name: 'Fresh Tomatoes', price: 2.99, seller: 'Green Farm', image: 'https://images.unsplash.com/photo-1546104135-3b6270764760?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80', rating: 4.5 },
        { id: 2, name: 'Organic Potatoes', price: 3.99, seller: 'Nature\'s Harvest', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80', rating: 4.2 },
        { id: 3, name: 'Green Spinach', price: 1.99, seller: 'Local Gardens', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80', rating: 4.8 },
        { id: 4, name: 'Carrots', price: 2.49, seller: 'Organic Valley', image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80', rating: 4.3 },
      ]);
      
      setUrgentSales([
        { id: 101, name: 'Lettuce (Expires Tomorrow)', price: 0.99, originalPrice: 2.99, seller: 'Quick Fresh', image: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80' },
        { id: 102, name: 'Ripe Bananas', price: 1.49, originalPrice: 3.49, seller: 'Fruit Express', image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80' },
      ]);
      
      setFreeFoodListings([
        { id: 201, name: 'Day-old Bread', restaurant: 'Baker\'s Dozen', availableUntil: '5:00 PM', image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80' },
        { id: 202, name: 'Fresh Tomatoes', restaurant: 'Spice Garden', availableUntil: '8:00 PM', image: 'https://images.unsplash.com/photo-1546104135-3b6270764760?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80' },
      ]);
      
      setLoading(false);
    }, 1500);
  }, []);

  const handleSearch = () => {
    console.log('Searching for:', searchTerm);
    // In a real app, this would navigate to search results page with the query
  };

  const carouselItems = [
    { 
      title: "Fresh Vegetables Direct from Farms", 
      subtitle: "Support local farmers and enjoy the freshest produce",
      image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=600&q=80"
    },
    { 
      title: "Verified Restaurant Quality Food", 
      subtitle: "Experience restaurant-quality ingredients at home",
      image: "https://images.unsplash.com/photo-1564759224907-65b945fd0851?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=600&q=80"
    },
    { 
      title: "Free Food Available - Reduce Waste", 
      subtitle: "Join our mission to eliminate food waste in communities",
      image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=600&q=80"
    }
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading fresh deals for you...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Hero Banner with Search */}
      <Box mb={6} sx={{ 
        position: 'relative', 
        borderRadius: 4, 
        overflow: 'hidden',
        height: { xs: 300, md: 400 },
        boxShadow: 3
      }}>
        <Carousel 
          showThumbs={false} 
          infiniteLoop 
          autoPlay 
          interval={5001}
          showStatus={false}
        >
          {carouselItems.map((item, index) => (
            <Box key={index} position="relative" height="450px">
              <Box 
                component="img"
                src={item.image} 
                alt={item.title}
                sx={{
                  width: '100%',
                  height: '450px',
                  objectFit: 'cover',
                }}
              />
              <Box 
                position="absolute" 
                top={0} 
                left={0} 
                right={0} 
                bottom={0} 
                bgcolor="rgba(0,0,0,0.6)"
                display="flex" 
                alignItems="center" 
                justifyContent="center"
              >
                <Box textAlign="center" px={4} maxWidth="md">
                  <Typography 
                    variant="h3" 
                    component="h1" 
                    color="white" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 'bold',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color="white" 
                    gutterBottom
                    sx={{ 
                      opacity: 0.9,
                      mb: 3,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                    }}
                  >
                    {item.subtitle}
                  </Typography>
                  <Box maxWidth="md" mx="auto" mt={2}>
                    <TextField
                      fullWidth
                        placeholder="Search for vegetables, restaurants, or products"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      variant="outlined"
                      sx={{ 
                        bgcolor: 'white', 
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '& fieldset': { borderColor: 'transparent' },
                          '&:hover fieldset': { borderColor: 'transparent' },
                          '&.Mui-focused fieldset': { borderColor: 'transparent' }
                        }
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton 
                              onClick={handleSearch} 
                              edge="end"
                              sx={{ 
                                bgcolor: 'primary.main', 
                                color: 'white',
                                '&:hover': { bgcolor: 'primary.dark' },
                                mr: -1.5,
                                borderRadius: '0 8px 8px 0',
                                height: '100%',
                                width: '56px'
                              }}
                            >
                              <SearchIcon />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Carousel>
      </Box>

      {/* Featured Products Section */}
      <Box 
        component={motion.div}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        mb={8}
      >
        <Box 
          display="flex" 
          alignItems="center" 
          mb={2}
          component={motion.div}
          variants={fadeInUp}
        >
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ 
              fontWeight: 'bold',
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              pl: 2
            }}
          >
            Featured Products
          </Typography>
          <Button 
            component={Link} 
            to="/user/products"
            endIcon={<ArrowForwardIcon />}
            sx={{ ml: 'auto' }}
          >
            View All
          </Button>
        </Box>
        <Grid container spacing={3} mt={1}>
          {featuredProducts.map(product => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={3} 
              key={product.id}
              component={motion.div}
              variants={fadeInUp}
            >
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }
              }}>
                <CardActionArea component={Link} to="/user/products">
                  <CardMedia
                    component="img"
                    height="220"
                    image={product.image}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" gutterBottom>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {product.seller}
                    </Typography>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Typography variant="h6" color="primary.main" fontWeight="bold">
                        ₹{product.price.toFixed(2)}
                      </Typography>
                      <Box display="flex" alignItems="center" ml="auto">
                        <StarIcon fontSize="small" sx={{ color: 'gold' }} />
                        <Typography variant="body2" ml={0.5}>
                          {product.rating}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
                <CardActions>
                  <Button 
                    startIcon={<ShoppingCartOutlinedIcon />}
                    variant="contained" 
                    size="small" 
                    fullWidth
                    component={Link}
                    to="/user/cart"
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      py: 1
                    }}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Urgent Sales Section */}
      <Box 
        component={motion.div}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        mb={8}
      >
        <Box 
          display="flex" 
          alignItems="center" 
          mb={2}
          component={motion.div}
          variants={fadeInUp}
        >
          <Box 
            display="flex" 
            alignItems="center"
            sx={{ 
              borderLeft: '4px solid',
              borderColor: 'error.main',
              pl: 2
            }}
          >
            <FireIcon sx={{ color: 'error.main', mr: 1, fontSize: 28 }} />
            <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
              Urgent Sales
            </Typography>
          </Box>
          <Button 
            component={Link} 
            to="/user/urgent-sales"
            endIcon={<ArrowForwardIcon />}
            sx={{ ml: 'auto' }}
          >
            View All
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary" mb={3} pl={3}>
          Get discounted items before they expire
        </Typography>
        <Grid container spacing={3}>
          {urgentSales.map(product => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              key={product.id}
              component={motion.div}
              variants={fadeInUp}
            >
              <Card sx={{
                display: 'flex',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }
              }}>
                <CardMedia
                  component="img"
                  sx={{ width: 200, height: 180, objectFit: 'cover' }}
                  image={product.image}
                  alt={product.name}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <CardContent sx={{ flex: '1 0 auto' }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Chip 
                        icon={<ScheduleIcon fontSize="small" />}
                        label="Limited Time" 
                        color="error" 
                        size="small" 
                        sx={{ borderRadius: 1 }} 
                      />
                      <Chip 
                        icon={<LocalOfferIcon fontSize="small" />}
                        label={`${Math.round((1 - product.price/product.originalPrice) * 100)}% OFF`} 
                        size="small" 
                        sx={{ ml: 1, bgcolor: 'rgba(255, 0, 0, 0.1)', color: 'error.main', borderRadius: 1 }} 
                      />
                    </Box>
                    <Typography component="div" variant="h6">
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {product.seller}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                        ${product.originalPrice.toFixed(2)}
                      </Typography>
                      <Typography variant="h6" color="error.main" fontWeight="bold" ml={1}>
                        ₹{product.price.toFixed(2)}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      startIcon={<ShoppingCartOutlinedIcon />}
                      variant="contained" 
                      size="small"
                      color="error"
                      sx={{ 
                        mb: 1, 
                        mx: 1, 
                        borderRadius: 2,
                        textTransform: 'none',
                        py: 1
                      }}
                      fullWidth
                      component={Link}
                      to="/user/urgent-sales"
                    >
                      Buy Now
                    </Button>
                  </CardActions>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Free Food Section */}
      <Box 
        component={motion.div}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        mb={6}
      >
        <Box 
          display="flex" 
          alignItems="center" 
          mb={2}
          component={motion.div}
          variants={fadeInUp}
        >
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ 
              fontWeight: 'bold',
              borderLeft: '4px solid',
              borderColor: 'success.main',
              pl: 2
            }}
          >
            Free Food Listings
          </Typography>
          <Button 
            component={Link} 
            to="/user/free-food"
            endIcon={<ArrowForwardIcon />}
            sx={{ ml: 'auto' }}
          >
            View All
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary" mb={3} pl={3}>
          Help reduce food waste and support the community
        </Typography>
        <Grid container spacing={3}>
          {freeFoodListings.map(item => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              key={item.id}
              component={motion.div}
              variants={fadeInUp}
            >
              <Card sx={{
                display: 'flex',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }
              }}>
                <CardMedia
                  component="img"
                  sx={{ width: 200, height: 180, objectFit: 'cover' }}
                  image={item.image}
                  alt={item.name}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <CardContent sx={{ flex: '1 0 auto' }}>
                    <Chip 
                      label="Free" 
                      color="success" 
                      size="small" 
                      sx={{ mb: 1, borderRadius: 1 }} 
                    />
                    <Typography component="div" variant="h6">
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.restaurant}
                    </Typography>
                    <Typography variant="body2" mt={1}>
                      Available until: <strong>{item.availableUntil}</strong>
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      variant="outlined" 
                      color="success"
                      size="small"
                      sx={{ 
                        mb: 1, 
                        mx: 1, 
                        borderRadius: 2,
                        textTransform: 'none',
                        py: 1
                      }}
                      fullWidth
                      component={Link}
                      to="/user/free-food"
                    >
                      Claim
                    </Button>
                  </CardActions>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage; 