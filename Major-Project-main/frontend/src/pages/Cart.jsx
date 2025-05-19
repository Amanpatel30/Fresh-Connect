import { useState, useEffect } from 'react';
import { Typography, Table, Button, Card, Row, Col, InputNumber, Divider, Spin, Empty, notification, Space, message } from 'antd';
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { getCartItems, updateCartItem, removeFromCart } from '../services/cartService';
import { toast } from 'react-hot-toast';

const { Title } = Typography;

function Cart() {
  const [cart, setCart] = useState({
    items: [],
    totalItems: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await getCartItems();
      console.log('Cart data:', response);
      
      if (response && response.data) {
        // Set cart to the full cart data structure
        setCart(response.data);
        console.log('Cart items set:', response.data.items?.length || 0);
      } else {
        console.error('Invalid cart response structure:', response);
        // Set empty cart if response is invalid
        setCart({
          items: [],
          totalItems: 0,
          totalAmount: 0
        });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart items');
      // Set empty cart on error
      setCart({
        items: [],
        totalItems: 0,
        totalAmount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) return;
    
    try {
      const loadingToast = toast.loading('Updating quantity...');
      
      // Optimistically update UI
      setCart(prevCart => {
        const updatedItems = prevCart.items.map(item => {
          if (item.product === productId || (item.product?._id && item.product?._id === productId)) {
            const oldQuantity = item.quantity;
            const newQuantity = quantity;
            
            const totalItemsDiff = newQuantity - oldQuantity;
            const totalAmountDiff = item.price * totalItemsDiff;
            
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
        
        // Recalculate totals
        const newTotalItems = updatedItems.reduce((total, item) => total + item.quantity, 0);
        const newTotalAmount = updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        return {
          ...prevCart,
          items: updatedItems,
          totalItems: newTotalItems,
          totalAmount: newTotalAmount
        };
      });
      
      // Call API to update quantity
      await updateCartItem(productId, quantity);
      toast.dismiss(loadingToast);
      toast.success('Quantity updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
      // Revert to original cart state by fetching again
      fetchCart();
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const loadingToast = toast.loading('Removing item...');
      
      // Optimistically update UI
      setCart(prevCart => {
        const itemToRemove = prevCart.items.find(item => 
          item.product === productId || (item.product?._id && item.product?._id === productId)
        );
        
        if (!itemToRemove) return prevCart;
        
        const updatedItems = prevCart.items.filter(item => 
          item.product !== productId && (item.product?._id ? item.product?._id !== productId : true)
        );
        
        const newTotalItems = prevCart.totalItems - itemToRemove.quantity;
        const newTotalAmount = prevCart.totalAmount - (itemToRemove.price * itemToRemove.quantity);
        
        return {
          ...prevCart,
          items: updatedItems,
          totalItems: newTotalItems,
          totalAmount: newTotalAmount
        };
      });
      
      // Call API to remove item
      await removeFromCart(productId);
      toast.dismiss(loadingToast);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
      // Revert to original cart state by fetching again
      fetchCart();
    }
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src={record.productImage || record.image || 'https://via.placeholder.com/50'} 
            alt={record.productName || record.name} 
            style={{ width: 50, height: 50, marginRight: 10, objectFit: 'cover' }} 
          />
          <div>
            <strong>{record.productName || (record.product?.name) || 'Product'}</strong>
            {record.productCategory && <div>{record.productCategory}</div>}
          </div>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `₹${parseFloat(price).toFixed(2)}`,
    },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (record) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => {
            if (value) {
              handleQuantityChange(record.product?._id || record.product, value);
            }
          }}
          style={{ width: 60 }}
        />
      ),
    },
    {
      title: 'Total',
      key: 'total',
      render: (record) => `₹${(record.price * record.quantity).toFixed(2)}`,
    },
    {
      title: 'Action',
      key: 'action',
      render: (record) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => handleRemoveItem(record.product?._id || record.product)}
        />
      ),
    },
  ];

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>My Cart</Title>
      
      {cart.items.length === 0 ? (
        <Card>
          <Empty
            description="Your cart is empty"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Link to="/">
              <Button type="primary" icon={<ShoppingOutlined />}>
                Continue Shopping
              </Button>
            </Link>
          </Empty>
        </Card>
      ) : (
        <>
          <Table 
            columns={columns}
            dataSource={cart.items.map((item, index) => ({ ...item, key: index }))}
            pagination={false}
            bordered
          />
          
          <Card style={{ marginTop: 20 }}>
            <Row gutter={16}>
              <Col xs={24} md={16}>
                <div style={{ marginBottom: 10 }}>
                  <strong>Special Instructions:</strong>
                </div>
                <div>
                  <Link to="/">
                    <Button icon={<ShoppingOutlined />}>
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ borderLeft: '1px solid #f0f0f0', padding: '0 15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span>Subtotal:</span>
                    <span>₹{parseFloat(cart.totalAmount).toFixed(2)}</span>
                  </div>
                  <Divider style={{ margin: '10px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                    <strong>Total:</strong>
                    <strong>₹{parseFloat(cart.totalAmount).toFixed(2)}</strong>
                  </div>
                  <Button 
                    type="primary" 
                    block 
                    size="large"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </Col>
            </Row>
          </Card>
        </>
      )}
    </div>
  );
}

export default Cart; 