import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, Typography, Button, Spin, Empty, Tag, Divider, 
  Row, Col, message, Tabs, Input, Pagination, Dropdown, Menu,
  Modal, Form, notification, Tooltip, Statistic, Space, Badge,
  Radio, Rate
} from 'antd';
import { 
  HeartOutlined, HeartFilled, ShoppingCartOutlined, 
  DeleteOutlined, ShareAltOutlined, EllipsisOutlined,
  PlusOutlined, StarFilled, ShopOutlined, EnvironmentOutlined,
  FilterOutlined, SortAscendingOutlined, SearchOutlined,
  QuestionCircleOutlined, AppstoreOutlined, DownOutlined
} from '@ant-design/icons';
import wishlistService from '../../services/wishlistService';
import { useUser } from '../../context/UserContext';
import WishlistHeader from '../../components/user/WishlistHeader';
import './UserWishlist.css';
import * as cartService from '../../services/cartService';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;
const { Meta } = Card;

const UserWishlist = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [collections, setCollections] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [collectionModalVisible, setCollectionModalVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [moveToCollectionModalVisible, setMoveToCollectionModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [targetCollection, setTargetCollection] = useState(null);
  const [form] = Form.useForm();
  const pageSize = 12;
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchWishlistData();
    fetchCollections();
  }, []);

  const fetchWishlistData = async () => {
    setLoading(true);
    try {
      const response = await wishlistService.getWishlistItems();
      if (response && response.data && response.data.wishlist) {
        setWishlistItems(response.data.wishlist.map(item => ({
          ...item.product,
          addedAt: new Date(item.addedAt),
          // Calculate discount percentage if discountPrice exists
          discountPercentage: item.product.discountPrice 
            ? Math.round(((item.product.price - item.product.discountPrice) / item.product.price) * 100) 
            : 0
        })));
      }
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      message.error('Failed to load wishlist items. Please try again.');
      // Use mock data in case of error
      setWishlistItems([
        {
          _id: 'mock-product-1',
          name: 'Organic Tomatoes',
          price: 40,
          discountPrice: 20,
          discountPercentage: 50,
          images: [{ url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea', alt: 'Tomatoes' }],
          description: 'Fresh organic tomatoes',
          category: 'Vegetables',
          stock: 50,
          ratings: { average: 4.5, count: 28 },
          seller: 'Green Farms',
          addedAt: new Date()
        },
        {
          _id: 'mock-product-2',
          name: 'Fresh Spinach Bundle',
          price: 25,
          discountPrice: null,
          discountPercentage: 0,
          images: [{ url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb', alt: 'Spinach' }],
          description: 'Fresh and nutritious spinach',
          category: 'Leafy Greens',
          stock: 30,
          ratings: { average: 4.2, count: 15 },
          seller: 'Organic Valley',
          addedAt: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await wishlistService.getWishlistCollections();
      if (response && response.data && response.data.collections) {
        setCollections(response.data.collections);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      // Use mock data in case of error
      setCollections([
        { id: 'vegetables', name: 'Vegetables', items: 5 },
        { id: 'fruits', name: 'Fruits', items: 3 },
        { id: 'favorites', name: 'Favorites', items: 8 }
      ]);
    }
  };

  const handleRemoveFromWishlist = async (productId, e) => {
    e && e.stopPropagation();
    try {
      await wishlistService.removeFromWishlist(productId);
      setWishlistItems(wishlistItems.filter(item => item._id !== productId));
      notification.success({
        message: 'Item Removed',
        description: 'Successfully removed from your wishlist',
        placement: 'bottomRight'
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      notification.error({
        message: 'Failed to Remove',
        description: 'Could not remove the item from your wishlist',
        placement: 'bottomRight'
      });
    }
  };

  const handleAddToCart = async (item, e) => {
    if (e) e.stopPropagation();
    
    try {
      await cartService.addToCart(item._id, 1);
      message.success(`${item.name} added to your cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      message.error(error.response?.data?.message || 'Failed to add item to cart');
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      message.error('Please enter a collection name');
      return;
    }

    try {
      const response = await wishlistService.createWishlistCollection({
        name: newCollectionName
      });
      
      if (response && response.data && response.data.collection) {
        setCollections([...collections, response.data.collection]);
        notification.success({
          message: 'Collection Created',
          description: `${newCollectionName} collection has been created`,
          placement: 'bottomRight'
        });
        setNewCollectionName('');
        setCollectionModalVisible(false);
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      notification.error({
        message: 'Failed to Create',
        description: 'Could not create the new collection',
        placement: 'bottomRight'
      });
    }
  };

  const handleMoveToCollection = async () => {
    if (!selectedProduct || !targetCollection) return;

    try {
      await wishlistService.moveToCollection(selectedProduct._id, targetCollection);
      notification.success({
        message: 'Moved Successfully',
        description: `Item moved to ${collections.find(c => c.id === targetCollection)?.name}`,
        placement: 'bottomRight'
      });
      setMoveToCollectionModalVisible(false);
      setSelectedProduct(null);
      setTargetCollection(null);
    } catch (error) {
      console.error('Error moving item to collection:', error);
      notification.error({
        message: 'Failed to Move',
        description: 'Could not move the item to the selected collection',
        placement: 'bottomRight'
      });
    }
  };

  const openMoveToCollectionModal = (product, e) => {
    e && e.stopPropagation();
    setSelectedProduct(product);
    setMoveToCollectionModalVisible(true);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleCardClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Filter items based on active tab and search text
  const getFilteredItems = () => {
    let items = wishlistItems;

    // Apply collection filter if not "all"
    if (activeTab !== 'all') {
      // In a real app, this would be filtered based on the backend data
      // For now, we're simulating collection filtering
      items = items.filter(item => {
        if (activeTab === 'vegetables') {
          return item.category === 'Vegetables';
        } else if (activeTab === 'fruits') {
          return item.category === 'Fruits';
        } else if (activeTab === 'favorites') {
          return item.ratings && item.ratings.average >= 4.5;
        }
        return true;
      });
    }

    // Apply search filter
    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(lowerCaseSearch) || 
        item.category.toLowerCase().includes(lowerCaseSearch) ||
        item.description.toLowerCase().includes(lowerCaseSearch)
      );
    }

    return items;
  };

  const filteredItems = getFilteredItems();
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const sortedItems = [...paginatedItems].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.ratings.average - a.ratings.average;
      case 'name':
        return a.name.localeCompare(b.name);
      default: // date
        return new Date(b.addedAt) - new Date(a.addedAt);
    }
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calculateDiscount = (original, discounted) => {
    if (!discounted) return null;
    const discount = ((original - discounted) / original) * 100;
    return Math.round(discount);
  };

  const getSortLabel = () => {
    const sortOptions = [
      { key: 'date', label: 'Recently Added' },
      { key: 'price-low', label: 'Price: Low to High' },
      { key: 'price-high', label: 'Price: High to Low' },
      { key: 'rating', label: 'Highest Rated' },
      { key: 'name', label: 'Name: A to Z' },
    ];
    const selectedOption = sortOptions.find(option => option.key === sortBy);
    return selectedOption ? selectedOption.label : 'Sort By';
  };

  const renderWishlistItem = (item, index) => (
    <Card
      hoverable
      className="wishlist-card"
      onClick={() => handleCardClick(item._id)}
      style={{ '--item-index': index }}
      cover={
        <div className="wishlist-image-container">
          <img
            alt={item.name}
            src={item.images && item.images.length > 0 ? item.images[0].url : 'https://via.placeholder.com/300'}
            className="wishlist-image"
          />
          {item.discountPercentage > 0 && (
            <Tag color="red" className="discount-tag">
              {item.discountPercentage}% OFF
            </Tag>
          )}
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={(e) => handleRemoveFromWishlist(item._id, e)}
            className="remove-button"
          />
        </div>
      }
    >
      <div className="wishlist-card-content">
        <h3 className="wishlist-card-title">{item.name}</h3>
        <div className="price-section">
          <div>
            {item.discountPrice ? (
              <>
                <Text type="danger" strong className="discounted-price">₹{item.discountPrice}</Text>
                <Text delete className="original-price">₹{item.price}</Text>
              </>
            ) : (
              <Text strong>₹{item.price}</Text>
            )}
          </div>
          <div className="rating-section">
            <StarFilled className="star-icon" />
            <Text>{item.ratings?.average || 0}</Text>
          </div>
        </div>
        <div className="seller-info">
          <ShopOutlined style={{ marginRight: 6 }} />
          <Text>{item.seller}</Text>
        </div>
        <div className="card-actions">
          <Button 
            className="add-to-cart-button"
            icon={<ShoppingCartOutlined />}
            onClick={(e) => handleAddToCart(item, e)}
          >
            Add to Cart
          </Button>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="1" onClick={(e) => openMoveToCollectionModal(item, e)}>
                  <AppstoreOutlined style={{ marginRight: 8 }} /> Move to Collection
                </Menu.Item>
                <Menu.Item key="2">
                  <ShareAltOutlined style={{ marginRight: 8 }} /> Share
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <Button 
              type="text" 
              icon={<EllipsisOutlined />} 
              onClick={(e) => e.stopPropagation()}
              className="more-options-button"
            />
          </Dropdown>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="wishlist-container">
      <WishlistHeader itemCount={wishlistItems.length} />
      
      {loading ? (
        <div className="wishlist-loading">
          <Spin size="large" />
          <Text>Loading your wishlist...</Text>
        </div>
      ) : (
        <>
          {wishlistItems.length > 0 ? (
            <div className="wishlist-content">
              <div className="wishlist-filters">
                <div className="search-container">
                  <Input
                    placeholder="Search in wishlist"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <div className="sort-container">
                  <Dropdown
                    menu={{ 
                      items: [
                        {
                          key: 'date',
                          label: 'Recently Added',
                          onClick: () => setSortBy('date')
                        },
                        {
                          key: 'price-low',
                          label: 'Price: Low to High',
                          onClick: () => setSortBy('price-low')
                        },
                        {
                          key: 'price-high',
                          label: 'Price: High to Low',
                          onClick: () => setSortBy('price-high')
                        },
                        {
                          key: 'rating',
                          label: 'Highest Rated',
                          onClick: () => setSortBy('rating')
                        },
                        {
                          key: 'name',
                          label: 'Name: A to Z',
                          onClick: () => setSortBy('name')
                        }
                      ]
                    }}
                    trigger={['click']}
                  >
                    <Button className="sort-button">
                      <FilterOutlined /> {getSortLabel()} <DownOutlined />
                    </Button>
                  </Dropdown>
                </div>
              </div>
              
              <div className="wishlist-results">
                <div className="wishlist-grid">
                  {sortedItems.map((item, index) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={item._id} className="wishlist-item">
                      {renderWishlistItem(item, index)}
                    </Col>
                  ))}
                </div>
                
                {paginatedItems.length > pageSize && (
                  <Pagination
                    current={currentPage}
                    total={filteredItems.length}
                    pageSize={pageSize}
                    onChange={handlePageChange}
                    className="wishlist-pagination"
                    showSizeChanger={false}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="empty-wishlist">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="empty-wishlist-text">
                    <Title level={4}>Your wishlist is empty</Title>
                    <Text>Add items to your wishlist while shopping to save them for later.</Text>
                  </div>
                }
              >
                <Button type="primary" size="large" href="/products">
                  Explore Products
                </Button>
              </Empty>
            </div>
          )}
        </>
      )}

      {/* Create Collection Modal */}
      <Modal
        title="Create New Collection"
        visible={collectionModalVisible}
        onOk={handleCreateCollection}
        onCancel={() => setCollectionModalVisible(false)}
        className="collection-modal"
      >
        <Form layout="vertical">
          <Form.Item
            label="Collection Name"
            rules={[{ required: true, message: 'Please enter a collection name' }]}
          >
            <Input 
              placeholder="e.g., Favorites, To Buy Soon, etc."
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              prefix={<AppstoreOutlined style={{ color: '#bfbfbf' }} />}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Move to Collection Modal */}
      <Modal
        title="Move to Collection"
        visible={moveToCollectionModalVisible}
        onOk={handleMoveToCollection}
        onCancel={() => setMoveToCollectionModalVisible(false)}
        className="collection-modal"
      >
        <Form layout="vertical">
          <Form.Item
            label="Select Collection"
            rules={[{ required: true, message: 'Please select a collection' }]}
          >
            <Radio.Group 
              onChange={(e) => setTargetCollection(e.target.value)}
              value={targetCollection}
            >
              {collections.map(collection => (
                <Radio key={collection.id} value={collection.id}>
                  {collection.name}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserWishlist; 