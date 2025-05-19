import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Steps, 
  Button, 
  Upload, 
  message, 
  Divider, 
  Alert, 
  Space, 
  Descriptions, 
  Badge, 
  Spin,
  Modal,
  Form,
  Input,
  Checkbox,
  Progress,
  List,
  Avatar
} from 'antd';
import { 
  UploadOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  SafetyCertificateOutlined,
  InfoCircleOutlined,
  FileOutlined,
  PictureOutlined,
  IdcardOutlined,
  BankOutlined,
  ShopOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Dragger } = Upload;

const VerifiedBadge = () => {
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // 'pending', 'in-review', 'verified', 'rejected'
  const [documents, setDocuments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [benefits, setBenefits] = useState([]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setVerificationStatus('in-review');
      setCurrentStep(2);
      setDocuments([
        { name: 'Business License', status: 'uploaded', date: '2023-06-01' },
        { name: 'Food Safety Certificate', status: 'uploaded', date: '2023-06-01' },
        { name: 'Restaurant Photos', status: 'uploaded', date: '2023-06-01' },
        { name: 'Owner ID', status: 'uploaded', date: '2023-06-01' },
      ]);
      setBenefits([
        { 
          title: 'Increased Visibility', 
          description: 'Verified restaurants appear higher in search results and get a special badge that builds trust with customers.',
          icon: <ShopOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
        },
        { 
          title: 'Access to Premium Features', 
          description: 'Unlock special promotional tools and advanced analytics to grow your business.',
          icon: <SafetyCertificateOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
        },
        { 
          title: 'Priority Support', 
          description: 'Get faster responses from our customer service team and dedicated account management.',
          icon: <CheckCircleOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
        },
        { 
          title: 'Customer Trust', 
          description: 'The verified badge signals to customers that your restaurant meets our high quality and safety standards.',
          icon: <IdcardOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />
        },
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  const steps = [
    {
      title: 'Apply',
      description: 'Submit application',
      icon: <FileOutlined />,
    },
    {
      title: 'Upload',
      description: 'Upload documents',
      icon: <UploadOutlined />,
    },
    {
      title: 'Review',
      description: 'Under review',
      icon: <ClockCircleOutlined />,
    },
    {
      title: 'Verified',
      description: 'Get verified badge',
      icon: <SafetyCertificateOutlined />,
    },
  ];

  const uploadProps = {
    name: 'file',
    multiple: true,
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      console.log('Form values:', values);
      message.success('Application submitted successfully!');
      setIsModalVisible(false);
      setCurrentStep(1);
    });
  };

  const renderContent = () => {
    if (verificationStatus === 'verified') {
      return (
        <Card className="text-center">
          <div className="py-6">
            <div className="text-6xl text-green-500 mb-4">
              <SafetyCertificateOutlined />
            </div>
            <Title level={3}>Congratulations! Your Restaurant is Verified</Title>
            <Paragraph>
              Your restaurant has been verified and now displays the verified badge to all users.
              This badge helps build trust with customers and gives you access to premium features.
            </Paragraph>
            
            <div className="my-8">
              <Badge.Ribbon text="Verified" color="green">
                <Card title="Your Restaurant" className="w-full max-w-md mx-auto">
                  <div className="flex items-center">
                    <Avatar size={64} src="https://via.placeholder.com/150" />
                    <div className="ml-4 text-left">
                      <Title level={4} className="mb-0">Your Restaurant Name</Title>
                      <Text type="secondary">Premium Verified Member</Text>
                    </div>
                  </div>
                </Card>
              </Badge.Ribbon>
            </div>
            
            <Descriptions title="Verification Details" bordered className="mt-8">
              <Descriptions.Item label="Status" span={3}>
                <Badge status="success" text="Verified" />
              </Descriptions.Item>
              <Descriptions.Item label="Verified Since" span={3}>June 15, 2023</Descriptions.Item>
              <Descriptions.Item label="Valid Until" span={3}>June 15, 2024</Descriptions.Item>
              <Descriptions.Item label="Verification ID" span={3}>VER-12345-ABCDE</Descriptions.Item>
            </Descriptions>
            
            <div className="mt-8">
              <Button type="primary" size="large">
                Access Premium Features
              </Button>
            </div>
          </div>
        </Card>
      );
    } else if (verificationStatus === 'rejected') {
      return (
        <Card>
          <Alert
            message="Verification Rejected"
            description="Unfortunately, your verification request has been rejected. Please review the feedback below and resubmit your application."
            type="error"
            showIcon
            className="mb-6"
          />
          
          <Card title="Feedback from Reviewer" className="mb-6">
            <Paragraph>
              We were unable to verify your restaurant due to the following reasons:
            </Paragraph>
            <ul className="list-disc pl-6 mb-4">
              <li>The business license provided has expired</li>
              <li>The food safety certificate is not clearly visible</li>
              <li>We need additional photos of your restaurant interior</li>
            </ul>
            <Paragraph>
              Please address these issues and resubmit your application.
            </Paragraph>
          </Card>
          
          <div className="text-center">
            <Button type="primary" onClick={showModal}>
              Reapply for Verification
            </Button>
          </div>
        </Card>
      );
    } else if (verificationStatus === 'in-review') {
      return (
        <Card>
          <Alert
            message="Verification In Progress"
            description="Your verification request is currently being reviewed by our team. This process typically takes 2-3 business days."
            type="info"
            showIcon
            className="mb-6"
          />
          
          <div className="mb-6">
            <Title level={4}>Submitted Documents</Title>
            <List
              itemLayout="horizontal"
              dataSource={documents}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Badge status="success" text="Uploaded" />
                  ]}
                >
                  <List.Item.Meta
                    avatar={<FileOutlined style={{ fontSize: '24px' }} />}
                    title={item.name}
                    description={`Uploaded on ${item.date}`}
                  />
                </List.Item>
              )}
            />
          </div>
          
          <div className="text-center">
            <Space>
              <Button type="default">
                Contact Support
              </Button>
              <Button type="primary" danger>
                Cancel Application
              </Button>
            </Space>
          </div>
        </Card>
      );
    } else if (verificationStatus === 'pending' && currentStep === 1) {
      return (
        <Card>
          <Title level={4}>Upload Required Documents</Title>
          <Paragraph className="mb-6">
            Please upload the following documents to verify your restaurant. All documents must be clear, legible, and up-to-date.
          </Paragraph>
          
          <div className="mb-6">
            <Title level={5}>1. Business License</Title>
            <Dragger {...uploadProps} className="mb-4">
              <p className="ant-upload-drag-icon">
                <IdcardOutlined />
              </p>
              <p className="ant-upload-text">Click or drag your business license to this area to upload</p>
              <p className="ant-upload-hint">
                Must be a valid and current business license issued by your local government
              </p>
            </Dragger>
          </div>
          
          <div className="mb-6">
            <Title level={5}>2. Food Safety Certificate</Title>
            <Dragger {...uploadProps} className="mb-4">
              <p className="ant-upload-drag-icon">
                <SafetyCertificateOutlined />
              </p>
              <p className="ant-upload-text">Click or drag your food safety certificate to this area to upload</p>
              <p className="ant-upload-hint">
                Must be a current food safety or health department certificate
              </p>
            </Dragger>
          </div>
          
          <div className="mb-6">
            <Title level={5}>3. Restaurant Photos</Title>
            <Dragger {...uploadProps} className="mb-4">
              <p className="ant-upload-drag-icon">
                <PictureOutlined />
              </p>
              <p className="ant-upload-text">Click or drag restaurant photos to this area to upload</p>
              <p className="ant-upload-hint">
                Upload at least 3 photos of your restaurant (interior, exterior, and kitchen)
              </p>
            </Dragger>
          </div>
          
          <div className="mb-6">
            <Title level={5}>4. Owner Identification</Title>
            <Dragger {...uploadProps} className="mb-4">
              <p className="ant-upload-drag-icon">
                <IdcardOutlined />
              </p>
              <p className="ant-upload-text">Click or drag owner ID to this area to upload</p>
              <p className="ant-upload-hint">
                Government-issued ID of the restaurant owner or authorized representative
              </p>
            </Dragger>
          </div>
          
          <div className="text-center">
            <Button type="primary" onClick={() => setCurrentStep(2)}>
              Submit Documents for Review
            </Button>
          </div>
        </Card>
      );
    } else {
      return (
        <Card>
          <div className="text-center mb-8">
            <SafetyCertificateOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            <Title level={3} className="mt-4">Get Verified Badge for Your Restaurant</Title>
            <Paragraph>
              The verified badge helps build trust with customers and gives your restaurant more visibility on our platform.
            </Paragraph>
          </div>
          
          <div className="mb-8">
            <Title level={4}>Benefits of Verification</Title>
            <List
              itemLayout="horizontal"
              dataSource={benefits}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={item.icon}
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </div>
          
          <div className="mb-8">
            <Title level={4}>Verification Requirements</Title>
            <Paragraph>
              To get verified, you'll need to provide the following documents:
            </Paragraph>
            <ul className="list-disc pl-6 mb-4">
              <li>Valid business license</li>
              <li>Food safety certificate</li>
              <li>Restaurant photos (interior, exterior, kitchen)</li>
              <li>Owner identification</li>
            </ul>
          </div>
          
          <div className="text-center">
            <Button type="primary" size="large" onClick={showModal}>
              Apply for Verification
            </Button>
          </div>
        </Card>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
        <Text className="ml-3">Loading verification status...</Text>
      </div>
    );
  }

  return (
    <div className="verified-badge-container">
      <div className="page-header mb-6">
        <Title level={2}>Verified Badge</Title>
        <Text type="secondary">Get verified to build trust with customers and access premium features</Text>
      </div>

      {/* Verification Progress */}
      <Card className="mb-6">
        <Steps current={currentStep}>
          {steps.map(item => (
            <Step 
              key={item.title} 
              title={item.title} 
              description={item.description}
              icon={item.icon}
            />
          ))}
        </Steps>
      </Card>

      {/* Main Content */}
      {renderContent()}

      {/* Application Modal */}
      <Modal
        title="Restaurant Verification Application"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            Submit Application
          </Button>,
        ]}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          name="verificationForm"
        >
          <Form.Item
            name="restaurantName"
            label="Restaurant Name"
            rules={[{ required: true, message: 'Please enter your restaurant name' }]}
          >
            <Input placeholder="Enter restaurant name as it appears on your business license" />
          </Form.Item>

          <Form.Item
            name="businessAddress"
            label="Business Address"
            rules={[{ required: true, message: 'Please enter your business address' }]}
          >
            <Input.TextArea rows={2} placeholder="Enter your complete business address" />
          </Form.Item>

          <Form.Item
            name="businessLicenseNumber"
            label="Business License Number"
            rules={[{ required: true, message: 'Please enter your business license number' }]}
          >
            <Input placeholder="Enter your business license number" />
          </Form.Item>

          <Form.Item
            name="ownerName"
            label="Owner/Manager Name"
            rules={[{ required: true, message: 'Please enter owner/manager name' }]}
          >
            <Input placeholder="Enter the name of the owner or authorized manager" />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Contact Phone Number"
            rules={[{ required: true, message: 'Please enter your contact phone number' }]}
          >
            <Input placeholder="Enter your business phone number" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Contact Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Enter your business email" />
          </Form.Item>

          <Form.Item
            name="restaurantType"
            label="Restaurant Type"
            rules={[{ required: true, message: 'Please enter your restaurant type' }]}
          >
            <Input placeholder="E.g., Fine Dining, Casual, Fast Food, Cafe, etc." />
          </Form.Item>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('You must agree to the terms')),
              },
            ]}
          >
            <Checkbox>
              I confirm that all information provided is accurate and I agree to the verification process and terms of service
            </Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VerifiedBadge; 