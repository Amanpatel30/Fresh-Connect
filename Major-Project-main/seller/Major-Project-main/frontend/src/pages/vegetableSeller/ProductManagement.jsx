import React, { useState, useEffect } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, InputNumber, Select,
  Upload, message, Tag, Card, Typography, Row, Col, Tooltip, Switch,
  Popconfirm, Badge, Drawer
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  UploadOutlined, SearchOutlined, FilterOutlined, TagOutlined,
  DollarOutlined, BarChartOutlined, InboxOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [imageUrl, setImageUrl] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    // Simulating API call to fetch products
    setTimeout(() => {
      const mockProducts = [
        {
          id: 1,
          name: 'Fresh Tomatoes',
          category: 'Vegetables',
          price: 40.00,
          stock: 100,
          unit: 'kg',
          organic: true,
          description: 'Fresh, ripe tomatoes from local farms',
          image: 'https://via.placeholder.com/150',
          minOrder: 1,
          maxOrder: 50,
          rating: 4.5,
          sales: 234,
          status: 'active'
        },
        {
          id: 2,
          name: 'Organic Potatoes',
          category: 'Root Vegetables',
          price: 35.00,
          stock: 150,
          unit: 'kg',
          organic: true,
          description: 'Organic potatoes, perfect for cooking',
          image: 'https://via.placeholder.com/150',
          minOrder: 2,
          maxOrder: 30,
          rating: 4.3,
          sales: 189,
          status: 'active'
        },
        // Add more mock products as needed
      ];
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddProduct = () => {
    setEditMode(false);
    setSelectedProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditProduct = (product) => {
    setEditMode(true);
    setSelectedProduct(product);
    form.setFieldsValue({
      ...product,
      category: product.category,
      status: product.status
    });
    setModalVisible(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setDrawerVisible(true);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      // Simulating API call to delete product
      setProducts(products.filter(product => product.id !== productId));
      message.success('Product deleted successfully');
    } catch (error) {
      message.error('Failed to delete product');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editMode) {
        // Simulating API call to update product
        const updatedProducts = products.map(product =>
          product.id === selectedProduct.id ? { ...product, ...values } : product
        );
        setProducts(updatedProducts);
        message.success('Product updated successfully');
      } else {
        // Simulating API call to create product
        const newProduct = {
          id: products.length + 1,
          ...values,
          rating: 0,
          sales: 0
        };
        setProducts([...products, newProduct]);
        message.success('Product added successfully');
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const handleImageUpload = (info) => {
    if (info.file.status === 'done') {
      setImageUrl(info.file.response.url);
      message.success('Image uploaded successfully');
    }
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <img
            src={record.image}
            alt={text}
            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
          />
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ID: {record.id}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <Text strong>₹{price.toFixed(2)}/{products.find(p => p.price === price)?.unit}</Text>
      ),
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <Badge
          status={stock > 20 ? 'success' : stock > 5 ? 'warning' : 'error'}
          text={`${stock} ${products.find(p => p.stock === stock)?.unit}`}
        />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewProduct(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditProduct(record)}
              size="small"
              type="primary"
              ghost
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this product?"
              onConfirm={() => handleDeleteProduct(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>Product Management</Title>
            <Text type="secondary">Manage your product listings</Text>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddProduct}
            >
              Add New Product
            </Button>
          </Col>
        </Row>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{
            total: products.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} products`
          }}
        />
      </Card>

      <Modal
        title={editMode ? 'Edit Product' : 'Add New Product'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Product Name"
                rules={[{ required: true, message: 'Please enter product name' }]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  <Option value="Vegetables">Vegetables</Option>
                  <Option value="Root Vegetables">Root Vegetables</Option>
                  <Option value="Leafy Greens">Leafy Greens</Option>
                  <Option value="Organic">Organic</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Price"
                rules={[{ required: true, message: 'Please enter price' }]}
              >
                <InputNumber
                  prefix="₹"
                  min={0}
                  step={0.01}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="stock"
                label="Stock"
                rules={[{ required: true, message: 'Please enter stock quantity' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unit"
                label="Unit"
                rules={[{ required: true, message: 'Please select unit' }]}
              >
                <Select placeholder="Select unit">
                  <Option value="kg">Kilogram (kg)</Option>
                  <Option value="g">Gram (g)</Option>
                  <Option value="piece">Piece</Option>
                  <Option value="bundle">Bundle</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="minOrder"
                label="Minimum Order"
                rules={[{ required: true, message: 'Please enter minimum order' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxOrder"
                label="Maximum Order"
                rules={[{ required: true, message: 'Please enter maximum order' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={4} placeholder="Enter product description" />
          </Form.Item>

          <Form.Item
            name="image"
            label="Product Image"
          >
            <Upload
              name="image"
              listType="picture-card"
              showUploadList={false}
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              onChange={handleImageUpload}
            >
              {imageUrl ? (
                <img src={imageUrl} alt="product" style={{ width: '100%' }} />
              ) : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="organic"
                label="Organic"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                initialValue="active"
              >
                <Select>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="out_of_stock">Out of Stock</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editMode ? 'Update Product' : 'Add Product'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="Product Details"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        width={600}
      >
        {selectedProduct && (
          <div>
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8 }}
            />
            <div className="mt-4">
              <Title level={3}>{selectedProduct.name}</Title>
              <Tag color="blue">{selectedProduct.category}</Tag>
              {selectedProduct.organic && <Tag color="green">Organic</Tag>}
            </div>
            <div className="mt-4">
              <Text type="secondary">Description</Text>
              <Paragraph>{selectedProduct.description}</Paragraph>
            </div>
            <Row gutter={16} className="mt-4">
              <Col span={8}>
                <Statistic
                  title="Price"
                  value={selectedProduct.price}
                  prefix="₹"
                  suffix={`/${selectedProduct.unit}`}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Stock"
                  value={selectedProduct.stock}
                  suffix={selectedProduct.unit}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Sales"
                  value={selectedProduct.sales}
                  suffix="units"
                />
              </Col>
            </Row>
            <div className="mt-4">
              <Text type="secondary">Order Limits</Text>
              <br />
              <Text>Min: {selectedProduct.minOrder} {selectedProduct.unit}</Text>
              <br />
              <Text>Max: {selectedProduct.maxOrder} {selectedProduct.unit}</Text>
            </div>
            <div className="mt-4">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setDrawerVisible(false);
                  handleEditProduct(selectedProduct);
                }}
              >
                Edit Product
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ProductManagement; 