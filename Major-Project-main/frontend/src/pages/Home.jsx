import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  LogOut,
  Leaf,
  Store,
  Clock,
  Heart,
  Search,
  Filter,
  Star,
  Utensils,
  ShoppingBag,
  AlertTriangle,
  ArrowRight,
  Users,
  ArrowUp,
  Plus,
  User,
  ChevronDown,
  Building2
} from 'lucide-react';
import { Button, Card, Row, Col, Badge } from 'antd';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Notification from '../components/Notification';
import { Link } from 'react-router-dom';
import { getUrgentSales, getVerifiedHotels, getFeedback } from '../services/api';
import axios from 'axios';

const Home = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [urgentSales, setUrgentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifiedRestaurants, setVerifiedRestaurants] = useState([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const menuRef = useRef(null);
  const [openMobileMenus, setOpenMobileMenus] = useState({});
  const [showWelcome, setShowWelcome] = useState(false);
  const welcomeTimerRef = useRef(null);

  // Fetch urgent sales
  useEffect(() => {
    const fetchUrgentSales = async () => {
      try {
        setLoading(true);
        console.log('Attempting to fetch urgent sales...');
        
        // Define mock data for fallback
        const mockData = [
          {
            _id: 'mock1',
            name: 'Fresh Tomatoes',
            description: 'Freshly harvested tomatoes at a discounted price',
            originalPrice: 4.99,
            discountedPrice: 2.99,
            expiryDate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
            image: 'https://images.unsplash.com/photo-1546104135-3b6270764760?w=500&h=500&q=80'
          },
          {
            _id: 'mock2',
            name: 'Veg Thali',
            description: 'Complete vegetarian meal with rice, dal and vegetables',
            originalPrice: 12.99,
            discountedPrice: 8.99,
            expiryDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
            image: 'https://images.unsplash.com/photo-1574499532899-58dc4ec8126d?w=500&h=500&q=80'
          }
        ];
        
        // Try to get real data with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5001); // 5 sec timeout
        
        try {
          const response = await getUrgentSales();
          clearTimeout(timeoutId);
          
          if (response && Array.isArray(response.data || response)) {
            const data = response.data || response;
            console.log('Successfully fetched urgent sales:', data.length);
            
            // Check if the API returned empty data and use mock data instead
            if (data.length === 0) {
              console.log('API returned empty array, trying direct API call...');
              
              // Try a direct API call as fallback
              try {
                const directResponse = await axios.get('http://https://fresh-connect-backend.onrender.com/api/urgent-sales');
                console.log('Direct API call response:', directResponse);
                
                if (directResponse.data && 
                    (Array.isArray(directResponse.data) || 
                     (directResponse.data.data && Array.isArray(directResponse.data.data)))) {
                  
                  const directData = Array.isArray(directResponse.data) ? 
                    directResponse.data : directResponse.data.data;
                  
                  console.log('Direct API call successful, got', directData.length, 'items');
                  
                  if (directData.length > 0) {
                    // Transform data to include time left
                    const transformedDirectData = directData.map(sale => {
                      const expiryDate = new Date(sale.expiryDate);
                      const now = new Date();
                      const diffTime = expiryDate - now;
                      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
                      
                      return {
                        ...sale,
                        timeLeft: diffHours <= 0 ? 'Expired' : `${diffHours} hour${diffHours > 1 ? 's' : ''}`
                      };
                    });
                    
                    // Sort and filter
                    const sortedDirectSales = transformedDirectData
                      .filter(sale => sale.timeLeft !== 'Expired')
                      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
                      .slice(0, 3);
                    
                    if (sortedDirectSales.length > 0) {
                      setUrgentSales(sortedDirectSales);
                      return;
                    }
                  }
                }
                
                // If we reach here, direct call didn't yield useful results
                console.log('Direct API call did not return useful data, using mock data');
                setUrgentSales(mockData);
              } catch (directError) {
                console.error('Direct API call failed:', directError);
                setUrgentSales(mockData);
              }
              return;
            }
            
            // Transform data to include time left
            const transformedData = data.map(sale => {
              const expiryDate = new Date(sale.expiryDate);
              const now = new Date();
              const diffTime = expiryDate - now;
              const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
              
              return {
                ...sale,
                timeLeft: diffHours <= 0 ? 'Expired' : `${diffHours} hour${diffHours > 1 ? 's' : ''}`
              };
            });
            
            // Sort by expiry time and take top 3
            const sortedSales = transformedData
              .filter(sale => sale.timeLeft !== 'Expired')
              .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
              .slice(0, 3);
              
            setUrgentSales(sortedSales.length > 0 ? sortedSales : mockData);
          } else {
            console.log('No valid urgent sales data found, using mock data');
            setUrgentSales(mockData);
          }
        } catch (apiError) {
          console.log('API error, using mock data instead:', apiError.message);
          setUrgentSales(mockData);
        }
      } catch (error) {
        console.error('Error in fetchUrgentSales:', error);
        // Fallback to mock data on any error
        setUrgentSales(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchUrgentSales();
  }, []);

  // Fetch verified restaurants
  useEffect(() => {
    const fetchVerifiedRestaurants = async () => {
      try {
        setRestaurantsLoading(true);
        console.log('Attempting to fetch verified restaurants...');
        
        // Mock data for fallback
        const mockRestaurants = [
          {
            _id: 'mock-rest1',
            name: 'Green Farm Restaurant',
            description: 'Specializing in farm-to-table cuisine and organic ingredients',
            rating: 4.8,
            reviews: 230,
            image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&h=300&q=80'
          },
          {
            _id: 'mock-rest2',
            name: 'Spice Garden',
            description: 'Authentic Indian cuisine with fresh ingredients',
            rating: 4.6,
            reviews: 185,
            image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=300&q=80'
          },
          {
            _id: 'mock-rest3',
            name: 'Ocean Breeze',
            description: 'Fresh seafood restaurant with daily specials',
            rating: 4.9,
            reviews: 310,
            image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&h=300&q=80'
          }
        ];
        
        // Try to get real data with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5001); // 5 sec timeout
        
        try {
          const response = await getVerifiedHotels();
          clearTimeout(timeoutId);
          
          if (response && Array.isArray(response.data || response)) {
            const data = response.data || response;
            console.log('Successfully fetched verified restaurants:', data.length);
            
            // Check if the API returned empty data and use mock data instead
            if (data.length === 0) {
              console.log('API returned empty array for restaurants, using mock data instead');
              setVerifiedRestaurants(mockRestaurants);
              return;
            }
            
            // Transform and take top 3 restaurants
            const transformedRestaurants = data
              .slice(0, 3)
              .map(restaurant => ({
                id: restaurant._id,
                name: restaurant.name,
                description: restaurant.description || 'Specializing in authentic cuisine',
                rating: restaurant.rating || 4.8,
                reviews: restaurant.reviews || 200,
                image: restaurant.coverImage || 'https://via.placeholder.com/500x300?text=No+Image'
              }));
            
            setVerifiedRestaurants(transformedRestaurants.length > 0 ? transformedRestaurants : mockRestaurants);
          } else {
            console.log('No valid restaurant data found, using mock data');
            setVerifiedRestaurants(mockRestaurants);
          }
        } catch (apiError) {
          console.log('API error, using mock data instead:', apiError.message);
          setVerifiedRestaurants(mockRestaurants);
        }
      } catch (error) {
        console.error('Error in fetchVerifiedRestaurants:', error);
        // Fallback to mock data on any error
        setVerifiedRestaurants([
          {
            id: 'mock-rest1',
            name: 'Green Farm Restaurant',
            description: 'Specializing in farm-to-table cuisine and organic ingredients',
            rating: 4.8,
            reviews: 230,
            image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&h=300&q=80'
          },
          {
            id: 'mock-rest2',
            name: 'Spice Garden',
            description: 'Authentic Indian cuisine with fresh ingredients',
            rating: 4.6,
            reviews: 185,
            image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=300&q=80'
          },
          {
            id: 'mock-rest3',
            name: 'Ocean Breeze',
            description: 'Fresh seafood restaurant with daily specials',
            rating: 4.9,
            reviews: 310,
            image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&h=300&q=80'
          }
        ]);
      } finally {
        setRestaurantsLoading(false);
      }
    };

    fetchVerifiedRestaurants();
  }, []);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        
        // Mock data for fallback
        const mockReviews = [
          {
            type: 'Customer',
            name: 'Sarah Johnson',
            content: 'The vegetables were incredibly fresh and the delivery was prompt. Will definitely order again!',
            rating: 5
          },
          {
            type: 'Restaurant',
            name: 'Green Farm Cafe',
            content: 'This platform has helped us reduce waste and connect with customers who appreciate our sustainable practices.',
            rating: 5
          },
          {
            type: 'Customer',
            name: 'Michael Chen',
            content: 'The urgent sales feature saved me money while getting high-quality food that would have otherwise gone to waste.',
            rating: 4
          }
        ];
        
        // Try to get real data with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5001); // 5 sec timeout
        
        try {
          const response = await getFeedback();
          clearTimeout(timeoutId);
          
          if (response && Array.isArray(response) && response.length > 0) {
            // Transform and take top 3 reviews
            const transformedReviews = response
              .slice(0, 3)
              .map(review => {
                // Extract user info safely
                let userName = 'Anonymous';
                let userType = 'Customer';
                
                // Check if user object exists and has name property
                if (review.user && typeof review.user === 'object') {
                  userName = review.user.name || 
                            (review.user.email ? review.user.email.split('@')[0] : 'Anonymous');
                  userType = review.user.role || 'Customer';
                } else if (typeof review.user === 'string') {
                  // If user is just an ID string
                  userName = 'User';
                }
                
                return {
                  type: userType, 
                  name: userName,
                  content: review.comment || review.content || "Great experience!",
                  rating: review.rating || 5,
                  _id: review._id || `mock-${Math.random().toString(36).substr(2, 9)}`
                };
              });
            
            // Make sure we have at least 3 reviews
            if (transformedReviews.length < 3) {
              // Add missing reviews from mock data
              const neededMockCount = 3 - transformedReviews.length;
              const combinedReviews = [
                ...transformedReviews,
                ...mockReviews.slice(0, neededMockCount)
              ];
              setReviews(combinedReviews);
            } else {
              setReviews(transformedReviews);
            }
          } else {
            setReviews(mockReviews);
          }
        } catch (apiError) {
          setReviews(mockReviews);
        }
      } catch (error) {
        // Fallback to mock data on any error
        setReviews(mockReviews);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic'
    });

    let lastScroll = 0;
    let ticking = false;
    
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentScroll <= 0) {
            setScrolled(false);
          } else if (currentScroll > lastScroll && currentScroll > 20) {
            // Scrolling down
            setScrolled(true);
            // Close mobile menu when scrolling
            setIsMenuOpen(false);
            setOpenMobileMenus({});
          } else if (currentScroll < lastScroll && currentScroll <= 20) {
            // Scrolling up
            setScrolled(false);
          }
          
          // Add this for scroll-to-top visibility
          if (currentScroll > 500) {
            setShowScrollTop(true);
          } else {
            setShowScrollTop(false);
          }
          
          lastScroll = currentScroll;
          ticking = false;
        });
        
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setIsMenuOpen]);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Clear any existing timer
    if (welcomeTimerRef.current) {
      clearTimeout(welcomeTimerRef.current);
    }

    // Only show welcome message if coming from login page
    if (location.state?.from === 'login') {
      setShowWelcome(true);
      
      // Set new timer and store its reference
      welcomeTimerRef.current = setTimeout(() => {
        setShowWelcome(false);
      }, 3000);
    }

    // Cleanup function
    return () => {
      if (welcomeTimerRef.current) {
        clearTimeout(welcomeTimerRef.current);
      }
    };
  }, [location]);

  // Add debug check for urgent sales rendering
  useEffect(() => {
    // Initialize AOS animation library
    AOS.init({
      duration: 1000,
      once: true,
    });
    
    // Silently check rendering status without logging
    const debugTimer = setTimeout(() => {
      // Check for urgent sales section in the DOM
      const urgentSalesSection = document.querySelector('.urgent-sales-section');
      if (urgentSalesSection) {
        const noResultsMessage = urgentSalesSection.querySelector('.no-sales-message');
        const saleCards = urgentSalesSection.querySelectorAll('.sale-card');
      }
    }, 5001);
    
    return () => clearTimeout(debugTimer);
  }, [urgentSales, loading]);
  
  // Add check for verified restaurants rendering
  useEffect(() => {
    // Silently check rendering status without logging
    const debugTimer = setTimeout(() => {
      // Check for restaurants section in the DOM
      const restaurantsSection = document.querySelector('.verified-restaurants-section');
      if (restaurantsSection) {
        const noResultsMessage = restaurantsSection.querySelector('.no-restaurants-message');
        const restaurantCards = restaurantsSection.querySelectorAll('.restaurant-card');
      }
    }, 6000); // Slightly after urgent sales debug
    
    return () => clearTimeout(debugTimer);
  }, [verifiedRestaurants, restaurantsLoading]);

  // Add debug check for reviews rendering
  useEffect(() => {
    // Initialize a debug timer for reviews (different from urgent sales)
    const reviewDebugTimer = setTimeout(() => {
      // Check DOM for rendered elements
      const testimonialSection = document.querySelector('.testimonial-section');
      
      // Count rendered review cards (silently, without logging content)
      const reviewCards = document.querySelectorAll('.testimonial-section .motion-div');
    }, 4000); // 4 seconds after component mounts
    
    return () => clearTimeout(reviewDebugTimer);
  }, [reviews, reviewsLoading]);

  const navigation = [
    { name: "Market", href: "/products" },
    { name: "Restaurants", href: "/restaurants" },
    { name: "Urgent Sales", href: "/urgent-sales" },
    { name: "Free Food", href: "/free-food" },
  ];

  const mobileNavigation = {
    Market: [
      { name: "All Products", href: "/products" },
      { name: "Categories", href: "/products?view=categories" },
      { name: "New Arrivals", href: "/products?sort=newest" },
    ],
    Restaurants: [
      { name: "Verified Restaurants", href: "/restaurants" },
      { name: "Near Me", href: "/restaurants?filter=nearby" },
      { name: "Top Rated", href: "/restaurants?sort=rating" },
    ],
    "Urgent Sales": [
      { name: "All Deals", href: "/urgent-sales" },
      { name: "Expiring Soon", href: "/urgent-sales?filter=expiring" },
      { name: "Highest Discount", href: "/urgent-sales?filter=discount" },
      { name: "Nearby", href: "/urgent-sales?filter=nearby" },
    ],
    "Free Food": [
      { name: "Available Now", href: "/free-food" },
      { name: "Nearby Locations", href: "/free-food?filter=nearby" },
      { name: "Recently Added", href: "/free-food?filter=recent" },
    ],
  };

  const menuItems = [
    { name: "Market", href: "/products", icon: Store },
    { name: "Restaurants", href: "/restaurants", icon: Utensils },
    { name: "Urgent Sales", href: "/urgent-sales", icon: Clock },
    { name: "Free Food", href: "/free-food", icon: Heart },
  ];

  const urgentListings = [
    {
      type: 'vegetable',
      title: 'Fresh Tomatoes',
      seller: 'Farm Fresh Vegetables',
      originalPrice: '₹40/kg',
      discountedPrice: '₹25/kg',
      expiryTime: '12 hours',
      quantity: '20 kg'
    },
    {
      type: 'food',
      title: 'Veg Thali',
      seller: 'Hotel Sunshine',
      originalPrice: '₹150',
      discountedPrice: '₹90',
      expiryTime: '3 hours',
      quantity: '15 plates'
    }
  ];

  // Updated Hero Section Text
  const heroText = {
    title: "Connecting Restaurants with Consumers",
    subtitle: "Find restaurants, order urgent sales, or access free food listings to reduce waste and save money."
  };

  // Updated for restaurant-focused listings (no vegetable type)
  const listings = [
    {
      id: 1,
      title: "Hotel Sunshine Surplus",
      type: 'food',
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      seller: 'Hotel Sunshine',
      rating: 4.9,
      distance: '1.2 km',
      time: '15-20 min',
      discount: '30% off',
    },
    // Other listings...
  ];

  // Partner data (focus on restaurants only, not vegetable sellers)
  const partners = [
    {
      id: 1,
      name: "Grand Plaza Hotel",
      type: "Restaurant",
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80",
      description: "Luxury hotel with multiple dining options"
    },
    {
      id: 2,
      name: "Seaside Resort",
      type: "Restaurant",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      description: "Beach resort with fresh seafood specialties"
    },
    {
      id: 3,
      name: "Mountain Lodge",
      type: "Restaurant",
      image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80",
      description: "Cozy lodge with seasonal menu options"
    },
    {
      id: 4,
      name: "Urban Dining Co",
      type: "Restaurant",
      image: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
      description: "Modern dining with international cuisine"
    }
  ];

  const scrollToTop = () => {
    const duration = 500; // Reduced from 1000ms to 500ms
    const currentY = window.scrollY;
    const startTime = performance.now();

    function scroll(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeInOutCubic = t => t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

      window.scrollTo({
        top: currentY * (1 - easeInOutCubic(progress)),
        behavior: 'auto'
      });

      if (progress < 1) {
        requestAnimationFrame(scroll);
      }
    }

    requestAnimationFrame(scroll);
  };
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Notification 
        message="Welcome to FreshConnect! Start exploring fresh produce and connect with local farmers."
        type="success"
        isVisible={showWelcome}
        onClose={() => {
          if (welcomeTimerRef.current) {
            clearTimeout(welcomeTimerRef.current);
          }
          setShowWelcome(false);
        }}
      />

      <header className="fixed top-0 left-0 right-0 z-50">
        <div className={`relative transition-all duration-500 ${
          scrolled 
            ? 'mt-4' 
            : 'mt-0'
        }`}>
          <div className={`transition-all duration-500 mx-auto ${
            scrolled 
              ? 'max-w-6xl bg-white/80 backdrop-blur-lg shadow-lg rounded-3xl py-1' 
              : 'max-w-full bg-transparent px-4'
          }`}>
            <div className={`px-8 ${scrolled ? 'py-2.5' : 'py-3'}`}>
              <div className="flex items-center justify-between">
                <motion.a
                  href="/"
                  className="flex items-center gap-2 shrink-0"
                  whileHover={{ scale: 1.02 }}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/');
                  }}
                >
                  <Leaf className={`transition-all duration-300 ${
                    scrolled ? 'w-6 h-6' : 'w-8 h-8'
                  } ${scrolled ? 'text-green-600' : 'text-green-500'}`} />
                  <span className={`font-semibold tracking-tight transition-all duration-300 ${
                    scrolled ? 'text-lg' : 'text-2xl'
                  } ${scrolled ? 'text-gray-900' : 'text-gray-800'}`}>FreshConnect</span>
                </motion.a>

                <div className="flex-1 flex justify-center">
                  <nav className="hidden md:flex items-center justify-between mx-auto px-10">
                    <div className="flex items-center space-x-6 lg:space-x-8">
                      {menuItems.map((item) => (
                        <div key={item.name} className="relative group">
                          <motion.a
                            href={item.href}
                            className={`font-medium tracking-wide transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                              scrolled ? 'text-base' : 'text-lg'
                            } ${
                              scrolled 
                                ? 'text-gray-600 hover:text-green-600' 
                                : 'text-gray-700 hover:text-green-500'
                            }`}
                            whileHover={{ y: -2 }}
                            whileTap={{ y: 0 }}
                          >
                            <item.icon className={`transition-all duration-300 ${scrolled ? 'w-4.5 h-4.5' : 'w-5 h-5'}`} />
                            {item.name}
                          </motion.a>

                          <div className="absolute left-0 mt-6 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                            <div className={`p-2 rounded-xl shadow-lg ${
                              scrolled 
                                ? 'bg-white/80 backdrop-blur-lg' 
                                : 'bg-white'
                            }`}>
                              {item.name === 'Restaurants' && (
                                <>
                                <motion.a
                                    href="/restaurants?filter=verified"
                                  className={`block px-4 py-2 hover:text-green-600 hover:bg-green-50 rounded-lg ${
                                    scrolled ? 'text-base text-gray-700' : 'text-base text-gray-700'
                                  }`}
                                  whileHover={{ x: 4 }}
                                >
                                    Verified Partners
                                </motion.a>
                                <motion.a
                                    href="/restaurants?filter=specials"
                                  className={`block px-4 py-2 hover:text-green-600 hover:bg-green-50 rounded-lg ${
                                    scrolled ? 'text-base text-gray-700' : 'text-base text-gray-700'
                                  }`}
                                  whileHover={{ x: 4 }}
                                >
                                    Today's Specials
                                </motion.a>
                                  <motion.a
                                    href="/restaurants?filter=nearby"
                                    className={`block px-4 py-2 hover:text-green-600 hover:bg-green-50 rounded-lg ${
                                      scrolled ? 'text-base text-gray-700' : 'text-base text-gray-700'
                                    }`}
                                    whileHover={{ x: 4 }}
                                  >
                                    Nearby
                                  </motion.a>
                                </>
                              )}
                              {item.name === 'Urgent Sales' && (
                                <>
                                  <motion.a
                                    href="/urgent-sales"
                                    className={`block px-4 py-2 hover:text-green-600 hover:bg-green-50 rounded-lg ${
                                      scrolled ? 'text-base text-gray-700' : 'text-base text-gray-700'
                                    }`}
                                    whileHover={{ x: 4 }}
                                  >
                                    All Deals
                                  </motion.a>
                                  <motion.a
                                    href="/urgent-sales?filter=expiring"
                                    className={`block px-4 py-2 hover:text-green-600 hover:bg-green-50 rounded-lg ${
                                      scrolled ? 'text-base text-gray-700' : 'text-base text-gray-700'
                                    }`}
                                    whileHover={{ x: 4 }}
                                  >
                                    Expiring Soon
                                  </motion.a>
                                  <motion.a
                                    href="/urgent-sales?filter=discount"
                                    className={`block px-4 py-2 hover:text-green-600 hover:bg-green-50 rounded-lg ${
                                      scrolled ? 'text-base text-gray-700' : 'text-base text-gray-700'
                                    }`}
                                    whileHover={{ x: 4 }}
                                  >
                                    Highest Discount
                                  </motion.a>
                                  <motion.a
                                    href="/urgent-sales?filter=nearby"
                                    className={`block px-4 py-2 hover:text-green-600 hover:bg-green-50 rounded-lg ${
                                      scrolled ? 'text-base text-gray-700' : 'text-base text-gray-700'
                                    }`}
                                    whileHover={{ x: 4 }}
                                  >
                                    Nearby
                                  </motion.a>
                                </>
                              )}
                              {item.name === 'Free Food' && (
                                <>
                                  <motion.a
                                    href="/free-food"
                                    className={`block px-4 py-2 hover:text-green-600 hover:bg-green-50 rounded-lg ${
                                      scrolled ? 'text-base text-gray-700' : 'text-base text-gray-700'
                                    }`}
                                    whileHover={{ x: 4 }}
                                  >
                                    Available Now
                                  </motion.a>
                                  <motion.a
                                    href="/free-food?filter=nearby"
                                    className={`block px-4 py-2 hover:text-green-600 hover:bg-green-50 rounded-lg ${
                                      scrolled ? 'text-base text-gray-700' : 'text-base text-gray-700'
                                    }`}
                                    whileHover={{ x: 4 }}
                                  >
                                    Nearby Locations
                                  </motion.a>
                                  <motion.a
                                    href="/free-food?filter=recent"
                                    className={`block px-4 py-2 hover:text-green-600 hover:bg-green-50 rounded-lg ${
                                      scrolled ? 'text-base text-gray-700' : 'text-base text-gray-700'
                                    }`}
                                    whileHover={{ x: 4 }}
                                  >
                                    Recently Added
                                  </motion.a>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </nav>
                </div>

                <div className={`hidden md:flex items-center space-x-4 ${scrolled ? 'h-14' : 'h-16'}`}>
                  {user ? (
                    <div className="flex items-center space-x-4">
                      <Link to="/cart">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`rounded-full transition-all duration-300 ${
                            scrolled ? 'p-1.5' : 'p-2'
                          } ${
                            scrolled 
                              ? 'hover:bg-green-50' 
                              : 'hover:bg-white/10'
                          }`}
                        >
                          <ShoppingBag className={`transition-all duration-300 ${
                            scrolled ? 'w-5 h-5' : 'w-6 h-6'
                          } ${scrolled ? 'text-gray-600' : 'text-gray-700'}`} />
                        </motion.button>
                      </Link>
                      <Link to="/profile">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`rounded-full transition-all duration-300 ${
                            scrolled ? 'p-1.5' : 'p-2'
                          } ${
                            scrolled 
                              ? 'hover:bg-green-50' 
                              : 'hover:bg-white/10'
                          }`}
                        >
                          <User className={`transition-all duration-300 ${
                            scrolled ? 'w-5 h-5' : 'w-6 h-6'
                          } ${scrolled ? 'text-gray-600' : 'text-gray-700'}`} />
                        </motion.button>
                      </Link>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`font-medium rounded-full transition-all duration-300 ${
                          scrolled 
                            ? 'text-base px-5 py-1.5 bg-transparent text-green-600 hover:bg-green-50' 
                            : 'text-base px-6 py-2.5 bg-transparent text-gray-700 hover:bg-white/10'
                        }`}
                        onClick={logout}
                      >
                        Logout
                      </motion.button>
                    </div>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`font-medium rounded-full transition-all duration-300 ${
                          scrolled 
                            ? 'text-base px-5 py-1.5 bg-transparent text-green-600 hover:bg-green-50' 
                            : 'text-base px-6 py-2.5 bg-transparent text-gray-700 hover:bg-white/10'
                        }`}
                        onClick={() => navigate('/login')}
                      >
                        Login
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`font-medium transition-all duration-300 ${
                          scrolled 
                            ? 'text-base px-5 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-full' 
                            : 'text-base px-6 py-2.5 bg-white text-gray-800 hover:bg-gray-100 rounded-full'
                        }`}
                        onClick={() => navigate('/register')}
                      >
                        Register
                      </motion.button>
                    </>
                  )}
                </div>

                <div className="md:hidden flex items-center ml-4">
                  {user && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`rounded-full transition-all duration-300 mr-2 ${
                        scrolled ? 'p-1.5' : 'p-2'
                      } ${
                        scrolled 
                          ? 'hover:bg-green-50' 
                          : 'hover:bg-white/10'
                      }`}
                      onClick={() => navigate('/')}
                    >
                      <User className={`transition-all duration-300 ${
                        scrolled ? 'w-4.5 h-4.5' : 'w-6 h-6'
                      } ${scrolled ? 'text-gray-600' : 'text-gray-700'}`} />
                    </motion.button>
                  )}

                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      scrolled 
                        ? 'text-gray-700 hover:bg-gray-100' 
                        : 'text-gray-700 hover:bg-white/10'
                    }`}
                  >
                    {isMenuOpen ? (
                      <X className={`${scrolled ? 'w-6 h-6' : 'w-7 h-7'}`} />
                    ) : (
                      <Menu className={`${scrolled ? 'w-6 h-6' : 'w-7 h-7'}`} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed left-0 right-0 z-40 ${
              scrolled 
                ? 'top-[72px]'
                : 'top-[80px]'
            }`}
          >
            <div className={`mx-auto transition-all duration-500 ${
              scrolled 
                ? 'max-w-7xl bg-white/80 backdrop-blur-lg shadow-lg rounded-b-3xl mx-6' 
                : 'bg-white shadow-xl rounded-b-3xl'
            }`}>
              <div className="p-4">
                <nav className="grid gap-2">
                {menuItems.map((item) => (
                  <div key={item.name}>
                      <div 
                        className="flex items-center justify-between p-3 rounded-full hover:bg-gray-100/80 cursor-pointer transition-all duration-300"
                        onClick={() => {
                          const isCurrentlyOpen = openMobileMenus[item.name];
                          setOpenMobileMenus(isCurrentlyOpen ? {} : { [item.name]: true });
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <item.icon className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-lg">{item.name}</span>
                        </div>
                        <motion.div
                          animate={{ rotate: openMobileMenus[item.name] ? 45 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-5 h-5 flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            const isCurrentlyOpen = openMobileMenus[item.name];
                            setOpenMobileMenus(isCurrentlyOpen ? {} : { [item.name]: true });
                          }}
                        >
                          <Plus className="w-4 h-4 text-gray-400" />
                        </motion.div>
                    </div>
                      
                    <motion.div
                      animate={{
                        height: openMobileMenus[item.name] ? 'auto' : 0,
                        opacity: openMobileMenus[item.name] ? 1 : 0
                      }}
                        transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                        <div className="pl-11 grid gap-1 mt-1">
                          {item.name === 'Restaurants' && (
                            <>
                          <a
                                href="/restaurants?filter=verified"
                              className="py-2 px-4 text-sm text-gray-600 hover:text-green-600 rounded-full hover:bg-gray-50/80 transition-all duration-300"
                              onClick={(e) => {
                                e.preventDefault();
                                  navigate('/restaurants?filter=verified');
                              setIsMenuOpen(false);
                              setOpenMobileMenus({});
                            }}
                          >
                                Verified Partners
                              </a>
                              <a
                                href="/restaurants?filter=specials"
                                className="py-2 px-4 text-sm text-gray-600 hover:text-green-600 rounded-full hover:bg-gray-50/80 transition-all duration-300"
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate('/restaurants?filter=specials');
                                  setIsMenuOpen(false);
                                  setOpenMobileMenus({});
                                }}
                              >
                                Today's Specials
                              </a>
                              <a
                                href="/restaurants?filter=nearby"
                                className="py-2 px-4 text-sm text-gray-600 hover:text-green-600 rounded-full hover:bg-gray-50/80 transition-all duration-300"
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate('/restaurants?filter=nearby');
                                  setIsMenuOpen(false);
                                  setOpenMobileMenus({});
                                }}
                              >
                                Nearby
                              </a>
                            </>
                          )}
                          {item.name === 'Urgent Sales' && (
                            <>
                              <a
                                href="/urgent-sales"
                                className="py-2 px-4 text-sm text-gray-600 hover:text-green-600 rounded-full hover:bg-gray-50/80 transition-all duration-300"
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate('/urgent-sales');
                                  setIsMenuOpen(false);
                                  setOpenMobileMenus({});
                                }}
                              >
                                All Deals
                              </a>
                              <a
                                href="/urgent-sales?filter=expiring"
                                className="py-2 px-4 text-sm text-gray-600 hover:text-green-600 rounded-full hover:bg-gray-50/80 transition-all duration-300"
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate('/urgent-sales?filter=expiring');
                                  setIsMenuOpen(false);
                                  setOpenMobileMenus({});
                                }}
                              >
                                Expiring Soon
                              </a>
                              <a
                                href="/urgent-sales?filter=discount"
                                className="py-2 px-4 text-sm text-gray-600 hover:text-green-600 rounded-full hover:bg-gray-50/80 transition-all duration-300"
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate('/urgent-sales?filter=discount');
                                  setIsMenuOpen(false);
                                  setOpenMobileMenus({});
                                }}
                              >
                                Highest Discount
                              </a>
                              <a
                                href="/urgent-sales?filter=nearby"
                                className="py-2 px-4 text-sm text-gray-600 hover:text-green-600 rounded-full hover:bg-gray-50/80 transition-all duration-300"
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate('/urgent-sales?filter=nearby');
                                  setIsMenuOpen(false);
                                  setOpenMobileMenus({});
                                }}
                              >
                                Nearby
                              </a>
                            </>
                          )}
                          {item.name === 'Free Food' && (
                            <>
                              <a
                                href="/free-food"
                                className="py-2 px-4 text-sm text-gray-600 hover:text-green-600 rounded-full hover:bg-gray-50/80 transition-all duration-300"
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate('/free-food');
                                  setIsMenuOpen(false);
                                  setOpenMobileMenus({});
                                }}
                              >
                                Available Now
                              </a>
                              <a
                                href="/free-food?filter=nearby"
                                className="py-2 px-4 text-sm text-gray-600 hover:text-green-600 rounded-full hover:bg-gray-50/80 transition-all duration-300"
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate('/free-food?filter=nearby');
                                  setIsMenuOpen(false);
                                  setOpenMobileMenus({});
                                }}
                              >
                                Nearby Locations
                              </a>
                              <a
                                href="/free-food?filter=recent"
                                className="py-2 px-4 text-sm text-gray-600 hover:text-green-600 rounded-full hover:bg-gray-50/80 transition-all duration-300"
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate('/free-food?filter=recent');
                                  setIsMenuOpen(false);
                                  setOpenMobileMenus({});
                                }}
                              >
                                Recently Added
                              </a>
                            </>
                          )}
                      </div>
                    </motion.div>
                  </div>
                ))}

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    {user ? (
                      <>
                        <a
                          href="/"
                          className="block py-3 px-4 text-center font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate('/');
                            setIsMenuOpen(false);
                          }}
                        >
                          My Dashboard
                        </a>
                        <a
                          href="#"
                          className="block py-3 px-4 text-center font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors mt-2"
                          onClick={(e) => {
                            e.preventDefault();
                            logout();
                            setIsMenuOpen(false);
                          }}
                        >
                          Logout
                        </a>
                      </>
                    ) : (
                      <>
                        <a
                          href="/login"
                          className="block py-3 px-4 text-center font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate('/login');
                            setIsMenuOpen(false);
                          }}
                        >
                          Login
                        </a>
                        <a
                          href="/register"
                          className="block py-3 px-4 text-center font-medium bg-green-600 text-white hover:bg-green-700 rounded-xl transition-colors mt-2"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate('/register');
                            setIsMenuOpen(false);
                          }}
                        >
                          Register
                        </a>
                      </>
                    )}
                  </div>

                  {/* Login/Register Buttons in Mobile Menu */}
                  <div className="mt-6 px-4 flex flex-col space-y-3">
                    <button
                      className="w-full py-2.5 rounded-full bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
                      onClick={() => navigate('/register')}
                    >
                      Register
                    </button>
                    <button
                      className="w-full py-2.5 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      onClick={() => navigate('/login')}
                    >
                      Login
                    </button>
                  </div>
                </nav>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow pt-24">
        <section className="px-4 py-16 mb-8 min-h-[90vh] flex items-center">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <span className="text-green-600 font-semibold">Welcome to FreshConnect</span>
                  <h1 
                    className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl mb-6"
                  >
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="block"
                    >
                      Connecting Restaurants
                    </motion.span>
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="block text-green-600"
                    >
                      with Consumers
                    </motion.span>
                  </h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg max-w-xl"
                  >
                    Find restaurants, order urgent sales, or access free food listings to reduce waste and save money.
                  </motion.p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-3xl font-bold mb-6 text-gray-800">
                      Join Our Platform
                    </h2>
                    <p className="text-gray-600 mb-8">
                      Whether you're a restaurant looking to reduce food waste or a consumer seeking quality food, our platform connects you with what you need.
                    </p>
                    <div className="flex gap-4 flex-wrap">
                      <Link
                        to="/register"
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-medium inline-flex items-center"
                      >
                        Register Now <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                      <Link
                        to="/hotel/register"
                        className="border border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 rounded-full font-medium inline-flex items-center"
                      >
                        Join as Restaurant <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="p-6 bg-white h-full rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300 translate-x-[225%] translate-y-[-45%]">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Why Join FreshConnect?
                    </h3>
                    <div className="grid gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-full text-green-600">
                          <Users size={18} />
                        </div>
                        <div>
                          <div className="text-gray-600 text-sm">Verified Restaurants</div>
                          <div className="text-gray-800 font-medium">
                            150+ verified restaurants
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-full text-green-600">
                          <Clock size={18} />
                        </div>
                        <div>
                          <div className="text-gray-600 text-sm">Fast Delivery</div>
                          <div className="text-gray-800 font-medium">
                            45 min average delivery time
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-full text-green-600">
                          <Heart size={18} />
                        </div>
                        <div>
                          <div className="text-gray-600 text-sm">Community Support</div>
                          <div className="text-gray-800 font-medium">
                            Reducing waste, saving money
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mt-8 md:mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {listings.map((listing, index) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 relative"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={listing.image} 
                          alt={listing.title}
                          className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500" 
                        />
                        <div className="absolute top-0 right-0 m-2">
                          <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                            {listing.discount}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                          {listing.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 flex items-center">
                          <Building2 size={14} className="mr-1" /> {listing.seller}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <Star size={14} className="text-yellow-500 mr-1" />
                            <span>{listing.rating}</span>
                            <span className="mx-2">•</span>
                            <span>{listing.distance}</span>
                          </div>
                          <span className="text-gray-500">{listing.time}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Verified Quality</div>
                    <div className="text-xs text-gray-600">100% Chemical Free</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Urgent Sales Section */}
        <section className="px-4 py-16 urgent-sales-section" data-aos="fade-up">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Urgent Sales
                </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Limited time offers on fresh produce and food items
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {loading ? (
                // Loading skeleton
                [...Array(3)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-6">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                      <div className="flex justify-between">
                        <div className="h-6 bg-gray-200 rounded w-1/3" />
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))
              ) : urgentSales && urgentSales.length > 0 ? (
                urgentSales.map((sale, index) => (
                <motion.div
                    key={sale._id || `sale-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden group sale-card"
                  >
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                      <div className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white rounded-full text-sm flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Expires in {sale.timeLeft}
                      </div>
                      <img 
                        src={sale.image || "https://via.placeholder.com/500x300?text=No+Image"}
                        alt={sale.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/500x300?text=No+Image";
                        }}
                      />
                    </div>
                    <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {sale.name}
                    </h3>
                      <p className="text-gray-600 mb-4">{sale.seller?.name || 'Unknown Seller'}</p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-green-600">₹{sale.discountedPrice}</span>
                          <span className="text-sm text-gray-500 line-through">₹{sale.originalPrice}</span>
                      </div>
                        <span className="text-sm text-gray-500">{sale.stock} {sale.unit || 'item(s)'} left</span>
                    </div>
                  </div>
                </motion.div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 no-sales-message">
                  <p className="text-gray-600">No urgent sales available at the moment.</p>
                  {/* Debug info visible in dev env */}
                  {process.env.NODE_ENV !== 'production' && (
                    <div className="mt-4 p-4 border border-gray-200 rounded text-left text-xs bg-gray-50 text-gray-500">
                      <p>Debug info:</p>
                      <p>urgentSales array: {JSON.stringify(urgentSales)}</p>
                      <p>urgentSales length: {urgentSales ? urgentSales.length : 'undefined'}</p>
                      <p>Loading state: {loading ? 'true' : 'false'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 bg-gray-50" data-aos="fade-up">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose Us
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We connect farmers, restaurants, and consumers in a sustainable ecosystem
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Leaf className="text-green-600" size={32} />,
                  title: "Verified Fresh Produce",
                  description: "All vegetables are certified chemical-free and fresh"
                },
                {
                  icon: <Star className="text-yellow-500" size={32} />,
                  title: "Quality Restaurants",
                  description: "Partner with verified restaurants using fresh ingredients"
                },
                {
                  icon: <Heart className="text-red-500" size={32} />,
                  title: "Food for All",
                  description: "Support our initiative to reduce food waste and help others"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6"
                >
                  <div className="mb-4 inline-block">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 bg-green-600 text-white" data-aos="fade-up">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: "1000+", label: "Verified Farmers" },
                { number: "200+", label: "Partner Restaurants" },
                { number: "5001+", label: "Happy Customers" },
                { number: "10000+", label: "Meals Shared" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <h3 className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</h3>
                  <p className="text-green-100">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Verified Restaurants Section */}
        <section className="px-4 py-20 verified-restaurants-section" data-aos="fade-up">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Verified Restaurants
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover restaurants that prioritize quality and use verified fresh ingredients
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {restaurantsLoading ? (
                // Loading skeleton
                [...Array(3)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-6">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                      <div className="flex justify-between">
                        <div className="h-6 bg-gray-200 rounded w-1/3" />
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))
              ) : verifiedRestaurants && verifiedRestaurants.length > 0 ? (
                verifiedRestaurants.map((restaurant, index) => (
                <motion.div
                    key={restaurant.id || `restaurant-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden group restaurant-card"
                >
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    <div className="absolute top-4 right-4 px-3 py-1 bg-green-600 text-white rounded-full text-sm flex items-center gap-1">
                      <Star size={14} />
                      Verified
                    </div>
                      {restaurant.image ? (
                        <img 
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null; // Prevent infinite loop
                            e.target.src = 'https://via.placeholder.com/500x300?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Building2 className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {restaurant.name}
                    </h3>
                      <p className="text-gray-600 mb-4">{restaurant.description}</p>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">⭐ {restaurant.rating} ({restaurant.reviews}+ reviews)</span>
                      <span className="text-sm text-green-600">100% Fresh Ingredients</span>
                    </div>
                  </div>
                </motion.div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 no-restaurants-message">
                  <p className="text-gray-600">No verified restaurants available at the moment.</p>
                  {/* Debug info visible in dev env */}
                  {process.env.NODE_ENV !== 'production' && (
                    <div className="mt-4 p-4 border border-gray-200 rounded text-left text-xs bg-gray-50 text-gray-500">
                      <p>Debug info:</p>
                      <p>verifiedRestaurants array: {JSON.stringify(verifiedRestaurants)}</p>
                      <p>verifiedRestaurants length: {verifiedRestaurants ? verifiedRestaurants.length : 'undefined'}</p>
                      <p>Loading state: {restaurantsLoading ? 'true' : 'false'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 bg-gray-50 testimonial-section" data-aos="fade-up">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What Our Users Say
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Hear from our community of farmers, restaurants, and customers
              </p>
            </div>

            <div className="flex flex-col items-center justify-center w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl">
                {reviewsLoading ? (
                  // Loading skeleton
                  [...Array(3)].map((_, index) => (
                    <div key={index} className="bg-white p-8 rounded-xl shadow-lg animate-pulse">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gray-200 rounded-full" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-5/6" />
                    </div>
                  ))
                ) : reviews && reviews.length > 0 ? (
                  (() => {
                    // Using Array.from to ensure we render exactly 3 items
                    return Array.from({ length: Math.min(3, reviews.length) }).map((_, index) => {
                      const review = reviews[index];
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white p-8 rounded-xl shadow-lg flex flex-col h-full w-full border border-gray-100 review-card motion-div"
                        >
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-semibold text-lg">
                                {(review.name || '?').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{review.name || 'Anonymous'}</h3>
                              <div className="flex items-center gap-1">
                                <p className="text-green-600 text-sm">{review.type || 'User'}</p>
                                <span className="text-gray-400">•</span>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={12}
                                      className={`${
                                        i < (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600 italic flex-grow">"{review.content || 'Great experience!'}"</p>
                        </motion.div>
                      );
                    });
                  })()
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <p className="text-gray-600">No reviews available at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Leaf className="w-8 h-8 text-green-500" />
                <span className="text-xl font-semibold">FreshConnect</span>
              </div>
              <p className="text-gray-400">
                Connecting farmers, restaurants, and consumers for a sustainable future.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {menuItems.map(item => (
                  <li key={item.name}>
                    <a href={item.href} className="text-gray-400 hover:text-white transition-colors hover:scale-105 flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-gray-400 mb-4">Stay updated with our latest news and offers.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800 px-4 py-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2024 FreshConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-4 bg-green-600 text-white rounded-full shadow-lg 
              hover:bg-green-700 transition-all duration-300 z-50 group"
            whileHover={{ 
              scale: 1.1,
              boxShadow: "0 0 20px rgba(34, 197, 94, 0.4)"
            }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp className="w-6 h-6 transition-transform duration-300 group-hover:-translate-y-1" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
