import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, Typography, Container, Grid, Card, CardMedia, CardContent, 
  CardActions, Button, Divider, Tabs, Tab, CircularProgress,
  IconButton, Chip, Menu, MenuItem, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, FormControl, 
  InputLabel, Select, Badge, Tooltip, AppBar, Toolbar,
  useScrollTrigger, Slide, InputAdornment, Paper, Avatar
} from '@mui/material';
import { 
  Favorite as HeartFilledIcon,
  FavoriteBorder as HeartOutlinedIcon,
  ShoppingCart as ShoppingCartIcon,
  Delete as DeleteIcon, 
  MoreVert as EllipsisIcon, 
  Share as ShareIcon, 
  Add as PlusIcon, 
  Star as StarIcon, 
  FilterList as FilterIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
  List as ListIcon,
  Spa as LeafIcon
} from '@mui/icons-material';
import {
  ShoppingCartOutlined, HeartFilled, DeleteOutlined,
  ShopOutlined, EnvironmentOutlined
} from '@ant-design/icons';
import {
  Card as AntCard, Row, Col, Empty, notification, Image
} from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Meta } = AntCard;

// Hide AppBar on scroll
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

// Header Component
const Header = () => {
  return (
    <HideOnScroll>
      <AppBar position="sticky" sx={{ 
        bgcolor: 'background.paper', 
        backgroundImage: 'none',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        color: 'text.primary'
      }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                boxShadow: '0 2px 12px rgba(76, 175, 80, 0.2)',
                mr: 2
              }}
            >
              <LeafIcon sx={{ color: '#fff', fontSize: 24 }} />
            </Box>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 'bold',
                letterSpacing: '0.5px'
              }}
            >
              Fresh Connect
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' }, mx: 2 }}>
            <Paper
              component="form"
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: { sm: '100%', md: '400px' },
                borderRadius: 2,
                boxShadow: 'none',
                border: '1px solid #e0e0e0'
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Search products, sellers..."
                inputProps={{ 'aria-label': 'search products' }}
              />
              <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                <SearchIcon />
              </IconButton>
            </Paper>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton component={Link} to="/" color="inherit">
              <HomeIcon />
            </IconButton>
            <IconButton component={Link} to="/wishlist" color="inherit" sx={{ mx: 1 }}>
              <Badge badgeContent={8} color="error">
                <HeartFilledIcon />
              </Badge>
            </IconButton>
            <IconButton component={Link} to="/cart" color="inherit">
              <Badge badgeContent={3} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit" sx={{ ml: 1 }}>
              <Badge badgeContent={2} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              edge="end"
              color="inherit"
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                <PersonIcon fontSize="small" />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
};

// Footer Component
const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.mode === 'light' ? '#f5f5f5' : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
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
                  mr: 2
                }}
              >
                <LeafIcon sx={{ color: '#fff', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" fontWeight="bold">
                Fresh Connect
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Connecting farmers, restaurants, and consumers for fresher food and less waste.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Fresh Connect. All rights reserved.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Explore
            </Typography>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Home
              </Typography>
            </Link>
            <Link to="/market" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Market
              </Typography>
            </Link>
            <Link to="/restaurants" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Restaurants
              </Typography>
            </Link>
            <Link to="/urgent-sales" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Urgent Sales
              </Typography>
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Account
            </Typography>
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                My Profile
              </Typography>
            </Link>
            <Link to="/orders" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                My Orders
              </Typography>
            </Link>
            <Link to="/wishlist" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Wishlist
              </Typography>
            </Link>
            <Link to="/settings" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Settings
              </Typography>
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Get Connected
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Subscribe to receive updates and exclusive offers.
            </Typography>
            <Box sx={{ display: 'flex', mt: 1 }}>
              <TextField
                size="small"
                label="Email"
                variant="outlined"
                fullWidth
                sx={{ mr: 1 }}
              />
              <Button variant="contained" color="primary" sx={{ minWidth: '100px' }}>
                Subscribe
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const Wishlist = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [createListModalVisible, setCreateListModalVisible] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [customLists, setCustomLists] = useState([
    { id: 'vegetables', name: 'Vegetables', items: [1, 2, 5] },
    { id: 'fruits', name: 'Fruits', items: [3, 4] },
    { id: 'favorites', name: 'Favorites', items: [1, 3, 6] }
  ]);
  const [loading, setLoading] = useState(true);
  
  // Simulated data (would come from API in a real app)
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setWishlistItems([
        {
          id: 1,
          name: 'Organic Tomatoes',
          image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80',
          category: ['Vegetables', 'Organic'],
          rating: 4.5,
          reviews: 28,
          price: 40,
          originalPrice: 80,
          discount: 50,
          seller: 'Green Farms',
          sellerRating: 4.7,
          location: 'Mumbai, Maharashtra',
          distance: 2.5,
          quantity: '1 kg',
          freeDelivery: true
        },
        {
          id: 2,
          name: 'Fresh Spinach Bundle',
          image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80',
          category: ['Leafy Greens', 'Organic'],
          rating: 4.2,
          reviews: 15,
          price: 25,
          originalPrice: 60,
          discount: 58,
          seller: 'Organic Valley',
          sellerRating: 4.5,
          location: 'Mumbai, Maharashtra',
          distance: 3.8,
          quantity: '500g',
          freeDelivery: false
        }
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  const handleAddToCart = (item) => {
    notification.success({
      message: 'Added to Cart',
      description: `${item.name} has been added to your cart.`,
      placement: 'bottomRight',
    });
  };

  const handleRemoveFromWishlist = (itemId) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== itemId));
    notification.success({
      message: 'Removed from Wishlist',
      description: 'Item has been removed from your wishlist.',
      placement: 'bottomRight',
    });
  };

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleShare = (item) => {
    // In a real app, this would open a share dialog
    console.log(`Sharing ${item.name}`);
    alert(`Sharing ${item.name}`);
    handleMenuClose();
  };

  const handleCreateList = () => {
    // Implement create list logic here
    setCreateListModalVisible(false);
  };

  const handleMoveToList = (listId) => {
    if (!selectedItem) return;
    
    // In a real app, this would be an API call to move item to a different list
    const itemId = selectedItem.id;
    
    // Update local state to reflect the move
    setCustomLists(prev => 
      prev.map(list => {
      if (list.id === listId) {
          // Add item to this list if not already there
          return {
            ...list,
            items: list.items.includes(itemId) ? list.items : [...list.items, itemId]
          };
        } else {
          // Remove item from other lists
        return {
          ...list,
            items: list.id !== 'all' ? list.items.filter(id => id !== itemId) : list.items
          };
        }
      })
    );
    
    handleMenuClose();
    alert(`Item moved to ${customLists.find(list => list.id === listId)?.name}`);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Filter items based on active tab
  const getFilteredItems = () => {
    if (activeTab === 'all') {
      return wishlistItems;
    }
    
    const activeList = customLists.find(list => list.id === activeTab);
    
    if (!activeList) return [];
    
    return wishlistItems.filter(item => activeList.items.includes(item.id));
  };

  const filteredItems = getFilteredItems();

  // Banner image for the top of the wishlist
  const bannerImage = "https://images.unsplash.com/photo-1543168256-418811576931?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80";

  const renderWishlistItem = (item) => (
    <AntCard
        hoverable
      className="mb-4"
        cover={
          <div className="relative">
            <img 
              alt={item.name} 
              src={item.image} 
            className="h-48 w-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <Button
              type="text"
              icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
              onClick={() => handleRemoveFromWishlist(item.id)}
              className="bg-white bg-opacity-70 hover:bg-white"
            />
              </div>
          {item.discount > 0 && (
            <Tag color="red" className="absolute top-2 left-2">
              {item.discount}% OFF
              </Tag>
            )}
        </div>
      }
    >
      <Meta
        avatar={<Avatar src={item.thumbnail} size={64} />}
        title={
          <div className="flex justify-between items-center">
            <Text strong>{item.name}</Text>
            <HeartFilled style={{ color: '#ff4d4f' }} />
          </div>
        }
        description={
          <Space direction="vertical" size={2} className="w-full">
            <div className="flex items-center">
              <Rate disabled defaultValue={item.rating} size="small" />
              <Text className="ml-2">{item.rating} ({item.reviews})</Text>
            </div>
            <div>
              {item.category.map((type, index) => (
                <Tag key={index}>{type}</Tag>
              ))}
            </div>
            <div className="flex items-center">
              <Text type="secondary" delete>₹{item.originalPrice}</Text>
              <Text strong className="ml-2 text-red-500">₹{item.price}</Text>
              <Text className="ml-2">for {item.quantity}</Text>
            </div>
            <Text type="secondary">
              <ShopOutlined className="mr-1" />
              {item.seller} ({item.sellerRating}★)
            </Text>
            <Text type="secondary">
              <EnvironmentOutlined className="mr-1" />
              {item.location} ({item.distance} km)
            </Text>
            <div className="flex justify-between mt-2">
          <Button 
            type="primary" 
                size="small" 
            icon={<ShoppingCartOutlined />} 
            onClick={() => handleAddToCart(item)}
          >
            Add to Cart
              </Button>
              {item.freeDelivery && (
                <Tag color="green">Free Delivery</Tag>
              )}
            </div>
          </Space>
        }
      />
    </AntCard>
  );

  if (loading) {
    return (
      <>
        <Header />
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      {/* Banner Image */}
      <Box 
        sx={{ 
          position: 'relative', 
          height: '200px', 
          overflow: 'hidden',
          mb: 4 
        }}
      >
        <Box 
          component="img"
          src={bannerImage}
          alt="Wishlist Banner"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'rgba(0,0,0,0.4)',
          }}
        >
          <Typography variant="h3" component="h1" color="white" fontWeight="bold">
            My Wishlist
          </Typography>
        </Box>
      </Box>
      
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Box mb={4}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
            Saved Items
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {wishlistItems.length} items saved to your wishlist
          </Typography>
        </Box>

        {/* Tabs Section */}
        <Box sx={{ width: '100%', mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="All Items" value="all" />
              {customLists.map(list => (
                <Tab 
                  key={list.id}
                  label={
                    <Box display="flex" alignItems="center">
                      {list.name}
                      <Chip 
                        label={list.items.length} 
                        size="small" 
                        sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                      />
                    </Box>
                  } 
                  value={list.id} 
                />
              ))}
              <Tab 
                label={
                  <Tooltip title="Create New List">
                    <PlusIcon fontSize="small" />
                  </Tooltip>
                } 
                onClick={() => setCreateListModalVisible(true)}
                sx={{ minWidth: 40 }}
              />
            </Tabs>
          </Box>
        </Box>

        {filteredItems.length === 0 ? (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            py={8}
          >
            <HeartOutlinedIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No items in this wishlist
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Browse products and click the heart icon to add items to your wishlist
            </Typography>
            <Button
              variant="contained" 
              component={Link} 
              to="/market"
            >
              Browse Products
            </Button>
          </Box>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredItems.map(item => (
              <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
                {renderWishlistItem(item)}
              </Col>
            ))}
          </Row>
        )}

        {/* Recently Viewed Section */}
        <Box mt={8}>
          <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
            You Might Also Like
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={6} sm={3} key={item}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    }
                  }}
                >
                  <CardActionArea component={Link} to={`/product/${item}`}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={item === 1 
                        ? 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' 
                        : item === 2 
                        ? 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' 
                        : item === 3 
                        ? 'https://images.unsplash.com/photo-1563746924237-f81995620081?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' 
                        : 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}
                      alt={`Suggested Product ${item}`}
                    />
                    <CardContent>
                      <Typography variant="body2" component="div">
                        {item === 1 ? 'Fresh Avocados' : item === 2 ? 'Organic Honey' : item === 3 ? 'Mixed Berries' : 'Artisan Cheese'}
                      </Typography>
                      <Typography variant="body2" color="primary.main" fontWeight="bold">
                        ${(item * 2 + 1.99).toFixed(2)}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Item Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => selectedItem && handleShare(selectedItem)}>
            <ShareIcon fontSize="small" sx={{ mr: 1 }} />
            Share
          </MenuItem>
          <Divider />
          <Typography variant="caption" sx={{ px: 2, py: 0.5, display: 'block', color: 'text.secondary' }}>
            Move to List
          </Typography>
          {customLists.map(list => (
            <MenuItem 
              key={list.id}
              onClick={() => handleMoveToList(list.id)}
              dense
            >
              {list.name}
            </MenuItem>
          ))}
        </Menu>

        {/* Create List Dialog */}
        <Dialog 
        open={createListModalVisible}
          onClose={() => setCreateListModalVisible(false)}
        >
          <DialogTitle>Create New Wishlist</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
            label="List Name"
              type="text"
              fullWidth
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateListModalVisible(false)}>Cancel</Button>
            <Button onClick={handleCreateList} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>
      </Container>
      
      <Footer />
    </Box>
  );
};

export default Wishlist; 