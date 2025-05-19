import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WeeklySalesChart from '../../components/hotel/Dashboard/WeeklySalesChart';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        // Get user ID from localStorage for debugging
        const storedUserId = localStorage.getItem('userId');
        setUserId(storedUserId);
        
        console.log('Fetching dashboard data with token:', token);
        console.log('User ID from localStorage:', storedUserId);
        
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL || 'http://localhost:5001'}/api/dashboard/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        console.log('Dashboard API Response:', response.data);
        
        // Add better error handling for missing weeklySales data
        if (!response.data.weeklySales) {
          console.warn('Dashboard API response is missing weeklySales data');
          response.data.weeklySales = [];
        } else {
          console.log('Weekly sales data retrieved:', response.data.weeklySales);
        }
        
        setDashboardData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Dashboard API Error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Add debug logs for render phase
  console.log('Current dashboardData:', dashboardData);
  console.log('Weekly Sales Data:', dashboardData?.weeklySales);

  if (loading) return <div className="p-4">Loading dashboard data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500">Total Sales</h3>
          <p className="text-2xl font-bold">${dashboardData?.totalSales || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500">Monthly Sales</h3>
          <p className="text-2xl font-bold">${dashboardData?.monthlySales || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500">Total Orders</h3>
          <p className="text-2xl font-bold">{dashboardData?.totalOrders || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500">Pending Orders</h3>
          <p className="text-2xl font-bold">{dashboardData?.pendingOrders || 0}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <WeeklySalesChart data={dashboardData?.weeklySales || []} />
      </div>

      {/* Always show Debug Information in development */}
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-bold">Debug Info:</h3>
        <pre className="mt-2 text-sm overflow-auto">
          {JSON.stringify({
            userId,
            dashboardData,
            weeklySales: dashboardData?.weeklySales,
            token: localStorage.getItem('token'),
            baseUrl: import.meta.env.VITE_BASE_URL || 'http://localhost:5001'
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default Dashboard; 