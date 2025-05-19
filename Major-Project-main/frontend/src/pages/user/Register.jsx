import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, message, Alert, Select, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const UserRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    
    try {
      // In a real application, this would be an API call to your backend
      console.log('Registration values:', values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      message.success('Registration successful! Verification email sent.');
      form.resetFields();
      // Here you would redirect to login or verification page
      // history.push('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg rounded-lg">
        <div className="text-center mb-6">
          <Title level={2}>Create an Account</Title>
          <Text type="secondary">Join our fresh food community</Text>
        </div>

        {error && (
          <Alert
            message="Registration Error"
            description={error}
            type="error"
            showIcon
            className="mb-4"
            closable
          />
        )}

        <Form
          form={form}
          name="user_register"
          onFinish={onFinish}
          size="large"
          layout="vertical"
          scrollToFirstError
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please enter your full name' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Full Name" 
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Email" 
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: 'Please enter your phone number' },
              { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
            ]}
          >
            <Input 
              prefix={<PhoneOutlined />} 
              placeholder="Phone Number" 
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 8, message: 'Password must be at least 8 characters' }
            ]}
            hasFeedback
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Password" 
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Confirm Password" 
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="address"
            rules={[{ required: true, message: 'Please enter your address' }]}
          >
            <Input.TextArea 
              placeholder="Delivery Address" 
              rows={3}
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="city"
            rules={[{ required: true, message: 'Please select your city' }]}
          >
            <Select placeholder="Select your city" className="rounded-md">
              <Option value="mumbai">Mumbai</Option>
              <Option value="delhi">Delhi</Option>
              <Option value="bangalore">Bangalore</Option>
              <Option value="hyderabad">Hyderabad</Option>
              <Option value="chennai">Chennai</Option>
              <Option value="kolkata">Kolkata</Option>
              <Option value="pune">Pune</Option>
              {/* Add more cities as needed */}
            </Select>
          </Form.Item>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('You must accept the terms and conditions')),
              },
            ]}
          >
            <Checkbox>
              I agree to the <Link to="/terms" className="text-blue-500">Terms of Service</Link> and{' '}
              <Link to="/privacy" className="text-blue-500">Privacy Policy</Link>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full rounded-md" 
              loading={loading}
            >
              Register
            </Button>
          </Form.Item>

          <Divider plain>or register with</Divider>

          <div className="flex gap-4 mb-4">
            <Button 
              icon={<GoogleOutlined />} 
              className="flex-1 flex items-center justify-center"
            >
              Google
            </Button>
            <Button 
              icon={<FacebookOutlined />} 
              className="flex-1 flex items-center justify-center"
            >
              Facebook
            </Button>
          </div>

          <div className="text-center mt-4">
            <Text type="secondary">
              Already have an account? <Link to="/login" className="text-blue-500 hover:text-blue-700">Log in</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default UserRegister; 