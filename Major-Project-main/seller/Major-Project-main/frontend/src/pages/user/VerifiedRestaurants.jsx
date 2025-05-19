import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Typography, Input, Button, Tag, Space,
  Rate, List, Avatar, Divider, Select, Pagination, Empty,
  Spin, Badge, Tooltip, Tabs, Checkbox, Slider, Drawer,
  Image, Carousel
} from 'antd';
import {
  SearchOutlined, EnvironmentOutlined, PhoneOutlined,
  ClockCircleOutlined, CheckCircleOutlined, FilterOutlined,
  StarOutlined, HeartOutlined, HeartFilled, ShopOutlined,
  SortAscendingOutlined, MenuOutlined, InfoCircleOutlined,
  LeftOutlined, RightOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Meta } = Card;

const VerifiedRestaurants = () => {
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [filters, setFilters] = useState({
    cuisine: [],
    rating: 0,
    priceRange: [0, 1000],
    offers: false,
    openNow: false,
    freeDelivery: false
  });
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    // Simulating API call to fetch restaurants
    setTimeout(() => {
      const mockRestaurants = [
        {
          id: 1,
          name: 'Green Garden Restaurant',
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
          logo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80',
          cuisine: ['Vegetarian', 'Organic'],
          rating: 4.5,
          reviews: 128,
          priceRange: '₹₹',
          address: '123 Green St, Mumbai, Maharashtra',
          phone: '+91 98765 43210',
          distance: 2.5,
          openingHours: '9:00 AM - 10:00 PM',
          offers: true,
          freeDelivery: true,
          description: 'A premium vegetarian restaurant offering fresh, organic produce directly from local farms.',
          images: [
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
            'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80'
          ],
          menu: [
            { category: 'Starters', items: ['Garden Salad', 'Vegetable Soup', 'Bruschetta'] },
            { category: 'Main Course', items: ['Vegetable Biryani', 'Paneer Tikka Masala', 'Veg Thali'] },
            { category: 'Desserts', items: ['Fruit Salad', 'Ice Cream', 'Gulab Jamun'] }
          ]
        },
        {
          id: 2,
          name: 'Fresh Bites Cafe',
          image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
          logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80',
          cuisine: ['Cafe', 'Healthy'],
          rating: 4.2,
          reviews: 95,
          priceRange: '₹',
          address: '456 Health Ave, Mumbai, Maharashtra',
          phone: '+91 98765 12345',
          distance: 1.8,
          openingHours: '8:00 AM - 8:00 PM',
          offers: false,
          freeDelivery: true,
          description: 'A cozy cafe serving healthy breakfast and lunch options with fresh ingredients.',
          images: [
            'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
            'https://images.unsplash.com/photo-1493770348161-369560ae357d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
            'https://images.unsplash.com/photo-1484723091739-30a097e8f929?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80'
          ],
          menu: [
            { category: 'Breakfast', items: ['Avocado Toast', 'Fruit Bowl', 'Oatmeal'] },
            { category: 'Lunch', items: ['Quinoa Salad', 'Veggie Wrap', 'Smoothie Bowl'] },
            { category: 'Beverages', items: ['Green Smoothie', 'Fresh Juices', 'Herbal Tea'] }
          ]
        },
        {
          id: 3,
          name: 'Spice Route',
          image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
          logo: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80',
          cuisine: ['Indian', 'Vegetarian'],
          rating: 4.7,
          reviews: 210,
          priceRange: '₹₹₹',
          address: '789 Spice Rd, Mumbai, Maharashtra',
          phone: '+91 98765 67890',
          distance: 3.2,
          openingHours: '11:00 AM - 11:00 PM',
          offers: true,
          freeDelivery: false,
          description: 'Authentic Indian cuisine with a focus on traditional spices and cooking methods.',
          images: [
            'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
            'https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
            'https://images.unsplash.com/photo-1567337710282-00832b415979?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80'
          ],
          menu: [
            { category: 'Appetizers', items: ['Samosas', 'Pakoras', 'Papadum'] },
            { category: 'Main Course', items: ['Butter Paneer', 'Chana Masala', 'Vegetable Korma'] },
            { category: 'Breads', items: ['Naan', 'Roti', 'Paratha'] }
          ]
        },
        {
          id: 4,
          name: 'Organic Harvest',
          image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
          logo: 'https://images.unsplash.com/photo-1557844681-3fbf4fbf9d9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80',
          cuisine: ['Organic', 'Farm-to-Table'],
          rating: 4.4,
          reviews: 87,
          priceRange: '₹₹',
          address: '101 Farm Lane, Mumbai, Maharashtra',
          phone: '+91 98765 09876',
          distance: 4.5,
          openingHours: '10:00 AM - 9:00 PM',
          offers: false,
          freeDelivery: true,
          description: 'Farm-to-table restaurant with a focus on organic, locally-sourced ingredients.',
          images: [
            'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
            'https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80'
          ],
          menu: [
            { category: 'Salads', items: ['Harvest Salad', 'Roasted Vegetable Salad', 'Grain Bowl'] },
            { category: 'Mains', items: ['Vegetable Curry', 'Stuffed Bell Peppers', 'Mushroom Risotto'] },
            { category: 'Sides', items: ['Roasted Potatoes', 'Seasonal Vegetables', 'Quinoa Pilaf'] }
          ]
        }
      ];

      setRestaurants(mockRestaurants);
      setFilteredRestaurants(mockRestaurants);
      setLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    // Apply filters and search
    let results = [...restaurants];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        restaurant =>
          restaurant.name.toLowerCase().includes(query) ||
          restaurant.cuisine.some(c => c.toLowerCase().includes(query)) ||
          restaurant.address.toLowerCase().includes(query)
      );
    }

    // Apply tab filter
    if (activeTab === 'offers') {
      results = results.filter(restaurant => restaurant.offers);
    } else if (activeTab === 'freeDelivery') {
      results = results.filter(restaurant => restaurant.freeDelivery);
    }

    // Apply cuisine filter
    if (filters.cuisine.length > 0) {
      results = results.filter(restaurant =>
        restaurant.cuisine.some(c => filters.cuisine.includes(c))
      );
    }

    // Apply rating filter
    if (filters.rating > 0) {
      results = results.filter(restaurant => restaurant.rating >= filters.rating);
    }

    // Apply price range filter
    results = results.filter(
      restaurant => {
        const price = restaurant.priceRange.length * 100; // Rough estimate
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      }
    );

    // Apply offers filter
    if (filters.offers) {
      results = results.filter(restaurant => restaurant.offers);
    }

    // Apply open now filter
    if (filters.openNow) {
      // In a real app, this would check against current time
      results = results.filter(restaurant => true);
    }

    // Apply free delivery filter
    if (filters.freeDelivery) {
      results = results.filter(restaurant => restaurant.freeDelivery);
    }

    // Apply sorting
    results.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviews - a.reviews;
        case 'distance':
          return a.distance - b.distance;
        default:
          return 0;
      }
    });

    setFilteredRestaurants(results);
  }, [restaurants, searchQuery, activeTab, filters, sortBy]);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value
    });
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

  const handleToggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const resetFilters = () => {
    setFilters({
      cuisine: [],
      rating: 0,
      priceRange: [0, 1000],
      offers: false,
      openNow: false,
      freeDelivery: false
    });
    setSearchQuery('');
  };

  const cuisineOptions = [
    'Vegetarian',
    'Organic',
    'Indian',
    'Cafe',
    'Healthy',
    'Farm-to-Table'
  ];

  const renderRestaurantCard = (restaurant) => (
    <Card
      hoverable
      className="mb-4"
      cover={
        <div className="relative">
          <img
            alt={restaurant.name}
            src={restaurant.image}
            className="h-48 w-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <Button
              type="text"
              icon={favorites.includes(restaurant.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(restaurant.id);
              }}
              className="bg-white bg-opacity-70 hover:bg-white"
            />
          </div>
          {restaurant.offers && (
            <Tag color="red" className="absolute top-2 left-2">
              Special Offer
            </Tag>
          )}
        </div>
      }
      onClick={() => handleViewDetails(restaurant)}
    >
      <Meta
        avatar={<Avatar src={restaurant.logo} size={64} />}
        title={
          <div className="flex justify-between items-center">
            <Text strong>{restaurant.name}</Text>
            <Badge count={<CheckCircleOutlined style={{ color: '#52c41a' }} />} />
          </div>
        }
        description={
          <Space direction="vertical" size={2} className="w-full">
            <div className="flex items-center">
              <Rate disabled defaultValue={restaurant.rating} size="small" />
              <Text className="ml-2">{restaurant.rating} ({restaurant.reviews})</Text>
            </div>
            <div>
              <Tag color="blue">{restaurant.priceRange}</Tag>
              {restaurant.cuisine.map((type, index) => (
                <Tag key={index}>{type}</Tag>
              ))}
            </div>
            <Text type="secondary">
              <EnvironmentOutlined className="mr-1" />
              {restaurant.address}
            </Text>
            <Text type="secondary">
              <ClockCircleOutlined className="mr-1" />
              {restaurant.openingHours}
            </Text>
            <div className="flex justify-between mt-2">
              <Text type="secondary">{restaurant.distance} km away</Text>
              {restaurant.freeDelivery && (
                <Tag color="green">Free Delivery</Tag>
              )}
            </div>
          </Space>
        }
      />
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80vh">
        <Spin size="large" tip="Loading restaurants..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Title level={2}>
        <CheckCircleOutlined style={{ color: '#52c41a' }} /> Verified Restaurants
      </Title>
      <Text type="secondary" className="mb-6 block">
        Browse restaurants that have been verified for quality and authenticity
      </Text>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={16}>
          <Search
            placeholder="Search restaurants, cuisines, or locations"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
          />
        </Col>
        <Col xs={12} md={4}>
          <Select
            style={{ width: '100%' }}
            placeholder="Sort by"
            value={sortBy}
            onChange={handleSortChange}
            size="large"
          >
            <Option value="rating">Highest Rated</Option>
            <Option value="reviews">Most Reviewed</Option>
            <Option value="distance">Nearest</Option>
          </Select>
        </Col>
        <Col xs={12} md={4}>
          <Button
            type="primary"
            icon={<FilterOutlined />}
            size="large"
            onClick={() => setFilterDrawerVisible(true)}
            block
          >
            Filters
          </Button>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={handleTabChange} className="mb-6">
        <TabPane tab="All Restaurants" key="all" />
        <TabPane tab="Special Offers" key="offers" />
        <TabPane tab="Free Delivery" key="freeDelivery" />
      </Tabs>

      {filteredRestaurants.length > 0 ? (
        <Row gutter={[16, 16]}>
          {filteredRestaurants.map(restaurant => (
            <Col xs={24} sm={12} lg={8} xl={6} key={restaurant.id}>
              {renderRestaurantCard(restaurant)}
            </Col>
          ))}
        </Row>
      ) : (
        <Empty
          description="No restaurants found matching your criteria"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      <div className="flex justify-center mt-6">
        <Pagination
          total={filteredRestaurants.length}
          showTotal={(total) => `Total ${total} restaurants`}
          defaultPageSize={12}
          defaultCurrent={1}
        />
      </div>

      <Drawer
        title="Filter Restaurants"
        placement="right"
        onClose={() => setFilterDrawerVisible(false)}
        visible={filterDrawerVisible}
        width={320}
        footer={
          <div className="flex justify-between">
            <Button onClick={resetFilters}>Reset</Button>
            <Button type="primary" onClick={() => setFilterDrawerVisible(false)}>
              Apply
            </Button>
          </div>
        }
      >
        <div className="mb-6">
          <Title level={5}>Cuisine</Title>
          <Checkbox.Group
            options={cuisineOptions}
            value={filters.cuisine}
            onChange={(values) => handleFilterChange('cuisine', values)}
          />
        </div>

        <div className="mb-6">
          <Title level={5}>Minimum Rating</Title>
          <Rate
            allowHalf
            value={filters.rating}
            onChange={(value) => handleFilterChange('rating', value)}
          />
        </div>

        <div className="mb-6">
          <Title level={5}>Price Range</Title>
          <Slider
            range
            min={0}
            max={1000}
            step={100}
            value={filters.priceRange}
            onChange={(value) => handleFilterChange('priceRange', value)}
            marks={{
              0: '₹',
              500: '₹₹',
              1000: '₹₹₹'
            }}
          />
        </div>

        <div className="mb-6">
          <Title level={5}>Additional Filters</Title>
          <Space direction="vertical">
            <Checkbox
              checked={filters.offers}
              onChange={(e) => handleFilterChange('offers', e.target.checked)}
            >
              Special Offers
            </Checkbox>
            <Checkbox
              checked={filters.openNow}
              onChange={(e) => handleFilterChange('openNow', e.target.checked)}
            >
              Open Now
            </Checkbox>
            <Checkbox
              checked={filters.freeDelivery}
              onChange={(e) => handleFilterChange('freeDelivery', e.target.checked)}
            >
              Free Delivery
            </Checkbox>
          </Space>
        </div>
      </Drawer>

      <Drawer
        title={selectedRestaurant?.name}
        placement="right"
        onClose={() => setDetailsDrawerVisible(false)}
        visible={detailsDrawerVisible}
        width={640}
      >
        {selectedRestaurant && (
          <div>
            <Carousel
              autoplay
              arrows
              prevArrow={<LeftOutlined />}
              nextArrow={<RightOutlined />}
              className="mb-6"
            >
              {selectedRestaurant.images.map((image, index) => (
                <div key={index}>
                  <Image
                    src={image}
                    alt={`${selectedRestaurant.name} - ${index + 1}`}
                    className="w-full h-64 object-cover"
                  />
                </div>
              ))}
            </Carousel>

            <div className="flex items-center mb-4">
              <Avatar src={selectedRestaurant.logo} size={64} className="mr-4" />
              <div>
                <div className="flex items-center">
                  <Title level={4} className="mb-0 mr-2">{selectedRestaurant.name}</Title>
                  <Badge count={<CheckCircleOutlined style={{ color: '#52c41a' }} />} />
                </div>
                <div>
                  <Rate disabled defaultValue={selectedRestaurant.rating} size="small" />
                  <Text className="ml-2">{selectedRestaurant.rating} ({selectedRestaurant.reviews} reviews)</Text>
                </div>
              </div>
            </div>

            <Paragraph>{selectedRestaurant.description}</Paragraph>

            <div className="mb-4">
              <Tag color="blue">{selectedRestaurant.priceRange}</Tag>
              {selectedRestaurant.cuisine.map((type, index) => (
                <Tag key={index}>{type}</Tag>
              ))}
              {selectedRestaurant.offers && <Tag color="red">Special Offer</Tag>}
              {selectedRestaurant.freeDelivery && <Tag color="green">Free Delivery</Tag>}
            </div>

            <Divider />

            <Space direction="vertical" size={2} className="w-full mb-6">
              <Text strong>
                <EnvironmentOutlined className="mr-2" />
                Address
              </Text>
              <Paragraph>{selectedRestaurant.address}</Paragraph>

              <Text strong>
                <PhoneOutlined className="mr-2" />
                Contact
              </Text>
              <Paragraph>{selectedRestaurant.phone}</Paragraph>

              <Text strong>
                <ClockCircleOutlined className="mr-2" />
                Opening Hours
              </Text>
              <Paragraph>{selectedRestaurant.openingHours}</Paragraph>
            </Space>

            <Divider />

            <Title level={4}>Menu Highlights</Title>
            {selectedRestaurant.menu.map((section, index) => (
              <div key={index} className="mb-4">
                <Title level={5}>{section.category}</Title>
                <ul className="pl-6">
                  {section.items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}

            <Divider />

            <div className="flex justify-between">
              <Button
                icon={favorites.includes(selectedRestaurant.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                onClick={() => handleToggleFavorite(selectedRestaurant.id)}
              >
                {favorites.includes(selectedRestaurant.id) ? 'Saved' : 'Save'}
              </Button>
              <Button type="primary">
                <Link to={`/restaurant/${selectedRestaurant.id}`}>View Full Menu</Link>
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default VerifiedRestaurants; 