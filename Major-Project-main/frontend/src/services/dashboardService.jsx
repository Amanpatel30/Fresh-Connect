import { getDashboardStats as fetchDashboardStatsAPI, getRecentActivity } from './api.jsx';

// Function to fetch dashboard statistics
export const getDashboardStats = async () => {
  try {
    console.log('Fetching dashboard stats from API...');
    const response = await fetchDashboardStatsAPI();
    console.log('Dashboard stats API response:', response);
    
    // Check if we have a valid response
    if (response && response.data) {
      // Log the structure of the response data to help debug
      console.log('Response data structure:', JSON.stringify(response.data, null, 2));
      
      // Handle different response structures
      let statsData;
      
      // Some APIs return data in a nested 'data' property
      if (response.data.data) {
        console.log('Using nested data property');
        statsData = response.data.data;
      } else {
        // Some APIs might return data directly
        console.log('Using direct data property');
        statsData = response.data;
      }
      
      return statsData;
    } else {
      console.warn('Invalid dashboard stats response:', response);
      // Return empty data structure instead of mock data
      return {
        totalRevenue: 0,
        totalSales: 0,
        monthlySales: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalCustomers: 0,
        inventoryValue: 0,
        lowStockItems: 0,
        weeklySales: [],
        topSellingItems: [],
        revenueByMonth: []
      };
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return empty data structure instead of mock data
    return {
      totalRevenue: 0,
      totalSales: 0,
      monthlySales: 0,
      totalOrders: 0,
      pendingOrders: 0,
      totalCustomers: 0,
      inventoryValue: 0,
      lowStockItems: 0,
      weeklySales: [],
      topSellingItems: [],
      revenueByMonth: []
    };
  }
};

// Function to fetch recent activity
export const fetchRecentActivity = async () => {
  try {
    const response = await getRecentActivity();
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};

// Function to fetch weekly sales data
export const getWeeklySalesData = async () => {
  try {
    console.log('Fetching weekly sales data...');
    // Try to get data from the dashboard stats API first
    const dashboardData = await getDashboardStats();
    
    // If we have weekly sales data from the API, use it
    if (dashboardData && dashboardData.weeklySales && dashboardData.weeklySales.length > 0) {
      console.log('Using weekly sales data from API:', dashboardData.weeklySales);
      return dashboardData.weeklySales;
    }
    
    // Return empty array instead of mock data
    console.log('No weekly sales data found');
    return [];
  } catch (error) {
    console.error('Error fetching weekly sales data:', error);
    // Return empty array instead of mock data
    return [];
  }
};

// Function to fetch top selling items
export const getTopSellingItems = async () => {
  try {
    console.log('Fetching top selling items...');
    // Try to get data from the dashboard stats API first
    const dashboardData = await getDashboardStats();
    
    // If we have top selling items from the API, use it
    if (dashboardData && dashboardData.topSellingItems && dashboardData.topSellingItems.length > 0) {
      console.log('Using top selling items from API:', dashboardData.topSellingItems);
      return dashboardData.topSellingItems;
    }
    
    // Return empty array instead of mock data
    console.log('No top selling items data found');
    return [];
  } catch (error) {
    console.error('Error fetching top selling items:', error);
    // Return empty array instead of mock data
    return [];
  }
};

// Export functions as default export
export default {
  getDashboardStats,
  fetchRecentActivity,
  getWeeklySalesData,
  getTopSellingItems
}; 