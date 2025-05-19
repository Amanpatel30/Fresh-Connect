import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  DashboardOutlined, 
  ShoppingOutlined, 
  DatabaseOutlined, 
  SafetyCertificateOutlined, 
  GiftOutlined, 
  FireOutlined, 
  MenuOutlined, 
  SettingOutlined, 
  BarChartOutlined, 
  MessageOutlined, 
  ShoppingCartOutlined, 
  IdcardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useNavbar } from '../../context/NavbarContext';

const HotelOwnerNavbar = () => {
  const location = useLocation();
  const { isExpanded, toggleNavbar } = useNavbar();

  const navItems = [
    { path: '/hotel/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { path: '/hotel/purchase-history', icon: <ShoppingOutlined />, label: 'Purchase History' },
    { path: '/hotel/inventory', icon: <DatabaseOutlined />, label: 'Inventory Management' },
    { path: '/hotel/verification', icon: <SafetyCertificateOutlined />, label: 'Verification' },
    { path: '/hotel/leftover-food', icon: <GiftOutlined />, label: 'Leftover Food' },
    { path: '/hotel/urgent-sales', icon: <FireOutlined />, label: 'Urgent Sales' },
    { path: '/hotel/menu', icon: <MenuOutlined />, label: 'Menu Management' },
    { path: '/hotel/settings', icon: <SettingOutlined />, label: 'Profile Settings' },
    { path: '/hotel/analytics', icon: <BarChartOutlined />, label: 'Analytics' },
    { path: '/hotel/feedback', icon: <MessageOutlined />, label: 'Customer Feedback' },
    { path: '/hotel/orders', icon: <ShoppingCartOutlined />, label: 'Order Management' },
    { path: '/hotel/documents', icon: <IdcardOutlined />, label: 'Verification Documents' },
  ];

  const navbarVariants = {
    expanded: {
      width: "256px",
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    collapsed: {
      width: "80px",
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const textVariants = {
    expanded: {
      opacity: 1,
      display: "block",
      transition: {
        duration: 0.3,
        delay: 0.2
      }
    },
    collapsed: {
      opacity: 0,
      display: "none",
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 h-screen overflow-hidden z-10"
      initial="collapsed"
      animate={isExpanded ? "expanded" : "collapsed"}
      variants={navbarVariants}
      style={{
        background: 'linear-gradient(135deg, #4a90e2 0%, #7c5cff 100%)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <motion.div
          className="font-semibold text-lg text-white whitespace-nowrap"
          variants={textVariants}
        >
          Hotel Panel
        </motion.div>
        <button 
          onClick={toggleNavbar}
          className="text-white hover:text-white/80 transition-colors"
        >
          {isExpanded ? <MenuFoldOutlined className="text-xl" /> : <MenuUnfoldOutlined className="text-xl" />}
        </button>
      </div>

      <div className="py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className="block mb-2 px-4"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center p-2 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-white text-blue-600 shadow-lg' 
                    : 'text-white hover:bg-white/10'
                }`}
                style={{
                  boxShadow: isActive ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 'none',
                  transform: isActive ? 'translateY(-2px)' : 'none'
                }}
              >
                <span className="text-xl">{item.icon}</span>
                <motion.span 
                  className="ml-3 whitespace-nowrap text-base font-medium"
                  variants={textVariants}
                >
                  {item.label}
                </motion.span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default HotelOwnerNavbar; 