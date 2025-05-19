import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Container,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  InputBase
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  NotificationsNone as NotificationIcon,
  Home as HomeIcon,
  Store as StoreIcon,
  Restaurant,
  LocalOffer,
  CardGiftcard,
  Person as PersonIcon
} from '@mui/icons-material';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { title: 'Market', icon: <StoreIcon />, link: '/user/products' },
    { title: 'Restaurants', icon: <Restaurant />, link: '/user/restaurants' },
    { title: 'Urgent Sales', icon: <LocalOffer />, link: '/user/urgent-sales' },
    { title: 'Free Food', icon: <CardGiftcard />, link: '/user/free-food' },
  ];

  return (
    <>
      <AppBar position="fixed" color="default" elevation={1}>
        <Container maxWidth="xl">
          <Toolbar>
            {/* Logo */}
            <Box component={RouterLink} to="/user" sx={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
                Fresh Connect
              </Typography>
            </Box>

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ ml: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Desktop Navigation */}
            {!isMobile && (
              <>
                <Box sx={{ ml: 4, display: 'flex' }}>
                  {menuItems.map((item) => (
                    <Button
                      key={item.title}
                      component={RouterLink}
                      to={item.link}
                      color="inherit"
                      sx={{ mx: 1 }}
                    >
                      {item.title}
                    </Button>
                  ))}
                </Box>

                {/* Search Bar */}
                <Box sx={{ flexGrow: 1, ml: 2, display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    bgcolor: 'background.paper', 
                    px: 2, 
                    py: 0.5, 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                    <InputBase
                      placeholder="Search..."
                      sx={{ width: 200 }}
                    />
                  </Box>
                </Box>
              </>
            )}

            {/* Action Icons */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton color="inherit" component={RouterLink} to="/user/wishlist">
                <Badge badgeContent={4} color="error">
                  <FavoriteIcon />
                </Badge>
              </IconButton>
              
              <IconButton color="inherit" component={RouterLink} to="/user/cart">
                <Badge badgeContent={3} color="error">
                  <CartIcon />
                </Badge>
              </IconButton>

              <IconButton color="inherit">
                <Badge badgeContent={7} color="error">
                  <NotificationIcon />
                </Badge>
              </IconButton>

              <IconButton
                edge="end"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  <PersonIcon />
                </Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <List>
            <ListItem>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Fresh Connect
                </Typography>
              </Box>
            </ListItem>
            
            <ListItem>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                bgcolor: 'background.paper', 
                p: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                width: '100%'
              }}>
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <InputBase
                  placeholder="Search..."
                  fullWidth
                />
              </Box>
            </ListItem>

            <Divider sx={{ my: 1 }} />

            <ListItem button component={RouterLink} to="/user" onClick={() => setMobileMenuOpen(false)}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>

            {menuItems.map((item) => (
              <ListItem
                key={item.title}
                button
                component={RouterLink}
                to={item.link}
                onClick={() => setMobileMenuOpen(false)}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItem>
            ))}

            <Divider sx={{ my: 1 }} />

            <ListItem button component={RouterLink} to="/user/profile" onClick={() => setMobileMenuOpen(false)}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="My Profile" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
      >
        <MenuItem component={RouterLink} to="/user/profile">Profile</MenuItem>
        <MenuItem component={RouterLink} to="/user/orders">My Orders</MenuItem>
        <MenuItem component={RouterLink} to="/user/settings">Settings</MenuItem>
        <Divider />
        <MenuItem component={RouterLink} to="/logout">Logout</MenuItem>
      </Menu>

      {/* Toolbar offset */}
      <Toolbar />
    </>
  );
};

export default Header; 