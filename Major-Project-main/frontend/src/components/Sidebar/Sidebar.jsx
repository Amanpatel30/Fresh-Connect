import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Tooltip from './Tooltip';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/hotel/dashboard',
      icon: 'fas fa-chart-line',
      title: 'Dashboard',
    },
    {
      path: '/hotel/orders',
      icon: 'fas fa-shopping-cart',
      title: 'Orders',
    },
    {
      path: '/hotel/inventory',
      icon: 'fas fa-box',
      title: 'Inventory',
    },
    {
      path: '/hotel/menu',
      icon: 'fas fa-utensils',
      title: 'Menu',
    },
    {
      path: '/hotel/profile',
      icon: 'fas fa-user',
      title: 'Profile',
    },
    {
      path: '/hotel/settings',
      icon: 'fas fa-cog',
      title: 'Settings',
    },
  ];

  return (
    <div className="bg-gray-800 text-white h-screen w-16 fixed left-0 top-0 flex flex-col items-center py-4">
      <div className="mb-8">
        <Link to="/hotel/dashboard">
          <Tooltip content="Home" position="right">
            <i className="fas fa-home text-xl"></i>
          </Tooltip>
        </Link>
      </div>

      <nav className="flex-1">
        <ul className="space-y-4">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path}>
                <Tooltip content={item.title} position="right">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                      location.pathname === item.path
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <i className={`${item.icon} text-lg`}></i>
                  </div>
                </Tooltip>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto mb-4">
        <Tooltip content="Logout" position="right">
          <button
            onClick={() => {/* Add your logout logic here */}}
            className="w-12 h-12 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-200"
          >
            <i className="fas fa-sign-out-alt text-lg"></i>
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default Sidebar; 