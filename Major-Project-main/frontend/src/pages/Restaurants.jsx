import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Typography, Input, Button, Tag, Space,
  Rate, List, Avatar, Divider, Select, Pagination, Empty,
  Spin, Badge, Tooltip, Tabs, Checkbox, Slider, Drawer,
  Image, Carousel, Progress, notification, Radio, 
} from 'antd';
import {
  SearchOutlined, EnvironmentOutlined, PhoneOutlined,
  ClockCircleOutlined, CheckCircleOutlined, FilterOutlined,
  StarOutlined, HeartOutlined, HeartFilled, ShopOutlined,
  SortAscendingOutlined, MenuOutlined, InfoCircleOutlined,
  LeftOutlined, RightOutlined, ThunderboltOutlined, FireOutlined
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getVerifiedHotels } from '../services/api';
import { useThemeMode } from '../context/ThemeContext';
import './RestaurantsPage.css'; // Create a dedicated CSS file

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Meta } = Card;

const Restaurants = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('verified');
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    cuisine: [],
    rating: 0,
    priceRange: [0, 1000],
    verified: false,
    openNow: false,
    nearby: false
  });
  const [sortBy, setSortBy] = useState('rating');
  const { mode } = useThemeMode();
  const navigate = useNavigate();

  // Parse URL parameters for filtering
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    // Check for filter parameter
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      // Set the active tab based on filter parameter
      setActiveTab(filterParam);
      
      // Apply specific filter based on the parameter
      if (filterParam === 'verified') {
        setFilters(prev => ({...prev, verified: true}));
      } else if (filterParam === 'specials') {
        // Handle specials filter - this might require additional restaurant data properties
        // For now, we'll assume restaurants have a 'hasSpecials' property
      } else if (filterParam === 'nearby') {
        setFilters(prev => ({...prev, nearby: true}));
      }
    }
  }, [location.search]);

  // Fetch data on initial load
  useEffect(() => {
    fetchRestaurants();

    // Load favorites from localStorage if available
    const savedFavorites = localStorage.getItem('restaurantFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Error loading favorites:', e);
      }
    }
  }, []);

  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFiltersAndSort();
  }, [restaurants, searchQuery, filters, sortBy, activeTab]);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('restaurantFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      console.log('Fetching restaurants data...');

      const response = await getVerifiedHotels();
      console.log('Response data:', response);

      // Handle different response formats
      let restaurantsData = [];
      if (Array.isArray(response)) {
        restaurantsData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        restaurantsData = response.data;
      } else if (response && response.value && Array.isArray(response.value)) {
        restaurantsData = response.value;
      }
      
      console.log('Processed restaurants data:', restaurantsData);
      
      if (restaurantsData.length > 0) {
        // Transform the data to include additional fields if needed but preserve original data
        const transformedRestaurants = restaurantsData.map(restaurant => ({
          ...restaurant,
          rating: restaurant.rating || 4.5,
          reviews: restaurant.numReviews || restaurant.reviews || 0,
          image: restaurant.coverImage || restaurant.logo || 'https://via.placeholder.com/400x200?text=No+Image',
          description: restaurant.description || 'Specializing in authentic cuisine',
          openingHours: restaurant.openingHours || '9:00 AM - 10:00 PM',
          distance: restaurant.distance || 2.5,
          cuisine: restaurant.cuisine || ['Italian', 'Fast Food'],
          // Explicitly set required filter properties
          isVerified: restaurant.isVerified || false,
          isOpen: true, // Default to open to ensure they show up
          hasDiscount: restaurant.hasDiscount || false,
          discountPercentage: restaurant.discountPercentage || 0,
          // Get address from restaurant object structure
          address: restaurant.address || {}
        }));
        
        console.log('Transformed restaurant data:', transformedRestaurants[0]); // Log example for debugging
        
        setRestaurants(transformedRestaurants);
        setFilteredRestaurants(transformedRestaurants);
      } else {
        setFilteredRestaurants([]);
        setError('No restaurants found');
      }
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError('Failed to fetch restaurants. Please try again later.');
      setFilteredRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    if (!restaurants || !restaurants.length) return;
    
    let result = [...restaurants];
    console.log('Starting filter with', result.length, 'restaurants');
    
    // Apply search filter
    if (searchQuery && searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        restaurant => 
          (restaurant.name && restaurant.name.toLowerCase().includes(query)) ||
          (restaurant.description && restaurant.description.toLowerCase().includes(query)) ||
          (restaurant.cuisine && Array.isArray(restaurant.cuisine) && restaurant.cuisine.some(c => c.toLowerCase().includes(query)))
      );
      console.log('After search filter:', result.length);
    }
    
    // Apply tab filter - more permissive checks
    if (activeTab === 'verified') {
      result = result.filter(restaurant => restaurant.isVerified === true);
      console.log('After verified filter:', result.length);
    } else if (activeTab === 'nearby') {
      result = result.filter(restaurant => !restaurant.distance || parseFloat(restaurant.distance) < 5);
      console.log('After nearby filter:', result.length);
    } else if (activeTab === 'favorites') {
      result = result.filter(restaurant => favorites.includes(restaurant._id));
      console.log('After favorites filter:', result.length);
    } else if (activeTab === 'trending') {
      result = result.filter(restaurant => restaurant.rating >= 4.0);
      console.log('After trending filter:', result.length);
    }
    
    // Apply advanced filters - more defensive checks
    if (filters.rating > 0) {
      result = result.filter(restaurant => restaurant.rating >= filters.rating);
      console.log('After rating filter:', result.length);
    }
    
    if (filters.cuisine && filters.cuisine.length > 0) {
      result = result.filter(
        restaurant => 
          restaurant.cuisine && Array.isArray(restaurant.cuisine) && 
          restaurant.cuisine.some(cuisine => filters.cuisine.includes(cuisine))
      );
      console.log('After cuisine filter:', result.length);
    }
    
    if (filters.verified) {
      result = result.filter(restaurant => restaurant.isVerified === true);
      console.log('After verified filter:', result.length);
    }

    if (filters.openNow) {
      // Always show restaurants if openNow filter is applied since we don't have real open/closed status
      result = result.filter(restaurant => restaurant.isOpen !== false);
      console.log('After openNow filter:', result.length);
    }
    
    if (filters.nearby) {
      result = result.filter(restaurant => !restaurant.distance || parseFloat(restaurant.distance) < 5);
      console.log('After nearby filter:', result.length);
    }
    
    // Apply price range filter
    if (filters.priceRange && filters.priceRange.length === 2) {
      // Only apply if restaurant has price range
      result = result.filter(
        restaurant => 
          !restaurant.priceRange || (
            restaurant.priceRange &&
            restaurant.priceRange[0] >= filters.priceRange[0] && 
            restaurant.priceRange[1] <= filters.priceRange[1]
          )
      );
      console.log('After price filter:', result.length);
    }
    
    // Apply sorting
    if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'reviews') {
      result.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    } else if (sortBy === 'distance') {
      result.sort((a, b) => parseFloat(a.distance || 999) - parseFloat(b.distance || 999));
    } else if (sortBy === 'name') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'discount') {
      result.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
    }
    
    console.log('Final filtered restaurants:', result.length);
    setFilteredRestaurants(result);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleViewDetails = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setDetailsDrawerVisible(true);
  };

  const handleToggleFavorite = (id, e) => {
    if (e) e.stopPropagation();
    
    setFavorites(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        notification.success({
          message: 'Added to Favorites',
          description: 'Restaurant has been added to your favorites.',
          placement: 'bottomRight',
        });
        return [...prev, id];
      }
    });
  };

  const resetFilters = () => {
    setFilters({
      cuisine: [],
      rating: 0,
      priceRange: [0, 1000],
      verified: false,
      openNow: false,
      nearby: false
    });
    setSearchQuery('');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Calculate pagination
  const paginatedRestaurants = filteredRestaurants.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '20px' }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <div className="page-header">
            <Title level={2}>
              <ShopOutlined /> Restaurants
            </Title>
            
            <div style={{ display: 'flex', marginBottom: '16px' }}>
              <Button 
                type="primary" 
                ghost 
                icon={<StarOutlined />}
                onClick={() => navigate('/reviews')}
                style={{ marginRight: '10px' }}
              >
                Reviews & Feedback
              </Button>
            </div>
            
            <div className="search-section">
              <Search
                placeholder="Search restaurants..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={handleSearch}
              />
              <Button
                icon={<FilterOutlined />}
                size="large"
                onClick={() => setFilterDrawerVisible(true)}
              >
                Filters
              </Button>
            </div>
          </div>
        </Col>
        
        <Col span={24}>
          <Tabs 
            activeKey={activeTab} 
            onChange={handleTabChange} 
            size="large" 
            type="card"
            items={[
              {
                key: 'all',
                label: <span><FireOutlined /> All Restaurants</span>
              },
              {
                key: 'verified',
                label: <span><CheckCircleOutlined /> Verified Partners</span>
              },
              {
                key: 'nearby',
                label: <span><EnvironmentOutlined /> Nearby</span>
              },
              {
                key: 'trending',
                label: <span><StarOutlined /> Trending</span>
              },
              {
                key: 'favorites',
                label: <span><HeartOutlined /> Favorites</span>
              }
            ]}
          />
        </Col>

        <Col span={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <Text type="secondary">
              {filteredRestaurants.length} restaurants found
            </Text>
            <div>
              <Text>Sort by:</Text>
              <Select
                defaultValue="rating"
                value={sortBy}
                onChange={handleSortChange}
                style={{ width: 180, marginLeft: 8 }}
              >
                <Option value="rating">Rating (High to Low)</Option>
                <Option value="reviews">Most Reviewed</Option>
                <Option value="distance">Nearest First</Option>
                <Option value="name">Name A-Z</Option>
                <Option value="discount">Highest Discount</Option>
              </Select>
            </div>
          </div>
        </Col>

        {filteredRestaurants.length > 0 ? (
          <>
            <Col span={24}>
              <Row gutter={[16, 16]}>
                {paginatedRestaurants.map((restaurant, index) => (
                  <Col xs={24} md={12} lg={8} key={restaurant._id || index}>
                    <Card
                      hoverable
                      style={{ marginBottom: '16px' }}
                      cover={
                        <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                          <img
                            alt={restaurant.name}
                            src={restaurant.coverImage || restaurant.logo || 'https://via.placeholder.com/400x200?text=No+Image'}
                            style={{ width: '100%', objectFit: 'cover', height: '100%' }}
                            onError={(e) => {
                              e.target.onerror = null; 
                              e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                            }}
                          />
                          {restaurant.isVerified && (
                            <Tag color="success" style={{ position: 'absolute', top: '10px', right: '10px' }}>
                              <CheckCircleOutlined /> Verified
                            </Tag>
                          )}
                        </div>
                      }
                    >
                      <Card.Meta
                        title={restaurant.name}
                        description={
                          <div>
                            <div style={{ marginBottom: '8px' }}>
                              <StarOutlined style={{ color: '#ffc53d', marginRight: '5px' }} />
                              <span>{restaurant.rating} ({restaurant.reviews} reviews)</span>
                            </div>
                            <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: '8px' }}>
                              {restaurant.description}
                            </Paragraph>
                            <div style={{ marginBottom: '8px' }}>
                              <EnvironmentOutlined style={{ marginRight: '5px', color: '#1890ff' }} />
                              <Text type="secondary">
                                {restaurant.address?.street || 'Location not available'} ({restaurant.distance || '2.5'} km)
                              </Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                              <Button
                                type="primary"
                                onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                              >
                                View Menu
                              </Button>
                              <Button
                                type={favorites.includes(restaurant._id) ? "primary" : "default"}
                                danger={favorites.includes(restaurant._id)}
                                icon={favorites.includes(restaurant._id) ? <HeartFilled /> : <HeartOutlined />}
                                onClick={(e) => handleToggleFavorite(restaurant._id, e)}
                              />
                            </div>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
            
            <Col span={24} style={{ textAlign: 'center', marginTop: '20px' }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredRestaurants.length}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </Col>
          </>
        ) : (
          <Col span={24}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Space direction="vertical" align="center">
                  <Text>No restaurants match your criteria</Text>
                  <Button type="primary" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </Space>
              }
            />
          </Col>
        )}
      </Row>

      {/* Filter Drawer */}
      <Drawer
        title="Filter Restaurants"
        placement="right"
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
        width={320}
      >
        <div className="filter-container">
          <Title level={5} className="filter-title">Rating</Title>
          <Rate
            allowHalf
            value={filters.rating}
            onChange={(value) => handleFilterChange('rating', value)}
            className="rating-filter"
          />
        </div>
        
        <div className="filter-container">
          <Title level={5} className="filter-title">Cuisine Type</Title>
          <Checkbox.Group
            options={['Italian', 'Indian', 'Chinese', 'Mexican', 'Fast Food', 'Vegetarian', 'Seafood']}
            value={filters.cuisine}
            onChange={(values) => handleFilterChange('cuisine', values)}
            className="cuisine-filter"
          />
        </div>
        
        <div className="filter-container">
          <Title level={5} className="filter-title">Price Range (₹)</Title>
          <Slider
            range
            min={0}
            max={1000}
            value={filters.priceRange}
            onChange={(value) => handleFilterChange('priceRange', value)}
            tipFormatter={value => `₹${value}`}
            className="price-filter"
          />
          <div className="price-range-display">
            <Text type="secondary">₹{filters.priceRange[0]}</Text>
            <Text type="secondary">₹{filters.priceRange[1]}</Text>
          </div>
        </div>
        
        <div className="filter-container">
          <Title level={5} className="filter-title">Distance</Title>
          <Radio.Group 
            onChange={(e) => handleFilterChange('nearby', e.target.value === '5')}
            value={filters.nearby ? '5' : 'any'}
            className="distance-filter"
          >
            <Space direction="vertical">
              <Radio value="any">Any distance</Radio>
              <Radio value="5">Within 5 km</Radio>
            </Space>
          </Radio.Group>
        </div>
        
        <div className="filter-container">
          <Title level={5} className="filter-title">Other Filters</Title>
          <Space direction="vertical" className="other-filters">
            <Checkbox
              checked={filters.verified}
              onChange={(e) => handleFilterChange('verified', e.target.checked)}
            >
              Verified Restaurants
            </Checkbox>
            <Checkbox
              checked={filters.openNow}
              onChange={(e) => handleFilterChange('openNow', e.target.checked)}
            >
              Open Now
            </Checkbox>
          </Space>
        </div>
        
        <div className="apply-filters-container">
          <Button 
            type="primary" 
            block 
            size="large" 
            onClick={() => setFilterDrawerVisible(false)}
            className="apply-filters-button"
          >
            Apply Filters
          </Button>
        </div>
      </Drawer>

      {/* Restaurant Details Drawer */}
      <Drawer
        title={selectedRestaurant?.name || 'Restaurant Details'}
        placement="right"
        onClose={() => setDetailsDrawerVisible(false)}
        open={detailsDrawerVisible}
        width={520}
      >
        {selectedRestaurant && (
          <div className="details-content">
            <div className="details-image-container">
              <img
                alt={selectedRestaurant.name}
                src={selectedRestaurant.image}
                className="details-image"
              />
            </div>
            
            <div className="details-rating-container">
              <Space>
                <Rate disabled defaultValue={selectedRestaurant.rating} allowHalf />
                <Text>({selectedRestaurant.reviews} reviews)</Text>
              </Space>
              {selectedRestaurant.hasDiscount && (
                <Tag color="error" className="discount-badge">
                  <ThunderboltOutlined /> {selectedRestaurant.discountPercentage}% OFF
                </Tag>
              )}
            </div>
            
            <Paragraph className="details-description">{selectedRestaurant.description}</Paragraph>
            
            <Divider />
            
            <Title level={5} className="details-section-title">Restaurant Details</Title>
            <List itemLayout="horizontal" split={false} className="details-list">
              <List.Item>
                <List.Item.Meta
                  avatar={<EnvironmentOutlined className="details-icon location-icon" />}
                  title="Address"
                  description={`${selectedRestaurant.address?.street || ''}, ${selectedRestaurant.address?.city || ''}, ${selectedRestaurant.address?.state || ''}`}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<PhoneOutlined className="details-icon contact-icon" />}
                  title="Contact"
                  description={selectedRestaurant.phone || 'Not available'}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<ClockCircleOutlined className="details-icon hours-icon" />}
                  title="Opening Hours"
                  description={selectedRestaurant.openingHours}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<MenuOutlined className="details-icon cuisine-icon" />}
                  title="Cuisine"
                  description={selectedRestaurant.cuisine?.join(', ') || 'Various cuisines'}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<EnvironmentOutlined className="details-icon distance-icon" />}
                  title="Distance"
                  description={`${selectedRestaurant.distance} km from your location`}
                />
              </List.Item>
            </List>
            
            <Divider />
            
            <div className="details-action-buttons">
              <Button
                type="primary"
                block
                size="large"
                icon={<MenuOutlined />}
                onClick={() => {
                  setDetailsDrawerVisible(false);
                  navigate(`/restaurant/${selectedRestaurant._id}`);
                }}
                className="view-menu-button"
              >
                View Menu
              </Button>
              
              <Button
                block
                size="large"
                icon={<StarOutlined />}
                onClick={() => {
                  setDetailsDrawerVisible(false);
                  navigate('/reviews');
                }}
                className="view-reviews-button"
              >
                View Reviews & Feedback
              </Button>
              
              <Button
                block
                size="large"
                icon={favorites.includes(selectedRestaurant._id) ? <HeartFilled /> : <HeartOutlined />}
                onClick={() => handleToggleFavorite(selectedRestaurant._id)}
                className="favorite-details-button"
              >
                {favorites.includes(selectedRestaurant._id) ? 'Remove from Favorites' : 'Add to Favorites'}
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Restaurants; 