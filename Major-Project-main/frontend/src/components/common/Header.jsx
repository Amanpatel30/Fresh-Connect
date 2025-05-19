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
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ShoppingCart,
  Assignment as OrdersIcon,
  Star as StarIcon
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

  const mainMenuItems = [
    { title: 'Market', icon: <StoreIcon />, link: '/products' },
    { title: 'Restaurants', icon: <Restaurant />, link: '/restaurants' },
    { title: 'Urgent Sales', icon: <LocalOffer />, link: '/urgent-sales' },
    { title: 'Free Food', icon: <CardGiftcard />, link: '/free-food' },
  ];

  const userMenuItems = [
    { title: 'Orders', icon: <OrdersIcon />, link: '/profile?tab=orders' },
    { title: 'Reviews', icon: <StarIcon />, link: '/profile?tab=reviews' },
    { title: 'Wishlist', icon: <FavoriteIcon />, link: '/profile?tab=wishlist' },
    { title: 'Settings', icon: <SettingsIcon />, link: '/profile?tab=settings' },
  ];

  return (
    <>
      <AppBar position="fixed" color="default" elevation={1}>
        <Container maxWidth="xl">
          <Toolbar>
            {/* Logo */}
            <Box component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
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
                  {mainMenuItems.map((item) => (
                    <Button
                      key={item.title}
                      component={RouterLink}
                      to={item.link}
                      color="inherit"
                      startIcon={item.icon}
                      sx={{ mx: 1 }}
                    >
                      {item.title}
                    </Button>
                  ))}
                </Box>

                {/* User Navigation */}
                <Box sx={{ ml: 2, display: 'flex' }}>
                  {userMenuItems.map((item) => (
                    <Button
                      key={item.title}
                      component={RouterLink}
                      to={item.link}
                      color="inherit"
                      startIcon={item.icon}
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
              <IconButton color="inherit" component={RouterLink} to="/profile?tab=wishlist">
                <Badge badgeContent={4} color="error">
                  <FavoriteIcon />
                </Badge>
              </IconButton>
              
              <IconButton color="inherit" component={RouterLink} to="/cart">
                <Badge badgeContent={3} color="error">
                  <CartIcon />
                </Badge>
              </IconButton>

              <IconButton color="inherit" component={RouterLink} to="/notifications">
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

            <ListItem button component={RouterLink} to="/" onClick={() => setMobileMenuOpen(false)}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>

            {mainMenuItems.map((item) => (
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

            <ListItem button component={RouterLink} to="/profile" onClick={() => setMobileMenuOpen(false)}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="My Profile" />
            </ListItem>

            {userMenuItems.map((item) => (
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
          </List>
        </Box>
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            borderRadius: 2,
            minWidth: 180,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
              borderRadius: 1,
              mb: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.04)'
              }
            }
          }
        }}
      >
        <MenuItem component={RouterLink} to="/profile" sx={{ fontWeight: 500 }}>
          <PersonIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
          Profile Dashboard
        </MenuItem>
        <MenuItem component={RouterLink} to="/profile?tab=orders" sx={{ fontWeight: 500 }}>
          <ShoppingCart fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
          My Orders
        </MenuItem>
        <MenuItem component={RouterLink} to="/profile?tab=reviews" sx={{ fontWeight: 500 }}>
          <StarIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
          Reviews & Ratings
        </MenuItem>
        <MenuItem component={RouterLink} to="/profile?tab=wishlist" sx={{ fontWeight: 500 }}>
          <FavoriteIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
          My Wishlist
        </MenuItem>
        <MenuItem component={RouterLink} to="/profile?tab=settings" sx={{ fontWeight: 500 }}>
          <SettingsIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
          Settings
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem component={RouterLink} to="/logout" sx={{ color: 'error.main', fontWeight: 500 }}>
          <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Toolbar offset */}
      <Toolbar />
    </>
  );
};

export default Header; 