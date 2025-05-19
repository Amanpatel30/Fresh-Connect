import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Tag, Tabs, Timeline, Steps, Modal, Divider, Rate, Input, Empty, Badge, Avatar, Spin } from 'antd';
import { 
  ShoppingOutlined, CheckCircleOutlined, ClockCircleOutlined, 
  TruckOutlined, HomeOutlined, ReconciliationOutlined, 
  FileSearchOutlined, DownloadOutlined, StarOutlined, 
  MessageOutlined, SearchOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Step } = Steps;

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState({ visible: false, order: null });
  const [trackingModal, setTrackingModal] = useState({ visible: false, order: null });
  const [reviewModal, setReviewModal] = useState({ visible: false, order: null, item: null });
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);

  // Mock order status steps
  const orderSteps = {
    'pending': 0,
    'processing': 1,
    'shipped': 2,
    'delivered': 3,
    'cancelled': 0,
    'returned': 3,
  };

  useEffect(() => {
    // In a real app, this would be an API call
    // Simulating data fetch
    setTimeout(() => {
      const mockOrders = [
        {
          id: 'ORD-10025',
          date: '2023-06-15',
          total: 36.97,
          status: 'delivered',
          paymentMethod: 'Credit Card',
          items: [
            { id: 1, name: 'Fresh Tomatoes', price: 2.99, quantity: 2, image: 'https://via.placeholder.com/60x60?text=Tomatoes', seller: 'Green Farm', isReviewed: true, rating: 4 },
            { id: 2, name: 'Organic Potatoes', price: 3.99, quantity: 3, image: 'https://via.placeholder.com/60x60?text=Potatoes', seller: 'Nature\'s Harvest', isReviewed: true, rating: 5 },
            { id: 3, name: 'Lettuce', price: 0.99, quantity: 1, image: 'https://via.placeholder.com/60x60?text=Lettuce', seller: 'Quick Fresh', isReviewed: false }
          ],
          tracking: {
            number: 'TRK-789456',
            events: [
              { time: '2023-06-15 18:30', status: 'Delivered', description: 'Package was delivered to the recipient' },
              { time: '2023-06-15 12:15', status: 'Out for Delivery', description: 'Package is out for delivery' },
              { time: '2023-06-14 20:45', status: 'At Local Facility', description: 'Package arrived at local facility' },
              { time: '2023-06-13 14:20', status: 'In Transit', description: 'Package is in transit to the destination' },
              { time: '2023-06-12 09:00', status: 'Picked Up', description: 'Package was picked up' },
              { time: '2023-06-11 17:30', status: 'Shipping Label Created', description: 'Shipping label has been created' }
            ]
          }
        },
        {
          id: 'ORD-10024',
          date: '2023-06-10',
          total: 42.50,
          status: 'shipped',
          paymentMethod: 'UPI',
          items: [
            { id: 4, name: 'Carrots', price: 2.49, quantity: 2, image: 'https://via.placeholder.com/60x60?text=Carrots', seller: 'Organic Valley', isReviewed: false },
            { id: 5, name: 'Bell Peppers', price: 3.99, quantity: 3, image: 'https://via.placeholder.com/60x60?text=Peppers', seller: 'Fresh Harvest', isReviewed: false },
            { id: 6, name: 'Mushrooms', price: 4.99, quantity: 2, image: 'https://via.placeholder.com/60x60?text=Mushrooms', seller: 'Forest Farms', isReviewed: false }
          ],
          tracking: {
            number: 'TRK-456789',
            events: [
              { time: '2023-06-12 14:20', status: 'In Transit', description: 'Package is in transit to the destination' },
              { time: '2023-06-11 09:00', status: 'Picked Up', description: 'Package was picked up' },
              { time: '2023-06-10 17:30', status: 'Shipping Label Created', description: 'Shipping label has been created' }
            ]
          }
        },
        {
          id: 'ORD-10023',
          date: '2023-06-05',
          total: 25.99,
          status: 'processing',
          paymentMethod: 'Cash on Delivery',
          items: [
            { id: 7, name: 'Apples', price: 4.99, quantity: 2, image: 'https://via.placeholder.com/60x60?text=Apples', seller: 'Orchard Fresh', isReviewed: false },
            { id: 8, name: 'Bananas', price: 2.99, quantity: 3, image: 'https://via.placeholder.com/60x60?text=Bananas', seller: 'Tropical Fruits', isReviewed: false }
          ],
          tracking: {
            number: 'TRK-123456',
            events: [
              { time: '2023-06-06 09:00', status: 'Processing', description: 'Your order is being processed' },
              { time: '2023-06-05 17:30', status: 'Order Placed', description: 'Your order has been placed successfully' }
            ]
          }
        },
        {
          id: 'ORD-10022',
          date: '2023-05-28',
          total: 15.49,
          status: 'cancelled',
          paymentMethod: 'Credit Card',
          cancelReason: 'Items out of stock',
          items: [
            { id: 9, name: 'Spinach', price: 1.99, quantity: 2, image: 'https://via.placeholder.com/60x60?text=Spinach', seller: 'Local Gardens', isReviewed: false },
            { id: 10, name: 'Broccoli', price: 2.49, quantity: 1, image: 'https://via.placeholder.com/60x60?text=Broccoli', seller: 'Green Valley', isReviewed: false },
            { id: 11, name: 'Cucumbers', price: 1.99, quantity: 3, image: 'https://via.placeholder.com/60x60?text=Cucumbers', seller: 'Fresh Fields', isReviewed: false }
          ],
          tracking: {
            number: 'N/A',
            events: [
              { time: '2023-05-29 10:15', status: 'Cancelled', description: 'Order cancelled due to items being out of stock' },
              { time: '2023-05-28 17:30', status: 'Order Placed', description: 'Your order has been placed successfully' }
            ]
          }
        },
        {
          id: 'ORD-10021',
          date: '2023-05-20',
          total: 32.75,
          status: 'returned',
          paymentMethod: 'UPI',
          returnReason: 'Quality issues',
          items: [
            { id: 12, name: 'Onions', price: 1.49, quantity: 5, image: 'https://via.placeholder.com/60x60?text=Onions', seller: 'Farm Fresh', isReviewed: true, rating: 2 },
            { id: 13, name: 'Garlic', price: 0.99, quantity: 3, image: 'https://via.placeholder.com/60x60?text=Garlic', seller: 'Spice Garden', isReviewed: true, rating: 1 }
          ],
          tracking: {
            number: 'TRK-987654',
            events: [
              { time: '2023-05-25 14:20', status: 'Refund Processed', description: 'Refund has been processed for returned items' },
              { time: '2023-05-24 11:15', status: 'Return Received', description: 'Return package received at warehouse' },
              { time: '2023-05-23 16:40', status: 'Return in Transit', description: 'Return package is in transit' },
              { time: '2023-05-22 09:30', status: 'Return Initiated', description: 'Return request approved' },
              { time: '2023-05-21 18:45', status: 'Delivered', description: 'Package was delivered to the recipient' },
              { time: '2023-05-20 17:30', status: 'Order Placed', description: 'Your order has been placed successfully' }
            ]
          }
        }
      ];
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
      setLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = orders.filter(order => 
        order.id.toLowerCase().includes(searchText.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(searchText.toLowerCase())) ||
        order.status.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchText, orders]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const showOrderDetail = (order) => {
    setDetailModal({
      visible: true,
      order
    });
  };

  const showTrackingDetail = (order) => {
    setTrackingModal({
      visible: true,
      order
    });
  };

  const showReviewModal = (order, item) => {
    setReviewModal({
      visible: true,
      order,
      item
    });
    setRating(0);
    setReviewComment('');
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      message.error('Please select a rating');
      return;
    }

    setReviewLoading(true);
    
    try {
      // In a real app, this would be an API call to submit the review
      console.log('Review submitted:', {
        orderId: reviewModal.order.id,
        itemId: reviewModal.item.id,
        rating,
        comment: reviewComment
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the local state to mark the item as reviewed
      const updatedOrders = orders.map(order => {
        if (order.id === reviewModal.order.id) {
          const updatedItems = order.items.map(item => {
            if (item.id === reviewModal.item.id) {
              return { ...item, isReviewed: true, rating };
            }
            return item;
          });
          return { ...order, items: updatedItems };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
      message.success('Review submitted successfully!');
      setReviewModal({ visible: false, order: null, item: null });
    } catch (error) {
      message.error('Failed to submit review. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'pending':
        return <Tag icon={<ClockCircleOutlined />} color="default">Pending</Tag>;
      case 'processing':
        return <Tag icon={<ReconciliationOutlined />} color="processing">Processing</Tag>;
      case 'shipped':
        return <Tag icon={<TruckOutlined />} color="blue">Shipped</Tag>;
      case 'delivered':
        return <Tag icon={<CheckCircleOutlined />} color="success">Delivered</Tag>;
      case 'cancelled':
        return <Tag color="error">Cancelled</Tag>;
      case 'returned':
        return <Tag color="warning">Returned</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => (
        <Text>{new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</Text>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => <Text strong>₹{total.toFixed(2)}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div className="flex flex-col space-y-2">
          <Button type="link" onClick={() => showOrderDetail(record)}>View Details</Button>
          <Button 
            type="link" 
            onClick={() => showTrackingDetail(record)}
            disabled={record.status === 'pending' || record.status === 'cancelled'}
          >
            Track Order
          </Button>
        </div>
      ),
    },
  ];

  const renderOrderItems = (items, canReview = true) => (
    <div>
      {items.map((item, index) => (
        <div key={item.id} className={`flex items-center py-3 ${index < items.length - 1 ? 'border-b' : ''}`}>
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-12 h-12 object-cover rounded mr-4" 
          />
          <div className="flex-grow">
            <Text strong>{item.name}</Text>
            <div className="flex justify-between">
              <Text type="secondary">
                {item.quantity} x ₹{item.price.toFixed(2)}
              </Text>
              <Text>₹{(item.quantity * item.price).toFixed(2)}</Text>
            </div>
            <div className="mt-1">
              <Text type="secondary">Seller: {item.seller}</Text>
            </div>
            {canReview && (
              <div className="mt-2">
                {item.isReviewed ? (
                  <div className="flex items-center">
                    <Rate disabled defaultValue={item.rating} className="text-sm" />
                    <Text type="secondary" className="ml-2">Reviewed</Text>
                  </div>
                ) : (
                  <Button 
                    type="link" 
                    size="small" 
                    className="p-0"
                    onClick={() => showReviewModal(record, item)}
                    disabled={record.status !== 'delivered' && record.status !== 'returned'}
                  >
                    <StarOutlined className="mr-1" />
                    Write a Review
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTabs = () => (
    <Tabs defaultActiveKey="all">
      <TabPane tab="All Orders" key="all">
        <Table 
          columns={columns} 
          dataSource={filteredOrders} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </TabPane>
      <TabPane tab="Processing" key="processing">
        <Table 
          columns={columns} 
          dataSource={filteredOrders.filter(order => order.status === 'pending' || order.status === 'processing')} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </TabPane>
      <TabPane tab="Shipped" key="shipped">
        <Table 
          columns={columns} 
          dataSource={filteredOrders.filter(order => order.status === 'shipped')} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </TabPane>
      <TabPane tab="Delivered" key="delivered">
        <Table 
          columns={columns} 
          dataSource={filteredOrders.filter(order => order.status === 'delivered')} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </TabPane>
      <TabPane tab="Cancelled/Returned" key="cancelled">
        <Table 
          columns={columns} 
          dataSource={filteredOrders.filter(order => order.status === 'cancelled' || order.status === 'returned')} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </TabPane>
    </Tabs>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80vh">
        <Spin size="large" tip="Loading your orders..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Title level={2}>
        <ReconciliationOutlined className="mr-2" /> Order History
      </Title>
      <Text type="secondary" className="mb-6 block">
        View and manage your past orders
      </Text>

      <div className="mb-6">
        <Input.Search
          placeholder="Search orders by ID, product, or status"
          allowClear
          enterButton={<Button type="primary" icon={<SearchOutlined />}>Search</Button>}
          size="large"
          onSearch={handleSearch}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {filteredOrders.length === 0 ? (
        <Empty
          description={
            <span>
              {searchText ? 'No orders found matching your search' : 'You have no orders yet'}
            </span>
          }
        >
          <Link to="/">
            <Button type="primary">Shop Now</Button>
          </Link>
        </Empty>
      ) : (
        renderTabs()
      )}

      {/* Order Detail Modal */}
      <Modal
        title="Order Details"
        open={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, order: null })}
        footer={[
          <Button key="close" onClick={() => setDetailModal({ visible: false, order: null })}>
            Close
          </Button>,
          detailModal.order && (detailModal.order.status === 'shipped' || detailModal.order.status === 'processing') && (
            <Button 
              key="track" 
              type="primary" 
              onClick={() => {
                setDetailModal({ visible: false, order: null });
                showTrackingDetail(detailModal.order);
              }}
            >
              Track Order
            </Button>
          )
        ]}
        width={700}
      >
        {detailModal.order && (
          <>
            <div className="mb-4 flex justify-between items-center">
              <div>
                <Title level={4}>Order {detailModal.order.id}</Title>
                <Text type="secondary">
                  Placed on {new Date(detailModal.order.date).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                  })}
                </Text>
              </div>
              <div>{getStatusTag(detailModal.order.status)}</div>
            </div>

            <Divider />

            <div className="mb-4">
              <Title level={5}>Items</Title>
              {renderOrderItems(detailModal.order.items, false)}
            </div>

            <Divider />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Title level={5}>Payment Information</Title>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="mb-2">
                    <Text strong>Payment Method:</Text>
                    <Text className="ml-2">{detailModal.order.paymentMethod}</Text>
                  </div>
                  <div>
                    <Text strong>Total:</Text>
                    <Text className="ml-2">₹{detailModal.order.total.toFixed(2)}</Text>
                  </div>
                </div>
              </div>

              <div>
                <Title level={5}>Shipping Information</Title>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="mb-2">
                    <Text strong>Address:</Text>
                    <Text className="ml-2">123 Sample Street, City, State, 12345</Text>
                  </div>
                  <div>
                    <Text strong>Tracking Number:</Text>
                    <Text className="ml-2">
                      {detailModal.order.tracking.number !== 'N/A' 
                        ? detailModal.order.tracking.number 
                        : 'Not available'
                      }
                    </Text>
                  </div>
                </div>
              </div>
            </div>

            {(detailModal.order.status === 'cancelled' || detailModal.order.status === 'returned') && (
              <>
                <Divider />
                <div>
                  <Title level={5}>
                    {detailModal.order.status === 'cancelled' ? 'Cancellation' : 'Return'} Details
                  </Title>
                  <div className="bg-gray-50 p-3 rounded">
                    <Text strong>Reason:</Text>
                    <Text className="ml-2">
                      {detailModal.order.status === 'cancelled' 
                        ? detailModal.order.cancelReason 
                        : detailModal.order.returnReason
                      }
                    </Text>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </Modal>

      {/* Tracking Modal */}
      <Modal
        title="Track Order"
        open={trackingModal.visible}
        onCancel={() => setTrackingModal({ visible: false, order: null })}
        footer={[
          <Button key="close" onClick={() => setTrackingModal({ visible: false, order: null })}>
            Close
          </Button>
        ]}
        width={700}
      >
        {trackingModal.order && (
          <>
            <div className="mb-4">
              <Title level={4}>Order {trackingModal.order.id}</Title>
              <div className="flex items-center">
                <Text type="secondary" className="mr-2">Tracking Number:</Text>
                <Text copyable={trackingModal.order.tracking.number !== 'N/A'}>
                  {trackingModal.order.tracking.number}
                </Text>
              </div>
            </div>

            <div className="mb-6">
              <Steps 
                current={orderSteps[trackingModal.order.status]} 
                status={trackingModal.order.status === 'cancelled' ? 'error' : 'process'}
              >
                <Step title="Order Placed" icon={<ShoppingOutlined />} />
                <Step title="Processing" icon={<ReconciliationOutlined />} />
                <Step title="Shipped" icon={<TruckOutlined />} />
                <Step title="Delivered" icon={<HomeOutlined />} />
              </Steps>
            </div>

            <div className="mb-4">
              <Title level={5}>Tracking History</Title>
              <Timeline mode="left">
                {trackingModal.order.tracking.events.map((event, index) => (
                  <Timeline.Item 
                    key={index} 
                    color={index === 0 ? 'green' : 'blue'} 
                    label={event.time}
                  >
                    <div>
                      <Text strong>{event.status}</Text>
                      <div>
                        <Text type="secondary">{event.description}</Text>
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>

            <div className="flex justify-center mt-6">
              <Button type="default" icon={<DownloadOutlined />}>
                Download Invoice
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Review Modal */}
      <Modal
        title="Write a Review"
        open={reviewModal.visible}
        onCancel={() => setReviewModal({ visible: false, order: null, item: null })}
        footer={[
          <Button key="cancel" onClick={() => setReviewModal({ visible: false, order: null, item: null })}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleSubmitReview}
            loading={reviewLoading}
            disabled={rating === 0}
          >
            Submit Review
          </Button>
        ]}
      >
        {reviewModal.item && (
          <div>
            <div className="flex items-center mb-4">
              <img 
                src={reviewModal.item.image} 
                alt={reviewModal.item.name} 
                className="w-16 h-16 object-cover rounded mr-4" 
              />
              <div>
                <Text strong>{reviewModal.item.name}</Text>
                <div className="mt-1">
                  <Text type="secondary">Seller: {reviewModal.item.seller}</Text>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-2">
                <Text strong>Rate this product:</Text>
              </div>
              <Rate 
                value={rating} 
                onChange={setRating} 
                className="text-2xl"
              />
              <div className="mt-2">
                <Text type="secondary">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Average'}
                  {rating === 4 && 'Good'}
                  {rating === 5 && 'Excellent'}
                </Text>
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-2">
                <Text strong>Your Review (Optional):</Text>
              </div>
              <TextArea 
                rows={4} 
                placeholder="Share your experience with this product..." 
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                maxLength={500}
                showCount
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderHistory; 