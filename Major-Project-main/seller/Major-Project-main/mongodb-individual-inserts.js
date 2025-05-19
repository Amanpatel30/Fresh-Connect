// MongoDB Individual Insert Commands
// You can run these commands one by one in MongoDB Shell or MongoDB Compass

// =============================================
// ADMIN USERS
// =============================================

// Admin User
db.users.insertOne({
  name: "Admin User",
  email: "admin@freshconnect.com",
  password: "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1TD7WS", // password: admin123
  role: "admin",
  phone: "9876543210",
  address: "123 Admin Street, Admin City",
  createdAt: new Date(),
  updatedAt: new Date()
});

// Super Admin
db.users.insertOne({
  name: "Super Admin",
  email: "superadmin@freshconnect.com",
  password: "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1TD7WS", // password: admin123
  role: "admin",
  phone: "9876543211",
  address: "456 Admin Avenue, Admin Town",
  createdAt: new Date(),
  updatedAt: new Date()
});

// =============================================
// SELLER USERS
// =============================================

// John Seller
db.users.insertOne({
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
});

// Sarah Vendor
db.users.insertOne({
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
});

// Mike Farmer
db.users.insertOne({
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
});

// =============================================
// HOTEL OWNER USERS
// =============================================

// Emma Hotelier
db.users.insertOne({
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
});

// Robert Restaurant
db.users.insertOne({
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
});

// Lisa Lodge
db.users.insertOne({
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
});

// =============================================
// REGULAR USERS
// =============================================

// Regular User
db.users.insertOne({
  name: "Regular User",
  email: "user@example.com",
  password: "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1TD7WS", // password: admin123
  role: "user",
  phone: "6543210987",
  address: "606 User Street, Consumer City",
  createdAt: new Date(),
  updatedAt: new Date()
});

// Jane Customer
db.users.insertOne({
  name: "Jane Customer",
  email: "jane@example.com",
  password: "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1TD7WS", // password: admin123
  role: "user",
  phone: "6543210986",
  address: "707 Customer Road, Buyer Town",
  createdAt: new Date(),
  updatedAt: new Date()
});

// =============================================
// NOTE: For products, leftover foods, and orders, you'll need to replace
// the ObjectId references with actual IDs from your database after inserting the users.
// =============================================

// Example of how to find user IDs:
// const johnSeller = db.users.findOne({email: "john@seller.com"});
// const johnSellerId = johnSeller._id;

// =============================================
// PRODUCTS (for sellers) - Example with placeholder IDs
// =============================================

// Find seller IDs first
// const johnSeller = db.users.findOne({email: "john@seller.com"});
// const sarahVendor = db.users.findOne({email: "sarah@seller.com"});
// const mikeFarmer = db.users.findOne({email: "mike@seller.com"});

// Organic Apples
db.products.insertOne({
  name: "Organic Apples",
  description: "Fresh organic apples from local orchards",
  price: 2.99,
  category: "Fruits",
  stock: 100,
  unit: "kg",
  sellerId: ObjectId("JOHN_SELLER_ID"), // Replace with actual ID
  sellerName: "John's Fresh Produce",
  images: ["apple1.jpg", "apple2.jpg"],
  isAvailable: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Farm Fresh Eggs
db.products.insertOne({
  name: "Farm Fresh Eggs",
  description: "Free-range eggs from pasture-raised chickens",
  price: 4.99,
  category: "Dairy & Eggs",
  stock: 50,
  unit: "dozen",
  sellerId: ObjectId("MIKE_FARMER_ID"), // Replace with actual ID
  sellerName: "Mike's Farm Fresh",
  images: ["eggs1.jpg", "eggs2.jpg"],
  isAvailable: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Organic Spinach
db.products.insertOne({
  name: "Organic Spinach",
  description: "Fresh organic spinach, locally grown",
  price: 3.49,
  category: "Vegetables",
  stock: 75,
  unit: "bunch",
  sellerId: ObjectId("SARAH_VENDOR_ID"), // Replace with actual ID
  sellerName: "Sarah's Organic Market",
  images: ["spinach1.jpg", "spinach2.jpg"],
  isAvailable: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// =============================================
// LEFTOVER FOOD (for hotels) - Example with placeholder IDs
// =============================================

// Find hotel IDs first
// const emmaHotel = db.users.findOne({email: "emma@hotel.com"});
// const robertRestaurant = db.users.findOne({email: "robert@hotel.com"});
// const lisaLodge = db.users.findOne({email: "lisa@hotel.com"});

// Vegetable Curry
db.leftoverfoods.insertOne({
  title: "Vegetable Curry",
  description: "Leftover vegetable curry from today's lunch service",
  quantity: 5,
  unit: "kg",
  expiryDate: new Date(new Date().setDate(new Date().getDate() + 2)), // 2 days from now
  pickupTime: "18:00-20:00",
  price: 3.99,
  category: "Prepared Meals",
  hotelId: ObjectId("EMMA_HOTEL_ID"), // Replace with actual ID
  hotelName: "Grand Emerald Hotel",
  hotelAddress: "303 Luxury Lane, Downtown",
  images: ["curry1.jpg", "curry2.jpg"],
  isAvailable: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Assorted Pastries
db.leftoverfoods.insertOne({
  title: "Assorted Pastries",
  description: "Leftover pastries from breakfast buffet",
  quantity: 20,
  unit: "pieces",
  expiryDate: new Date(new Date().setDate(new Date().getDate() + 1)), // 1 day from now
  pickupTime: "21:00-22:00",
  price: 1.99,
  category: "Bakery",
  hotelId: ObjectId("ROBERT_RESTAURANT_ID"), // Replace with actual ID
  hotelName: "Gourmet Heights",
  hotelAddress: "404 Culinary Boulevard, Food District",
  images: ["pastry1.jpg", "pastry2.jpg"],
  isAvailable: true,
  createdAt: new Date(),
  updatedAt: new Date()
}); 