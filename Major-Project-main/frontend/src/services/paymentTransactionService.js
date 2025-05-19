import api from './api';

// Get all payment transactions with optional filters
export const getPaymentTransactions = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const queryString = queryParams.toString();
    const url = `/seller/payment-transactions${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment transactions:', error);
    throw error;
  }
};

// Get a single payment transaction
export const getPaymentTransaction = async (id) => {
  try {
    const response = await api.get(`/seller/payment-transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment transaction:', error);
    throw error;
  }
};

// Get payment summary
export const getPaymentSummary = async () => {
  try {
    const response = await api.get('/seller/payment-transactions/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    throw error;
  }
};

// Mock data for offline mode
export const getMockPaymentTransactions = () => {
  return {
    success: true,
    count: 5,
    pagination: {
      total: 5,
      pages: 1,
      page: 1,
      limit: 10
    },
    data: [
      {
        _id: '1',
        amount: 1500,
        status: 'completed',
        type: 'payout',
        createdAt: new Date().toISOString(),
        order: { orderNumber: 'ORD001', totalAmount: 1500 }
      },
      {
        _id: '2',
        amount: 2000,
        status: 'pending',
        type: 'payout',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        order: { orderNumber: 'ORD002', totalAmount: 2000 }
      },
      {
        _id: '3',
        amount: 1200,
        status: 'completed',
        type: 'payout',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        order: { orderNumber: 'ORD003', totalAmount: 1200 }
      },
      {
        _id: '4',
        amount: 500,
        status: 'processing',
        type: 'payout',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        order: { orderNumber: 'ORD004', totalAmount: 500 }
      },
      {
        _id: '5',
        amount: 300,
        status: 'completed',
        type: 'refund',
        createdAt: new Date(Date.now() - 345600000).toISOString(),
        order: { orderNumber: 'ORD005', totalAmount: 300 }
      }
    ]
  };
};

// Mock data for payment summary
export const getMockPaymentSummary = () => {
  return {
    success: true,
    data: {
      totalEarnings: 4700,
      pendingPayments: 2000,
      monthlyEarnings: [0, 0, 0, 0, 0, 0, 1500, 1200, 2000, 0, 0, 0]
    }
  };
}; 