import React from 'react';
import { Typography, Breadcrumb } from 'antd';
import { HomeOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const CartHeader = ({ itemCount }) => {
  return (
    <div className="cart-hero">
      <div className="cart-hero-content">
        <Breadcrumb 
          items={[
            {
              title: <Link to="/"><HomeOutlined /> Home</Link>,
            },
            {
              title: <Link to="/profile"><UserOutlined /> My Account</Link>,
            },
            {
              title: <><ShoppingCartOutlined /> Shopping Cart</>,
            },
          ]}
          className="cart-breadcrumb"
        />
        
        <Title level={1} className="cart-hero-title">Shopping Cart</Title>
        <Text className="cart-hero-subtitle">
          {itemCount > 0 ? (
            <>You have {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart. Review your items and proceed to checkout.</>
          ) : (
            <>Your shopping cart is empty. Browse our products to add items to your cart.</>
          )}
        </Text>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .cart-hero {
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
          padding: 40px 0;
          border-radius: 12px;
          margin-bottom: 32px;
          position: relative;
          overflow: hidden;
        }
        
        .cart-hero::before {
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
        
        .cart-hero::after {
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
        
        .cart-hero-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          position: relative;
          z-index: 2;
        }
        
        .cart-breadcrumb {
          margin-bottom: 20px;
        }
        
        .cart-hero-title {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 12px;
          background: linear-gradient(90deg, #3a7bd5, #4a90e2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .cart-hero-subtitle {
          font-size: 16px;
          color: #586069;
          margin-bottom: 24px;
          display: block;
          max-width: 600px;
        }
        
        @media (max-width: 768px) {
          .cart-hero {
            padding: 30px 0;
          }
          
          .cart-hero-title {
            font-size: 28px;
          }
        }
      `}} />
    </div>
  );
};

export default CartHeader; 