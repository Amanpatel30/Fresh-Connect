import React, { useState, useEffect } from 'react';
import {
  Card, Typography, Tabs, List, Rate, Avatar, Tag, Empty, 
  Button, Space, Select, Input, Divider, Spin, Modal, Form,
  Badge, message
} from 'antd';
import {
  StarOutlined, DeleteOutlined, EditOutlined, FilterOutlined,
  SortAscendingOutlined, LikeOutlined, ShoppingOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import reviewService from '../../services/reviewService';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const ReviewsAndRatings = () => {
  const [loading, setLoading] = useState(true);
  const [myReviews, setMyReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('recent');
  const [form] = Form.useForm();
  const [pendingReviews, setPendingReviews] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  useEffect(() => {
    // Fetch reviews from API
    fetchReviews();
    fetchPendingReviews();
  }, []);

  useEffect(() => {
    // Apply filters and sorting
    let filtered = [...myReviews];
    
    // Apply rating filter
    if (filter !== 'all') {
      filtered = filtered.filter(review => review.rating === parseInt(filter));
    }
    
    // Apply sorting
    if (sort === 'recent') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sort === 'oldest') {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sort === 'highest') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'lowest') {
      filtered.sort((a, b) => a.rating - b.rating);
    }
    
    setFilteredReviews(filtered);
  }, [myReviews, filter, sort]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewService.getUserReviews();
      
      if (response && response.data && Array.isArray(response.data)) {
        setMyReviews(response.data);
        setFilteredReviews(response.data);
        console.log('Reviews loaded successfully:', response.data);
      } else {
        console.error('Invalid reviews response format:', response);
        // Use mock data in development or if response format is incorrect
        if (process.env.NODE_ENV === 'development') {
          const mockReviews = [
            {
              id: 1,
              productId: 'P001',
              productName: 'Fresh Organic Vegetables Mix',
              productImage: 'https://via.placeholder.com/80',
              rating: 5,
              comment: 'Excellent quality vegetables! Very fresh and delivered promptly.',
              date: '2023-06-10',
              likes: 3,
              seller: 'Organic Farms',
              orderId: 'ORD-10025'
            },
            {
              id: 2,
              productId: 'P002',
              productName: 'Premium Basmati Rice (5kg)',
              productImage: 'https://via.placeholder.com/80',
              rating: 4,
              comment: 'Good quality rice, but packaging could be better.',
              date: '2023-05-20',
              likes: 1,
              seller: 'Grain Bazaar',
              orderId: 'ORD-10024'
            },
            {
              id: 3,
              productId: 'P003',
              productName: 'Assorted Fruits Basket',
              productImage: 'https://via.placeholder.com/80',
              rating: 3,
              comment: 'The fruits were okay, but some were not as fresh as expected.',
              date: '2023-05-15',
              likes: 0,
              seller: 'Fresh Fruits Co.',
              orderId: 'ORD-10023'
            },
            {
              id: 4,
              productId: 'P004',
              productName: 'Organic Honey (500g)',
              productImage: 'https://via.placeholder.com/80',
              rating: 5,
              comment: 'Pure and delicious honey! Will definitely buy again.',
              date: '2023-05-05',
              likes: 7,
              seller: 'Nature\'s Bounty',
              orderId: 'ORD-10022'
            }
          ];
          setMyReviews(mockReviews);
          setFilteredReviews(mockReviews);
        } else {
          message.error('Failed to load reviews. Please try again later.');
          setMyReviews([]);
          setFilteredReviews([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      message.error('Failed to load reviews. Please try again later.');
      // Use mock data in development
      if (process.env.NODE_ENV === 'development') {
        setMyReviews([]);
        setFilteredReviews([]);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPendingReviews = async () => {
    setPendingLoading(true);
    try {
      const response = await reviewService.getPendingReviewProducts();
      
      if (response && response.success && response.data) {
        setPendingReviews(response.data);
        console.log('Pending reviews loaded successfully:', response.data);
      } else {
        console.error('Invalid pending reviews response:', response);
        setPendingReviews([]);
      }
    } catch (error) {
      console.error('Failed to fetch pending reviews:', error);
      setPendingReviews([]);
    } finally {
      setPendingLoading(false);
    }
  };

  const handleFilterChange = (value) => {
    setFilter(value);
  };

  const handleSortChange = (value) => {
    setSort(value);
  };

  const showEditModal = (review) => {
    setCurrentReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditModalVisible(true);
  };

  const handleEditReview = async () => {
    if (!currentReview) return;
    
    try {
      const response = await reviewService.updateReview(currentReview.id, {
        rating: editRating,
        comment: editComment
      });
      
      if (response && response.success) {
        // Update local state with the edited review
        const updatedReviews = myReviews.map(review => {
          if (review.id === currentReview.id) {
            return {
              ...review,
              rating: editRating,
              comment: editComment
            };
          }
          return review;
        });
        
        setMyReviews(updatedReviews);
        message.success('Review updated successfully');
      } else {
        message.error('Failed to update review. Please try again.');
      }
      
      setEditModalVisible(false);
    } catch (error) {
      console.error('Failed to update review:', error);
      message.error('Failed to update review. Please try again.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const response = await reviewService.deleteReview(reviewId);
      
      if (response && response.success) {
        // Update local state by removing the deleted review
        const updatedReviews = myReviews.filter(review => review.id !== reviewId);
        setMyReviews(updatedReviews);
        message.success('Review deleted successfully');
      } else {
        message.error('Failed to delete review. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
      message.error('Failed to delete review. Please try again.');
    }
  };

  const handleSubmitReview = async (productId, rating, comment) => {
    try {
      const reviewData = {
        productId,
        rating,
        comment
      };
      
      const response = await reviewService.submitReview(reviewData);
      
      if (response && response.success) {
        // Refresh both review lists
        fetchReviews();
        fetchPendingReviews();
        message.success('Review submitted successfully');
      } else {
        message.error('Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      message.error('Failed to submit review. Please try again.');
    }
  };

  const renderReviewItem = (review) => (
    <List.Item
      key={review.id}
      actions={[
        <Space>
          <Button
            icon={<EditOutlined />} 
            size="small"
            onClick={() => showEditModal(review)}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />} 
            size="small"
            danger
            onClick={() => handleDeleteReview(review.id)}
          >
            Delete
          </Button>
        </Space>
      ]}
    >
      <List.Item.Meta
        avatar={
          <Avatar 
            src={review.productImage} 
            size={64} 
            shape="square"
          />
        }
        title={
          <Space direction="vertical" size={0}>
            <Text strong>{review.productName}</Text>
            <Rate disabled defaultValue={review.rating} />
          </Space>
        }
        description={
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text>{review.comment}</Text>
            <Space split={<Divider type="vertical" />}>
              <Text type="secondary">Order: {review.orderId}</Text>
              <Text type="secondary">Seller: {review.seller}</Text>
              <Text type="secondary">Posted on: {new Date(review.date).toLocaleDateString()}</Text>
              <Space>
                <LikeOutlined /> <Text>{review.likes}</Text>
              </Space>
            </Space>
          </Space>
        }
      />
    </List.Item>
  );

  const renderPendingReviewItem = (product) => (
    <List.Item
      key={product.id}
      actions={[
        <Button
          type="primary"
          icon={<StarOutlined />}
          onClick={() => {
            setCurrentReview({
              id: null,
              productId: product.id,
              productName: product.name
            });
            setEditRating(0);
            setEditComment('');
            setEditModalVisible(true);
          }}
        >
          Write Review
        </Button>
      ]}
    >
      <List.Item.Meta
        avatar={
          <Avatar 
            src={product.image || 'https://via.placeholder.com/80'} 
            size={64} 
            shape="square"
          />
        }
        title={<Text strong>{product.name}</Text>}
        description={
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text type="secondary">
              Purchased on: {new Date(product.purchaseDate).toLocaleDateString()}
            </Text>
            <Text type="secondary">Order ID: {product.orderId}</Text>
          </Space>
        }
      />
    </List.Item>
  );

  const renderReviewStats = () => {
    const totalReviews = myReviews.length;
    const avgRating = totalReviews > 0 
      ? (myReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1) 
      : 0;
    
    const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: myReviews.filter(review => review.rating === rating).length,
      percentage: totalReviews > 0 
        ? Math.round((myReviews.filter(review => review.rating === rating).length / totalReviews) * 100) 
        : 0
    }));
    
    return (
      <Card className="mb-4">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 text-center mb-4 md:mb-0">
            <Title level={1}>{avgRating}</Title>
            <Rate disabled allowHalf value={parseFloat(avgRating)} />
            <div className="mt-2">
              <Text>Based on {totalReviews} reviews</Text>
            </div>
          </div>
          
          <div className="md:w-2/3">
            {ratingCounts.map(item => (
              <div key={item.rating} className="flex items-center mb-2">
                <div className="w-16">
                  <Text>{item.rating} stars</Text>
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
                    <div 
                      className="bg-yellow-400 h-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-right">
                  <Text>{item.count} ({item.percentage}%)</Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80vh">
        <Spin size="large" tip="Loading your reviews..." />
      </div>
    );
  }

  return (
    <div className="reviews-container">
      <Title level={2}>
        <StarOutlined className="mr-2" /> My Reviews & Ratings
      </Title>
      <Paragraph className="mb-4">
        Manage your product reviews and see your rating history
      </Paragraph>

      <Tabs defaultActiveKey="myReviews">
        <TabPane
          tab={
            <span>
              <StarOutlined />
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

            {renderReviewStats()}
            
            {filteredReviews.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={filteredReviews}
                renderItem={renderReviewItem}
                pagination={{
                  pageSize: 5,
                  hideOnSinglePage: true
                }}
              />
            ) : (
              <Empty
                description="No reviews found" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <ShoppingOutlined />
              Products to Review
            </span>
          }
          key="toReview"
        >
          <Card>
            {pendingLoading ? (
              <div className="text-center p-6">
                <Spin tip="Loading products..." />
              </div>
            ) : pendingReviews.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={pendingReviews}
                renderItem={renderPendingReviewItem}
                pagination={{
                  pageSize: 5,
                  hideOnSinglePage: true
                }}
              />
            ) : (
              <Empty
                description="You don't have any products to review at the moment" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </TabPane>
      </Tabs>

      {/* Edit/Create Review Modal */}
      <Modal
        title={currentReview && currentReview.id ? "Edit Your Review" : "Write a Review"}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={currentReview && currentReview.id 
              ? handleEditReview 
              : () => handleSubmitReview(currentReview.productId, editRating, editComment)
            }
            disabled={editRating === 0}
          >
            {currentReview && currentReview.id ? "Save Changes" : "Submit Review"}
          </Button>
        ]}
      >
        {currentReview && (
          <Form layout="vertical">
            <div className="mb-4">
              <Text strong>Product: {currentReview.productName}</Text>
            </div>
            
            <Form.Item label="Your Rating">
              <Rate 
                value={editRating} 
                onChange={setEditRating} 
              />
              {editRating > 0 && (
                <Text className="ml-2">
                  {editRating === 1 && "Poor"}
                  {editRating === 2 && "Fair"}
                  {editRating === 3 && "Average"}
                  {editRating === 4 && "Good"}
                  {editRating === 5 && "Excellent"}
                </Text>
              )}
            </Form.Item>
            
            <Form.Item label="Your Review">
              <TextArea
                rows={4}
                value={editComment} 
                onChange={(e) => setEditComment(e.target.value)} 
                placeholder="Share your experience with this product"
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
      
      {/* Add custom CSS for styling */}
      <style jsx>{`
        .reviews-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .mb-4 {
          margin-bottom: 16px;
        }
        
        .mr-2 {
          margin-right: 8px;
        }
        
        .ml-2 {
          margin-left: 8px;
        }
        
        .p-6 {
          padding: 24px;
        }
        
        .flex {
          display: flex;
        }
        
        .flex-col {
          flex-direction: column;
        }
        
        .flex-row {
          flex-direction: row;
        }
        
        .justify-between {
          justify-content: space-between;
        }
        
        .items-center {
          align-items: center;
        }
        
        .text-center {
          text-align: center;
        }
        
        .text-right {
          text-align: right;
        }
        
        .h-4 {
          height: 16px;
        }
        
        .w-16 {
          width: 64px;
        }
        
        .flex-1 {
          flex: 1;
        }
        
        .mx-4 {
          margin-left: 16px;
          margin-right: 16px;
        }
        
        .mb-2 {
          margin-bottom: 8px;
        }
        
        .mt-2 {
          margin-top: 8px;
        }
        
        .rounded-full {
          border-radius: 9999px;
        }
        
        .overflow-hidden {
          overflow: hidden;
        }
        
        .bg-gray-200 {
          background-color: #e5e7eb;
        }
        
        .bg-yellow-400 {
          background-color: #facc15;
        }
        
        .h-full {
          height: 100%;
        }
        
        @media (min-width: 768px) {
          .md\\:flex-row {
            flex-direction: row;
          }
          
          .md\\:w-1\\/3 {
            width: 33.333333%;
          }
          
          .md\\:w-2\\/3 {
            width: 66.666667%;
          }
          
          .md\\:mb-0 {
            margin-bottom: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ReviewsAndRatings; 