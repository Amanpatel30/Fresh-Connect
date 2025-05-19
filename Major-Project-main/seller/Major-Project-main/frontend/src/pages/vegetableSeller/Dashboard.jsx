import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Statistic, Button, Table, Tag, Progress, List, Avatar, Divider, DatePicker, Dropdown, Badge, Tooltip } from 'antd';
import { 
  ArrowUpOutlined, ArrowDownOutlined, ShoppingCartOutlined, 
  UsergroupAddOutlined, DollarOutlined, FireOutlined, 
  BarChartOutlined, LineChartOutlined, PieChartOutlined,
  CalendarOutlined, BellOutlined, TagOutlined, CheckCircleOutlined,
  ClockCircleOutlined, HomeOutlined, InfoCircleOutlined,
  MoreOutlined, FileTextOutlined, EyeOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const VegetableSellerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [urgentSales, setUrgentSales] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [timeframe, setTimeframe] = useState('week');

  useEffect(() => {
    // In a real app, these would be separate API calls with proper data
    // Simulating data fetch
    setTimeout(() => {
      // Mock stats data
      setStats({
        totalSales: 2567.89,
        salesChange: 12.3,
        totalOrders: 34,
        ordersChange: 8.5,
        totalCustomers: 18,
        customersChange: 5.2,
        revenue: {
          today: 256.78,
          yesterday: 312.45,
          thisWeek: 1845.67,
          lastWeek: 1756.34,
          thisMonth: 8346.90,
          lastMonth: 7845.23
        },
        inventory: {
          total: 56,
          inStock: 48,
          lowStock: 5,
          outOfStock: 3
        }
      });

      // Mock recent orders
      setRecentOrders([
        { id: 'ORD-1234', customer: 'John Doe', date: '2023-06-15 14:30', amount: 124.55, status: 'completed', items: 5 },
        { id: 'ORD-1233', customer: 'Jane Smith', date: '2023-06-15 10:15', amount: 78.99, status: 'processing', items: 3 },
        { id: 'ORD-1232', customer: 'Robert Johnson', date: '2023-06-14 16:45', amount: 246.50, status: 'shipped', items: 8 },
        { id: 'ORD-1231', customer: 'Emily Brown', date: '2023-06-14 09:20', amount: 36.75, status: 'completed', items: 2 },
        { id: 'ORD-1230', customer: 'Michael Wilson', date: '2023-06-13 13:10', amount: 89.99, status: 'completed', items: 4 }
      ]);

      // Mock top products
      setTopProducts([
        { id: 1, name: 'Fresh Tomatoes', sales: 78, amount: 233.22, image: 'https://via.placeholder.com/40x40?text=T' },
        { id: 2, name: 'Organic Potatoes', sales: 65, amount: 259.35, image: 'https://via.placeholder.com/40x40?text=P' },
        { id: 3, name: 'Green Spinach', sales: 54, amount: 107.46, image: 'https://via.placeholder.com/40x40?text=S' },
        { id: 4, name: 'Carrots', sales: 42, amount: 104.58, image: 'https://via.placeholder.com/40x40?text=C' },
        { id: 5, name: 'Onions', sales: 35, amount: 87.50, image: 'https://via.placeholder.com/40x40?text=O' }
      ]);

      // Mock low stock items
      setLowStockItems([
        { id: 1, name: 'Bell Peppers', stock: 5, threshold: 10, image: 'https://via.placeholder.com/40x40?text=BP' },
        { id: 2, name: 'Cucumbers', stock: 4, threshold: 8, image: 'https://via.placeholder.com/40x40?text=C' },
        { id: 3, name: 'Lettuce', stock: 3, threshold: 10, image: 'https://via.placeholder.com/40x40?text=L' },
        { id: 4, name: 'Broccoli', stock: 2, threshold: 5, image: 'https://via.placeholder.com/40x40?text=B' },
        { id: 5, name: 'Zucchini', stock: 1, threshold: 5, image: 'https://via.placeholder.com/40x40?text=Z' }
      ]);

      // Mock urgent sales
      setUrgentSales([
        { id: 1, name: 'Ripe Tomatoes', originalPrice: 2.99, salePrice: 1.50, quantity: 20, expiry: '2023-06-17', image: 'https://via.placeholder.com/40x40?text=RT' },
        { id: 2, name: 'Fresh Spinach', originalPrice: 1.99, salePrice: 0.99, quantity: 15, expiry: '2023-06-18', image: 'https://via.placeholder.com/40x40?text=FS' },
        { id: 3, name: 'Lettuce Heads', originalPrice: 2.49, salePrice: 1.25, quantity: 10, expiry: '2023-06-17', image: 'https://via.placeholder.com/40x40?text=LH' }
      ]);

      // Mock notifications
      setNotifications([
        { id: 1, type: 'order', message: 'New order received: ORD-1234', time: '1 hour ago', read: false },
        { id: 2, type: 'stock', message: 'Zucchini is running low on stock', time: '3 hours ago', read: false },
        { id: 3, type: 'urgent', message: 'Ripe Tomatoes urgent sale expires tomorrow', time: '5 hours ago', read: true },
        { id: 4, type: 'review', message: 'New review received for Organic Potatoes', time: '1 day ago', read: true },
        { id: 5, type: 'payment', message: 'Payment of ₹1245.67 received', time: '2 days ago', read: true }
      ]);

      setLoading(false);
    }, 1500);
  }, []);

  const getStatusTag = (status) => {
    const statusMap = {
      'pending': { color: 'default', icon: <ClockCircleOutlined /> },
      'processing': { color: 'processing', icon: <ClockCircleOutlined /> },
      'shipped': { color: 'blue', icon: <HomeOutlined /> },
      'completed': { color: 'success', icon: <CheckCircleOutlined /> },
      'cancelled': { color: 'error', icon: <InfoCircleOutlined /> }
    };
    
    const { color, icon } = statusMap[status] || statusMap['pending'];
    
    return (
      <Tag color={color} icon={icon}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Tag>
    );
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      'order': <ShoppingCartOutlined style={{ color: '#1890ff' }} />,
      'stock': <TagOutlined style={{ color: '#faad14' }} />,
      'urgent': <FireOutlined style={{ color: '#f5222d' }} />,
      'review': <FileTextOutlined style={{ color: '#52c41a' }} />,
      'payment': <DollarOutlined style={{ color: '#722ed1' }} />
    };
    
    return iconMap[type] || <BellOutlined />;
  };

  const handleTimeframeChange = (value) => {
    setTimeframe(value);
  };

  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: id => <Link to={`/seller/orders/${id}`}>{id}</Link>
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer'
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: date => new Date(date).toLocaleString()
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: amount => `₹${amount.toFixed(2)}`
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => getStatusTag(status)
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="link" size="small">
          <Link to={`/seller/orders/${record.id}`}>View</Link>
        </Button>
      )
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <Title level={2}>Seller Dashboard</Title>
            <Text type="secondary">Welcome back! Here's an overview of your store.</Text>
          </div>
          <div className="flex items-center gap-4">
            <Dropdown
              menu={{
                items: [
                  { key: 'today', label: 'Today' },
                  { key: 'yesterday', label: 'Yesterday' },
                  { key: 'week', label: 'This Week' },
                  { key: 'month', label: 'This Month' },
                  { key: 'custom', label: 'Custom Range' }
                ],
                onClick: ({ key }) => handleTimeframeChange(key)
              }}
            >
              <Button>
                <CalendarOutlined /> {timeframe === 'week' ? 'This Week' : 'Custom Range'}
              </Button>
            </Dropdown>
            <Badge count={notifications.filter(n => !n.read).length}>
              <Button icon={<BellOutlined />} />
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Sales"
              value={stats.totalSales}
              precision={2}
              prefix="₹"
              valueStyle={{ color: stats.salesChange >= 0 ? '#3f8600' : '#cf1322' }}
              suffix={
                <div className="text-sm">
                  {stats.salesChange >= 0 ? (
                    <Tag color="success">
                      <ArrowUpOutlined /> {stats.salesChange}%
                    </Tag>
                  ) : (
                    <Tag color="error">
                      <ArrowDownOutlined /> {Math.abs(stats.salesChange)}%
                    </Tag>
                  )}
                </div>
              }
            />
            <Text type="secondary">vs. previous period</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Orders"
              value={stats.totalOrders}
              valueStyle={{ color: stats.ordersChange >= 0 ? '#3f8600' : '#cf1322' }}
              prefix={<ShoppingCartOutlined />}
              suffix={
                <div className="text-sm">
                  {stats.ordersChange >= 0 ? (
                    <Tag color="success">
                      <ArrowUpOutlined /> {stats.ordersChange}%
                    </Tag>
                  ) : (
                    <Tag color="error">
                      <ArrowDownOutlined /> {Math.abs(stats.ordersChange)}%
                    </Tag>
                  )}
                </div>
              }
            />
            <Text type="secondary">vs. previous period</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Customers"
              value={stats.totalCustomers}
              valueStyle={{ color: stats.customersChange >= 0 ? '#3f8600' : '#cf1322' }}
              prefix={<UsergroupAddOutlined />}
              suffix={
                <div className="text-sm">
                  {stats.customersChange >= 0 ? (
                    <Tag color="success">
                      <ArrowUpOutlined /> {stats.customersChange}%
                    </Tag>
                  ) : (
                    <Tag color="error">
                      <ArrowDownOutlined /> {Math.abs(stats.customersChange)}%
                    </Tag>
                  )}
                </div>
              }
            />
            <Text type="secondary">vs. previous period</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Inventory Status"
              value={stats.inventory?.inStock || 0}
              suffix={`/ ${stats.inventory?.total || 0}`}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress 
              percent={stats.inventory ? (stats.inventory.inStock / stats.inventory.total) * 100 : 0} 
              size="small" 
              showInfo={false}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <div className="flex justify-between mt-2">
              <Text type="secondary">
                <Tag color="warning">{stats.inventory?.lowStock || 0} Low Stock</Tag>
              </Text>
              <Text type="secondary">
                <Tag color="error">{stats.inventory?.outOfStock || 0} Out of Stock</Tag>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts and Tables Section */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>
          <Card 
            title="Recent Orders" 
            loading={loading}
            extra={<Link to="/seller/orders">View All</Link>}
          >
            <Table 
              dataSource={recentOrders} 
              columns={orderColumns} 
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title="Top Selling Products" 
            loading={loading}
            extra={<Link to="/seller/products">View All</Link>}
          >
            <List
              dataSource={topProducts}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item.image} />}
                    title={<Link to={`/seller/products/${item.id}`}>{item.name}</Link>}
                    description={`${item.sales} sold`}
                  />
                  <div>
                    <Text strong>₹{item.amount.toFixed(2)}</Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Inventory and Urgent Sales Section */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card 
            title="Low Stock Alert" 
            loading={loading}
            extra={<Link to="/seller/inventory">View Inventory</Link>}
          >
            <List
              dataSource={lowStockItems}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button 
                      type="primary" 
                      size="small"
                      key="restock"
                    >
                      Restock
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={item.image} />}
                    title={<Link to={`/seller/products/${item.id}`}>{item.name}</Link>}
                    description={
                      <div>
                        <Text type="danger">{item.stock} left</Text>
                        <Text type="secondary"> (Threshold: {item.threshold})</Text>
                      </div>
                    }
                  />
                  <Progress 
                    percent={(item.stock / item.threshold) * 100} 
                    size="small" 
                    status="exception"
                    style={{ width: 80 }}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title={
              <div className="flex items-center">
                <FireOutlined className="mr-2 text-red-500" />
                <span>Urgent Sales</span>
              </div>
            }
            loading={loading}
            extra={<Link to="/seller/urgent-sales">Manage Sales</Link>}
          >
            <List
              dataSource={urgentSales}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button 
                      type="link" 
                      size="small"
                      key="edit"
                    >
                      Edit
                    </Button>,
                    <Button 
                      type="link" 
                      size="small"
                      danger
                      key="end"
                    >
                      End Sale
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={item.image} />}
                    title={<Link to={`/seller/products/${item.id}`}>{item.name}</Link>}
                    description={
                      <div>
                        <div>
                          <Text delete className="text-gray-400">₹{item.originalPrice.toFixed(2)}</Text>
                          <Text strong className="text-red-500 ml-2">₹{item.salePrice.toFixed(2)}</Text>
                          <Tag color="red" className="ml-2">
                            {Math.round((1 - item.salePrice / item.originalPrice) * 100)}% OFF
                          </Tag>
                        </div>
                        <div>
                          <Text type="secondary">Qty: {item.quantity} • Expires: {new Date(item.expiry).toLocaleDateString()}</Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            <div className="text-center mt-4">
              <Button type="primary" icon={<PlusOutlined />}>
                Create Urgent Sale
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Notifications Section */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card 
            title="Recent Notifications" 
            loading={loading}
            extra={<Button type="link">Mark All as Read</Button>}
          >
            <List
              dataSource={notifications}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button 
                      type="link" 
                      size="small"
                      key="view"
                    >
                      View
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge dot={!item.read} offset={[0, 3]}>
                        <Avatar icon={getNotificationIcon(item.type)} />
                      </Badge>
                    }
                    title={
                      <Text strong={!item.read}>{item.message}</Text>
                    }
                    description={<Text type="secondary">{item.time}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VegetableSellerDashboard; 