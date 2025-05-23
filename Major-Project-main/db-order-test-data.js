MongoDB query to insert test orders for user ID: 67d7bc7f7833ae4cea2668f9

// First check if the user exists
db.users.findOne({_id: ObjectId("67d7bc7f7833ae4cea2668f9")});

// Run this in MongoDB shell to create test orders for the specified user
db.orders.insertMany([
  {
    user: ObjectId("67d7bc7f7833ae4cea2668f9"),
    orderNumber: "ORD-250315-0001",
    items: [
      {
        product: ObjectId("67d7bc7f7833ae4cea266901"),
        name: "Vegetable Biryani",
        quantity: 2,
        price: 250,
        image: "https://example.com/veg-biryani.jpg"
      },
      {
        product: ObjectId("67d7bc7f7833ae4cea266902"),
        name: "Paneer Butter Masala",
        quantity: 1,
        price: 180,
        image: "https://example.com/paneer.jpg"
      }
    ],
    shippingAddress: {
      fullName: "John Doe",
      address: "123 Main St",
      city: "Bengaluru",
      postalCode: "560001",
      state: "Karnataka",
      country: "India",
      phone: "9876543210"
    },
    paymentMethod: "upi",
    paymentResult: {
      id: "PAY123456",
      status: "completed",
      updateTime: new Date().toISOString(),
      email: "john@example.com"
    },
    itemsPrice: 680,
    taxPrice: 34,
    shippingPrice: 50,
    totalAmount: 764,
    isPaid: true,
    paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    status: "delivered",
    statusUpdates: [
      {
        status: "pending",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        note: "Order placed"
      },
      {
        status: "processing",
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        note: "Order confirmed"
      },
      {
        status: "shipped",
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        note: "Order shipped"
      },
      {
        status: "delivered",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        note: "Order delivered"
      }
    ],
    deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    expectedDeliveryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    user: ObjectId("67d7bc7f7833ae4cea2668f9"),
    orderNumber: "ORD-250315-0002",
    items: [
      {
        product: ObjectId("67d7bc7f7833ae4cea266903"),
        name: "Fresh Vegetable Salad",
        quantity: 1,
        price: 120,
        image: "https://example.com/salad.jpg"
      }
    ],
    shippingAddress: {
      fullName: "John Doe",
      address: "123 Main St",
      city: "Bengaluru",
      postalCode: "560001",
      state: "Karnataka",
      country: "India",
      phone: "9876543210"
    },
    paymentMethod: "card",
    paymentResult: {
      id: "PAY789012",
      status: "completed",
      updateTime: new Date().toISOString(),
      email: "john@example.com"
    },
    itemsPrice: 120,
    taxPrice: 6,
    shippingPrice: 50,
    totalAmount: 176,
    isPaid: true,
    paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    status: "shipped",
    statusUpdates: [
      {
        status: "pending",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        note: "Order placed"
      },
      {
        status: "processing",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        note: "Order confirmed"
      },
      {
        status: "shipped",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        note: "Order shipped"
      }
    ],
    expectedDeliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    user: ObjectId("67d7bc7f7833ae4cea2668f9"),
    orderNumber: "ORD-250315-0003",
    items: [
      {
        product: ObjectId("67d7bc7f7833ae4cea266904"),
        name: "Organic Fruit Basket",
        quantity: 1,
        price: 350,
        image: "https://example.com/fruit-basket.jpg"
      },
      {
        product: ObjectId("67d7bc7f7833ae4cea266905"),
        name: "Fresh Juice Pack",
        quantity: 2,
        price: 80,
        image: "https://example.com/juice.jpg"
      }
    ],
    shippingAddress: {
      fullName: "John Doe",
      address: "123 Main St",
      city: "Bengaluru",
      postalCode: "560001",
      state: "Karnataka",
      country: "India",
      phone: "9876543210"
    },
    paymentMethod: "cod",
    itemsPrice: 510,
    taxPrice: 25.5,
    shippingPrice: 50,
    totalAmount: 585.5,
    isPaid: false,
    status: "pending",
    statusUpdates: [
      {
        status: "pending",
        date: new Date(),
        note: "Order placed"
      }
    ],
    expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Insert a wishlist for the user with 3 items
db.wishlists.insertOne({
  user: ObjectId("67d7bc7f7833ae4cea2668f9"),
  products: [
    {
      product: ObjectId("67d7bc7f7833ae4cea266904"),
      addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      product: ObjectId("67d7bc7f7833ae4cea266902"),
      addedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      product: ObjectId("67d7bc7f7833ae4cea266901"),
      addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
});

// Run this to insert sample activity data for the user
db.activities.insertMany([
  {
    user: ObjectId("67d7bc7f7833ae4cea2668f9"),
    type: "order",
    description: "New order placed",
    createdAt: new Date(),
    data: {
      orderId: "ORD-250315-0003",
      status: "pending"
    }
  },
  {
    user: ObjectId("67d7bc7f7833ae4cea2668f9"),
    type: "wishlist",
    description: "Added item to wishlist",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    data: {
      productId: "67d7bc7f7833ae4cea266904",
      productName: "Organic Fruit Basket"
    }
  },
  {
    user: ObjectId("67d7bc7f7833ae4cea2668f9"),
    type: "review",
    description: "Wrote a review",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    data: {
      productId: "67d7bc7f7833ae4cea266901",
      productName: "Vegetable Biryani",
      rating: 5
    }
  }
]);

// Run this to insert dashboard stats for the user
db.dashboardStats.insertOne({
  user: ObjectId("67d7bc7f7833ae4cea2668f9"),
  totalProducts: 5,
  wishlistCount: 3,
  cartCount: 2,
  totalReviews: 2,
  totalViews: 25,
  createdAt: new Date(),
  updatedAt: new Date()
});
