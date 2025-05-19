import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Typography, Statistic, DatePicker, Select,
  Table, Tag, Space, Button, Tooltip, Progress
} from 'antd';
import {
  ArrowUpOutlined, ArrowDownOutlined, DollarOutlined,
  ShoppingCartOutlined, UserOutlined, LineChartOutlined,
  BarChartOutlined, PieChartOutlined, CalendarOutlined,
  FilterOutlined, DownloadOutlined
} from '@ant-design/icons';
import { Line, Bar, Pie } from '@ant-design/plots';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');
  const [stats, setStats] = useState({});
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [customerData, setCustomerData] = useState([]);

  useEffect(() => {
    // Simulating API calls to fetch analytics data
    setTimeout(() => {
      // Mock stats data
      setStats({
        revenue: {
          total: 25678.90,
          change: 12.3,
          breakdown: {
            today: 2567.89,
            yesterday: 2345.67,
            thisWeek: 18456.78,
            lastWeek: 17234.56,
            thisMonth: 83469.01,
            lastMonth: 78452.34
          }
        },
        orders: {
          total: 345,
          change: 8.5,
          completed: 289,
          pending: 56,
          cancelled: 12
        },
        customers: {
          total: 180,
          change: 5.2,
          new: 23,
          returning: 157
        },
        products: {
          total: 56,
          outOfStock: 3,
          lowStock: 5
        }
      });

      // Mock sales data for charts
      setSalesData(generateSalesData());
      setTopProducts(generateTopProducts());
      setCategoryData(generateCategoryData());
      setCustomerData(generateCustomerData());

      setLoading(false);
    }, 1500);
  }, []);

  // Helper function to generate mock sales data
  const generateSalesData = () => {
    const data = [];
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 1000) + 500,
        orders: Math.floor(Math.random() * 50) + 20
      });
    }
    return data;
  };

  // Helper function to generate mock top products data
  const generateTopProducts = () => {
    return [
      { name: 'Fresh Tomatoes', sales: 234, revenue: 9360.00, growth: 15.2 },
      { name: 'Organic Potatoes', sales: 189, revenue: 6615.00, growth: 8.7 },
      { name: 'Green Spinach', sales: 156, revenue: 4680.00, growth: -3.4 },
      { name: 'Carrots', sales: 145, revenue: 3625.00, growth: 12.1 },
      { name: 'Onions', sales: 134, revenue: 2680.00, growth: 5.8 }
    ];
  };

  // Helper function to generate mock category data
  const generateCategoryData = () => {
    return [
      { category: 'Vegetables', value: 45 },
      { category: 'Root Vegetables', value: 25 },
      { category: 'Leafy Greens', value: 20 },
      { category: 'Organic', value: 10 }
    ];
  };

  // Helper function to generate mock customer data
  const generateCustomerData = () => {
    return [
      { type: 'New', value: 23 },
      { type: 'Returning', value: 157 }
    ];
  };

  const handleTimeframeChange = (value) => {
    setTimeframe(value);
    // In a real app, this would trigger an API call to fetch data for the selected timeframe
  };

  // Configuration for the sales trend chart
  const salesConfig = {
    data: salesData,
    xField: 'date',
    yField: 'sales',
    smooth: true,
    tooltip: {
      formatter: (data) => {
        return { name: 'Sales', value: `₹${data.sales.toFixed(2)}` };
      }
    },
    color: '#1890ff',
    point: {
      size: 4,
      shape: 'diamond',
      style: {
        fill: 'white',
        stroke: '#1890ff',
        lineWidth: 2
      }
    }
  };

  // Configuration for the category distribution chart
  const categoryConfig = {
    data: categoryData,
    angleField: 'value',
    colorField: 'category',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}'
    },
    interactions: [{ type: 'element-active' }]
  };

  // Configuration for the customer composition chart
  const customerConfig = {
    data: customerData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}'
    },
    legend: {
      layout: 'horizontal',
      position: 'bottom'
    }
  };

  const topProductColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Sales',
      dataIndex: 'sales',
      key: 'sales',
      render: (sales) => `${sales} units`
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue) => `₹${revenue.toFixed(2)}`
    },
    {
      title: 'Growth',
      dataIndex: 'growth',
      key: 'growth',
      render: (growth) => (
        <Tag color={growth >= 0 ? 'success' : 'error'}>
          {growth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {Math.abs(growth)}%
        </Tag>
      )
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>Analytics Dashboard</Title>
            <Text type="secondary">Track your business performance</Text>
          </Col>
          <Col>
            <Space>
              <Select
                defaultValue="week"
                style={{ width: 120 }}
                onChange={handleTimeframeChange}
              >
                <Option value="today">Today</Option>
                <Option value="week">This Week</Option>
                <Option value="month">This Month</Option>
                <Option value="year">This Year</Option>
              </Select>
              <RangePicker />
              <Button icon={<DownloadOutlined />}>Export</Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Revenue"
              value={stats.revenue?.total}
              precision={2}
              prefix="₹"
              suffix={
                <Tag color={stats.revenue?.change >= 0 ? 'success' : 'error'}>
                  {stats.revenue?.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {Math.abs(stats.revenue?.change)}%
                </Tag>
              }
            />
            <Text type="secondary">vs. previous period</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Orders"
              value={stats.orders?.total}
              prefix={<ShoppingCartOutlined />}
              suffix={
                <Tag color={stats.orders?.change >= 0 ? 'success' : 'error'}>
                  {stats.orders?.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {Math.abs(stats.orders?.change)}%
                </Tag>
              }
            />
            <Progress
              percent={((stats.orders?.completed || 0) / (stats.orders?.total || 1)) * 100}
              size="small"
              showInfo={false}
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Customers"
              value={stats.customers?.total}
              prefix={<UserOutlined />}
              suffix={
                <Tag color={stats.customers?.change >= 0 ? 'success' : 'error'}>
                  {stats.customers?.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {Math.abs(stats.customers?.change)}%
                </Tag>
              }
            />
            <Text type="secondary">{stats.customers?.new} new this period</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Product Status"
              value={stats.products?.total}
              suffix="products"
            />
            <Space direction="vertical" size={0}>
              <Text type="danger">{stats.products?.outOfStock} out of stock</Text>
              <Text type="warning">{stats.products?.lowStock} low stock</Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24}>
          <Card
            title={
              <Space>
                <LineChartOutlined />
                <span>Sales Trend</span>
              </Space>
            }
            loading={loading}
          >
            <Line {...salesConfig} height={300} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <BarChartOutlined />
                <span>Top Selling Products</span>
              </Space>
            }
            loading={loading}
          >
            <Table
              dataSource={topProducts}
              columns={topProductColumns}
              pagination={false}
              rowKey="name"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <PieChartOutlined />
                <span>Category Distribution</span>
              </Space>
            }
            loading={loading}
          >
            <Pie {...categoryConfig} height={250} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <UserOutlined />
                <span>Customer Composition</span>
              </Space>
            }
            loading={loading}
          >
            <Pie {...customerConfig} height={250} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <span>Daily Revenue</span>
              </Space>
            }
            loading={loading}
          >
            <Bar
              data={salesData}
              xField="date"
              yField="sales"
              height={250}
              tooltip={{
                formatter: (data) => {
                  return { name: 'Revenue', value: `₹${data.sales.toFixed(2)}` };
                }
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Analytics; 