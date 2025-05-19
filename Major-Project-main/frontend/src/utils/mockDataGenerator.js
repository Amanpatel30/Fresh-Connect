/**
 * Utility functions for generating mock data when APIs are unavailable
 */

// Generate random reviews
export const generateMockReviews = (count = 5) => {
  const products = [
    { name: 'Organic Tomatoes', image: 'https://source.unsplash.com/random/100x100/?tomato' },
    { name: 'Fresh Spinach', image: 'https://source.unsplash.com/random/100x100/?spinach' },
    { name: 'Red Onions', image: 'https://source.unsplash.com/random/100x100/?onion' },
    { name: 'Potatoes', image: 'https://source.unsplash.com/random/100x100/?potato' },
    { name: 'Organic Apples', image: 'https://source.unsplash.com/random/100x100/?apple' },
  ];
  
  const customers = [
    { name: 'John Doe', avatar: 'https://randomuser.me/api/portraits/men/41.jpg' },
    { name: 'Jane Smith', avatar: 'https://randomuser.me/api/portraits/women/22.jpg' },
    { name: 'Rajesh Kumar', avatar: 'https://randomuser.me/api/portraits/men/67.jpg' },
    { name: 'Priya Singh', avatar: 'https://randomuser.me/api/portraits/women/45.jpg' },
    { name: 'Alex Johnson', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  ];
  
  const comments = [
    'Great quality product! Very fresh and tasty.',
    'Good quality, but packaging could be improved.',
    'Average quality. Some items weren\'t as fresh as expected.',
    'Excellent product, will buy again!',
    'Decent quality for the price.',
    'Not as described, disappointed with the purchase.',
    'Perfect! Just what I was looking for.',
    'Fast delivery and good quality.',
    'The product was damaged during shipping.',
    'Amazing quality and value for money.',
  ];
  
  const reviews = [];
  
  for (let i = 0; i < count; i++) {
    const rating = Math.floor(Math.random() * 5) + 1;
    const responded = Math.random() > 0.5;
    const date = new Date(Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString();
    
    const review = {
      id: `mock-${i}`,
      customer: customers[Math.floor(Math.random() * customers.length)],
      product: products[Math.floor(Math.random() * products.length)],
      rating,
      comment: comments[Math.floor(Math.random() * comments.length)],
      date,
      responded,
      helpful: Math.floor(Math.random() * 10),
    };
    
    if (responded) {
      const responseDate = new Date(new Date(date).getTime() + (Math.random() * 5 * 24 * 60 * 60 * 1000)).toISOString();
      const responses = [
        'Thank you for your feedback! We really appreciate it.',
        'We\'re sorry to hear about your experience. We\'ll work on improving.',
        'Thank you for your review. We\'re glad you enjoyed our product!',
        'We apologize for the inconvenience. Please contact our support team for assistance.',
        'Thank you for your feedback. We\'ll take your suggestions into consideration.',
      ];
      
      review.response = {
        text: responses[Math.floor(Math.random() * responses.length)],
        date: responseDate
      };
    }
    
    reviews.push(review);
  }
  
  return reviews;
};

// Generate review statistics
export const generateMockReviewStats = () => {
  const total = 150;
  const distribution = {
    5: 80,
    4: 40,
    3: 20,
    2: 7,
    1: 3
  };
  
  // Calculate average rating
  let sum = 0;
  let count = 0;
  
  Object.entries(distribution).forEach(([rating, number]) => {
    sum += Number(rating) * number;
    count += number;
  });
  
  const average = sum / count;
  
  return {
    average,
    total,
    distribution
  };
};

// Generate dashboard data
export const generateMockDashboardData = () => {
  return {
    orderStats: {
      totalOrders: 128,
      completedOrders: 95,
      pendingOrders: 15,
      processingOrders: 18,
      weeklyChange: "12.5"
    },
    productStats: {
      totalProducts: 45,
      activeProducts: 38,
      lowStockProducts: 7,
      outOfStockProducts: 3,
      weeklyChange: "5.2"
    },
    revenueStats: {
      totalRevenue: 156000,
      thisMonthRevenue: 28500,
      lastMonthRevenue: 25003,
      pendingPayouts: 12500,
      monthlyChange: "14.0"
    },
    inventoryData: {
      categories: [
        { name: "Vegetables", value: 20 },
        { name: "Fruits", value: 15 },
        { name: "Dairy", value: 5 },
        { name: "Grains", value: 5 }
      ]
    },
    topSellingItems: [
      {
        name: "Organic Tomatoes",
        sales: 125,
        percentage: 100,
        image: "https://source.unsplash.com/random/100x100/?tomato"
      },
      {
        name: "Fresh Spinach",
        sales: 110,
        percentage: 88,
        image: "https://source.unsplash.com/random/100x100/?spinach"
      },
      {
        name: "Red Onions",
        sales: 95,
        percentage: 76,
        image: "https://source.unsplash.com/random/100x100/?onion"
      },
      {
        name: "Potatoes",
        sales: 85,
        percentage: 68,
        image: "https://source.unsplash.com/random/100x100/?potato"
      },
      {
        name: "Organic Apples",
        sales: 75,
        percentage: 60,
        image: "https://source.unsplash.com/random/100x100/?apple"
      }
    ],
    recentOrders: [
      {
        id: "ORD2023081501",
        customer: "John Doe",
        amount: 1250,
        status: "delivered",
        date: "2023-08-15"
      },
      {
        id: "ORD2023081502",
        customer: "Jane Smith",
        amount: 850,
        status: "processing",
        date: "2023-08-15"
      },
      {
        id: "ORD2023081403",
        customer: "Rajesh Kumar",
        amount: 1550,
        status: "pending",
        date: "2023-08-14"
      },
      {
        id: "ORD2023081404",
        customer: "Amit Patel",
        amount: 950,
        status: "delivered",
        date: "2023-08-14"
      },
      {
        id: "ORD2023081305",
        customer: "Priya Singh",
        amount: 1350,
        status: "delivered",
        date: "2023-08-13"
      }
    ],
    weeklySales: [
      { day: "Mon", amount: 4500 },
      { day: "Tue", amount: 5200 },
      { day: "Wed", amount: 4800 },
      { day: "Thu", amount: 5500 },
      { day: "Fri", amount: 6300 },
      { day: "Sat", amount: 7100 },
      { day: "Sun", amount: 5800 }
    ],
    notifications: [
      {
        id: "notif1",
        type: "order",
        message: "New order #ORD2023081601 received",
        time: "10 min ago"
      },
      {
        id: "notif2",
        type: "inventory",
        message: "Low stock alert: Organic Tomatoes (5 left)",
        time: "1 hour ago"
      },
      {
        id: "notif3",
        type: "payment",
        message: "Payment received for order #ORD2023081502",
        time: "2 hours ago"
      },
      {
        id: "notif4",
        type: "customer",
        message: "New review for Fresh Spinach (4★)",
        time: "3 hours ago"
      },
      {
        id: "notif5",
        type: "system",
        message: "System maintenance scheduled for tonight 2 AM",
        time: "5 hours ago"
      }
    ]
  };
};

// Generate settings data
export const generateMockSettings = () => {
  return {
    general: {
      language: "en",
      timezone: "UTC+5:30",
      dateFormat: "DD/MM/YYYY",
      currency: "INR"
    },
    notifications: {
      emailNotifications: true,
      orderUpdates: true,
      productAlerts: true,
      marketingEmails: false,
      lowStockAlerts: true,
      desktopNotifications: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      loginAlerts: true
    }
  };
};

// Helper to create random dates within a range
export const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper to format currency
export const formatCurrency = (amount, currencyCode = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}; 