import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, Row, Col, Statistic, Spin, Alert, Button, 
  Divider, Empty, Space, DatePicker, Select, Tabs, Table, 
  Progress, List, Timeline, message
} from 'antd';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  ShoppingCartOutlined, DollarOutlined, ClockCircleOutlined, 
  ShoppingOutlined, ReloadOutlined, CalendarOutlined,
  RiseOutlined, FallOutlined, PieChartOutlined, BarChartOutlined,
  LineChartOutlined, AreaChartOutlined
} from '@ant-design/icons';
import analyticsService from '../../services/analyticsService';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [chartType, setChartType] = useState('line');
  const [activeTab, setActiveTab] = useState('1');
  const [usingMockData, setUsingMockData] = useState(false);

  // Mock data for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch real data from the backend
      const [userAnalytics, orderAnalytics, categoryAnalytics, recentOrders, orderSummary] = await Promise.allSettled([
        analyticsService.getUserAnalytics(dateRange),
        analyticsService.getOrderAnalytics(dateRange),
        analyticsService.getCategoryAnalytics(),
        analyticsService.getRecentOrders(),
        analyticsService.getOrderSummary()
      ]);
      
      // Check if any of the promises were rejected
      const rejectedPromises = [userAnalytics, orderAnalytics, categoryAnalytics, recentOrders, orderSummary]
        .filter(promise => promise.status === 'rejected');
      
      if (rejectedPromises.length > 0) {
        // If any promises were rejected, throw an error
        throw new Error('Failed to fetch analytics data. Please ensure the backend server is running.');
      }
      
      // If all promises were fulfilled, combine the data
      const data = {
        summary: orderSummary.value.data,
        ordersByMonth: orderAnalytics.value.data.ordersByMonth,
        categoryBreakdown: categoryAnalytics.value.data,
        recentOrders: recentOrders.value.data,
        ordersByDay: orderAnalytics.value.data.ordersByDay
      };
      
      setAnalyticsData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      
      // Show error message to user
      message.error('Failed to fetch analytics data. Using mock data instead.');
      setUsingMockData(true);
      
      // Use mock data as fallback
      setTimeout(() => {
        // Mock data for analytics
        const mockData = {
          summary: {
            totalOrders: 42,
            totalSpent: 8750.50,
            averageOrderValue: 208.35,
            pendingOrders: 3
          },
          ordersByMonth: [
            { month: 'Jan', orders: 3, amount: 650.25 },
            { month: 'Feb', orders: 5, amount: 1020.75 },
            { month: 'Mar', orders: 4, amount: 840.50 },
            { month: 'Apr', orders: 6, amount: 1250.30 },
            { month: 'May', orders: 8, amount: 1680.40 },
            { month: 'Jun', orders: 7, amount: 1470.80 },
            { month: 'Jul', orders: 9, amount: 1890.60 }
          ],
          categoryBreakdown: [
            { name: 'Vegetables', value: 35 },
            { name: 'Fruits', value: 25 },
            { name: 'Dairy', value: 15 },
            { name: 'Grains', value: 10 },
            { name: 'Meat', value: 10 },
            { name: 'Others', value: 5 }
          ],
          recentOrders: [
            { id: 'ORD-10045', date: '2023-07-15', amount: 245.80, status: 'delivered' },
            { id: 'ORD-10044', date: '2023-07-10', amount: 180.25, status: 'delivered' },
            { id: 'ORD-10043', date: '2023-07-05', amount: 320.50, status: 'processing' },
            { id: 'ORD-10042', date: '2023-06-28', amount: 150.75, status: 'delivered' },
            { id: 'ORD-10041', date: '2023-06-20', amount: 210.30, status: 'delivered' }
          ],
          ordersByDay: [
            { day: 'Mon', orders: 5 },
            { day: 'Tue', orders: 7 },
            { day: 'Wed', orders: 10 },
            { day: 'Thu', orders: 8 },
            { day: 'Fri', orders: 12 },
            { day: 'Sat', orders: 15 },
            { day: 'Sun', orders: 9 }
          ]
        };
        
        setAnalyticsData(mockData);
        setLoading(false);
      }, 1000);
    }
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const handleChartTypeChange = (value) => {
    setChartType(value);
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const renderSummaryCards = () => {
    if (!analyticsData) return null;
    
    const { summary } = analyticsData;
    
    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Total Orders" 
              value={summary.totalOrders} 
              prefix={<ShoppingCartOutlined />} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Total Spent" 
              value={summary.totalSpent} 
              precision={2} 
              prefix={<DollarOutlined />} 
              suffix="₹"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Average Order Value" 
              value={summary.averageOrderValue} 
              precision={2} 
              prefix={<DollarOutlined />} 
              suffix="₹"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Pending Orders" 
              value={summary.pendingOrders} 
              prefix={<ClockCircleOutlined />} 
              valueStyle={{ color: summary.pendingOrders > 0 ? '#faad14' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  const renderOrdersChart = () => {
    if (!analyticsData) return null;
    
    const { ordersByMonth } = analyticsData;
    
    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ordersByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="orders" 
              stroke="#1890ff" 
              activeDot={{ r: 8 }} 
              name="Orders"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="amount" 
              stroke="#52c41a" 
              name="Amount (₹)"
            />
          </LineChart>
        </ResponsiveContainer>
      );
    } else if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ordersByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="orders" fill="#1890ff" name="Orders" />
            <Bar dataKey="amount" fill="#52c41a" name="Amount (₹)" />
          </BarChart>
        </ResponsiveContainer>
      );
    } else if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={ordersByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="orders" 
              stackId="1"
              stroke="#1890ff" 
              fill="#1890ff" 
              name="Orders"
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stackId="2"
              stroke="#52c41a" 
              fill="#52c41a" 
              name="Amount (₹)"
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }
    
    return null;
  };

  const renderCategoryBreakdown = () => {
    if (!analyticsData) return null;
    
    const { categoryBreakdown } = analyticsData;
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={categoryBreakdown}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {categoryBreakdown.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderRecentOrders = () => {
    if (!analyticsData) return null;
    
    const { recentOrders } = analyticsData;
    
    const columns = [
      {
        title: 'Order ID',
        dataIndex: 'id',
        key: 'id',
        render: (text) => <a href="#">{text}</a>,
      },
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
      },
      {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
        render: (amount) => `₹${amount.toFixed(2)}`,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
          let color = 'green';
          if (status === 'processing') {
            color = 'gold';
          } else if (status === 'cancelled') {
            color = 'volcano';
          }
          return (
            <span style={{ 
              color, 
              textTransform: 'capitalize',
              fontWeight: 500
            }}>
              {status}
            </span>
          );
        },
      },
    ];
    
    return (
      <Table 
        columns={columns} 
        dataSource={recentOrders} 
        rowKey="id" 
        pagination={false}
      />
    );
  };

  const renderOrdersByDay = () => {
    if (!analyticsData) return null;
    
    const { ordersByDay } = analyticsData;
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={ordersByDay}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="orders" fill="#1890ff" name="Orders" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80vh">
        <Spin size="large" tip="Loading analytics data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={handleRefresh}>
              Retry
            </Button>
          }
        />
        <div className="mt-8">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No analytics data available"
          >
            <Button type="primary" icon={<ReloadOutlined />} onClick={handleRefresh}>
              Refresh
            </Button>
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard p-4">
      <div className="header mb-6">
        <Title level={2}>
          <PieChartOutlined className="mr-2" /> Analytics Dashboard
        </Title>
        <Paragraph className="text-gray-500">
          View your order history, spending patterns, and more.
        </Paragraph>
        
        {usingMockData && (
          <Alert
            message="Using Mock Data"
            description="Could not connect to the backend server. Displaying mock data instead."
            type="warning"
            showIcon
            closable
            className="mb-4"
            action={
              <Button size="small" type="primary" onClick={handleRefresh}>
                Retry Connection
              </Button>
            }
          />
        )}
      </div>
      
      <div className="filters mb-6">
        <Row gutter={16} align="middle">
          <Col xs={24} md={12} lg={8}>
            <Space>
              <Text strong>Date Range:</Text>
              <RangePicker onChange={handleDateRangeChange} />
            </Space>
          </Col>
          <Col xs={24} md={8} lg={6}>
            <Space>
              <Text strong>Chart Type:</Text>
              <Select 
                defaultValue="line" 
                style={{ width: 120 }} 
                onChange={handleChartTypeChange}
              >
                <Option value="line">
                  <LineChartOutlined /> Line
                </Option>
                <Option value="bar">
                  <BarChartOutlined /> Bar
                </Option>
                <Option value="area">
                  <AreaChartOutlined /> Area
                </Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} md={4} lg={10} className="text-right">
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </div>
      
      <div className="summary-cards mb-6">
        {renderSummaryCards()}
      </div>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-6">
        <TabPane 
          tab={
            <span>
              <LineChartOutlined />
              Order Trends
            </span>
          } 
          key="1"
        >
          <Card title="Monthly Order Trends" className="mb-6">
            {renderOrdersChart()}
          </Card>
          
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Card title="Orders by Day of Week" className="mb-6">
                {renderOrdersByDay()}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Category Breakdown" className="mb-6">
                {renderCategoryBreakdown()}
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <ShoppingOutlined />
              Recent Orders
            </span>
          } 
          key="2"
        >
          <Card title="Recent Orders" className="mb-6">
            {renderRecentOrders()}
          </Card>
        </TabPane>
      </Tabs>
      
      <style jsx>{`
        .analytics-dashboard {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .mb-6 {
          margin-bottom: 24px;
        }
        
        .mr-2 {
          margin-right: 8px;
        }
        
        .text-gray-500 {
          color: #6b7280;
        }
        
        .text-right {
          text-align: right;
        }
        
        @media (max-width: 768px) {
          .text-right {
            text-align: left;
            margin-top: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard; 