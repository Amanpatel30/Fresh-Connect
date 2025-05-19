import React, { useState, useEffect } from 'react';
import {
  Card, Tabs, Form, Input, Button, Switch, Select, Upload,
  message, Space, Typography, Row, Col, Divider, TimePicker,
  InputNumber, Radio, Avatar, Modal
} from 'antd';
import {
  UserOutlined, LockOutlined, BankOutlined, ShopOutlined,
  MailOutlined, PhoneOutlined, EnvironmentOutlined,
  NotificationOutlined, UploadOutlined, SaveOutlined,
  ClockCircleOutlined, DollarOutlined, SettingOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = TimePicker;

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [profileForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [businessForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  useEffect(() => {
    // Simulating API call to fetch user settings
    setTimeout(() => {
      const mockSettings = {
        profile: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+91 98765 43210',
          avatar: 'https://via.placeholder.com/150',
          address: '123 Main St, City, State, 400001'
        },
        business: {
          shopName: 'Fresh Veggies Store',
          description: 'Your local source for fresh vegetables',
          registrationNumber: 'REG123456',
          gstNumber: 'GST123456789',
          bankAccount: {
            name: 'John Doe',
            accountNumber: 'XXXX-XXXX-1234',
            ifscCode: 'BANK0001234',
            bankName: 'Sample Bank'
          },
          operatingHours: {
            start: '09:00',
            end: '18:00'
          },
          deliveryRadius: 10,
          minimumOrder: 200
        },
        notifications: {
          email: true,
          sms: true,
          push: true,
          orderUpdates: true,
          stockAlerts: true,
          promotionalOffers: false
        }
      };

      // Set form values
      profileForm.setFieldsValue(mockSettings.profile);
      businessForm.setFieldsValue({
        ...mockSettings.business,
        operatingHours: [
          mockSettings.business.operatingHours.start,
          mockSettings.business.operatingHours.end
        ]
      });
      notificationForm.setFieldsValue(mockSettings.notifications);
      setAvatarUrl(mockSettings.profile.avatar);
      setLoading(false);
    }, 1000);
  }, [profileForm, businessForm, notificationForm]);

  const handleProfileSubmit = async (values) => {
    try {
      // Simulating API call to update profile
      message.success('Profile updated successfully');
    } catch (error) {
      message.error('Failed to update profile');
    }
  };

  const handleSecuritySubmit = async (values) => {
    try {
      // Simulating API call to update password
      message.success('Password updated successfully');
      setPasswordModalVisible(false);
      securityForm.resetFields();
    } catch (error) {
      message.error('Failed to update password');
    }
  };

  const handleBusinessSubmit = async (values) => {
    try {
      // Simulating API call to update business settings
      message.success('Business settings updated successfully');
    } catch (error) {
      message.error('Failed to update business settings');
    }
  };

  const handleNotificationSubmit = async (values) => {
    try {
      // Simulating API call to update notification settings
      message.success('Notification settings updated successfully');
    } catch (error) {
      message.error('Failed to update notification settings');
    }
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      setAvatarUrl(info.file.response.url);
      message.success('Avatar updated successfully');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Title level={2}>Settings</Title>
      <Text type="secondary" className="mb-6 block">
        Manage your account settings and preferences
      </Text>

      <Card>
        <Tabs defaultActiveKey="profile">
          <TabPane
            tab={
              <span>
                <UserOutlined />
                Profile
              </span>
            }
            key="profile"
          >
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleProfileSubmit}
              className="max-w-2xl"
            >
              <div className="mb-6">
                <Upload
                  name="avatar"
                  listType="picture-circle"
                  showUploadList={false}
                  action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                  onChange={handleAvatarChange}
                >
                  {avatarUrl ? (
                    <Avatar
                      src={avatarUrl}
                      size={100}
                      style={{ cursor: 'pointer' }}
                    />
                  ) : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Enter your name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="Enter your email" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[{ required: true, message: 'Please enter your phone number' }]}
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="Enter your phone number" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="address"
                    label="Address"
                    rules={[{ required: true, message: 'Please enter your address' }]}
                  >
                    <Input prefix={<EnvironmentOutlined />} placeholder="Enter your address" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane
            tab={
              <span>
                <LockOutlined />
                Security
              </span>
            }
            key="security"
          >
            <div className="max-w-2xl">
              <Paragraph>
                Manage your password and security settings
              </Paragraph>

              <Button
                type="primary"
                onClick={() => setPasswordModalVisible(true)}
                icon={<LockOutlined />}
              >
                Change Password
              </Button>

              <Divider />

              <Title level={4}>Two-Factor Authentication</Title>
              <Paragraph>
                Add an extra layer of security to your account
              </Paragraph>
              <Switch defaultChecked={false} />

              <Divider />

              <Title level={4}>Login History</Title>
              <Paragraph>
                View your recent login activity
              </Paragraph>
              <Link to="#">View Login History</Link>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <ShopOutlined />
                Business
              </span>
            }
            key="business"
          >
            <Form
              form={businessForm}
              layout="vertical"
              onFinish={handleBusinessSubmit}
              className="max-w-2xl"
            >
              <Title level={4}>Store Information</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="shopName"
                    label="Shop Name"
                    rules={[{ required: true, message: 'Please enter shop name' }]}
                  >
                    <Input prefix={<ShopOutlined />} placeholder="Enter shop name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="registrationNumber"
                    label="Registration Number"
                    rules={[{ required: true, message: 'Please enter registration number' }]}
                  >
                    <Input placeholder="Enter registration number" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="Shop Description"
              >
                <TextArea rows={4} placeholder="Enter shop description" />
              </Form.Item>

              <Form.Item
                name="gstNumber"
                label="GST Number"
                rules={[{ required: true, message: 'Please enter GST number' }]}
              >
                <Input placeholder="Enter GST number" />
              </Form.Item>

              <Divider />

              <Title level={4}>Bank Account Details</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={['bankAccount', 'name']}
                    label="Account Holder Name"
                    rules={[{ required: true, message: 'Please enter account holder name' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Enter account holder name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={['bankAccount', 'accountNumber']}
                    label="Account Number"
                    rules={[{ required: true, message: 'Please enter account number' }]}
                  >
                    <Input prefix={<BankOutlined />} placeholder="Enter account number" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={['bankAccount', 'ifscCode']}
                    label="IFSC Code"
                    rules={[{ required: true, message: 'Please enter IFSC code' }]}
                  >
                    <Input placeholder="Enter IFSC code" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={['bankAccount', 'bankName']}
                    label="Bank Name"
                    rules={[{ required: true, message: 'Please enter bank name' }]}
                  >
                    <Input placeholder="Enter bank name" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Title level={4}>Operating Hours</Title>
              <Form.Item
                name="operatingHours"
                label="Business Hours"
                rules={[{ required: true, message: 'Please select operating hours' }]}
              >
                <TimePicker.RangePicker format="HH:mm" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="deliveryRadius"
                    label="Delivery Radius (km)"
                    rules={[{ required: true, message: 'Please enter delivery radius' }]}
                  >
                    <InputNumber min={1} max={50} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="minimumOrder"
                    label="Minimum Order Amount (₹)"
                    rules={[{ required: true, message: 'Please enter minimum order amount' }]}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  Save Business Settings
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane
            tab={
              <span>
                <NotificationOutlined />
                Notifications
              </span>
            }
            key="notifications"
          >
            <Form
              form={notificationForm}
              layout="vertical"
              onFinish={handleNotificationSubmit}
              className="max-w-2xl"
            >
              <Title level={4}>Notification Channels</Title>
              <Form.Item
                name="email"
                valuePropName="checked"
              >
                <Switch checkedChildren="Email" unCheckedChildren="Email" />
              </Form.Item>
              <Form.Item
                name="sms"
                valuePropName="checked"
              >
                <Switch checkedChildren="SMS" unCheckedChildren="SMS" />
              </Form.Item>
              <Form.Item
                name="push"
                valuePropName="checked"
              >
                <Switch checkedChildren="Push Notifications" unCheckedChildren="Push Notifications" />
              </Form.Item>

              <Divider />

              <Title level={4}>Notification Preferences</Title>
              <Form.Item
                name="orderUpdates"
                valuePropName="checked"
              >
                <Switch checkedChildren="Order Updates" unCheckedChildren="Order Updates" />
              </Form.Item>
              <Form.Item
                name="stockAlerts"
                valuePropName="checked"
              >
                <Switch checkedChildren="Stock Alerts" unCheckedChildren="Stock Alerts" />
              </Form.Item>
              <Form.Item
                name="promotionalOffers"
                valuePropName="checked"
              >
                <Switch checkedChildren="Promotional Offers" unCheckedChildren="Promotional Offers" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  Save Notification Settings
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="Change Password"
        visible={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
      >
        <Form
          form={securityForm}
          layout="vertical"
          onFinish={handleSecuritySubmit}
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: 'Please enter current password' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter new password' },
              { min: 8, message: 'Password must be at least 8 characters' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                }
              })
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update Password
              </Button>
              <Button onClick={() => setPasswordModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Settings; 