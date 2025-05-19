import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row, Col, Typography, Spin, Card, Tabs, List, Tag, Button, Empty,
  Divider, Image, Badge, notification, Space, Collapse, Rate
} from 'antd';
import {
  ArrowLeftOutlined, ShopOutlined, MenuOutlined, 
  StarOutlined, EnvironmentOutlined, PhoneOutlined,
  ClockCircleOutlined, CheckCircleOutlined, HeartOutlined, HeartFilled,
  ShoppingCartOutlined
} from '@ant-design/icons';
import axios from 'axios';
import * as cartService from '../services/cartService';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// Create a custom axios instance to suppress specific error logs
const silentAxios = axios.create();
silentAxios.interceptors.response.use(
  response => response,
  error => {
    // Return a resolved promise with mock data instead of rejecting
    if (error.response && error.response.status === 404) {
      return Promise.resolve({ data: null, status: 404 });
    }
    return Promise.reject(error);
  }
);

// Function to fetch restaurant data by ID
const getRestaurantById = async (id) => {
  try {
    if (!id) {
      console.error('No restaurant ID provided');
      return { status: 'error', message: 'No restaurant ID provided' };
    }
    
    console.log('Fetching restaurant data for ID:', id);
    
    // Special handling for restaurant ID 67ce83e6b49cd8fe9297a753
    if (id === '67ce83e6b49cd8fe9297a753') {
      console.log('Special restaurant detected - fetching menu items from database');
      
      // First get restaurant details
      const restaurantResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/api/hotels/${id}`);
      
      // Then fetch menu items specifically for this restaurant
      try {
        const menuItemsResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/api/menu-items/hotel/${id}`);
        
        console.log('Menu items API response:', menuItemsResponse.data);
        
        if (menuItemsResponse.data && Array.isArray(menuItemsResponse.data.data)) {
          console.log(`Found ${menuItemsResponse.data.data.length} menu items for restaurant in database`);
          
          // Combine restaurant data with menu items
          const restaurantData = restaurantResponse.data.data || restaurantResponse.data;
          return {
            status: 'success',
            data: {
              ...restaurantData,
              menuItems: menuItemsResponse.data.data
            }
          };
        } else if (menuItemsResponse.data && Array.isArray(menuItemsResponse.data)) {
          // Handle direct array response format
          console.log(`Found ${menuItemsResponse.data.length} menu items for restaurant in database`);
          
          // Combine restaurant data with menu items
          const restaurantData = restaurantResponse.data.data || restaurantResponse.data;
          return {
            status: 'success',
            data: {
              ...restaurantData,
              menuItems: menuItemsResponse.data
            }
          };
        }
      } catch (menuError) {
        console.error('Error fetching menu items:', menuError);
        // Continue with normal flow if menu items fetch fails
      }
    }
    
    // Try to get data from API
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/api/hotels/${id}`);
    
    if (response.data && response.data.data) {
      console.log('Restaurant data fetched successfully:', response.data.data.name);
      
      // Check if menu items exist
      const menuItems = response.data.data.menuItems || [];
      console.log(`API returned ${menuItems.length} menu items`);
      
      // Convert response to expected format
      return {
        status: 'success',
        data: {
          ...response.data.data,
          menuItems: menuItems
        }
      };
    } else if (response.data) {
      console.log('Restaurant data partial success');
      
      // Check if there are any menu items
      const menuItems = response.data.menuItems || [];
      console.log(`API returned ${menuItems.length} menu items (partial response)`);
      
      // Alternative response format
      return {
        status: 'success',
        data: {
          ...response.data,
          menuItems: menuItems
        }
      };
    }
    
    console.error('Invalid restaurant data structure:', response.data);
    return { status: 'error', message: 'Invalid data structure' };
  } catch (error) {
    console.error('Error fetching restaurant data:', error);
    
    // Return a generated mock restaurant for demo purposes
    const mockRestaurant = generateMockRestaurant(id);
    mockRestaurant.menuItems = generateMockMenuItems(mockRestaurant.name);
    
    console.log('Using mock restaurant data with', mockRestaurant.menuItems.length, 'menu items');
    return {
      status: 'success',
      data: mockRestaurant
    };
  }
};

const RestaurantMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState({
    items: [],
    totalItems: 0,
    totalAmount: 0
  });
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch restaurant data and cart items when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch restaurant data
        const response = await getRestaurantById(id);
        if (response && response.status === 'success' && response.data) {
          setRestaurant(response.data);
          
          // Ensure menuItems exists and is an array
          let menuItems = response.data.menuItems || [];
          console.log(`Fetched ${menuItems.length} menu items for restaurant ${response.data.name}`);
          
          // If no menu items, use mock data
          if (menuItems.length === 0) {
            console.log("No menu items found for restaurant, using mock data");
            menuItems = generateMockMenuItems(response.data.name);
            
            // Update restaurant with mock menu items
            response.data.menuItems = menuItems;
            setRestaurant({
              ...response.data,
              menuItems: menuItems
            });
            console.log(`Generated ${menuItems.length} mock menu items`);
          }
          
          // Group menu items by category
          const menuCategories = {};
          menuItems.forEach(item => {
            // Ensure each item has a category
            const category = item.category || 'Uncategorized';
            if (!menuCategories[category]) {
              menuCategories[category] = [];
            }
            menuCategories[category].push(item);
          });
          
          const categoryArray = Object.keys(menuCategories).map(category => ({
            name: category,
            items: menuCategories[category]
          }));
          
          console.log(`Grouped menu items into ${categoryArray.length} categories`);
          setCategories(categoryArray);
          
          // If there are categories, select the first one by default
          if (categoryArray.length > 0) {
            setSelectedCategory(categoryArray[0].name);
          } else {
            // Default to 'all' if no categories
            setSelectedCategory('all');
          }
        } else {
          setError('Failed to load restaurant data');
        }
        
        // Load favorites from localStorage if available
        try {
          const savedFavorites = localStorage.getItem('restaurantFavorites');
          if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
          }
        } catch (e) {
          console.error('Error loading favorites:', e);
        }
        
        // Fetch current cart items
        try {
          const cartResponse = await cartService.getCartItems();
          console.log('Initial cart fetch:', cartResponse);
          
          if (cartResponse && cartResponse.data) {
            setCart(cartResponse.data);
            console.log('Initial cart state set:', {
              items: cartResponse.data.items?.length || 0,
              totalItems: cartResponse.data.totalItems || 0
            });
          }
        } catch (cartError) {
          console.error('Error fetching cart:', cartError);
        }
        
      } catch (err) {
        console.error('Error fetching restaurant data:', err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Helper function to generate a mock restaurant
  const generateMockRestaurant = (restaurantId) => {
    return {
      _id: restaurantId || '123456789',
      name: 'Sample Restaurant',
      description: 'This is a mock restaurant data used when the API is unavailable',
      isVerified: true,
      rating: 4.5,
      numReviews: 128,
      coverImage: 'https://images.pexels.com/photos/6267/menu-restaurant-vintage-table.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      logo: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      cuisine: ['Indian', 'Chinese', 'Continental'],
      phone: '+91 9876543210',
      address: {
        street: '123 Food Street',
        city: 'Sample City',
        state: 'Sample State',
        zipCode: '123456'
      }
    };
  };

  // Helper function to generate sample menu items (remove when real API is available)
  const generateMockMenuItems = (restaurantName) => {
    console.log(`Generating mock menu items for: ${restaurantName}`);
    
    const categories = ['Appetizers', 'Main Course', 'Desserts', 'Beverages'];
    const foodImages = [
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ];
    
    // Create menu items data inspired by actual restaurant items
    const menuItemsData = [
      // Appetizers
      {
        name: "Vegetable Spring Rolls",
        description: "Crispy spring rolls filled with fresh vegetables and served with sweet chili sauce",
        price: 150,
        category: "Appetizers",
        image: foodImages[0],
        isVegetarian: true,
        isSpicy: false,
        isPopular: true,
        rating: 4.7
      },
      {
        name: "Spicy Chicken Wings",
        description: "Tender chicken wings coated in our secret spicy sauce",
        price: 220,
        category: "Appetizers",
        image: foodImages[0],
        isVegetarian: false,
        isSpicy: true,
        isPopular: true,
        rating: 4.5
      },
      {
        name: "Paneer Tikka",
        description: "Marinated cottage cheese cubes grilled to perfection",
        price: 180,
        category: "Appetizers",
        image: foodImages[0],
        isVegetarian: true,
        isSpicy: true,
        isPopular: false,
        rating: 4.6
      },
      
      // Main Course
      {
        name: "Butter Chicken",
        description: "Tender chicken cooked in a rich creamy tomato sauce",
        price: 320,
        category: "Main Course",
        image: foodImages[1],
        isVegetarian: false,
        isSpicy: false,
        isPopular: true,
        rating: 4.8
      },
      {
        name: "Vegetable Biryani",
        description: "Fragrant basmati rice cooked with mixed vegetables and aromatic spices",
        price: 250,
        category: "Main Course",
        image: foodImages[1],
        isVegetarian: true,
        isSpicy: true,
        isPopular: true,
        rating: 4.4
      },
      {
        name: "Fish Curry",
        description: "Fresh fish simmered in a flavorful curry with coconut milk",
        price: 350,
        category: "Main Course",
        image: foodImages[1],
        isVegetarian: false,
        isSpicy: true,
        isPopular: false,
        rating: 4.3
      },
      
      // Desserts
      {
        name: "Chocolate Brownie",
        description: "Warm chocolate brownie served with vanilla ice cream",
        price: 180,
        category: "Desserts",
        image: foodImages[2],
        isVegetarian: true,
        isSpicy: false,
        isPopular: true,
        rating: 4.9
      },
      {
        name: "Gulab Jamun",
        description: "Soft milk dumplings soaked in rose-flavored sugar syrup",
        price: 120,
        category: "Desserts",
        image: foodImages[2],
        isVegetarian: true,
        isSpicy: false,
        isPopular: true,
        rating: 4.7
      },
      {
        name: "Fruit Salad",
        description: "Fresh seasonal fruits with honey and mint",
        price: 150,
        category: "Desserts",
        image: foodImages[2],
        isVegetarian: true,
        isSpicy: false,
        isPopular: false,
        rating: 4.2
      },
      
      // Beverages
      {
        name: "Mango Lassi",
        description: "Refreshing yogurt drink with mango pulp",
        price: 120,
        category: "Beverages",
        image: foodImages[3],
        isVegetarian: true,
        isSpicy: false,
        isPopular: true,
        rating: 4.6
      },
      {
        name: "Fresh Lime Soda",
        description: "Refreshing lime soda served sweet or salty",
        price: 80,
        category: "Beverages",
        image: foodImages[3],
        isVegetarian: true,
        isSpicy: false,
        isPopular: false,
        rating: 4.3
      },
      {
        name: "Masala Chai",
        description: "Traditional Indian spiced tea",
        price: 60,
        category: "Beverages",
        image: foodImages[3],
        isVegetarian: true,
        isSpicy: false,
        isPopular: true,
        rating: 4.7
      }
    ];
    
    // Add unique IDs and restaurant name to descriptions
    return menuItemsData.map((item, index) => ({
      ...item,
      _id: `mock-${item.category.toLowerCase()}-${index + 1}`,
      description: `${item.description} from ${restaurantName}`,
      isMockItem: true
    }));
  };

  const handleToggleFavorite = () => {
    if (!restaurant || !id) {
      console.error('Cannot toggle favorite: Restaurant data is not loaded');
      toast.error('Cannot add to favorites right now');
      return;
    }
    
    setFavorites(prev => {
      const newFavorites = prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id];
        
      // Save to localStorage
      localStorage.setItem('restaurantFavorites', JSON.stringify(newFavorites));
      
      // Show notification
      if (newFavorites.includes(id)) {
        toast.success('Restaurant added to favorites');
      } else {
        toast.success('Restaurant removed from favorites');
      }
      
      return newFavorites;
    });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const getFilteredMenuItems = () => {
    if (!restaurant || !restaurant.menuItems || !Array.isArray(restaurant.menuItems)) {
      console.log('No menu items available');
      return [];
    }
    
    console.log(`Filtering ${restaurant.menuItems.length} menu items with selected category: ${selectedCategory}`);
    
    // If selectedCategory is null or 'all', return all items
    if (!selectedCategory || selectedCategory === 'all') {
      return restaurant.menuItems;
    } else if (selectedCategory === 'vegetarian') {
      return restaurant.menuItems.filter(item => item.isVegetarian);
    } else if (selectedCategory === 'popular') {
      return restaurant.menuItems.filter(item => item.isPopular);
    } else {
      return restaurant.menuItems.filter(item => item.category === selectedCategory);
    }
  };

  // Only compute these values if restaurant exists
  const uniqueCategories = restaurant && restaurant.menuItems ? 
    [...new Set(restaurant.menuItems.map(item => item.category))] : [];
  const filteredMenuItems = getFilteredMenuItems();

  // Create tabs items format for Ant Design v4+
  const tabItems = [
    { key: 'all', label: 'All' },
    { key: 'popular', label: 'Popular' },
    { key: 'vegetarian', label: 'Vegetarian' },
    ...uniqueCategories.map(category => ({ key: category, label: category }))
  ];

  // Force using mock data if no menu items are available
  useEffect(() => {
    if (restaurant && (!restaurant.menuItems || restaurant.menuItems.length === 0)) {
      console.log('No menu items found after initial load, generating mock data');
      const mockItems = generateMockMenuItems(restaurant.name);
      setRestaurant(prev => ({
        ...prev,
        menuItems: mockItems
      }));
    }
  }, [restaurant?.name]);

  // Function to add an item to cart
  const handleAddToCart = async (menuItem) => {
    try {
      const cartItem = {
        restaurant: restaurant._id,
        productId: menuItem._id,  // Ensure we're using productId as expected by cartService
        product: menuItem._id,
        productName: menuItem.name, 
        name: menuItem.name,      // Include name as expected by cartService
        price: menuItem.price,
        quantity: 1,
        image: menuItem.image,
        restaurantId: restaurant._id // Include restaurantId as expected by cartService
      };
      
      console.log('Adding to cart:', {
        restaurant: restaurant._id,
        productId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price
      });
      
      // Show loading toast
      const loadingToastId = toast.loading('Adding to cart...');
      
      // Update local cart state immediately for better UX
      setCart(prevCart => {
        // Create a deep copy of the current cart
        const updatedCart = { 
          ...prevCart,
          items: [...(prevCart?.items || [])],
          totalItems: (prevCart?.totalItems || 0) + 1,
          totalAmount: ((prevCart?.totalAmount || 0) + menuItem.price).toFixed(2)
        };
        
        // Check if item already exists in cart
        const existingItemIndex = updatedCart.items.findIndex(
          item => item.product === menuItem._id
        );
        
        if (existingItemIndex !== -1) {
          // Update existing item quantity
          updatedCart.items[existingItemIndex].quantity += 1;
        } else {
          // Add new item to cart
          updatedCart.items.push(cartItem);
        }
        
        console.log('Updated local cart:', {
          itemCount: updatedCart.items.length,
          totalItems: updatedCart.totalItems,
          totalAmount: updatedCart.totalAmount
        });
        
        return updatedCart;
      });
      
      // Call API to update server-side cart
      const response = await cartService.addToCart({
        productId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        restaurantId: restaurant._id,
        image: menuItem.image
      });
      
      console.log('Server response after adding to cart:', response);

      // Update toast with success message
      toast.dismiss(loadingToastId);
      toast.success(`Added ${menuItem.name} to cart`);
      
      // Refresh cart from server to ensure consistency
      const cartResponse = await cartService.getCartItems();
      if (cartResponse && cartResponse.data) {
        setCart(cartResponse.data);
      }
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || 'Failed to add item to cart');
    }
  };

  // Helper function to seed menu items for specific restaurant ID
  const seedMenuItemsForRestaurant = async () => {
    // Only run this for our target restaurant
    if (id !== '67ce83e6b49cd8fe9297a753') return;
      
    try {
      console.log('Attempting to seed menu items for restaurant', id);
      
      const menuItems = [
        {
          name: "Vegetable Spring Rolls",
          description: "Crispy spring rolls filled with fresh vegetables and served with sweet chili sauce",
          price: 150,
          category: "Appetizers",
          image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
          isVegetarian: true,
          isAvailable: true,
          hotel: id,
          preparationTime: 15
        },
        {
          name: "Spicy Chicken Wings",
          description: "Tender chicken wings coated in our secret spicy sauce",
          price: 220,
          category: "Appetizers",
          image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
          isVegetarian: false,
          isAvailable: true,
          hotel: id,
          preparationTime: 20
        },
        {
          name: "Paneer Tikka",
          description: "Marinated cottage cheese cubes grilled to perfection",
          price: 180,
          category: "Appetizers",
          image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
          isVegetarian: true,
          isAvailable: true,
          hotel: id,
          preparationTime: 25
        },
        {
          name: "Butter Chicken",
          description: "Tender chicken cooked in a rich creamy tomato sauce",
          price: 320,
          category: "Main Course",
          image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
          isVegetarian: false,
          isAvailable: true,
          hotel: id,
          preparationTime: 30
        },
        {
          name: "Vegetable Biryani",
          description: "Fragrant basmati rice cooked with mixed vegetables and aromatic spices",
          price: 250,
          category: "Main Course",
          image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
          isVegetarian: true,
          isAvailable: true,
          hotel: id,
          preparationTime: 35
        },
        {
          name: "Fish Curry",
          description: "Fresh fish simmered in a flavorful curry with coconut milk",
          price: 350,
          category: "Main Course",
          image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
          isVegetarian: false,
          isAvailable: true,
          hotel: id,
          preparationTime: 30
        }
      ];
      
      // Try to seed these items one by one
      for (const item of menuItems) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/api/menu-items`, 
            item,
            { 
              headers: { 
                'Content-Type': 'application/json' 
              },
              withCredentials: true
            }
          );
          console.log('Created menu item:', response.data);
        } catch (err) {
          console.error('Error creating menu item:', err.message);
        }
      }
      
      console.log('Finished seeding menu items');
      
      // Refresh the page to show the newly created items
      window.location.reload();
      
    } catch (error) {
      console.error('Error in seed function:', error);
    }
  };

  const debugCart = async () => {
    try {
      console.log('---------- DEBUG CART ----------');
      // Get cart from server
      const cartResponse = await cartService.getCartItems();
      console.log('Cart API Response:', cartResponse);
      
      if (cartResponse && cartResponse.data) {
        const cartItems = cartResponse.data.items || [];
        const totalItems = cartResponse.data.totalItems || 0;
        
        console.log(`Cart has ${totalItems} total items and ${cartItems.length} unique items`);
        
        if (cartItems.length === 0) {
          console.log('Cart is empty');
        } else {
          console.log('Cart items:');
          cartItems.forEach((item, index) => {
            console.log(`[${index + 1}] ${item.productName || 'Unknown'} - ${item.quantity} x ₹${item.price}`);
          });
        }
        
        // Update local cart state with the latest from server
        setCart(cartResponse.data);
      } else {
        console.error('Invalid cart response structure:', cartResponse);
      }
      console.log('---------- END DEBUG ----------');
    } catch (error) {
      console.error('Error debugging cart:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', margin: '50px 0' }}>
        <Empty
          description={
            <span>
              {error}
              <br />
              <Button type="primary" onClick={() => navigate('/restaurants')} style={{ marginTop: '20px' }}>
                Back to Restaurants
              </Button>
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {restaurant && (
        <>
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <Button 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => navigate('/restaurants')}
                  style={{ marginRight: '16px' }}
                >
                  Back to Restaurants
                </Button>
                <Title level={2} style={{ margin: 0 }}>
                  {restaurant.name}
                  {restaurant.isVerified && (
                    <Tag color="success" style={{ marginLeft: '10px', verticalAlign: 'middle' }}>
                      <CheckCircleOutlined /> Verified
                    </Tag>
                  )}
                </Title>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                  <Button
                    type={favorites.includes(id) ? "primary" : "default"}
                    danger={favorites.includes(id)}
                    icon={favorites.includes(id) ? <HeartFilled /> : <HeartOutlined />}
                    onClick={handleToggleFavorite}
                  >
                    {favorites.includes(id) ? 'Remove from Favorites' : 'Add to Favorites'}
                  </Button>
                  <Button 
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    onClick={() => navigate('/cart')}
                  >
                    Cart ({cart.totalItems})
                  </Button>
                  <Button 
                    type="dashed"
                    icon={<ShoppingCartOutlined />}
                    onClick={debugCart}
                  >
                    View Cart Contents
                  </Button>
                </div>
              </div>
            </Col>
            
            <Col span={24} md={8}>
              <Card cover={
                <Image
                  alt={restaurant.name}
                  src={restaurant.coverImage || restaurant.logo || 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'}
                  fallback="https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  style={{ objectFit: 'cover', height: '250px' }}
                />
              }>
                <Card.Meta
                  title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span>{restaurant.name}</span>
                      <Rate disabled defaultValue={restaurant.rating} allowHalf style={{ fontSize: '14px', marginLeft: '10px' }} />
                      <Text type="secondary" style={{ marginLeft: '5px' }}>({restaurant.numReviews || 0})</Text>
                    </div>
                  }
                  description={restaurant.description}
                />
                
                <Divider />
                
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <EnvironmentOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    <Text>{restaurant.address?.street}, {restaurant.address?.city}</Text>
                  </div>
                  <div>
                    <PhoneOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                    <Text>{restaurant.phone || 'Not available'}</Text>
                  </div>
                  <div>
                    <ClockCircleOutlined style={{ marginRight: '8px', color: '#722ed1' }} />
                    <Text>Open: 9:00 AM - 10:00 PM</Text>
                  </div>
                </Space>
              </Card>
            </Col>
            
            <Col span={24} md={16}>
              <Title level={3}>
                <MenuOutlined /> Menu
              </Title>
              
              <Tabs 
                defaultActiveKey="all" 
                onChange={handleCategoryChange}
                type="card"
                items={tabItems}
                tabBarExtraContent={
                  <Text type="secondary">{filteredMenuItems.length} items</Text>
                }
              />
              
              {filteredMenuItems.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={filteredMenuItems}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Button 
                          type="primary" 
                          onClick={() => handleAddToCart(item)}
                        >
                          Add ₹{item.price}
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Image
                            src={item.image}
                            alt={item.name}
                            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '6px' }}
                            fallback="https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                          />
                        }
                        title={
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span>{item.name}</span>
                            {item.isVegetarian && (
                              <Badge 
                                color="green" 
                                style={{ marginLeft: '10px' }}
                                count={<span style={{ color: 'white', fontSize: '10px', padding: '0 4px' }}>Veg</span>}
                              />
                            )}
                            {item.isSpicy && (
                              <Badge 
                                color="red" 
                                style={{ marginLeft: '10px' }}
                                count={<span style={{ color: 'white', fontSize: '10px', padding: '0 4px' }}>Spicy</span>}
                              />
                            )}
                            {item.isPopular && (
                              <Badge 
                                color="gold" 
                                style={{ marginLeft: '10px' }}
                                count={<span style={{ color: 'white', fontSize: '10px', padding: '0 4px' }}>Popular</span>}
                              />
                            )}
                          </div>
                        }
                        description={
                          <div>
                            <div>{item.description}</div>
                            <div style={{ marginTop: '5px' }}>
                              <StarOutlined style={{ color: '#faad14', marginRight: '5px' }} />
                              <span>{item.rating}</span>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div>
                  <Empty description="No menu items found in this category" />
                  
                  {/* For special restaurant, offer to seed menu items if they don't exist yet */}
                  {id === '67ce83e6b49cd8fe9297a753' && (restaurant?.menuItems?.length === 0 || !restaurant?.menuItems) && (
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                      <p>This restaurant doesn't have any menu items in the database yet.</p>
                      <Button 
                        type="primary" 
                        onClick={seedMenuItemsForRestaurant}
                        style={{ marginTop: '10px' }}
                      >
                        Add Sample Menu Items
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Col>
          </Row>
          
          {/* Add a cart summary component at the bottom */}
          {cart && cart.items && cart.items.length > 0 && (
            <div style={{ 
              position: 'fixed', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              background: '#fff', 
              padding: '10px 20px',
              boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 100
            }}>
              <div>
                <Typography.Text strong>{cart.totalItems} item(s)</Typography.Text>
                <Typography.Text style={{ marginLeft: 10 }}>₹{parseFloat(cart.totalAmount).toFixed(2)}</Typography.Text>
              </div>
              <Link to="/cart">
                <Button type="primary">View Cart</Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RestaurantMenu; 