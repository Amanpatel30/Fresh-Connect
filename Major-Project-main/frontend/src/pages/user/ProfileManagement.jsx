import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Button, Card, Typography, Tabs, Upload, message, 
  Avatar, Divider, List, Descriptions, Modal, Space, Switch,
  Table, Tag, Popconfirm, notification, Spin, Alert, Result
} from 'antd';
import { 
  UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, 
  HomeOutlined, CameraOutlined, EditOutlined, SaveOutlined,
  DeleteOutlined, PlusOutlined, EnvironmentOutlined, BellOutlined,
  CreditCardOutlined, SafetyCertificateOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import userService from '../../services/userService';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const ProfileManagement = () => {
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('https://via.placeholder.com/150');
  const [activeTab, setActiveTab] = useState('1');
  const [editMode, setEditMode] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotions: false,
    appNotifications: true,
    urgentSales: true,
    freeFood: true
  });
  const [form] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [securityForm] = Form.useForm();

  useEffect(() => {
    // Fetch user profile data from API
    fetchUserProfile();
  }, [form]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await userService.getUserProfile();
      const userData = response.data;
      
      // Set form values with user data
      form.setFieldsValue({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
      });

      // Set other user data
      setAvatarUrl(userData.avatar || 'https://via.placeholder.com/150');
      setAddresses(userData.addresses || []);
      setPaymentMethods(userData.paymentMethods || []);
      
      // Set notification settings if available
      if (userData.notificationSettings) {
        setNotificationSettings(userData.notificationSettings);
      }
      
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      message.error('Failed to load profile data. Please try again.');
      
      // Fallback to mock data for development
      const userData = {
        id: 'USR-12345',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '9876543210',
        joinDate: '2023-01-15',
        avatar: 'https://via.placeholder.com/150',
        addresses: [
          { 
            id: 1, 
            type: 'Home',
            fullName: 'John Doe',
            phone: '9876543210',
            line1: '123 Main Street',
            line2: 'Apt 4B',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            isDefault: true 
          },
          { 
            id: 2, 
            type: 'Work',
            fullName: 'John Doe',
            phone: '9876543210',
            line1: '456 Business Park',
            line2: 'Building C, Floor 3',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400051',
            isDefault: false 
          }
        ],
        paymentMethods: [
          {
            id: 1,
            type: 'Credit Card',
            cardNumber: '**** **** **** 1234',
            cardHolderName: 'John Doe',
            expiryDate: '12/25',
            isDefault: true
          },
          {
            id: 2,
            type: 'UPI',
            upiId: 'johndoe@upi',
            isDefault: false
          }
        ]
      };

      form.setFieldsValue({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
      });

      setAvatarUrl(userData.avatar);
      setAddresses(userData.addresses);
      setPaymentMethods(userData.paymentMethods);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Update user profile using the userService
      const response = await userService.updateUserProfile(values);
      
      if (response && response.data) {
        message.success('Profile updated successfully!');
        
        // Update the user context if needed (if you have a user context in your app)
        // For example, if you're using the useUser context:
        // const { updateUser } = useUser();
        // updateUser(response.data);
        
        // Exit edit mode
        setEditMode(false);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      message.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    setLoading(true);
    try {
      // First verify the current password
      const verifyResponse = await userService.verifyCurrentPassword({
        currentPassword: values.currentPassword
      });
      
      if (verifyResponse.success) {
        // If password verification was successful, proceed with password change
        await userService.changeUserPassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        });
        
        message.success('Password changed successfully!');
        
        // Reset the fields and password verification state
        form.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
        setPasswordVerified(false);
      } else {
        message.error('Current password is incorrect');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      if (error.response?.status === 401) {
        message.error('Current password is incorrect');
      } else {
        message.error('Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to verify the current password
  const verifyCurrentPassword = async () => {
    try {
      setIsVerifyingPassword(true);
      
      const values = await securityForm.validateFields(['currentPassword']);
      
      if (!values.currentPassword) {
        return; // Don't proceed if no password entered
      }
      
      try {
        // Call API to verify current password
        await userService.verifyCurrentPassword({
          currentPassword: values.currentPassword
        });
        
        setPasswordVerified(true);
        message.success('Password verified successfully');
      } catch (error) {
        console.error('Failed to verify password:', error);
        if (error.response?.status === 401) {
          message.error('Current password is incorrect');
        } else {
          message.error('Failed to verify password. Please try again.');
        }
        setPasswordVerified(false);
      }
    } catch (formError) {
      // Form validation error, already handled by Form
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  const handleAvatarChange = async (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    
    if (info.file.status === 'done') {
      try {
        // Use our uploadProfileImage service
        const uploadResponse = await userService.uploadProfileImage(info.file.originFileObj);
        
        if (uploadResponse && uploadResponse.imageData && uploadResponse.imageData.url) {
          // Update the profile with the new image URL
          const profileUpdateResponse = await userService.updateUserProfile({
            avatar: uploadResponse.imageData.url
          });
          
          if (profileUpdateResponse && profileUpdateResponse.data) {
            setAvatarUrl(uploadResponse.imageData.url);
            message.success('Profile image updated successfully');
          }
        } else {
          throw new Error('Invalid response from upload service');
        }
      } catch (error) {
        console.error('Error updating avatar:', error);
        message.error('Failed to update profile image');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveAddress = async (values) => {
    setLoading(true);
    try {
      let updatedAddresses;
      
      if (currentAddress) {
        // Update existing address
        const updatedAddress = { ...currentAddress, ...values };
        await userService.updateUserAddress(updatedAddress);
        
        // Update local state
        updatedAddresses = addresses.map(addr => 
          addr.id === currentAddress.id ? updatedAddress : addr
        );
      } else {
        // Add new address
        const newAddress = {
          ...values,
          id: Date.now(), // Temporary ID until backend assigns one
          isDefault: addresses.length === 0 // Make default if it's the first address
        };
        
        const response = await userService.updateUserAddress(newAddress);
        
        // Update with ID from backend if available
        if (response.data && response.data.id) {
          newAddress.id = response.data.id;
        }
        
        updatedAddresses = [...addresses, newAddress];
      }
      
      setAddresses(updatedAddresses);
      setAddressModalVisible(false);
      setCurrentAddress(null);
      addressForm.resetFields();
      
      message.success(`Address ${currentAddress ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error('Failed to save address:', error);
      message.error(`Failed to ${currentAddress ? 'update' : 'add'} address. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const editAddress = (address) => {
    setCurrentAddress(address);
    addressForm.setFieldsValue({
      type: address.type,
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      isDefault: address.isDefault
    });
    setAddressModalVisible(true);
  };

  const deleteAddress = async (addressId) => {
    setLoading(true);
    try {
      // Call API to delete address
      await userService.deleteUserAddress(addressId);
      
      // Update local state
      const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
      setAddresses(updatedAddresses);
      
      message.success('Address deleted successfully!');
    } catch (error) {
      console.error('Failed to delete address:', error);
      message.error('Failed to delete address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addNewAddress = () => {
    setCurrentAddress(null);
    addressForm.resetFields();
    addressForm.setFieldsValue({
      isDefault: addresses.length === 0 // Make default if first address
    });
    setAddressModalVisible(true);
  };

  const handleSavePayment = async (values) => {
    setLoading(true);
    try {
      let updatedPaymentMethods;
      
      if (values.id) {
        // Update existing payment method
        await userService.updateUserPaymentMethod(values);
        
        // Update local state
        updatedPaymentMethods = paymentMethods.map(method => 
          method.id === values.id ? values : method
        );
      } else {
        // Add new payment method
        const newPaymentMethod = {
          ...values,
          id: Date.now(), // Temporary ID until backend assigns one
          isDefault: paymentMethods.length === 0 // Make default if it's the first payment method
        };
        
        const response = await userService.updateUserPaymentMethod(newPaymentMethod);
        
        // Update with ID from backend if available
        if (response.data && response.data.id) {
          newPaymentMethod.id = response.data.id;
        }
        
        updatedPaymentMethods = [...paymentMethods, newPaymentMethod];
      }
      
      setPaymentMethods(updatedPaymentMethods);
      setPaymentModalVisible(false);
      paymentForm.resetFields();
      
      message.success(`Payment method ${values.id ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error('Failed to save payment method:', error);
      message.error(`Failed to ${values.id ? 'update' : 'add'} payment method. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const deletePaymentMethod = async (paymentId) => {
    setLoading(true);
    try {
      // Call API to delete payment method
      await userService.deleteUserPaymentMethod(paymentId);
      
      // Update local state
      const updatedPaymentMethods = paymentMethods.filter(method => method.id !== paymentId);
      setPaymentMethods(updatedPaymentMethods);
      
      message.success('Payment method deleted successfully!');
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      message.error('Failed to delete payment method. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = async (key, value) => {
    try {
      const updatedSettings = { ...notificationSettings, [key]: value };
      setNotificationSettings(updatedSettings);
      
      // Call API to update notification settings
      await userService.updateNotificationSettings(updatedSettings);
      
      message.success('Notification settings updated successfully!');
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      message.error('Failed to update notification settings. Please try again.');
      
      // Revert the change in case of error
      setNotificationSettings(notificationSettings);
    }
  };

  const renderProfileTab = () => (
    <div>
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="text-center md:text-left">
          <Upload
            name="avatar"
            listType="picture-circle"
            className="avatar-uploader"
            showUploadList={false}
            action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
            onChange={handleAvatarChange}
            disabled={!editMode}
          >
            {avatarUrl ? (
              <div className="relative group">
                <Avatar size={100} src={avatarUrl} />
                {editMode && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <CameraOutlined className="text-white text-xl" />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <UserOutlined />
                <div>Upload</div>
              </div>
            )}
          </Upload>
        </div>
        
        <div className="flex-grow">
          <div className="flex justify-between">
            <Title level={3}>Personal Information</Title>
            <Button 
              type={editMode ? "primary" : "default"}
              icon={editMode ? <SaveOutlined /> : <EditOutlined />}
              onClick={() => {
                if (editMode) {
                  form.submit();
                } else {
                  setEditMode(true);
                }
              }}
            >
              {editMode ? "Save" : "Edit"}
            </Button>
          </div>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            disabled={!editMode}
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Full Name" />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>
            
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                { required: true, message: 'Please enter your phone number' },
                { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <Card 
      title={
        <Typography.Title level={4} style={{ margin: 0, fontSize: '24px' }}>
          <SafetyCertificateOutlined /> Security Settings
        </Typography.Title>
      } 
      className="max-w-2xl mx-auto shadow-md"
    >
      <Form
        layout="vertical"
        onFinish={handleChangePassword}
        form={securityForm}
        size="large"
      >
        <div className="mb-4">
          <Alert
            message="Password Requirements"
            description={
              <ul className="list-disc pl-5 mt-2 text-sm">
                <li>Password must be at least 8 characters long</li>
                <li>Include at least one uppercase letter</li>
                <li>Include at least one number</li>
                <li>Include at least one special character</li>
              </ul>
            }
            type="info"
            showIcon
          />
        </div>
        
        <Typography.Title level={5} style={{ marginTop: '24px', fontSize: '18px' }}>
          Change Password
        </Typography.Title>
        
        <Form.Item
          name="currentPassword"
          label={<span style={{ fontSize: '16px' }}>Current Password</span>}
          rules={[{ required: true, message: 'Please enter your current password' }]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="Enter your current password" 
            size="large"
            disabled={passwordVerified}
            style={{ fontSize: '16px' }}
          />
        </Form.Item>
        
        {!passwordVerified ? (
          <Form.Item>
            <Button 
              type="primary" 
              onClick={verifyCurrentPassword} 
              loading={isVerifyingPassword}
              style={{ fontSize: '16px', height: 'auto', padding: '8px 16px' }}
            >
              Verify Password
            </Button>
          </Form.Item>
        ) : (
          <>
            <Result
              status="success"
              title="Password Verified"
              subTitle="You can now set your new password"
              style={{ padding: '12px', marginBottom: '24px' }}
            />
            
            <Form.Item
              name="newPassword"
              label={<span style={{ fontSize: '16px' }}>New Password</span>}
              rules={[
                { required: true, message: 'Please enter your new password' },
                { min: 8, message: 'Password must be at least 8 characters' },
                {
                  pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
                  message: 'Password must include uppercase, number, and special character'
                }
              ]}
              hasFeedback
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Enter your new password" 
                size="large" 
                style={{ fontSize: '16px' }}
              />
            </Form.Item>
            
            <Form.Item
              name="confirmPassword"
              label={<span style={{ fontSize: '16px' }}>Confirm New Password</span>}
              dependencies={['newPassword']}
              hasFeedback
              rules={[
                { required: true, message: 'Please confirm your new password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Confirm your new password" 
                size="large" 
                style={{ fontSize: '16px' }}
              />
            </Form.Item>
            
            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  style={{ fontSize: '16px', height: 'auto', padding: '8px 16px' }}
                >
                  Change Password
                </Button>
                <Button 
                  onClick={() => {
                    securityForm.resetFields();
                    setPasswordVerified(false);
                  }}
                  style={{ fontSize: '16px', height: 'auto', padding: '8px 16px' }}
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </>
        )}
      </Form>
      
      <Divider style={{ margin: '32px 0' }} />
      
      <div>
        <Typography.Title level={5} style={{ fontSize: '18px' }}>
          Two-Factor Authentication
        </Typography.Title>
        <div className="flex items-center justify-between mt-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Text strong style={{ fontSize: '16px' }}>Enable Two-Factor Authentication</Text>
            <div>
              <Text type="secondary" style={{ fontSize: '14px' }}>Add an extra layer of security to your account</Text>
            </div>
          </div>
          <Switch 
            checkedChildren="Enabled" 
            unCheckedChildren="Disabled" 
            defaultChecked={false}
            onChange={() => message.info('This feature is not implemented in the demo')}
          />
        </div>
      </div>
      
      <Divider style={{ margin: '32px 0' }} />
      
      <div>
        <Typography.Title level={5} style={{ fontSize: '18px' }}>
          Account Activity
        </Typography.Title>
        <List
          size="large"
          bordered
          dataSource={[
            'Last login: Today, 5:30 PM', 
            'Last password change: 45 days ago',
            'Devices: Windows PC, Android Phone'
          ]}
          renderItem={item => (
            <List.Item style={{ fontSize: '16px' }}>
              {item}
            </List.Item>
          )}
        />
      </div>
    </Card>
  );

  const renderAddressesTab = () => (
    <div>
      <div className="flex justify-between mb-4">
        <Title level={4}>Saved Addresses</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={addNewAddress}>
          Add New Address
        </Button>
      </div>
      
      {addresses.length === 0 ? (
        <Card>
          <div className="text-center py-6">
            <EnvironmentOutlined style={{ fontSize: 48 }} className="text-gray-300 mb-4" />
            <Title level={5}>No Addresses Saved</Title>
            <Text type="secondary">Add a delivery address to make checkout easier</Text>
            <div className="mt-4">
              <Button type="primary" icon={<PlusOutlined />} onClick={addNewAddress}>
                Add New Address
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
          dataSource={addresses}
          renderItem={address => (
            <List.Item>
              <Card
                title={
                  <div className="flex items-center">
                    <Text strong>{address.type}</Text>
                    {address.isDefault && (
                      <Tag color="blue" className="ml-2">Default</Tag>
                    )}
                  </div>
                }
                extra={
                  <div className="flex gap-2">
                    <Button 
                      icon={<EditOutlined />} 
                      size="small"
                      onClick={() => editAddress(address)}
                    />
                    <Popconfirm
                      title="Delete this address?"
                      description="Are you sure you want to delete this address?"
                      onConfirm={() => deleteAddress(address.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button 
                        icon={<DeleteOutlined />} 
                        size="small"
                        danger
                      />
                    </Popconfirm>
                  </div>
                }
              >
                <div>
                  <div className="mb-2"><Text strong>{address.fullName}</Text></div>
                  <div>{address.line1}</div>
                  {address.line2 && <div>{address.line2}</div>}
                  <div>{address.city}, {address.state} {address.postalCode}</div>
                  <div className="mt-2">Phone: {address.phone}</div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
      
      {/* Address Form Modal */}
      <Modal
        title={currentAddress ? "Edit Address" : "Add New Address"}
        open={addressModalVisible}
        onCancel={() => {
          setAddressModalVisible(false);
          setCurrentAddress(null);
          addressForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={addressForm}
          layout="vertical"
          onFinish={handleSaveAddress}
          initialValues={{
            type: 'Home',
            isDefault: false
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="type"
              label="Address Type"
              rules={[{ required: true, message: 'Please select address type' }]}
            >
              <Input placeholder="Home, Work, etc." />
            </Form.Item>
            
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter full name' }]}
            >
              <Input placeholder="Full Name" />
            </Form.Item>
          </div>
          
          <Form.Item
            name="line1"
            label="Address Line 1"
            rules={[{ required: true, message: 'Please enter address' }]}
          >
            <Input placeholder="Street address, house number" />
          </Form.Item>
          
          <Form.Item
            name="line2"
            label="Address Line 2"
          >
            <Input placeholder="Apartment, suite, unit, building, floor, etc." />
          </Form.Item>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="city"
              label="City"
              rules={[{ required: true, message: 'Please enter city' }]}
            >
              <Input placeholder="City" />
            </Form.Item>
            
            <Form.Item
              name="state"
              label="State"
              rules={[{ required: true, message: 'Please enter state' }]}
            >
              <Input placeholder="State" />
            </Form.Item>
            
            <Form.Item
              name="postalCode"
              label="Postal Code"
              rules={[{ required: true, message: 'Please enter postal code' }]}
            >
              <Input placeholder="Postal Code" />
            </Form.Item>
          </div>
          
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: 'Please enter phone number' },
              { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
            ]}
          >
            <Input placeholder="Phone Number" />
          </Form.Item>
          
          <Form.Item name="isDefault" valuePropName="checked">
            <Switch checkedChildren="Default Address" unCheckedChildren="Set as Default" />
          </Form.Item>
          
          <div className="flex justify-end gap-2">
            <Button 
              onClick={() => {
                setAddressModalVisible(false);
                setCurrentAddress(null);
                addressForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Save Address
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );

  const renderPaymentTab = () => (
    <div>
      <div className="flex justify-between mb-4">
        <Title level={4}>Payment Methods</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setPaymentModalVisible(true)}
        >
          Add Payment Method
        </Button>
      </div>
      
      {paymentMethods.length === 0 ? (
        <Card>
          <div className="text-center py-6">
            <CreditCardOutlined style={{ fontSize: 48 }} className="text-gray-300 mb-4" />
            <Title level={5}>No Payment Methods Saved</Title>
            <Text type="secondary">Add a payment method to make checkout faster</Text>
            <div className="mt-4">
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => setPaymentModalVisible(true)}
              >
                Add Payment Method
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
          dataSource={paymentMethods}
          renderItem={method => (
            <List.Item>
              <Card>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-2">
                      <Text strong>{method.type}</Text>
                      {method.isDefault && (
                        <Tag color="blue" className="ml-2">Default</Tag>
                      )}
                    </div>
                    
                    {method.type === 'Credit Card' ? (
                      <>
                        <div className="text-lg mb-1">{method.cardNumber}</div>
                        <div className="flex items-center gap-4">
                          <Text type="secondary">Expires: {method.expiryDate}</Text>
                          <Text type="secondary">{method.cardHolderName}</Text>
                        </div>
                      </>
                    ) : (
                      <div className="text-lg">{method.upiId}</div>
                    )}
                  </div>
                  
                  <Popconfirm
                    title="Delete this payment method?"
                    description="Are you sure you want to delete this payment method?"
                    onConfirm={() => deletePaymentMethod(method.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button 
                      icon={<DeleteOutlined />} 
                      size="small"
                      danger
                    />
                  </Popconfirm>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
      
      {/* Payment Method Modal */}
      <Modal
        title="Add Payment Method"
        open={paymentModalVisible}
        onCancel={() => {
          setPaymentModalVisible(false);
          paymentForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handleSavePayment}
          initialValues={{
            type: 'Credit Card',
            isDefault: paymentMethods.length === 0
          }}
        >
          <Form.Item
            name="type"
            label="Payment Method Type"
            rules={[{ required: true, message: 'Please select payment method type' }]}
          >
            <Select>
              <Select.Option value="Credit Card">Credit/Debit Card</Select.Option>
              <Select.Option value="UPI">UPI</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) => 
              getFieldValue('type') === 'Credit Card' ? (
                <>
                  <Form.Item
                    name="cardNumber"
                    label="Card Number"
                    rules={[
                      { required: true, message: 'Please enter card number' },
                      { pattern: /^[0-9]{16}$/, message: 'Please enter a valid 16-digit card number' }
                    ]}
                  >
                    <Input placeholder="Card Number" maxLength={16} />
                  </Form.Item>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                      name="cardHolderName"
                      label="Card Holder Name"
                      rules={[{ required: true, message: 'Please enter card holder name' }]}
                    >
                      <Input placeholder="Name on card" />
                    </Form.Item>
                    
                    <Form.Item
                      name="expiryDate"
                      label="Expiry Date"
                      rules={[
                        { required: true, message: 'Please enter expiry date' },
                        { pattern: /^(0[1-9]|1[0-2])\/[0-9]{2}$/, message: 'Please enter a valid expiry date (MM/YY)' }
                      ]}
                    >
                      <Input placeholder="MM/YY" maxLength={5} />
                    </Form.Item>
                  </div>
                  
                  <Form.Item
                    name="cvv"
                    label="CVV"
                    rules={[
                      { required: true, message: 'Please enter CVV' },
                      { pattern: /^[0-9]{3,4}$/, message: 'Please enter a valid CVV' }
                    ]}
                  >
                    <Input placeholder="CVV" maxLength={4} />
                  </Form.Item>
                </>
              ) : (
                <Form.Item
                  name="upiId"
                  label="UPI ID"
                  rules={[
                    { required: true, message: 'Please enter UPI ID' },
                    { pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/, message: 'Please enter a valid UPI ID' }
                  ]}
                >
                  <Input placeholder="yourname@upi" />
                </Form.Item>
              )
            }
          </Form.Item>
          
          <Form.Item name="isDefault" valuePropName="checked">
            <Switch checkedChildren="Default Payment Method" unCheckedChildren="Set as Default" />
          </Form.Item>
          
          <div className="flex justify-end gap-2">
            <Button 
              onClick={() => {
                setPaymentModalVisible(false);
                paymentForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Save Payment Method
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );

  const renderNotificationsTab = () => (
    <div>
      <Title level={4}>Notification Preferences</Title>
      <Paragraph className="mb-6">
        Manage how you receive notifications and updates
      </Paragraph>
      
      <Card title="Email Notifications" className="mb-6">
        <List
          itemLayout="horizontal"
          dataSource={[
            {
              key: 'emailNotifications',
              title: 'Email Notifications',
              description: 'Receive all notifications via email',
              checked: notificationSettings.emailNotifications
            },
            {
              key: 'orderUpdates',
              title: 'Order Updates',
              description: 'Receive updates about your orders via email',
              checked: notificationSettings.orderUpdates
            },
            {
              key: 'promotions',
              title: 'Promotions & Deals',
              description: 'Receive emails about promotions, discounts, and special offers',
              checked: notificationSettings.promotions
            }
          ]}
          renderItem={item => (
            <List.Item
              actions={[
                <Switch 
                  checked={item.checked} 
                  onChange={(checked) => handleNotificationChange(item.key, checked)} 
                />
              ]}
            >
              <List.Item.Meta
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>
      
      <Card title="App Notifications">
        <List
          itemLayout="horizontal"
          dataSource={[
            {
              key: 'appNotifications',
              title: 'App Notifications',
              description: 'Receive push notifications in the app',
              checked: notificationSettings.appNotifications
            },
            {
              key: 'urgentSales',
              title: 'Urgent Sales Alerts',
              description: 'Get notified about urgent sales from vendors',
              checked: notificationSettings.urgentSales
            },
            {
              key: 'freeFood',
              title: 'Free Food Listings',
              description: 'Get notified when free food is listed by restaurants',
              checked: notificationSettings.freeFood
            }
          ]}
          renderItem={item => (
            <List.Item
              actions={[
                <Switch 
                  checked={item.checked} 
                  onChange={(checked) => handleNotificationChange(item.key, checked)} 
                />
              ]}
            >
              <List.Item.Meta
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80vh">
        <Spin size="large" tip="Loading your profile..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Title level={2}>
        <UserOutlined className="mr-2" /> Profile Management
      </Title>
      <Text type="secondary" className="mb-6 block">
        Manage your personal information, addresses, and payment methods
      </Text>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
      >
        <TabPane 
          tab={
            <span>
              <UserOutlined />
              Profile
            </span>
          } 
          key="1"
        >
          {renderProfileTab()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <SafetyCertificateOutlined />
              Security
            </span>
          } 
          key="2"
        >
          {renderSecurityTab()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <HomeOutlined />
              Addresses
            </span>
          } 
          key="3"
        >
          {renderAddressesTab()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <CreditCardOutlined />
              Payment Methods
            </span>
          } 
          key="4"
        >
          {renderPaymentTab()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <BellOutlined />
              Notifications
            </span>
          } 
          key="5"
        >
          {renderNotificationsTab()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProfileManagement; 