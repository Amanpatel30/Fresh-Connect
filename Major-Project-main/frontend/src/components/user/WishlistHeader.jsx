import React from 'react';
import { Typography, Button, Breadcrumb } from 'antd';
import { HeartOutlined, HomeOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const WishlistHeader = ({ itemCount }) => {
  return (
    <div className="wishlist-hero">
      <div className="wishlist-hero-content">
        <Breadcrumb 
          className="wishlist-breadcrumb"
          items={[
            {
              title: (
                <Link to="/">
                  <HomeOutlined /> Home
                </Link>
              )
            },
            {
              title: (
                <Link to="/profile">
                  <UserOutlined /> My Account
                </Link>
              )
            },
            {
              title: (
                <span><HeartOutlined /> Wishlist</span>
              )
            }
          ]}
        />
        
        <Title level={1} className="wishlist-hero-title">My Wishlist</Title>
        <Text className="wishlist-hero-subtitle">
          {itemCount > 0 ? (
            <>You have {itemCount} {itemCount === 1 ? 'item' : 'items'} in your wishlist. Add them to your cart or remove items you no longer want.</>
          ) : (
            <>Your wishlist is empty. Browse our products and add items you love to your wishlist.</>
          )}
        </Text>
        
        <div className="wishlist-actions">
          <Button type="primary" size="large" className="shop-now-button">
            <Link to="/products">Shop Products</Link>
          </Button>
          {itemCount > 0 && (
            <Button size="large" className="share-wishlist-button">
              Share Wishlist
            </Button>
          )}
        </div>

        <div className="wishlist-header-actions">
          <Link to="/profile?tab=wishlist" className="wishlist-view-all">
            View All
          </Link>
          <Link to="/profile?tab=reviews" className="wishlist-reviews">
            My Reviews
          </Link>
        </div>
      </div>
      
      <style jsx>{`
        .wishlist-hero {
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
          padding: 40px 0;
          border-radius: 12px;
          margin-bottom: 32px;
          position: relative;
          overflow: hidden;
        }
        
        .wishlist-hero::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(74, 144, 226, 0.1) 0%, rgba(74, 144, 226, 0) 70%);
          border-radius: 50%;
          z-index: 1;
        }
        
        .wishlist-hero::after {
          content: '';
          position: absolute;
          bottom: -100px;
          left: -100px;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(74, 144, 226, 0.1) 0%, rgba(74, 144, 226, 0) 70%);
          border-radius: 50%;
          z-index: 1;
        }
        
        .wishlist-hero-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          position: relative;
          z-index: 2;
        }
        
        .wishlist-breadcrumb {
          margin-bottom: 20px;
        }
        
        .wishlist-hero-title {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 12px;
          background: linear-gradient(90deg, #3a7bd5, #4a90e2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .wishlist-hero-subtitle {
          font-size: 16px;
          color: #586069;
          margin-bottom: 24px;
          display: block;
          max-width: 600px;
        }
        
        .wishlist-actions {
          display: flex;
          gap: 16px;
          margin-top: 24px;
        }
        
        .shop-now-button {
          background: #4a90e2;
          border: none;
          font-weight: 600;
          padding: 0 32px;
          height: 48px;
          border-radius: 8px;
          box-shadow: 0 4px 14px rgba(74, 144, 226, 0.3);
          transition: all 0.3s ease;
        }
        
        .shop-now-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
          background: #3a7bd5;
        }
        
        .share-wishlist-button {
          border-color: #4a90e2;
          color: #4a90e2;
          height: 48px;
          border-radius: 8px;
          padding: 0 32px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .share-wishlist-button:hover {
          border-color: #3a7bd5;
          color: #3a7bd5;
          background: rgba(74, 144, 226, 0.05);
        }
        
        @media (max-width: 768px) {
          .wishlist-hero {
            padding: 30px 0;
          }
          
          .wishlist-hero-title {
            font-size: 28px;
          }
          
          .wishlist-actions {
            flex-direction: column;
          }
          
          .shop-now-button, 
          .share-wishlist-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default WishlistHeader; 