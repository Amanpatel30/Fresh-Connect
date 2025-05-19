// MongoDB queries to insert sample analytics data for hotel ID 67dd5b95125c7073eae1555b

// Insert sample orders for the hotel
db.orders.insertMany([
  {
    user: ObjectId("67ce12b96cf2eb9806ea8710"),
    seller: ObjectId("67dd5b95125c7073eae1555b"),
    orderNumber: "ORD-H1-001",
    items: [
      {
        product: ObjectId("67d2f5a3b45c9d8e7f1a2b3c"),
        name: "Butter Chicken",
        quantity: 2,
        price: 350,
        image: "https://example.com/butter-chicken.jpg"
      },
      {
        product: ObjectId("67d2f5a3b45c9d8e7f1a2b3d"),
        name: "Naan",
        quantity: 4,
        price: 40,
        image: "https://example.com/naan.jpg"
      }
    ],
    shippingAddress: {
      fullName: "John Doe",
      address: "123 Main Street",
      city: "Mumbai",
      postalCode: "400001",
      state: "Maharashtra",
      country: "India",
      phone: "9876543210"
    },
    paymentMethod: "card",
    paymentResult: {
      id: "PAY12345",
      status: "completed",
      updateTime: new Date().toISOString(),
      email: "john@example.com"
    },
    itemsPrice: 780,
    taxPrice: 40,
    shippingPrice: 40,
    totalAmount: 860,
    isPaid: true,
    paidAt: new Date(new Date().setDate(new Date().getDate() - 7)),
    status: "delivered",
    statusUpdates: [
      {
        status: "pending",
        date: new Date(new Date().setDate(new Date().getDate() - 10)),
        note: "Order received"
      },
      {
        status: "processing",
        date: new Date(new Date().setDate(new Date().getDate() - 9)),
        note: "Payment confirmed"
      },
      {
        status: "shipped",
        date: new Date(new Date().setDate(new Date().getDate() - 8)),
        note: "Order shipped"
      },
      {
        status: "delivered",
        date: new Date(new Date().setDate(new Date().getDate() - 7)),
        note: "Order delivered"
      }
    ],
    deliveredAt: new Date(new Date().setDate(new Date().getDate() - 7)),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 10)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 7))
  },
  {
    user: ObjectId("67ce12b96cf2eb9806ea8711"),
    seller: ObjectId("67dd5b95125c7073eae1555b"),
    orderNumber: "ORD-H1-002",
    items: [
      {
        product: ObjectId("67d2f5a3b45c9d8e7f1a2b3e"),
        name: "Paneer Butter Masala",
        quantity: 1,
        price: 320,
        image: "https://example.com/paneer-butter-masala.jpg"
      },
      {
        product: ObjectId("67d2f5a3b45c9d8e7f1a2b3d"),
        name: "Naan",
        quantity: 2,
        price: 40,
        image: "https://example.com/naan.jpg"
      }
    ],
    shippingAddress: {
      fullName: "Priya Sharma",
      address: "456 Park Avenue",
      city: "Delhi",
      postalCode: "110001",
      state: "Delhi",
      country: "India",
      phone: "9876543211"
    },
    paymentMethod: "upi",
    paymentResult: {
      id: "PAY12346",
      status: "completed",
      updateTime: new Date().toISOString(),
      email: "priya@example.com"
    },
    itemsPrice: 400,
    taxPrice: 20,
    shippingPrice: 40,
    totalAmount: 460,
    isPaid: true,
    paidAt: new Date(new Date().setDate(new Date().getDate() - 5)),
    status: "delivered",
    statusUpdates: [
      {
        status: "pending",
        date: new Date(new Date().setDate(new Date().getDate() - 7)),
        note: "Order received"
      },
      {
        status: "processing",
        date: new Date(new Date().setDate(new Date().getDate() - 6)),
        note: "Payment confirmed"
      },
      {
        status: "shipped",
        date: new Date(new Date().setDate(new Date().getDate() - 6)),
        note: "Order shipped"
      },
      {
        status: "delivered",
        date: new Date(new Date().setDate(new Date().getDate() - 5)),
        note: "Order delivered"
      }
    ],
    deliveredAt: new Date(new Date().setDate(new Date().getDate() - 5)),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 7)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 5))
  },
  {
    user: ObjectId("67ce12b96cf2eb9806ea8712"),
    seller: ObjectId("67dd5b95125c7073eae1555b"),
    orderNumber: "ORD-H1-003",
    items: [
      {
        product: ObjectId("67d2f5a3b45c9d8e7f1a2b3f"),
        name: "Chicken Biryani",
        quantity: 2,
        price: 280,
        image: "https://example.com/chicken-biryani.jpg"
      }
    ],
    shippingAddress: {
      fullName: "Rahul Kumar",
      address: "789 Lake View",
      city: "Bangalore",
      postalCode: "560001",
      state: "Karnataka",
      country: "India",
      phone: "9876543212"
    },
    paymentMethod: "cod",
    itemsPrice: 560,
    taxPrice: 28,
    shippingPrice: 40,
    totalAmount: 628,
    isPaid: true,
    paidAt: new Date(new Date().setDate(new Date().getDate() - 3)),
    status: "delivered",
    statusUpdates: [
      {
        status: "pending",
        date: new Date(new Date().setDate(new Date().getDate() - 5)),
        note: "Order received"
      },
      {
        status: "processing",
        date: new Date(new Date().setDate(new Date().getDate() - 4)),
        note: "Order confirmed"
      },
      {
        status: "shipped",
        date: new Date(new Date().setDate(new Date().getDate() - 4)),
        note: "Order shipped"
      },
      {
        status: "delivered",
        date: new Date(new Date().setDate(new Date().getDate() - 3)),
        note: "Order delivered"
      }
    ],
    deliveredAt: new Date(new Date().setDate(new Date().getDate() - 3)),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 3))
  },
  {
    user: ObjectId("67ce12b96cf2eb9806ea8713"),
    seller: ObjectId("67dd5b95125c7073eae1555b"),
    orderNumber: "ORD-H1-004",
    items: [
      {
        product: ObjectId("67d2f5a3b45c9d8e7f1a2b40"),
        name: "Masala Dosa",
        quantity: 3,
        price: 120,
        image: "https://example.com/masala-dosa.jpg"
      },
      {
        product: ObjectId("67d2f5a3b45c9d8e7f1a2b41"),
        name: "Filter Coffee",
        quantity: 3,
        price: 60,
        image: "https://example.com/filter-coffee.jpg"
      }
    ],
    shippingAddress: {
      fullName: "Amit Patel",
      address: "101 Temple Road",
      city: "Chennai",
      postalCode: "600001",
      state: "Tamil Nadu",
      country: "India",
      phone: "9876543213"
    },
    paymentMethod: "card",
    paymentResult: {
      id: "PAY12347",
      status: "completed",
      updateTime: new Date().toISOString(),
      email: "amit@example.com"
    },
    itemsPrice: 540,
    taxPrice: 27,
    shippingPrice: 40,
    totalAmount: 607,
    isPaid: true,
    paidAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    status: "delivered",
    statusUpdates: [
      {
        status: "pending",
        date: new Date(new Date().setDate(new Date().getDate() - 3)),
        note: "Order received"
      },
      {
        status: "processing",
        date: new Date(new Date().setDate(new Date().getDate() - 2)),
        note: "Payment confirmed"
      },
      {
        status: "shipped",
        date: new Date(new Date().setDate(new Date().getDate() - 2)),
        note: "Order shipped"
      },
      {
        status: "delivered",
        date: new Date(new Date().setDate(new Date().getDate() - 1)),
        note: "Order delivered"
      }
    ],
    deliveredAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 3)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 1))
  },
  {
    user: ObjectId("67ce12b96cf2eb9806ea8714"),
    seller: ObjectId("67dd5b95125c7073eae1555b"),
    orderNumber: "ORD-H1-005",
    items: [
      {
        product: ObjectId("67d2f5a3b45c9d8e7f1a2b3c"),
        name: "Butter Chicken",
        quantity: 1,
        price: 350,
        image: "https://example.com/butter-chicken.jpg"
      },
      {
        product: ObjectId("67d2f5a3b45c9d8e7f1a2b3d"),
        name: "Naan",
        quantity: 2,
        price: 40,
        image: "https://example.com/naan.jpg"
      }
    ],
    shippingAddress: {
      fullName: "Sneha Gupta",
      address: "555 River Road",
      city: "Kolkata",
      postalCode: "700001",
      state: "West Bengal",
      country: "India",
      phone: "9876543214"
    },
    paymentMethod: "upi",
    paymentResult: {
      id: "PAY12348",
      status: "completed",
      updateTime: new Date().toISOString(),
      email: "sneha@example.com"
    },
    itemsPrice: 430,
    taxPrice: 21.5,
    shippingPrice: 40,
    totalAmount: 491.5,
    isPaid: true,
    paidAt: new Date(),
    status: "shipped",
    statusUpdates: [
      {
        status: "pending",
        date: new Date(new Date().setDate(new Date().getDate() - 1)),
        note: "Order received"
      },
      {
        status: "processing",
        date: new Date(new Date().setDate(new Date().getDate() - 1)),
        note: "Payment confirmed"
      },
      {
        status: "shipped",
        date: new Date(),
        note: "Order shipped"
      }
    ],
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    updatedAt: new Date()
  }
]);

// Insert sample products for the hotel
db.products.insertMany([
  {
    name: "Butter Chicken",
    description: "Tender chicken pieces cooked in a rich and creamy tomato-based sauce.",
    price: 350,
    discountPrice: 330,
    category: "Non-Veg Main Course",
    subcategory: "Chicken",
    stock: 50,
    image: "https://example.com/butter-chicken.jpg",
    images: ["https://example.com/butter-chicken-1.jpg", "https://example.com/butter-chicken-2.jpg"],
    seller: ObjectId("67dd5b95125c7073eae1555b"),
    ratings: {
      average: 4.8,
      count: 25
    },
    isActive: true,
    isFeatured: true,
    tags: ["chicken", "punjabi", "creamy", "popular"],
    createdAt: new Date(new Date().setDate(new Date().getDate() - 30)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 10))
  },
  {
    name: "Naan",
    description: "Soft and fluffy Indian bread baked in a tandoor.",
    price: 40,
    discountPrice: 35,
    category: "Breads",
    subcategory: "Tandoori Breads",
    stock: 100,
    image: "https://example.com/naan.jpg",
    images: ["https://example.com/naan-1.jpg", "https://example.com/naan-2.jpg"],
    seller: ObjectId("67dd5b95125c7073eae1555b"),
    ratings: {
      average: 4.5,
      count: 30
    },
    isActive: true,
    isFeatured: false,
    tags: ["bread", "tandoori", "popular"],
    createdAt: new Date(new Date().setDate(new Date().getDate() - 30)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 10))
  },
  {
    name: "Paneer Butter Masala",
    description: "Soft paneer cubes in a rich and creamy tomato-based sauce.",
    price: 320,
    discountPrice: 300,
    category: "Veg Main Course",
    subcategory: "Paneer",
    stock: 40,
    image: "https://example.com/paneer-butter-masala.jpg",
    images: ["https://example.com/pbm-1.jpg", "https://example.com/pbm-2.jpg"],
    seller: ObjectId("67dd5b95125c7073eae1555b"),
    ratings: {
      average: 4.7,
      count: 22
    },
    isActive: true,
    isFeatured: true,
    tags: ["paneer", "vegetarian", "punjabi", "creamy", "popular"],
    createdAt: new Date(new Date().setDate(new Date().getDate() - 30)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 10))
  },
  {
    name: "Chicken Biryani",
    description: "Fragrant basmati rice cooked with tender chicken pieces and aromatic spices.",
    price: 280,
    discountPrice: 260,
    category: "Non-Veg Main Course",
    subcategory: "Biryani",
    stock: 30,
    image: "https://example.com/chicken-biryani.jpg",
    images: ["https://example.com/cb-1.jpg", "https://example.com/cb-2.jpg"],
    seller: ObjectId("67dd5b95125c7073eae1555b"),
    ratings: {
      average: 4.6,
      count: 28
    },
    isActive: true,
    isFeatured: true,
    tags: ["biryani", "chicken", "rice", "spicy", "popular"],
    createdAt: new Date(new Date().setDate(new Date().getDate() - 30)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 10))
  },
  {
    name: "Masala Dosa",
    description: "Crispy rice pancake filled with spiced potato filling, served with chutney and sambar.",
    price: 120,
    discountPrice: 110,
    category: "Veg Main Course",
    subcategory: "South Indian",
    stock: 25,
    image: "https://example.com/masala-dosa.jpg",
    images: ["https://example.com/md-1.jpg", "https://example.com/md-2.jpg"],
    seller: ObjectId("67dd5b95125c7073eae1555b"),
    ratings: {
      average: 4.5,
      count: 20
    },
    isActive: true,
    isFeatured: false,
    tags: ["dosa", "vegetarian", "south indian", "breakfast", "popular"],
    createdAt: new Date(new Date().setDate(new Date().getDate() - 30)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 10))
  }
]);

// Insert sample inventory items for the hotel
db.inventory.insertMany([
  {
    owner: ObjectId("67dd5b95125c7073eae1555b"),
    hotelId: ObjectId("67dd5b95125c7073eae1555b"),
    name: "Chicken",
    category: "Meat",
    quantity: 50,
    unit: "kg",
    price: 250,
    description: "Fresh chicken for various dishes",
    isLowStock: false,
    isOutOfStock: false,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 15)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 5))
  },
  {
    owner: ObjectId("67dd5b95125c7073eae1555b"),
    hotelId: ObjectId("67dd5b95125c7073eae1555b"),
    name: "Paneer",
    category: "Dairy",
    quantity: 20,
    unit: "kg",
    price: 400,
    description: "Fresh paneer for various dishes",
    isLowStock: false,
    isOutOfStock: false,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 15)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 5))
  },
  {
    owner: ObjectId("67dd5b95125c7073eae1555b"),
    hotelId: ObjectId("67dd5b95125c7073eae1555b"),
    name: "Basmati Rice",
    category: "Grains",
    quantity: 100,
    unit: "kg",
    price: 120,
    description: "Premium basmati rice for biryani and pulao",
    isLowStock: false,
    isOutOfStock: false,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 15)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 5))
  },
  {
    owner: ObjectId("67dd5b95125c7073eae1555b"),
    hotelId: ObjectId("67dd5b95125c7073eae1555b"),
    name: "Wheat Flour",
    category: "Flour",
    quantity: 80,
    unit: "kg",
    price: 40,
    description: "Wheat flour for making rotis and naan",
    isLowStock: false,
    isOutOfStock: false,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 15)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 5))
  },
  {
    owner: ObjectId("67dd5b95125c7073eae1555b"),
    hotelId: ObjectId("67dd5b95125c7073eae1555b"),
    name: "Tomatoes",
    category: "Vegetables",
    quantity: 30,
    unit: "kg",
    price: 60,
    description: "Fresh tomatoes for gravies and salads",
    isLowStock: false,
    isOutOfStock: false,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 15)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 5))
  }
]);

// Commands to run this script in MongoDB
// 
// 1. Connect to MongoDB:
//    mongo mongodb://localhost:27017/major-project
// 
// 2. Load and execute the script:
//    load("mongodb-insert-analytics-data.js")
//
// Note: Replace ObjectId values with actual ObjectIds if needed
// The provided IDs are placeholders and may need to be replaced with actual IDs from your database 