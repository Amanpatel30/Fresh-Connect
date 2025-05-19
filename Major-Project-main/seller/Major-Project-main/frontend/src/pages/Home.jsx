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
  User
} from 'lucide-react';
import { Button, Card, Row, Col, Badge } from 'antd';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Notification from '../components/Notification';
import AuthDebugger from '../components/AuthDebugger';
import { shouldShowDebugger } from '../config/debugConfig';

const Home = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const menuRef = useRef(null);
  const [openMobileMenus, setOpenMobileMenus] = useState({});
  const [showWelcome, setShowWelcome] = useState(false);
  const welcomeTimerRef = useRef(null);

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

  const menuItems = [
    {
      title: "Market",
      href: "/user/products",
      icon: Store,
      subItems: [
        { name: "All Products", href: "/user/products" },
        { name: "Fresh Vegetables", href: "/user/products?category=vegetables" },
        { name: "Seasonal Fruits", href: "/user/products?category=fruits" },
        { name: "Organic Products", href: "/user/products?category=organic" }
      ]
    },
    {
      title: "Restaurants",
      href: "/user/restaurants",
      icon: Utensils,
      subItems: [
        { name: "All Restaurants", href: "/user/restaurants" },
        { name: "Verified Partners", href: "/user/restaurants?filter=verified" },
        { name: "Today's Specials", href: "/user/restaurants?filter=specials" },
        { name: "Nearby", href: "/user/restaurants?filter=nearby" }
      ]
    },
    {
      title: "Urgent Sales",
      href: "/user/urgent-sales",
      icon: Clock,
      subItems: [
        { name: "All Deals", href: "/user/urgent-sales" },
        { name: "Expiring Soon", href: "/user/urgent-sales?filter=expiring" },
        { name: "Highest Discount", href: "/user/urgent-sales?filter=discount" },
        { name: "Nearby", href: "/user/urgent-sales?filter=nearby" }
      ]
    },
    {
      title: "Free Food",
      href: "/user/free-food",
      icon: Heart,
      subItems: [
        { name: "Available Now", href: "/user/free-food" },
        { name: "Nearby Locations", href: "/user/free-food?filter=nearby" },
        { name: "Recently Added", href: "/user/free-food?filter=recent" }
      ]
    },
    {
      title: "Admin",
      href: "/admin",
      icon: User,
      subItems: []
    }
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

  const vegetables = [
    {
      name: 'Fresh Tomatoes',
      price: '₹40/kg',
      image: '/images/tomatoes.jpg'
    },
    {
      name: 'Organic Spinach',
      price: '₹30/kg',
      image: '/images/spinach.jpg'
    },
    {
      name: 'Yellow Bell Peppers',
      price: '₹80/kg',
      image: '/images/bell-peppers.jpg'
    },
    {
      name: 'Purple Cabbage',
      price: '₹50/kg',
      image: '/images/purple-cabbage.jpg'
    }
  ].map((item, index) => (
    <motion.div
      key={item.name}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.1 }}
      className="group cursor-pointer relative overflow-hidden rounded-2xl"
    >
      <div className="aspect-square relative">
        <img 
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-lg font-medium">{item.name}</h3>
          <p className="text-sm opacity-90">{item.price}</p>
        </div>
      </div>
    </motion.div>
  ));
  
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
    <div className="min-h-screen bg-white">
      {/* Auth Debugger - Only visible if enabled in config */}
      {shouldShowDebugger('auth') && (
        <div className="container mx-auto px-4 py-4">
          <AuthDebugger />
        </div>
      )}
      
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
              ? 'max-w-5xl bg-white/80 backdrop-blur-lg shadow-lg rounded-3xl py-1' 
              : 'max-w-7xl bg-transparent'
          }`}>
            <div className={`px-8 ${scrolled ? 'py-2.5' : 'py-3'}`}>
              <div className="flex items-center">
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
                        <div key={item.title} className="relative group">
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
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(item.href);
                            }}
                          >
                            <item.icon className={`${scrolled ? 'w-5 h-5' : 'w-6 h-6'}`} />
                            {item.title}
                          </motion.a>

                          <div className="absolute left-0 mt-6 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                            <div className={`p-2 rounded-xl shadow-lg ${
                              scrolled 
                                ? 'bg-white/80 backdrop-blur-lg' 
                                : 'bg-white'
                            }`}>
                              {item.subItems.map((subItem) => (
                                <motion.a
                                  key={subItem.name}
                                  href={subItem.href}
                                  className={`block px-4 py-2 hover:text-green-600 hover:bg-green-50 rounded-lg ${
                                    scrolled ? 'text-base text-gray-700' : 'text-base text-gray-700'
                                  }`}
                                  whileHover={{ x: 4 }}
                                >
                                  {subItem.name}
                                </motion.a>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </nav>
                </div>

                <div className={`hidden md:flex items-center ${scrolled ? 'h-14' : 'h-16'}`}>
                  {!user && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`font-medium rounded-full transition-all duration-300 ${
                          scrolled 
                            ? 'text-base px-4 py-1.5 bg-transparent text-green-600 hover:bg-green-50' 
                            : 'text-base px-5 py-2.5 bg-transparent text-gray-700 hover:bg-white/10'
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
                            ? 'text-base px-4 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-full' 
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
                      onClick={() => navigate('/user')}
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
                  <div key={item.title}>
                      <div 
                        className="flex items-center justify-between p-3 rounded-full hover:bg-gray-100/80 cursor-pointer transition-all duration-300"
                        onClick={() => {
                          const isCurrentlyOpen = openMobileMenus[item.title];
                          setOpenMobileMenus(isCurrentlyOpen ? {} : { [item.title]: true });
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-gray-700">{item.title}</span>
                        </div>
                        <motion.div
                          animate={{ rotate: openMobileMenus[item.title] ? 45 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-5 h-5 flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            const isCurrentlyOpen = openMobileMenus[item.title];
                            setOpenMobileMenus(isCurrentlyOpen ? {} : { [item.title]: true });
                          }}
                        >
                          <Plus className="w-4 h-4 text-gray-400" />
                        </motion.div>
                    </div>
                      
                    <motion.div
                      animate={{
                        height: openMobileMenus[item.title] ? 'auto' : 0,
                        opacity: openMobileMenus[item.title] ? 1 : 0
                      }}
                        transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                        <div className="pl-11 grid gap-1 mt-1">
                          {item.subItems.map((subItem) => (
                          <a
                            key={subItem.name}
                            href={subItem.href}
                              className="py-2 px-4 text-sm text-gray-600 hover:text-green-600 rounded-full hover:bg-gray-50/80 transition-all duration-300"
                              onClick={(e) => {
                                e.preventDefault();
                                navigate(subItem.href);
                              setIsMenuOpen(false);
                              setOpenMobileMenus({});
                            }}
                          >
                            {subItem.name}
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                ))}

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    {user ? (
                      <>
                        <a
                          href="/user"
                          className="block py-3 px-4 text-center font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate('/user');
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
              </nav>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow pt-24">
        <section className="px-4 mb-16 min-h-[90vh] flex items-center">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <span className="text-green-600">Welcome to FreshConnect</span>
                  <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                    Fresh Vegetables,{" "}
                    <span className="text-green-600">Verified Quality</span>
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Connect directly with local vegetable sellers and verified restaurants. 
                    Get fresh, chemical-free produce and support sustainable practices.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 flex items-center gap-2">
                    Explore Market <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="px-6 py-3 border-2 border-green-600 text-green-600 rounded-full hover:bg-green-50 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Join as Seller
                  </button>
                </div>

                <div className="flex items-center gap-12">
                  <div className="text-center">
                    <div className="text-2xl font-bold">1000+</div>
                    <div className="text-gray-600 text-sm">Verified Sellers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">5001+</div>
                    <div className="text-gray-600 text-sm">Fresh Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">10000+</div>
                    <div className="text-gray-600 text-sm">Happy Customers</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  {vegetables}
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

        <section className="px-4 mb-16" data-aos="fade-up">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="text-orange-500" />
                  Urgent Sales
                </h2>
                <p className="text-gray-600">Get great deals before they expire</p>
              </div>
              <a href="/urgent-sales" className="text-green-600 hover:text-green-700 hover:scale-105 transition-transform">
                View All →
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {urgentListings.map((listing, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        listing.type === 'vegetable' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        {listing.type === 'vegetable' ? 'Vegetable' : 'Food'}
                      </span>
                      <div className="flex items-center text-red-500 text-sm">
                        <AlertTriangle size={16} className="mr-1" />
                        Expires in {listing.expiryTime}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {listing.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{listing.seller}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-gray-500 line-through">
                          {listing.originalPrice}
                        </span>
                        <span className="text-lg font-bold text-green-600 ml-2">
                          {listing.discountedPrice}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {listing.quantity} left
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
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

        <section className="px-4 py-20" data-aos="fade-up">
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
              {[1, 2, 3].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden group"
                >
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    <div className="absolute top-4 right-4 px-3 py-1 bg-green-600 text-white rounded-full text-sm flex items-center gap-1">
                      <Star size={14} />
                      Verified
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Restaurant Name {index + 1}
                    </h3>
                    <p className="text-gray-600 mb-4">Specializing in authentic cuisine</p>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">⭐ 4.8 (200+ reviews)</span>
                      <span className="text-sm text-green-600">100% Fresh Ingredients</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 bg-gray-50" data-aos="fade-up">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Simple steps to get started with our platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { 
                  icon: <Store className="text-green-600" size={32} />,
                  title: "Choose Seller",
                  description: "Browse verified vegetable sellers or restaurants"
                },
                {
                  icon: <ShoppingBag className="text-green-600" size={32} />,
                  title: "Place Order",
                  description: "Select fresh produce or ready-to-eat meals"
                },
                {
                  icon: <Clock className="text-green-600" size={32} />,
                  title: "Track Order",
                  description: "Monitor your order in real-time"
                },
                {
                  icon: <Heart className="text-green-600" size={32} />,
                  title: "Enjoy & Share",
                  description: "Enjoy quality food or share with others"
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20" data-aos="fade-up">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What Our Users Say
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Hear from our community of farmers, restaurants, and customers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  type: "Restaurant Owner",
                  name: "John Doe",
                  content: "The verification badge has helped us gain customer trust. Our sales have increased significantly."
                },
                {
                  type: "Vegetable Seller",
                  name: "Jane Smith",
                  content: "This platform has helped me connect with restaurants directly. No more middlemen eating into profits."
                },
                {
                  type: "Customer",
                  name: "Mike Johnson",
                  content: "I love knowing that my food comes from verified sources. The urgent sales feature helps save money too!"
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-8 rounded-xl shadow-lg"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                      <p className="text-green-600 text-sm">{testimonial.type}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.content}"</p>
                </motion.div>
              ))}
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
                  <li key={item.title}>
                    <a href={item.href} className="text-gray-400 hover:text-white transition-colors hover:scale-105">
                      {item.title}
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
