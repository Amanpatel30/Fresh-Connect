import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  Paper,
  InputBase,
  Badge,
  List,
  ListItem,
  ListItemText,
  ClickAwayListener,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Description as OrderIcon,
  FolderOpen as PageIcon,
} from '@mui/icons-material';
import { globalSearch } from '../services/SearchService';

/**
 * Dynamic header component for the admin dashboard
 */
const Header = (props) => {
  // Use provided props directly without context to avoid circular dependencies
  const {
    appName = 'FreshConnect',
    appNameStyleFirst = { color: '#2E7D32' },
    appNameStyleSecond = { color: '#66BB6A' },
    notificationCount = 0,
    searchPlaceholder = 'Search...',
    userName = 'User',
    userAvatar = null,
    onSearchChange = () => {},
    onNotificationClick = () => {},
    onProfileClick = () => {},
  } = props;

  // Local state for search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const searchRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Split the app name into two parts if it contains camel case
  const splitAppName = () => {
    if (!appName) return { first: '', second: '' };
    
    // Find the first uppercase letter after the first character
    const match = appName.match(/^([A-Za-z]+)([A-Z][a-z]+.*)$/);
    if (match) {
      return {
        first: match[1],
        second: match[2]
      };
    }
    
    // If no camel case is found, return the whole name as first part
    return {
      first: appName,
      second: ''
    };
  };

  const { first, second } = splitAppName();

  // Handle search input change with debounce
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't search if query is too short
    if (value.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Set loading state
    setIsLoading(true);
    setShowResults(true);

    // Debounce the search request
    debounceTimerRef.current = setTimeout(() => {
      // Use the SearchService to fetch results
      performSearch(value);
      
      // Also call the parent's onSearchChange if provided
      onSearchChange(value);
    }, 300);
  };

  // Fetch search results using the SearchService
  const performSearch = async (query) => {
    try {
      const results = await globalSearch(query, { 
        category: selectedCategory,
      });
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle click on a search result
  const handleResultClick = (result) => {
    console.log('Selected result:', result);
    // TODO: Implement navigation or action based on result
    setShowResults(false);

    // For now, just notify the parent
    onSearchChange(result.title, result);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  // Close results dropdown when clicking outside
  const handleClickAway = () => {
    setShowResults(false);
  };

  // Filter by category
  const handleCategoryFilter = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
    
    // Re-run search with the new category if we have a query
    if (searchQuery.length >= 2) {
      setIsLoading(true);
      performSearch(searchQuery);
    }
  };

  // Get icon for result type
  const getIconForType = (type) => {
    switch (type) {
      case 'product':
        return <CartIcon fontSize="small" color="primary" />;
      case 'user':
        return <PersonIcon fontSize="small" color="success" />;
      case 'order':
        return <OrderIcon fontSize="small" color="secondary" />;
      case 'page':
      default:
        return <PageIcon fontSize="small" color="action" />;
    }
  };

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Grouped search results by type
  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {});

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      py: 2.5,
      px: 4,
      position: 'sticky',
      top: 0,
      zIndex: 1100,
      backgroundColor: 'rgba(230, 230, 235, 0.95)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid rgba(0,0,0,0.05)'
    }}>
      <Typography 
        variant="h4" 
        component="h1" 
        fontWeight="bold"
        sx={{ 
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <span style={appNameStyleFirst}>{first}</span>
        {second && <span style={appNameStyleSecond}>{second}</span>}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Search with AJAX dropdown */}
        <ClickAwayListener onClickAway={handleClickAway}>
          <Box ref={searchRef} sx={{ position: 'relative' }}>
            <Paper
              component="form"
              onSubmit={(e) => e.preventDefault()}
              sx={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: 3,
                px: 2,
                py: 0.5,
                mr: 2,
                width: '300px'
              }}
            >
              <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              <InputBase
                placeholder={searchPlaceholder}
                sx={{ color: 'text.primary', flexGrow: 1 }}
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <>
                  {isLoading ? (
                    <CircularProgress size={20} sx={{ mr: 0.5 }} />
                  ) : (
                    <IconButton size="small" onClick={clearSearch}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </>
              )}
            </Paper>

            {/* Search Results Dropdown */}
            {showResults && (searchResults.length > 0 || isLoading) && (
              <Paper
                sx={{
                  position: 'absolute',
                  width: '350px',
                  mt: 0.5,
                  borderRadius: 2,
                  boxShadow: 3,
                  maxHeight: '450px',
                  overflowY: 'auto',
                  zIndex: 1200,
                }}
                elevation={3}
              >
                {/* Category filters */}
                {searchResults.length > 0 && (
                  <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {Object.keys(groupedResults).map(category => (
                      <Chip
                        key={category}
                        label={`${category} (${groupedResults[category].length})`}
                        size="small"
                        color={selectedCategory === category ? "primary" : "default"}
                        onClick={() => handleCategoryFilter(category)}
                        clickable
                      />
                    ))}
                  </Box>
                )}

                {isLoading ? (
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <>
                    {searchResults.length > 0 ? (
                      <List sx={{ py: 0 }}>
                        {Object.keys(groupedResults).map(type => {
                          // Skip if category filter is applied and doesn't match
                          if (selectedCategory && type !== selectedCategory) {
                            return null;
                          }
                          
                          const resultsForType = groupedResults[type];
                          return (
                            <React.Fragment key={type}>
                              <Box 
                                sx={{ 
                                  px: 2, 
                                  py: 0.5, 
                                  backgroundColor: 'action.hover',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}
                              >
                                {getIconForType(type)}
                                <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                                  {type}
                                </Typography>
                              </Box>
                              {resultsForType.map(result => (
                                <ListItem 
                                  key={result.id} 
                                  button 
                                  dense
                                  onClick={() => handleResultClick(result)}
                                  sx={{ 
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    py: 1
                                  }}
                                >
                                  <ListItemText 
                                    primary={result.title} 
                                    secondary={
                                      result.type === 'product' ? `SKU: ${result.sku} - $${result.price}` :
                                      result.type === 'order' ? `Customer: ${result.customer}` :
                                      result.type === 'user' ? result.email :
                                      result.path
                                    }
                                    primaryTypographyProps={{
                                      fontWeight: 500
                                    }}
                                  />
                                </ListItem>
                              ))}
                            </React.Fragment>
                          );
                        })}
                      </List>
                    ) : (
                      searchQuery.length >= 2 && (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            No results found for "{searchQuery}"
                          </Typography>
                        </Box>
                      )
                    )}
                  </>
                )}
              </Paper>
            )}
          </Box>
        </ClickAwayListener>

        {/* Notifications */}
        <IconButton onClick={onNotificationClick}>
          <Badge badgeContent={notificationCount} color="primary">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* Profile */}
        <Tooltip title={userName || 'Profile'}>
          <IconButton onClick={onProfileClick}>
            <Avatar 
              src={userAvatar} 
              alt={userName}
              sx={{ width: 32, height: 32 }}
            />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

Header.propTypes = {
  appName: PropTypes.string,
  appNameStyleFirst: PropTypes.object,
  appNameStyleSecond: PropTypes.object,
  notificationCount: PropTypes.number,
  searchPlaceholder: PropTypes.string,
  userName: PropTypes.string,
  userAvatar: PropTypes.string,
  onSearchChange: PropTypes.func,
  onNotificationClick: PropTypes.func,
  onProfileClick: PropTypes.func,
};

export default Header; 