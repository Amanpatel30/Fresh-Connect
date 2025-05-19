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
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUrgentSales } from '../../services/api';
import * as cartService from '../../services/cartService';
import './UrgentSales.css';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Meta } = Card;

const UrgentSales = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 24,
    total: 0
  });

  // Parse URL parameters for filtering
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    // Check for filter parameter
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      setActiveTab(filterParam);
      
      if (filterParam === 'expiring') {
        // Set filter for items expiring soon (within 24 hours)
        setFilters(prev => ({...prev, expiryWithin: 1}));
        setSortBy('expiry');
      } else if (filterParam === 'discount') {
        // Set filter for highest discounted items
        setFilters(prev => ({...prev, discount: 30})); // Min 30% discount
        setSortBy('discount');
      } else if (filterParam === 'nearby') {
        // Set filter for nearby stores
        setFilters(prev => ({...prev, nearby: true}));
      }
    }
  }, [location.search]);

  useEffect(() => {
    // Fetch urgent sales from the API
    const fetchUrgentSales = async () => {
      try {
        setLoading(true);
        console.log(`Fetching urgent sales data for page ${pagination.page}...`);
        
        const response = await getUrgentSales(pagination.page, pagination.limit);
        console.log('Response data:', response);
        
        // Handle different response formats
        const salesData = response?.data?.data?.urgentSales || [];
        
        console.log('Processed sales data:', salesData);
        console.log('Data structure:', {
          hasData: !!response?.data?.data,
          hasUrgentSales: !!response?.data?.data?.urgentSales,
          count: salesData.length,
          page: pagination.page,
          total: response?.data?.data?.stats?.total || 0
        });
        
        if (salesData.length > 0) {
          // Transform data to include additional calculated fields
          const transformedData = salesData.map(product => {
            // Calculate time left until expiry
            const expiryDate = new Date(product.expiryDate);
            const now = new Date();
            const diffTime = expiryDate - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Calculate discount percentage with validation
            const originalPrice = parseFloat(product.originalPrice) || 0;
            const discountedPrice = parseFloat(product.discountedPrice) || 0;
            let discountPercentage = 0;
            
            if (originalPrice > 0 && discountedPrice > 0 && originalPrice > discountedPrice) {
              discountPercentage = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
            }
            
            return {
              ...product,
              timeLeft: diffDays <= 0 ? 'Expired' : `${diffDays} day${diffDays > 1 ? 's' : ''}`,
              discountPercentage
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
  }, [pagination.page, pagination.limit]);

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
      results = results.filter(product => {
        const expiryDate = new Date(product.expiryDate);
        const now = new Date();
        const diffTime = expiryDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 2 && diffDays > 0;
      });
    } else if (activeTab === 'highDiscount') {
      results = results.filter(product => product.discountPercentage >= 50);
    } else if (activeTab === 'freeDelivery') {
      results = results.filter(product => product.freeDelivery);
    } else if (activeTab === 'expired') {
      results = results.filter(product => {
        const expiryDate = new Date(product.expiryDate);
        const now = new Date();
        return expiryDate < now;
      });
    } else if (activeTab === 'reserved') {
      results = results.filter(product => product.status === 'reserved');
    } else if (activeTab === 'sold') {
      results = results.filter(product => product.status === 'sold');
    }

    // Apply other filters only if they are set
    if (filters.category.length > 0) {
      results = results.filter(product =>
        product.category && product.category.some(c => filters.category.includes(c))
      );
    }

    if (filters.rating > 0) {
      results = results.filter(product => product.rating >= filters.rating);
    }

    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1000) {
      results = results.filter(
        product => 
          product.discountedPrice >= filters.priceRange[0] && 
          product.discountedPrice <= filters.priceRange[1]
      );
    }

    if (filters.discount > 0) {
      results = results.filter(product => product.discountPercentage >= filters.discount);
    }

    if (filters.expiryWithin > 0) {
      const now = new Date();
      results = results.filter(product => {
        const expiryDate = new Date(product.expiryDate);
        const diffTime = expiryDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= filters.expiryWithin && diffDays > 0;
      });
    }

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
          return expiryDateA - expiryDateB;
        }
        case 'price':
          return a.discountedPrice - b.discountedPrice;
        default:
          return 0;
      }
    });

    setFilteredProducts(results);
    // Update pagination total
    setPagination(prev => ({...prev, total: results.length}));
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
    const expiryDate = new Date(product.expiryDate);
    const now = new Date();
    const diffTime = expiryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Determine product status
    let status = 'available';
    if (diffDays <= 0) {
      status = 'expired';
    } else if (product.status === 'reserved') {
      status = 'reserved';
    } else if (product.status === 'sold') {
      status = 'sold';
    }
    
    const timeLeft = diffDays <= 0 ? 'Expired' : `${diffDays} day${diffDays > 1 ? 's' : ''}`;

    // Only show available products by default unless they were explicitly filtered
    if (status !== 'available' && activeTab === 'all') {
      return null;
    }

    return (
      <Card
        className="product-card"
        hoverable
        cover={
          <div className="product-image-container">
            <Badge.Ribbon 
              text={`${product.discountPercentage || 0}% OFF`} 
              color="red"
              style={{ 
                display: status === 'available' && product.discountPercentage > 0 ? 'block' : 'none' 
              }}
            >
              <img 
                alt={product.name} 
                src={product.image} 
                className="product-image"
                style={{ 
                  filter: status === 'expired' ? 'grayscale(0.8)' : 'none',
                  opacity: status !== 'available' ? 0.7 : 1
                }}
              />
            </Badge.Ribbon>
            
            {/* Status badge */}
            {status !== 'available' && (
              <div 
                className="status-badge"
                style={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  backgroundColor: 
                    status === 'expired' ? '#ff4d4f' :
                    status === 'reserved' ? '#fa8c16' :
                    status === 'sold' ? '#8c8c8c' : '#52c41a',
                  color: 'white',
                  zIndex: 5
                }}
              >
                {status.toUpperCase()}
              </div>
            )}
          </div>
        }
        actions={[
          <Tooltip title={favorites.includes(product._id) ? "Remove from favorites" : "Add to favorites"}>
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
              disabled={status !== 'available'}
            />
          </Tooltip>
        ]}
        onClick={() => handleViewDetails(product)}
        style={{
          backgroundColor: 
            status === 'reserved' ? 'rgba(255, 223, 186, 0.3)' :
            status === 'sold' ? 'rgba(200, 216, 228, 0.3)' :
            status === 'expired' ? 'rgba(245, 245, 245, 0.7)' : 'white'
        }}
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

  // Function to handle pagination change
  const handlePageChange = (page) => {
    console.log(`Changing to page ${page}`);
    setPagination({...pagination, page});
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
      
      {products.length > 0 && (
        <Text type="secondary" className="mb-2 block">
          Showing {filteredProducts.length} of {products.length} products
        </Text>
      )}

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

      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange} 
        className="mb-6"
        items={[
          { key: 'all', label: 'All Products' },
          { key: 'expiringSoon', label: 'Expiring Soon' },
          { key: 'highDiscount', label: 'High Discount' },
          { key: 'freeDelivery', label: 'Free Delivery' },
          { key: 'expired', label: 'Expired' },
          { key: 'reserved', label: 'Reserved' },
          { key: 'sold', label: 'Sold' }
        ]}
      />

      {filteredProducts.length > 0 ? (
        <Row gutter={[16, 16]}>
          {filteredProducts
            .filter(product => {
              // Only filter out non-available products in the "all" tab
              if (activeTab === 'all') {
                const expiryDate = new Date(product.expiryDate);
                const now = new Date();
                const diffTime = expiryDate - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                // Check if product is available (not expired, not reserved, not sold)
                return diffDays > 0 && product.status !== 'reserved' && product.status !== 'sold';
              }
              return true; // Keep all products for other tabs
            })
            .slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit)
            .map(product => (
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
          pageSize={pagination.limit}
          current={pagination.page}
          onChange={handlePageChange}
          pageSizeOptions={[12, 24, 48, 96]}
          showSizeChanger
          onShowSizeChange={(current, size) => {
            setPagination({...pagination, limit: size, page: 1});
          }}
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