import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Tag, Tabs, Timeline, Steps, Modal, Divider, Rate, Input, Empty, Badge, Avatar, Spin, Alert, message } from 'antd';
import { 
  ShoppingOutlined, CheckCircleOutlined, ClockCircleOutlined, 
  TruckOutlined, HomeOutlined, ReconciliationOutlined, 
  FileSearchOutlined, DownloadOutlined, StarOutlined, 
  MessageOutlined, SearchOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getUserOrders } from '../../services/userService';

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
  const [error, setError] = useState(null);

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
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getUserOrders();
        
        if (response.success && response.data) {
          console.log('Orders fetched successfully:', response.data);
          
          // Transform data to match component's expected format if necessary
          const formattedOrders = response.data.map(order => ({
            id: order._id,
            date: order.createdAt,
            total: order.totalAmount,
            status: order.status,
            paymentMethod: order.paymentMethod,
            items: order.items.map(item => ({
              id: item._id,
              name: item.name || (item.product && item.product.name) || 'Product',
              price: item.price || (item.product && item.product.price) || 0,
              quantity: item.quantity || 1,
              image: item.product && item.product.images && item.product.images[0] 
                ? item.product.images[0] 
                : 'https://via.placeholder.com/60x60?text=Product',
              seller: item.seller || 'Store',
              isReviewed: item.isReviewed || false,
              rating: item.rating || 0
            })),
            tracking: order.tracking || {
              number: order.trackingNumber || 'N/A',
              events: order.trackingEvents || [
                { time: order.createdAt, status: 'Order Placed', description: 'Your order has been placed successfully' }
              ]
            }
          }));
          
          setOrders(formattedOrders);
          setFilteredOrders(formattedOrders);
        } else {
          console.error('Failed to fetch orders:', response.error);
          setError(response.error || 'Failed to fetch orders. Please try again later.');
          
          // If in development mode, set mock data for testing
          if (process.env.NODE_ENV === 'development') {
            const mockOrders = [
              // Include your mock data here
            ];
            setOrders(mockOrders);
            setFilteredOrders(mockOrders);
          }
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
      setLoading(false);
      }
    };

    fetchOrders();
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
      render: (total) => <Text strong>${total.toFixed(2)}</Text>,
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

      {error && (
        <div className="mb-6">
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        </div>
      )}

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
          ),
          detailModal.order && detailModal.order.status === 'delivered' && (
            <Button 
              key="review" 
              type="primary" 
              icon={<StarOutlined />}
              onClick={() => {
                setDetailModal({ visible: false, order: null });
                // Navigate to the reviews page
                window.location.href = '/profile?tab=reviews';
              }}
            >
              Write Reviews
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
                    <Text className="ml-2">${detailModal.order.total.toFixed(2)}</Text>
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