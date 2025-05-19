import React, { useState, useEffect } from 'react';
import {
  Card, Steps, Typography, Form, Input, Button, Radio, Space,
  Divider, Row, Col, List, Avatar, Tag, Checkbox, Alert,
  Descriptions, Spin, Result, Modal, Collapse
} from 'antd';
import {
  CreditCardOutlined, BankOutlined, WalletOutlined,
  LockOutlined, CheckCircleOutlined, DollarOutlined,
  ShoppingCartOutlined, InfoCircleOutlined, UserOutlined,
  HomeOutlined, PhoneOutlined, EnvironmentOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Panel } = Collapse;

const PaymentGateway = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderDetails, setOrderDetails] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [saveCard, setSaveCard] = useState(false);
  const [cardForm] = Form.useForm();
  const [upiForm] = Form.useForm();
  const [netBankingForm] = Form.useForm();
  const [walletForm] = Form.useForm();
  const [codForm] = Form.useForm();
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  useEffect(() => {
    // Simulating API call to fetch order details and user addresses
    setTimeout(() => {
      // Mock order details
      const mockOrderDetails = {
        items: [
          {
            id: 1,
            name: 'Fresh Tomatoes',
            quantity: 2,
            price: 40.00,
            image: 'https://via.placeholder.com/80x80',
            seller: 'Fresh Veggies Store'
          },
          {
            id: 2,
            name: 'Organic Potatoes',
            quantity: 3,
            price: 35.00,
            image: 'https://via.placeholder.com/80x80',
            seller: 'Organic Farms'
          }
        ],
        subtotal: 185.00,
        deliveryFee: 50.00,
        tax: 18.50,
        total: 253.50,
        discount: 0
      };

      // Mock user addresses
      const mockAddresses = [
        {
          id: 1,
          name: 'John Doe',
          phone: '+91 98765 43210',
          address: '123 Main St, Apartment 4B',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          isDefault: true
        },
        {
          id: 2,
          name: 'John Doe',
          phone: '+91 98765 43210',
          address: '456 Work Ave, Office 7',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400002',
          isDefault: false
        }
      ];

      // Mock saved cards
      const mockSavedCards = [
        {
          id: 1,
          cardNumber: '**** **** **** 1234',
          cardHolder: 'John Doe',
          expiryDate: '12/25',
          cardType: 'visa'
        },
        {
          id: 2,
          cardNumber: '**** **** **** 5678',
          cardHolder: 'John Doe',
          expiryDate: '09/24',
          cardType: 'mastercard'
        }
      ];

      setOrderDetails(mockOrderDetails);
      setAddresses(mockAddresses);
      setSelectedAddress(mockAddresses.find(addr => addr.isDefault) || mockAddresses[0]);
      setSavedCards(mockSavedCards);
      setLoading(false);
    }, 1500);
  }, []);

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setSelectedCard(null);
  };

  const handleCardSelect = (card) => {
    setSelectedCard(card);
  };

  const handleSaveCardChange = (e) => {
    setSaveCard(e.target.checked);
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handlePayment = async () => {
    setProcessingPayment(true);
    setPaymentError(null);

    // Simulating payment processing
    setTimeout(() => {
      // Simulate successful payment (90% chance)
      const isSuccess = Math.random() < 0.9;

      if (isSuccess) {
        setPaymentComplete(true);
      } else {
        setPaymentError('Payment failed. Please try again or use a different payment method.');
      }
      setProcessingPayment(false);
    }, 3000);
  };

  const handleCardPayment = async (values) => {
    console.log('Card payment values:', values);
    handlePayment();
  };

  const handleUpiPayment = async (values) => {
    console.log('UPI payment values:', values);
    handlePayment();
  };

  const handleNetBankingPayment = async (values) => {
    console.log('Net Banking payment values:', values);
    handlePayment();
  };

  const handleWalletPayment = async (values) => {
    console.log('Wallet payment values:', values);
    handlePayment();
  };

  const handleCodPayment = async (values) => {
    console.log('COD payment values:', values);
    handlePayment();
  };

  const handleOrderComplete = () => {
    navigate('/user/orders');
  };

  const renderAddressSelection = () => (
    <div>
      <Title level={4}>Select Delivery Address</Title>
      <List
        dataSource={addresses}
        renderItem={(address) => (
          <List.Item
            onClick={() => handleAddressSelect(address)}
            className={`cursor-pointer border p-4 rounded mb-4 ${selectedAddress?.id === address.id ? 'border-primary bg-blue-50' : ''}`}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<HomeOutlined />} />}
              title={
                <Space>
                  <Text strong>{address.name}</Text>
                  {address.isDefault && <Tag color="blue">Default</Tag>}
                </Space>
              }
              description={
                <Space direction="vertical">
                  <Text><PhoneOutlined className="mr-2" />{address.phone}</Text>
                  <Text>
                    <EnvironmentOutlined className="mr-2" />
                    {address.address}, {address.city}, {address.state} - {address.pincode}
                  </Text>
                </Space>
              }
            />
            <Radio checked={selectedAddress?.id === address.id} />
          </List.Item>
        )}
      />
      <div className="flex justify-between mt-4">
        <Button>Add New Address</Button>
        <Button type="primary" onClick={handleNext} disabled={!selectedAddress}>
          Deliver to this Address
        </Button>
      </div>
    </div>
  );

  const renderPaymentMethods = () => (
    <div>
      <Title level={4}>Select Payment Method</Title>
      <Radio.Group
        onChange={handlePaymentMethodChange}
        value={paymentMethod}
        className="w-full"
      >
        <Space direction="vertical" className="w-full">
          <Card className={`mb-4 ${paymentMethod === 'card' ? 'border-primary' : ''}`}>
            <Radio value="card">
              <Space>
                <CreditCardOutlined />
                <span>Credit / Debit Card</span>
              </Space>
            </Radio>
            {paymentMethod === 'card' && (
              <div className="mt-4 ml-6">
                {savedCards.length > 0 && (
                  <div className="mb-4">
                    <Text strong>Saved Cards</Text>
                    <List
                      dataSource={savedCards}
                      renderItem={(card) => (
                        <List.Item
                          onClick={() => handleCardSelect(card)}
                          className={`cursor-pointer border p-2 rounded mb-2 ${selectedCard?.id === card.id ? 'border-primary bg-blue-50' : ''}`}
                        >
                          <List.Item.Meta
                            avatar={<CreditCardOutlined />}
                            title={card.cardNumber}
                            description={`${card.cardHolder} | Expires: ${card.expiryDate}`}
                          />
                          <Radio checked={selectedCard?.id === card.id} />
                        </List.Item>
                      )}
                    />
                    <Divider>Or Use a New Card</Divider>
                  </div>
                )}
                <Form
                  form={cardForm}
                  layout="vertical"
                  onFinish={handleCardPayment}
                  disabled={selectedCard !== null}
                >
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        name="cardNumber"
                        label="Card Number"
                        rules={[{ required: true, message: 'Please enter card number' }]}
                      >
                        <Input
                          prefix={<CreditCardOutlined />}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="expiryDate"
                        label="Expiry Date (MM/YY)"
                        rules={[{ required: true, message: 'Please enter expiry date' }]}
                      >
                        <Input placeholder="MM/YY" maxLength={5} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="cvv"
                        label="CVV"
                        rules={[{ required: true, message: 'Please enter CVV' }]}
                      >
                        <Input
                          prefix={<LockOutlined />}
                          placeholder="123"
                          maxLength={3}
                          type="password"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        name="cardHolder"
                        label="Card Holder Name"
                        rules={[{ required: true, message: 'Please enter card holder name' }]}
                      >
                        <Input
                          prefix={<UserOutlined />}
                          placeholder="John Doe"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item>
                    <Checkbox
                      checked={saveCard}
                      onChange={handleSaveCardChange}
                    >
                      Save this card for future payments
                    </Checkbox>
                  </Form.Item>
                </Form>
              </div>
            )}
          </Card>

          <Card className={`mb-4 ${paymentMethod === 'upi' ? 'border-primary' : ''}`}>
            <Radio value="upi">
              <Space>
                <BankOutlined />
                <span>UPI</span>
              </Space>
            </Radio>
            {paymentMethod === 'upi' && (
              <div className="mt-4 ml-6">
                <Form
                  form={upiForm}
                  layout="vertical"
                  onFinish={handleUpiPayment}
                >
                  <Form.Item
                    name="upiId"
                    label="UPI ID"
                    rules={[{ required: true, message: 'Please enter UPI ID' }]}
                  >
                    <Input placeholder="username@upi" />
                  </Form.Item>
                </Form>
              </div>
            )}
          </Card>

          <Card className={`mb-4 ${paymentMethod === 'netbanking' ? 'border-primary' : ''}`}>
            <Radio value="netbanking">
              <Space>
                <BankOutlined />
                <span>Net Banking</span>
              </Space>
            </Radio>
            {paymentMethod === 'netbanking' && (
              <div className="mt-4 ml-6">
                <Form
                  form={netBankingForm}
                  layout="vertical"
                  onFinish={handleNetBankingPayment}
                >
                  <Form.Item
                    name="bank"
                    label="Select Bank"
                    rules={[{ required: true, message: 'Please select a bank' }]}
                  >
                    <Radio.Group>
                      <Space direction="vertical">
                        <Radio value="sbi">State Bank of India</Radio>
                        <Radio value="hdfc">HDFC Bank</Radio>
                        <Radio value="icici">ICICI Bank</Radio>
                        <Radio value="axis">Axis Bank</Radio>
                        <Radio value="other">Other Banks</Radio>
                      </Space>
                    </Radio.Group>
                  </Form.Item>
                </Form>
              </div>
            )}
          </Card>

          <Card className={`mb-4 ${paymentMethod === 'wallet' ? 'border-primary' : ''}`}>
            <Radio value="wallet">
              <Space>
                <WalletOutlined />
                <span>Wallet</span>
              </Space>
            </Radio>
            {paymentMethod === 'wallet' && (
              <div className="mt-4 ml-6">
                <Form
                  form={walletForm}
                  layout="vertical"
                  onFinish={handleWalletPayment}
                >
                  <Form.Item
                    name="wallet"
                    label="Select Wallet"
                    rules={[{ required: true, message: 'Please select a wallet' }]}
                  >
                    <Radio.Group>
                      <Space direction="vertical">
                        <Radio value="paytm">Paytm</Radio>
                        <Radio value="phonepe">PhonePe</Radio>
                        <Radio value="amazonpay">Amazon Pay</Radio>
                        <Radio value="mobikwik">MobiKwik</Radio>
                      </Space>
                    </Radio.Group>
                  </Form.Item>
                </Form>
              </div>
            )}
          </Card>

          <Card className={`mb-4 ${paymentMethod === 'cod' ? 'border-primary' : ''}`}>
            <Radio value="cod">
              <Space>
                <DollarOutlined />
                <span>Cash on Delivery</span>
              </Space>
            </Radio>
            {paymentMethod === 'cod' && (
              <div className="mt-4 ml-6">
                <Alert
                  message="Additional charges may apply for Cash on Delivery"
                  type="info"
                  showIcon
                  className="mb-4"
                />
                <Form
                  form={codForm}
                  layout="vertical"
                  onFinish={handleCodPayment}
                >
                  <Form.Item
                    name="agreement"
                    valuePropName="checked"
                    rules={[
                      {
                        validator: (_, value) =>
                          value ? Promise.resolve() : Promise.reject(new Error('Please confirm the terms')),
                      },
                    ]}
                  >
                    <Checkbox>
                      I agree to pay the full amount at the time of delivery
                    </Checkbox>
                  </Form.Item>
                </Form>
              </div>
            )}
          </Card>
        </Space>
      </Radio.Group>

      <div className="flex justify-between mt-4">
        <Button onClick={handlePrev}>
          Back
        </Button>
        <Button
          type="primary"
          onClick={() => {
            switch (paymentMethod) {
              case 'card':
                if (selectedCard) {
                  handlePayment();
                } else {
                  cardForm.submit();
                }
                break;
              case 'upi':
                upiForm.submit();
                break;
              case 'netbanking':
                netBankingForm.submit();
                break;
              case 'wallet':
                walletForm.submit();
                break;
              case 'cod':
                codForm.submit();
                break;
              default:
                break;
            }
          }}
          disabled={processingPayment}
        >
          {processingPayment ? 'Processing...' : 'Pay Now'}
        </Button>
      </div>
    </div>
  );

  const renderOrderSummary = () => (
    <Card title="Order Summary" className="mb-4">
      <List
        dataSource={orderDetails.items}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={item.image} shape="square" />}
              title={item.name}
              description={`Qty: ${item.quantity} x ₹${item.price.toFixed(2)}`}
            />
            <div>₹{(item.quantity * item.price).toFixed(2)}</div>
          </List.Item>
        )}
      />
      <Divider />
      <div className="flex justify-between mb-2">
        <Text>Subtotal</Text>
        <Text>₹{orderDetails.subtotal.toFixed(2)}</Text>
      </div>
      <div className="flex justify-between mb-2">
        <Text>Delivery Fee</Text>
        <Text>₹{orderDetails.deliveryFee.toFixed(2)}</Text>
      </div>
      <div className="flex justify-between mb-2">
        <Text>Tax</Text>
        <Text>₹{orderDetails.tax.toFixed(2)}</Text>
      </div>
      {orderDetails.discount > 0 && (
        <div className="flex justify-between mb-2">
          <Text type="success">Discount</Text>
          <Text type="success">-₹{orderDetails.discount.toFixed(2)}</Text>
        </div>
      )}
      <Divider />
      <div className="flex justify-between">
        <Text strong>Total</Text>
        <Text strong>₹{orderDetails.total.toFixed(2)}</Text>
      </div>
    </Card>
  );

  const renderPaymentConfirmation = () => (
    <div className="text-center">
      {paymentComplete ? (
        <Result
          status="success"
          title="Payment Successful!"
          subTitle={`Your order has been placed. Order ID: ORD-${Date.now().toString().slice(-6)}`}
          extra={[
            <Button type="primary" key="console" onClick={handleOrderComplete}>
              View My Orders
            </Button>,
            <Button key="buy" onClick={() => navigate('/')}>Continue Shopping</Button>,
          ]}
        />
      ) : (
        <div>
          {paymentError && (
            <Alert
              message="Payment Failed"
              description={paymentError}
              type="error"
              showIcon
              className="mb-4"
            />
          )}
          <Button type="primary" onClick={handlePayment} loading={processingPayment}>
            Try Again
          </Button>
          <Button onClick={handlePrev} className="ml-4" disabled={processingPayment}>
            Change Payment Method
          </Button>
        </div>
      )}
    </div>
  );

  const steps = [
    {
      title: 'Address',
      content: renderAddressSelection,
      icon: <HomeOutlined />
    },
    {
      title: 'Payment',
      content: renderPaymentMethods,
      icon: <CreditCardOutlined />
    },
    {
      title: 'Confirmation',
      content: renderPaymentConfirmation,
      icon: <CheckCircleOutlined />
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Loading payment details..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Title level={2}>Checkout</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card className="mb-6">
            <Steps current={currentStep}>
              {steps.map((step) => (
                <Step key={step.title} title={step.title} icon={step.icon} />
              ))}
            </Steps>
            <div className="mt-8">
              {steps[currentStep].content()}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          {orderDetails && (
            <>
              <div className="lg:hidden mb-4">
                <Button 
                  type="link" 
                  onClick={() => setShowOrderSummary(!showOrderSummary)}
                  block
                >
                  {showOrderSummary ? 'Hide Order Summary' : 'Show Order Summary'} (₹{orderDetails.total.toFixed(2)})
                </Button>
                {showOrderSummary && renderOrderSummary()}
              </div>
              <div className="hidden lg:block">
                {renderOrderSummary()}
              </div>
            </>
          )}

          <Card title="Delivery Address" className="mb-4">
            {selectedAddress ? (
              <Space direction="vertical">
                <Text strong>{selectedAddress.name}</Text>
                <Text>{selectedAddress.phone}</Text>
                <Text>
                  {selectedAddress.address}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                </Text>
              </Space>
            ) : (
              <Text type="secondary">No address selected</Text>
            )}
          </Card>

          <Collapse>
            <Panel header="Need Help?" key="1">
              <Space direction="vertical">
                <Text>
                  <QuestionCircleOutlined className="mr-2" />
                  Having trouble with your payment?
                </Text>
                <Text>
                  <PhoneOutlined className="mr-2" />
                  Call us at: +91 1800 123 4567
                </Text>
                <Text>
                  <MailOutlined className="mr-2" />
                  Email: support@example.com
                </Text>
              </Space>
            </Panel>
            <Panel header="Secure Payment" key="2">
              <Space direction="vertical">
                <Text>
                  <LockOutlined className="mr-2" />
                  All transactions are secure and encrypted
                </Text>
                <Text>
                  <InfoCircleOutlined className="mr-2" />
                  We do not store your card details
                </Text>
              </Space>
            </Panel>
          </Collapse>
        </Col>
      </Row>
    </div>
  );
};

export default PaymentGateway; 