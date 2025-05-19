import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Space, Button, Typography, Input, Select,
  Drawer, Form, InputNumber, DatePicker, Popconfirm, Badge,
  Tabs, Statistic, Row, Col, Progress, Alert, Tooltip, Divider,
  notification, Upload, Modal
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  WarningOutlined, CheckCircleOutlined, SyncOutlined, 
  BarChartOutlined, ExportOutlined, ImportOutlined, 
  FilterOutlined, SortAscendingOutlined, UploadOutlined,
  DownloadOutlined, PrinterOutlined, QuestionCircleOutlined,
  ClockCircleOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = Input;
const { RangePicker } = DatePicker;

const InventoryManagement = () => {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [form] = Form.useForm();
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [inventorySummary, setInventorySummary] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStock: 0,
    expiringSoon: 0,
    categories: {}
  });

  useEffect(() => {
    // Simulating API call to fetch inventory data
    setTimeout(() => {
      const mockInventory = [
        {
          id: 1,
          name: 'Organic Tomatoes',
          category: 'Vegetables',
          quantity: 150,
          unit: 'kg',
          unitPrice: 40,
          totalValue: 6000,
          location: 'Warehouse A',
          expiryDate: moment().add(5, 'days').format('YYYY-MM-DD'),
          reorderLevel: 50,
          supplier: 'Green Farms',
          quality: 'A',
          organic: true,
          status: 'In Stock',
          lastUpdated: moment().subtract(2, 'days').format('YYYY-MM-DD')
        },
        {
          id: 2,
          name: 'Fresh Spinach',
          category: 'Leafy Greens',
          quantity: 30,
          unit: 'kg',
          unitPrice: 60,
          totalValue: 1800,
          location: 'Warehouse B',
          expiryDate: moment().add(2, 'days').format('YYYY-MM-DD'),
          reorderLevel: 20,
          supplier: 'Organic Valley',
          quality: 'A',
          organic: true,
          status: 'Low Stock',
          lastUpdated: moment().subtract(1, 'days').format('YYYY-MM-DD')
        },
        {
          id: 3,
          name: 'Potatoes',
          category: 'Root Vegetables',
          quantity: 300,
          unit: 'kg',
          unitPrice: 25,
          totalValue: 7500,
          location: 'Warehouse A',
          expiryDate: moment().add(15, 'days').format('YYYY-MM-DD'),
          reorderLevel: 100,
          supplier: 'Farm Fresh',
          quality: 'B',
          organic: false,
          status: 'In Stock',
          lastUpdated: moment().subtract(5, 'days').format('YYYY-MM-DD')
        },
        {
          id: 4,
          name: 'Carrots',
          category: 'Root Vegetables',
          quantity: 200,
          unit: 'kg',
          unitPrice: 30,
          totalValue: 6000,
          location: 'Warehouse C',
          expiryDate: moment().add(10, 'days').format('YYYY-MM-DD'),
          reorderLevel: 80,
          supplier: 'Farm Fresh',
          quality: 'A',
          organic: false,
          status: 'In Stock',
          lastUpdated: moment().subtract(3, 'days').format('YYYY-MM-DD')
        },
        {
          id: 5,
          name: 'Apples',
          category: 'Fruits',
          quantity: 100,
          unit: 'kg',
          unitPrice: 80,
          totalValue: 8000,
          location: 'Warehouse B',
          expiryDate: moment().add(8, 'days').format('YYYY-MM-DD'),
          reorderLevel: 50,
          supplier: 'Fruit Haven',
          quality: 'A',
          organic: true,
          status: 'In Stock',
          lastUpdated: moment().subtract(2, 'days').format('YYYY-MM-DD')
        },
        {
          id: 6,
          name: 'Bananas',
          category: 'Fruits',
          quantity: 15,
          unit: 'kg',
          unitPrice: 60,
          totalValue: 900,
          location: 'Warehouse A',
          expiryDate: moment().add(1, 'days').format('YYYY-MM-DD'),
          reorderLevel: 30,
          supplier: 'Fruit Haven',
          quality: 'B',
          organic: false,
          status: 'Expiring Soon',
          lastUpdated: moment().subtract(1, 'days').format('YYYY-MM-DD')
        },
        {
          id: 7,
          name: 'Onions',
          category: 'Vegetables',
          quantity: 250,
          unit: 'kg',
          unitPrice: 35,
          totalValue: 8750,
          location: 'Warehouse C',
          expiryDate: moment().add(20, 'days').format('YYYY-MM-DD'),
          reorderLevel: 100,
          supplier: 'Farm Fresh',
          quality: 'A',
          organic: false,
          status: 'In Stock',
          lastUpdated: moment().subtract(4, 'days').format('YYYY-MM-DD')
        },
        {
          id: 8,
          name: 'Bell Peppers',
          category: 'Vegetables',
          quantity: 10,
          unit: 'kg',
          unitPrice: 90,
          totalValue: 900,
          location: 'Warehouse B',
          expiryDate: moment().add(4, 'days').format('YYYY-MM-DD'),
          reorderLevel: 20,
          supplier: 'Green Farms',
          quality: 'A',
          organic: true,
          status: 'Low Stock',
          lastUpdated: moment().subtract(1, 'days').format('YYYY-MM-DD')
        }
      ];

      setInventory(mockInventory);
      setFilteredInventory(mockInventory);
      
      // Calculate inventory summary
      const summary = {
        totalItems: mockInventory.length,
        totalValue: mockInventory.reduce((sum, item) => sum + item.totalValue, 0),
        lowStock: mockInventory.filter(item => item.status === 'Low Stock').length,
        expiringSoon: mockInventory.filter(item => item.status === 'Expiring Soon').length,
        categories: {}
      };
      
      // Count items by category
      mockInventory.forEach(item => {
        if (!summary.categories[item.category]) {
          summary.categories[item.category] = 0;
        }
        summary.categories[item.category]++;
      });
      
      setInventorySummary(summary);
      setLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    // Apply filters and search
    let results = [...inventory];

    // Apply search
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      results = results.filter(
        item =>
          item.name.toLowerCase().includes(searchLower) ||
          item.category.toLowerCase().includes(searchLower) ||
          item.supplier.toLowerCase().includes(searchLower) ||
          item.location.toLowerCase().includes(searchLower)
      );
    }

    // Apply tab filter
    if (activeTab === 'lowStock') {
      results = results.filter(item => item.status === 'Low Stock');
    } else if (activeTab === 'expiringSoon') {
      results = results.filter(item => item.status === 'Expiring Soon');
    } else if (activeTab === 'organic') {
      results = results.filter(item => item.organic);
    }

    setFilteredInventory(results);
  }, [inventory, searchText, activeTab]);

  const handleSearch = value => {
    setSearchText(value);
  };

  const handleTabChange = key => {
    setActiveTab(key);
  };

  const showDrawer = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue({
        ...item,
        expiryDate: moment(item.expiryDate)
      });
    } else {
      form.resetFields();
    }
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setEditingItem(null);
    form.resetFields();
  };

  const handleSave = values => {
    const formattedValues = {
      ...values,
      expiryDate: values.expiryDate.format('YYYY-MM-DD'),
      totalValue: values.quantity * values.unitPrice,
      lastUpdated: moment().format('YYYY-MM-DD'),
      status: determineStatus(values)
    };

    if (editingItem) {
      // Update existing item
      const updatedInventory = inventory.map(item =>
        item.id === editingItem.id ? { ...formattedValues, id: item.id } : item
      );
      setInventory(updatedInventory);
      notification.success({
        message: 'Item Updated',
        description: `${formattedValues.name} has been updated successfully.`
      });
    } else {
      // Add new item
      const newItem = {
        ...formattedValues,
        id: Math.max(...inventory.map(item => item.id), 0) + 1
      };
      setInventory([...inventory, newItem]);
      notification.success({
        message: 'Item Added',
        description: `${formattedValues.name} has been added to inventory.`
      });
    }

    closeDrawer();
  };

  const determineStatus = values => {
    const daysToExpiry = moment(values.expiryDate).diff(moment(), 'days');
    
    if (daysToExpiry <= 3) {
      return 'Expiring Soon';
    } else if (values.quantity <= values.reorderLevel) {
      return 'Low Stock';
    } else {
      return 'In Stock';
    }
  };

  const handleDelete = id => {
    const updatedInventory = inventory.filter(item => item.id !== id);
    setInventory(updatedInventory);
    notification.success({
      message: 'Item Deleted',
      description: 'The inventory item has been deleted successfully.'
    });
  };

  const handleImport = () => {
    setImportModalVisible(false);
    notification.success({
      message: 'Import Successful',
      description: 'Inventory data has been imported successfully.'
    });
  };

  const handleExport = () => {
    setExportModalVisible(false);
    notification.success({
      message: 'Export Successful',
      description: 'Inventory data has been exported successfully.'
    });
  };

  const getStatusTag = status => {
    switch (status) {
      case 'In Stock':
        return <Tag color="green">In Stock</Tag>;
      case 'Low Stock':
        return <Tag color="orange">Low Stock</Tag>;
      case 'Expiring Soon':
        return <Tag color="red">Expiring Soon</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getQualityTag = quality => {
    switch (quality) {
      case 'A':
        return <Tag color="green">A Grade</Tag>;
      case 'B':
        return <Tag color="blue">B Grade</Tag>;
      case 'C':
        return <Tag color="orange">C Grade</Tag>;
      default:
        return <Tag>{quality}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <Space>
          <Text strong>{text}</Text>
          {record.organic && <Tag color="green">Organic</Tag>}
        </Space>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: [...new Set(inventory.map(item => item.category))].map(category => ({
        text: category,
        value: category
      })),
      onFilter: (value, record) => record.category === value
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
      render: (text, record) => `${text} ${record.unit}`
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      sorter: (a, b) => a.unitPrice - b.unitPrice,
      render: text => `₹${text}`
    },
    {
      title: 'Total Value',
      dataIndex: 'totalValue',
      key: 'totalValue',
      sorter: (a, b) => a.totalValue - b.totalValue,
      render: text => `₹${text}`
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      filters: [...new Set(inventory.map(item => item.location))].map(location => ({
        text: location,
        value: location
      })),
      onFilter: (value, record) => record.location === value
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      sorter: (a, b) => moment(a.expiryDate).unix() - moment(b.expiryDate).unix(),
      render: text => {
        const days = moment(text).diff(moment(), 'days');
        return (
          <Space>
            {text}
            {days <= 3 && (
              <Tooltip title={`Expires in ${days} days`}>
                <WarningOutlined style={{ color: 'red' }} />
              </Tooltip>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'In Stock', value: 'In Stock' },
        { text: 'Low Stock', value: 'Low Stock' },
        { text: 'Expiring Soon', value: 'Expiring Soon' }
      ],
      onFilter: (value, record) => record.status === value,
      render: status => getStatusTag(status)
    },
    {
      title: 'Quality',
      dataIndex: 'quality',
      key: 'quality',
      filters: [
        { text: 'A Grade', value: 'A' },
        { text: 'B Grade', value: 'B' },
        { text: 'C Grade', value: 'C' }
      ],
      onFilter: (value, record) => record.quality === value,
      render: quality => getQualityTag(quality)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showDrawer(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this item?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="inventory-management-container">
      <div className="page-header">
        <Title level={2}>Inventory Management</Title>
        <Text type="secondary">
          Manage your product inventory, track stock levels, and monitor expiry dates
        </Text>
      </div>

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Items"
              value={inventorySummary.totalItems}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Value"
              value={inventorySummary.totalValue}
              prefix="₹"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Low Stock Items"
              value={inventorySummary.lowStock}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Expiring Soon"
              value={inventorySummary.expiringSoon}
              valueStyle={{ color: '#f5222d' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {(inventorySummary.lowStock > 0 || inventorySummary.expiringSoon > 0) && (
        <Alert
          message="Inventory Alerts"
          description={
            <div>
              {inventorySummary.lowStock > 0 && (
                <div>
                  <WarningOutlined style={{ color: '#faad14' }} /> {inventorySummary.lowStock} items are running low on stock
                </div>
              )}
              {inventorySummary.expiringSoon > 0 && (
                <div>
                  <ExclamationCircleOutlined style={{ color: '#f5222d' }} /> {inventorySummary.expiringSoon} items are expiring soon
                </div>
              )}
            </div>
          }
          type="warning"
          showIcon
          className="mb-4"
        />
      )}

      <div className="inventory-actions mb-4">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Search
              placeholder="Search inventory..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={e => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} md={16}>
            <div className="flex justify-end">
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={() => showDrawer()}
                >
                  Add Item
                </Button>
                <Button
                  icon={<ImportOutlined />}
                  size="large"
                  onClick={() => setImportModalVisible(true)}
                >
                  Import
                </Button>
                <Button
                  icon={<ExportOutlined />}
                  size="large"
                  onClick={() => setExportModalVisible(true)}
                >
                  Export
                </Button>
                <Button
                  icon={<PrinterOutlined />}
                  size="large"
                >
                  Print
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </div>

      <Tabs activeKey={activeTab} onChange={handleTabChange} className="mb-4">
        <TabPane tab="All Items" key="all" />
        <TabPane 
          tab={
            <Badge count={inventorySummary.lowStock} offset={[10, 0]}>
              Low Stock
            </Badge>
          } 
          key="lowStock" 
        />
        <TabPane 
          tab={
            <Badge count={inventorySummary.expiringSoon} offset={[10, 0]}>
              Expiring Soon
            </Badge>
          } 
          key="expiringSoon" 
        />
        <TabPane tab="Organic Products" key="organic" />
      </Tabs>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredInventory}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Drawer
        title={editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
        width={520}
        onClose={closeDrawer}
        visible={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={closeDrawer} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" onClick={() => form.submit()}>
              {editingItem ? 'Update' : 'Add'}
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            organic: false,
            quality: 'A',
            unit: 'kg'
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Product Name"
                rules={[{ required: true, message: 'Please enter product name' }]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select a category' }]}
              >
                <Select placeholder="Select category">
                  <Option value="Vegetables">Vegetables</Option>
                  <Option value="Fruits">Fruits</Option>
                  <Option value="Leafy Greens">Leafy Greens</Option>
                  <Option value="Root Vegetables">Root Vegetables</Option>
                  <Option value="Herbs">Herbs</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="supplier"
                label="Supplier"
                rules={[{ required: true, message: 'Please enter supplier name' }]}
              >
                <Input placeholder="Enter supplier name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true, message: 'Please enter quantity' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="Quantity" />
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
                  <Option value="pcs">Pieces (pcs)</Option>
                  <Option value="dozen">Dozen</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unitPrice"
                label="Unit Price (₹)"
                rules={[{ required: true, message: 'Please enter unit price' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="Unit price" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Storage Location"
                rules={[{ required: true, message: 'Please select a location' }]}
              >
                <Select placeholder="Select location">
                  <Option value="Warehouse A">Warehouse A</Option>
                  <Option value="Warehouse B">Warehouse B</Option>
                  <Option value="Warehouse C">Warehouse C</Option>
                  <Option value="Cold Storage">Cold Storage</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiryDate"
                label="Expiry Date"
                rules={[{ required: true, message: 'Please select expiry date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="reorderLevel"
                label="Reorder Level"
                rules={[{ required: true, message: 'Please enter reorder level' }]}
                tooltip="Minimum quantity before reordering"
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="Reorder level" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="quality"
                label="Quality Grade"
                rules={[{ required: true, message: 'Please select quality grade' }]}
              >
                <Select placeholder="Select quality grade">
                  <Option value="A">A Grade (Premium)</Option>
                  <Option value="B">B Grade (Standard)</Option>
                  <Option value="C">C Grade (Economy)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="organic"
                valuePropName="checked"
              >
                <Checkbox>Organic Product</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>

      <Modal
        title="Import Inventory"
        visible={importModalVisible}
        onOk={handleImport}
        onCancel={() => setImportModalVisible(false)}
      >
        <Upload.Dragger multiple={false}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
            Support for CSV or Excel files. Please ensure your file follows the required format.
          </p>
        </Upload.Dragger>
        <div className="mt-4">
          <Button icon={<DownloadOutlined />} type="link">
            Download template file
          </Button>
        </div>
      </Modal>

      <Modal
        title="Export Inventory"
        visible={exportModalVisible}
        onOk={handleExport}
        onCancel={() => setExportModalVisible(false)}
      >
        <div>
          <Title level={5}>Export Options</Title>
          <Form layout="vertical">
            <Form.Item label="Export Format">
              <Select defaultValue="csv">
                <Option value="csv">CSV</Option>
                <Option value="excel">Excel</Option>
                <Option value="pdf">PDF</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Data to Export">
              <Checkbox.Group defaultValue={['all']}>
                <Row>
                  <Col span={12}>
                    <Checkbox value="all">All Items</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="lowStock">Low Stock Only</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="expiringSoon">Expiring Soon Only</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="organic">Organic Only</Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default InventoryManagement; 