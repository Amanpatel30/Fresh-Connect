/**
 * Search Service for handling search-related API calls
 */

// Base API URL - replace with your actual API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Performs a global search across different resources
 * @param {string} query - The search query
 * @param {Object} options - Additional search options
 * @returns {Promise<Array>} Search results
 */
export const globalSearch = async (query, options = {}) => {
  try {
    // In a real application, this would be an actual API call
    // For now, we'll simulate an API call with a delay
    const response = await mockSearchAPI(query, options);
    return response;
  } catch (error) {
    console.error('Error performing search:', error);
    throw error;
  }
};

/**
 * Performs a search within a specific resource type
 * @param {string} resourceType - The type of resource to search (users, products, orders, etc.)
 * @param {string} query - The search query
 * @param {Object} options - Additional search options
 * @returns {Promise<Array>} Search results for the specific resource
 */
export const resourceSearch = async (resourceType, query, options = {}) => {
  try {
    // In a real application, this would be an actual API call
    const response = await mockResourceSearchAPI(resourceType, query, options);
    return response;
  } catch (error) {
    console.error(`Error searching ${resourceType}:`, error);
    throw error;
  }
};

/**
 * Mock function that simulates an API call for global search
 * Replace this with actual API calls in production
 */
const mockSearchAPI = (query, options) => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Mock search results based on the query
      const results = generateMockSearchResults(query);
      resolve(results);
    }, 500);
  });
};

/**
 * Mock function that simulates an API call for resource-specific search
 * Replace this with actual API calls in production
 */
const mockResourceSearchAPI = (resourceType, query, options) => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Generate mock results based on resource type
      const results = generateMockSearchResults(query).filter(
        item => item.type === resourceType
      );
      resolve(results);
    }, 500);
  });
};

/**
 * Generates mock search results based on the query
 * This is only for demonstration and should be replaced with real data
 */
const generateMockSearchResults = (query) => {
  const lowercaseQuery = query.toLowerCase();
  
  // Mock data sources - in a real app, this would come from the backend
  const mockData = {
    pages: [
      { id: 'page-1', title: 'Dashboard', path: '/' },
      { id: 'page-2', title: 'User Management', path: '/users' },
      { id: 'page-3', title: 'Product Management', path: '/products' },
      { id: 'page-4', title: 'Order Monitoring', path: '/orders' },
      { id: 'page-5', title: 'Settings', path: '/settings' },
    ],
    products: [
      { id: 'prod-1', title: 'Organic Apples', sku: 'APL-ORG-001', price: 2.99 },
      { id: 'prod-2', title: 'Fresh Bananas', sku: 'BAN-FRS-002', price: 1.49 },
      { id: 'prod-3', title: 'Red Tomatoes', sku: 'TOM-RED-003', price: 3.99 },
      { id: 'prod-4', title: 'Green Peppers', sku: 'PEP-GRN-004', price: 2.49 },
      { id: 'prod-5', title: 'Organic Carrots', sku: 'CAR-ORG-005', price: 1.99 },
    ],
    orders: [
      { id: 'order-1', title: 'Order #1234', customer: 'John Doe', total: 54.99 },
      { id: 'order-2', title: 'Order #1235', customer: 'Jane Smith', total: 32.50 },
      { id: 'order-3', title: 'Order #1236', customer: 'Bob Johnson', total: 127.95 },
      { id: 'order-4', title: 'Order #1237', customer: 'Alice Brown', total: 45.00 },
      { id: 'order-5', title: 'Order #1238', customer: 'Charlie Wilson', total: 89.99 },
    ],
    users: [
      { id: 'user-1', title: 'John Doe', email: 'john@example.com', role: 'Customer' },
      { id: 'user-2', title: 'Jane Smith', email: 'jane@example.com', role: 'Seller' },
      { id: 'user-3', title: 'Admin User', email: 'admin@example.com', role: 'Admin' },
      { id: 'user-4', title: 'Support Staff', email: 'support@example.com', role: 'Support' },
      { id: 'user-5', title: 'Marketing Team', email: 'marketing@example.com', role: 'Marketing' },
    ],
  };
  
  // Process each data type
  const results = [];
  
  // Search pages
  mockData.pages.forEach(page => {
    if (page.title.toLowerCase().includes(lowercaseQuery) || 
        page.path.toLowerCase().includes(lowercaseQuery)) {
      results.push({
        id: page.id,
        title: page.title,
        type: 'page',
        path: page.path,
        icon: 'page'
      });
    }
  });
  
  // Search products
  mockData.products.forEach(product => {
    if (product.title.toLowerCase().includes(lowercaseQuery) || 
        product.sku.toLowerCase().includes(lowercaseQuery)) {
      results.push({
        id: product.id,
        title: product.title,
        type: 'product',
        sku: product.sku,
        price: product.price,
        icon: 'product'
      });
    }
  });
  
  // Search orders
  mockData.orders.forEach(order => {
    if (order.title.toLowerCase().includes(lowercaseQuery) || 
        order.customer.toLowerCase().includes(lowercaseQuery)) {
      results.push({
        id: order.id,
        title: order.title,
        type: 'order',
        customer: order.customer,
        total: order.total,
        icon: 'order'
      });
    }
  });
  
  // Search users
  mockData.users.forEach(user => {
    if (user.title.toLowerCase().includes(lowercaseQuery) || 
        user.email.toLowerCase().includes(lowercaseQuery) ||
        user.role.toLowerCase().includes(lowercaseQuery)) {
      results.push({
        id: user.id,
        title: user.title,
        type: 'user',
        email: user.email,
        role: user.role,
        icon: 'user'
      });
    }
  });
  
  return results;
};

export default {
  globalSearch,
  resourceSearch
}; 