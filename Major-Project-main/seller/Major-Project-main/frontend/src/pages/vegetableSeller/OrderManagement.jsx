import React, { useState, useEffect } from 'react';
import {
  Table, Card, Typography, Tag, Space, Button, Drawer, Steps,
  Row, Col, Statistic, Timeline, Input, Form, Modal, Select,
  Badge, Tooltip, message, Dropdown
} from 'antd';
import {
  ShoppingCartOutlined, UserOutlined, ClockCircleOutlined,
  CheckCircleOutlined, TruckOutlined, StopOutlined,
  DownOutlined, FilterOutlined, SearchOutlined,
  PrinterOutlined, MailOutlined, PhoneOutlined,
  EnvironmentOutlined, DollarOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [updateStatusModal, setUpdateStatusModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // Simulating API call to fetch orders
    setTimeout(() => {
      const mockOrders = [
        {
          id: 'ORD-1234',
          customer: {
            name: 'John Doe',
            phone: '+91 98765 43210',
            email: 'john@example.com',
            address: '123 Main St, City, State, 400001'
          },
          items: [
            {
              id: 1,
              name: 'Fresh Tomatoes',
              quantity: 5,
              unit: 'kg',
              price: 40.00,
              total: 200.00
            },
            {
              id: 2,
              name: 'Organic Potatoes',
              quantity: 3,
              unit: 'kg',
              price: 35.00,
              total: 105.00
            }
          ],
          status: 'processing',
          paymentStatus: 'paid',
          paymentMethod: 'online',
          subtotal: 305.00,
          deliveryFee: 50.00,
          total: 355.00,
          orderDate: '2023-06-15 14:30:00',
          deliveryDate: '2023-06-16',
          notes: 'Please deliver in the morning',
          timeline: [
            {
              status: 'placed',
              time: '2023-06-15 14:30:00',
              description: 'Order placed by customer'
            },
            {
              status: 'confirmed',
              time: '2023-06-15 14:35:00',
              description: 'Order confirmed by seller'
            },
            {
              status: 'processing',
              time: '2023-06-15 15:00:00',
              description: 'Order is being processed'
            }
          ]
        },
        // Add more mock orders as needed
      ];
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'default', icon: <ClockCircleOutlined /> },
      confirmed: { color: 'processing', icon: <CheckCircleOutlined /> },
      processing: { color: 'processing', icon: <ClockCircleOutlined /> },
      shipped: { color: 'blue', icon: <TruckOutlined /> },
      delivered: { color: 'success', icon: <CheckCircleOutlined /> },
      cancelled: { color: 'error', icon: <StopOutlined /> }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Tag color={config.color} icon={config.icon}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Tag>
    );
  };

  const getPaymentStatusTag = (status) => {
    const statusConfig = {
      paid: { color: 'success', icon: <CheckCircleOutlined /> },
      pending: { color: 'warning', icon: <ClockCircleOutlined /> },
      failed: { color: 'error', icon: <ExclamationCircleOutlined /> }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Tag color={config.color} icon={config.icon}>
        {status.toUpperCase()}
      </Tag>
    );
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setDrawerVisible(true);
  };

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    form.setFieldsValue({ status: order.status });
    setUpdateStatusModal(true);
  };

  const handleStatusUpdate = async (values) => {
    try {
      // Simulating API call to update order status
      const updatedOrders = orders.map(order =>
        order.id === selectedOrder.id
          ? {
              ...order,
              status: values.status,
              timeline: [
                ...order.timeline,
                {
                  status: values.status,
                  time: new Date().toISOString(),
                  description: values.notes || `Order status updated to ${values.status}`
                }
              ]
            }
          : order
      );
      setOrders(updatedOrders);
      message.success('Order status updated successfully');
      setUpdateStatusModal(false);
    } catch (error) {
      message.error('Failed to update order status');
    }
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Link to={`/seller/orders/${id}`}>{id}</Link>
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer) => (
        <Space direction="vertical" size={0}>
          <Text strong>{customer.name}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <PhoneOutlined className="mr-1" /> {customer.phone}
          </Text>
        </Space>
      )
    },
    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => new Date(date).toLocaleString()
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => <Text strong>₹{total.toFixed(2)}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => getPaymentStatusTag(status)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<SearchOutlined />}
              onClick={() => handleViewOrder(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Update Status">
            <Button
              icon={<ClockCircleOutlined />}
              onClick={() => handleUpdateStatus(record)}
              size="small"
              type="primary"
              ghost
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'print',
                  icon: <PrinterOutlined />,
                  label: 'Print Invoice'
                },
                {
                  key: 'email',
                  icon: <MailOutlined />,
                  label: 'Email Customer'
                }
              ]
            }}
          >
            <Button size="small" icon={<DownOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ];

  const getOrderStatusStep = (status) => {
    const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    return statusSteps.indexOf(status);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>Order Management</Title>
            <Text type="secondary">View and manage your orders</Text>
          </Col>
          <Col>
            <Space>
              <Button icon={<FilterOutlined />}>Filter</Button>
              <Button icon={<PrinterOutlined />}>Print List</Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            total: orders.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} orders`
          }}
        />
      </Card>

      <Drawer
        title="Order Details"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        width={600}
      >
        {selectedOrder && (
          <div>
            <Card className="mb-4">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Order Total"
                    value={selectedOrder.total}
                    prefix="₹"
                    precision={2}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Items"
                    value={selectedOrder.items.length}
                    suffix="products"
                  />
                </Col>
              </Row>
            </Card>

            <Card className="mb-4" title="Order Status">
              <Steps
                current={getOrderStatusStep(selectedOrder.status)}
                size="small"
                className="mb-4"
              >
                <Step title="Pending" />
                <Step title="Confirmed" />
                <Step title="Processing" />
                <Step title="Shipped" />
                <Step title="Delivered" />
              </Steps>
              <Timeline>
                {selectedOrder.timeline.map((event, index) => (
                  <Timeline.Item key={index}>
                    <Text strong>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Text>
                    <br />
                    <Text type="secondary">
                      {new Date(event.time).toLocaleString()}
                    </Text>
                    <br />
                    <Text>{event.description}</Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>

            <Card className="mb-4" title="Customer Information">
              <Space direction="vertical">
                <Text>
                  <UserOutlined className="mr-2" />
                  {selectedOrder.customer.name}
                </Text>
                <Text>
                  <PhoneOutlined className="mr-2" />
                  {selectedOrder.customer.phone}
                </Text>
                <Text>
                  <MailOutlined className="mr-2" />
                  {selectedOrder.customer.email}
                </Text>
                <Text>
                  <EnvironmentOutlined className="mr-2" />
                  {selectedOrder.customer.address}
                </Text>
              </Space>
            </Card>

            <Card className="mb-4" title="Order Items">
              <Table
                dataSource={selectedOrder.items}
                pagination={false}
                rowKey="id"
                columns={[
                  {
                    title: 'Item',
                    dataIndex: 'name',
                    key: 'name'
                  },
                  {
                    title: 'Quantity',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    render: (qty, record) => `${qty} ${record.unit}`
                  },
                  {
                    title: 'Price',
                    dataIndex: 'price',
                    key: 'price',
                    render: (price) => `₹${price.toFixed(2)}`
                  },
                  {
                    title: 'Total',
                    dataIndex: 'total',
                    key: 'total',
                    render: (total) => `₹${total.toFixed(2)}`
                  }
                ]}
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row>
                      <Table.Summary.Cell colSpan={3}>Subtotal</Table.Summary.Cell>
                      <Table.Summary.Cell>
                        ₹{selectedOrder.subtotal.toFixed(2)}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell colSpan={3}>Delivery Fee</Table.Summary.Cell>
                      <Table.Summary.Cell>
                        ₹{selectedOrder.deliveryFee.toFixed(2)}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell colSpan={3}>
                        <Text strong>Total</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell>
                        <Text strong>₹{selectedOrder.total.toFixed(2)}</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </Card>

            <Card title="Additional Information">
              <Space direction="vertical">
                <div>
                  <Text type="secondary">Payment Method:</Text>
                  <br />
                  <Text>{selectedOrder.paymentMethod.toUpperCase()}</Text>
                </div>
                <div>
                  <Text type="secondary">Payment Status:</Text>
                  <br />
                  {getPaymentStatusTag(selectedOrder.paymentStatus)}
                </div>
                <div>
                  <Text type="secondary">Delivery Date:</Text>
                  <br />
                  <Text>{new Date(selectedOrder.deliveryDate).toLocaleDateString()}</Text>
                </div>
                {selectedOrder.notes && (
                  <div>
                    <Text type="secondary">Notes:</Text>
                    <br />
                    <Text>{selectedOrder.notes}</Text>
                  </div>
                )}
              </Space>
            </Card>

            <div className="mt-4">
              <Space>
                <Button
                  type="primary"
                  onClick={() => handleUpdateStatus(selectedOrder)}
                >
                  Update Status
                </Button>
                <Button icon={<PrinterOutlined />}>Print Invoice</Button>
              </Space>
            </div>
          </div>
        )}
      </Drawer>

      <Modal
        title="Update Order Status"
        visible={updateStatusModal}
        onCancel={() => setUpdateStatusModal(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleStatusUpdate}
        >
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Option value="pending">Pending</Option>
              <Option value="confirmed">Confirmed</Option>
              <Option value="processing">Processing</Option>
              <Option value="shipped">Shipped</Option>
              <Option value="delivered">Delivered</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea rows={4} placeholder="Add notes about this status update" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update Status
              </Button>
              <Button onClick={() => setUpdateStatusModal(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderManagement; 