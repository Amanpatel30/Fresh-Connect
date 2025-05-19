import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space, Divider } from 'antd';
import { MailOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    
    try {
      // In a real app, this would be an API call to request a password reset
      console.log('Requesting password reset for:', values.email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEmailSent(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again later.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <Title level={2}>Forgot Password</Title>
          {!emailSent && (
            <Paragraph>
              Enter your email address and we'll send you a link to reset your password.
            </Paragraph>
          )}
        </div>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            className="mb-6"
          />
        )}

        {emailSent ? (
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <Title level={4}>Email Sent!</Title>
            <Paragraph>
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
            </Paragraph>
            <Paragraph type="secondary" className="mt-4">
              If you don't receive the email within a few minutes, please check your spam folder.
            </Paragraph>
            <div className="mt-6">
              <Space direction="vertical" className="w-full">
                <Button type="primary" block onClick={() => setEmailSent(false)}>
                  Try Again
                </Button>
                <Link to="/login">
                  <Button block>
                    Back to Login
                  </Button>
                </Link>
              </Space>
            </div>
          </div>
        ) : (
          <Form
            form={form}
            name="forgot-password"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                {
                  required: true,
                  message: 'Please enter your email address',
                },
                {
                  type: 'email',
                  message: 'Please enter a valid email address',
                },
              ]}
            >
              <Input 
                prefix={<MailOutlined className="site-form-item-icon" />} 
                placeholder="Email" 
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
              >
                Send Reset Link
              </Button>
            </Form.Item>

            <Divider />

            <div className="text-center">
              <Link to="/login" className="flex items-center justify-center">
                <ArrowLeftOutlined className="mr-2" /> Back to Login
              </Link>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword; 