import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AppSidebar from './AppSidebar';
import { WindowsOutlined } from '@ant-design/icons';
import './AppSidebarDemo.css';

const AppSidebarDemo = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="app-demo-container">
      {/* App Sidebar */}
      <AppSidebar 
        activeTabId={activeTab}
        onTabChange={handleTabChange}
      />
      
      {/* Main Content Area */}
      <div className="app-main-content">
        <div className="app-header">
          <div className="app-logo">
            <WindowsOutlined style={{ fontSize: '24px', color: '#6366f1' }} />
            <div className="app-title">
              <h1>cedro digest</h1>
              <p>february - december '22</p>
            </div>
          </div>
          
          <div className="app-location">
            <p>Yerevan</p>
            <p>12:16:08</p>
          </div>
        </div>
        
        <motion.div 
          className="app-content"
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <motion.h1 
            className="app-page-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            cedro's digest
          </motion.h1>
          
          {/* Content specific to the active tab would go here */}
        </motion.div>
      </div>
    </div>
  );
};

export default AppSidebarDemo; 