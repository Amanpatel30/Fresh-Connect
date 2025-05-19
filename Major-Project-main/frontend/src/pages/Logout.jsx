import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Spin, Typography } from 'antd';

const { Title, Text } = Typography;

const Logout = () => {
  const { logout } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Small delay to show the logout message
    const timer = setTimeout(() => {
      // Perform logout
      logout();
      
      // Redirect to the login page
      navigate('/login', { replace: true });
    }, 1500);

    return () => clearTimeout(timer);
  }, [logout, navigate]);

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '70vh',
        gap: '20px'
      }}
    >
      <Spin size="large" />
      <Title level={2} style={{ marginTop: '24px' }}>Logging Out</Title>
      <Text style={{ fontSize: '16px', color: '#666' }}>Please wait while we securely log you out...</Text>
    </div>
  );
};

export default Logout; 