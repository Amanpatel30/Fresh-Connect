# Sample Test Data for API Validation

This document contains sample data structures for testing API endpoints. Use these to validate that your endpoints are returning correctly formatted data.

## Settings API

### GET /api/seller/settings```json
{
  "success": true,
  "data": {
    "general": {
      "language": "en",
      "timezone": "UTC+5:30",
      "dateFormat": "DD/MM/YYYY",
      "currency": "INR"
    },
    "notifications": {
      "emailNotifications": true,
      "orderUpdates": true,
      "productAlerts": true,
      "marketingEmails": false,
      "lowStockAlerts": true,
      "desktopNotifications": true
    },
    "security": {
      "twoFactorAuth": false,
      "sessionTimeout": 30,
      "loginAlerts": true
    }
  }
}
```

## Profile API

### GET /api/seller/profile

```json
{
  "status": "success",
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "Test Seller",
    "email": "seller@example.com",
    "phone": "9123456789",
    "shopName": "Fresh Veggies",
    "address": "123 Market Street, Mumbai",
    "description": "We sell the freshest organic vegetables directly from farm to your table.",
    "avatar": "/api/uploads/profiles/avatar-123456.jpg",
    "shopImage": "/api/uploads/profiles/shop-123456.jpg",
    "documents": {
      "gst": "GST123456",
      "pan": "ABCDE1234F",
      "fssai": "FSSAI123456"
    }
  }
}
```

## Review API

### GET /api/seller/reviews

```json
{
  "success": true,
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c10",
      "customer": {
        "name": "John Doe",
        "avatar": "/api/uploads/profiles/avatar-customer1.jpg"
      },
      "product": {
        "name": "Organic Tomatoes",
        "image": "/api/uploads/products/tomatoes.jpg"
      },
      "rating": 5,
      "comment": "Great quality tomatoes! Very fresh and tasty.",
      "date": "2023-08-15T10:30:00.000Z",
      "responded": true,
      "response": "Thank you for your kind words. We're glad you enjoyed our tomatoes!"
    },
    {
      "_id": "60d21b4667d0d8992e610c11",
      "customer": {
        "name": "Jane Smith",
        "avatar": "/api/uploads/profiles/avatar-customer2.jpg"
      },
      "product": {
        "name": "Fresh Spinach",
        "image": "/api/uploads/products/spinach.jpg"
      },
      "rating": 4,
      "comment": "Good quality spinach, but packaging could be improved.",
      "date": "2023-08-14T15:20:00.000Z",
      "responded": false,
      "response": null
    },
    {
      "_id": "60d21b4667d0d8992e610c12",
      "customer": {
        "name": "Rajesh Kumar",
        "avatar": "/api/uploads/profiles/avatar-customer3.jpg"
      },
      "product": {
        "name": "Red Onions",
        "image": "/api/uploads/products/onions.jpg"
      },
      "rating": 3,
      "comment": "Average quality. Some onions were already sprouting.",
      "date": "2023-08-13T09:15:00.000Z",
      "responded": false,
      "response": null
    }
  ],
  "pagination": {
    "total": 10,
    "pages": 4,
    "page": 1,
    "limit": 3
  }
}
```

### GET /api/seller/reviews/stats

```json
{
  "success": true,
  "data": {
    "average": 4.2,
    "total": 150,
    "distribution": {
      "5": 80,
      "4": 40,
      "3": 20,
      "2": 7,
      "1": 3
    }
  }
}
```

## Dashboard API

### GET /api/seller/dashboard

```json
{
  "success": true,
  "data": {
    "orderStats": {
      "totalOrders": 128,
      "completedOrders": 95,
      "pendingOrders": 15,
      "processingOrders": 18,
      "weeklyChange": "12.5"
    },
    "productStats": {
      "totalProducts": 45,
      "activeProducts": 38,
      "lowStockProducts": 7,
      "outOfStockProducts": 3,
      "weeklyChange": "5.2"
    },
    "revenueStats": {
      "totalRevenue": 156000,
      "thisMonthRevenue": 28500,
      "lastMonthRevenue": 25003,
      "pendingPayouts": 12500,
      "monthlyChange": "14.0"
    },
    "inventoryData": {
      "categories": [
        { "name": "Vegetables", "value": 20 },
        { "name": "Fruits", "value": 15 },
        { "name": "Dairy", "value": 5 },
        { "name": "Grains", "value": 5 }
      ]
    },
    "topSellingItems": [
      {
        "name": "Organic Tomatoes",
        "sales": 125,
        "percentage": 100,
        "image": "/api/uploads/products/tomatoes.jpg"
      },
      {
        "name": "Fresh Spinach",
        "sales": 110,
        "percentage": 88,
        "image": "/api/uploads/products/spinach.jpg"
      },
      {
        "name": "Red Onions",
        "sales": 95,
        "percentage": 76,
        "image": "/api/uploads/products/onions.jpg"
      },
      {
        "name": "Potatoes",
        "sales": 85,
        "percentage": 68,
        "image": "/api/uploads/products/potatoes.jpg"
      },
      {
        "name": "Organic Apples",
        "sales": 75,
        "percentage": 60,
        "image": "/api/uploads/products/apples.jpg"
      }
    ],
    "recentOrders": [
      {
        "id": "ORD2023081501",
        "customer": "John Doe",
        "amount": 1250,
        "status": "delivered",
        "date": "2023-08-15"
      },
      {
        "id": "ORD2023081502",
        "customer": "Jane Smith",
        "amount": 850,
        "status": "processing",
        "date": "2023-08-15"
      },
      {
        "id": "ORD2023081403",
        "customer": "Rajesh Kumar",
        "amount": 1550,
        "status": "pending",
        "date": "2023-08-14"
      },
      {
        "id": "ORD2023081404",
        "customer": "Amit Patel",
        "amount": 950,
        "status": "delivered",
        "date": "2023-08-14"
      },
      {
        "id": "ORD2023081305",
        "customer": "Priya Singh",
        "amount": 1350,
        "status": "delivered",
        "date": "2023-08-13"
      }
    ],
    "weeklySales": [
      { "day": "Mon", "amount": 4500 },
      { "day": "Tue", "amount": 5200 },
      { "day": "Wed", "amount": 4800 },
      { "day": "Thu", "amount": 5500 },
      { "day": "Fri", "amount": 6300 },
      { "day": "Sat", "amount": 7100 },
      { "day": "Sun", "amount": 5800 }
    ],
    "notifications": [
      {
        "id": "notif1",
        "type": "order",
        "message": "New order #ORD2023081601 received",
        "time": "10 min ago"
      },
      {
        "id": "notif2",
        "type": "stock",
        "message": "Low stock alert: Organic Tomatoes (5 left)",
        "time": "1 hour ago"
      },
      {
        "id": "notif3",
        "type": "payment",
        "message": "Payment received for order #ORD2023081502",
        "time": "2 hours ago"
      },
      {
        "id": "notif4",
        "type": "review",
        "message": "New review for Fresh Spinach (4★)",
        "time": "3 hours ago"
      },
      {
        "id": "notif5",
        "type": "system",
        "message": "System maintenance scheduled for tonight 2 AM",
        "time": "5 hours ago"
      }
    ]
  }
}
```

## Orders API 

### GET /api/seller/orders

```json
{
  "success": true,
  "data": [
    {
      "_id": "60d21b4667d0d8992e610d10",
      "orderNumber": "ORD2023081501",
      "buyer": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "9123456789"
      },
      "items": [
        {
          "product": {
            "_id": "60d21b4667d0d8992e610e10",
            "name": "Organic Tomatoes",
            "images": ["tomatoes.jpg"]
          },
          "price": 40,
          "quantity": 5
        },
        {
          "product": {
            "_id": "60d21b4667d0d8992e610e11",
            "name": "Fresh Spinach",
            "images": ["spinach.jpg"]
          },
          "price": 30,
          "quantity": 2
        }
      ],
      "totalAmount": 260,
      "status": "delivered",
      "paymentStatus": "paid",
      "createdAt": "2023-08-15T10:30:00.000Z"
    },
    {
      "_id": "60d21b4667d0d8992e610d11",
      "orderNumber": "ORD2023081502",
      "buyer": {
        "name": "Jane Smith",
        "email": "jane@example.com",
        "phone": "9123456790"
      },
      "items": [
        {
          "product": {
            "_id": "60d21b4667d0d8992e610e12",
            "name": "Red Onions",
            "images": ["onions.jpg"]
          },
          "price": 35,
          "quantity": 3
        }
      ],
      "totalAmount": 105,
      "status": "processing",
      "paymentStatus": "paid",
      "createdAt": "2023-08-15T15:20:00.000Z"
    },
    {
      "_id": "60d21b4667d0d8992e610d12",
      "orderNumber": "ORD2023081403",
      "buyer": {
        "name": "Rajesh Kumar",
        "email": "rajesh@example.com",
        "phone": "9123456791"
      },
      "items": [
        {
          "product": {
            "_id": "60d21b4667d0d8992e610e13",
            "name": "Potatoes",
            "images": ["potatoes.jpg"]
          },
          "price": 25,
          "quantity": 5
        },
        {
          "product": {
            "_id": "60d21b4667d0d8992e610e14",
            "name": "Organic Apples",
            "images": ["apples.jpg"]
          },
          "price": 50,
          "quantity": 3
        }
      ],
      "totalAmount": 275,
      "status": "pending",
      "paymentStatus": "pending",
      "createdAt": "2023-08-14T09:15:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "pages": 5,
    "page": 1,
    "limit": 3
  },
  "counts": {
    "total": 15,
    "pending": 5,
    "processing": 3,
    "delivered": 6,
    "cancelled": 1
  }
}
```

### GET /api/seller/orders/stats

```json
{
  "success": true,
  "data": {
    "totalOrders": 15,
    "pendingOrders": 5,
    "processingOrders": 3,
    "deliveredOrders": 6,
    "cancelledOrders": 1
  }
}
```

## Products API

### GET /api/seller/products 

```json
{
  "success": true,
  "data": [
    {
      "_id": "60d21b4667d0d8992e610e10",
      "name": "Organic Tomatoes",
      "description": "Fresh organic tomatoes sourced directly from local farms.",
      "price": 40,
      "salePrice": 35,
      "stock": 50,
      "category": "Vegetables",
      "images": ["tomatoes.jpg"],
      "featured": true,
      "status": "active",
      "ratings": { "average": 4.5, "count": 12 },
      "createdAt": "2023-07-01T10:30:00.000Z"
    },
    {
      "_id": "60d21b4667d0d8992e610e11",
      "name": "Fresh Spinach",
      "description": "Fresh and nutritious spinach leaves, perfect for salads and cooking.",
      "price": 30,
      "salePrice": null,
      "stock": 25,
      "category": "Vegetables",
      "images": ["spinach.jpg"],
      "featured": false,
      "status": "active",
      "ratings": { "average": 4.2, "count": 8 },
      "createdAt": "2023-07-05T14:20:00.000Z"
    },
    {
      "_id": "60d21b4667d0d8992e610e12",
      "name": "Red Onions",
      "description": "Premium quality red onions with rich flavor.",
      "price": 35,
      "salePrice": null,
      "stock": 40,
      "category": "Vegetables",
      "images": ["onions.jpg"],
      "featured": false,
      "status": "active",
      "ratings": { "average": 4.0, "count": 6 },
      "createdAt": "2023-07-08T09:15:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "pages": 5,
    "page": 1,
    "limit": 3
  }
}
```

### GET /api/seller/products/stats

```json
{
  "success": true,
  "data": {
    "totalProducts": 15,
    "activeProducts": 12,
    "featuredProducts": 3,
    "lowStockProducts": 2,
    "outOfStockProducts": 1,
    "totalCategories": 4,
    "productsByCategory": [
      { "name": "Vegetables", "count": 8 },
      { "name": "Fruits", "count": 4 },
      { "name": "Dairy", "count": 2 },
      { "name": "Grains", "count": 1 }
    ]
  }
}
```

## Categories API

### GET /api/seller/categories

```json
{
  "success": true,
  "data": [
    {
      "_id": "60d21b4667d0d8992e610f10",
      "name": "Vegetables",
      "description": "Fresh organic vegetables",
      "image": "vegetables.jpg",
      "productCount": 8,
      "order": 1
    },
    {
      "_id": "60d21b4667d0d8992e610f11",
      "name": "Fruits",
      "description": "Fresh seasonal fruits",
      "image": "fruits.jpg",
      "productCount": 4,
      "order": 2
    },
    {
      "_id": "60d21b4667d0d8992e610f12",
      "name": "Dairy",
      "description": "Fresh dairy products",
      "image": "dairy.jpg",
      "productCount": 2,
      "order": 3
    },
    {
      "_id": "60d21b4667d0d8992e610f13",
      "name": "Grains",
      "description": "Whole grains and cereals",
      "image": "grains.jpg",
      "productCount": 1,
      "order": 4
    }
  ]
}
```

## Payment Methods API

### GET /api/seller/payment-methods

```json
{
  "success": true,
  "data": [
    {
      "_id": "60d21b4667d0d8992e611a10",
      "type": "bank",
      "name": "HDFC Bank",
      "accountNumber": "XXXX1234",
      "ifsc": "HDFC0001234",
      "isDefault": true,
      "status": "verified"
    },
    {
      "_id": "60d21b4667d0d8992e611a11",
      "type": "upi",
      "name": "Google Pay",
      "upiId": "seller@okicici",
      "isDefault": false,
      "status": "verified"
    }
  ]
}
```

## Payment Transactions API

### GET /api/seller/payment-transactions

```json
{
  "success": true,
  "data": [
    {
      "_id": "60d21b4667d0d8992e611b10",
      "transactionId": "TXN2023081501",
      "amount": 1250,
      "type": "credit",
      "status": "completed",
      "date": "2023-08-15T10:30:00.000Z",
      "order": {
        "orderNumber": "ORD2023081501",
        "totalAmount": 1250
      }
    },
    {
      "_id": "60d21b4667d0d8992e611b11",
      "transactionId": "TXN2023081502",
      "amount": 850,
      "type": "credit",
      "status": "pending",
      "date": "2023-08-15T15:20:00.000Z",
      "order": {
        "orderNumber": "ORD2023081502",
        "totalAmount": 850
      }
    },
    {
      "_id": "60d21b4667d0d8992e611b12",
      "transactionId": "TXN2023081403",
      "amount": 1550,
      "type": "payout",
      "status": "completed",
      "date": "2023-08-14T09:15:00.000Z"
    }
  ],
  "pagination": {
    "total": 10,
    "pages": 4,
    "page": 1,
    "limit": 3
  }
}
```

### GET /api/seller/payment-transactions/summary

```json
{
  "success": true,
  "data": {
    "totalEarnings": 35600,
    "pendingPayments": 2350
  }
}
``` 

