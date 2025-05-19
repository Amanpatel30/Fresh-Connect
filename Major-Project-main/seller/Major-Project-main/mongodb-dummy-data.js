// MongoDB Queries for Inserting Dummy Users

// =============================================
// ADMIN USERS
// =============================================
db.users.insertMany([
  {
    name: "Admin User",
    email: "admin@freshconnect.com",
    password: "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1TD7WS", // password: admin123
    role: "admin",
    phone: "9876543210",
    address: "123 Admin Street, Admin City",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Super Admin",
    email: "superadmin@freshconnect.com",
    password: "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1TD7WS", // password: admin123
    role: "admin",
    phone: "9876543211",
    address: "456 Admin Avenue, Admin Town",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// =============================================
// SELLER USERS
// =============================================
db.users.insertMany([
  {
    name: "John Seller",
    email: "john@seller.com",
    password: "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1TD7WS", // password: admin123
    role: "seller",
    phone: "8765432109",
    address: "789 Seller Street, Market City",
    shopName: "John's Fresh Produce",
    shopAddress: "789 Market Street, Vendor Lane",
    shopDescription: "Fresh fruits and vegetables directly from local farms",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Sarah Vendor",
    email: "sarah@seller.com",
    password: "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1TD7WS", // password: admin123
    role: "seller",
    phone: "8765432108",
    address: "101 Vendor Road, Seller Town",
    shopName: "Sarah's Organic Market",
    shopAddress: "101 Organic Lane, Green Market",
    shopDescription: "Certified organic produce and dairy products",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Mike Farmer",
    email: "mike@seller.com",
    password: "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1TD7WS", // password: admin123
    role: "seller",
    phone: "8765432107",
    address: "202 Farm Road, Rural County",
    shopName: "Mike's Farm Fresh",
    shopAddress: "202 Harvest Lane, Farm District",
    shopDescription: "Farm to table produce, eggs, and honey",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// =============================================
// HOTEL OWNER USERS
// =============================================
db.users.insertMany([
  {
    name: "Emma Hotelier",
    email: "emma@hotel.com",
    password: "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1TD7WS", // password: admin123
    role: "hotel",
    phone: "7654321098",
    address: "303 Hotel Avenue, Hospitality City",
    hotelName: "Grand Emerald Hotel",
    hotelAddress: "303 Luxury Lane, Downtown",
    hotelDescription: "5-star luxury hotel with farm-to-table restaurant",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Robert Restaurant",
    email: "robert@hotel.com",
    password: "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1TD7WS", // password: admin123
    role: "hotel",
    phone: "7654321097",
    address: "404 Restaurant Road, Culinary District",
    hotelName: "Gourmet Heights",
    hotelAddress: "404 Culinary Boulevard, Food District",
    hotelDescription: "Award-winning restaurant focused on sustainable cuisine",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Lisa Lodge",
    email: "lisa@hotel.com",
    password: "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1TD7WS", // password: admin123
    role: "hotel",
    phone: "7654321096",
    address: "505 Lodge Lane, Resort Town",
    hotelName: "Mountain View Resort",
    hotelAddress: "505 Scenic Drive, Mountain District",
    hotelDescription: "Eco-friendly resort with farm-to-table dining options",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// =============================================
// REGULAR USERS
// =============================================
db.users.insertMany([
  {
    name: "Regular User",
    email: "user@example.com",
    password: "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1TD7WS", // password: admin123
    role: "user",
    phone: "6543210987",
    address: "606 User Street, Consumer City",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Jane Customer",
    email: "jane@example.com",
    password: "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1TD7WS", // password: admin123
    role: "user",
    phone: "6543210986",
    address: "707 Customer Road, Buyer Town",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// =============================================
// PRODUCTS (for sellers)
// =============================================
db.products.insertMany([
  {
    name: "Organic Apples",
    description: "Fresh organic apples from local orchards",
    price: 2.99,
    category: "Fruits",
    stock: 100,
    unit: "kg",
    sellerId: ObjectId("insert_john_seller_id_here"), // Replace with actual ObjectId
    sellerName: "John's Fresh Produce",
    images: ["apple1.jpg", "apple2.jpg"],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Farm Fresh Eggs",
    description: "Free-range eggs from pasture-raised chickens",
    price: 4.99,
    category: "Dairy & Eggs",
    stock: 50,
    unit: "dozen",
    sellerId: ObjectId("insert_mike_farmer_id_here"), // Replace with actual ObjectId
    sellerName: "Mike's Farm Fresh",
    images: ["eggs1.jpg", "eggs2.jpg"],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Organic Spinach",
    description: "Fresh organic spinach, locally grown",
    price: 3.49,
    category: "Vegetables",
    stock: 75,
    unit: "bunch",
    sellerId: ObjectId("insert_sarah_vendor_id_here"), // Replace with actual ObjectId
    sellerName: "Sarah's Organic Market",
    images: ["spinach1.jpg", "spinach2.jpg"],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Artisanal Bread",
    description: "Freshly baked sourdough bread",
    price: 5.99,
    category: "Bakery",
    stock: 30,
    unit: "loaf",
    sellerId: ObjectId("insert_john_seller_id_here"), // Replace with actual ObjectId
    sellerName: "John's Fresh Produce",
    images: ["bread1.jpg", "bread2.jpg"],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Local Honey",
    description: "Raw, unfiltered honey from local beekeepers",
    price: 8.99,
    category: "Pantry",
    stock: 40,
    unit: "jar",
    sellerId: ObjectId("insert_mike_farmer_id_here"), // Replace with actual ObjectId
    sellerName: "Mike's Farm Fresh",
    images: ["honey1.jpg", "honey2.jpg"],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// =============================================
// LEFTOVER FOOD (for hotels)
// =============================================
db.leftoverfoods.insertMany([
  {
    title: "Vegetable Curry",
    description: "Leftover vegetable curry from today's lunch service",
    quantity: 5,
    unit: "kg",
    expiryDate: new Date(new Date().setDate(new Date().getDate() + 2)), // 2 days from now
    pickupTime: "18:00-20:00",
    price: 3.99,
    category: "Prepared Meals",
    hotelId: ObjectId("insert_emma_hotel_id_here"), // Replace with actual ObjectId
    hotelName: "Grand Emerald Hotel",
    hotelAddress: "303 Luxury Lane, Downtown",
    images: ["curry1.jpg", "curry2.jpg"],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Assorted Pastries",
    description: "Leftover pastries from breakfast buffet",
    quantity: 20,
    unit: "pieces",
    expiryDate: new Date(new Date().setDate(new Date().getDate() + 1)), // 1 day from now
    pickupTime: "21:00-22:00",
    price: 1.99,
    category: "Bakery",
    hotelId: ObjectId("insert_robert_restaurant_id_here"), // Replace with actual ObjectId
    hotelName: "Gourmet Heights",
    hotelAddress: "404 Culinary Boulevard, Food District",
    images: ["pastry1.jpg", "pastry2.jpg"],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Soup of the Day",
    description: "Leftover tomato basil soup from dinner service",
    quantity: 3,
    unit: "liters",
    expiryDate: new Date(new Date().setDate(new Date().getDate() + 2)), // 2 days from now
    pickupTime: "20:00-22:00",
    price: 2.49,
    category: "Prepared Meals",
    hotelId: ObjectId("insert_lisa_lodge_id_here"), // Replace with actual ObjectId
    hotelName: "Mountain View Resort",
    hotelAddress: "505 Scenic Drive, Mountain District",
    images: ["soup1.jpg", "soup2.jpg"],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// =============================================
// ORDERS
// =============================================
db.orders.insertMany([
  {
    userId: ObjectId("insert_regular_user_id_here"), // Replace with actual ObjectId
    userName: "Regular User",
    userEmail: "user@example.com",
    userPhone: "6543210987",
    items: [
      {
        productId: ObjectId("insert_product_id_here"), // Replace with actual ObjectId
        name: "Organic Apples",
        price: 2.99,
        quantity: 3,
        sellerId: ObjectId("insert_john_seller_id_here") // Replace with actual ObjectId
      },
      {
        productId: ObjectId("insert_product_id_here"), // Replace with actual ObjectId
        name: "Farm Fresh Eggs",
        price: 4.99,
        quantity: 1,
        sellerId: ObjectId("insert_mike_farmer_id_here") // Replace with actual ObjectId
      }
    ],
    totalAmount: 13.96,
    shippingAddress: "606 User Street, Consumer City",
    paymentMethod: "Cash on Delivery",
    status: "Delivered",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)), // 5 days ago
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 3)) // 3 days ago
  },
  {
    userId: ObjectId("insert_jane_customer_id_here"), // Replace with actual ObjectId
    userName: "Jane Customer",
    userEmail: "jane@example.com",
    userPhone: "6543210986",
    items: [
      {
        productId: ObjectId("insert_product_id_here"), // Replace with actual ObjectId
        name: "Organic Spinach",
        price: 3.49,
        quantity: 2,
        sellerId: ObjectId("insert_sarah_vendor_id_here") // Replace with actual ObjectId
      },
      {
        productId: ObjectId("insert_product_id_here"), // Replace with actual ObjectId
        name: "Artisanal Bread",
        price: 5.99,
        quantity: 1,
        sellerId: ObjectId("insert_john_seller_id_here") // Replace with actual ObjectId
      }
    ],
    totalAmount: 12.97,
    shippingAddress: "707 Customer Road, Buyer Town",
    paymentMethod: "Online Payment",
    status: "Processing",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)), // 1 day ago
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 1)) // 1 day ago
  }
]);

// =============================================
// LEFTOVER FOOD ORDERS
// =============================================
db.leftoverfoodorders.insertMany([
  {
    userId: ObjectId("insert_regular_user_id_here"), // Replace with actual ObjectId
    userName: "Regular User",
    userEmail: "user@example.com",
    userPhone: "6543210987",
    items: [
      {
        foodId: ObjectId("insert_leftover_food_id_here"), // Replace with actual ObjectId
        title: "Vegetable Curry",
        price: 3.99,
        quantity: 2,
        hotelId: ObjectId("insert_emma_hotel_id_here") // Replace with actual ObjectId
      }
    ],
    totalAmount: 7.98,
    pickupAddress: "303 Luxury Lane, Downtown",
    pickupTime: "18:00-20:00",
    status: "Completed",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 3)), // 3 days ago
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 3)) // 3 days ago
  },
  {
    userId: ObjectId("insert_jane_customer_id_here"), // Replace with actual ObjectId
    userName: "Jane Customer",
    userEmail: "jane@example.com",
    userPhone: "6543210986",
    items: [
      {
        foodId: ObjectId("insert_leftover_food_id_here"), // Replace with actual ObjectId
        title: "Assorted Pastries",
        price: 1.99,
        quantity: 5,
        hotelId: ObjectId("insert_robert_restaurant_id_here") // Replace with actual ObjectId
      },
      {
        foodId: ObjectId("insert_leftover_food_id_here"), // Replace with actual ObjectId
        title: "Soup of the Day",
        price: 2.49,
        quantity: 1,
        hotelId: ObjectId("insert_lisa_lodge_id_here") // Replace with actual ObjectId
      }
    ],
    totalAmount: 12.44,
    pickupAddress: "404 Culinary Boulevard, Food District",
    pickupTime: "21:00-22:00",
    status: "Pending",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]); 