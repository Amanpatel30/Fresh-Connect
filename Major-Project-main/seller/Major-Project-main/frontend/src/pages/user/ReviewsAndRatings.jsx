import React, { useState, useEffect } from 'react';
import {
  Card, Tabs, Tab, Typography, List, ListItem, Rating, Avatar, Button, Stack,
  Chip, TextField, Modal, Box, CircularProgress, Divider,
  Tooltip, Pagination, Select, Badge, MenuItem, FormControl, FormLabel
} from '@mui/material';
import {
  Star, Edit, Delete, ThumbUp,
  ThumbDown, Message, ShoppingBag,
  FilterList, Sort, CheckCircle
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = TextField;
const { Option } = Select;

const ReviewsAndRatings = () => {
  const [loading, setLoading] = useState(true);
  const [myReviews, setMyReviews] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [filterValue, setFilterValue] = useState('all');
  const [sortValue, setSortValue] = useState('recent');
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState({});

  useEffect(() => {
    // Simulating API call to fetch reviews data
    setTimeout(() => {
      // Mock reviews data
      const mockMyReviews = [
        {
          id: 1,
          productId: 101,
          productName: 'Fresh Tomatoes',
          productImage: 'https://via.placeholder.com/80x80',
          seller: 'Fresh Veggies Store',
          rating: 4,
          comment: 'Very fresh and juicy tomatoes. Will buy again!',
          date: '2023-06-10T14:30:00',
          likes: 5,
          verified: true,
          orderId: 'ORD-1230'
        },
        {
          id: 2,
          productId: 102,
          productName: 'Organic Potatoes',
          productImage: 'https://via.placeholder.com/80x80',
          seller: 'Organic Farms',
          rating: 5,
          comment: 'Excellent quality potatoes. Perfect for cooking.',
          date: '2023-06-05T10:15:00',
          likes: 3,
          verified: true,
          orderId: 'ORD-1225'
        },
        {
          id: 3,
          productId: 103,
          productName: 'Green Spinach',
          productImage: 'https://via.placeholder.com/80x80',
          seller: 'Green Gardens',
          rating: 3,
          comment: 'Good quality but some leaves were wilted.',
          date: '2023-05-28T16:45:00',
          likes: 1,
          verified: true,
          orderId: 'ORD-1220'
        }
      ];

      const mockPendingReviews = [
        {
          id: 4,
          productId: 104,
          productName: 'Carrots',
          productImage: 'https://via.placeholder.com/80x80',
          seller: 'Fresh Veggies Store',
          orderId: 'ORD-1235',
          orderDate: '2023-06-12T09:20:00'
        },
        {
          id: 5,
          productId: 105,
          productName: 'Onions',
          productImage: 'https://via.placeholder.com/80x80',
          seller: 'Local Farms',
          orderId: 'ORD-1235',
          orderDate: '2023-06-12T09:20:00'
        }
      ];

      setMyReviews(mockMyReviews);
      setPendingReviews(mockPendingReviews);
      setLoading(false);
    }, 1500);
  }, []);

  const handleEditReview = (review) => {
    setSelectedReview(review);
    form.setFieldsValue({
      rating: review.rating,
      comment: review.comment
    });
    setEditModalVisible(true);
  };

  const handleDeleteReview = (reviewId) => {
    // Filter out the review with the given ID
    setMyReviews(myReviews.filter(review => review.id !== reviewId));
    console.log('Review deleted successfully');
  };

  const handleSubmitEdit = (values) => {
    // Update the review in the myReviews array
    setMyReviews(myReviews.map(review => 
      review.id === selectedReview.id 
      ? { ...review, rating: values.rating, comment: values.comment }
      : review
    ));
    setEditModalVisible(false);
    console.log('Review updated successfully');
  };

  const handleAddReview = (product) => {
    setSelectedReview(product);
    form.resetFields();
    setEditModalVisible(true);
  };

  const handleSubmitNewReview = (values) => {
    // Simulating API call to add new review
    const newReview = {
      id: Date.now(),
      productId: selectedReview.productId,
      productName: selectedReview.productName,
      productImage: selectedReview.productImage,
      seller: selectedReview.seller,
      rating: values.rating,
      comment: values.comment,
      date: new Date().toISOString(),
      likes: 0,
      verified: true,
      orderId: selectedReview.orderId
    };

    setMyReviews([newReview, ...myReviews]);
    setPendingReviews(pendingReviews.filter(item => item.id !== selectedReview.id));
    setEditModalVisible(false);
    console.log('Review submitted successfully');
  };

  const handleFilterChange = (value) => {
    setFilterValue(value);
    // In a real app, this would filter the reviews based on the selected value
  };

  const handleSortChange = (value) => {
    setSortValue(value);
    // In a real app, this would sort the reviews based on the selected value
  };

  const filteredReviews = () => {
    // In a real app, this would filter and sort the reviews based on the selected values
    return myReviews;
  };

  const renderReviewItem = (item) => (
    <List.Item
      key={item.id}
      actions={[
        <Tooltip title="Edit Review">
          <Button
            icon={<Edit />}
            onClick={() => handleEditReview(item)}
            size="small"
          />
        </Tooltip>,
        <Tooltip title="Delete Review">
          <Button
            icon={<Delete />}
            onClick={() => handleDeleteReview(item.id)}
            size="small"
            danger
          />
        </Tooltip>
      ]}
    >
      <List.Item.Meta
        avatar={
          <Avatar src={item.productImage} size={64} shape="square" />
        }
        title={
          <Space>
            <Link to={`/product/${item.productId}`}>{item.productName}</Link>
            {item.verified && (
              <Chip label="Verified Purchase" color="success" icon={<CheckCircle />} />
            )}
          </Space>
        }
        description={
          <div>
            <Space direction="vertical" size={2}>
              <Rating
                name="read-only"
                value={item.rating}
                readOnly
              />
              <Text type="secondary">Seller: {item.seller}</Text>
              <Text type="secondary">
                Reviewed on {new Date(item.date).toLocaleDateString()}
              </Text>
            </Space>
          </div>
        }
      />
      <div>
        <Paragraph>{item.comment}</Paragraph>
        <Space>
          <Button size="small" icon={<ThumbUp />}>
            {item.likes}
          </Button>
          <Link to={`/user/orders/${item.orderId}`}>
            <Button size="small" icon={<ShoppingBag />}>
              View Order
            </Button>
          </Link>
        </Space>
      </div>
    </List.Item>
  );

  const renderPendingReviewItem = (item) => (
    <List.Item
      key={item.id}
      actions={[
        <Button
          type="primary"
          onClick={() => handleAddReview(item)}
        >
          Write Review
        </Button>
      ]}
    >
      <List.Item.Meta
        avatar={
          <Avatar src={item.productImage} size={64} shape="square" />
        }
        title={<Link to={`/product/${item.productId}`}>{item.productName}</Link>}
        description={
          <div>
            <Text type="secondary">Seller: {item.seller}</Text>
            <br />
            <Text type="secondary">
              Ordered on {new Date(item.orderDate).toLocaleDateString()}
            </Text>
            <br />
            <Text type="secondary">Order ID: {item.orderId}</Text>
          </div>
        }
      />
    </List.Item>
  );

  return (
    <div className="container mx-auto p-4">
      <Title level={2}>My Reviews & Ratings</Title>
      <Text type="secondary" className="mb-6 block">
        Manage your product reviews and see your rating history
      </Text>

      <Tabs defaultActiveKey="myReviews">
        <TabPane
          tab={
            <span>
              <Star />
              My Reviews
            </span>
          }
          key="myReviews"
        >
          <Card>
            <div className="flex justify-between mb-4">
              <Space>
                <Select
                  defaultValue="all"
                  style={{ width: 120 }}
                  onChange={handleFilterChange}
                  placeholder="Filter by"
                  prefix={<FilterList />}
                >
                  <Option value="all">All Ratings</Option>
                  <Option value="5">5 Stars</Option>
                  <Option value="4">4 Stars</Option>
                  <Option value="3">3 Stars</Option>
                  <Option value="2">2 Stars</Option>
                  <Option value="1">1 Star</Option>
                </Select>
                <Select
                  defaultValue="recent"
                  style={{ width: 140 }}
                  onChange={handleSortChange}
                  placeholder="Sort by"
                  prefix={<Sort />}
                >
                  <Option value="recent">Most Recent</Option>
                  <Option value="oldest">Oldest First</Option>
                  <Option value="highest">Highest Rated</Option>
                  <Option value="lowest">Lowest Rated</Option>
                </Select>
              </Space>
              <Text>
                Total Reviews: <Badge count={myReviews.length} style={{ backgroundColor: '#52c41a' }} />
              </Text>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <CircularProgress size={24} />
              </div>
            ) : myReviews.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={filteredReviews()}
                renderItem={renderReviewItem}
                pagination={{
                  pageSize: 5,
                  total: filteredReviews().length,
                  showTotal: (total) => `Total ${total} reviews`
                }}
              />
            ) : (
              <Empty
                description="You haven't written any reviews yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <Message />
              Pending Reviews
              {pendingReviews.length > 0 && (
                <Badge count={pendingReviews.length} style={{ marginLeft: 8 }} />
              )}
            </span>
          }
          key="pendingReviews"
        >
          <Card>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <CircularProgress size={24} />
              </div>
            ) : pendingReviews.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={pendingReviews}
                renderItem={renderPendingReviewItem}
                pagination={{
                  pageSize: 5,
                  total: pendingReviews.length,
                  showTotal: (total) => `Total ${total} pending reviews`
                }}
              />
            ) : (
              <Empty
                description="No pending reviews"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={selectedReview && selectedReview.id ? "Edit Review" : "Write Review"}
        open={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        footer={null}
      >
        {selectedReview && (
          <div className="mb-4">
            <div className="flex items-center">
              <Avatar src={selectedReview.productImage} size={64} shape="square" className="mr-4" />
              <div>
                <Text strong>{selectedReview.productName}</Text>
                <br />
                <Text type="secondary">Seller: {selectedReview.seller}</Text>
              </div>
            </div>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={selectedReview && selectedReview.id ? handleSubmitEdit : handleSubmitNewReview}
        >
          <Form.Item
            name="rating"
            label="Rating"
            rules={[{ required: true, message: 'Please rate this product' }]}
          >
            <Rating
              name="simple-controlled"
              value={selectedReview?.rating}
              onChange={(event, newValue) => {
                form.setFieldValue('rating', newValue);
              }}
            />
          </Form.Item>
          <Form.Item
            name="comment"
            label="Review"
            rules={[{ required: true, message: 'Please write your review' }]}
          >
            <TextArea
              rows={4}
              placeholder="Share your experience with this product"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {selectedReview && selectedReview.id ? "Update Review" : "Submit Review"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReviewsAndRatings; 