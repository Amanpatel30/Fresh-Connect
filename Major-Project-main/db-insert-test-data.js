// MongoDB queries to insert test data for the implemented components
// Run these queries in MongoDB shell or MongoDB Compass

// 1. Insert a test hotel
db.hotels.insertOne({
  name: "Taj Hotel & Restaurant",
  email: "info@tajhotel.com",
  password: "$2a$10$XDIpo1PvuPXg4VPnzLCZAOiEPXW9FzG4PzQlXdQJGsXuiLFGYZuSa", // hashed password for "password123"
  role: "hotel",
  ownerName: "Raj Patel",
  address: {
    street: "123 Main Street",
    city: "Mumbai",
    state: "Maharashtra",
    zipCode: "400001",
    country: "India"
  },
  phone: "+91 9876543210",
  description: "A luxury hotel offering the finest dining experience",
  logo: "https://example.com/logo.jpg",
  coverImage: "https://example.com/cover.jpg",
  isVerified: false,
  verificationDocuments: [],
  rating: 4.5,
  numReviews: 0,
  reviews: [],
  createdAt: new Date(),
  updatedAt: new Date()
});

// Store the hotel ID for reference in other collections
const hotelId = db.hotels.findOne({ email: "info@tajhotel.com" })._id;

// 2. Insert menu items for the hotel
db.menuitems.insertMany([
  {
    hotel: hotelId,
    name: "Vegetable Biryani",
    description: "Fragrant basmati rice cooked with mixed vegetables and aromatic spices",
    price: 250,
    image: "https://source.unsplash.com/random/300x200/?biryani",
    category: "main course",
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
    ingredients: [
      { name: "Basmati Rice", quantity: "1 cup" },
      { name: "Mixed Vegetables", quantity: "200g" },
      { name: "Spices", quantity: "as needed" }
    ],
    nutritionalInfo: {
      calories: 350,
      protein: 8,
      carbs: 45,
      fat: 12
    },
    preparationTime: 30,
    isPopular: true,
    rating: 4.7,
    numReviews: 120,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    hotel: hotelId,
    name: "Paneer Butter Masala",
    description: "Cottage cheese cubes in a rich tomato and butter gravy",
    price: 280,
    image: "https://source.unsplash.com/random/300x200/?curry",
    category: "main course",
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    isAvailable: true,
    ingredients: [
      { name: "Paneer", quantity: "250g" },
      { name: "Tomatoes", quantity: "3 medium" },
      { name: "Butter", quantity: "2 tbsp" },
      { name: "Cream", quantity: "1/4 cup" }
    ],
    nutritionalInfo: {
      calories: 420,
      protein: 18,
      carbs: 12,
      fat: 32
    },
    preparationTime: 25,
    isPopular: true,
    rating: 4.8,
    numReviews: 95,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    hotel: hotelId,
    name: "Masala Dosa",
    description: "Crispy rice crepe filled with spiced potato filling",
    price: 150,
    image: "https://source.unsplash.com/random/300x200/?dosa",
    category: "breakfast",
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false,
    isAvailable: true,
    ingredients: [
      { name: "Rice Batter", quantity: "1 cup" },
      { name: "Potatoes", quantity: "2 medium" },
      { name: "Onions", quantity: "1 medium" }
    ],
    nutritionalInfo: {
      calories: 280,
      protein: 5,
      carbs: 48,
      fat: 8
    },
    preparationTime: 15,
    isPopular: true,
    rating: 4.6,
    numReviews: 150,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    hotel: hotelId,
    name: "Gulab Jamun",
    description: "Deep-fried milk solids soaked in sugar syrup",
    price: 120,
    image: "https://source.unsplash.com/random/300x200/?dessert",
    category: "dessert",
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isAvailable: true,
    ingredients: [
      { name: "Milk Powder", quantity: "1 cup" },
      { name: "Sugar", quantity: "1 cup" },
      { name: "Cardamom", quantity: "1/4 tsp" }
    ],
    nutritionalInfo: {
      calories: 220,
      protein: 3,
      carbs: 35,
      fat: 8
    },
    preparationTime: 40,
    isPopular: false,
    rating: 4.5,
    numReviews: 80,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    hotel: hotelId,
    name: "Masala Chai",
    description: "Spiced Indian tea with milk",
    price: 60,
    image: "https://source.unsplash.com/random/300x200/?tea",
    category: "beverage",
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    isAvailable: true,
    ingredients: [
      { name: "Tea Leaves", quantity: "2 tsp" },
      { name: "Milk", quantity: "1/2 cup" },
      { name: "Spices", quantity: "as needed" }
    ],
    nutritionalInfo: {
      calories: 80,
      protein: 2,
      carbs: 10,
      fat: 3
    },
    preparationTime: 10,
    isPopular: false,
    rating: 4.3,
    numReviews: 65,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Store menu item IDs for reference
const menuItemIds = db.menuitems.find({ hotel: hotelId }).map(item => item._id);

// 3. Insert test users
db.users.insertMany([
  {
    name: "John Doe",
    email: "john@example.com",
    password: "$2a$10$XDIpo1PvuPXg4VPnzLCZAOiEPXW9FzG4PzQlXdQJGsXuiLFGYZuSa", // hashed password for "password123"
    role: "user",
    phone: "+91 9876543211",
    address: {
      street: "456 Park Avenue",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400002",
      country: "India"
    },
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "$2a$10$XDIpo1PvuPXg4VPnzLCZAOiEPXW9FzG4PzQlXdQJGsXuiLFGYZuSa", // hashed password for "password123"
    role: "user",
    phone: "+91 9876543212",
    address: {
      street: "789 Oak Street",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400003",
      country: "India"
    },
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Store user IDs for reference
const userIds = db.users.find().map(user => user._id);

// 4. Insert urgent sales
db.urgentsales.insertMany([
  {
    seller: hotelId,
    product: menuItemIds[0], // Vegetable Biryani
    name: "Vegetable Biryani",
    originalPrice: 250,
    discountedPrice: 175,
    stock: 10,
    unit: "piece",
    expiryDate: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    description: "Special discount on our delicious Vegetable Biryani. Limited time offer!",
    image: "https://source.unsplash.com/random/300x200/?biryani",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    seller: hotelId,
    product: menuItemIds[1], // Paneer Butter Masala
    name: "Paneer Butter Masala",
    originalPrice: 280,
    discountedPrice: 200,
    stock: 8,
    unit: "piece",
    expiryDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
    description: "Enjoy our creamy Paneer Butter Masala at a special price. Order now!",
    image: "https://source.unsplash.com/random/300x200/?curry",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// 5. Insert orders
db.orders.insertMany([
  {
    buyer: userIds[0], // John Doe
    seller: hotelId,
    items: [
      {
        product: menuItemIds[0], // Vegetable Biryani
        name: "Vegetable Biryani",
        quantity: 2,
        unit: "piece",
        price: 250
      },
      {
        product: menuItemIds[3], // Gulab Jamun
        name: "Gulab Jamun",
        quantity: 4,
        unit: "piece",
        price: 120
      }
    ],
    shippingAddress: {
      street: "456 Park Avenue",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400002",
      country: "India"
    },
    phone: "+91 9876543211",
    totalAmount: 980, // (250*2) + (120*4)
    status: "pending",
    paymentMethod: "cod",
    paymentStatus: "pending",
    isUrgentSale: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    buyer: userIds[1], // Jane Smith
    seller: hotelId,
    items: [
      {
        product: menuItemIds[1], // Paneer Butter Masala
        name: "Paneer Butter Masala",
        quantity: 1,
        unit: "piece",
        price: 280
      },
      {
        product: menuItemIds[2], // Masala Dosa
        name: "Masala Dosa",
        quantity: 2,
        unit: "piece",
        price: 150
      }
    ],
    shippingAddress: {
      street: "789 Oak Street",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400003",
      country: "India"
    },
    phone: "+91 9876543212",
    totalAmount: 580, // 280 + (150*2)
    status: "delivered",
    paymentMethod: "online",
    paymentStatus: "completed",
    isUrgentSale: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago (delivered 1 day after order)
  },
  {
    buyer: userIds[0], // John Doe
    seller: hotelId,
    items: [
      {
        product: menuItemIds[4], // Masala Chai
        name: "Masala Chai",
        quantity: 3,
        unit: "piece",
        price: 60
      }
    ],
    shippingAddress: {
      street: "456 Park Avenue",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400002",
      country: "India"
    },
    phone: "+91 9876543211",
    totalAmount: 180, // 60*3
    status: "processing",
    paymentMethod: "online",
    paymentStatus: "completed",
    isUrgentSale: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
]);

// Store order IDs for reference
const orderIds = db.orders.find({ seller: hotelId }).map(order => order._id);

// 6. Insert feedback
db.feedbacks.insertMany([
  {
    _id: ObjectId("60d21b4667d1d70f6c120b1a"),
    user: ObjectId("609c17fc94c2a5b8e5cdaaaa"),
    hotel: ObjectId("609c17fc94c2a5b8e5cdada1"),
    rating: 4,
    comment: "The service was great, but the delivery was slightly delayed.",
    categories: ["Service", "Delivery"],
    verified: true,
    reply: "Thank you for your feedback! We apologize for the delay in delivery and will work to improve our service.",
    replyDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago (feedback left 3 days ago)
    status: "responded",
    isPublic: true
  },
  {
    _id: ObjectId("60d21b4667d1d70f6c120b1b"),
    user: ObjectId("609c17fc94c2a5b8e5cdaaa1"),
    hotel: ObjectId("609c17fc94c2a5b8e5cdada1"),
    rating: 5,
    comment: "The vegetables were incredibly fresh and the delivery was prompt. Will definitely order again!",
    categories: ["Quality", "Delivery"],
    verified: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    status: "pending",
    isPublic: true
  },
  {
    _id: ObjectId("60d21b4667d1d70f6c120b1c"),
    user: ObjectId("609c17fc94c2a5b8e5cdaaa2"),
    hotel: ObjectId("609c17fc94c2a5b8e5cdada2"),
    rating: 5,
    comment: "This platform has helped us reduce waste and connect with customers who appreciate our sustainable practices.",
    categories: ["Sustainability", "Platform"],
    verified: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    status: "pending",
    isPublic: true
  },
  {
    _id: ObjectId("60d21b4667d1d70f6c120b1d"),
    user: ObjectId("609c17fc94c2a5b8e5cdaaa3"),
    hotel: ObjectId("609c17fc94c2a5b8e5cdada1"),
    rating: 4,
    comment: "The urgent sales feature saved me money while getting high-quality food that would have otherwise gone to waste.",
    categories: ["Urgent Sales", "Value"],
    verified: true,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    status: "pending",
    isPublic: true
  },
  {
    _id: ObjectId("60d21b4667d1d70f6c120b1e"),
    user: ObjectId("609c17fc94c2a5b8e5cdaaa4"),
    hotel: ObjectId("609c17fc94c2a5b8e5cdada2"),
    rating: 5,
    comment: "The food was delicious and arrived promptly. The packaging was good too.",
    categories: ["Food Quality", "Delivery", "Packaging"],
    verified: true,
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
    status: "pending",
    isPublic: true
  }
]);

// 7. Insert verification documents
db.verifications.insertOne({
  user: userIds[0], // Using John Doe as admin for verification
  hotel: hotelId,
  status: "Pending",
  documents: [
    {
      name: "Business License",
      type: "License",
      url: "https://example.com/license.pdf",
      uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    },
    {
      name: "Food Safety Certificate",
      type: "Certificate",
      url: "https://example.com/certificate.pdf",
      uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    }
  ],
  applicationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  notes: "Awaiting verification of documents",
  isActive: true,
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
});

// Update hotel with verification documents
db.hotels.updateOne(
  { _id: hotelId },
  {
    $set: {
      verificationDocuments: [
        {
          name: "Business License",
          url: "https://example.com/license.pdf",
          status: "pending"
        },
        {
          name: "Food Safety Certificate",
          url: "https://example.com/certificate.pdf",
          status: "pending"
        }
      ]
    }
  }
); 