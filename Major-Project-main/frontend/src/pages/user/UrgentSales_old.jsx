import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Typography, Input, Button, Tag, Space,
  Rate, List, Avatar, Divider, Select, Pagination, Empty,
  Spin, Badge, Tooltip, Tabs, Checkbox, Slider, Drawer,
  Image, Carousel, Progress, notification, Radio
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
import { getUrgentSales } from '../../services/api';
import * as cartService from '../../services/cartService';
import './UrgentSales.css';

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
    // Fetch urgent sales from the API
    const fetchUrgentSales = async () => {
      try {
        setLoading(true);
        console.log('Fetching urgent sales data...');
        
        const response = await getUrgentSales();
        console.log('Response data:', response);
        
        // Handle different response formats
        const salesData = Array.isArray(response) ? response : 
                         (response && response.data && Array.isArray(response.data)) ? response.data : [];
        
        console.log('Processed sales data:', salesData);
        
        if (salesData.length > 0) {
          // Transform data to include additional calculated fields
          const transformedData = salesData.map(product => {
            // Calculate time left until expiry
            const expiryDate = new Date(product.expiryDate);
            const now = new Date();
            const diffTime = expiryDate - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return {
              ...product,
              timeLeft: diffDays <= 0 ? 'Expired' : `${diffDays} day${diffDays > 1 ? 's' : ''}`,
              discountPercentage: Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)
            };
          });
          
          setProducts(transformedData);
          setFilteredProducts(transformedData);
          
          // Display notification with record count
          notification.info({
            message: 'Data Loaded',
            description: `Found ${salesData.length} urgent sale items.`,
            placement: 'topRight',
            duration: 3
          });
        } else {
          console.log('No urgent sales found or invalid data format');
          notification.warning({
            message: 'No Data Found',
            description: 'No urgent sales are currently available.',
            placement: 'topRight'
          });
          // Fallback to empty array if no data
          setProducts([]); 
          setFilteredProducts([]);
        }
      } catch (error) {
        console.error('Error fetching urgent sales:', error);
        console.error('Error details:', error.response || error.message);
        
        notification.error({
          message: 'Error Loading Data',
          description: `Failed to load urgent sales: ${error.response?.data?.message || error.message}`,
          placement: 'topRight'
        });
        // Fallback to empty state
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUrgentSales();
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
          (product.description && product.description.toLowerCase().includes(query)) ||
          (product.seller && product.seller.name && product.seller.name.toLowerCase().includes(query))
      );
    }

    // Apply tab filter
    if (activeTab === 'expiringSoon') {
      // Filter products expiring within 2 days
      results = results.filter(product => {
        const expiryDate = new Date(product.expiryDate);
        const now = new Date();
        const diffTime = expiryDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 2 && diffDays > 0;
      });
    } else if (activeTab === 'highDiscount') {
      // Filter products with discount >= 50%
      results = results.filter(product => product.discountPercentage >= 50);
    } else if (activeTab === 'freeDelivery') {
      results = results.filter(product => product.freeDelivery);
    }

    // Apply category filter
    if (filters.category.length > 0) {
      results = results.filter(product =>
        product.category && product.category.some(c => filters.category.includes(c))
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
      results = results.filter(product => product.discountPercentage >= filters.discount);
    }

    // Apply expiry filter
    if (filters.expiryWithin > 0) {
      const now = new Date();
      results = results.filter(product => {
        const expiryDate = new Date(product.expiryDate);
        const diffTime = expiryDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= filters.expiryWithin && diffDays > 0;
      });
    }

    // Apply free delivery filter
    if (filters.freeDelivery) {
      results = results.filter(product => product.freeDelivery);
    }

    // Apply sorting
    results.sort((a, b) => {
      switch (sortBy) {
        case 'discount':
          return b.discountPercentage - a.discountPercentage;
        case 'expiry': {
          const now = new Date();
          const expiryDateA = new Date(a.expiryDate);
          const expiryDateB = new Date(b.expiryDate);
          const diffTimeA = expiryDateA - now;
          const diffTimeB = expiryDateB - now;
          return diffTimeA - diffTimeB;
        }
        case 'price':
          return a.discountedPrice - b.discountedPrice;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
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

  const handleAddToCart = async (product) => {
    try {
      const response = await cartService.addToCart(product._id, 1);
      notification.success({
        message: 'Added to Cart',
        description: `${product.name} has been added to your cart.`,
        placement: 'bottomRight',
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      notification.error({
        message: 'Failed to Add to Cart',
        description: error.response?.data?.message || 'An error occurred while adding to cart.',
        placement: 'bottomRight',
      });
    }
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

  const renderProductCard = (product) => {
    // Get pre-calculated values
    const discountPercentage = product.discountPercentage;
    const timeLeft = product.timeLeft;
    const diffDays = timeLeft === 'Expired' ? 0 : parseInt(timeLeft.split(' ')[0]);

    return (
      <Card
        hoverable
        className="urgent-sale-card"
        cover={
          <div className="card-image-container">
            <img
              alt={product.name}
              src={product.image || 'https://via.placeholder.com/300x200?text=No+Image'} 
              className="card-image" 
            />
            <Tag color="red" className="discount-tag">
              <FireOutlined /> {discountPercentage}% OFF
            </Tag>
            {product.freeDelivery && (
              <Tag color="green" className="free-delivery-tag">
                Free Delivery
              </Tag>
            )}
          </div>
        }
        actions={[
          <Tooltip title="Add to favorites">
            <Button 
              type="text" 
              icon={favorites.includes(product._id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(product._id);
              }}
            />
          </Tooltip>,
          <Tooltip title="Add to cart">
            <Button 
              type="text" 
              icon={<ShoppingCartOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
            />
          </Tooltip>
        ]}
        onClick={() => handleViewDetails(product)}
      >
        <Meta
          title={
            <div className="product-title">
              <Text ellipsis={true} style={{ width: '100%' }}>{product.name}</Text>
              <div className="product-rating">
                <StarOutlined style={{ color: '#faad14' }} />
                <Text>{product.rating || 'N/A'}</Text>
              </div>
            </div>
          }
          description={
            <div className="product-details">
              <div className="price-section">
                <Text delete type="secondary">₹{product.originalPrice}</Text>
                <Text strong style={{ fontSize: '16px', marginLeft: '8px' }}>₹{product.discountedPrice}</Text>
              </div>
              
              <div className="seller-section">
                <ShopOutlined style={{ marginRight: '4px' }} />
                <Text type="secondary">
                  {product.seller?.name || 'Unknown Seller'}
                  {product.sellerVerified && <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: '4px' }} />}
                </Text>
              </div>
              
              <div className="expiry-section">
                <ClockCircleOutlined style={{ marginRight: '4px', color: diffDays <= 1 ? '#ff4d4f' : '#faad14' }} />
                <Text type={diffDays <= 1 ? 'danger' : 'warning'}>
                  {timeLeft} left
                </Text>
              </div>

              <div className="stock-section">
                <Text type="secondary">
                  Stock: {product.stock} {product.unit}
                </Text>
              </div>
            </div>
          }
        />
      </Card>
    );
  };

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
        <ThunderboltOutlined style={{ color: '#ff4d4f' }} /> Urgent Food Sales
      </Title>
      <Text type="secondary" className="mb-6 block">
        Help reduce food waste by purchasing these items at discounted prices before they expire.
      </Text>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={16}>
          <Search
            placeholder="Search for products, categories, or sellers"
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
        <TabPane tab="High Discount" key="highDiscount" />
        <TabPane tab="Free Delivery" key="freeDelivery" />
      </Tabs>

      {filteredProducts.length > 0 ? (
        <Row gutter={[16, 16]}>
          {filteredProducts.map(product => (
            <Col xs={24} sm={12} lg={8} xl={6} key={product._id}>
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

      {/* Filter Drawer */}
      <Drawer
        title="Filter Products"
        placement="right"
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
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
          <Title level={5}>Categories</Title>
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
          <Title level={5}>Minimum Discount</Title>
          <Slider
            min={0}
            max={90}
            step={10}
            value={filters.discount}
            onChange={(value) => handleFilterChange('discount', value)}
            tipFormatter={(value) => `${value}%`}
          />
        </div>

        <div className="mb-6">
          <Title level={5}>Expiry Within</Title>
          <Radio.Group
            value={filters.expiryWithin}
            onChange={(e) => handleFilterChange('expiryWithin', e.target.value)}
          >
            <Space direction="vertical">
              <Radio value={0}>Any time</Radio>
              <Radio value={1}>Today</Radio>
              <Radio value={2}>2 days</Radio>
              <Radio value={7}>1 week</Radio>
            </Space>
          </Radio.Group>
        </div>

        <div className="mb-6">
          <Checkbox
            checked={filters.freeDelivery}
            onChange={(e) => handleFilterChange('freeDelivery', e.target.checked)}
          >
            Free Delivery Only
          </Checkbox>
        </div>
      </Drawer>

      {/* Details Drawer */}
      <Drawer
        title={selectedProduct?.name}
        placement="right"
        onClose={() => setDetailsDrawerVisible(false)}
        open={detailsDrawerVisible && selectedProduct}
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
              {selectedProduct.images ? (
                selectedProduct.images.map((img, index) => (
                  <div key={index}>
                    <Image
                      src={img} 
                      alt={`${selectedProduct.name} ${index + 1}`}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                ))
              ) : (
                <div>
                  <Image 
                    src={selectedProduct.image || 'https://via.placeholder.com/500x300?text=No+Image'} 
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}
            </Carousel>

            <div className="flex items-center mb-4">
              <Avatar src={selectedProduct.seller?.logo} size={64} className="mr-4" />
              <div>
                <div className="flex items-center">
                  <Title level={4} className="mb-0 mr-2">{selectedProduct.name}</Title>
                  <Badge count={<CheckCircleOutlined style={{ color: '#52c41a' }} />} />
                </div>
                <div>
                  <Rate disabled defaultValue={selectedProduct.rating || 0} size="small" />
                  <Text className="ml-2">{selectedProduct.rating || 'N/A'} ({selectedProduct.reviews || 0} reviews)</Text>
                </div>
              </div>
            </div>

            <Paragraph>{selectedProduct.description}</Paragraph>

            <div className="mb-4">
              <Tag color="red" icon={<PercentageOutlined />}>
                {selectedProduct.discountPercentage}% OFF
              </Tag>
              {selectedProduct.freeDelivery && <Tag color="green">Free Delivery</Tag>}
              <Tag color="blue">
                ₹{selectedProduct.originalPrice} → ₹{selectedProduct.discountedPrice}
              </Tag>
            </div>

            <Divider />

            <Space direction="vertical" size={2} className="w-full mb-6">
              <Text strong>
                <ShopOutlined className="mr-2" />
                Seller
              </Text>
              <Paragraph>{selectedProduct.seller?.name || 'Unknown Seller'}</Paragraph>

              <Text strong>
                <ClockCircleOutlined className="mr-2" />
                Expires In
              </Text>
              <Paragraph>{selectedProduct.timeLeft}</Paragraph>

              <Text strong>
                <EnvironmentOutlined className="mr-2" />
                Stock
              </Text>
              <Paragraph>{selectedProduct.stock} {selectedProduct.unit}</Paragraph>
            </Space>

            <Divider />

            <div className="flex justify-between">
              <Button
                icon={favorites.includes(selectedProduct._id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                onClick={() => handleToggleFavorite(selectedProduct._id)}
              >
                {favorites.includes(selectedProduct._id) ? 'Saved' : 'Save'}
              </Button>
              <Button type="primary" icon={<ShoppingCartOutlined />} onClick={() => handleAddToCart(selectedProduct)}>
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