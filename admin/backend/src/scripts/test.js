// MongoDB Queries for Admin Panel Data
// Run these queries in MongoDB Compass Shell

// 1. User Management Queries
// Users Collection
db.users.insertMany([
  {
    name: "Rajesh Kumar",
    email: "rajesh.kumar@gmail.com",
    phone: "+91 9876543210",
    role: "customer",
    address: "42 Nehru Street, Mumbai, Maharashtra",
    createdAt: new Date("2023-05-15"),
    lastLogin: new Date("2023-07-10")
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@hotmail.com",
    phone: "+91 8765432109",
    role: "customer",
    address: "78 Gandhi Road, Delhi",
    createdAt: new Date("2023-04-22"),
    lastLogin: new Date("2023-07-12")
  },
  {
    name: "Amit Patel",
    email: "amit.patel@yahoo.com",
    phone: "+91 7654321098",
    role: "admin",
    address: "15 Tagore Lane, Bangalore, Karnataka",
    createdAt: new Date("2023-03-10"),
    lastLogin: new Date("2023-07-11")
  },
  {
    name: "Sunita Verma",
    email: "sunita.verma@gmail.com",
    phone: "+91 6543210987",
    role: "customer",
    address: "23 Bose Avenue, Kolkata, West Bengal",
    createdAt: new Date("2023-06-05"),
    lastLogin: new Date("2023-07-09")
  },
  {
    name: "Vikram Singh",
    email: "vikram.singh@outlook.com",
    phone: "+91 9876543211",
    role: "staff",
    address: "56 Patel Nagar, Chennai, Tamil Nadu",
    createdAt: new Date("2023-02-18"),
    lastLogin: new Date("2023-07-08")
  }
]);

// 2. Order Management Queries
// Orders Collection
db.orders.insertMany([
  {
    orderNumber: "ORD-2023-7001",
    customerName: "Ananya Desai",
    customerEmail: "ananya.desai@gmail.com",
    items: [
      { name: "Paneer Butter Masala", quantity: 1, price: 250 },
      { name: "Butter Naan", quantity: 2, price: 60 }
    ],
    totalAmount: 370,
    status: "delivered",
    paymentMethod: "UPI",
    deliveryAddress: "121 MG Road, Pune, Maharashtra",
    orderDate: new Date("2023-07-01"),
    deliveryDate: new Date("2023-07-01")
  },
  {
    orderNumber: "ORD-2023-7002",
    customerName: "Karthik Rajan",
    customerEmail: "karthik.rajan@yahoo.com",
    items: [
      { name: "Masala Dosa", quantity: 2, price: 120 },
      { name: "Filter Coffee", quantity: 2, price: 40 }
    ],
    totalAmount: 320,
    status: "processing",
    paymentMethod: "Credit Card",
    deliveryAddress: "45 Anna Salai, Chennai, Tamil Nadu",
    orderDate: new Date("2023-07-10"),
    deliveryDate: null
  },
  {
    orderNumber: "ORD-2023-7003",
    customerName: "Meera Joshi",
    customerEmail: "meera.joshi@hotmail.com",
    items: [
      { name: "Veg Biryani", quantity: 1, price: 180 },
      { name: "Raita", quantity: 1, price: 40 },
      { name: "Gulab Jamun", quantity: 2, price: 60 }
    ],
    totalAmount: 340,
    status: "delivered",
    paymentMethod: "Cash on Delivery",
    deliveryAddress: "78 Linking Road, Mumbai, Maharashtra",
    orderDate: new Date("2023-07-05"),
    deliveryDate: new Date("2023-07-05")
  },
  {
    orderNumber: "ORD-2023-7004",
    customerName: "Arjun Nair",
    customerEmail: "arjun.nair@gmail.com",
    items: [
      { name: "Chole Bhature", quantity: 2, price: 160 },
      { name: "Lassi", quantity: 2, price: 80 }
    ],
    totalAmount: 480,
    status: "cancelled",
    paymentMethod: "UPI",
    deliveryAddress: "23 Connaught Place, New Delhi",
    orderDate: new Date("2023-07-08"),
    deliveryDate: null
  },
  {
    orderNumber: "ORD-2023-7005",
    customerName: "Lakshmi Krishnan",
    customerEmail: "lakshmi.krishnan@outlook.com",
    items: [
      { name: "Mysore Masala Dosa", quantity: 1, price: 140 },
      { name: "Idli Sambar", quantity: 1, price: 80 },
      { name: "Mango Lassi", quantity: 1, price: 70 }
    ],
    totalAmount: 290,
    status: "delivered",
    paymentMethod: "Debit Card",
    deliveryAddress: "56 Brigade Road, Bangalore, Karnataka",
    orderDate: new Date("2023-07-03"),
    deliveryDate: new Date("2023-07-03")
  }
]);

// 3. Product Management Queries
// Products Collection
db.products.insertMany([
  {
    name: "Basmati Rice Premium",
    category: "Groceries",
    price: 120,
    stock: 50,
    description: "Premium quality aged basmati rice from the foothills of Himalayas",
    supplier: "Himalayan Organics Ltd.",
    sku: "GRO-RICE-001",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-06-20")
  },
  {
    name: "Organic Turmeric Powder",
    category: "Spices",
    price: 85,
    stock: 100,
    description: "100% organic turmeric powder with high curcumin content",
    supplier: "Kerala Spice Gardens",
    sku: "SPI-TUR-002",
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-06-15")
  },
  {
    name: "Cold Pressed Coconut Oil",
    category: "Cooking Oils",
    price: 210,
    stock: 30,
    description: "Pure cold pressed coconut oil from Tamil Nadu",
    supplier: "Tamil Organic Farms",
    sku: "OIL-COC-003",
    createdAt: new Date("2023-03-05"),
    updatedAt: new Date("2023-07-01")
  },
  {
    name: "Assam Black Tea",
    category: "Beverages",
    price: 150,
    stock: 45,
    description: "Premium Assam black tea leaves from the finest estates",
    supplier: "Assam Tea Company",
    sku: "BEV-TEA-004",
    createdAt: new Date("2023-02-20"),
    updatedAt: new Date("2023-06-25")
  },
  {
    name: "Handmade Punjabi Papad",
    category: "Snacks",
    price: 70,
    stock: 80,
    description: "Traditional handmade papads from Punjab",
    supplier: "Punjab Homemade Foods",
    sku: "SNK-PAP-005",
    createdAt: new Date("2023-04-12"),
    updatedAt: new Date("2023-07-05")
  }
]);

// 4. Payment Management Queries
// Payments Collection
db.payments.insertMany([
  {
    transactionId: "TXN123456789",
    orderId: "ORD-2023-7001",
    customerName: "Ananya Desai",
    amount: 370,
    paymentMethod: "UPI",
    status: "completed",
    paymentDate: new Date("2023-07-01"),
    gatewayResponse: { success: true, code: "PAYMENT_SUCCESS" }
  },
  {
    transactionId: "TXN123456790",
    orderId: "ORD-2023-7002",
    customerName: "Karthik Rajan",
    amount: 320,
    paymentMethod: "Credit Card",
    status: "pending",
    paymentDate: new Date("2023-07-10"),
    gatewayResponse: { success: false, code: "PAYMENT_PROCESSING" }
  },
  {
    transactionId: "TXN123456791",
    orderId: "ORD-2023-7003",
    customerName: "Meera Joshi",
    amount: 340,
    paymentMethod: "Cash on Delivery",
    status: "completed",
    paymentDate: new Date("2023-07-05"),
    gatewayResponse: { success: true, code: "COD_CONFIRMED" }
  },
  {
    transactionId: "TXN123456792",
    orderId: "ORD-2023-7004",
    customerName: "Arjun Nair",
    amount: 480,
    paymentMethod: "UPI",
    status: "failed",
    paymentDate: new Date("2023-07-08"),
    gatewayResponse: { success: false, code: "PAYMENT_FAILED" }
  },
  {
    transactionId: "TXN123456793",
    orderId: "ORD-2023-7005",
    customerName: "Lakshmi Krishnan",
    amount: 290,
    paymentMethod: "Debit Card",
    status: "completed",
    paymentDate: new Date("2023-07-03"),
    gatewayResponse: { success: true, code: "PAYMENT_SUCCESS" }
  }
]);

// 5. Complaint Management Queries
// Complaints Collection
db.complaints.insertMany([
  {
    customerName: "Rahul Mehta",
    email: "rahul.mehta@gmail.com",
    subject: "Late Delivery",
    description: "My order #ORD-2023-6001 was delivered 2 days late without any prior notification.",
    status: "resolved",
    priority: "medium",
    createdAt: new Date("2023-06-25"),
    resolvedAt: new Date("2023-06-28")
  },
  {
    customerName: "Neha Gupta",
    email: "neha.gupta@yahoo.com",
    subject: "Wrong Item Delivered",
    description: "I ordered Basmati Rice but received Sona Masoori Rice. Order #ORD-2023-6015.",
    status: "in-progress",
    priority: "high",
    createdAt: new Date("2023-07-02"),
    resolvedAt: null
  },
  {
    customerName: "Sanjay Kapoor",
    email: "sanjay.kapoor@hotmail.com",
    subject: "Damaged Packaging",
    description: "The packaging of my spices order #ORD-2023-6022 was torn and some content was spilled.",
    status: "pending",
    priority: "medium",
    createdAt: new Date("2023-07-08"),
    resolvedAt: null
  },
  {
    customerName: "Divya Sharma",
    email: "divya.sharma@gmail.com",
    subject: "Refund Not Processed",
    description: "I returned my order #ORD-2023-5045 on June 15 but haven't received my refund yet.",
    status: "in-progress",
    priority: "urgent",
    createdAt: new Date("2023-06-30"),
    resolvedAt: null
  },
  {
    customerName: "Mohan Reddy",
    email: "mohan.reddy@outlook.com",
    subject: "Quality Issue",
    description: "The vegetables delivered in order #ORD-2023-6030 were not fresh as promised.",
    status: "resolved",
    priority: "high",
    createdAt: new Date("2023-06-20"),
    resolvedAt: new Date("2023-06-22")
  }
]);

// 6. Inventory Management Queries
// Inventory Collection
db.inventory.insertMany([
  {
    productName: "Basmati Rice Premium",
    sku: "GRO-RICE-001",
    category: "Groceries",
    quantityInStock: 50,
    reorderLevel: 10,
    supplierName: "Himalayan Organics Ltd.",
    supplierContact: "supplier@himalayanorganics.com",
    lastRestocked: new Date("2023-06-20"),
    expiryDate: new Date("2024-06-20"),
    warehouseLocation: "A-12"
  },
  {
    productName: "Organic Turmeric Powder",
    sku: "SPI-TUR-002",
    category: "Spices",
    quantityInStock: 100,
    reorderLevel: 20,
    supplierName: "Kerala Spice Gardens",
    supplierContact: "orders@keralaspice.com",
    lastRestocked: new Date("2023-06-15"),
    expiryDate: new Date("2024-03-15"),
    warehouseLocation: "B-05"
  },
  {
    productName: "Cold Pressed Coconut Oil",
    sku: "OIL-COC-003",
    category: "Cooking Oils",
    quantityInStock: 30,
    reorderLevel: 15,
    supplierName: "Tamil Organic Farms",
    supplierContact: "sales@tamilorganicfarms.com",
    lastRestocked: new Date("2023-07-01"),
    expiryDate: new Date("2024-01-01"),
    warehouseLocation: "C-08"
  },
  {
    productName: "Assam Black Tea",
    sku: "BEV-TEA-004",
    category: "Beverages",
    quantityInStock: 45,
    reorderLevel: 15,
    supplierName: "Assam Tea Company",
    supplierContact: "info@assamtea.com",
    lastRestocked: new Date("2023-06-25"),
    expiryDate: new Date("2024-06-25"),
    warehouseLocation: "D-03"
  },
  {
    productName: "Handmade Punjabi Papad",
    sku: "SNK-PAP-005",
    category: "Snacks",
    quantityInStock: 80,
    reorderLevel: 25,
    supplierName: "Punjab Homemade Foods",
    supplierContact: "orders@punjabhomemade.com",
    lastRestocked: new Date("2023-07-05"),
    expiryDate: new Date("2023-10-05"),
    warehouseLocation: "E-11"
  }
]);

// 7. Analytics Dashboard Queries
// Analytics Collection
db.analytics.insertMany([
  {
    date: new Date("2023-07-01"),
    sales: 15800,
    orders: 42,
    newUsers: 12,
    pageViews: 560,
    conversionRate: 7.5,
    topSellingProducts: [
      { name: "Basmati Rice Premium", units: 15 },
      { name: "Organic Turmeric Powder", units: 12 },
      { name: "Cold Pressed Coconut Oil", units: 8 }
    ]
  },
  {
    date: new Date("2023-07-02"),
    sales: 12600,
    orders: 35,
    newUsers: 8,
    pageViews: 490,
    conversionRate: 7.1,
    topSellingProducts: [
      { name: "Assam Black Tea", units: 14 },
      { name: "Basmati Rice Premium", units: 10 },
      { name: "Handmade Punjabi Papad", units: 9 }
    ]
  },
  {
    date: new Date("2023-07-03"),
    sales: 18200,
    orders: 48,
    newUsers: 15,
    pageViews: 620,
    conversionRate: 7.7,
    topSellingProducts: [
      { name: "Cold Pressed Coconut Oil", units: 16 },
      { name: "Organic Turmeric Powder", units: 14 },
      { name: "Assam Black Tea", units: 12 }
    ]
  },
  {
    date: new Date("2023-07-04"),
    sales: 14500,
    orders: 38,
    newUsers: 10,
    pageViews: 530,
    conversionRate: 7.2,
    topSellingProducts: [
      { name: "Basmati Rice Premium", units: 13 },
      { name: "Handmade Punjabi Papad", units: 11 },
      { name: "Cold Pressed Coconut Oil", units: 9 }
    ]
  },
  {
    date: new Date("2023-07-05"),
    sales: 16900,
    orders: 45,
    newUsers: 13,
    pageViews: 580,
    conversionRate: 7.8,
    topSellingProducts: [
      { name: "Organic Turmeric Powder", units: 15 },
      { name: "Assam Black Tea", units: 13 },
      { name: "Basmati Rice Premium", units: 12 }
    ]
  }
]);

// Sample data for users with Seller and Hotel Owner roles
db.users.insertMany([
  // Sellers
  {
    name: "Raj Sharma",
    email: "raj.sharma@example.com",
    phone: "+91 9876543210",
    roles: ["seller"],
    businessName: "Sharma Spice Exports",
    registrationDate: new Date("2023-01-15"),
    products: 24,
    totalSales: 156000,
    rating: 4.7
  },
  {
    name: "Priya Patel",
    email: "priya.patel@example.com",
    phone: "+91 8765432109",
    roles: ["seller"],
    businessName: "Gujarat Handicrafts",
    registrationDate: new Date("2023-02-10"),
    products: 36,
    totalSales: 189000,
    rating: 4.8
  },
  {
    name: "Amit Verma",
    email: "amit.verma@example.com",
    phone: "+91 7654321098",
    roles: ["seller"],
    businessName: "Organic India Foods",
    registrationDate: new Date("2023-01-05"),
    products: 18,
    totalSales: 134000,
    rating: 4.5
  },
  {
    name: "Sunita Reddy",
    email: "sunita.reddy@example.com",
    phone: "+91 6543210987",
    roles: ["seller"],
    businessName: "South Indian Delights",
    registrationDate: new Date("2023-03-20"),
    products: 29,
    totalSales: 167000,
    rating: 4.6
  },
  {
    name: "Vikram Singh",
    email: "vikram.singh@example.com",
    phone: "+91 5432109876",
    roles: ["seller"],
    businessName: "Punjab Textiles",
    registrationDate: new Date("2023-02-25"),
    products: 42,
    totalSales: 215003,
    rating: 4.9
  },
  {
    name: "Meera Joshi",
    email: "meera.joshi@example.com",
    phone: "+91 4321098765",
    roles: ["seller"],
    businessName: "Jaipur Crafts",
    registrationDate: new Date("2023-01-30"),
    products: 31,
    totalSales: 178000,
    rating: 4.7
  },
  {
    name: "Rahul Gupta",
    email: "rahul.gupta@example.com",
    phone: "+91 3210987654",
    roles: ["seller"],
    businessName: "Bengal Sweets",
    registrationDate: new Date("2023-03-05"),
    products: 22,
    totalSales: 145003,
    rating: 4.4
  },
  {
    name: "Ananya Desai",
    email: "ananya.desai@example.com",
    phone: "+91 2109876543",
    roles: ["seller"],
    businessName: "Kerala Spices Direct",
    registrationDate: new Date("2023-02-15"),
    products: 27,
    totalSales: 192000,
    rating: 4.8
  },
  {
    name: "Karthik Nair",
    email: "karthik.nair@example.com",
    phone: "+91 1098765432",
    roles: ["seller"],
    businessName: "Chennai Silk House",
    registrationDate: new Date("2023-01-20"),
    products: 33,
    totalSales: 203000,
    rating: 4.6
  },
  {
    name: "Deepa Malhotra",
    email: "deepa.malhotra@example.com",
    phone: "+91 9087654321",
    roles: ["seller"],
    businessName: "Delhi Fashion Hub",
    registrationDate: new Date("2023-03-15"),
    products: 38,
    totalSales: 225003,
    rating: 4.9
  },
  
  // Hotel Owners
  {
    name: "Arjun Kapoor",
    email: "arjun.kapoor@example.com",
    phone: "+91 8901234567",
    roles: ["hotel_owner"],
    hotelName: "Royal Palace Hotel",
    location: "Mumbai",
    registrationDate: new Date("2023-01-10"),
    rooms: 45,
    averageOccupancy: 78,
    rating: 4.5
  },
  {
    name: "Nisha Mehta",
    email: "nisha.mehta@example.com",
    phone: "+91 7890123456",
    roles: ["hotel_owner"],
    hotelName: "Lakeside Resort",
    location: "Udaipur",
    registrationDate: new Date("2023-02-05"),
    rooms: 32,
    averageOccupancy: 82,
    rating: 4.7
  },
  {
    name: "Suresh Kumar",
    email: "suresh.kumar@example.com",
    phone: "+91 6789012345",
    roles: ["hotel_owner"],
    hotelName: "Mountain View Inn",
    location: "Shimla",
    registrationDate: new Date("2023-03-12"),
    rooms: 28,
    averageOccupancy: 75,
    rating: 4.4
  },
  {
    name: "Lakshmi Rao",
    email: "lakshmi.rao@example.com",
    phone: "+91 5678901234",
    roles: ["hotel_owner"],
    hotelName: "Coastal Retreat",
    location: "Goa",
    registrationDate: new Date("2023-01-25"),
    rooms: 60,
    averageOccupancy: 85,
    rating: 4.8
  },
  {
    name: "Rajiv Khanna",
    email: "rajiv.khanna@example.com",
    phone: "+91 4567890123",
    roles: ["hotel_owner"],
    hotelName: "Heritage Haveli",
    location: "Jaipur",
    registrationDate: new Date("2023-02-18"),
    rooms: 38,
    averageOccupancy: 72,
    rating: 4.6
  },
  {
    name: "Anjali Sharma",
    email: "anjali.sharma@example.com",
    phone: "+91 3456789012",
    roles: ["hotel_owner"],
    hotelName: "City Center Suites",
    location: "Delhi",
    registrationDate: new Date("2023-03-02"),
    rooms: 52,
    averageOccupancy: 80,
    rating: 4.5
  },
  {
    name: "Venkat Reddy",
    email: "venkat.reddy@example.com",
    phone: "+91 2345678901",
    roles: ["hotel_owner"],
    hotelName: "Southern Star Hotel",
    location: "Hyderabad",
    registrationDate: new Date("2023-01-15"),
    rooms: 42,
    averageOccupancy: 76,
    rating: 4.3
  },
  {
    name: "Maya Iyer",
    email: "maya.iyer@example.com",
    phone: "+91 1234567890",
    roles: ["hotel_owner"],
    hotelName: "Backwater Resort",
    location: "Kerala",
    registrationDate: new Date("2023-02-22"),
    rooms: 35,
    averageOccupancy: 83,
    rating: 4.9
  },
  {
    name: "Prakash Jain",
    email: "prakash.jain@example.com",
    phone: "+91 9012345678",
    roles: ["hotel_owner"],
    hotelName: "Business Plaza Hotel",
    location: "Bangalore",
    registrationDate: new Date("2023-03-08"),
    rooms: 48,
    averageOccupancy: 79,
    rating: 4.6
  },
  {
    name: "Divya Choudhary",
    email: "divya.choudhary@example.com",
    phone: "+91 8123456789",
    roles: ["hotel_owner"],
    hotelName: "Desert Oasis Resort",
    location: "Jodhpur",
    registrationDate: new Date("2023-01-30"),
    rooms: 30,
    averageOccupancy: 74,
    rating: 4.7
  }
]);








