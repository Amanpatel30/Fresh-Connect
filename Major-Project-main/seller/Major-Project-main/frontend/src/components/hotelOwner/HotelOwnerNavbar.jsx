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
    { path: '/hotel-owner/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { path: '/hotel-owner/purchase-history', icon: <ShoppingOutlined />, label: 'Purchase History' },
    { path: '/hotel-owner/inventory', icon: <DatabaseOutlined />, label: 'Inventory Management' },
    { path: '/hotel-owner/verification', icon: <SafetyCertificateOutlined />, label: 'Verification' },
    { path: '/hotel-owner/leftover-food', icon: <GiftOutlined />, label: 'Leftover Food' },
    { path: '/hotel-owner/urgent-sales', icon: <FireOutlined />, label: 'Urgent Sales' },
    { path: '/hotel-owner/menu', icon: <MenuOutlined />, label: 'Menu Management' },
    { path: '/hotel-owner/settings', icon: <SettingOutlined />, label: 'Profile Settings' },
    { path: '/hotel-owner/analytics', icon: <BarChartOutlined />, label: 'Analytics' },
    { path: '/hotel-owner/feedback', icon: <MessageOutlined />, label: 'Customer Feedback' },
    { path: '/hotel-owner/orders', icon: <ShoppingCartOutlined />, label: 'Order Management' },
    { path: '/hotel-owner/documents', icon: <IdcardOutlined />, label: 'Verification Documents' },
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
      width: "64px",
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
      className="fixed top-0 left-0 h-screen bg-white shadow-md z-10 overflow-hidden"
      initial="collapsed"
      animate={isExpanded ? "expanded" : "collapsed"}
      variants={navbarVariants}
    >
      <div className="p-4 flex items-center justify-between border-b">
        <motion.div
          className="font-semibold text-lg text-blue-600 whitespace-nowrap"
          variants={textVariants}
        >
          Hotel Owner Panel
        </motion.div>
        <button 
          onClick={toggleNavbar}
          className="text-gray-500 hover:text-blue-600 transition-colors"
        >
          {isExpanded ? <MenuFoldOutlined className="text-xl" /> : <MenuUnfoldOutlined className="text-xl" />}
        </button>
      </div>

      <div className="py-4">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path}
            className={`flex items-center px-4 py-2.5 transition-colors ${
              location.pathname === item.path 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <motion.span 
              className="ml-3 whitespace-nowrap text-base"
              variants={textVariants}
            >
              {item.label}
            </motion.span>
          </Link>
        ))}
      </div>
    </motion.nav>
  );
};

export default HotelOwnerNavbar; 