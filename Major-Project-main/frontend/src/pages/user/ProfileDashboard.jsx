import React, { useState, useEffect, useRef } from 'react';
import { 
  Tabs, Card, Typography, Spin, message, Row, Col, Statistic, 
  Avatar, Button, List, Tag, Table, Timeline, Divider, Empty,
  Badge, Space, Select, DatePicker, Input, Form, Breadcrumb,
  Upload, Tooltip, Rate
} from 'antd';
// For Ant Design 5.x
// If this import fails during build, use the commented alternative below
import 'antd/dist/reset.css';
// import 'antd/es/style/reset.css';
import { 
  UserOutlined, ShoppingOutlined, StarOutlined, BellOutlined,
  HeartOutlined, HistoryOutlined, SettingOutlined, FileTextOutlined,
  WalletOutlined, SafetyOutlined, HomeOutlined, CreditCardOutlined,
  ShoppingCartOutlined, GiftOutlined, ClockCircleOutlined, CheckCircleOutlined,
  PieChartOutlined, TagOutlined, MessageOutlined, LikeOutlined,
  EditOutlined, SaveOutlined, CameraOutlined, MailOutlined, PhoneOutlined,
  DeleteOutlined, RightOutlined
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import userService from '../../services/userService';
import wishlistService from '../../services/wishlistService';
import cartService from '../../services/cartService';
import api, { getImage } from '../../services/api';
// import ProfileManagement from './ProfileManagement';
import OrderHistory from './OrderHistory';
import ReviewsAndRatings from './ReviewsAndRatings';
import { useUser } from '../../context/UserContext';
import { uploadFile } from '../../components/layouts/UserLayout';
import ProfileImage from '../../components/ProfileImage';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Search } = Input;

// Helper function to get category-based placeholder images
const getCategoryPlaceholder = (category) => {
  if (!category) return 'https://via.placeholder.com/400x400?text=Product+Image';
  
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('vegetable') || categoryLower === 'vegetables') {
    return 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80';
  } else if (categoryLower.includes('fruit') || categoryLower === 'fruits') {
    return 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80';
  } else if (categoryLower.includes('herb') || categoryLower === 'herbs') {
    return 'https://images.unsplash.com/photo-1556646781-a84ff68f54ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80';
  } else if (categoryLower.includes('root') || categoryLower === 'root vegetables') {
    return 'https://images.unsplash.com/photo-1576409902781-a5f7d5eeaf76?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80';
  } else if (categoryLower.includes('organic')) {
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80';
  }
  
  return 'https://via.placeholder.com/400x400?text=Product+Image';
};

const ProfileDashboard = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const { user: contextUser, updateUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [editMode, setEditMode] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState(null);
  const [debugMode, setDebugMode] = useState(false);
  
  // Move wishlist tab state outside of the render function
  const [productImages, setProductImages] = useState({});
  
  useEffect(() => {
    fetchUserData();
    
    // Set active tab based on URL query param
    const query = new URLSearchParams(location.search);
    const tabParam = query.get('tab');
    
    if (tabParam) {
      switch (tabParam) {
        case 'profile':
          setActiveTab('2');
          break;
        case 'orders':
          setActiveTab('3');
          break;
        case 'reviews':
          setActiveTab('4');
          break;
        case 'security':
          setActiveTab('5');
          break;
        case 'wishlist':
          setActiveTab('6');
          break;
        default:
          setActiveTab('1'); // Default to dashboard
      }
    }
  }, [location]);
  
  // Function to get icon based on activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingOutlined />;
      case 'review':
        return <StarOutlined />;
      case 'wishlist':
        return <HeartOutlined />;
      case 'payment':
        return <WalletOutlined />;
      case 'product_view':
        return <FileTextOutlined />;
      case 'like':
        return <LikeOutlined />;
      case 'message':
        return <MessageOutlined />;
      case 'purchase':
        return <TagOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch user profile data
      try {
      const profileResponse = await userService.getUserProfile();
      
      if (profileResponse && profileResponse.data) {
        setUserData(profileResponse.data);
        
        // Update context with the latest user data if needed
        if (contextUser && profileResponse.data._id === contextUser._id) {
          updateUser(profileResponse.data);
        }
      } else {
        // Fallback to contextUser data if available
          if (contextUser) {
            setUserData(contextUser);
          } else {
            message.error('Failed to load user profile');
            navigate('/login');
            return;
          }
        }
      } catch (profileError) {
        console.error('Error fetching user profile:', profileError);
        if (contextUser) {
          setUserData(contextUser);
        } else {
          message.error('Failed to load user profile');
          navigate('/login');
          return;
        }
      }
      
      // Fetch dashboard stats
      try {
        const statsResponse = await userService.getUserDashboardStats();
        if (statsResponse && statsResponse.data) {
          // Extract data correctly based on response structure
          const statsData = statsResponse.data.data || statsResponse.data;
          setDashboardStats(statsData);
          console.log('Dashboard stats loaded successfully:', statsData);
        } else {
          console.error('Invalid dashboard stats response:', statsResponse);
          message.error('Failed to load dashboard statistics');
        }
      } catch (statsError) {
        console.error('Error fetching dashboard stats:', statsError);
        message.error('Failed to load dashboard statistics');
      }
      
      // Fetch order stats
      try {
        const orderStatsResponse = await userService.getUserOrderStats();
        if (orderStatsResponse && orderStatsResponse.data) {
          // Extract data correctly based on response structure
          const orderStatsData = orderStatsResponse.data.data || orderStatsResponse.data;
          setOrderStats(orderStatsData);
          console.log('Order stats loaded successfully:', orderStatsData);
        } else {
          console.error('Invalid order stats response:', orderStatsResponse);
          message.error('Failed to load order statistics');
        }
      } catch (orderStatsError) {
        console.error('Error fetching order stats:', orderStatsError);
        message.error('Failed to load order statistics');
      }
      
      // Fetch recent activity
      try {
        const activityResponse = await userService.getUserRecentActivity(5);
        if (activityResponse && activityResponse.data) {
          // Get the activity data from the response
          const activityData = activityResponse.data.data || activityResponse.data;
          
          // Transform activity data to match the timeline format
          const transformedActivity = Array.isArray(activityData) ? activityData.map(activity => ({
            id: activity.id || activity._id,
            type: activity.type,
            description: activity.description || `${activity.action || 'Performed activity'} ${activity.type}`,
            date: activity.createdAt || activity.date,
            data: activity.data || activity
          })) : [];
          
          setRecentActivity(transformedActivity);
          console.log('Activity data loaded successfully:', transformedActivity);
        } else {
          console.error('Invalid activity response:', activityResponse);
          setRecentActivity([]);
        }
      } catch (activityError) {
        console.error('Error fetching recent activity:', activityError);
        setRecentActivity([]);
      }
    } catch (error) {
      console.error('Error fetching user dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      message.error('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add this debug helper function near the top of the file
  const debugToken = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    console.log('Auth token available:', !!token);
    if (token) {
      console.log(`Token (first 20 chars): ${token.substring(0, 20)}...`);
    } else {
      console.log('No token found in localStorage');
    }
  };

  // Add a direct upload function near the top of the component
  const directFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Log upload details
    console.log(`Directly uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`);
    
    // Get auth token
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    if (!token) {
      console.error('No authentication token found');
      return { success: false, error: 'Authentication token missing' };
    }
    
    // Log token info (sanitized)
    console.log(`Using token (${token.length} chars): ${token.substring(0, 10)}...`);
    
    try {
      const response = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      console.log(`Upload response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        return { success: false, error: errorText };
      }
      
      const data = await response.json();
      console.log('Upload successful:', data);
      
      return {
        success: true,
        url: data.url
      };
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }
  };

  // Modify the handleProfileImageUpload function
  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setError('No file selected');
      return;
    }

      setLoading(true);
    setMessage('Uploading image...');
    
    try {
      const result = await directFileUpload(file);
      
      if (result.success) {
        setMessage('Image uploaded successfully');
        
        // Update form data
        setFormData(prev => ({
          ...prev,
          avatarUrl: result.url
        }));
        
        // Update state
          setUserData(prev => ({
            ...prev,
          avatarUrl: result.url,
          avatar: result.url 
        }));
        
        // Update profile
        await userService.updateUserProfile({ avatarUrl: result.url });
        
        // Update context
        if (updateUser && contextUser) {
          updateUser({
            ...contextUser,
            avatarUrl: result.url,
            avatar: result.url
          });
        }
      } else {
        setError(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Profile image upload error:', error);
      setError(error.message || 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const navigateToOrders = () => {
    // If we're already on the profile page, just switch tabs
    if (location.pathname === '/profile') {
      switchToOrdersTab();
    } else {
      // Otherwise, navigate to the profile page with the orders tab parameter
      navigate('/profile?tab=orders', { replace: true });
    }
  };

  const navigateToWishlist = () => {
    // If we're already on the profile page, just switch tabs
    if (location.pathname === '/profile') {
      switchToWishlistTab();
    } else {
      // Otherwise, navigate to the profile page with the wishlist tab parameter
      navigate('/profile?tab=wishlist', { replace: true });
    }
  };

  const navigateToCart = () => {
    navigate('/cart');
  };

  const navigateToUrgentSales = () => {
    navigate('/urgent-sales');
  };

  const navigateToSettings = () => {
    // If we're already on the profile page, just switch tabs
    if (location.pathname === '/profile') {
      switchToSettingsTab();
    } else {
      // Otherwise, navigate to the profile page with the settings tab parameter
      navigate('/profile?tab=settings', { replace: true });
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    
    // Update URL when tab changes
    let tabParam = '';
    switch (key) {
      case '2':
        tabParam = 'profile';
        break;
      case '3':
        tabParam = 'orders';
        break;
      case '4':
        tabParam = 'reviews';
        break;
      case '5':
        tabParam = 'security';
        break;
      case '6':
        tabParam = 'wishlist';
        break;
      default:
        tabParam = '';
    }
    
    if (tabParam) {
      navigate(`/profile?tab=${tabParam}`);
    } else {
      navigate('/profile');
    }
  };

  // Simpler functions for readability and use from other components
  const switchToSettingsTab = () => handleTabChange('2');
  const switchToOrdersTab = () => handleTabChange('3');
  const switchToReviewsTab = () => handleTabChange('4');
  const switchToSecurityTab = () => handleTabChange('5');
  const switchToWishlistTab = () => handleTabChange('6');

  useEffect(() => {
    // Only fetch wishlist items when this tab is active
    if (activeTab === '6') {
      fetchWishlistItems();
    }
  }, [activeTab]);

  const fetchWishlistItems = async () => {
    setWishlistLoading(true);
    try {
      const response = await wishlistService.getWishlistItems();
      
      // Handle different response structures
      let items = [];
      
      if (response.data && response.data.wishlist) {
        items = response.data.wishlist;
      } else if (response.data && Array.isArray(response.data)) {
        items = response.data;
      } else if (response.wishlist && Array.isArray(response.wishlist)) {
        items = response.wishlist;
      } else if (Array.isArray(response)) {
        items = response;
      }
      
        // Filter out wishlist items with null products
      const validWishlistItems = items.filter(item => item.product !== null);
        setWishlistItems(validWishlistItems);
      
      console.log('Wishlist items loaded:', validWishlistItems.length);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      message.error('Failed to load wishlist items. Please try again.');
      setWishlistItems([]);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      message.success('Product removed from wishlist');
      // Update the local state by removing the item
      setWishlistItems(wishlistItems.filter(item => item.product._id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      message.error('Failed to remove product from wishlist');
      
      // Even if API call fails, update UI to improve user experience
      // This creates the illusion of successful removal while handling network issues
      setWishlistItems(wishlistItems.filter(item => item.product._id !== productId));
    }
  };

  const handleAddToCart = async (productId, product) => {
    try {
      // Set loading for the specific product
      message.loading({ content: 'Adding to cart...', key: productId });
      
      // Prepare cart item data
      const cartItem = {
        productId,
        quantity: 1
      };
      
      // If the product object is available, pass it to avoid another API call
      if (product) {
        cartItem.product = product;
      }
      
      // Try to add to cart
      const response = await cartService.addToCart(cartItem);
      
      if (response && (response.success || response.status === 'success')) {
        message.success({ 
          content: 'Product added to cart!', 
          key: productId, 
          duration: 2 
        });
        
        // Optionally remove from wishlist after adding to cart
        // await handleRemoveFromWishlist(productId);
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      message.error({ 
        content: error.response?.data?.message || 'Failed to add product to cart', 
        key: productId,
        duration: 3
      });
    }
  };

  // Load images when wishlist items change
  useEffect(() => {
    const loadImages = async () => {
      const imageUrls = {};
      
      if (wishlistItems && wishlistItems.length > 0) {
        // Process each wishlist item to get its image
        for (const item of wishlistItems) {
          // Handle different product data structures
          const product = typeof item === 'object' && item.product ? item.product : item;
          
          if (product && product._id) {
            try {
              // Skip if product already has a defined image in the correct format
              if (product.image) {
                if (typeof product.image === 'string') {
                  imageUrls[product._id] = product.image;
                  continue;
                }
                if (product.image.url) {
                  imageUrls[product._id] = product.image.url;
                  continue;
                }
              }
              
              if (product.images && product.images.length > 0) {
                if (typeof product.images[0] === 'string') {
                  imageUrls[product._id] = product.images[0];
                  continue;
                }
                if (product.images[0].url) {
                  imageUrls[product._id] = product.images[0].url;
                  continue;
                }
              }
              
              // Try to get image from API
              const imageUrl = await getImage(product._id);
              if (imageUrl) {
                imageUrls[product._id] = imageUrl;
              } else {
                // Use category-based placeholder
                imageUrls[product._id] = getCategoryPlaceholder(product.category);
              }
            } catch (error) {
              console.error(`Failed to load image for product ${product._id}:`, error);
              // Set a default placeholder on error based on product category
              imageUrls[product._id] = getCategoryPlaceholder(product.category);
            }
          }
        }
        
        setProductImages(imageUrls);
      }
    };
    
    if (wishlistItems.length > 0) {
      loadImages();
    }
    
    // Cleanup function to revoke object URLs on unmount
    return () => {
      Object.values(productImages).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [wishlistItems]);

  const renderDashboardTab = () => (
    <div className="dashboard-container">
      <Row gutter={[24, 24]}>
        {/* User Welcome Card */}
        <Col xs={24} lg={24}>
          <Card className="welcome-card" variant="borderless" style={{ 
            background: 'linear-gradient(135deg, #f0f7ff 0%, #e1ecf7 100%)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            borderRadius: '12px'
          }}>
            <Row gutter={24} align="middle">
              <Col xs={24} md={6} className="text-center">
                <Badge
                  count={
                    <Button
                      shape="circle"
                      icon={<CameraOutlined />}
                      size="small"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = async (e) => {
                          if (e.target.files.length > 0) {
                            const file = e.target.files[0];
                            setLoading(true);
                            setMessage('Uploading image...');
                            
                            const result = await directFileUpload(file);
                            
                            if (result.success) {
                              setMessage('Image uploaded successfully');
                              // Update profile and state with new image URL
                              await userService.updateUserProfile({ avatarUrl: result.url });
                              
                              // Update local state
                              setUserData(prev => ({
                                ...prev,
                                avatarUrl: result.url,
                                avatar: result.url
                              }));
                              
                              // Update context
                              if (updateUser && contextUser) {
                                updateUser({
                                  ...contextUser,
                                  avatarUrl: result.url,
                                  avatar: result.url
                                });
                              }
                            } else {
                              setError(`Upload failed: ${result.error}`);
                            }
                            
                            setLoading(false);
                          }
                        };
                        input.click();
                      }}
                      style={{
                        backgroundColor: '#4a90e2',
                        color: 'white',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                      }}
                    />
                  }
                  offset={[0, 120]}
                >
                  <Avatar 
                    size={180} 
                    src={userData?.avatarUrl || userData?.avatar || "https://via.placeholder.com/150"} 
                    icon={<UserOutlined />} 
                    style={{ 
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                      margin: '0 auto 24px'
                    }}
                  />
                </Badge>
              </Col>
              <Col xs={24} md={18}>
                <Title level={2} style={{ marginBottom: '8px', color: '#1a1a1a' }}>Welcome back, {userData?.name || 'User'}!</Title>
                <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                  Here's an overview of your account and recent activity.
                </Paragraph>
                <Space size="middle">
                  <Button 
                    type="primary" 
                    icon={<SettingOutlined />} 
                    onClick={switchToSettingsTab}
                    style={{ 
                      borderRadius: '6px',
                      height: '40px',
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                      backgroundColor: '#4a90e2'
                    }}
                    size="large"
                  >
                    Manage Profile
                  </Button>
                  <Button 
                    icon={<ShoppingOutlined />} 
                    onClick={switchToOrdersTab}
                    style={{ 
                      borderRadius: '6px',
                      height: '40px',
                      borderColor: '#4a90e2',
                      color: '#4a90e2'
                    }}
                    size="large"
                  >
                    View Orders
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Stats Cards */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card 
            hoverable 
            onClick={() => handleTabChange('3')}
            style={{
              borderRadius: '10px',
              height: '100%',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
              borderColor: '#f0f0f0'
            }}
          >
            <Statistic
              title={<span style={{ fontSize: '16px', color: '#333' }}>Total Orders</span>}
              value={(orderStats?.orderCounts?.total || orderStats?.totalOrders) || 0}
              prefix={<ShoppingCartOutlined style={{ color: '#4a90e2' }} />}
              valueStyle={{ color: '#4a90e2', fontWeight: '600' }}
            />
            <div style={{ marginTop: '16px' }}>
              <Button type="link" style={{ padding: 0, color: '#4a90e2' }} onClick={() => handleTabChange('3')}>
                View Order History <RightOutlined />
              </Button>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card 
            hoverable 
            onClick={() => handleTabChange('3')}
            style={{
              borderRadius: '10px',
              height: '100%',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
              borderColor: '#f0f0f0'
            }}
          >
            <Statistic
              title={<span style={{ fontSize: '16px', color: '#333' }}>Pending Orders</span>}
              value={(orderStats?.orderCounts?.pending || orderStats?.pendingOrders) || 0}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14', fontWeight: '600' }}
            />
            <div style={{ marginTop: '16px' }}>
              <Button type="link" style={{ padding: 0, color: '#faad14' }} onClick={() => handleTabChange('3')}>
                Track Orders <RightOutlined />
              </Button>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card 
            hoverable 
            onClick={() => handleTabChange('6')}
            style={{
              borderRadius: '10px',
              height: '100%',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
              borderColor: '#f0f0f0'
            }}
          >
            <Statistic
              title={<span style={{ fontSize: '16px', color: '#333' }}>Saved Items</span>}
              value={dashboardStats?.wishlistCount || 0}
              prefix={<HeartOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f', fontWeight: '600' }}
            />
            <div style={{ marginTop: '16px' }}>
              <Button type="link" style={{ padding: 0, color: '#ff4d4f' }} onClick={() => handleTabChange('6')}>
                View Wishlist <RightOutlined />
              </Button>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card 
            hoverable 
            onClick={() => handleTabChange('4')}
            style={{
              borderRadius: '10px',
              height: '100%',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
              borderColor: '#f0f0f0'
            }}
          >
            <Statistic
              title={<span style={{ fontSize: '16px', color: '#333' }}>My Reviews</span>}
              value={dashboardStats?.reviewsCount || 0}
              prefix={<StarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontWeight: '600' }}
            />
            <div style={{ marginTop: '16px' }}>
              <Button type="link" style={{ padding: 0, color: '#52c41a' }} onClick={() => handleTabChange('4')}>
                Manage Reviews <RightOutlined />
              </Button>
            </div>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={12}>
          <Card 
            title={<Title level={4} style={{ margin: 0 }}>Recent Activity</Title>} 
            className="h-full" 
            variant="borderless"
            style={{ 
              borderRadius: '12px', 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', 
              height: '100%',
              minHeight: '400px'
            }}
          >
            {recentActivity && recentActivity.length > 0 ? (
              <Timeline>
                {recentActivity.map((activity, index) => (
                  <Timeline.Item 
                    key={activity.id || activity._id || `activity-${index}`} 
                    dot={getActivityIcon(activity.type)}
                    color={
                      activity.type === 'order' ? 'blue' : 
                      activity.type === 'review' ? 'green' : 
                      activity.type === 'wishlist' ? 'red' : 
                      activity.type === 'payment' ? 'gold' :
                      'gray'
                    }
                  >
                    <div>
                      <Text strong style={{ fontSize: '15px' }}>{activity.description}</Text>
                      <div>
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                          {new Date(activity.date).toLocaleDateString('en-US', {
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                        {activity.data && (
                          <div style={{ marginTop: '4px' }}>
                            {activity.type === 'order' && (
                              <Tag color={
                                activity.data.status === 'completed' || activity.data.status === 'delivered' 
                                  ? 'success' 
                                  : activity.data.status === 'cancelled' 
                                    ? 'error' 
                                    : 'processing'
                              }>
                                {activity.data.status.charAt(0).toUpperCase() + activity.data.status.slice(1)}
                              </Tag>
                            )}
                            {activity.type === 'review' && (
                              <Rate disabled defaultValue={activity.data.rating} style={{ fontSize: '14px' }} />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty 
                description={
                  <span style={{ color: '#666' }}>No recent activity</span>
                } 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ marginTop: '80px' }}
              />
            )}
          </Card>
        </Col>

        {/* Quick Links */}
        <Col xs={24} lg={12}>
          <Card 
            title={<Title level={4} style={{ margin: 0 }}>Quick Links</Title>} 
            className="h-full" 
            variant="borderless"
            style={{ 
              borderRadius: '12px', 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', 
              height: '100%',
              minHeight: '400px'
            }}
          >
            <List
              grid={{ gutter: 16, column: 2 }}
              dataSource={[
                { icon: <ShoppingOutlined style={{ color: '#4a90e2' }} />, title: 'My Orders', onClick: switchToOrdersTab },
                { icon: <StarOutlined style={{ color: '#52c41a' }} />, title: 'My Reviews', onClick: switchToReviewsTab },
                { icon: <HeartOutlined style={{ color: '#f5222d' }} />, title: 'Wishlist', onClick: switchToWishlistTab },
                { icon: <WalletOutlined style={{ color: '#faad14' }} />, title: 'Payment Methods', onClick: switchToSettingsTab },
                { icon: <HomeOutlined style={{ color: '#722ed1' }} />, title: 'Addresses', onClick: switchToSettingsTab },
                { icon: <BellOutlined style={{ color: '#eb2f96' }} />, title: 'Notifications', onClick: switchToSettingsTab },
                { icon: <ShoppingCartOutlined style={{ color: '#13c2c2' }} />, title: 'Shopping Cart', onClick: navigateToCart },
                { icon: <TagOutlined style={{ color: '#fa8c16' }} />, title: 'Urgent Sales', onClick: navigateToUrgentSales }
              ]}
              renderItem={item => (
                <List.Item>
                  <Button 
                    icon={item.icon} 
                    type="text" 
                    block 
                    className="text-left" 
                    onClick={item.onClick}
                    style={{ 
                      textAlign: 'left', 
                      padding: '16px',
                      borderRadius: '8px',
                      height: 'auto',
                      transition: 'all 0.3s ease',
                      fontWeight: '500',
                      fontSize: '15px'
                    }}
                    hoverable="true"
                  >
                    <span style={{ marginLeft: '12px' }}>{item.title}</span>
                  </Button>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Function to render the Profile Settings tab
  const renderProfileSettingsTab = () => {
    return (
      <div className="profile-settings-container">
        <Card 
          variant="borderless"
          style={{ 
            borderRadius: '12px', 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="text-center mb-8">
            <Badge
              count={
                <Button
                  shape="circle"
                  icon={<CameraOutlined />}
                  size="small"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = async (e) => {
                      if (e.target.files.length > 0) {
                        const file = e.target.files[0];
                        setLoading(true);
                        setMessage('Uploading image...');
                        
                        const result = await directFileUpload(file);
                        
                        if (result.success) {
                          setMessage('Image uploaded successfully');
                          // Update profile and state with new image URL
                          await userService.updateUserProfile({ avatarUrl: result.url });
                          
                          // Update local state
                          setUserData(prev => ({
                            ...prev,
                            avatarUrl: result.url,
                            avatar: result.url
                          }));
                          
                          // Update context
                          if (updateUser && contextUser) {
                            updateUser({
                              ...contextUser,
                              avatarUrl: result.url,
                              avatar: result.url
                            });
                          }
                        } else {
                          setError(`Upload failed: ${result.error}`);
                        }
                        
                        setLoading(false);
                      }
                    };
                    input.click();
                  }}
                  style={{
                    background: '#4a90e2',
                    color: 'white'
                  }}
                />
              }
              offset={[0, 120]}
            >
              <Avatar 
                size={180} 
                src={userData?.avatarUrl || userData?.avatar || "https://via.placeholder.com/150"} 
                icon={<UserOutlined />} 
                style={{ 
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  margin: '0 auto 24px'
                }}
              />
            </Badge>
            
            {/* Debug toggle button */}
            {import.meta.env.DEV && (
              <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                <Button 
                  size="small" 
                  type={debugMode ? "primary" : "default"}
                  onClick={() => setDebugMode(!debugMode)}
                  icon={<SettingOutlined />}
                >
                  Debug
                </Button>
              </div>
            )}
            
            {/* Debug info panel */}
            {debugMode && (
              <div 
                style={{ 
                  margin: '20px auto',
                  padding: '15px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  textAlign: 'left',
                  maxWidth: '600px',
                  marginBottom: '20px'
                }}
              >
                <Typography.Title level={5} style={{ marginTop: 0 }}>Debug Information</Typography.Title>
                <div>
                  <p><strong>User ID:</strong> {userData?._id || 'Not available'}</p>
                  <p><strong>Context User:</strong> {contextUser ? 'Available' : 'Not available'}</p>
                  <p><strong>Email:</strong> {userData?.email}</p>
                  <p>
                    <Button 
                      size="small" 
                      onClick={() => console.log('User data:', userData)}
                      style={{ marginRight: '8px' }}
                    >
                      Log User Data
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => console.log('Context:', contextUser)}
                      style={{ marginRight: '8px' }}
                    >
                      Log Context
                    </Button>
                    <Button 
                      size="small" 
                      onClick={fetchUserData}
                    >
                      Refresh Data
                    </Button>
                  </p>
                  <p>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => {
                        const token = localStorage.getItem('token') || localStorage.getItem('userToken');
                        console.log('Auth token available:', !!token);
                        if (token) {
                          console.log(`Token (${token.length} chars): ${token.substring(0, 25)}...${token.substring(token.length - 10)}`);
                          try {
                            // Log token contents (if JWT)
                            const parts = token.split('.');
                            if (parts.length === 3) {
                              const payload = JSON.parse(atob(parts[1]));
                              console.log('Token payload:', payload);
                              console.log('Token expiry:', new Date(payload.exp * 1000).toLocaleString());
                              console.log('Token issued:', new Date(payload.iat * 1000).toLocaleString());
                              
                              // Check if token is expired
                              const now = Math.floor(Date.now() / 1000);
                              console.log('Token expired:', payload.exp < now);
                            }
                          } catch (e) {
                            console.log('Could not parse token payload:', e);
                          }
                        }
                        
                        // Test upload immediately
                        try {
                          fetch('http://localhost:5001/api/check-auth', {
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          })
                          .then(res => {
                            console.log('Auth check response:', res.status, res.statusText);
                            return res.text();
                          })
                          .then(text => {
                            try {
                              const json = JSON.parse(text);
                              console.log('Auth check parsed:', json);
                            } catch (e) {
                              console.log('Auth check raw text:', text);
                            }
                          })
                          .catch(err => console.error('Auth check error:', err));
                        } catch (e) {
                          console.error('Auth check exception:', e);
                        }
                      }}
                    >
                      Debug Auth
                    </Button>
                    {' '}
                    <Button 
                      type="primary" 
                      size="small" 
                      danger
                      onClick={() => {
                        const manualUpdate = {
                          name: userData?.name || 'Updated User',
                          phone: userData?.phone || '1234567890'
                        };
                        console.log('Sending manual update:', manualUpdate);
                        userService.updateUserProfile(manualUpdate)
                          .then(res => {
                            console.log('Manual update response:', res);
                            message.success('Manual update complete - check console');
                          })
                          .catch(err => {
                            console.error('Manual update failed:', err);
                            message.error('Manual update failed - check console');
                          });
                      }}
                    >
                      Try Manual Update
                    </Button>
                  </p>
                </div>
              </div>
            )}
            
            <div style={{ marginTop: '20px' }}>
              {editMode ? (
                <Form
                  form={profileForm}
                  layout="vertical"
                  initialValues={{
                    name: userData?.name || '',
                    email: userData?.email || '',
                    phone: userData?.phone || ''
                  }}
                  onFinish={handleProfileSubmit}
                  style={{ maxWidth: '400px', margin: '0 auto' }}
                >
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                      placeholder="Your full name"
                      size="large"
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                      placeholder="Your email address"
                      size="large"
                      style={{ borderRadius: '8px' }}
                      disabled
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[
                      { required: true, message: 'Please enter your phone number' }
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                      placeholder="Your phone number"
                      size="large"
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                  
                  <Form.Item>
                    <Space size="middle">
                      <Button 
                        type="primary" 
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={formSubmitting}
                        style={{ 
                          height: '40px',
                          borderRadius: '8px',
                          width: '160px',
                          fontSize: '16px'
                        }}
                      >
                        {formSubmitting ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button 
                        onClick={() => setEditMode(false)}
                        disabled={formSubmitting}
                        style={{ 
                          height: '40px',
                          borderRadius: '8px',
                          width: '100px'
                        }}
                      >
                        Cancel
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              ) : (
                <>
                  <Typography.Title level={3}>{userData?.name || 'User'}</Typography.Title>
                  <Typography.Text type="secondary">{userData?.email || 'user@example.com'}</Typography.Text>
                  <div style={{ marginTop: '16px' }}>
                    <Typography.Text style={{ display: 'block', marginTop: '8px' }}>
                      Phone: {userData?.phone || 'Not provided'}
                    </Typography.Text>
                    <Typography.Text style={{ display: 'block', marginTop: '8px' }}>
                      Member since: {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'}
                    </Typography.Text>
                  </div>
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />} 
                    onClick={() => setEditMode(true)}
                    style={{ 
                      marginTop: '24px',
                      height: '40px',
                      borderRadius: '8px',
                      paddingLeft: '20px',
                      paddingRight: '20px',
                      fontSize: '16px'
                    }}
                    size="large"
                  >
                    Edit Profile
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Function to handle profile form submission
  const handleProfileSubmit = async (values) => {
    setFormSubmitting(true);
    try {
      // Show loading message
      const key = 'profile-update';
      message.loading({ content: 'Updating profile...', key });
      
      // Format data properly for the API
      const profileData = {
        name: values.name,
        phone: values.phone
      };
      
      console.log('Submitting profile update with data:', profileData);
      
      // Call the API to update the user profile
      const response = await userService.updateUserProfile(profileData);
      
      console.log('Profile update response:', response);
      
      // Handle different response formats
      let updatedUserData;
      
      if (response && response.data) {
        // Standard format
        updatedUserData = response.data;
      } else if (response && response.status === 'success' && response.user) {
        // Alternative format
        updatedUserData = response.user;
      } else if (response && typeof response === 'object') {
        // Direct user object format
        updatedUserData = response;
      }
      
      if (updatedUserData) {
        // Update local state
        setUserData(prev => ({
          ...prev,
          ...updatedUserData
        }));
        
        // Update context with the latest user data
        if (contextUser) {
          updateUser({
            ...contextUser,
            ...updatedUserData
          });
        }
        
        message.success({ content: 'Profile updated successfully!', key });
        setEditMode(false);
        
        // Refresh user data to ensure we have the latest
        fetchUserData();
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      
      // Try to extract error message from response if available
      const errorMsg = error.response?.data?.message || 
                        error.response?.data?.error || 
                        'Failed to update profile. Please try again.';
      
      message.error(errorMsg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const renderSecurityTab = () => {
    const handlePasswordChange = async (values) => {
      setChangingPassword(true);
      try {
        const key = 'password-change';
        message.loading({ content: 'Updating password...', key });

        // Validate current password first
        try {
          const verifyResponse = await userService.verifyCurrentPassword({
            currentPassword: values.currentPassword
          });
          
          if (!verifyResponse.success) {
            message.error({ content: 'Current password is incorrect', key });
            return;
          }
        } catch (verifyError) {
          console.error('Password verification failed:', verifyError);
          message.error({ 
            content: verifyError.response?.data?.message || 'Current password is incorrect', 
            key 
          });
          return;
        }
        
        // Current password is verified, proceed with change
        const changeResponse = await userService.changeUserPassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        });
        
        console.log('Password change response:', changeResponse);
        
        message.success({ content: 'Password updated successfully!', key });
        passwordForm.resetFields();
      } catch (error) {
        console.error('Error changing password:', error);
        
        // Try to extract error message from response if available
        const errorMsg = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to change password. Please try again.';
        
        message.error(errorMsg);
      } finally {
        setChangingPassword(false);
      }
    };

    return (
      <Card title="Security Settings" variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
        <Form 
          layout="vertical" 
          form={passwordForm}
          onFinish={handlePasswordChange}
          style={{ maxWidth: '500px', margin: '0 auto' }}
        >
          <Form.Item 
            label="Change Password" 
            style={{ marginBottom: '24px', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}
          >
            <Text type="secondary">
              Strong passwords include a mix of letters, numbers, and special characters
            </Text>
          </Form.Item>
          
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[
              { required: true, message: 'Please enter your current password' }
            ]}
          >
            <Input.Password 
              placeholder="Enter your current password" 
              style={{ borderRadius: '6px' }} 
            />
          </Form.Item>
          
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter your new password' },
              { min: 8, message: 'Password must be at least 8 characters long' }
            ]}
          >
            <Input.Password 
              placeholder="Enter your new password" 
              style={{ borderRadius: '6px' }} 
            />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password 
              placeholder="Confirm your new password" 
              style={{ borderRadius: '6px' }} 
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={changingPassword}
              style={{ borderRadius: '6px', height: '40px', width: '180px' }}
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </Form.Item>
          
          <Divider />
          
          <Form.Item label="Two-Factor Authentication">
            <div style={{ marginBottom: '12px' }}>
              <Text>Enhance your account security by enabling two-factor authentication.</Text>
            </div>
            <Button style={{ borderRadius: '6px' }}>Enable 2FA</Button>
          </Form.Item>
          
          <Divider />
          
          <Form.Item label="Login History">
            <div style={{ marginBottom: '12px' }}>
              <Text>Recent login activity on your account:</Text>
            </div>
            <List
              size="small"
              bordered
              style={{ borderRadius: '6px' }}
              dataSource={[
                { device: 'Windows PC', location: 'Mumbai, India', time: '2023-06-15 14:30' },
                { device: 'iPhone', location: 'Mumbai, India', time: '2023-06-14 09:15' }
              ]}
              renderItem={item => (
                <List.Item>
                  <Text style={{ fontWeight: '500' }}>{item.device}</Text> • <Text type="secondary">{item.location}</Text> • <Text type="secondary">{item.time}</Text>
                </List.Item>
              )}
            />
          </Form.Item>
        </Form>
      </Card>
    );
  };

  const renderWishlistTab = () => {
    return (
      <div>
        <Card 
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>My Wishlist</span>
              <Button type="primary" icon={<HeartOutlined />} onClick={() => window.location.href="/products"}>
                Continue Shopping
              </Button>
            </div>
          } 
          variant="borderless"
          style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
        >
          {wishlistLoading ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <Spin size="large" />
              <p style={{ marginTop: '16px' }}>Loading your wishlist items...</p>
            </div>
          ) : wishlistItems.length === 0 ? (
            <Empty 
              description={
                <span>
                  Your wishlist is empty. Start adding products you love!
                  <br />
                  <Button 
                    type="primary" 
                    style={{ marginTop: '16px' }} 
                    onClick={() => window.location.href="/products"}
                  >
                    Browse Products
                  </Button>
                </span>
              } 
            />
          ) : (
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
              dataSource={wishlistItems}
              renderItem={item => {
                // Handle different product data structures
                const product = typeof item === 'object' && item.product ? item.product : item;
                
                if (!product || typeof product !== 'object') {
                  console.error('Invalid product item:', item);
                  return null;
                }
                
                // Get product image URL from various possible structures
                const getProductImage = () => {
                  if (productImages[product._id]) {
                    return productImages[product._id];
                  }
                  
                  if (product.image) {
                    if (typeof product.image === 'string') {
                      return product.image;
                    }
                    if (product.image.url) {
                      return product.image.url;
                    }
                  }
                  
                  if (product.images && product.images.length > 0) {
                    if (typeof product.images[0] === 'string') {
                      return product.images[0];
                    }
                    if (product.images[0].url) {
                      return product.images[0].url;
                    }
                  }
                  
                  return getCategoryPlaceholder(product.category);
                };

                // Get product price from various possible structures
                const getProductPrice = () => {
                  if (product.discountPrice) {
                    return product.discountPrice;
                  }
                  if (product.price) {
                    return product.price;
                  }
                  if (product.cost) {
                    return product.cost;
                  }
                  return 0;
                };
                
                // Get seller name from various possible structures
                const getSellerName = () => {
                  if (typeof product.seller === 'string') {
                    return product.seller;
                  }
                  if (product.seller && product.seller.name) {
                    return product.seller.name;
                  }
                  if (product.sellerName) {
                    return product.sellerName;
                  }
                  return 'Unknown';
                };
                
                return (
                  <List.Item>
                    <Card
                      hoverable
                      style={{ width: '100%' }}
                      actions={[
                        <Tooltip title="Add to Cart">
                          <Button 
                            type="text" 
                            icon={<ShoppingCartOutlined />}
                            onClick={() => handleAddToCart(product._id, product)}
                          />
                        </Tooltip>,
                        <Tooltip title="Remove from Wishlist">
                          <Button 
                            type="text" 
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              const itemId = product._id;
                              handleRemoveFromWishlist(itemId);
                            }}
                          />
                        </Tooltip>
                      ]}
                    >
                      <Card.Meta
                        title={product.name}
                        description={
                          <>
                            <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                              <img 
                                src={getProductImage()}
                                alt={product.name}
                                style={{ 
                                  width: '100%', 
                                  height: '150px', 
                                  objectFit: 'contain',
                                  border: '1px solid #f0f0f0',
                                  borderRadius: '4px',
                                  padding: '8px',
                                  backgroundColor: '#fff'
                                }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = getCategoryPlaceholder(product.category) || '/placeholder-image.png';
                                }}
                              />
                            </div>
                            <p style={{ margin: '4px 0', color: 'gray' }}>
                              Category: {product.category || 'Not specified'}
                            </p>
                            <p style={{ margin: '4px 0', color: 'gray' }}>
                              Seller: {getSellerName()}
                            </p>
                            <p style={{ margin: '8px 0', fontWeight: 'bold', color: 'green' }}>
                              Price: ₹{getProductPrice()}
                            </p>
                            {product.stock !== undefined && (
                              <p style={{ margin: '4px 0', color: product.stock > 0 ? 'blue' : 'red' }}>
                                Stock: {product.stock} {product.unit || 'items'}
                              </p>
                            )}
                          </>
                        }
                      />
                    </Card>
                  </List.Item>
                );
              }}
            />
          )}
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin size="large" />
        <Text style={{ color: '#666' }}>Loading your profile...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ color: '#ff4d4f' }}>Something went wrong</Title>
          <Text style={{ fontSize: '16px', display: 'block', marginBottom: '16px' }}>{error}</Text>
          <Button type="primary" onClick={fetchUserData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <Typography.Title level={2} style={{ margin: 0, marginBottom: '8px' }}>My Account</Typography.Title>
        <Breadcrumb
          items={[
            {
              title: (
                <Link to="/">
                  <HomeOutlined /> Home
                </Link>
              )
            },
            {
              title: (
                <span>
                  <UserOutlined /> My Account
                </span>
              )
            }
          ]}
          style={{ marginBottom: '16px', fontSize: '14px' }}
        />
      </div>
      
      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange}
        type="card"
        size="large"
        className="profile-tabs"
        tabBarStyle={{
          marginBottom: '24px',
          fontWeight: '500'
        }}
        items={[
          {
            key: '1',
            label: (
              <span style={{ padding: '0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserOutlined />
                Dashboard
              </span>
            ),
            children: renderDashboardTab()
          },
          {
            key: '2',
            label: (
              <span style={{ padding: '0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SettingOutlined />
                Profile Settings
              </span>
            ),
            children: renderProfileSettingsTab()
          },
          {
            key: '3',
            label: (
              <span style={{ padding: '0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingOutlined />
                Order History
              </span>
            ),
            children: <OrderHistory />
          },
          {
            key: '4',
            label: (
              <span style={{ padding: '0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StarOutlined />
                Reviews & Ratings
              </span>
            ),
            children: <ReviewsAndRatings />
          },
          {
            key: '5',
            label: (
              <span style={{ padding: '0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SafetyOutlined />
                Security
              </span>
            ),
            children: renderSecurityTab()
          },
          {
            key: '6',
            label: (
              <span style={{ padding: '0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HeartOutlined />
                Wishlist
              </span>
            ),
            children: renderWishlistTab()
          }
        ]}
      />

      {/* Add custom CSS for styling */}
      <style jsx="true">{`
        .profile-tabs .ant-tabs-nav {
          margin-bottom: 24px;
        }
        
        .profile-tabs .ant-tabs-ink-bar {
          height: 3px;
          background-color: #4a90e2;
          border-radius: 3px;
          transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        }
        
        .profile-tabs .ant-tabs-tab {
          transition: all 0.3s ease;
          padding: 12px 16px;
        }
        
        .profile-tabs .ant-tabs-tab.ant-tabs-tab-active {
          color: #4a90e2;
          font-weight: 600;
        }
        
        .profile-tabs .ant-tabs-content {
          transition: all 0.3s ease;
        }
        
        .welcome-card {
          background: linear-gradient(135deg, #f0f7ff 0%, #e1ecf7 100%);
        }
        
        .h-full {
          height: 100%;
        }
        
        .mt-2 {
          margin-top: 8px;
        }
        
        .text-center {
          text-align: center;
        }
        
        .text-left {
          text-align: left;
        }

        .ant-btn-text:hover {
          background-color: rgba(0, 0, 0, 0.04);
        }

        .ant-card-hoverable:hover {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }

        .ant-timeline-item-tail {
          border-left: 2px solid #f0f0f0;
        }

        .ant-statistic-title {
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
};

export default ProfileDashboard;