import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Leaf, 
  ShoppingCart, 
  Heart, 
  User, 
  Bell, 
  Menu, 
  X,
  Store,
  Utensils,
  Clock,
  AlertTriangle,
  Home,
  Search
} from 'lucide-react';
import Notification from '../Notification';

const UserLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const menuRef = useRef(null);
  const [openMobileMenus, setOpenMobileMenus] = useState({});
  const [showWelcome, setShowWelcome] = useState(false);
  const welcomeTimerRef = useRef(null);

  // Check if this is the home page
  const isHomePage = location.pathname === '/user' || location.pathname === '/user/';
  
  // Check if welcome notification has been shown before
  const hasShownWelcome = useRef(localStorage.getItem('hasShownWelcome') === 'true');

  // Handle scroll event to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
        setShowScrollTop(true);
      } else {
        setScrolled(false);
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close menu when clicking outside
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
  }, [menuRef]);

  // Show welcome notification only on home page and only once per session
  useEffect(() => {
    if (isHomePage && !hasShownWelcome.current) {
      welcomeTimerRef.current = setTimeout(() => {
        setShowWelcome(true);
        
        // Auto hide after 5 seconds
        welcomeTimerRef.current = setTimeout(() => {
          setShowWelcome(false);
          // Mark as shown in localStorage
          localStorage.setItem('hasShownWelcome', 'true');
          hasShownWelcome.current = true;
        }, 5001);
      }, 1000);
    }
    
    return () => {
      if (welcomeTimerRef.current) {
        clearTimeout(welcomeTimerRef.current);
      }
    };
  }, [isHomePage]);

  // Easing function for smooth scrolling
  const easeInOutCubic = (t) => {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // Scroll to top function
  const scrollToTop = () => {
    const duration = 1000;
    const start = window.pageYOffset;
    const startTime = performance.now();

    const scroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      window.scrollTo({
        top: start * (1 - easeInOutCubic(progress)),
        behavior: 'auto'
      });

      if (progress < 1) {
        requestAnimationFrame(scroll);
      }
    };

    requestAnimationFrame(scroll);
  };

  // Menu items for navigation
  const menuItems = [
    {
      title: "Market",
      href: "/user/products",
      icon: Store,
      subItems: [
        { name: "Dashboard", href: "/user" },
        { name: "All Products", href: "/user/products" },
        { name: "Fresh Vegetables", href: "/user/products?category=vegetables" },
        { name: "Seasonal Fruits", href: "/user/products?category=fruits" },
        { name: "Organic Products", href: "/user/products?category=organic" },
        { name: "Featured Products", href: "/user/products?featured=true" },
        { name: "New Arrivals", href: "/user/products?sort=new" }
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
    }
  ];

  // Toggle mobile menu item
  const toggleMobileMenu = (title) => {
    setOpenMobileMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
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
                    scrolled ? 'w-6 h-6' : 'w-7.5 h-7.5'
                  } ${scrolled ? 'text-green-600' : 'text-green-500'}`} />
                  <span className={`font-semibold tracking-tight transition-all duration-300 ${
                    scrolled ? 'text-base' : 'text-lg'
                  } ${scrolled ? 'text-gray-900' : 'text-gray-800'}`}>FreshConnect</span>
                </motion.a>

                <div className="flex-1 flex justify-center">
                  <nav className="hidden md:flex items-center justify-between mx-auto px-10">
                    <div className="flex items-center space-x-6 lg:space-x-8">
                      {menuItems.map((item) => (
                        <div key={item.title} className="relative group">
                          <Link
                            to={item.href}
                            className={`font-medium tracking-wide transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap ${
                              scrolled ? 'text-sm' : 'text-base'
                            } ${
                              scrolled 
                                ? 'text-gray-600 hover:text-green-600' 
                                : 'text-gray-700 hover:text-green-500'
                            }`}
                          >
                            <item.icon className={`${scrolled ? 'w-4.5 h-4.5' : 'w-5 h-5'}`} />
                            {item.title}
                          </Link>

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
                                    scrolled ? 'text-sm text-gray-700' : 'text-sm text-gray-700'
                                  }`}
                                  whileHover={{ x: 4 }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigate(subItem.href);
                                  }}
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

                <div className="flex items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`font-medium rounded-full transition-all duration-300 ${
                      scrolled 
                        ? 'text-sm px-3 py-1 bg-transparent text-green-600 hover:bg-green-50' 
                        : 'text-sm px-4 py-2 bg-transparent text-gray-700 hover:bg-white/10'
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
                        ? 'text-sm px-3 py-1 bg-green-600 text-white hover:bg-green-700 rounded-full' 
                        : 'text-sm px-5 py-2 bg-white text-gray-800 hover:bg-gray-100 rounded-full'
                    }`}
                    onClick={() => navigate('/register')}
                  >
                    Register
                  </motion.button>
                </div>

                <div className="md:hidden flex items-center ml-4">
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      scrolled 
                        ? 'text-gray-700 hover:bg-gray-100' 
                        : 'text-gray-700 hover:bg-white/10'
                    }`}
                  >
                    {isMenuOpen ? (
                      <X className={`${scrolled ? 'w-5 h-5' : 'w-5.5 h-5.5'}`} />
                    ) : (
                      <Menu className={`${scrolled ? 'w-5 h-5' : 'w-5.5 h-5.5'}`} />
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
                ? 'top-[88px]'
                : 'top-[96px]'
            }`}
          >
            <div className={`mx-auto transition-all duration-500 ${
              scrolled 
                ? 'max-w-3xl bg-white/60 backdrop-blur-lg shadow-lg rounded-3xl mx-6' 
                : 'bg-white shadow-xl rounded-b-3xl'
            }`}>
              <div className="p-4">
                <nav className="grid gap-2">
                  {menuItems.map((item) => (
                    <div key={item.title}>
                      <div 
                        className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-gray-100 cursor-pointer"
                        onClick={() => toggleMobileMenu(item.title)}
                      >
                        <div className="flex items-center gap-2.5">
                          <item.icon className="w-4.5 h-4.5 text-green-600" />
                          <span className="font-medium text-base">{item.title}</span>
                        </div>
                        <div className={`transition-transform duration-300 ${openMobileMenus[item.title] ? 'rotate-180' : ''}`}>
                          <AlertTriangle className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {openMobileMenus[item.title] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-11 grid gap-1 mt-1">
                              {item.subItems.map((subItem) => (
                                <a
                                  key={subItem.name}
                                  href={subItem.href}
                                  className="py-2 px-3 text-sm text-gray-600 hover:text-green-600 rounded-lg hover:bg-gray-50"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigate(subItem.href);
                                    setIsMenuOpen(false);
                                  }}
                                >
                                  {subItem.name}
                                </a>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div 
                      className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        navigate('/user/profile');
                        setIsMenuOpen(false);
                      }}
                    >
                      <User className="w-4.5 h-4.5 text-green-600" />
                      <span className="font-medium text-base">My Profile</span>
                    </div>
                    
                    <div 
                      className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        navigate('/user/orders');
                        setIsMenuOpen(false);
                      }}
                    >
                      <Clock className="w-4.5 h-4.5 text-green-600" />
                      <span className="font-medium text-base">My Orders</span>
                    </div>
                    
                    <div 
                      className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        navigate('/user/wishlist');
                        setIsMenuOpen(false);
                      }}
                    >
                      <Heart className="w-4.5 h-4.5 text-green-600" />
                      <span className="font-medium text-base">Wishlist</span>
                    </div>
                    
                    <div 
                      className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        navigate('/user/cart');
                        setIsMenuOpen(false);
                      }}
                    >
                      <ShoppingCart className="w-4.5 h-4.5 text-green-600" />
                      <span className="font-medium text-base">Cart</span>
                    </div>
                  </div>
                </nav>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content with space for fixed header */}
      <main className="flex-grow pt-24 pb-16">
        {/* Welcome Notification - positioned below navbar */}
        <div className="relative">
          <Notification 
            message="Welcome to FreshConnect! Start exploring fresh produce and connect with local farmers."
            type="success"
            isVisible={showWelcome}
            onClose={() => {
              if (welcomeTimerRef.current) {
                clearTimeout(welcomeTimerRef.current);
              }
              setShowWelcome(false);
              // Mark as shown in localStorage
              localStorage.setItem('hasShownWelcome', 'true');
              hasShownWelcome.current = true;
            }}
          />
        </div>
        <Outlet />
      </main>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 p-3 bg-green-500 text-white rounded-full shadow-lg z-50"
            onClick={scrollToTop}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
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
                    <a 
                      href={item.href} 
                      className="text-gray-400 hover:text-white transition-colors hover:scale-105"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(item.href);
                      }}
                    >
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
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-4 py-2 rounded-l-lg flex-grow bg-gray-800 text-white border-0 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-r-lg transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2023 FreshConnect. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout; 