import React, { useState, useRef } from 'react';
import { message, Button, Avatar, Upload, Spin } from 'antd';
import { UploadOutlined, UserOutlined, CameraOutlined } from '@ant-design/icons';
import { useUser } from '../context/UserContext';

const ProfileImage = ({ onImageUpload, size = 120, editable = true }) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const { user, updateUser } = useUser();
  const fileInputRef = useRef(null);

  // Use avatar from context if available
  const avatarUrl = imageUrl || (user && user.avatarUrl) || null;

  // Add a function to refresh the token if needed
  const getRefreshedToken = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    
    if (!token) {
      // Try to get a new token
      try {
        // Make a request to refresh the token - adjust this endpoint to match your API
        const response = await fetch(`${import.meta.env.VITE_BASE_URL || 'http://localhost:5001'}/api/users/token/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          // If you need to send a refresh token, add it here
          body: JSON.stringify({
            refreshToken: localStorage.getItem('refreshToken')
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          // Save the new token
          if (data.token) {
            localStorage.setItem('token', data.token);
            return data.token;
          }
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }
    
    return token;
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    try {
      setLoading(true);
      message.loading({ content: 'Uploading image...', key: 'imageUpload' });
      
      // Log file details
      console.log('Upload file details:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      // Debug authentication
      const token = localStorage.getItem('token') || localStorage.getItem('userToken');
      console.log('Authentication token available:', !!token);
      if (token) {
        console.log(`Token length: ${token.length}, First 15 chars: ${token.substring(0, 15)}...`);
      } else {
        console.error('No authentication token found - login may be required');
        message.error({ content: 'Authentication token missing. Please log in again.', key: 'imageUpload' });
        setLoading(false);
        return;
      }
      
      // Create a simpler FormData object
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Attempting direct fetch upload...');
      
      // Make a simpler fetch request with only essential parameters
      try {
        const response = await fetch('http://localhost:5001/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
            // Important: Do NOT set Content-Type when using FormData
          },
          body: formData
        });
        
        console.log(`Upload response status: ${response.status} ${response.statusText}`);
        
        // Handle non-success responses
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload failed:', errorText);
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Upload successful, server response:', data);
        
        if (data.url) {
          // Update local state with the new image URL
          setImageUrl(data.url);
          
          // Call the callback with the new URL
          if (onImageUpload) {
            onImageUpload(data.url);
          }
          
          message.success({ content: 'Image uploaded successfully!', key: 'imageUpload' });
        } else {
          throw new Error('Server response missing URL');
        }
      } catch (error) {
        console.error('Error during fetch upload:', error);
        message.error({ content: `Upload failed: ${error.message}`, key: 'imageUpload' });
      }
    } catch (error) {
      console.error('Upload process error:', error);
      message.error({ content: error.message || 'Failed to upload image', key: 'imageUpload' });
    } finally {
      setLoading(false);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="profile-image-container" style={{ position: 'relative', width: size, height: size }}>
      {loading && (
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '50%',
            zIndex: 2
          }}
        >
          <Spin size="large" />
        </div>
      )}
      
      <Avatar 
        size={size} 
        src={avatarUrl} 
        icon={<UserOutlined />} 
        style={{ 
          cursor: editable ? 'pointer' : 'default',
          border: '2px solid #f0f0f0'
        }}
        onClick={editable ? triggerFileSelect : undefined}
      />
      
      {editable && (
        <>
          <div 
            className="upload-overlay"
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: '#1890ff',
              borderRadius: '50%',
              width: size / 4,
              height: size / 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              zIndex: 1
            }}
            onClick={triggerFileSelect}
          >
            <CameraOutlined style={{ color: 'white', fontSize: size / 8 }} />
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                handleImageUpload(file);
              }
            }}
          />
        </>
      )}
    </div>
  );
};

export default ProfileImage; 