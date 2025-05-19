import api from './api';

export const getAvailableCoupons = async () => {
  try {
    const response = await api.get('/coupons/available');
    return response.data;
  } catch (error) {
    console.error('Error fetching available coupons:', error);
    throw error;
  }
};

export const validateCoupon = async (couponCode, cartItems) => {
  try {
    const response = await api.post('/coupons/validate', { 
      couponCode, 
      cartItems 
    });
    return response.data;
  } catch (error) {
    console.error('Error validating coupon:', error);
    throw error;
  }
};

export const applyCoupon = async (couponCode, cartId) => {
  try {
    const response = await api.post(`/cart/${cartId}/apply-coupon`, { 
      couponCode 
    });
    return response.data;
  } catch (error) {
    console.error('Error applying coupon to cart:', error);
    throw error;
  }
};

export const removeCoupon = async (cartId) => {
  try {
    const response = await api.delete(`/cart/${cartId}/remove-coupon`);
    return response.data;
  } catch (error) {
    console.error('Error removing coupon from cart:', error);
    throw error;
  }
};

export const getUserCoupons = async () => {
  try {
    const response = await api.get('/user/coupons');
    return response.data;
  } catch (error) {
    console.error('Error fetching user coupons:', error);
    throw error;
  }
}; 