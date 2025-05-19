import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AppstoreOutlined, 
  CodeOutlined,
  SafetyCertificateOutlined,
  NodeExpandOutlined,
  BarChartOutlined,
  TeamOutlined, 
  LogoutOutlined  
} from '@ant-design/icons';
import './AppSidebar.css';

const AppSidebar = ({ activeTabId, onTabChange }) => {
  const [hoveredTab, setHoveredTab] = useState(null);
  
  const navItems = [
    { id: 'dashboard', icon: AppstoreOutlined, color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.9)' },
    { id: 'store', icon: CodeOutlined, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.9)' },
    { id: 'code', icon: SafetyCertificateOutlined, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.9)' },
    { id: 'profile', icon: TeamOutlined, color: '#a78bfa', bgColor: 'rgba(167, 139, 250, 0.9)' },
    { id: 'network', icon: NodeExpandOutlined, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.9)' },
    { id: 'analytics', icon: BarChartOutlined, color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.9)' },
    { id: 'logout', icon: LogoutOutlined, color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.9)' },
  ];

  // Handle tab click
  const handleTabClick = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <div className="app-sidebar-container">
      <div className="app-sidebar-inner">
        {navItems.map((item) => (
          <motion.div
            key={item.id}
            className={`app-icon-container ${activeTabId === item.id ? 'app-icon-active' : ''}`}
            style={{ 
              backgroundColor: item.bgColor,
            }}
            initial={{ scale: 1 }}
            whileHover={{ 
              scale: 1.08,
              transition: { type: 'spring', stiffness: 400, damping: 10 }
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleTabClick(item.id)}
            onMouseEnter={() => setHoveredTab(item.id)}
            onMouseLeave={() => setHoveredTab(null)}
          >
            <item.icon className="app-icon" style={{ fontSize: '28px', color: 'white' }} />
            
            {/* White indicator for active tab */}
            {activeTabId === item.id && (
              <div className="app-icon-indicator"></div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AppSidebar; 