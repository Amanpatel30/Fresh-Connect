import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Typography, Input, Button, Tag, Space,
  Rate, List, Avatar, Divider, Select, Pagination, Empty,
  Spin, Badge, Tooltip, Tabs, Checkbox, Slider, Drawer,
  Image, Carousel, Progress, notification
} from 'antd';
import {
  SearchOutlined, EnvironmentOutlined, PhoneOutlined,
  ClockCircleOutlined, FireOutlined, FilterOutlined,
  StarOutlined, HeartOutlined, HeartFilled, ShopOutlined,
  SortAscendingOutlined, ShoppingCartOutlined, InfoCircleOutlined,
  LeftOutlined, RightOutlined, PercentageOutlined, ThunderboltOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Meta } = Card;

const UrgentSales = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [filters, setFilters] = useState({
    category: [],
    rating: 0,
    priceRange: [0, 1000],
    discount: 0,
    expiryWithin: 0,
    freeDelivery: false
  });
  const [sortBy, setSortBy] = useState('discount');

  useEffect(() => {
    // Simulating API call to fetch urgent sale products
    setTimeout(() => {
      const mockProducts = [
        {
          id: 1,
          name: 'Organic Tomatoes',
          image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80',
          category: ['Vegetables', 'Organic'],
          rating: 4.5,
          reviews: 28,
          originalPrice: 80,
          discountedPrice: 40,
          discount: 50,
          seller: 'Green Farms',
          sellerRating: 4.7,
          sellerVerified: true,
          location: 'Mumbai, Maharashtra',
          distance: 2.5,
          quantity: '1 kg',
          expiryDate: '2023-03-08', // 3 days from now
          timeLeft: '3 days',
          freeDelivery: true,
          description: 'Fresh organic tomatoes harvested yesterday. Need to sell quickly due to excess inventory.',
          images: [
            'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
            'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
            'https://images.unsplash.com/photo-1444731961956-751db5d3f3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80'
          ],
          nutritionInfo: {
            calories: '18 kcal per 100g',
            vitamins: 'Vitamin C, Vitamin K',
            minerals: 'Potassium, Folate'
          }
        },
        {
          id: 2,
          name: 'Fresh Spinach Bundle',
          image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80',
          category: ['Leafy Greens', 'Organic'],
          rating: 4.2,
          reviews: 15,
          originalPrice: 60,
          discountedPrice: 25,
          discount: 58,
          seller: 'Organic Valley',
          sellerRating: 4.5,
          sellerVerified: true,
          location: 'Mumbai, Maharashtra',
          distance: 3.8,
          quantity: '500g',
          expiryDate: '2023-03-07', // 2 days from now
          timeLeft: '2 days',
          freeDelivery: false,
          description: 'Fresh organic spinach bundles. Selling at a discount due to excess harvest.',
          images: [
            'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
            'https://images.unsplash.com/photo-1589621316382-008455b857cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
            'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80'
          ],
          nutritionInfo: {
            calories: '23 kcal per 100g',
            vitamins: 'Vitamin A, Vitamin K, Vitamin C',
            minerals: 'Iron, Calcium, Magnesium'
          }
        },
        {
          id: 3,
          name: 'Ripe Bananas',
          image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80',
          category: ['Fruits', 'Organic'],
          rating: 4.0,
          reviews: 32,
          originalPrice: 70,
          discountedPrice: 28,
          discount: 60,
          seller: 'Fruit Haven',
          sellerRating: 4.3,
          sellerVerified: false,
          location: 'Mumbai, Maharashtra',
          distance: 5.2,
          quantity: '1 dozen',
          expiryDate: '2023-03-06', // 1 day from now
          timeLeft: '1 day',
          freeDelivery: true,
          description: 'Ripe organic bananas. Perfect for smoothies and baking. Need to sell quickly.',
          images: [
            'https://images.unsplash.com/photo-1603833665858-e61d17a86224?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
            'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
            'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80'
          ],
          nutritionInfo: {
            calories: '89 kcal per 100g',
            vitamins: 'Vitamin B6, Vitamin C',
            minerals: 'Potassium, Magnesium'
          }
        },
        {
          id: 4,
          name: 'Mixed Vegetable Box',
          image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80',
          category: ['Vegetables', 'Mixed Box'],
          rating: 4.7,
          reviews: 45,
          originalPrice: 250,
          discountedPrice: 125,
          discount: 50,
          seller: 'Farm Fresh',
          sellerRating: 4.8,
          sellerVerified: true,
          location: 'Mumbai, Maharashtra',
          distance: 4.0,
          quantity: '5 kg assorted',
          expiryDate: '2023-03-09', // 4 days from now
          timeLeft: '4 days',
          freeDelivery: true,
          description: 'Assorted vegetable box containing potatoes, onions, carrots, bell peppers, and more. Selling at a discount due to excess inventory.',
          images: [
            'https://images.unsplash.com/photo-1518843875459-f738682238a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
            'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80',
            'https://images.unsplash.com/photo-1557844681-3fbf4fbf9d9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80'
          ],
          nutritionInfo: {
            calories: 'Varies by vegetable',
            vitamins: 'Various vitamins',
            minerals: 'Various minerals'
          }
        }
      ];

      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    // Apply filters and search
    let results = [...products];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        product =>
          product.name.toLowerCase().includes(query) ||
          product.category.some(c => c.toLowerCase().includes(query)) ||
          product.seller.toLowerCase().includes(query)
      );
    }

    // Apply tab filter
    if (activeTab === 'expiringSoon') {
      results = results.filter(product => parseInt(product.timeLeft) <= 2);
    } else if (activeTab === 'highDiscount') {
      results = results.filter(product => product.discount >= 50);
    } else if (activeTab === 'freeDelivery') {
      results = results.filter(product => product.freeDelivery);
    }

    // Apply category filter
    if (filters.category.length > 0) {
      results = results.filter(product =>
        product.category.some(c => filters.category.includes(c))
      );
    }

    // Apply rating filter
    if (filters.rating > 0) {
      results = results.filter(product => product.rating >= filters.rating);
    }

    // Apply price range filter
    results = results.filter(
      product => 
        product.discountedPrice >= filters.priceRange[0] && 
        product.discountedPrice <= filters.priceRange[1]
    );

    // Apply discount filter
    if (filters.discount > 0) {
      results = results.filter(product => product.discount >= filters.discount);
    }

    // Apply expiry filter
    if (filters.expiryWithin > 0) {
      results = results.filter(product => parseInt(product.timeLeft) <= filters.expiryWithin);
    }

    // Apply free delivery filter
    if (filters.freeDelivery) {
      results = results.filter(product => product.freeDelivery);
    }

    // Apply sorting
    results.sort((a, b) => {
      switch (sortBy) {
        case 'discount':
          return b.discount - a.discount;
        case 'expiry':
          return parseInt(a.timeLeft) - parseInt(b.timeLeft);
        case 'price':
          return a.discountedPrice - b.discountedPrice;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    setFilteredProducts(results);
  }, [products, searchQuery, activeTab, filters, sortBy]);

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

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setDetailsDrawerVisible(true);
  };

  const handleToggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const handleAddToCart = (product) => {
    notification.success({
      message: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
      placement: 'bottomRight',
    });
  };

  const resetFilters = () => {
    setFilters({
      category: [],
      rating: 0,
      priceRange: [0, 1000],
      discount: 0,
      expiryWithin: 0,
      freeDelivery: false
    });
    setSearchQuery('');
  };

  const categoryOptions = [
    'Vegetables',
    'Fruits',
    'Organic',
    'Leafy Greens',
    'Mixed Box'
  ];

  const renderProductCard = (product) => (
    <Card
      hoverable
      className="mb-4"
      cover={
        <div className="relative">
          <img
            alt={product.name}
            src={product.image}
            className="h-48 w-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <Button
              type="text"
              icon={favorites.includes(product.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(product.id);
              }}
              className="bg-white bg-opacity-70 hover:bg-white"
            />
          </div>
          <div className="absolute top-2 left-2">
            <Tag color="red" icon={<PercentageOutlined />}>
              {product.discount}% OFF
            </Tag>
          </div>
          <div className="absolute bottom-2 left-2">
            <Tag color="orange" icon={<ClockCircleOutlined />}>
              Expires in {product.timeLeft}
            </Tag>
          </div>
        </div>
      }
      onClick={() => handleViewDetails(product)}
    >
      <Meta
        avatar={<Avatar src={product.thumbnail} size={64} />}
        title={
          <div className="flex justify-between items-center">
            <Text strong>{product.name}</Text>
            {product.sellerVerified && (
              <Badge count={<CheckCircleOutlined style={{ color: '#52c41a' }} />} />
            )}
          </div>
        }
        description={
          <Space direction="vertical" size={2} className="w-full">
            <div className="flex items-center">
              <Rate disabled defaultValue={product.rating} size="small" />
              <Text className="ml-2">{product.rating} ({product.reviews})</Text>
            </div>
            <div>
              {product.category.map((type, index) => (
                <Tag key={index}>{type}</Tag>
              ))}
            </div>
            <div className="flex items-center">
              <Text type="secondary" delete>₹{product.originalPrice}</Text>
              <Text strong className="ml-2 text-red-500">₹{product.discountedPrice}</Text>
              <Text className="ml-2">for {product.quantity}</Text>
            </div>
            <Text type="secondary">
              <ShopOutlined className="mr-1" />
              {product.seller} ({product.sellerRating}★)
            </Text>
            <Text type="secondary">
              <EnvironmentOutlined className="mr-1" />
              {product.location} ({product.distance} km)
            </Text>
            <div className="flex justify-between mt-2">
              <Button 
                type="primary" 
                size="small" 
                icon={<ShoppingCartOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
              >
                Add to Cart
              </Button>
              {product.freeDelivery && (
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
        <Spin size="large" tip="Loading urgent sales..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Title level={2}>
        <FireOutlined style={{ color: '#ff4d4f' }} /> Urgent Sales
      </Title>
      <Text type="secondary" className="mb-6 block">
        Browse discounted products that need to be sold quickly. Great deals with limited time!
      </Text>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={16}>
          <Search
            placeholder="Search products, categories, or sellers"
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
            <Option value="discount">Highest Discount</Option>
            <Option value="expiry">Expiring Soon</Option>
            <Option value="price">Lowest Price</Option>
            <Option value="rating">Highest Rated</Option>
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
        <TabPane tab="All Products" key="all" />
        <TabPane tab="Expiring Soon" key="expiringSoon" />
        <TabPane tab="High Discount (50%+)" key="highDiscount" />
        <TabPane tab="Free Delivery" key="freeDelivery" />
      </Tabs>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="Loading products..." />
        </div>
      ) : filteredProducts.length > 0 ? (
        <Row gutter={[16, 16]}>
          {filteredProducts.map(product => (
            <Col xs={24} sm={12} lg={8} xl={6} key={product.id}>
              {renderProductCard(product)}
            </Col>
          ))}
        </Row>
      ) : (
        <Empty
          description="No products found matching your criteria"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      <div className="flex justify-center mt-6">
        <Pagination
          total={filteredProducts.length}
          showTotal={(total) => `Total ${total} products`}
          defaultPageSize={12}
          defaultCurrent={1}
        />
      </div>

      <Drawer
        title="Filter Products"
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
          <Title level={5}>Category</Title>
          <Checkbox.Group
            options={categoryOptions}
            value={filters.category}
            onChange={(values) => handleFilterChange('category', values)}
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
          <Title level={5}>Price Range (₹)</Title>
          <Slider
            range
            min={0}
            max={1000}
            step={50}
            value={filters.priceRange}
            onChange={(value) => handleFilterChange('priceRange', value)}
            marks={{
              0: '₹0',
              500: '₹500',
              1000: '₹1000'
            }}
          />
        </div>

        <div className="mb-6">
          <Title level={5}>Minimum Discount</Title>
          <Slider
            min={0}
            max={80}
            step={10}
            value={filters.discount}
            onChange={(value) => handleFilterChange('discount', value)}
            marks={{
              0: '0%',
              40: '40%',
              80: '80%'
            }}
          />
        </div>

        <div className="mb-6">
          <Title level={5}>Expiring Within (Days)</Title>
          <Slider
            min={0}
            max={7}
            step={1}
            value={filters.expiryWithin}
            onChange={(value) => handleFilterChange('expiryWithin', value)}
            marks={{
              0: 'Any',
              3: '3 days',
              7: '7 days'
            }}
          />
        </div>

        <div className="mb-6">
          <Title level={5}>Additional Filters</Title>
          <Space direction="vertical">
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
        title={selectedProduct?.name}
        placement="right"
        onClose={() => setDetailsDrawerVisible(false)}
        visible={detailsDrawerVisible}
        width={640}
      >
        {selectedProduct && (
          <div>
            <Carousel
              autoplay
              arrows
              prevArrow={<LeftOutlined />}
              nextArrow={<RightOutlined />}
              className="mb-6"
            >
              {selectedProduct.images.map((image, index) => (
                <div key={index}>
                  <Image
                    src={image}
                    alt={`${selectedProduct.name} - ${index + 1}`}
                    className="w-full h-64 object-cover"
                  />
                </div>
              ))}
            </Carousel>

            <div className="flex items-center mb-4">
              <Avatar src={selectedProduct.thumbnail} size={64} className="mr-4" />
              <div>
                <div className="flex items-center">
                  <Title level={4} className="mb-0 mr-2">{selectedProduct.name}</Title>
                  {selectedProduct.sellerVerified && (
                    <Badge count={<CheckCircleOutlined style={{ color: '#52c41a' }} />} />
                  )}
                </div>
                <div>
                  <Rate disabled defaultValue={selectedProduct.rating} size="small" />
                  <Text className="ml-2">{selectedProduct.rating} ({selectedProduct.reviews} reviews)</Text>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <Tag color="red" icon={<PercentageOutlined />}>
                {selectedProduct.discount}% OFF
              </Tag>
              <Tag color="orange" icon={<ClockCircleOutlined />}>
                Expires in {selectedProduct.timeLeft}
              </Tag>
              {selectedProduct.category.map((type, index) => (
                <Tag key={index}>{type}</Tag>
              ))}
              {selectedProduct.freeDelivery && <Tag color="green">Free Delivery</Tag>}
            </div>

            <div className="mb-4">
              <Text type="secondary" delete className="text-lg">₹{selectedProduct.originalPrice}</Text>
              <Text strong className="ml-2 text-red-500 text-2xl">₹{selectedProduct.discountedPrice}</Text>
              <Text className="ml-2">for {selectedProduct.quantity}</Text>
            </div>

            <Paragraph>{selectedProduct.description}</Paragraph>

            <Divider />

            <Space direction="vertical" size={2} className="w-full mb-6">
              <Text strong>
                <ShopOutlined className="mr-2" />
                Seller
              </Text>
              <Paragraph>
                {selectedProduct.seller} ({selectedProduct.sellerRating}★)
                {selectedProduct.sellerVerified && (
                  <Tag color="green" className="ml-2">Verified</Tag>
                )}
              </Paragraph>

              <Text strong>
                <EnvironmentOutlined className="mr-2" />
                Location
              </Text>
              <Paragraph>{selectedProduct.location} ({selectedProduct.distance} km away)</Paragraph>

              <Text strong>
                <ClockCircleOutlined className="mr-2" />
                Expiry Date
              </Text>
              <Paragraph>{selectedProduct.expiryDate} (in {selectedProduct.timeLeft})</Paragraph>
            </Space>

            <Divider />

            <Title level={4}>Nutrition Information</Title>
            <List
              itemLayout="horizontal"
              dataSource={[
                { label: 'Calories', value: selectedProduct.nutritionInfo.calories },
                { label: 'Vitamins', value: selectedProduct.nutritionInfo.vitamins },
                { label: 'Minerals', value: selectedProduct.nutritionInfo.minerals }
              ]}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.label}
                    description={item.value}
                  />
                </List.Item>
              )}
            />

            <Divider />

            <div className="flex justify-between">
              <Button
                icon={favorites.includes(selectedProduct.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                onClick={() => handleToggleFavorite(selectedProduct.id)}
              >
                {favorites.includes(selectedProduct.id) ? 'Saved' : 'Save'}
              </Button>
              <Button 
                type="primary" 
                icon={<ShoppingCartOutlined />}
                onClick={() => handleAddToCart(selectedProduct)}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default UrgentSales; 